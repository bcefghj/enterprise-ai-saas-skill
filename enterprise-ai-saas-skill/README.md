# 🚀 Enterprise AI SaaS Skill

> **WorkBuddy × EdgeOne Pages AI Prompts + Skills 挑战赛 · Skills 赛道参赛作品**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built for WorkBuddy](https://img.shields.io/badge/Built%20for-WorkBuddy-purple)](https://www.codebuddy.cn)
[![Deployed on EdgeOne](https://img.shields.io/badge/Deployed%20on-EdgeOne%20Pages-orange)](https://edgeone.ai)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://typescriptlang.org)
[![Security: 5-Layer](https://img.shields.io/badge/Security-5%20Layer-red)](https://github.com/bcefghj/enterprise-ai-saas-skill)

## 一句话总结

> **对 WorkBuddy 说一句话，30 分钟内拥有一个完整的企业级 AI SaaS 网站。**

不需要会 React，不需要懂数据库，不需要配置过 Stripe。你只需要说出你的想法，这个 Skill 会自动完成其余一切。

---

## 📺 效果展示

| 页面 | 功能 | 效果 |
|------|------|------|
| 🏠 首页 | 营销落地页 | 渐变 Hero + 功能卡片 + 用户评价 + CTA |
| 💬 AI 对话 | 实时流式对话 | 打字机效果，支持 Markdown、代码高亮 |
| 💳 定价页 | 订阅套餐 | 三档价格卡片，一键跳转 Stripe 结账 |
| 📊 用户仪表盘 | 个人中心 | 使用统计图表 + 历史对话列表 |
| 🔐 管理后台 | 后台管理 | 用户管理 + 数据分析 + 系统配置（仅管理员） |

*部署后将补充在线演示链接*

---

## ✨ 这个 Skill 能生成什么？

### 一个真实的对话例子

假设你对 WorkBuddy 说：

```
帮我做一个 AI 简历优化平台，用户可以上传简历让 AI 帮忙改进，
按月订阅，$9.9 Pro / $29.9 Enterprise，需要用户登录，
我要能在后台看到用户数量和使用量
```

这个 Skill 会在 30 分钟内生成以下所有内容：

#### 📁 生成的文件树（约 35 个文件）

```
resume-optimizer/
│
├── 🌐 前端页面 (Next.js 14)
│   ├── src/app/page.tsx                    ← 首页：Hero + 功能介绍 + 定价
│   ├── src/app/pricing/page.tsx            ← 定价页：$9.9 Pro / $29.9 Enterprise
│   ├── src/app/(auth)/login/page.tsx       ← 登录页：邮箱密码 + Google OAuth
│   ├── src/app/(auth)/register/page.tsx    ← 注册页：邮件确认
│   ├── src/app/dashboard/page.tsx          ← 用户仪表盘：统计卡片 + 近期记录
│   ├── src/app/dashboard/chat/page.tsx     ← AI 简历优化界面：上传 + 流式输出
│   ├── src/app/dashboard/settings/page.tsx ← 设置：个人信息 + 订阅管理
│   ├── src/app/admin/page.tsx              ← 管理后台：KPI 仪表盘（仅管理员）
│   ├── src/app/admin/users/page.tsx        ← 用户列表：搜索/封禁/改权限
│   └── src/app/admin/analytics/page.tsx   ← 数据图表：折线图 + 柱状图
│
├── ☁️ 云函数 (Node.js Cloud Functions)
│   ├── cloud-functions/api/ai/chat.ts      ← AI 接口：MiniMax M2.7 流式
│   ├── cloud-functions/api/stripe/
│   │   ├── create-checkout.ts              ← 创建 Stripe 结账会话
│   │   └── webhook.ts                      ← 接收付款成功事件（签名验证）
│   └── cloud-functions/api/admin/stats.ts ← 管理员统计 API
│
├── ⚡ Edge Functions (V8 引擎)
│   └── edge-functions/api/health.ts        ← 健康检查 + 安全头注入
│
└── 🗃️ 数据库
    └── database/init.sql                   ← 一键初始化 6 张表 + 策略
```

---

#### 🔒 自动实现的安全功能

你完全不需要手动写安全代码，Skill 会自动生成以下全部：

**Layer 1 — 速率限制（你的接口不会被恶意刷爆）**

```typescript
// 自动生成的 Edge Function 速率限制（滑动窗口算法）
// 同一 IP 每分钟最多 60 次请求，超出直接返回 429
const key = `rate_limit:${clientIP}:${Math.floor(Date.now() / 60000)}`;
const count = await kv.incr(key);
await kv.expire(key, 120);

if (count > 60) {
  return new Response(JSON.stringify({
    error: "Too many requests",
    retryAfter: 60,
  }), {
    status: 429,
    headers: { "Retry-After": "60" }
  });
}
```

**Layer 2 — JWT 验证（保证只有登录用户才能用 AI）**

```typescript
// 自动生成：每个需要登录的 API 都有这段验证
const token = request.headers.get("Authorization")?.replace("Bearer ", "");
const payload = await verifyJWT(token, process.env.SUPABASE_JWT_SECRET);

if (!payload || payload.exp < Date.now() / 1000) {
  return new Response("Unauthorized", { status: 401 });
}
```

**Layer 3 — 输入校验（防 XSS、防注入）**

```typescript
// 自动生成的 Zod 校验，保证用户输入是合法的
const schema = z.object({
  message: z.string().min(1).max(4000).transform(sanitizeHtml),
  conversationId: z.string().uuid().optional(),
});

const result = schema.safeParse(req.body);
if (!result.success) {
  return Response.json({ error: "Invalid input" }, { status: 400 });
}
```

**Layer 4 — Stripe Webhook 验证（付款事件 100% 真实）**

```typescript
// 自动生成：Stripe 会在每次付款时发送通知，这里验证通知是真的
const sig = request.headers.get("stripe-signature");
let event: Stripe.Event;

try {
  event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
} catch (err) {
  // 签名不对就拒绝，防止伪造付款成功事件
  return new Response("Webhook signature verification failed", { status: 400 });
}
```

**Layer 5 — 数据库行级安全（用户只能看自己的数据）**

```sql
-- 自动生成：数据库层面强制隔离
-- 即使 API 有 bug，用户 A 也永远拿不到用户 B 的数据
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see own conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id);
```

---

#### 🤖 AI 对话功能（流式输出效果）

你问 AI，AI 的回复是**逐字流出**的，不是等全部生成完再显示，体验和 ChatGPT 一样：

```
你: 帮我优化这段自我介绍："本人大四在读，有一定编程经验"

AI: 我来帮你优化这段自我介绍。▌

    原句存在以下问题：
    1. "一定编程经验"太模糊，缺乏具体性
    2. "大四在读"是状态描述，不是亮点
    3. 缺少量化数据和具体成就
    
    优化建议：
    
    **版本一（技术岗位）：**
    "计算机科学大四在读，主导过 3 个全栈项目，
    熟练使用 React/Node.js/PostgreSQL，
    GitHub 代码量 10,000+ 行，有互联网公司实习经历。"
    
    **版本二（产品/运营岗位）：**
    ...（AI 继续打字输出）
```

实现这个效果的代码（自动生成）：

```typescript
// cloud-functions/api/ai/chat.ts（自动生成）
const response = await fetch("https://api.minimax.chat/v1/text/chatcompletion_v2", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "MiniMax-M2.7",
    stream: true,  // 开启流式输出
    messages: [{ role: "user", content: userMessage }],
  }),
});

// 把 AI 的输出实时转发给前端
return new Response(response.body, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  },
});
```

---

#### 💳 Stripe 支付集成（用户一键付款升级）

用户在定价页点击"升级 Pro"后，流程完全自动：

```
用户点击"升级到 Pro $9.9/月"
  ↓
调用 Cloud Function: POST /api/stripe/create-checkout
  ↓
后端创建 Stripe Checkout Session（含用户 ID、价格 ID）
  ↓
跳转到 Stripe 官方支付页（用户在这里输入信用卡）
  ↓
支付成功 → Stripe 发送 Webhook 通知 → 后端验证签名
  ↓
数据库更新：用户角色从 free_user → pro_user
  ↓
用户自动解锁 Pro 功能（每天 500 次对话 vs 免费版 10 次）
```

---

### 另一个例子：客服机器人平台

你对 WorkBuddy 说：

```
我想做一个企业客服机器人平台，让企业买账号，
给他们的网站接入 AI 客服，按坐席收费，
要有接入代码（JS 嵌入脚本），要有后台查看对话记录
```

Skill 同样能生成，区别只在品牌名称、功能描述文案、定价文案不同，安全架构、数据库、支付流程完全一致。

---

## 🧩 Skill 内部有什么？

这个 Skill 不是一个简单的 prompt，它是一套**12 份精密参考文档**，总计 **5,868 行**的工程知识：

```
enterprise-ai-saas-skill/
├── SKILL.md                             ← AI 阅读的主控文件（279行）
│                                          描述：8步流程 + 触发词 + 路由
│
└── references/（AI 按需加载，不一次全读）
    ├── user-prompt-intake.md   (353行) ← 理解你的需求，提炼成 Spec 对象
    │   示例输出：
    │   {
    │     "productName": "ResumeAI",
    │     "features": {
    │       "auth": true,
    │       "payment": true,
    │       "aiChat": true,
    │       "adminDashboard": true
    │     },
    │     "pricing": { "pro": 9.9, "enterprise": 29.9 },
    │     "security": { "level": "enterprise" }
    │   }
    │
    ├── architecture-overview.md (293行) ← 三层架构图解 + 目录结构 + 请求流
    ├── project-scaffold.md      (454行) ← 完整脚手架命令序列
    ├── auth-system.md           (671行) ← Supabase Auth + JWT + RBAC 完整实现
    ├── payment-stripe.md        (485行) ← Stripe 订阅 + Webhook + 幂等
    ├── ai-integration.md        (401行) ← MiniMax M2.7 + 流式 + 配额管理
    ├── security-hardening.md    (808行) ← 5层安全，最重要的文档
    ├── edge-kv-patterns.md      (439行) ← EdgeOne Edge Functions + KV 最佳实践
    ├── admin-dashboard.md       (640行) ← 完整管理后台实现
    ├── ui-design-system.md      (647行) ← 设计系统 + 动效 + 响应式
    ├── database-schema.md       (406行) ← 6张表的 SQL + RLS + 触发器
    └── deployment-handoff.md    (271行) ← 环境变量获取 + 本地验证清单
```

---

## 🛠️ 技术栈

| 层级 | 技术 | 为什么选这个 |
|------|------|------------|
| **前端框架** | Next.js 14 (App Router) | SSR 加持，首屏快；SEO 友好；边缘渲染 |
| **开发语言** | TypeScript 5.5 strict | 全局强类型，防运行时崩溃 |
| **样式** | Tailwind CSS v4 + shadcn/ui | 开发速度快 3 倍；组件直接用，不造轮子 |
| **动效** | Motion (Framer Motion) | 声明式动画，60fps，减少 jank |
| **数据库** | Supabase PostgreSQL | 开源 Firebase 替代；行级安全内置；免费额度慷慨 |
| **认证** | Supabase Auth + JWT | 开箱即用 OAuth；SSR 兼容；JWT 可在 Edge 层验证 |
| **支付** | Stripe Subscriptions | 合规度最高；Webhook 有内建重试；支持 150+ 货币 |
| **AI 模型** | MiniMax M2.7 | 国内访问稳定；支持流式 SSE；中文能力强 |
| **AI 网关** | EdgeOne AI Gateway | 统一管理 API Key；自动限流；请求日志 |
| **部署** | EdgeOne Pages | 全球 3200+ 节点；Edge Functions + KV 一体化；免费额度 |
| **数据可视化** | Recharts | React 生态最成熟的图表库；支持响应式 |

---

## 🗺️ 生成的网站页面地图

```
/                          ← 首页（SEO 落地页）
│
├── /pricing               ← 订阅定价页
├── /login                 ← 登录（邮箱 + Google/GitHub OAuth）
├── /register              ← 注册（邮件确认激活）
│
├── /dashboard             ← 用户工作台（需登录）
│   ├── /dashboard/chat    ← AI 对话界面（核心功能）
│   └── /dashboard/settings← 个人设置 + 订阅管理
│
└── /admin                 ← 管理后台（仅 admin 角色可访问）
    ├── /admin/users       ← 用户列表 + 封禁 + 修改权限
    ├── /admin/analytics   ← 使用量图表 + 收入趋势
    └── /admin/settings    ← AI 参数 + 限流阈值配置
```

每条路由都有 **权限守卫**，非法访问会被自动重定向：
- 未登录用户访问 `/dashboard` → 跳转到 `/login`
- 普通用户访问 `/admin` → 跳转到 `/dashboard`（403 不暴露路由存在性）

---

## 🔐 安全架构详解

本 Skill 的安全设计借鉴了 **Claude Code** 的分层权限思想和 **Hermes Agent** 的信任边界模型。

### 请求完整流程

```
浏览器请求
  │
  ▼
[EdgeOne CDN] ← 静态资源缓存，DDoS 自动清洗
  │
  ▼
[Edge Function: 安全中间件]
  ├─ 检查 IP 速率限制（KV 滑动窗口，60次/分钟）
  ├─ 验证 CORS Origin（只允许白名单域名）
  ├─ 注入安全响应头（X-Frame-Options, CSP, HSTS）
  └─ 大包检查（>1MB 直接拒绝，防止上传攻击）
  │
  ▼（通过则继续）
[Edge Function: JWT 验证]
  ├─ 解码 Authorization Header 中的 JWT
  ├─ 用 SUPABASE_JWT_SECRET 验证签名（防伪造）
  ├─ 检查 Token 过期时间
  └─ 提取 user_id 和 role（注入请求上下文）
  │
  ▼
[Cloud Function: 业务逻辑]
  ├─ Zod Schema 校验所有输入字段
  ├─ 消毒用户输入（防 XSS）
  ├─ 检查用户配额（pro: 500次/天，free: 10次/天）
  └─ 调用 MiniMax AI / Stripe API
  │
  ▼
[Supabase PostgreSQL]
  ├─ Row Level Security：user_id = auth.uid()
  ├─ 写操作同时写入 audit_log 表
  └─ 加密静态数据（AES-256，Supabase 内置）
```

### 攻击场景 vs 防御机制

| 攻击方式 | 防御手段 | 响应 |
|---------|---------|------|
| 暴力破解登录 | IP 速率限制 60次/分钟 | 返回 429，Retry-After 60s |
| 伪造 JWT Token | HMAC-SHA256 签名验证 | 返回 401 Unauthorized |
| XSS 注入 | Zod + sanitizeHtml | 输入被清洗或拒绝 |
| SQL 注入 | Supabase Prepared Statements + RLS | 攻击无效，数据隔离 |
| 伪造付款成功 | Stripe Webhook 签名验证 | 400 拒绝，账户不升级 |
| 越权访问他人数据 | Supabase RLS 行级策略 | 数据库层面 0 数据返回 |
| 重放 Stripe 事件 | KV 幂等键（event_id 去重） | 重复事件静默忽略 |
| 访问管理后台 | 角色检查（admin only） | 重定向到 /dashboard |
| DDoS 洪泛 | EdgeOne CDN 自动清洗 + KV 限流 | 边缘节点拦截，不到源站 |

---

## 📊 管理后台预览

管理员登录后，`/admin` 展示以下实时数据（自动生成，用 Recharts 绘制）：

### 仪表盘 KPI 卡片
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 总用户数     │ │ 今日活跃     │ │ 本月收入     │ │ AI 调用次数  │
│ 1,234       │ │ 89          │ │ $3,456      │ │ 45,678      │
│ ↑ 12%      │ │ ↑ 5%       │ │ ↑ 23%      │ │ ↑ 67%      │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### 用户增长曲线（30天）
```
新用户
100 |          ╭──────╮
 80 |      ╭───╯       ╰─────╮
 60 | ╭────╯                  ╰───
 40 |─╯
 20 |
    └────────────────────────────→ 日期
```

### 用户管理表格
```
姓名         邮箱              角色        状态    操作
张三         zhang@example.com  Pro         正常    [封禁] [改权限]
李四         li@example.com     Free        正常    [封禁] [升级]
王五         wang@example.com   Admin       正常    [查看]
```

---

## 🎨 设计系统

### 配色方案（深色主题）

| 用途 | 颜色 | HSL 值 |
|------|------|--------|
| 背景 | 深海军蓝黑 | `hsl(222, 47%, 4%)` |
| 主色调 | 亮蓝 | `hsl(217, 91%, 60%)` |
| 成功 | 翠绿 | `hsl(142, 71%, 45%)` |
| 警告 | 琥珀黄 | `hsl(38, 92%, 50%)` |
| 危险 | 红橙 | `hsl(0, 72%, 51%)` |
| 边框 | 半透明白 | `rgba(255,255,255,0.08)` |

### Glass-morphism 卡片效果

每个功能卡片、对话气泡、仪表盘面板都使用毛玻璃效果：

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

### 动效规格

| 动效类型 | 实现 | 时长 |
|---------|------|------|
| 页面元素入场 | `motion` IntersectionObserver stagger | 50ms 递增 |
| 按钮悬停 | scale(1.02) + 发光 | 150ms ease |
| 侧边栏展开 | spring(stiffness: 400) | 物理弹簧 |
| 数字计数器 | `countUp` 0 → 目标值 | 1200ms ease-out |
| 消息气泡 | 从底部 fadeIn + slideUp | 200ms |
| AI 流式文字 | 逐字追加 DOM | 跟随 SSE 事件 |

---

## 📱 响应式设计

| 断点 | 设备 | 布局变化 |
|------|------|---------|
| `390px` | iPhone | 单列、汉堡菜单、底部固定 Tab Bar |
| `768px` | iPad | 两列卡片、水平导航 |
| `1024px` | 笔记本 | 三列卡片、侧边栏显示 |
| `1440px` | 大屏 | max-width 居中，增加间距 |

移动端专项优化：
- 触摸目标最小 44×44px（Apple HIG 规范）
- 禁用耗性能的粒子动画（`@media (prefers-reduced-motion)`）
- 字体自动跟随系统（不锁死大小）
- iOS 安全区域适配（`env(safe-area-inset-bottom)`）

---

## 🚀 快速开始

### 方式一：在 WorkBuddy 中触发（推荐，30 分钟搭好）

1. **安装 Skill**

   在终端运行：
   ```bash
   npx skills add TencentEdgeOne/edgeone-pages-skills
   ```

2. **触发对话**

   打开 WorkBuddy，输入任意一句，例如：
   ```
   帮我做一个 AI 写作助手平台，用户订阅 $12/月，我要管理后台
   ```

   其他有效触发语句（任选一个）：
   ```
   build an enterprise AI SaaS on EdgeOne Pages
   创建一个带登录付款的 AI 聊天工具
   帮我搭一个 AI 客服机器人 SaaS
   做一个 AI SaaS，功能参考 ChatGPT Plus
   我想做一个 AI 辅助编程工具，商业版每月 $20
   ```

3. **回答问题（约 5 个）**

   Skill 会问你：
   - 产品名字叫什么？
   - 主要功能是？（AI 对话/图像生成/文档处理…）
   - 定价方案？
   - 需要哪些语言？（中/英/双语）
   - 安全级别？（基础/企业级）

4. **等待生成**

   大约 15-20 分钟，AI 会完成所有代码生成并运行 `npm run build`。

5. **一键部署**

   生成完成后说：
   ```
   部署到 EdgeOne Pages
   ```

---

### 方式二：直接运行示例项目（5 分钟看效果）

示例项目在 `ai-saas-template/` 目录，是这个 Skill 的默认输出（产品名：AiFlow，AI 助手平台）。

**第一步：安装依赖**

```bash
cd ai-saas-template
npm install  # 需要 Node.js 18+
```

**第二步：配置环境变量**

```bash
cp .env.example .env.local
```

打开 `.env.local`，至少填以下内容（只用 MiniMax 的话，其余可以暂时跳过）：

```env
# MiniMax AI（已有 key 的话直接填）
MINIMAX_API_KEY=sk-你的key

# Supabase（免费，5分钟注册获取）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...

# 其他暂时可以不填，不影响页面渲染
```

**第三步：启动开发服务器**

```bash
npm run dev
```

浏览器打开 `http://localhost:3000`，可以看到完整网站。

**第四步：构建验证**

```bash
npm run build
# 应该看到：✓ Compiled successfully
```

---

## ⚙️ 环境变量获取指南（新手友好）

### Supabase（数据库 + 认证）— 完全免费

1. 访问 [supabase.com](https://supabase.com)，点击"Start your project"
2. GitHub 账号登录（最方便）
3. 点击"New project"，填项目名，设数据库密码（记住它）
4. 等约 2 分钟初始化完成
5. 点击左侧 `Settings` → `API`
6. 复制以下三项到 `.env.local`：

```
Project URL          → NEXT_PUBLIC_SUPABASE_URL
anon / public key    → NEXT_PUBLIC_SUPABASE_ANON_KEY
service_role key     → SUPABASE_SERVICE_ROLE_KEY  ← 保密！
```

7. 点击 `Settings` → `JWT Settings` → 复制 JWT Secret → `SUPABASE_JWT_SECRET`
8. 点击 `SQL Editor` → 新建查询 → 粘贴 `database/init.sql` 内容 → 运行

### Stripe（支付）— 测试模式免费

1. 访问 [stripe.com](https://stripe.com)，注册（不需要银行卡验证）
2. 左上角切换到"Test mode"（测试模式，不会真收钱）
3. 左侧 `Developers` → `API keys`
4. 复制：
   - `Secret key (sk_test_...)` → `STRIPE_SECRET_KEY`
   - `Publishable key (pk_test_...)` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. 左侧 `Product catalog` → `+ Add product` → 创建"Pro Plan" $9.9/month
6. 复制 Price ID（`price_xxx`）→ `STRIPE_PRICE_PRO`
7. 左侧 `Webhooks` → `+ Add endpoint`
   - URL：`https://your-domain.com/api/stripe/webhook`
   - 事件：`customer.subscription.created/updated/deleted`
   - 复制 Signing secret → `STRIPE_WEBHOOK_SECRET`

> 💡 **测试信用卡号**：`4242 4242 4242 4242`，有效期任意未来日期，CVV `123`

### MiniMax（AI 模型）

1. 访问 [api.minimax.chat](https://api.minimax.chat)，注册
2. 点击左侧"API Keys" → 创建新 Key
3. 复制 → `MINIMAX_API_KEY`

---

## 🗃️ 数据库结构

6 张表，全部自动生成，运行 `database/init.sql` 一键初始化：

```sql
profiles          ← 用户资料（姓名/头像/订阅等级/使用配额）
  └── user_id (FK → auth.users)
  └── role: free_user | pro_user | admin

conversations     ← 对话会话
  └── user_id, title, model, created_at

messages          ← 对话消息
  └── conversation_id, role: user|assistant, content

usage_logs        ← 用量追踪（管理后台图表数据来源）
  └── user_id, action_type, tokens_used, date

audit_log         ← 审计日志（企业级合规）
  └── user_id, action, resource_type, old_value, new_value

system_settings   ← 系统配置（可在管理后台修改）
  └── ai_model, rate_limit_rpm, daily_quota_free, daily_quota_pro
```

---

## 📖 与官方示例的对比

这个 Skill 相比官方仓库的 `ai-saas-skill`，有以下主要改进：

| 维度 | 官方 ai-saas-skill | 本 Skill |
|------|-------------------|----------|
| 代码来源 | clone 外部模板仓库 | AI **从零生成**，完全按用户需求定制 |
| AI 模型 | FAL/Fireworks 图像生成 | **MiniMax M2.7 对话**（中文更强）|
| 安全设计 | 无安全防护 | **5层安全**（IP限流/JWT/Zod/Stripe签名/RLS）|
| EdgeOne 使用 | 仅基础部署 | **Edge Functions + KV + AI Gateway + Middleware** 全栈 |
| 管理后台 | 无 | **完整功能**（用户管理 + 图表 + 系统配置）|
| 配额系统 | 无 | **按订阅等级限制**（free: 10次/天, pro: 500次/天）|
| 审计日志 | 无 | **所有变更操作入库**（企业合规）|
| TypeScript | 部分 | **全量 strict mode**，零 `any` |
| 参考文档 | 4 个文档 | **12 个文档 5868 行**，覆盖所有工程细节 |
| 移动适配 | 基础响应式 | **4断点精细适配**，iOS 安全区域，触摸优化 |

---

## 🤝 如何在其他平台使用

这个 Skill 遵循标准 `SKILL.md` 格式，理论上可以在任何支持该格式的 AI 编程工具中使用：

- **WorkBuddy（CodeBuddy）** — 原生支持，推荐 ✅
- **Cursor** — 将 SKILL.md 内容放入 `.cursor/rules/` 后可参考
- **Claude（claude.ai）** — 将 SKILL.md 内容作为 system prompt 粘贴使用
- **其他 AI 助手** — 同上，将内容粘贴为上下文

---

## 📄 许可证

MIT License — 随意使用，商业友好。Fork、改造、二次发布均可，保留原作者信息即可。

---

## 🙏 致谢

- [WorkBuddy / CodeBuddy](https://www.codebuddy.cn) — AI 编程平台
- [Tencent EdgeOne](https://edgeone.ai) — 全球边缘部署，这个 Skill 的最终运行环境
- [Supabase](https://supabase.com) — 开源的 Firebase 替代品
- [Stripe](https://stripe.com) — 最值得信赖的支付基础设施
- [MiniMax](https://api.minimax.chat) — 中文能力极强的 AI 模型
- Claude Code — 安全分层架构的设计灵感来源

---

<div align="center">

**Made with ❤️ for WorkBuddy × EdgeOne Pages AI Prompts + Skills 挑战赛**

⭐ 如果这个 Skill 对你有帮助，欢迎点个 Star — 这对我们非常重要！

</div>
