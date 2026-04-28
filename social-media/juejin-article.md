# 从 Claude Code 50 万行源码学安全架构，我做了一个企业级 AI SaaS Skill 参赛复盘

> 本文参加 WorkBuddy x EdgeOne AI Prompts + Skills 挑战赛 Skills 赛道。完整源码和在线演示链接见文末附录。

## 0. 开头：一次泄露，一堂安全课

2025 年中，Claude Code 的源码被意外泄露。50 万行 TypeScript 代码摊开在所有人面前。社区沸腾了——有人忙着八卦"Anthropic 到底用了什么 prompt"，有人急着找"能白嫖的 system message"。

而我，盯上了它的权限管道。

Claude Code 内部有一个 6 阶段权限流水线（Permission Pipeline）。每一个工具调用都要经过**声明 → 分析 → 校验 → 确认 → 审计 → 执行** 6 道关卡，任何一层拒绝都直接阻断。这个架构有一个核心理念：

**纵深防御（Defense in Depth）——任何单层失效，不会导致全面沦陷。**

这句话像钉子一样钉进了我的脑子。

三个月后，WorkBuddy x EdgeOne 举办了 AI Prompts + Skills 挑战赛。我决定把这套安全理念落地，做一个**企业级 AI SaaS Skill**——用一句话生成一个带认证、支付、AI 对话、管理后台和 5 层安全防护的全栈网站。

这篇文章是完整的参赛复盘。

---

## 1. 比赛介绍

**WorkBuddy x Tencent EdgeOne AI Prompts + Skills 挑战赛**分两个赛道：

| 赛道 | 任务 | 适合人群 |
|------|------|---------|
| Prompts | 一段提示词，生成一个精美网页 | 学生、设计师、产品经理 |
| **Skills** | 一个 Skill，生成一个带登录/支付/购物的全栈网站 | 开发者、独立开发者、Indie Hacker |

Skills 赛道的评分权重：

- 网站完整度 30%
- Skills 质量 30%
- 技术深度 20%
- 传播力 20%

冠军奖励 20,000 WorkBuddy Credit + 价值 ¥45,600 的 EdgeOne 套餐权益。

我选了 Skills 赛道，因为我想做的不只是一个网站——**我想做一套可复用的企业级 SaaS 生成方案**。

---

## 2. 技术方案概述

### 2.1 为什么做 enterprise-ai-saas-skill？

官方示例仓库已经有一个 `ai-saas-skill`，可以生成基本的 AI SaaS 网站。但我看到了几个痛点：

1. **安全是事后添加的**——没有系统性的安全架构，Rate Limiting 形同虚设
2. **没有真正的支付闭环**——Stripe 集成缺少 Webhook 签名验证和幂等保护
3. **没有利用 EdgeOne 的边缘能力**——安全检查全部堆在 Cloud Functions 里，延迟高且容易被绕过

### 2.2 差异化策略

| 维度 | 官方 ai-saas-skill | 我的 enterprise-ai-saas-skill |
|------|-------------------|------------------------------|
| 安全层数 | 1-2 层 | **5 层纵深防御** |
| Rate Limiting | 简单计数器 | **滑动窗口 + IP/User/Endpoint 三维限流** |
| 支付安全 | 基础 Checkout | **Webhook 签名 + 幂等 KV + 配额管控** |
| 数据隔离 | 基础 RLS | **RLS + 审计日志 + 字段加密** |
| 边缘利用 | 静态托管 | **Edge Functions + KV + Middleware 全链路** |
| RBAC | 无 | **free_user / pro_user / admin 三级角色** |

### 2.3 技术栈选型

