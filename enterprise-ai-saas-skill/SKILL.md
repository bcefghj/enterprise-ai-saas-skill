---
name: enterprise-ai-saas
description: >-
  This skill scaffolds and builds a production-ready, enterprise-grade AI SaaS website with
  authentication (Supabase Auth + JWT + RBAC), subscription payments (Stripe), AI chat
  (MiniMax M2.7 via EdgeOne AI Gateway with streaming), admin dashboard, and a 5-layer
  security architecture — all deployed to EdgeOne Pages using Edge Functions, Cloud Functions,
  KV Storage, and Middleware.
  It should be used when the user wants to build a full-stack AI SaaS platform from scratch — e.g.
  "build an AI SaaS", "create an AI assistant platform", "scaffold a SaaS with login and payment",
  "帮我搭一个 AI SaaS", "做一个带登录支付的 AI 平台", "搭建企业级 AI 工具站",
  "create a subscription-based AI tool", "build a full-stack SaaS with admin dashboard".
  Do NOT trigger when the user already has a running project and only wants to add a single
  function/API (use edgeone-pages-dev).
  Do NOT trigger for pure deployment of an existing project (use edgeone-pages-deploy).
  Do NOT trigger for simple static sites, portfolios, or landing pages without SaaS features.
metadata:
  author: enterprise-ai-saas
  version: "1.0.0"
---

# Enterprise AI SaaS Scaffolding Skill

Build a complete, enterprise-grade AI SaaS platform on **EdgeOne Pages** — from zero to production with one command.

Generated websites include: user authentication, subscription payments, AI chat with streaming, admin dashboard, and multi-layer security — all leveraging EdgeOne's full-stack capabilities.

## When to use this skill

- User wants to **start a new AI SaaS** (AI assistant, AI tool, AI chatbot platform, etc.)
- User wants a full-stack platform with **login + payment + AI + admin dashboard**
- User mentions enterprise features like **security, RBAC, rate limiting, audit logging**
- User wants to build on **EdgeOne Pages** with Edge Functions, KV, and Cloud Functions

**Do NOT use for:**
- Adding a single API/function to an existing project → use `edgeone-pages-dev`
- Deploying an already-built project → use `edgeone-pages-deploy`
- Simple static sites, blogs, portfolios, or landing pages without SaaS features
- Non-SaaS e-commerce sites (use a dedicated e-commerce skill)

## How to use this skill (for the coding agent)

Follow the **Main Flow** below top-to-bottom. Load `references/*.md` **only when the flow tells you to** — do NOT preload everything. This skill uses progressive disclosure to minimize context usage.

---

## ⛔ Critical Rules (never skip)

1. **ALWAYS ask the user about their Prompt FIRST** (Step 1). This is the mandatory entry gate.
2. **Never fabricate the user's product.** If info is missing and the user has no Prompt, run the built-in questionnaire in `references/user-prompt-intake.md`.
3. **Generate all code from scratch** — this skill does NOT depend on any external template repository. All project files are generated directly by the agent following the patterns in `references/`.
4. **TypeScript everywhere.** Never generate plain JavaScript files. All `.ts` / `.tsx` only.
5. **Never commit secrets.** Ensure `.env.local`, `.edgeone/.token`, and any API key files are in `.gitignore`.
6. **Security is not optional.** Always implement at least the base security layer (rate limiting + input validation + CORS) regardless of the user's `security.level` choice.
7. **DO NOT deploy inside this skill.** Deployment belongs to `edgeone-pages-deploy`. In Step 8, verify the deploy skill is available and hand off.
8. **Test before handoff.** Always run `npm run build` successfully before proceeding to Step 8.
9. **Confirm destructive operations** (removing modules, changing config) before executing.
10. **Install `edgeone-pages-skills` at the start** — this is a competition requirement. Run `npx skills add TencentEdgeOne/edgeone-pages-skills` during project scaffold.

---

## Main Flow

### Step 1 — Gate Question: does the user have a Prompt?

**This is mandatory and happens FIRST.** Ask the user:

> 开始之前先问一下：你有没有自己准备好的产品描述 / Prompt？
>
> - **有** — 贴进来，我会据此定位品牌 / 功能 / 配色 / 安全等级
> - **没有** — 我会用内置问答引导你，问几个关键问题
> - **完全默认** — 直接按默认规格（AI 助手平台，深蓝主题，中英双语，企业级安全）落地

