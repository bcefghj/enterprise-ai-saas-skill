# 五层安全架构：企业级 AI SaaS on EdgeOne Pages

> 灵感来自 Claude Code 的权限管道设计——每一层独立拦截、逐层收紧，任何单层失效不会导致全面沦陷。

## 架构总览

```
请求 → [L1 Edge Entry] → [L2 Auth] → [L3 Input Validation] → [L4 Business Security] → [L5 Data Security] → 响应
         Edge Function      Edge Function    Cloud Function          Cloud Function         Supabase RLS
```

---

## Layer 1 — Edge Entry Protection（Edge Functions + KV）

在请求到达业务逻辑之前，在边缘节点完成速率限制、安全头注入和请求体大小校验。

```typescript
// middleware.ts — EdgeOne Pages Edge Function
import type { KVNamespace } from '@edgeone/types';

interface Env {
  RATE_LIMIT_KV: KVNamespace;
  ALLOWED_ORIGINS: string; // comma-separated
}

// ── 滑动窗口计数器 ──

interface WindowEntry {
  count: number;
  resetAt: number; // epoch ms
}

async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowMs: number = 60_000,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const raw = await kv.get(key, 'json') as WindowEntry | null;

  let entry: WindowEntry;
  if (!raw || now >= raw.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
  } else {
    entry = { count: raw.count + 1, resetAt: raw.resetAt };
  }

  const ttlSeconds = Math.ceil((entry.resetAt - now) / 1000);
  await kv.put(key, JSON.stringify(entry), { expirationTtl: ttlSeconds });

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

// ── 端点级限额映射 ──

const ENDPOINT_LIMITS: Record<string, number> = {
  '/api/chat':    10,  // AI 对话：10 req/min
  '/api/payment': 5,   // 支付端点：5 req/min
};

function getEndpointLimit(pathname: string): number | null {
  for (const [prefix, limit] of Object.entries(ENDPOINT_LIMITS)) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return null;
}

// ── 安全响应头 ──

function applySecurityHeaders(headers: Headers): void {
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; " +
    "connect-src 'self' https://*.supabase.co https://api.stripe.com; " +
    "frame-ancestors 'none';",
  );
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

// ── CORS ──

function handleCORS(
  request: Request,
  allowedOrigins: string[],
): Headers | Response {
  const origin = request.headers.get('Origin') ?? '';
  const headers = new Headers();

  if (allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  headers.set('Access-Control-Max-Age', '86400');

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  return headers;
}

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1 MB

// ── 主中间件 ──

export async function middleware(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(s => s.trim());

  // 1. CORS 预检
  const corsResult = handleCORS(request, allowedOrigins);
  if (corsResult instanceof Response) return corsResult;
  const corsHeaders = corsResult;

  // 2. 请求体大小校验
  const contentLength = parseInt(request.headers.get('Content-Length') ?? '0', 10);
  if (contentLength > MAX_BODY_SIZE) {
    return new Response(
      JSON.stringify({ error: 'Payload too large', maxBytes: MAX_BODY_SIZE }),
      { status: 413, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 3. Per-IP 速率限制
  const isAuthenticated = request.headers.has('Authorization');
  const ipLimit = isAuthenticated ? 300 : 100;
  const ipCheck = await checkRateLimit(env.RATE_LIMIT_KV, `ip:${ip}`, ipLimit);

  if (!ipCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((ipCheck.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(ipLimit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // 4. Per-endpoint 速率限制
  const endpointLimit = getEndpointLimit(url.pathname);
  if (endpointLimit !== null) {
    const epKey = `ep:${ip}:${url.pathname}`;
    const epCheck = await checkRateLimit(env.RATE_LIMIT_KV, epKey, endpointLimit);
    if (!epCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Endpoint rate limit exceeded' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((epCheck.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }
  }

  // 5. 放行至下一层，注入安全头
  const response = await fetch(request);
  const newResponse = new Response(response.body, response);
  corsHeaders.forEach((v, k) => newResponse.headers.set(k, v));
  applySecurityHeaders(newResponse.headers);
  newResponse.headers.set('X-RateLimit-Remaining', String(ipCheck.remaining));

  return newResponse;
}
```

---

## Layer 2 — Authentication & Authorization（Edge Function）

在边缘完成 JWT 校验和基于角色的路由访问控制，不合法请求绝不到达 Cloud Function。