| 层级 | 技术 | 选型理由 |
|------|------|---------|
| 前端 | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Motion | SSR + Streaming + RSC 减少客户端 JS，shadcn/ui 提供无障碍组件原语 |
| 后端 | EdgeOne Edge Functions (V8) + Cloud Functions (Node.js) | 安全检查在边缘完成，业务逻辑在 Cloud Function 里跑 |
| 存储 | EdgeOne KV + Supabase (PostgreSQL) | KV 放高频读写（Session/计数器），PostgreSQL 放持久化业务数据 |
| 支付 | Stripe Subscriptions + Webhooks | 行业标准，Checkout + Billing Portal + Webhook 覆盖完整订阅生命周期 |
| AI | MiniMax M2.7 via EdgeOne AI Gateway | AI Gateway 自带 Token 计量、重试、降级，零基建成本 |
| 认证 | Supabase Auth + JWT + RBAC | Supabase 自带 RLS，JWT 可以在 Edge Function 里零依赖验证 |

---

## 3. 安全架构深度解析（核心卖点）

这是整个 Skill 最硬核的部分。我把 Claude Code 的 6 阶段权限流水线**映射**到了 EdgeOne Pages 的全栈架构上，设计了 5 层纵深防御。

### 3.0 架构总览

```
请求 → [L1 Edge Entry] → [L2 Auth] → [L3 Input Validation] → [L4 Business Security] → [L5 Data Security] → 响应
         Edge Function      Edge Function    Cloud Function          Cloud Function         Supabase RLS
```

每一层独立拦截、逐层收紧。**即使某一层被突破，后面的层仍然能挡住攻击。**

### 3.1 Layer 1 — Edge Entry Protection（Edge Functions + KV）

在请求到达任何业务逻辑之前，在 CDN 边缘节点完成三件事：速率限制、安全头注入、请求体大小校验。

**核心：滑动窗口计数器**

```typescript
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
```

为什么用 EdgeOne KV 而不是内存计数器？因为 Edge Function 是无状态的 V8 Isolate——实例随时会被回收和重建。KV 是全局复制的持久化存储，天然适合跨实例共享的计数场景。

**三维限流策略**：

| 维度 | Key 格式 | 限额 |
|------|---------|------|
| Per-IP（全局） | `ip:{clientIP}` | 匿名 100/min，认证 300/min |
| Per-Endpoint | `ep:{ip}:{pathname}` | AI 对话 10/min，支付 5/min |
| Per-User | `user:{userId}:{pathname}` | 按订阅等级动态调整 |

**安全头注入**——CSP、HSTS、X-Frame-Options 等在边缘统一注入：

```typescript
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
  headers.set('Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload');
  headers.set('Permissions-Policy',
    'camera=(), microphone=(), geolocation=()');
}
```

### 3.2 Layer 2 — Authentication & Authorization（Edge Function）

JWT 校验在边缘完成——不合法请求**永远不会到达 Cloud Function**。

```typescript
const ACCESS_TABLE: RouteRule[] = [
  { pattern: /^\/api\/chat/,    methods: ['POST'],
    allowedRoles: ['user', 'admin'],   requireAuth: true  },
  { pattern: /^\/api\/admin/,   methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedRoles: ['admin'],           requireAuth: true  },
  { pattern: /^\/api\/billing/, methods: ['GET', 'POST'],
    allowedRoles: ['user', 'admin', 'billing_admin'], requireAuth: true },
  { pattern: /^\/api\/public/,  methods: ['GET'],
    allowedRoles: [],                  requireAuth: false },
  { pattern: /^\/api\/webhooks/, methods: ['POST'],
    allowedRoles: [],                  requireAuth: false },
];
```

这里有一个关键设计：**用户信息通过 `X-User-*` 头注入下游，Cloud Function 不再需要重复验 JWT**。同时，客户端传入的同名头会被 Edge Function 覆盖，杜绝了伪造身份的可能。

```typescript
const enriched = new Request(request);
enriched.headers.set('X-User-Id', user.sub);
enriched.headers.set('X-User-Role', user.role);
enriched.headers.set('X-User-Email', user.email);
enriched.headers.set('X-Subscription-Tier', user.subscription_tier ?? 'free');
```

### 3.3 Layer 3 — Input Validation（Cloud Functions + Zod）

所有用户输入必须经过 Zod schema 校验和 XSS 消毒后才能进入业务逻辑：

