# EdgeOne Edge Functions & KV Storage Patterns

> 适用于企业级 AI SaaS 的边缘计算模式参考。
> 基于 EdgeOne Pages 官方文档，Edge Functions 运行在 V8 Runtime（非 Node.js），不支持 npm 包。

---

## 1. Edge Function 基础

Edge Functions 放置在 `edge-functions/` 目录中，导出 `onRequest` 函数处理请求。

```typescript
// edge-functions/api/health.ts
export function onRequest(context) {
  return new Response(JSON.stringify({ ok: true, timestamp: Date.now() }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

`context` 对象包含：
- `request` — 标准 Web Request 对象
- `params` — 路由参数
- `env` — 环境变量（通过控制台绑定）

### 请求上下文示例

```typescript
// edge-functions/api/echo.ts
export function onRequest({ request, params, env }) {
  const url = new URL(request.url);
  return new Response(JSON.stringify({
    method: request.method,
    path: url.pathname,
    params,
    query: Object.fromEntries(url.searchParams),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 2. KV Storage 配置

### 控制台配置步骤

1. **创建 KV 命名空间**：EdgeOne 控制台 → 边缘函数 → KV 存储 → 新建命名空间
2. **绑定全局变量**：项目设置 → KV 绑定 → 选择命名空间 → 设定变量名（如 `MY_KV`）
3. **在 Edge Function 中使用**：通过绑定的全局变量名直接访问

### KV API 参考

```typescript
// KV 通过全局变量访问，变量名在控制台中配置
// 假设绑定变量名为 SAAS_KV

// 写入（可选 TTL，单位秒）
await SAAS_KV.put(key, value, { expirationTtl: 3600 });

// 读取
const value = await SAAS_KV.get(key);               // 返回 string | null
const obj = await SAAS_KV.get(key, { type: 'json' }); // 直接解析 JSON

// 删除
await SAAS_KV.delete(key);

// 列举 keys
const { keys } = await SAAS_KV.list({ prefix: 'session:' });
```

---

## 3. KV 在 SaaS 中的应用模式

### 3.1 Session Cache — 缓存 JWT 验证后的用户信息

避免每次请求都解析和验证 JWT，将验证结果缓存到 KV。

```typescript
// edge-functions/lib/session.ts
const SESSION_TTL = 300; // 5 分钟

export async function getCachedSession(token) {
  const cacheKey = `session:${await hashToken(token)}`;
  const cached = await SAAS_KV.get(cacheKey, { type: 'json' });
  if (cached) return cached;
  return null;
}

export async function setCachedSession(token, userInfo) {
  const cacheKey = `session:${await hashToken(token)}`;
  await SAAS_KV.put(cacheKey, JSON.stringify(userInfo), {
    expirationTtl: SESSION_TTL,
  });
}

async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### 3.2 Rate Limiting — 滑动窗口计数器

```typescript
// edge-functions/lib/rate-limit.ts
export async function checkRateLimit(identifier, tier) {
  const config = RATE_LIMITS[tier] || RATE_LIMITS['anonymous'];
  const windowKey = `rl:${identifier}:${Math.floor(Date.now() / 1000 / config.window)}`;

  const current = parseInt(await SAAS_KV.get(windowKey) || '0');
  if (current >= config.max) {
    return { allowed: false, remaining: 0, resetIn: config.window };
  }

  await SAAS_KV.put(windowKey, String(current + 1), {
    expirationTtl: config.window * 2,
  });
  return { allowed: true, remaining: config.max - current - 1, resetIn: config.window };
}
```

### 3.3 API Response Cache — 缓存 AI 响应

AI 推理成本高、延迟大，对相同输入缓存结果可显著降低成本。

```typescript
// edge-functions/lib/ai-cache.ts
const AI_CACHE_TTL = 1800; // 30 分钟

export async function getCachedAIResponse(promptHash) {
  return await SAAS_KV.get(`ai:${promptHash}`, { type: 'json' });
}

export async function setCachedAIResponse(promptHash, response) {
  await SAAS_KV.put(`ai:${promptHash}`, JSON.stringify(response), {
    expirationTtl: AI_CACHE_TTL,
  });
}

export async function hashPrompt(prompt) {
  const data = new TextEncoder().encode(prompt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}
```

### 3.4 Feature Flags — 运行时配置

```typescript
// edge-functions/lib/feature-flags.ts
const FLAGS_KEY = 'config:feature_flags';
const FLAGS_CACHE_TTL = 60;

let flagsCache = null;
let flagsCacheTime = 0;

export async function getFeatureFlags() {
  if (flagsCache && Date.now() - flagsCacheTime < FLAGS_CACHE_TTL * 1000) {
    return flagsCache;
  }
  const flags = await SAAS_KV.get(FLAGS_KEY, { type: 'json' }) || {};
  flagsCache = flags;
  flagsCacheTime = Date.now();
  return flags;
}

export async function isFeatureEnabled(flagName, defaultValue = false) {
  const flags = await getFeatureFlags();
  return flags[flagName] ?? defaultValue;
}
```

### 3.5 Idempotency Keys — 防止 Webhook 重复处理

```typescript
// edge-functions/lib/idempotency.ts
const IDEMPOTENCY_TTL = 86400; // 24 小时

export async function isProcessed(idempotencyKey) {
  const result = await SAAS_KV.get(`idem:${idempotencyKey}`);
  return result !== null;
}

export async function markProcessed(idempotencyKey, result) {
  await SAAS_KV.put(`idem:${idempotencyKey}`, JSON.stringify({
    processedAt: Date.now(),
    result,
  }), {
    expirationTtl: IDEMPOTENCY_TTL,
  });
}
```

---

## 4. Rate Limiter 完整实现

```typescript
// edge-functions/api/rate-limit.ts
const RATE_LIMITS = {
  'anonymous':  { max: 60,   window: 60 },
  'free_user':  { max: 100,  window: 60 },
  'pro_user':   { max: 300,  window: 60 },
  'admin':      { max: 1000, window: 60 },
};

async function getClientIdentifier(request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const data = new TextEncoder().encode(authHeader.slice(7));
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  }
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0].trim()
    || 'unknown';
}

async function getUserTier(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return 'anonymous';
  const cached = await SAAS_KV.get(`tier:${await getClientIdentifier(request)}`);
  return cached || 'free_user';
}

async function checkRateLimit(identifier, tier) {
  const config = RATE_LIMITS[tier] || RATE_LIMITS['anonymous'];
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / config.window);
  const key = `rl:${identifier}:${windowStart}`;

  const current = parseInt(await SAAS_KV.get(key) || '0');
  if (current >= config.max) {
    const resetAt = (windowStart + 1) * config.window;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      limit: config.max,
    };
  }

  await SAAS_KV.put(key, String(current + 1), {
    expirationTtl: config.window * 2,
  });

  return {
    allowed: true,
    remaining: config.max - current - 1,
    resetAt: (windowStart + 1) * config.window,
    limit: config.max,
  };
}

export async function onRequest({ request }) {
  const identifier = await getClientIdentifier(request);
  const tier = await getUserTier(request);
  const result = await checkRateLimit(identifier, tier);

  const headers = {
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
  };

  if (!result.allowed) {
    return new Response(JSON.stringify({
      error: 'rate_limit_exceeded',
      message: 'Too many requests',
      retryAfter: result.resetAt - Math.floor(Date.now() / 1000),
    }), { status: 429, headers });
  }

  return new Response(JSON.stringify({
    allowed: true,
    remaining: result.remaining,
    tier,
  }), { status: 200, headers });
}
```

---

## 5. Edge Function Middleware 模式

`middleware.ts` 放在 `edge-functions/` 根目录，拦截所有请求。

```typescript
// edge-functions/middleware.ts
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 1) CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // 2) 速率限制（跳过静态资源）
  if (url.pathname.startsWith('/api/')) {
    const ip = request.headers.get('X-Forwarded-For')?.split(',')[0] || 'unknown';
    const rlKey = `rl:global:${ip}:${Math.floor(Date.now() / 60000)}`;
    const count = parseInt(await SAAS_KV.get(rlKey) || '0');
    if (count > 120) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }
    await SAAS_KV.put(rlKey, String(count + 1), { expirationTtl: 120 });
  }

  // 3) 认证检查（保护 /api/ 路由，排除公开端点）
  const publicPaths = ['/api/health', '/api/auth/login', '/api/auth/callback'];
  if (url.pathname.startsWith('/api/') && !publicPaths.includes(url.pathname)) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }
  }

  // 4) 继续处理后续路由
  const response = await context.next();

  // 注入 CORS 和安全头
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders()).forEach(([k, v]) => newHeaders.set(k, v));
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
```

---

## 6. Cloud Function 模式（Node.js）

Cloud Functions 放在 `cloud-functions/` 目录，运行完整 Node.js 环境，可使用 npm 包。

### Handler 模式

```typescript
// cloud-functions/api/ai-chat.ts
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await request.json();
  const apiKey = env.OPENAI_API_KEY;

  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: body.messages,
    }),
  });

  const result = await aiResponse.json();

  // 必须返回标准 Web Response 对象
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 文件路由

