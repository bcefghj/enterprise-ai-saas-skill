# 🚀 Enterprise AI SaaS Skill

> **WorkBuddy × EdgeOne Pages AI Prompts + Skills 挑战赛 · Skills 赛道参赛作品**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built for WorkBuddy](https://img.shields.io/badge/Built%20for-WorkBuddy-purple)](https://www.codebuddy.cn)
[![Deployed on EdgeOne](https://img.shields.io/badge/Deployed%20on-EdgeOne%20Pages-orange)](https://edgeone.ai)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://typescript.org)

**一句话，生成企业级 AI SaaS 全栈网站。**

只需对 WorkBuddy 说："帮我做一个 AI 助手平台"，这个 Skill 就会自动生成一套包含用户系统、订阅付费、AI 对话、管理后台、5 层安全防护的完整生产级网站，并部署到 EdgeOne Pages 的全球边缘网络。

---

## 📺 演示

| 场景 | 链接 |
|------|------|
| 🌐 在线演示站 | *部署后更新* |
| 📺 B 站演示视频 | *发布后更新* |
| 📝 掘金技术文章 | *发布后更新* |

---

## ✨ 这个 Skill 能生成什么？

触发这个 Skill 后，AI 会为你生成一个**完整的企业级 AI SaaS 网站**，包含以下所有功能，开箱即用：

### 🗂️ 页面结构

| 页面 | 路由 | 说明 |
|------|------|------|
| 营销首页 | `/` | Hero、功能介绍、工作原理、用户评价、CTA |
| 订阅定价 | `/pricing` | Free / Pro / Enterprise 三档方案 |
| 用户登录 | `/login` | 邮箱密码 + OAuth（Google/GitHub） |
| 用户注册 | `/register` | 邮件确认注册 |
| AI 工作台 | `/dashboard` | 使用统计、快捷操作、近期对话 |
| AI 对话 | `/dashboard/chat` | 流式对话，Markdown 渲染 |
| 用户设置 | `/dashboard/settings` | 个人信息、订阅管理、主题切换 |
| 管理后台 | `/admin` | 总览仪表盘（仅管理员） |
| 用户管理 | `/admin/users` | 查看/封禁/改权限（仅管理员） |
| 数据分析 | `/admin/analytics` | 使用量图表（仅管理员） |
| 系统配置 | `/admin/settings` | AI 参数、限流配置（仅管理员） |

### 🔒 安全架构（5 层纵深防御）

受 **Claude Code** 安全设计启发，实现企业级防护：

```
用户请求
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Edge 入口防护（EdgeOne Edge Functions）         │
│  • IP 速率限制（KV 滑动窗口）                              │
│  • CORS 白名单 + CSP 安全头 + HSTS                        │
│  • 请求体大小限制（>1MB 直接拒绝）                          │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Layer 2: 认证鉴权（Edge Function JWT 验证）              │
│  • JWT Token 解析验证（HMAC-SHA256）                       │
│  • 基于角色的路由访问控制（free_user/pro_user/admin）        │
│  • Token 过期检查                                         │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Layer 3: 输入校验（Cloud Functions Zod Schema）           │
│  • 所有 API 输入 Zod 严格校验                               │
│  • XSS 内容消毒（清除恶意 HTML）                            │
│  • 错误信息不暴露内部实现细节                                │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Layer 4: 业务安全（Cloud Functions）                     │
│  • Stripe Webhook 签名验证                                 │
│  • KV 幂等性保护（防止重复支付事件）                          │
│  • AI 对话配额按订阅等级强制执行                             │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Layer 5: 数据安全（Supabase）                             │
│  • Row Level Security 策略（用户只能看自己的数据）            │
│  • 全链路审计日志（记录所有变更操作）                          │
│  • 服务端密钥永不下发前端                                    │
└─────────────────────────────────────────────────────────┘
```

### ⚡ EdgeOne 全栈能力

| EdgeOne 能力 | 在本项目中的用途 |
|-------------|----------------|
| **Edge Functions (V8)** | 安全中间件、JWT 验证、Rate Limiting、健康检查 |
| **Cloud Functions (Node.js)** | API 端点、Stripe 支付、AI 对话代理、管理接口 |
| **KV Storage** | 速率限制计数器、会话缓存、幂等键 |
| **AI Gateway** | MiniMax M2.7 模型接入，支持流式 SSE 输出 |
| **全球 CDN** | 3200+ 边缘节点，静态资源极速加载 |
| **Middleware** | 请求路由、Auth 守卫、跨域处理 |

---

## 🛠️ 技术栈

| 层级 | 技术 | 作用 |
|------|------|------|
| **前端** | Next.js 14 (App Router) | SSR + 静态生成，SEO 友好 |
| **语言** | TypeScript 5.5 | 全局强类型，减少 Bug |
| **样式** | Tailwind CSS + shadcn/ui | 高效样式系统 + 精美组件 |
| **动效** | Motion (Framer Motion) | 克制精致的交互动画 |
| **数据库** | Supabase (PostgreSQL) | 用户数据、对话历史、订阅状态 |
| **认证** | Supabase Auth + JWT | 邮箱密码 + OAuth 登录 |
| **支付** | Stripe Subscriptions | 订阅计费 + Webhook |
| **AI** | MiniMax M2.7 | 流式 AI 对话 |
| **部署** | EdgeOne Pages | 全球边缘部署 |

---

## 📦 安装与使用

### 方式一：在 WorkBuddy 中直接使用（推荐）

1. 安装 Skill：
   ```bash
   npx skills add enterprise-ai-saas-skill
   ```

2. 打开 WorkBuddy，输入任意触发语句，例如：
   - `帮我搭一个 AI SaaS 平台`
   - `build an enterprise AI SaaS on EdgeOne Pages`
   - `创建一个带登录支付的 AI 助手网站`

3. 按照 Skill 的引导，回答几个问题（或直接按默认），AI 会自动生成完整代码。

4. 生成完成后，说"部署到 EdgeOne Pages"，即可一键上线。

### 方式二：直接运行示例项目

如果你想直接体验生成结果，可以运行 `ai-saas-template` 目录下的示例项目：

```bash
# 1. 进入项目目录
cd ai-saas-template

# 2. 安装依赖（需要 Node.js 18+）
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 打开 .env.local，按照注释填入你的密钥

# 4. 启动开发服务器
npm run dev
# 浏览器打开 http://localhost:3000

# 5. 构建生产版本
npm run build

# 6. 部署到 EdgeOne Pages
npx edgeone pages deploy
```

---

## ⚙️ 环境变量配置

生成的项目需要以下服务密钥。以下是获取方式：

### Supabase（数据库 + 认证）— 免费

1. 访问 [supabase.com](https://supabase.com) → 创建账号 → 新建项目
2. 进入 `Settings → API`，复制：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`（**保密！**）
3. 进入 `Settings → JWT Settings`，复制 JWT Secret → `SUPABASE_JWT_SECRET`
4. 在 `SQL Editor` 中运行 `database/init.sql` 初始化表结构

### Stripe（支付）— 免费测试模式

1. 访问 [stripe.com](https://stripe.com) → 创建账号
2. 进入 `Developers → API keys`，复制：
   - `Secret key` → `STRIPE_SECRET_KEY`
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. 创建两个订阅产品（Pro $19/月，Enterprise $49/月），复制 Price ID
4. 在 `Webhooks` 中添加端点，复制 Signing secret → `STRIPE_WEBHOOK_SECRET`

### MiniMax AI — 按用量计费

1. 访问 [MiniMax 开放平台](https://api.minimax.chat) → 创建账号
2. 在 EdgeOne 控制台创建 AI Gateway，配置 MiniMax 提供商
3. 复制 Gateway 密钥 → `EDGEONE_AI_GATEWAY_KEY`，`EDGEONE_GATEWAY_NAME`
4. 复制 MiniMax API Key → `MINIMAX_API_KEY`

### 完整 .env.local 示例

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...（服务端专用，绝不暴露给前端）
SUPABASE_JWT_SECRET=your-jwt-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# MiniMax AI（通过 EdgeOne AI Gateway）
MINIMAX_API_KEY=your-minimax-key
EDGEONE_AI_GATEWAY_KEY=your-gateway-key
EDGEONE_GATEWAY_NAME=your-gateway-name

# 应用
NEXT_PUBLIC_APP_URL=https://your-app.edgeone.cool
ADMIN_EMAILS=admin@example.com
```

---

## 🗂️ Skill 文件结构

```
enterprise-ai-saas-skill/
│
├── SKILL.md                        # 🎯 核心入口 — 8 步主流程
│                                   #    触发词、三分支入口、路由表
│
├── references/                     # 📚 按需加载的参考文档（共 12 个）
│   ├── user-prompt-intake.md       # 用户意图采集（Prompt 解析 / 问卷引导 / 默认规格）
│   ├── architecture-overview.md    # 系统架构总览（三层架构 + 目录结构 + 请求流转）
│   ├── project-scaffold.md         # 项目脚手架（依赖安装 + 配置文件 + 目录创建）
│   ├── auth-system.md              # 认证系统（Supabase Auth + JWT + RBAC 角色管理）
│   ├── payment-stripe.md           # 支付集成（Stripe 订阅 + Webhook + 幂等保护）
│   ├── ai-integration.md           # AI 集成（MiniMax M2.7 + EdgeOne AI Gateway + 流式）
│   ├── security-hardening.md       # 5 层安全加固（完整代码实现）
│   ├── edge-kv-patterns.md         # EdgeOne 模式（Edge Functions + KV Storage 最佳实践）
│   ├── admin-dashboard.md          # 管理后台（用户管理 + 数据分析 + 系统配置）
│   ├── ui-design-system.md         # 设计系统（配色 + Glass-morphism + 动效 + 响应式）
│   ├── database-schema.md          # 数据库（6 张表 + RLS 策略 + 触发器 + 索引）
│   └── deployment-handoff.md       # 部署交接（环境变量获取 + 本地验证 + 上线流程）
│
└── README.md                       # 本文件
```

---

## 🏗️ 生成项目的目录结构

```
your-ai-saas/
├── src/
│   ├── app/
│   │   ├── (marketing)/           # 公开页面（首页、定价）
│   │   ├── (auth)/                # 认证页面（登录、注册）
│   │   ├── dashboard/             # 用户功能页（AI 对话、设置）
│   │   └── admin/                 # 管理后台（权限保护）
│   ├── components/
│   │   ├── ui/                    # 基础组件（Button、Card、Input 等）
│   │   └── layout/                # 布局组件（Navbar、Sidebar、Footer）
│   ├── lib/
│   │   ├── supabase/              # Supabase 客户端（服务端/客户端/中间件）
│   │   └── utils.ts               # 工具函数
│   ├── hooks/
│   │   └── use-user.ts            # 用户状态 Hook（含角色信息）
│   ├── types/
│   │   └── database.ts            # TypeScript 类型定义
│   └── middleware.ts              # Next.js 路由中间件（auth 守卫）
│
├── edge-functions/
│   └── api/
│       └── health.ts              # 健康检查端点
│
├── cloud-functions/
│   └── api/
│       ├── ai/chat.ts             # AI 对话代理（MiniMax + SSE 流式）
│       ├── stripe/
│       │   ├── create-checkout.ts # 创建支付会话
│       │   └── webhook.ts         # 接收支付事件（签名验证）
│       └── admin/stats.ts         # 管理统计数据
│
├── database/
│   └── init.sql                   # 数据库初始化脚本（一键执行）
│
├── .env.example                   # 环境变量模板
├── edgeone.json                   # EdgeOne Pages 部署配置
└── README.md
```

---

## 🔄 Skill 工作流程

```
用户说："帮我搭一个 AI SaaS 平台"
          │
          ▼
    Step 1: 门控问题
    ┌─────────────────────────────────────┐
    │ 你有自己的产品描述吗？               │
    │  A. 有 → 解析为 Spec 对象           │
    │  B. 没有 → 内置 8 问问卷引导         │
    │  C. 默认 → 使用 AiFlow 默认规格      │
    └─────────────────────────────────────┘
          │
          ▼
    Step 2: 确认 Spec（展示 JSON 让用户确认）
          │
          ▼
    Step 3: 生成项目脚手架
    （目录结构 + 依赖安装 + 配置文件）
          │
          ▼
    Step 4: 实现功能模块（按 Spec 开关）
    认证 → 数据库 → 支付 → AI → 管理后台 → UI
          │
          ▼
    Step 5: 安全加固
    Rate Limiting + Input Validation + RLS + Audit Log
          │
          ▼
    Step 6: 配置环境变量
    （引导获取每个密钥）
          │
          ▼
    Step 7: 本地验证
    npm run build → npm run dev → 核对 10 项清单
          │
          ▼
    Step 8: 交接部署 → 触发 edgeone-pages-deploy
```

---

## 📊 与官方示例对比

| 维度 | 官方 `ai-saas-skill` | 本 `enterprise-ai-saas-skill` |
|------|---------------------|-------------------------------|
| 模板依赖 | 依赖 `saas-starter` 外部仓库 | 完全由 AI 从零生成，无外部依赖 |
| 安全层 | 无安全设计 | **5 层纵深防御**（借鉴 Claude Code）|
| AI 集成 | FAL/Fireworks 图像生成 | **MiniMax M2.7 对话 + 流式 SSE** |
| Edge 使用 | 仅基础部署 | **Edge Functions + KV + AI Gateway + Middleware** |
| 管理后台 | 简单 admin 页面 | **完整仪表盘**（用户管理 + 数据分析 + 系统配置）|
| References | 4 个文档 | **12 个文档**（共 5,868 行）|
| 支付安全 | 基础 Stripe | **Webhook 签名验证 + 幂等保护 + 订阅状态机** |
| TypeScript | 部分 | **全量 TypeScript strict mode** |

---

## 🎯 设计系统

- **主题**: 深色默认，亮色可切换，CSS 变量驱动
- **设计语言**: Glass-morphism（毛玻璃）+ 渐变 + 微动效
- **动效原则**: 克制精致 — 服务体验，不炫技
- **响应式**: 4 个断点 — 390px / 768px / 1024px / 1440px
- **无障碍**: WCAG AA 对比度，focus-visible，aria-label

---

## 🤝 贡献

欢迎提交 Issue 和 PR！这个 Skill 的目标是成为 WorkBuddy 生态中最完整的企业级 SaaS 启动模板。

---

## 📄 许可证

MIT License — 随意使用，商业友好。

---

## 🙏 致谢

- [WorkBuddy / CodeBuddy](https://www.codebuddy.cn) — AI 编程平台
- [Tencent EdgeOne](https://edgeone.ai) — 全球边缘部署
- [Supabase](https://supabase.com) — 开源数据库 + 认证
- [Stripe](https://stripe.com) — 支付基础设施
- [MiniMax](https://api.minimax.chat) — AI 模型服务
- Claude Code — 安全架构设计灵感

---

**Made with ❤️ for WorkBuddy × EdgeOne Pages AI Prompts + Skills 挑战赛**