```typescript
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
```

用 `validateInput` 统一包装，错误响应**绝不泄露内部细节**——500 错误统一返回 `Internal server error`，不暴露堆栈跟踪。

### 3.4 Layer 4 — Business Security（Stripe Webhook + 幂等保护）

支付安全是 SaaS 的命脉。这一层做了三件事：

**1. Stripe Webhook 签名验证**——永远使用原始请求体（`request.text()`），不要先 `JSON.parse` 再传入：

```typescript
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
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid webhook signature' }),
      { status: 400 },
    );
  }
}
```

**2. 幂等保护**——Webhook 可能重复投递，用 `event.id` 作为幂等键存入 KV：

```typescript
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
```

**3. CSRF Double-Submit Cookie** + `timingSafeEqual` 防时序攻击：

```typescript
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
```

### 3.5 Layer 5 — Data Security（Supabase RLS + 审计日志）

最后一道防线：**即使应用层代码存在漏洞，数据库层的 RLS 策略仍然阻止越权访问。**

```sql
-- 用户只能访问自己的对话
CREATE POLICY "users_own_conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin 可以访问所有对话
CREATE POLICY "admin_all_conversations"
  ON conversations FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

审计日志用触发器自动记录所有 mutation，Admin 才能查看：

```sql
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
```

---

## 4. EdgeOne Pages 全栈实战

### 4.1 Edge Functions vs Cloud Functions 的选型策略

这是我在实际开发中总结的选型原则：

| 判断维度 | 选 Edge Function | 选 Cloud Function |
|---------|-----------------|-------------------|
| 是否需要 npm 包？ | 不需要 | 需要（如 Stripe SDK） |
| 计算密集？ | 否（200ms CPU 限制） | 是 |
| 需要 KV？ | 是（通过全局变量绑定） | 是（通过 context.env） |
| 适用场景 | 认证、限流、CORS、路由守卫 | 支付处理、AI 调用、CRUD |

**核心原则：安全检查尽量前推到 Edge，业务逻辑留在 Cloud。**

### 4.2 KV Storage 使用场景

在这个项目里，EdgeOne KV 承担了 5 类数据的存储：

| 用途 | Key 模式 | TTL | 说明 |
|------|---------|-----|------|
| Session Cache | `session:{tokenHash}` | 5 min | 缓存 JWT 解析结果，避免重复验证 |
| Rate Limit | `rl:{identifier}:{window}` | 2x 窗口 | 滑动窗口计数器 |
| AI Response Cache | `ai:{promptHash}` | 30 min | 相同 prompt 缓存结果降低推理成本 |
| Feature Flags | `config:feature_flags` | 60s | 运行时配置，支持灰度发布 |
| Idempotency | `idem:{eventId}` | 24h | Stripe Webhook 去重 |

### 4.3 AI Gateway 接入 MiniMax M2.7

EdgeOne AI Gateway 的好处是**换模型只改 Header，不改代码**：

```typescript
const gatewayHeaders = () => ({
  "OE-Key": process.env.EDGEONE_AI_GATEWAY_KEY!,
  "OE-Gateway-Name": process.env.EDGEONE_GATEWAY_NAME!,
  "OE-AI-Provider": "minimax",
  "OE-Gateway-Version": "2",
  Authorization: `Bearer ${process.env.MINIMAX_API_KEY!}`,
  "Content-Type": "application/json",
});
```

SSE 流式输出通过 `ReadableStream` Transform 实现——上游是 MiniMax 的 SSE，下游是客户端的 SSE，中间做 token 提取 + 用量记录：

```typescript
export function createSSEStream(
  upstream: ReadableStream<Uint8Array>,
  userId: string,
  conversationId: string,
): ReadableStream {
  let fullContent = "";
  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value, { stream: true }).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
              continue;
            }
            const token = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
            fullContent += token;
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ token })}\n\n`)
            );
          }
        }
      } finally {
        await saveMessage(conversationId, "assistant", fullContent);
        await logUsage(userId, fullContent.length);
        controller.close();
      }
    },
  });
}
```

