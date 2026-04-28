# AiFlow - Enterprise AI SaaS Template

> WorkBuddy x Tencent EdgeOne AI Prompts + Skills 挑战赛 — Skills 赛道参赛作品

一句话生成企业级 AI SaaS 全栈网站，部署到 EdgeOne Pages。

## 在线演示

- **展示站**: [待部署]
- **Skill 仓库**: [enterprise-ai-saas-skill](../enterprise-ai-saas-skill/)

## 功能特性

### 完整的 SaaS 功能
- **用户认证**: Supabase Auth + JWT + 基于角色的访问控制 (RBAC)
- **订阅支付**: Stripe 集成，Free / Pro / Enterprise 三档订阅
- **AI 对话**: MiniMax M2.7 via EdgeOne AI Gateway，流式输出
- **管理后台**: 用户管理 + 数据分析 + 系统配置
- **国际化**: 支持中文和英文

### 5 层安全架构
借鉴 Claude Code 的安全设计理念：
1. **Edge 入口防护**: Rate Limiting (KV) + CORS + CSP + 安全头
2. **认证鉴权**: JWT 验证 (Edge Function) + 角色检查
3. **输入验证**: Zod Schema + XSS 防护 + SQL 注入防御
4. **业务安全**: Webhook 签名验证 + 幂等保护 + CSRF
5. **数据安全**: Supabase RLS + 审计日志

### EdgeOne 全栈能力深度使用
- **Edge Functions**: 安全中间件、JWT 验证、Rate Limiting
- **Cloud Functions**: API 端点、Stripe Webhook、AI Gateway 调用
- **KV Storage**: 会话缓存、速率限制计数、幂等键
- **AI Gateway**: MiniMax M2.7 模型接入
- **全球 CDN**: 3200+ 边缘节点加速

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Motion |
| 后端 | EdgeOne Cloud Functions (Node.js) + Edge Functions (V8) |
| 存储 | EdgeOne KV + Supabase PostgreSQL |
| 支付 | Stripe Subscriptions + Webhooks |
| AI | MiniMax M2.7 via EdgeOne AI Gateway (SSE) |
| 认证 | Supabase Auth + JWT + RBAC |
| 部署 | EdgeOne Pages |

## 页面路由

| 路由 | 说明 | 权限 |
|------|------|------|
| `/` | 营销首页 | 公开 |
| `/pricing` | 订阅方案 | 公开 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/dashboard` | AI 工作台 | 登录 |
| `/dashboard/chat` | AI 对话 | 登录 |
| `/dashboard/settings` | 用户设置 | 登录 |
| `/admin` | 管理后台 | 管理员 |
| `/admin/users` | 用户管理 | 管理员 |
| `/admin/analytics` | 数据分析 | 管理员 |
| `/admin/settings` | 系统配置 | 管理员 |

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的密钥

# 启动开发服务器
npm run dev

# 构建
npm run build

# 部署到 EdgeOne Pages
npx edgeone pages deploy
```

## 环境变量

| 变量 | 说明 | 获取位置 |
|------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | Supabase 控制台 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公开密钥 | Supabase 控制台 |
| `STRIPE_SECRET_KEY` | Stripe 密钥 | Stripe Dashboard |
| `MINIMAX_API_KEY` | MiniMax API 密钥 | MiniMax 平台 |
| `EDGEONE_AI_GATEWAY_KEY` | EdgeOne AI 网关密钥 | EdgeOne 控制台 |

完整列表见 `.env.example`。

## 项目结构

```
ai-saas-template/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── (auth)/             # 认证页面
│   │   ├── dashboard/          # 用户仪表盘
│   │   ├── admin/              # 管理后台
│   │   └── pricing/            # 定价页面
│   ├── components/             # React 组件
│   │   ├── ui/                 # 基础 UI 组件
│   │   └── layout/             # 布局组件
│   ├── lib/                    # 工具库
│   │   └── supabase/           # Supabase 客户端
│   ├── hooks/                  # React Hooks
│   └── types/                  # TypeScript 类型
├── edge-functions/             # EdgeOne Edge Functions
├── cloud-functions/            # EdgeOne Cloud Functions
├── database/                   # 数据库初始化脚本
└── edgeone.json               # EdgeOne Pages 配置
```

## 设计系统

- **主题**: 深色主题为默认，支持亮色切换
- **设计语言**: Glass-morphism + 渐变 + 微动效
- **响应式**: 4 个断点 (390px / 768px / 1024px / 1440px)
- **动效**: Motion (Framer Motion) — 克制但精致
- **无障碍**: WCAG AA 对比度标准

## 许可证

MIT

---

**Made for WorkBuddy x Tencent EdgeOne AI Prompts + Skills 挑战赛**
