# Step 6–8: 环境变量、本地验证与部署交接

本文档涵盖 enterprise-ai-saas-skill 的最后三个步骤：环境变量配置、本地验证清单、以及部署交接流程。

---

## Step 6: 环境变量

### 完整变量清单

```bash
# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=          # Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key（仅服务端使用）
SUPABASE_JWT_SECRET=               # JWT secret，用于 Edge Function 验证

# ── Stripe ──
STRIPE_SECRET_KEY=                 # Stripe 密钥
STRIPE_WEBHOOK_SECRET=             # Stripe Webhook 签名密钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # Stripe 可公开密钥
STRIPE_PRICE_PRO=                  # Pro 计划的 Stripe Price ID
STRIPE_PRICE_ENTERPRISE=           # Enterprise 计划的 Stripe Price ID

# ── MiniMax AI (via EdgeOne AI Gateway) ──
MINIMAX_API_KEY=                   # MiniMax API 密钥
EDGEONE_AI_GATEWAY_KEY=            # EdgeOne AI Gateway 密钥
EDGEONE_GATEWAY_NAME=              # EdgeOne Gateway 名称

# ── App ──
NEXT_PUBLIC_APP_URL=               # 应用的公开 URL
ADMIN_EMAILS=                      # 管理员邮箱，逗号分隔
```

### 获取方式详解

#### Supabase 变量

| 变量 | 获取位置 | 步骤 | 是否必须 |
|------|---------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | 复制 Project URL | **必须** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | 复制 `anon` `public` key | **必须** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | 复制 `service_role` key（点击 Reveal） | **必须** |
| `SUPABASE_JWT_SECRET` | Supabase Dashboard → Settings → API → JWT Settings | 复制 JWT Secret | 可选（仅 Edge Function 鉴权需要） |

#### Stripe 变量

| 变量 | 获取位置 | 步骤 | 是否必须 |
|------|---------|------|---------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | 复制 Secret key（以 `sk_test_` 或 `sk_live_` 开头） | **必须**（启用付费时） |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks | 创建 Endpoint 后复制 Signing secret（以 `whsec_` 开头） | **必须**（启用付费时） |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys | 复制 Publishable key（以 `pk_test_` 或 `pk_live_` 开头） | **必须**（启用付费时） |
| `STRIPE_PRICE_PRO` | Stripe Dashboard → Products → 选择 Pro 产品 | 复制 Price ID（以 `price_` 开头） | **必须**（启用付费时） |
| `STRIPE_PRICE_ENTERPRISE` | Stripe Dashboard → Products → 选择 Enterprise 产品 | 复制 Price ID（以 `price_` 开头） | 可选（无 Enterprise 计划则跳过） |

#### MiniMax / EdgeOne AI 变量

| 变量 | 获取位置 | 步骤 | 是否必须 |
|------|---------|------|---------|
| `MINIMAX_API_KEY` | MiniMax 开放平台 → API Keys | 创建并复制 API Key | **必须**（启用 AI 时） |
| `EDGEONE_AI_GATEWAY_KEY` | EdgeOne 控制台 → AI Gateway | 创建 Gateway 后复制 Key | **必须**（启用 AI 时） |
| `EDGEONE_GATEWAY_NAME` | EdgeOne 控制台 → AI Gateway | 复制 Gateway 名称 | **必须**（启用 AI 时） |

#### App 变量

| 变量 | 获取位置 | 步骤 | 是否必须 |
|------|---------|------|---------|
| `NEXT_PUBLIC_APP_URL` | 自定义 | 本地使用 `http://localhost:3000`，生产使用实际域名 | **必须** |
| `ADMIN_EMAILS` | 自定义 | 填写管理员邮箱，多个用逗号分隔 | 可选（无管理后台则跳过） |

### 按功能过滤

根据用户在 Step 1 中选择的功能，只需配置对应的变量：

| 功能模块 | 所需变量 |
|---------|---------|
| **核心（始终必须）** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` |
| **认证系统** | 核心变量即可（OAuth 在 Supabase Dashboard 中配置） |
| **付费订阅** | 核心 + 所有 `STRIPE_*` 变量 |
| **AI 对话** | 核心 + `MINIMAX_API_KEY`, `EDGEONE_AI_GATEWAY_KEY`, `EDGEONE_GATEWAY_NAME` |
| **管理后台** | 核心 + `ADMIN_EMAILS` |
| **Edge Function 鉴权** | 核心 + `SUPABASE_JWT_SECRET` |

### .env.example 模板

Skill 在生成项目时应自动创建 `.env.example`：

```bash
# ============================================
# Enterprise AI SaaS — 环境变量模板
# 复制此文件为 .env.local 并填入实际值
# cp .env.example .env.local
# ============================================

# ── Supabase（必须） ──
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── Supabase JWT（可选，Edge Function 鉴权时需要） ──
SUPABASE_JWT_SECRET=

# ── Stripe（启用付费订阅时需要） ──
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PRO=
STRIPE_PRICE_ENTERPRISE=

# ── MiniMax AI / EdgeOne（启用 AI 对话时需要） ──
MINIMAX_API_KEY=
EDGEONE_AI_GATEWAY_KEY=
EDGEONE_GATEWAY_NAME=