### 4.4 部署经验

EdgeOne Pages 的部署流程本身很丝滑。但有几个点需要注意：

1. **KV 命名空间要提前在控制台创建并绑定全局变量**——代码里是通过变量名直接访问（如 `SAAS_KV`），不是 import
2. **Edge Functions 不支持 npm 包**——所有逻辑必须内联实现或用 Web 标准 API
3. **环境变量在控制台中设置，不要提交 `.env.local`**——这是安全底线

---

## 5. 前端设计系统

### 5.1 深色主题 + Glass-morphism

设计系统基于 CSS Variables，支持 Dark/Light 双主题切换。深色模式是默认主题，使用 `next-themes` 管理。

Glass-morphism 是整个 UI 的视觉语言——通过 `backdrop-filter: blur()` + 半透明背景 + 细微边框实现：

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.2);
}
```

### 5.2 Motion 动效系统

动效用 Motion（Framer Motion v11+），覆盖四种场景：

- **Page Transition**：`opacity + y` 组合，入场 0.2s ease-out
- **Staggered List**：子元素依次出现，间隔 50ms
- **Scroll Reveal**：进入视口时触发，`once: true` 防止重复
- **Button Feedback**：`whileTap: scale(0.95)` + `whileHover: scale(1.02)`

有一条硬规则：**禁止高弹跳 spring 动画、禁止无限旋转（loading 除外）、禁止视差滚动。** 这些都会增加认知负担且移动端性能差。

### 5.3 响应式策略

| 断点 | 宽度 | 布局 |
|------|------|------|
| `sm` | ≥ 390px | 单列 + 底部导航 |
| `md` | ≥ 768px | 双列 + Sidebar 折叠 |
| `lg` | ≥ 1024px | 完整 Sidebar + 三列网格 |
| `xl` | ≥ 1440px | `max-w-[1280px] mx-auto` |

移动端底部导航和桌面端侧边栏使用同一份数据源，通过断点控制显隐。

---

## 6. 踩坑记录

### 坑 1：Edge Function 里用了 `Buffer`，直接 500

Edge Function 跑在 V8 Isolate 里，**不是 Node.js**。`Buffer`、`fs`、`path` 等 Node.js API 全部不可用。

**解决方案**：用 Web 标准 API 替代。

- `Buffer.from(str, 'base64')` → `Uint8Array.from(atob(str), c => c.charCodeAt(0))`
- `crypto.createHmac()` → `crypto.subtle.sign('HMAC', ...)`
- `Buffer.from(str).toString('hex')` → `Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')`

### 坑 2：Stripe Webhook 签名验证失败——因为先 JSON.parse 了请求体

Stripe 的签名是基于**原始请求体字符串**计算的。如果你先 `await request.json()` 拿到对象，再 `JSON.stringify` 回去，字段顺序可能变化，签名就对不上。

**解决方案**：永远用 `await request.text()` 拿原始字符串。

### 坑 3：KV 最终一致性导致 Rate Limit 计数不准

EdgeOne KV 是最终一致性的——写后立即读可能拿到旧值。在高并发下，滑动窗口计数器可能允许少量超限请求。

**解决方案**：

1. 接受这个误差——Rate Limiting 本身就是"尽力而为"的防护，不是精确计量
2. 关键的精确计量（如 API 配额）放到 Cloud Function + Supabase（PostgreSQL 事务保证 ACID）
3. KV 的 `expirationTtl` 设为窗口的 2 倍，给垃圾回收留缓冲

---

## 7. Skill 设计哲学：渐进式披露

一个好的 Skill 不应该一股脑把所有 reference 加载到上下文里。我的 SKILL.md 采用了**渐进式披露（Progressive Disclosure）**的设计：

1. **主流程只有 8 步**——每步明确说明"在这一步加载哪个 reference"
2. **12 个 reference 文件按需加载**——不预加载，只在流程走到该步骤时才读取
3. **路由表统一管理**——哪个步骤、什么条件、加载哪个文件，一目了然