Branch:
- User provides a Prompt → **read `references/user-prompt-intake.md` § "Prompt 解析"** and extract a Spec
- User chooses questionnaire → **read `references/user-prompt-intake.md` § "内置问答"** and run through questions
- User chooses default → use default Spec from `references/user-prompt-intake.md` § "默认规格"

Output: a **Spec object**. Show it to the user and confirm before proceeding.

---

### Step 2 — Spec Confirmation

Display the full Spec to the user in a JSON code block. Validate dependency rules:
- `features.payment = true` ⟹ `features.auth = true`
- `features.aiChat = true` ⟹ `features.auth = true`
- `features.adminDashboard = true` ⟹ `features.auth = true`
- `security.level = "enterprise"` ⟹ all security features enabled

Ask for final confirmation. Proceed only after the user says go.

---

### Step 3 — Project Scaffold

Read **`references/project-scaffold.md`** and follow it to:
1. Create the project directory
2. Initialize `package.json` with all dependencies
3. Generate the complete directory structure (see architecture in `references/architecture-overview.md`)
4. Install `edgeone-pages-skills`: `npx skills add TencentEdgeOne/edgeone-pages-skills`
5. Install dependencies: `npm install`
6. Verify directory structure matches expected layout

---

### Step 4 — Core Features Implementation

Implement features based on the Spec, loading references as needed:

| Feature | Condition | Reference |
|---------|-----------|-----------|
| Authentication (Supabase + JWT + RBAC) | `features.auth = true` | [references/auth-system.md](references/auth-system.md) |
| Subscription Payments (Stripe) | `features.payment = true` | [references/payment-stripe.md](references/payment-stripe.md) |
| AI Chat (MiniMax M2.7 via EdgeOne AI Gateway) | `features.aiChat = true` | [references/ai-integration.md](references/ai-integration.md) |
| Admin Dashboard | `features.adminDashboard = true` | [references/admin-dashboard.md](references/admin-dashboard.md) |
| UI Design System | Always | [references/ui-design-system.md](references/ui-design-system.md) |
| Database Schema | `features.auth = true` | [references/database-schema.md](references/database-schema.md) |

Implementation order: Auth → Database → Payment → AI → Admin → UI polish.

Report progress after each module. If a module fails to build, diagnose and fix before moving on.

---

### Step 5 — Security Hardening

Read **`references/security-hardening.md`** and implement the security layers based on `security.level`:

| Layer | Level: basic | Level: enterprise |
|-------|-------------|-------------------|
| Rate Limiting (Edge Function + KV) | ✅ IP-based | ✅ IP + User + Endpoint |
| CORS + CSP Headers | ✅ Basic | ✅ Strict whitelist |
| Input Validation (Zod) | ✅ API inputs | ✅ All inputs + file uploads |
| JWT Verification (Edge) | ✅ Token check | ✅ Token + Role + Expiry |
| Stripe Webhook Signature | ✅ Basic verify | ✅ Verify + Idempotency |
| Supabase RLS | ✅ Row-level | ✅ Row-level + Column-level |
| Audit Logging | ❌ | ✅ All mutations logged |
| CSRF Protection | ❌ | ✅ Double-submit cookie |

Also read **`references/edge-kv-patterns.md`** for EdgeOne-specific implementation patterns.

---

### Step 6 — Environment Variables

Read **`references/deployment-handoff.md` § "Environment Variables"** and:
1. Generate `.env.example` with all required keys (no real values)
2. Create `.env.local` from `.env.example`
3. Based on enabled features, produce a **filtered env list**
4. Guide the user to obtain each key from the respective dashboards:
   - Supabase: Project URL, Anon Key, Service Role Key
   - Stripe: Secret Key, Webhook Secret, Price IDs
   - MiniMax: API Key (via EdgeOne AI Gateway)
   - EdgeOne: AI Gateway Key, Gateway Name
5. Write collected values into `.env.local`

---

### Step 7 — Local Verification

Run build and local dev:

```bash
npm run build          # Must succeed with zero errors
npm run dev            # Start on http://localhost:3000
```

Ask the user to verify:
- [ ] Homepage renders with correct branding
- [ ] Login / Register works (if Supabase env configured)
- [ ] Pricing page shows subscription plans
- [ ] AI chat produces streaming responses (if MiniMax key configured)
- [ ] Admin dashboard accessible only to admin role
- [ ] Rate limiting returns 429 after threshold
- [ ] Mobile layout renders correctly