```
cloud-functions/
├── api/
│   ├── ai-chat.ts      → POST /api/ai-chat
│   ├── users/
│   │   ├── index.ts     → GET  /api/users
│   │   └── [id].ts      → GET  /api/users/:id
│   └── webhooks/
│       └── stripe.ts    → POST /api/webhooks/stripe
```

### 环境变量

通过 `context.env` 访问在控制台中配置的环境变量：

```typescript
export async function onRequest(context) {
  const dbUrl = context.env.DATABASE_URL;
  const secret = context.env.JWT_SECRET;
  // ...
}
```

---

## 7. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| Edge 中使用 Node.js API | `fs`, `path`, `Buffer` 等均不可用 | 使用 Web 标准 API（`TextEncoder`, `crypto.subtle` 等） |
| KV 最终一致性 | 写后读可能得到旧值，不适合事务 | 关键事务逻辑放到 Cloud Functions + 数据库 |
| Edge 200ms CPU 限制 | 超时会被终止；I/O 等待不算在内 | 重计算任务移到 Cloud Functions |
| Cloud Functions 6MB 限制 | 请求体最大 6MB | 大文件走对象存储预签名 URL 上传 |
| KV 值大小限制 | 单个值最大 25MB，但建议 < 1MB | 大数据拆分存储或使用对象存储 |
| 全局变量状态 | Edge Function 实例可能被复用，全局变量残留 | 不要依赖全局可变状态做请求间逻辑 |
| `import` npm 包 | Edge Functions 无法 import npm 包 | 内联实现或使用 Cloud Functions |