```typescript
// auth-middleware.ts
import { jwtVerify, type JWTPayload } from 'jose';

interface AuthEnv {
  SUPABASE_JWT_SECRET: string;
}

interface AppJWTPayload extends JWTPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin' | 'billing_admin';
  subscription_tier?: 'free' | 'pro' | 'enterprise';
}

// ── 路由访问控制表 ──

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RouteRule {
  pattern: RegExp;
  methods: HttpMethod[];
  allowedRoles: AppJWTPayload['role'][];
  requireAuth: boolean;
}

const ACCESS_TABLE: RouteRule[] = [
  { pattern: /^\/api\/chat/,       methods: ['POST'],              allowedRoles: ['user', 'admin'],                requireAuth: true  },
  { pattern: /^\/api\/admin/,      methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedRoles: ['admin'],           requireAuth: true  },
  { pattern: /^\/api\/billing/,    methods: ['GET', 'POST'],       allowedRoles: ['user', 'admin', 'billing_admin'], requireAuth: true  },
  { pattern: /^\/api\/public/,     methods: ['GET'],               allowedRoles: [],                               requireAuth: false },
  { pattern: /^\/api\/webhooks/,   methods: ['POST'],              allowedRoles: [],                               requireAuth: false },
];

function findRouteRule(pathname: string, method: string): RouteRule | undefined {
  return ACCESS_TABLE.find(
    r => r.pattern.test(pathname) && r.methods.includes(method as HttpMethod),
  );
}

// ── JWT 校验 ──

async function verifyToken(
  request: Request,
  secret: string,
): Promise<AppJWTPayload | null> {
  const authHeader = request.headers.get('Authorization');
  const cookieToken = parseCookie(request.headers.get('Cookie') ?? '', 'access_token');
  const token = authHeader?.replace('Bearer ', '') ?? cookieToken;

  if (!token) return null;

  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
      clockTolerance: 15,
    });
    return payload as AppJWTPayload;
  } catch {
    return null;
  }
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ── 中间件入口 ──

export async function authMiddleware(
  request: Request,
  env: AuthEnv,
): Promise<Response | Request> {
  const url = new URL(request.url);
  const rule = findRouteRule(url.pathname, request.method);

  if (!rule) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  if (!rule.requireAuth) {
    return request; // 无需鉴权，放行
  }

  const user = await verifyToken(request, env.SUPABASE_JWT_SECRET);

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (rule.allowedRoles.length > 0 && !rule.allowedRoles.includes(user.role)) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 将用户信息注入请求头传递给下游
  const enriched = new Request(request);
  enriched.headers.set('X-User-Id', user.sub);
  enriched.headers.set('X-User-Role', user.role);
  enriched.headers.set('X-User-Email', user.email);
  enriched.headers.set('X-Subscription-Tier', user.subscription_tier ?? 'free');
  return enriched;
}
```

---

## Layer 3 — Input Validation（Cloud Functions）

所有用户输入必须经过 Zod schema 校验和 XSS 消毒后才能进入业务逻辑。

```typescript
// lib/validation.ts
import { z, ZodError, type ZodSchema } from 'zod';

// ── XSS 消毒 ──

function sanitizeXSS(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ── 输入 Schema 定义 ──

export const chatInputSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(4000, 'Message exceeds 4000 characters')
    .transform(sanitizeXSS),
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
  model: z.enum(['gpt-4o', 'claude-sonnet', 'deepseek-r1']).default('gpt-4o'),
  temperature: z.number().min(0).max(2).default(0.7),
});

export const fileUploadSchema = z.object({
  filename: z.string().max(255),
  mimeType: z.enum([
    'image/png', 'image/jpeg', 'image/webp',
    'application/pdf',
    'text/plain', 'text/csv',
  ]),
  sizeBytes: z.number().max(10 * 1024 * 1024, 'File exceeds 10MB limit'),
  content: z.string(), // base64
});

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1)
    .max(100)
    .transform(sanitizeXSS)
    .optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().max(50).optional(),
});

// ── 统一校验包装器 ──

interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

export function validateInput<T>(
  schema: ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: ApiError; status: number } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        success: false,
        status: 400,
        error: {
          error: 'Validation failed',
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      };
    }
    // 不泄露内部错误细节
    return {
      success: false,
      status: 500,
      error: { error: 'Internal server error' },
    };
  }
}

// ── 使用示例：Chat API Handler ──

export async function handleChat(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const result = validateInput(chatInputSchema, body);
  if (!result.success) {
    return jsonResponse(result.status, result.error);
  }

  const { message, conversationId, model, temperature } = result.data;

  // 参数化查询防止 SQL 注入（Supabase client 内部使用 prepared statements）
  // const { data, error } = await supabase
  //   .from('messages')
  //   .insert({ content: message, conversation_id: conversationId, user_id: userId });

  return jsonResponse(200, { status: 'ok', model, temperature });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## Layer 4 — Business Security（Cloud Functions）

保护支付流程、防止重放攻击、强制配额、拦截 CSRF。

```typescript
// lib/business-security.ts
import Stripe from 'stripe';
import type { KVNamespace } from '@edgeone/types';

