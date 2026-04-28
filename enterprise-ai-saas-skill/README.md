# 🚀 Enterprise AI SaaS Skill

> **WorkBuddy × EdgeOne Pages AI Prompts + Skills 挑战赛 · Skills 赛道参赛作品**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built for WorkBuddy](https://img.shields.io/badge/Built%20for-WorkBuddy-purple)](https://www.codebuddy.cn)
[![Deployed on EdgeOne](https://img.shields.io/badge/Deployed%20on-EdgeOne%20Pages-orange)](https://edgeone.ai)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://typescriptlang.org)
[![Security: 5-Layer](https://img.shields.io/badge/Security-5%20Layer%20Defense-red)](#-安全架构5层纵深防御)

**🌐 在线演示：[enterprise-ai-saas-3wsjjdqb.edgeone.cool](https://enterprise-ai-saas-3wsjjdqb.edgeone.cool)**

---

## 目录

- [这是什么？](#-这是什么)
- [30秒快速体验](#-30秒快速体验)
- [生成效果详览](#-生成效果详览)
- [安全架构：5层纵深防御](#-安全架构5层纵深防御)
- [EdgeOne 全栈能力使用详解](#-edgeone-全栈能力使用详解)
- [AI 对话功能（MiniMax M2.7）](#-ai-对话功能minimax-m27)
- [Stripe 支付集成](#-stripe-支付集成)
- [管理后台详解](#-管理后台详解)
- [技术栈与选型理由](#-技术栈与选型理由)
- [Skill 内部结构](#-skill-内部结构12-份参考文档)
- [快速开始：在 WorkBuddy 中使用](#-快速开始在-workbuddy-中使用)
- [直接运行示例项目](#-直接运行示例项目)
- [环境变量获取指南（新手友好）](#-环境变量获取指南新手友好)
- [数据库结构详解](#-数据库结构详解)
- [设计系统](#-设计系统)
- [响应式设计](#-响应式设计)
- [与官方示例的差异](#-与官方示例的差异)
- [常见问题 FAQ](#-常见问题-faq)
- [贡献指南](#-贡献指南)

---

## 🎯 这是什么？

这是一个 **WorkBuddy Skill**（AI 技能包），它的作用是：

> **你对 AI 说一句话，它帮你从零生成一个完整的企业级 AI SaaS 网站。**

### 对比：普通方式 vs 使用这个 Skill

| | 普通方式（自己开发） | 使用这个 Skill |
|---|---|---|
| 认证系统（登录/注册/OAuth）| 2-3天 | 自动生成 |
| 支付集成（Stripe 订阅）| 1-2天 | 自动生成 |
| AI 对话（流式输出）| 1天 | 自动生成 |
| 管理后台 | 3-5天 | 自动生成 |
| 安全防护（限流/JWT/XSS防护）| 持续迭代 | 自动生成 |
| 数据库设计 + SQL | 半天 | 自动生成 |
| **总计** | **约 2 周** | **约 30 分钟** |

### 一个真实对话

你对 WorkBuddy 说：

```
帮我做一个 AI 写作助手平台，用户注册后可以用 AI 帮他们写文章，
按月订阅 $12/月，需要管理后台，要能看到用户数量和使用量
```

Skill 会展示给你一个 Spec 确认单：

```json
{
  "productName": "WriteAI",
  "tagline": "用 AI 解锁你的写作潜力",
  "theme": "dark",
  "primaryColor": "#3b82f6",
  "language": ["zh-CN", "en"],
  "features": {
    "auth": true,
    "payment": true,
    "aiChat": true,
    "adminDashboard": true
  },
  "pricing": {
    "free": { "price": 0, "aiCallsPerDay": 10 },
    "pro": { "price": 12, "aiCallsPerDay": 500 },
    "enterprise": { "price": 49, "aiCallsPerDay": -1 }
  },
  "security": {
    "level": "enterprise",
    "rateLimitRPM": 60,
    "csrfProtection": true,
    "auditLog": true
  }
}
```

你确认后，30分钟内生成 **35个文件，4,868行代码**，全部通过 TypeScript 编译。

---

## ⚡ 30秒快速体验

```bash
# 1. 安装 Skills 包（一次性）
npx skills add TencentEdgeOne/edgeone-pages-skills

# 2. 打开 WorkBuddy，说任何一句：
"帮我做一个 AI SaaS 平台"
"build an enterprise AI assistant on EdgeOne"
"创建带订阅支付的 AI 工具网站"
"做一个 AI 客服平台，月付 $29"

# 3. 生成完毕后说：
"部署到 EdgeOne Pages"

# 完成。你现在有了一个在线运行的企业级 AI SaaS 网站。
```

---

## 🖼️ 生成效果详览

### 首页（营销落地页）

```
┌──────────────────────────────────────────────────────────┐
│  [Navbar]  AiFlow    首页  定价        [登录] [免费开始]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [渐变背景，有微弱的网格线纹理]                             │
│                                                          │
│         面向企业的下一代 AI 平台                           │
│                                                          │
│    企业级 AI 助手平台                                      │
│    释放团队全部潜力                     ← 逐字打出动效      │
│                                                          │
│  [AI 对话预览卡片，展示实时流式对话效果]                    │
│                                                          │
│  [免费开始使用]  [观看演示]                                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                  核心能力（6宫格卡片）                      │
│                                                          │
│  [智能AI对话] [企业级安全] [极速部署]                       │
│  [团队协作]   [数据分析]   [全球化架构]                     │
│                                                          │
│  每个卡片都是半透明毛玻璃，悬停时微微上浮                    │
├──────────────────────────────────────────────────────────┤
│                 三步开启 AI 之旅                           │
│  01创建账户 → 02配置AI助手 → 03规模化使用                  │
├──────────────────────────────────────────────────────────┤
│         10,000+活跃用户 · 99.9%可用性 · 4.9/5评分          │
└──────────────────────────────────────────────────────────┘
```

### AI 对话界面（`/dashboard/chat`）

```
┌──────────────────────────────────────────────────────────┐
│  [Sidebar]           AI 助手对话界面                       │
│  ├ 仪表盘            ┌─────────────────────────────────┐  │
│  ├ AI 对话  ←当前    │  系统提示词: 你是专业的写作助手...  │  │
│  └ 设置              └─────────────────────────────────┘  │
│                                                          │
│  [对话历史区域]                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  👤 用户: 帮我写一个关于人工智能未来的开场白          │ │
│  │                                                     │ │
│  │  🤖 AI: 人工智能正在以前所未有的速度改变▌            │ │
│  │         ← 这里是流式打字效果，逐字出现               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  [消息输入框]                    [今日剩余: 487次] [发送]  │
└──────────────────────────────────────────────────────────┘
```

### 管理后台（`/admin`，仅管理员可见）

```
┌──────────────────────────────────────────────────────────┐
│  管理后台              [bcefghj@163.com] [退出]           │
│  ┌─────────┐                                             │
│  │总览      │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────┐  │
│  │用户管理  │  │总用户数 │ │今日活跃 │ │本月收入 │ │调用│  │
│  │数据分析  │  │ 1,234  │ │  89    │ │$3,456  │ │45K │  │
│  │系统设置  │  │↑12%   │ │↑5%    │ │↑23%   │ │↑67%│  │
│  └─────────┘  └────────┘ └────────┘ └────────┘ └────┘  │
│               ┌────────────────────┐ ┌──────────────┐   │
│               │  用户增长曲线(30天)  │ │ 最近注册用户  │   │
│               │    ╭──────╮        │ │  张三 - Pro  │   │
│               │ ╭──╯      ╰───╮   │ │  李四 - Free │   │
│               │ ╯             ╰   │ │  王五 - Admin│   │
│               └────────────────────┘ └──────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### 定价页（`/pricing`）

```
┌──────────────────────────────────────────────────────────┐
│                     选择您的方案                           │
│                                                          │
│  ┌────────────┐  ┌──────────────────┐  ┌────────────┐   │
│  │   Free     │  │   ★ Pro 推荐      │  │ Enterprise │   │
│  │   $0/月    │  │   $19/月          │  │ $49/月     │   │
│  │            │  │ [背景高亮+边框]    │  │            │   │
│  │ ✓ 10次/天  │  │ ✓ 500次/天       │  │ ✓ 无限制   │   │
│  │ ✓ 基础功能 │  │ ✓ 优先响应        │  │ ✓ 专属支持 │   │
│  │ ✗ 管理后台 │  │ ✓ 数据导出        │  │ ✓ SLA保障  │   │
│  │            │  │ ✗ 管理后台        │  │ ✓ 管理后台 │   │
│  │[免费注册]  │  │  [立即升级]        │  │[联系销售]  │   │
│  └────────────┘  └──────────────────┘  └────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 🔒 安全架构：5层纵深防御

本 Skill 的安全设计借鉴了 **Claude Code** 的分层权限思想和 **Hermes Agent** 的信任边界模型。所有安全代码均自动生成，无需手动实现。

### 架构总览

```
互联网请求
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│  Layer 0: EdgeOne CDN（DDoS 自动清洗，无需配置）           │
│  • 全球 3200+ 节点，流量清洗中心在攻击前拦截               │
│  • 自动吸收 SYN Flood、UDP Flood、HTTP Flood              │
└────────────────────────┬─────────────────────────────────┘
                         │ 合法流量通过
┌────────────────────────▼─────────────────────────────────┐
│  Layer 1: Edge Entry 防护（EdgeOne Edge Function）         │
│                                                          │
│  执行位置：全球边缘节点（冷启动 < 5ms）                     │
│                                                          │
│  ┌── IP 速率限制（滑动窗口算法）───────────────────┐       │
│  │  const key = `rate:${ip}:${minute}`;           │       │
│  │  const count = await kv.incr(key);             │       │
│  │  if (count > 60) return 429;  // 超出直接拦截   │       │
│  └────────────────────────────────────────────────┘       │
│                                                          │
│  ┌── CORS 白名单 ──────────────────────────────────┐       │
│  │  只允许你的域名，防止其他网站盗用你的 API          │       │
│  └────────────────────────────────────────────────┘       │
│                                                          │
│  ┌── 安全响应头 ───────────────────────────────────┐       │
│  │  X-Frame-Options: DENY        ← 防止点击劫持     │       │
│  │  X-Content-Type-Options: nosniff ← 防 MIME 嗅探  │       │
│  │  Strict-Transport-Security    ← 强制 HTTPS       │       │
│  │  Content-Security-Policy      ← 限制资源加载来源  │       │
│  └────────────────────────────────────────────────┘       │
│                                                          │
│  ┌── 请求大小限制 ─────────────────────────────────┐       │
│  │  if (contentLength > 1_000_000) return 413;    │       │
│  │  // 超过 1MB 直接拒绝，防上传攻击                │       │
│  └────────────────────────────────────────────────┘       │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│  Layer 2: 认证与授权（Edge Function JWT 验证）              │
│                                                          │
│  所有需要登录的路由（/dashboard, /admin, /api）都经过这层    │
│                                                          │
│  const token = req.headers.get("Authorization")         │
│                              ?.replace("Bearer ", "");  │
│                                                          │
│  // 用 Supabase JWT Secret 验证签名，防止伪造 Token       │
│  const payload = await verifyJWT(token, JWT_SECRET);    │
│                                                          │
│  if (!payload) return 401;     // Token 无效             │
│  if (payload.exp < now) return 401; // Token 过期        │
│                                                          │
│  // 路由级别的角色检查                                     │
│  if (path.startsWith("/admin") && role !== "admin") {   │
│    return redirect("/dashboard"); // 非管理员踢走         │
│  }                                                       │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│  Layer 3: 输入验证（Cloud Functions，Zod Schema）           │
│                                                          │
│  // 每个 API 端点都有严格的 Zod 校验                        │
│  const chatSchema = z.object({                           │
│    message: z.string()                                   │
│      .min(1, "消息不能为空")                               │
│      .max(4000, "消息过长")                               │
│      .transform(sanitizeHtml),  // 清除 <script> 等标签  │
│    conversationId: z.string().uuid().optional(),         │
│  });                                                     │
│                                                          │
│  const result = chatSchema.safeParse(body);              │
│  if (!result.success) {                                  │
│    // 返回验证错误，不暴露内部细节                           │
│    return 400 with { error: "Invalid input" };          │
│  }                                                       │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│  Layer 4: 业务安全（Cloud Functions）                      │
│                                                          │
│  ┌── Stripe Webhook 验证 ─────────────────────────┐       │
│  │  // 验证事件真的来自 Stripe，防伪造付款成功通知   │       │
│  │  stripe.webhooks.constructEvent(body, sig, secret) │    │
│  └────────────────────────────────────────────────┘       │
│                                                          │
│  ┌── 幂等性保护（KV 去重）────────────────────────┐        │
│  │  const idempotentKey = `stripe:${event.id}`;  │        │
│  │  const processed = await kv.get(idempotentKey);│        │
│  │  if (processed) return 200; // 已处理，静默忽略  │        │
│  │  await kv.set(idempotentKey, "1", { ex: 86400 });│      │
│  └────────────────────────────────────────────────┘       │
│                                                          │
│  ┌── AI 配额强制执行 ──────────────────────────────┐       │
│  │  const limits = { free: 10, pro: 500 };        │       │
│  │  const todayUsage = await getTodayUsage(userId);│       │
│  │  if (todayUsage >= limits[userRole]) return 429;│       │
│  └────────────────────────────────────────────────┘       │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│  Layer 5: 数据安全（Supabase PostgreSQL）                  │
│                                                          │
│  ┌── 行级安全策略（RLS）──────────────────────────┐        │
│  │  -- 每个用户只能读写自己的数据，数据库层面强制    │        │
│  │  CREATE POLICY "own_data" ON conversations     │        │
│  │    FOR ALL USING (auth.uid() = user_id);       │        │
│  │  -- 即使代码有 bug，A 用户永远拿不到 B 的数据    │        │
│  └────────────────────────────────────────────────┘       │
│                                                          │
│  ┌── 全链路审计日志 ───────────────────────────────┐       │
│  │  -- 所有"改数据"操作都写审计日志                  │       │
│  │  INSERT INTO audit_log (                        │       │
│  │    user_id, action, resource_type,              │       │
│  │    old_value, new_value, ip_address             │       │
│  │  ) VALUES (...);                                │       │
│  └────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

### 攻击场景 vs 防御机制

| 攻击方式 | 防御层 | 防御手段 | 攻击者看到 |
|---------|--------|---------|-----------|
| DDoS / 流量洪泛 | Layer 0 | EdgeOne CDN 流量清洗 | 请求被丢弃 |
| 暴力破解登录 | Layer 1 | IP 限速 60次/分钟 | `429 Too Many Requests` |
| 伪造 JWT Token | Layer 2 | HMAC-SHA256 签名验证 | `401 Unauthorized` |
| XSS 注入脚本 | Layer 3 | sanitizeHtml 清洗输入 | 脚本被转义，无法执行 |
| SQL 注入 | Layer 5 | Supabase Prepared Statements | 查询无效 |
| 越权读他人数据 | Layer 5 | RLS 行级策略 | 返回空结果 |
| 伪造 Stripe 付款 | Layer 4 | Webhook 签名验证 | `400 Bad Request` |
| 重复触发付款 | Layer 4 | KV 幂等键去重 | 静默忽略 |
| CSRF 跨站请求 | Layer 2 | Double-submit cookie | 请求被拒绝 |
| 访问 /admin | Layer 2 | 角色检查（admin only） | 重定向到 /dashboard |

---

## ⚡ EdgeOne 全栈能力使用详解

这个 Skill 充分利用了 EdgeOne 的全部四种能力：

### 1. Edge Functions（V8 引擎，冷启动 < 5ms）

```typescript
// edge-functions/api/health.ts
// 运行在全球边缘节点，不经过服务器
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 注入安全响应头（每个请求都会经过这里）
    const headers = new Headers({
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    });

    // IP 速率限制（使用 KV 存储计数器）
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const key = `rate:${ip}:${Math.floor(Date.now() / 60000)}`;
    const count = parseInt(await env.KV.get(key) || "0") + 1;
    await env.KV.put(key, String(count), { expirationTtl: 120 });

    if (count > 60) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...Object.fromEntries(headers), "Retry-After": "60" },
      });
    }

    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      headers: { "Content-Type": "application/json", ...Object.fromEntries(headers) },
    });
  },
};
```

### 2. Cloud Functions（Node.js 运行时）

```typescript
// cloud-functions/api/ai/chat.ts
// 运行在 EdgeOne 的 Node.js 环境
export async function handler(req: Request): Promise<Response> {
  // Layer 3: Zod 输入验证
  const { message, conversationId } = chatSchema.parse(await req.json());

  // Layer 4: 配额检查（从 Supabase 查询今日用量）
  const usage = await getTodayUsage(userId);
  const limit = userRole === "pro" ? 500 : 10;
  if (usage >= limit) {
    return Response.json({ error: "Daily quota exceeded" }, { status: 429 });
  }

  // 调用 MiniMax M2.7（通过 EdgeOne AI Gateway，带流式输出）
  const aiResponse = await fetch(
    `https://api.minimax.chat/v1/text/chatcompletion_v2`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${env.MINIMAX_API_KEY}` },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        stream: true,   // 流式：AI 边生成边返回
        messages: conversationHistory,
      }),
    }
  );

  // 把 AI 流式输出直接转发给浏览器（SSE 格式）
  return new Response(aiResponse.body, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
```

### 3. KV Storage（键值存储，毫秒级读写）

KV 在本项目中承担 5 种职责：

```typescript
// 用途1: 速率限制计数器
await kv.put(`rate:${ip}:${minute}`, count, { expirationTtl: 120 });

// 用途2: 会话缓存（减少数据库查询）
await kv.put(`session:${userId}`, JSON.stringify(userProfile), { expirationTtl: 3600 });

// 用途3: Stripe 幂等键（防止重复处理付款事件）
await kv.put(`stripe:event:${eventId}`, "processed", { expirationTtl: 86400 });

// 用途4: 功能开关（Feature Flags，无需重新部署）
const featureEnabled = await kv.get(`feature:newDashboard:${userId}`);

// 用途5: AI 配额计数（每天重置）
await kv.put(`quota:${userId}:${today}`, dailyCount, { expirationTtl: 86400 });
```

### 4. AI Gateway（统一管理 AI 模型 API）

EdgeOne AI Gateway 的优势：

| 功能 | 说明 |
|------|------|
| **统一 API Key 管理** | 不用把 MiniMax Key 暴露在代码里 |
| **请求日志** | 在 EdgeOne 控制台查看每次 AI 调用 |
| **自动限流** | 保护你的 AI Key 不被刷爆 |
| **模型切换** | 一键在 MiniMax / OpenAI / 其他模型间切换，无需改代码 |
| **成本控制** | 设置每日 token 上限，防止意外超支 |

---

## 🤖 AI 对话功能（MiniMax M2.7）

### 流式输出体验

AI 的回复是**实时流式**的，每个 token 生成后立即推送到浏览器，不是等全部完成再显示：

```
用户问：帮我优化这段代码的性能
        if (arr.length > 0) {
          for (var i = 0; i < arr.length; i++) { ... }
        }

AI 回复（逐字打出）：
这段代码有几个可以优化的地方：▌

1. **使用 `const`/`let` 替代 `var`**▌
   `var` 存在变量提升问题，现代 JS 应始终使用...▌

2. **合并条件判断**▌
   `arr.length > 0` 的检查是多余的，因为...▌

3. **使用 `for...of` 或 `forEach`**▌
   语义更清晰，性能相当：▌

   ```javascript
   for (const item of arr) {▌
     // 处理 item▌
   }▌
   ```▌
```

### 对话历史管理

每次对话自动保存到 Supabase，用户可以：
- 随时回看历史对话
- 给对话起名（AI 自动生成标题）
- 删除不需要的对话
- （Pro 用户）导出对话为 Markdown

### 配额系统

```
免费用户: 每天 10 次对话
  ↓ 超出后提示升级
Pro 用户: 每天 500 次对话
  ↓ 接近上限时提前提醒
Enterprise 用户: 无限制
```

配额在数据库和 KV 双重记录，防止并发场景下的超额问题。

---

## 💳 Stripe 支付集成

### 完整支付流程（自动生成）

```
用户点击"升级到 Pro $19/月"
  │
  ▼ POST /api/stripe/create-checkout
Cloud Function 创建 Checkout Session
  {
    price: "price_xxx",           // Pro 方案的 Stripe Price ID
    customer_email: user.email,   // 预填邮箱
    client_reference_id: user.id, // 用于 Webhook 关联用户
    success_url: "/dashboard?upgraded=true",
    cancel_url: "/pricing",
  }
  │
  ▼ 跳转到 Stripe 官方支付页（无需你处理 PCI 合规）
用户输入信用卡信息（测试卡：4242 4242 4242 4242）
  │
  ▼ Stripe 发送 Webhook 到 POST /api/stripe/webhook
Cloud Function 处理（含以下验证）：
  1. 验证 Stripe-Signature 头（防伪造）
  2. 检查 KV 幂等键（防重复处理）
  3. 更新数据库：profiles.role = "pro_user"
  4. 写审计日志：user_id, "subscription_created", ...
  │
  ▼ 用户刷新页面 → 发现 AI 配额从 10次/天 变成 500次/天
```

### 测试支付

在 Stripe 测试模式下，可以用以下测试卡（不收真钱）：

| 场景 | 卡号 |
|------|------|
| 支付成功 | `4242 4242 4242 4242` |
| 需要 3D 验证 | `4000 0025 0000 3155` |
| 余额不足 | `4000 0000 0000 9995` |
| 卡被拒绝 | `4000 0000 0000 0002` |

有效期：任意未来日期，CVV：任意3位数

---

## 📊 管理后台详解

只有角色为 `admin` 的账户才能访问 `/admin`，在注册时系统会根据 `ADMIN_EMAILS` 环境变量自动赋予管理员权限。

### 总览仪表盘（`/admin`）

4 个 KPI 卡片 + 2 个图表：

```
KPI 卡片（实时数据，来自 Cloud Function /api/admin/stats）：
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ 总用户数    │ │ 今日活跃    │ │ 本月收入    │ │ AI 调用次数 │
│ 1,234      │ │ 89         │ │ $3,456     │ │ 45,678     │
│ 较昨日↑12%│ │ 较昨日↑5% │ │ 较上月↑23%│ │ 较昨日↑67%│
└────────────┘ └────────────┘ └────────────┘ └────────────┘

图表（Recharts 绘制）：
左侧：用户增长曲线（过去30天，折线图）
右侧：最近注册用户列表（含角色和注册时间）
```

### 用户管理（`/admin/users`）

```
搜索框: [搜索邮箱或姓名...]                    [导出CSV]

┌───┬──────────────────┬──────────────────┬────────┬──────┬────────┐
│ # │ 姓名             │ 邮箱             │ 角色   │ 状态 │ 操作   │
├───┼──────────────────┼──────────────────┼────────┼──────┼────────┤
│ 1 │ 张三             │ zhang@xx.com     │ Pro    │ 正常 │[改权限]│
│   │                  │                  │        │      │[封禁]  │
├───┼──────────────────┼──────────────────┼────────┼──────┼────────┤
│ 2 │ 李四             │ li@xx.com        │ Free   │ 正常 │[升级]  │
│   │                  │                  │        │      │[封禁]  │
└───┴──────────────────┴──────────────────┴────────┴──────┴────────┘

分页: < 1 2 3 ... 24 >  每页 10 条
```

### 数据分析（`/admin/analytics`）

```
时间范围: [7天▼]  [1月]  [3月]  [自定义...]

AI 使用量趋势（Area Chart，霓虹蓝填充）：
  3000 |           ╭────────╮
  2000 |     ╭─────╯        ╰────╮
  1000 | ────╯                    ╰──────
       └─────────────────────────────────→

订阅分布（Pie Chart）：
  Free: 67%  █████████████
  Pro:  28%  ████████
  Ent:   5%  █

收入趋势（Bar Chart，月度）：
  5000 |    ████
  4000 |    ████  ████
  3000 | ████████████  ████
       └─────────────────────→
         Jan  Feb  Mar  Apr
```

---

## 🛠️ 技术栈与选型理由

| 技术 | 版本 | 为什么选这个 | 不选的替代品 |
|------|------|------------|------------|
| **Next.js** | 14 (App Router) | SSR + 边缘渲染 + SEO 友好；App Router 的 Server Components 减少客户端 JS | Nuxt.js（Vue 生态），Remix（无 SSG）|
| **TypeScript** | 5.5 strict | 全局强类型，编译时发现 99% 的 bug；Zod 类型推断依赖 TS | JavaScript（运行时才报错）|
| **Tailwind CSS** | v4 | 开发速度快 3 倍；零 CSS 死代码（Purge）；与 shadcn/ui 完美配合 | Styled-components（运行时），CSS Modules（手动维护）|
| **shadcn/ui** | latest | 代码复制不是 npm 包，可完全自定义；无运行时依赖 | Material UI（过重），Ant Design（设计语言固定）|
| **Motion** | 11 | 声明式动画，Spring 物理引擎，60fps；性能比 GSAP 好在 React 环境里 | GSAP（命令式，React 不友好），CSS Animation（功能有限）|
| **Supabase** | latest | PostgreSQL + Auth + RLS + 实时订阅一体化；开源可自托管 | Firebase（闭源，数据锁定），PlanetScale（无 RLS）|
| **Stripe** | 2026-04-22 | 合规度最高（PCI DSS Level 1）；Webhook 有内建重试；支持 150+ 货币 | PayPal（体验差），国内支付（需企业资质）|
| **MiniMax M2.7** | latest | 中文理解能力强；支持流式 SSE；国内访问稳定；支持多模态 | ChatGPT（国内不可直连），Claude（无国内镜像）|
| **Recharts** | 2 | React 生态最成熟；SVG 渲染，无 Canvas 黑盒 | ECharts（jQuery 依赖），Chart.js（需 Canvas 封装）|
| **Zod** | 3 | TypeScript-first 校验；与 Next.js Server Actions 无缝集成 | Yup（类型推断弱），Joi（非 TS 优先）|

---

## 📁 Skill 内部结构：12 份参考文档

```
enterprise-ai-saas-skill/
│
├── SKILL.md（279行）                ← AI 读取的主控文件
│   包含：
│   • 触发词列表（中英文，约20个场景）
│   • 8步执行流程（带分支逻辑）
│   • 12个 references 的路由表（按需加载，节省上下文）
│   • 10条不可违反的关键规则
│
└── references/（按需加载，节省 AI 上下文）
    │
    ├── user-prompt-intake.md（353行）
    │   ├─ § Prompt 解析：从用户自由描述提取 Spec 字段
    │   ├─ § 内置问卷：8个引导问题（产品名/功能/定价/安全级别...）
    │   └─ § 默认 Spec：AI 助手平台，深蓝主题，中英双语，企业级安全
    │
    ├── architecture-overview.md（293行）
    │   ├─ § 三层架构：Edge（V8）+ Cloud（Node.js）+ Storage（Supabase+KV）
    │   ├─ § 完整目录结构（`src/`树形图）
    │   └─ § 请求流转图（浏览器→CDN→Edge→Cloud→DB）
    │
    ├── project-scaffold.md（454行）
    │   ├─ § 精确依赖列表（含版本号，防止冲突）
    │   ├─ § 脚手架命令序列（create-next-app → shadcn init → 安装依赖）
    │   ├─ § 所有配置文件模板（tsconfig/tailwind/next.config/edgeone.json）
    │   └─ § .gitignore（含敏感文件排除）
    │
    ├── auth-system.md（671行）
    │   ├─ § Supabase Auth 配置（OAuth providers 设置）
    │   ├─ § JWT 生成与验证（服务端和 Edge Function 两种场景）
    │   ├─ § RBAC 实现（free_user/pro_user/admin 三级角色）
    │   ├─ § 登录/注册页面完整代码
    │   ├─ § OAuth 回调处理（/auth/callback）
    │   └─ § useUser Hook（含角色信息，全局可用）
    │
    ├── payment-stripe.md（485行）
    │   ├─ § 订阅模型设计（Free/Pro/Enterprise 三档）
    │   ├─ § create-checkout Cloud Function（完整代码）
    │   ├─ § Webhook 处理（签名验证 + 幂等 + 状态机）
    │   ├─ § 定价页前端组件
    │   └─ § 测试流程（使用 Stripe CLI 本地测试 Webhook）
    │
    ├── ai-integration.md（401行）
    │   ├─ § EdgeOne AI Gateway 配置（MiniMax M2.7 接入）
    │   ├─ § 流式对话 Cloud Function（SSE 实现）
    │   ├─ § 配额管理系统（按角色限制 + KV 计数）
    │   ├─ § 对话 UI 组件（打字机效果 + Markdown 渲染）
    │   └─ § 对话历史持久化（Supabase conversations 表）
    │
    ├── security-hardening.md（808行）←  最重要的文档
    │   ├─ § Layer 1-5 完整实现代码
    │   ├─ § 攻击场景与防御对应表
    │   ├─ § OWASP Top 10 覆盖情况
    │   └─ § 企业级安全 vs 基础安全的功能差异
    │
    ├── edge-kv-patterns.md（439行）
    │   ├─ § Edge Function 基础模板（带 TypeScript 类型）
    │   ├─ § KV Storage 5种 SaaS 使用模式（代码 + 说明）
    │   ├─ § 中间件链式处理（Rate Limit → Auth → Business）
    │   └─ § 常见踩坑（KV 读写延迟、冷启动问题等）
    │
    ├── admin-dashboard.md（640行）
    │   ├─ § 管理员权限系统（route guard + 组件级保护）
    │   ├─ § 仪表盘 KPI 组件（Recharts + 实时数据）
    │   ├─ § 用户列表（搜索/排序/分页/批量操作）
    │   ├─ § 数据分析图表（折线/柱状/饼图）
    │   └─ § 系统配置界面（AI 参数/限流阈值/功能开关）
    │
    ├── ui-design-system.md（647行）
    │   ├─ § 配色系统（CSS HSL 变量，光/暗双主题）
    │   ├─ § Glass-morphism 样式类（带完整 CSS 实现）
    │   ├─ § 动效规格（Motion 配置参数表）
    │   ├─ § 核心组件实现（Button/Card/Input/Badge/Toast）
    │   └─ § 移动端适配规范（4断点 + 触摸优化）
    │
    ├── database-schema.md（406行）
    │   ├─ § 6张表的完整 CREATE TABLE SQL
    │   ├─ § 所有 RLS 策略（带注释说明保护什么）
    │   ├─ § 触发器（注册时自动创建 profile + 更新用量）
    │   └─ § 索引设计（查询性能优化）
    │
    └── deployment-handoff.md（271行）
        ├─ § 完整环境变量列表（按功能分组）
        ├─ § 10步本地验证清单
        ├─ § 常见部署错误及解决方法
        └─ § 交接到 edgeone-pages-deploy skill 的触发方式
```

**文档总量：5,868行**，这些是 AI 的"施工图纸"，AI 按需加载，不浪费上下文。

---

## 🚀 快速开始：在 WorkBuddy 中使用

### 准备（约 2 分钟，只需一次）

```bash
# 安装官方 EdgeOne Pages Skills 包
npx skills add TencentEdgeOne/edgeone-pages-skills
```

### 触发 Skill

打开 WorkBuddy，输入任意一句（以下任选）：

**中文触发语句：**
```
帮我搭一个 AI SaaS 平台
做一个带登录付款的 AI 助手网站
我想创建一个 AI 写作工具，按月收费
帮我做一个企业级 AI 客服平台
搭建一个 AI 工具站，有用户系统和管理后台
```

**英文触发语句：**
```
build an enterprise AI SaaS on EdgeOne Pages
create an AI assistant platform with subscription billing
scaffold a full-stack AI SaaS with admin dashboard
build a production-ready AI chatbot platform
```

### Skill 的 8 步执行流程

**Step 1** — 门控问题（必须先回答）
```
Skill 问：你有没有准备好的产品描述/Prompt？
  选 A: 有 → 粘贴你的描述，AI 解析成 Spec
  选 B: 没有 → AI 问你 8 个引导问题
  选 C: 直接默认 → 用默认的 AI 助手平台规格
```

**Step 2** — Spec 确认
```json
// AI 展示提取的规格让你确认
{
  "productName": "你的产品名",
  "features": { "auth": true, "payment": true, "aiChat": true },
  "pricing": { "pro": 19, "enterprise": 49 },
  "security": { "level": "enterprise" }
}
// 你回复 "确认" 或 "修改 xxx" 后继续
```

**Step 3-8** — 自动执行，不需要你操作，约 20-25 分钟完成

### 生成完成后部署

```
直接对 WorkBuddy 说："部署到 EdgeOne Pages"
```

---

## 💻 直接运行示例项目

这个仓库的 `ai-saas-template/` 是这个 Skill 的默认输出，产品名 **AiFlow**，可以直接运行体验。

### 环境要求

- Node.js 18+（`node --version` 查看，小于 18 需升级）
- npm 8+

### 运行步骤

```bash
# 1. 克隆仓库
git clone https://github.com/bcefghj/enterprise-ai-saas-skill.git
cd enterprise-ai-saas-skill/ai-saas-template

# 2. 安装依赖（约 30 秒）
npm install

# 3. 复制环境变量模板
cp .env.example .env.local

# 4. 至少填入以下内容（其他可以暂时留空）
# 打开 .env.local，修改：
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
# MINIMAX_API_KEY=sk-...

# 5. 启动开发服务器
npm run dev
# 浏览器打开 http://localhost:3000

# 6. 构建生产版本（验证没有 TypeScript 错误）
npm run build
# 应看到：✓ Compiled successfully
```

### 初始化数据库

在 Supabase SQL Editor 运行 `database/init.sql`（复制粘贴内容即可）：

```sql
-- 这个脚本会创建：
-- profiles 表（用户资料）
-- conversations 表（AI 对话历史）
-- messages 表（对话消息）
-- usage_logs 表（用量记录，供管理后台统计）
-- audit_log 表（安全审计）
-- system_settings 表（可在管理后台修改的配置）
-- 以及所有 RLS 策略、触发器、索引
```

---

## ⚙️ 环境变量获取指南（新手友好）

### 1. Supabase — 完全免费，5 分钟搞定

```
访问 supabase.com → "Start your project" → GitHub 登录
→ New Project → 填项目名 → 设数据库密码（记住！）
→ 等约 2 分钟初始化完成
→ 左侧 Settings → API → 复制以下内容到 .env.local：
```

| `.env.local` 变量 | 在哪里找 | 备注 |
|-------------------|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL | 公开的，放前端安全 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon/public | 公开的，客户端用 |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role | **保密！只在服务端用** |
| `SUPABASE_JWT_SECRET` | Settings → JWT Settings → JWT Secret | 用于验证 Token 签名 |

### 2. Stripe — 测试模式完全免费，无需银行卡

```
访问 stripe.com → 注册 → 左上角切到 "Test mode"（测试模式）
→ Developers → API keys → 复制 Secret key 和 Publishable key

创建产品：
→ Product catalog → + Add product → 填名称（如 Pro Plan）
→ Add price → Recurring → 填 $19 → Save
→ 复制 Price ID（price_xxx）
```

| `.env.local` 变量 | 在哪里找 |
|-------------------|---------|
| `STRIPE_SECRET_KEY` | Developers → API keys → Secret key（sk_test_...）|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Developers → API keys → Publishable key（pk_test_...）|
| `STRIPE_WEBHOOK_SECRET` | Webhooks → + Add endpoint → 复制 Signing secret |
| `STRIPE_PRICE_PRO` | Product → 点击产品 → 复制 Price ID（price_...）|

### 3. MiniMax AI Key

```
访问 api.minimax.chat → 注册 → API Keys → 创建新 Key → 复制
```

| `.env.local` 变量 | 说明 |
|-------------------|------|
| `MINIMAX_API_KEY` | 直连 MiniMax API 的密钥 |
| `EDGEONE_AI_GATEWAY_KEY` | 通过 EdgeOne AI Gateway 代理时用（可选）|

### 完整 `.env.local` 示例

```env
# ========== Supabase（数据库 + 认证）==========
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # 绝对保密！
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters

# ========== Stripe（订阅支付）==========
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_PRICE_PRO=price_1ABC...         # Pro 方案 $19/月
STRIPE_PRICE_ENTERPRISE=price_1DEF...  # Enterprise 方案 $49/月

# ========== MiniMax AI ==========
MINIMAX_API_KEY=sk-cp-...              # 或你的 EdgeOne AI Gateway Key
EDGEONE_AI_GATEWAY_KEY=               # 可选，使用 EdgeOne AI Gateway 时填
EDGEONE_GATEWAY_NAME=                 # 可选

# ========== 应用配置 ==========
NEXT_PUBLIC_APP_URL=http://localhost:3000   # 部署后改为你的真实域名
ADMIN_EMAILS=your-email@example.com        # 这个邮箱注册后自动获得管理员权限
```

---

## 🗃️ 数据库结构详解

运行 `database/init.sql` 后创建以下 6 张表：

### profiles（用户资料）

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'free_user',
                   -- 可选值: free_user | pro_user | admin
  stripe_customer_id      TEXT,     -- Stripe 客户 ID
  stripe_subscription_id  TEXT,     -- 当前订阅 ID
  subscription_status     TEXT,     -- active | canceled | past_due
  ai_calls_today          INTEGER DEFAULT 0,
  ai_calls_reset_at       TIMESTAMPTZ,  -- 每天凌晨重置计数
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### conversations（AI 对话会话）

```sql
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  title       TEXT NOT NULL DEFAULT '新对话',   -- AI 自动生成标题
  model       TEXT NOT NULL DEFAULT 'MiniMax-M2.7',
  message_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
-- RLS: 只能读写自己的对话
```

### messages（对话消息）

```sql
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  role            TEXT NOT NULL,   -- 'user' | 'assistant' | 'system'
  content         TEXT NOT NULL,
  tokens_used     INTEGER,         -- 记录每次对话消耗的 token 数
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### usage_logs（用量追踪）

管理后台图表数据的来源：

```sql
CREATE TABLE usage_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id),
  action_type  TEXT NOT NULL,   -- 'ai_chat' | 'login' | 'export' 等
  tokens_used  INTEGER DEFAULT 0,
  metadata     JSONB,           -- 额外信息（模型名、请求时长等）
  created_at   TIMESTAMPTZ DEFAULT now()  -- 按天聚合用于图表
);
```

### audit_log（安全审计）

企业级合规要求，记录所有"改数据"操作：

```sql
CREATE TABLE audit_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES profiles(id),
  action         TEXT NOT NULL,   -- 'role_changed' | 'subscription_created' | 'user_banned' 等
  resource_type  TEXT NOT NULL,   -- 操作对象类型
  resource_id    TEXT,            -- 操作对象 ID
  old_value      JSONB,           -- 变更前的值（用于回溯）
  new_value      JSONB,           -- 变更后的值
  ip_address     TEXT,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);
-- 只有 admin 角色能读取
```

---

## 🎨 设计系统

### 配色系统（CSS HSL 变量）

使用 CSS 自定义属性，支持运行时主题切换（深色/浅色）：

```css
:root {
  /* 背景 */
  --background: hsl(222, 47%, 100%);    /* 浅色模式：纯白 */
  --foreground: hsl(222, 47%, 11%);     /* 深色文字 */

  /* 主色调（亮蓝） */
  --primary:          hsl(221, 83%, 53%);
  --primary-foreground: hsl(210, 40%, 98%);

  /* 卡片 */
  --card: hsl(0, 0%, 100%);
  --card-foreground: hsl(222, 47%, 11%);
}

.dark {
  /* 背景 */
  --background: hsl(222, 47%, 4%);     /* 深色模式：深海军蓝黑 */
  --foreground: hsl(210, 40%, 98%);    /* 浅色文字 */

  /* 主色调（更亮的蓝，适应深色背景） */
  --primary: hsl(217, 91%, 60%);
}
```

### Glass-morphism 毛玻璃效果

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),  /* 顶部高光 */
    0 8px 32px rgba(0, 0, 0, 0.2);             /* 底部阴影 */
}
```

### 动效规格

| 场景 | 库 | 配置 |
|------|-----|------|
| 页面元素入场 | Motion | `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`，stagger 50ms |
| 按钮交互 | Motion | `whileHover={{ scale: 1.02 }}`，`whileTap={{ scale: 0.98 }}`，duration 150ms |
| 侧边栏 | Motion | Spring stiffness 400，damping 30（物理弹簧）|
| 数字计数器 | 原生 | 1200ms ease-out，从 0 到目标值 |
| AI 流式文字 | 原生 DOM | 每收到 SSE token，追加到 DOM，触发 CSS 过渡 |

---

## 📱 响应式设计

| 断点 | 设备 | 布局变化 |
|------|------|---------|
| `< 390px`（手机） | iPhone SE | 单列、汉堡菜单、隐藏 Sidebar、底部固定 Tab Bar |
| `390-768px`（小屏） | iPhone Pro Max | 两列卡片、水平导航 |
| `768-1024px`（平板） | iPad | 大部分 Desktop 布局 |
| `> 1024px`（桌面） | MacBook+ | 全功能：侧边栏常驻、三列卡片、宽仪表盘 |

**移动端专项：**
- 触摸目标最小 44×44px（符合 Apple HIG 标准）
- `prefers-reduced-motion`：动效缩减，省电
- `env(safe-area-inset-bottom)`：适配 iPhone 底部安全区域
- 文字不锁死大小，跟随系统字号设置

---

## 📊 与官方示例的差异

| 维度 | 官方 `ai-saas-skill` | 本 Skill |
|------|---------------------|----------|
| 代码生成方式 | clone 外部 `saas-starter` 仓库 | **AI 完全从零生成**，无外部依赖，100% 定制化 |
| AI 模型 | FAL/Fireworks 图像生成 | **MiniMax M2.7 对话**（中文理解更强）|
| 安全防护 | 无 | **5层纵深防御**（Layer 1-5 完整实现）|
| EdgeOne 使用深度 | 仅 Pages 部署 | **Edge Functions + Cloud Functions + KV + AI Gateway + Middleware** |
| 管理后台 | 无/简单页面 | **完整功能**（KPI + 图表 + 用户管理 + 系统配置）|
| 配额系统 | 无 | **按角色强制执行**（KV + DB 双重计数）|
| 审计日志 | 无 | **全链路审计**（满足企业合规要求）|
| TypeScript 严格度 | 部分 | **全量 strict mode**，编译器零警告 |
| 参考文档 | 4个 | **12个文档 5,868行**，覆盖所有工程细节 |
| 移动端适配 | 基础响应式 | **4断点精细适配**，iOS 安全区域，44px 触摸目标 |
| Stripe 安全 | 基础接入 | **Webhook 签名验证 + 幂等保护 + 订阅状态机** |
| 数据库设计 | 基础 | **6张表 + RLS + 触发器 + 索引优化** |

---

## ❓ 常见问题 FAQ

**Q: 我不会编程，能用这个 Skill 吗？**

> 可以！你只需要会说话。打开 WorkBuddy，告诉它你想做什么，Skill 会做所有技术工作。你唯一需要做的是：去 Supabase/Stripe 复制粘贴几个 API Key。

**Q: 生成的网站是我的吗？可以商用吗？**

> 完全是你的。MIT 许可证，商业友好。你可以：部署给真实用户、向用户收费、修改任意代码、不署名直接用。

**Q: 生成的代码质量怎么样？**

> 全量 TypeScript strict mode，`npm run build` 零错误通过，已通过实际部署验证。代码风格参考了 t3-stack 和 shadcn/ui 的最佳实践。

**Q: 支持多少并发用户？**

> 取决于你的 Supabase 和 EdgeOne 套餐。EdgeOne CDN 可以自动扩展应对流量峰值，数据库连接池通过 Supabase 连接池（PgBouncer）管理，单个免费 Supabase 项目可支持约 200 并发连接。

**Q: 我已经有自己的项目，能用这个 Skill 添加功能吗？**

> 这个 Skill 专为从零开始设计。如果你只想添加 AI 对话功能，可以参考 `references/ai-integration.md`；只需要支付，参考 `references/payment-stripe.md`。

**Q: 部署到 EdgeOne Pages 需要付费吗？**

> 不需要，EdgeOne Pages 有免费额度（每月 100GB 流量、100万次请求），对个人项目和测试完全够用。参赛还有专属免费套餐。

**Q: MiniMax API 调用会产生费用吗？**

> 会按 token 计费，但费用极低。MiniMax 新用户一般有免费额度，日常测试不会有明显费用。

**Q: 我的密钥安全吗？**

> 所有密钥只存在 `.env.local`（被 `.gitignore` 排除，不上传 GitHub）和 EdgeOne 的环境变量系统中。前端代码只能访问 `NEXT_PUBLIC_` 前缀的变量，服务端密钥永不下发到浏览器。

---

## 🤝 贡献指南

欢迎贡献！以下是主要贡献方向：

**1. 添加新的功能模块**

比如：多语言支持（i18n）、文件上传、团队协作、API Key 管理等

在 `references/` 下创建对应的 `xxx-module.md`，并在 `SKILL.md` 的路由表中添加条目。

**2. 改进现有实现**

发现了更好的安全实践？发现了 EdgeOne 的新功能？欢迎 PR。

**3. 报告 Bug**

在 GitHub Issues 中描述：触发语句 → 期望行为 → 实际行为。

**4. 测试新场景**

用不同的产品描述触发 Skill，测试生成的代码是否符合预期，报告失败的场景。

---

## 📄 许可证

MIT License — 随意使用，商业友好。Fork、改造、二次发布均可。

---

## 🙏 致谢

- [WorkBuddy / CodeBuddy](https://www.codebuddy.cn) — AI 编程平台，让这个 Skill 成为可能
- [Tencent EdgeOne](https://edgeone.ai) — 全球边缘部署 + Edge Functions + KV + AI Gateway
- [Supabase](https://supabase.com) — 开源的 Firebase 替代品，PostgreSQL + Auth 一体化
- [Stripe](https://stripe.com) — 最值得信赖的支付基础设施
- [MiniMax](https://api.minimax.chat) — 中文能力极强的多模态大语言模型
- [Claude Code](https://claude.ai) — 5层安全架构的设计灵感来源
- [shadcn/ui](https://ui.shadcn.com) — 优雅的 React 组件库

---

<div align="center">

**Made with ❤️ for WorkBuddy × EdgeOne Pages AI Prompts + Skills 挑战赛**

⭐ 如果这个 Skill 对你有帮助，欢迎点个 Star！

[🌐 在线演示](https://enterprise-ai-saas-3wsjjdqb.edgeone.cool) · [🐛 报告问题](https://github.com/bcefghj/enterprise-ai-saas-skill/issues) · [📖 比赛详情](https://pages.edgeone.ai/workbuddy)

</div>