```
enterprise-ai-saas-skill/
├── SKILL.md                          # 入口 — 8 步主流程
├── references/
│   ├── user-prompt-intake.md         # Step 1: 用户意图采集
│   ├── architecture-overview.md      # Step 3: 系统架构
│   ├── project-scaffold.md           # Step 3: 项目脚手架
│   ├── auth-system.md                # Step 4: 认证系统
│   ├── payment-stripe.md             # Step 4: 支付集成
│   ├── ai-integration.md             # Step 4: AI 集成
│   ├── security-hardening.md         # Step 5: 安全加固
│   ├── edge-kv-patterns.md           # Step 5: Edge/KV 模式
│   ├── admin-dashboard.md            # Step 4: 管理后台
│   ├── ui-design-system.md           # Step 4: UI 设计系统
│   ├── database-schema.md            # Step 4: 数据库 Schema
│   └── deployment-handoff.md         # Step 8: 部署交接
└── README.md
```

这意味着 AI 编程工具在执行 Skill 时，**上下文窗口始终保持精简**——不会因为提前加载了所有文档而超出 token 限制或产生幻觉。

---

## 8. 总结与展望

### 做这个 Skill 我最大的收获

1. **安全不是 feature，是 architecture**——它应该从第一天就设计进系统架构，而不是最后一天加几个 `if` 判断
2. **Edge 和 Cloud 各司其职**——安全检查前推到边缘，业务逻辑留在云端，这是最优的分层方式
3. **KV 是被低估的武器**——Session 缓存、Rate Limiting、幂等保护、Feature Flags、AI 响应缓存，一个 KV 命名空间搞定 5 种场景
4. **Skill 的设计也是软件工程**——渐进式披露、模块化 reference、声明式路由表，Skill 本身的"代码质量"同样重要

### 对 AI Skill 生态的看法

我认为 Skill 生态正在走向一个有趣的方向：**从"生成代码"到"生成架构"**。

今天的 AI 编程工具（WorkBuddy、Cursor、Claude Code 等）已经能生成高质量的单文件代码。但"生成一个完整的 SaaS"——包括认证、支付、AI 对话、管理后台、安全防护——需要的不只是代码生成能力，还需要**架构决策能力**。

Skill 就是把架构决策固化下来的方式。一个好的 Skill 不只是告诉 AI"写什么代码"，更是告诉 AI"做什么决策、在什么时机做、遵循什么约束"。

我相信未来的 Skill 生态会越来越像"企业级最佳实践库"——你不需要每次都从零思考认证该怎么做、支付该怎么接、安全该怎么防，直接装一个 Skill，一句话启动就好。

**这才是 AI 编程的真正 10x 提效。**

---

## 9. 附录

### 源码仓库

> GitHub: `https://github.com/[your-username]/enterprise-ai-saas-skill`（TODO: 替换为实际链接）

### 在线演示

> Demo: `https://enterprise-ai-saas.edgeone.app`（TODO: 替换为实际链接）

### 安装方式

```bash
npx skills add enterprise-ai-saas-skill
```

安装后在 WorkBuddy 中输入：

```
帮我搭一个企业级 AI SaaS 平台
```

就可以一句话生成完整的全栈网站。

### 触发词

- "build an AI SaaS on EdgeOne Pages"
- "scaffold an enterprise AI platform"
- "帮我搭一个带登录支付的 AI SaaS"
- "做一个企业级 AI 工具站部署到 EdgeOne Pages"

---

**感谢 WorkBuddy 和 EdgeOne 团队举办这次比赛。如果你对这个 Skill 感兴趣，欢迎 Star 和 Fork，一起完善企业级 AI SaaS 的最佳实践。**

---

*本文首发于掘金。如需转载，请注明出处。*

*标签：#AI #SaaS #安全架构 #EdgeOne #Claude_Code #WorkBuddy #全栈开发 #TypeScript #Next.js #Stripe #Supabase*