interface BusinessEnv {
  STRIPE_WEBHOOK_SECRET: string;
  IDEMPOTENCY_KV: KVNamespace;
  QUOTA_KV: KVNamespace;
}

// ── Stripe Webhook 签名校验 ──

export async function verifyStripeWebhook(
  request: Request,
  secret: string,
): Promise<Stripe.Event | Response> {
  const signature = request.headers.get('Stripe-Signature');
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing Stripe signature' }),
      { status: 400 },
    );
  }

  const body = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });

  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid webhook signature' }),
      { status: 400 },
    );
  }
}

// ── 幂等性保护 ──

export async function ensureIdempotent(
  kv: KVNamespace,
  eventId: string,
): Promise<boolean> {
  const existing = await kv.get(`idempotent:${eventId}`);
  if (existing) return false; // 已处理

  await kv.put(`idempotent:${eventId}`, '1', {
    expirationTtl: 86400, // 24 小时 TTL
  });
  return true; // 首次处理
}

// ── API 配额 ──

interface TierQuota {
  daily: number;
  monthly: number;
}

const TIER_QUOTAS: Record<string, TierQuota> = {
  free:       { daily: 20,    monthly: 200    },
  pro:        { daily: 500,   monthly: 10000  },
  enterprise: { daily: 5000,  monthly: 100000 },
};

export async function checkQuota(
  kv: KVNamespace,
  userId: string,
  tier: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const quota = TIER_QUOTAS[tier] ?? TIER_QUOTAS.free;
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const dailyKey = `quota:${userId}:daily:${today}`;
  const monthlyKey = `quota:${userId}:monthly:${month}`;

  const [dailyCount, monthlyCount] = await Promise.all([
    kv.get(dailyKey).then(v => parseInt(v ?? '0', 10)),
    kv.get(monthlyKey).then(v => parseInt(v ?? '0', 10)),
  ]);

  if (dailyCount >= quota.daily) {
    return { allowed: false, reason: `Daily quota (${quota.daily}) exceeded` };
  }
  if (monthlyCount >= quota.monthly) {
    return { allowed: false, reason: `Monthly quota (${quota.monthly}) exceeded` };
  }

  await Promise.all([
    kv.put(dailyKey, String(dailyCount + 1), { expirationTtl: 86400 }),
    kv.put(monthlyKey, String(monthlyCount + 1), { expirationTtl: 2_678_400 }),
  ]);

  return { allowed: true };
}

// ── Double-Submit Cookie CSRF 防护 ──

export function validateCSRF(request: Request): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;

  const cookieToken = parseCookieValue(
    request.headers.get('Cookie') ?? '',
    'csrf_token',
  );
  const headerToken = request.headers.get('X-CSRF-Token');

  if (!cookieToken || !headerToken) return false;
  return timingSafeEqual(cookieToken, headerToken);
}