If something breaks, diagnose:
- Missing env var → check `.env.local`
- Build error → fix TypeScript/import issues
- Supabase error → check schema initialization
- AI error → verify EdgeOne AI Gateway configuration

---

### Step 8 — Deployment Handoff

**8.1 Pre-check: is `edgeone-pages-deploy` installed?**

Check if the deploy skill exists:
- macOS/Linux: `~/.codebuddy/skills/edgeone-pages-deploy/`
- Or check via the IDE's skill management

**8.2 If installed** — tell the user:

> ✅ 项目已就绪，本地验证通过。
>
> 直接告诉我 **"部署到 EdgeOne Pages"**，我会加载 `edgeone-pages-deploy` skill 完成上线。

**8.3 If not installed** — guide installation:

> ⚠️ 检测到 deploy skill 未安装。运行以下命令安装：
>
> ```bash
> npx skills add TencentEdgeOne/edgeone-pages-skills
> ```
>
> 安装完成后告诉我，我来继续部署流程。

**DO NOT** execute deployment commands inside this skill.

---

## Routing

| Step | When to load | Reference |
|------|-------------|-----------|
| Step 1 — User intent + Spec extraction | Always (first step) | [references/user-prompt-intake.md](references/user-prompt-intake.md) |
| Step 3 — Project structure + dependencies | After Spec confirmed | [references/project-scaffold.md](references/project-scaffold.md) |
| Step 3 — Architecture decisions | After Spec confirmed | [references/architecture-overview.md](references/architecture-overview.md) |
| Step 4 — Authentication | `features.auth = true` | [references/auth-system.md](references/auth-system.md) |
| Step 4 — Payments | `features.payment = true` | [references/payment-stripe.md](references/payment-stripe.md) |
| Step 4 — AI integration | `features.aiChat = true` | [references/ai-integration.md](references/ai-integration.md) |
| Step 4 — Admin dashboard | `features.adminDashboard = true` | [references/admin-dashboard.md](references/admin-dashboard.md) |
| Step 4 — UI components | Always | [references/ui-design-system.md](references/ui-design-system.md) |
| Step 4 — Database schema | `features.auth = true` | [references/database-schema.md](references/database-schema.md) |
| Step 5 — Security implementation | Always | [references/security-hardening.md](references/security-hardening.md) |
| Step 5 — Edge + KV patterns | Always | [references/edge-kv-patterns.md](references/edge-kv-patterns.md) |
| Step 8 — Build verification + deploy handoff | After all features done | [references/deployment-handoff.md](references/deployment-handoff.md) |

---

## Generated Website Pages

The skill produces a complete website with these routes:

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Marketing landing page (Hero, Features, Pricing, Testimonials, CTA) | No |
| `/login` | Login page (Email + OAuth) | No |
| `/register` | Registration page | No |
| `/pricing` | Subscription plans (Free / Pro / Enterprise) | No |
| `/dashboard` | User dashboard (AI workspace + usage stats) | Yes |
| `/dashboard/chat` | AI chat interface (streaming responses) | Yes |
| `/dashboard/settings` | User profile and preferences | Yes |
| `/admin` | Admin overview (requires `admin` role) | Yes (admin) |
| `/admin/users` | User management | Yes (admin) |
| `/admin/analytics` | Usage analytics and metrics | Yes (admin) |
| `/admin/settings` | System configuration | Yes (admin) |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Motion (Framer Motion)
- **Backend**: EdgeOne Cloud Functions (Node.js) + Edge Functions (V8)
- **Storage**: EdgeOne KV (sessions, cache, rate limiting) + Supabase (PostgreSQL)
- **Payments**: Stripe Subscriptions + Webhooks
- **AI**: MiniMax M2.7 via EdgeOne AI Gateway (streaming SSE)
- **Auth**: Supabase Auth + JWT + RBAC Middleware
- **Deploy**: EdgeOne Pages

---

## Quick Reference

**Install this skill:**
```bash
npx skills add enterprise-ai-saas-skill
```

**Trigger phrases:**
- "build an AI SaaS on EdgeOne Pages"
- "scaffold an enterprise AI platform"
- "帮我搭一个带登录支付的 AI SaaS"
- "create a full-stack AI assistant platform"
- "做一个企业级 AI 工具站部署到 EdgeOne Pages"

**Hand-off to deploy:** user says "deploy to EdgeOne Pages" / "部署到 EdgeOne Pages"
