# WorkBuddy x EdgeOne AI Prompts + Skills 挑战赛 — 参赛作品

本仓库包含两个独立赛道的参赛作品。

## 赛道一：Skills 赛道

### `enterprise-ai-saas-skill/`
一句话生成企业级 AI SaaS 全栈网站的 Skill — 含认证、订阅支付、AI 对话、管理后台、5 层安全防护。

- **SKILL.md**: 8 步主流程 + 三分支入口 + 路由表
- **12 个 references/**: 覆盖架构、认证、支付、AI、安全、UI、数据库、部署等
- **安全架构**: 借鉴 Claude Code 的 5 层纵深防御

### `ai-saas-template/`
Skill 生成的完整项目示例（Next.js 14 + TypeScript + Tailwind + EdgeOne Pages）。

- 15 个路由页面 (首页 / 登录 / 注册 / 定价 / 仪表盘 / 聊天 / 设置 / 管理后台)
- Edge Functions + Cloud Functions + KV Storage
- MiniMax M2.7 via EdgeOne AI Gateway
- Stripe 订阅支付
- Supabase 认证 + 数据库

## 赛道二：Prompts 赛道

### `prompts/`
高质量结构化 Prompt — AI Agent 指挥中心，赛博朋克风格的 AI Agent 管理仪表盘。

- 500+ 行精确到 CSS 变量、动效参数、断点行为的 Prompt
- 5 个 Edge Function API 端点
- 完整的响应式设计规范

## 传播内容

### `social-media/`
- 掘金深度技术文章
- B 站演示视频脚本
- 小红书截图文案
- 知乎专栏文章

## 技术亮点

| 特性 | 说明 |
|------|------|
| **5 层安全架构** | 借鉴 Claude Code: Edge Rate Limit → JWT Auth → Input Validation → Business Security → Data RLS |
| **EdgeOne 全栈** | Edge Functions + Cloud Functions + KV + AI Gateway + Middleware |
| **MiniMax M2.7** | 流式 AI 对话，通过 EdgeOne AI Gateway 接入 |
| **Stripe** | 订阅计费 + Webhook + 幂等保护 |
| **企业级** | RBAC 权限 + 审计日志 + 多租户隔离 + i18n |

## 快速体验

```bash
# Skills 赛道 — 安装 Skill
cd enterprise-ai-saas-skill
# 在 WorkBuddy 中输入: "帮我搭一个 AI SaaS 平台"

# 示例项目 — 本地运行
cd ai-saas-template
npm install
npm run dev
```

## 许可证

MIT