function parseCookieValue(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// ── Webhook Handler 组合示例 ──

export async function handleStripeWebhook(
  request: Request,
  env: BusinessEnv,
): Promise<Response> {
  const event = await verifyStripeWebhook(request, env.STRIPE_WEBHOOK_SECRET);
  if (event instanceof Response) return event;

  const isNew = await ensureIdempotent(env.IDEMPOTENCY_KV, event.id);
  if (!isNew) {
    return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // await activateSubscription(event.data.object);
      break;
    case 'invoice.payment_failed':
      // await handlePaymentFailure(event.data.object);
      break;
    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

---

## Layer 5 — Data Security（Supabase RLS + 审计日志）

最后一道防线：即使应用层代码存在漏洞，数据库层的 RLS 策略仍然阻止越权访问。

```sql
-- ================================================================
-- Row Level Security (RLS) Policies
-- ================================================================

-- 启用 RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage     ENABLE ROW LEVEL SECURITY;

-- ── conversations ──

CREATE POLICY "users_own_conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_all_conversations"
  ON conversations FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ── messages ──

CREATE POLICY "users_own_messages"
  ON messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "admin_all_messages"
  ON messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ── user_profiles ──

CREATE POLICY "users_own_profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── api_usage (只读) ──

CREATE POLICY "users_read_own_usage"
  ON api_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ================================================================
-- 审计日志
-- ================================================================

CREATE TABLE audit_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name  TEXT        NOT NULL,
  record_id   UUID        NOT NULL,
  action      TEXT        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    JSONB,
  new_data    JSONB,
  performed_by UUID       NOT NULL DEFAULT auth.uid(),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address  INET
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_audit"
  ON audit_log FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- 通用审计触发器
CREATE OR REPLACE FUNCTION log_mutation() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER conversations_audit
  AFTER INSERT OR UPDATE OR DELETE ON conversations
  FOR EACH ROW EXECUTE FUNCTION log_mutation();

CREATE TRIGGER messages_audit
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION log_mutation();

CREATE TRIGGER user_profiles_audit
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION log_mutation();
```

### 敏感字段加密（应用层）

```typescript
// lib/encryption.ts

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

export async function encrypt(
  plaintext: string,
  keyBase64: string,
): Promise<string> {
  const key = await importKey(keyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded,
  );

  const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), IV_LENGTH);
  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(
  encryptedBase64: string,
  keyBase64: string,
): Promise<string> {
  const key = await importKey(keyBase64);
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plainBuffer);
}

async function importKey(base64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, { name: ALGORITHM, length: KEY_LENGTH }, false, [
    'encrypt',
    'decrypt',
  ]);
}
```

---

## 安全检查清单

Agent 在部署前必须逐项确认：

### Edge Entry (L1)

- [ ] EdgeOne KV 命名空间已创建并绑定到 `RATE_LIMIT_KV`
- [ ] 匿名 IP 限速 100 req/min，认证用户 300 req/min
- [ ] AI chat 端点 10 req/min，payment 端点 5 req/min
- [ ] CORS `Access-Control-Allow-Origin` 仅包含生产域名，无通配符 `*`
- [ ] CSP 头已设置，`frame-ancestors 'none'`
- [ ] HSTS `max-age` ≥ 1 年，含 `includeSubDomains`
- [ ] 请求体 > 1MB 返回 413

### Authentication (L2)

- [ ] `SUPABASE_JWT_SECRET` 通过环境变量注入，不硬编码
- [ ] JWT 过期时间 ≤ 1 小时
- [ ] 路由访问控制表覆盖所有 `/api/*` 端点
- [ ] 未匹配路由返回 404 而非 500
- [ ] 用户信息通过 `X-User-*` 头传递，不信任客户端传入的同名头

### Input Validation (L3)

- [ ] 所有 API 输入经过 Zod schema 校验
- [ ] 字符串输入经过 XSS 消毒（`<`, `>`, `"`, `'` 已转义）
- [ ] 数据库查询使用 Supabase client 的参数化接口
- [ ] 文件上传白名单仅包含必要的 MIME 类型
- [ ] 错误响应不包含堆栈跟踪或内部细节

### Business Security (L4)

- [ ] Stripe webhook 使用 `stripe.webhooks.constructEvent` 校验签名
- [ ] 幂等 KV 的 TTL 设为 24 小时
- [ ] 配额表覆盖 free / pro / enterprise 三档
- [ ] 状态修改操作检查 CSRF double-submit token
- [ ] `timingSafeEqual` 用于 token 比对，防止时序攻击

### Data Security (L5)

- [ ] 所有用户数据表已启用 RLS
- [ ] RLS 策略确保 `auth.uid() = user_id`
- [ ] admin 策略通过 JWT claim `role = 'admin'` 判定
- [ ] 审计触发器覆盖所有核心表
- [ ] 敏感字段（API key、PII）使用 AES-256-GCM 加密后存储
- [ ] 加密密钥通过环境变量注入，定期轮换