# ── App ──
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=
```

---

## Step 7: 本地验证

### 构建与启动

```bash
npm run build    # 必须成功通过，无编译错误
npm run dev      # 启动开发服务器
```

### 验证清单

按顺序逐项检查，全部通过后方可进入部署阶段：

- [ ] **首页渲染** — 访问 `http://localhost:3000`，页面正常加载
- [ ] **登录/注册** — 邮箱注册、登录流程正常
- [ ] **OAuth 回调** — Google/GitHub 等社交登录回调正常（需在 Supabase 中配置）
- [ ] **定价页展示** — `/pricing` 正确展示 Free / Pro / Enterprise 计划
- [ ] **Stripe Checkout** — 点击订阅后正确跳转到 Stripe 测试支付页面
- [ ] **AI 对话流式响应** — 发送消息后 AI 逐字流式返回
- [ ] **管理后台** — 管理员用户可访问 `/admin`，数据正常加载
- [ ] **速率限制** — 快速连续请求触发 429 Too Many Requests
- [ ] **移动端响应式** — 浏览器切换移动视口，布局自适应
- [ ] **深色/浅色主题** — 主题切换按钮正常工作

---

## 常见问题与修复

### 1. 构建错误：缺少导入

**症状**：`npm run build` 报 `Module not found` 或 `Cannot resolve`。

**原因**：移除某功能模块后，其他文件仍引用了已删除的组件/工具函数。

**修复**：检查错误信息中的文件路径，移除或替换无效的 import 语句。Skill 在裁剪模块时应自动清理依赖引用。

### 2. Supabase 连接失败

**症状**：页面白屏或控制台报 `Failed to fetch` / `Invalid API key`。

**修复**：
- 确认 `NEXT_PUBLIC_SUPABASE_URL` 格式为 `https://xxxxx.supabase.co`
- 确认 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已正确复制（无多余空格）
- 检查 Supabase 项目是否处于 Active 状态

### 3. Stripe Webhook 签名验证失败

**症状**：Webhook 请求返回 400，日志显示 `Webhook signature verification failed`。

**修复**：
- 确认 `STRIPE_WEBHOOK_SECRET` 以 `whsec_` 开头
- 本地测试时使用 `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- 确认 Webhook Endpoint URL 与实际路由一致

### 4. AI Gateway 请求失败

**症状**：AI 对话无响应或返回 401/403。

**修复**：
- 确认 `EDGEONE_AI_GATEWAY_KEY` 和 `EDGEONE_GATEWAY_NAME` 正确
- 检查请求 Header 中 `Authorization` 格式为 `Bearer <key>`
- 确认 MiniMax 模型名称拼写正确（如 `MiniMax-Text-01`）

### 5. CORS 错误

**症状**：浏览器控制台报 `Access-Control-Allow-Origin` 错误。

**修复**：
- 检查 Supabase Edge Function 的 CORS 配置，确保允许 `NEXT_PUBLIC_APP_URL`
- 确认 Edge Function 返回了正确的 `Access-Control-Allow-Headers`

---

## Step 8: 部署交接

### 前置检查

部署前确认：

1. **本地验证清单全部通过**
2. **`.env.local` 中的值已替换为生产环境值**（特别是 Stripe 使用 `live` 模式密钥）
3. **检查是否已安装 `edgeone-pages-deploy` skill**

### 部署流程

#### 情况 A：已安装 edgeone-pages-deploy skill

直接告知用户：

> 项目已准备就绪，请输入 **"deploy to EdgeOne Pages"** 启动部署流程。

Skill 将自动处理构建、上传与域名绑定。

#### 情况 B：未安装 edgeone-pages-deploy skill

引导用户安装：

```bash
# 1. 确认 skill 目录
ls ~/.cursor/skills/edgeone-pages-deploy/SKILL.md

# 2. 如不存在，参考 EdgeOne Pages 文档安装对应 skill
#    或手动执行以下部署步骤：
npm run build
# 将 .next 产物上传至 EdgeOne Pages
```

### 部署后验证

部署成功后，使用生产 URL 重新执行验证清单中的关键项：

- [ ] 首页可访问
- [ ] 登录/注册正常
- [ ] Stripe 支付流程（使用测试卡 `4242 4242 4242 4242`）
- [ ] AI 对话正常
- [ ] HTTPS 证书有效

### 自定义域名（可选）

1. 在 EdgeOne 控制台 → 站点管理 → 添加域名
2. 按提示配置 DNS CNAME 记录
3. 等待 SSL 证书自动签发
4. 更新 `NEXT_PUBLIC_APP_URL` 为新域名

### EdgeOne WAF 配置（可选）

建议开启以下防护规则：

- **CC 攻击防护**：限制单 IP 请求频率
- **SQL 注入 / XSS 防护**：启用托管规则集
- **Bot 管理**：屏蔽恶意爬虫
- **自定义规则**：对 `/api/*` 路径设置额外频率限制

---

## 部署后任务

### 必须完成

1. **更新 Stripe Webhook URL** — 登录 Stripe Dashboard → Developers → Webhooks → 将 Endpoint URL 更新为 `https://your-domain.com/api/webhooks/stripe`
2. **更新 `NEXT_PUBLIC_APP_URL`** — 在 EdgeOne Pages 环境变量中设置为生产域名
3. **端到端支付测试** — 使用 Stripe 测试卡完成完整订阅流程，确认 Webhook 正常触发
4. **监控错误日志** — 在 EdgeOne 控制台 → 日志服务中查看运行时错误

### 建议完成

5. **配置告警** — 设置错误率 > 1% 时的邮件/Webhook 告警
6. **启用访问日志分析** — 了解用户访问模式与地域分布
7. **定期轮换密钥** — 每 90 天更新一次 `SUPABASE_SERVICE_ROLE_KEY` 和 `STRIPE_SECRET_KEY`
8. **备份数据库** — 确认 Supabase 自动备份已启用，或配置自定义备份策略
