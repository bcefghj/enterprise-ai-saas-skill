# System Architecture Overview

This document describes the system architecture for a full-stack AI SaaS platform deployed on EdgeOne Pages. The platform delivers AI-powered content generation to end users through a subscription model, with Stripe handling payments, Supabase managing persistent data, and MiniMax M2.7 (via EdgeOne AI Gateway) providing the core AI capability.

---

## 1. Three-Layer Architecture

All requests flow through three distinct layers, each with a clear responsibility boundary.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│  EDGE LAYER — EdgeOne Edge Functions (V8 Isolate Runtime)   │
│  ┌──────────┐ ┌──────┐ ┌────────────┐ ┌─────────────────┐  │
│  │Rate Limit│ │ CORS │ │JWT Verify  │ │Input Sanitize   │  │
│  └────┬─────┘ └──┬───┘ └─────┬──────┘ └──────┬──────────┘  │
│       └──────────┴───────────┴───────────────┘              │
│                    EdgeOne KV                                │
│            (counters, session cache, flags)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │  Internal RPC
┌──────────────────────────▼──────────────────────────────────┐
│  CLOUD LAYER — EdgeOne Cloud Functions (Node.js 18+)        │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐   │
│  │Auth Svc  │ │Payment   │ │AI Service │ │User / Admin │   │
│  │          │ │(Stripe)  │ │(MiniMax)  │ │API          │   │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └──────┬──────┘   │
│       └─────────────┴─────────────┴──────────────┘          │
└──────────────────────────┬──────────────────────────────────┘
                           │  TCP / HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│  STORAGE LAYER                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │  EdgeOne KV         │  │  Supabase (PostgreSQL)       │  │
│  │  - session tokens   │  │  - users table               │  │
│  │  - rate-limit       │  │  - subscriptions table       │  │
│  │    counters         │  │  - usage_logs table          │  │
│  │  - feature flags    │  │  - ai_generations table      │  │
│  │  - response cache   │  │  - payments table            │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.1 Edge Layer — EdgeOne Edge Functions (V8)

Runs in V8 isolates at the CDN edge, sub-millisecond cold start. Handles cross-cutting concerns **before** any request reaches business logic:

| Concern            | Implementation                                      |
| ------------------ | --------------------------------------------------- |
| Rate Limiting      | Sliding-window counter stored in EdgeOne KV          |
| CORS               | Dynamic origin allowlist checked per request          |
| JWT Verification   | HS256/RS256 signature check; token payload injected into downstream headers |
| Input Sanitization | Body-size limits, XSS stripping, JSON schema validation |

Key file: `edge-functions/api/gateway.ts`

### 1.2 Cloud Layer — EdgeOne Cloud Functions (Node.js)

Standard Node.js runtime for business logic. Each service is an independent Cloud Function endpoint:

| Service         | Endpoint Prefix    | Responsibility                                        |
| --------------- | ------------------ | ----------------------------------------------------- |
| Auth Service    | `/api/auth/*`      | Login, register, password reset, session management    |
| Payment Service | `/api/payment/*`   | Stripe Checkout sessions, webhook handling, plan sync  |
| AI Service      | `/api/ai/*`        | Prompt routing to MiniMax M2.7 via AI Gateway, streaming response |
| User Service    | `/api/user/*`      | Profile CRUD, usage quota check, preference storage    |
| Admin API       | `/api/admin/*`     | User management, analytics, system config              |

### 1.3 Storage Layer

Two complementary stores optimized for different access patterns:

- **EdgeOne KV** — Ultra-low-latency key-value store co-located with edge/cloud functions. Used for ephemeral or high-read data: session tokens (TTL 24h), rate-limit sliding windows, cached AI responses, feature flags.
- **Supabase (PostgreSQL)** — Managed relational database with Row-Level Security (RLS). Stores durable business data: user profiles, subscription state, payment history, AI generation logs, usage metrics.

---

## 2. Tech Stack Rationale

| Technology                  | Why                                                                 |
| --------------------------- | ------------------------------------------------------------------- |
| **Next.js 14 App Router**   | SSR + streaming + edge-compatible rendering; React Server Components reduce client JS bundle |
| **TypeScript**              | End-to-end type safety from database types (generated by Supabase CLI) to API contracts to UI props |
| **Tailwind CSS + shadcn/ui**| Utility-first styling with pre-built, accessible component primitives — fast iteration without design-system overhead |
| **Motion (Framer Motion)**  | Declarative animation library; used for page transitions, skeleton loaders, and micro-interactions |
| **Supabase**                | Combines PostgreSQL, Auth, Realtime, and auto-generated REST/GraphQL APIs; RLS enforces per-user data isolation at the DB level |
| **Stripe**                  | Industry-standard payment processing; Checkout, Billing Portal, and webhooks handle the full subscription lifecycle |
| **MiniMax M2.7 via EdgeOne AI Gateway** | High-quality multilingual generation model; the AI Gateway adds token metering, retry, fallback, and request logging without custom infra |
| **EdgeOne Pages**           | Full-stack deployment target — static assets on CDN, Edge Functions at PoPs, Cloud Functions in the origin region, KV globally replicated |

---

## 3. Directory Structure

```
project-root/
├── src/
│   ├── app/                          # Next.js App Router — file-based routing
│   │   ├── (marketing)/              # Route group: public pages (no auth required)
│   │   │   ├── page.tsx              #   Landing / hero page
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx          #   Pricing plans with Stripe integration
│   │   │   ├── features/
│   │   │   │   └── page.tsx          #   Feature showcase
│   │   │   └── layout.tsx            #   Marketing layout (navbar + footer)
│   │   ├── (auth)/                   # Route group: authentication pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx          #   Login form (email + OAuth)
│   │   │   ├── register/
│   │   │   │   └── page.tsx          #   Registration form
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx          #   Password reset request
│   │   │   └── layout.tsx            #   Centered card layout
│   │   ├── dashboard/                # Protected: authenticated user area
│   │   │   ├── page.tsx              #   Dashboard home — usage summary
│   │   │   ├── generate/
│   │   │   │   └── page.tsx          #   AI generation playground
│   │   │   ├── history/
│   │   │   │   └── page.tsx          #   Past generations browser
│   │   │   ├── billing/
│   │   │   │   └── page.tsx          #   Subscription & invoices
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          #   User preferences
│   │   │   └── layout.tsx            #   Sidebar + topbar layout
│   │   ├── admin/                    # Protected: admin-only area
│   │   │   ├── page.tsx              #   Admin dashboard — KPIs
│   │   │   ├── users/
│   │   │   │   └── page.tsx          #   User management table
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx          #   Usage & revenue charts
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          #   System configuration
│   │   │   └── layout.tsx            #   Admin sidebar layout
│   │   ├── api/                      # Next.js Route Handlers (thin proxies to Cloud Functions)
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── webhooks/stripe/
│   │   │   └── ai/generate/
│   │   ├── layout.tsx                # Root layout — providers, fonts, metadata
│   │   └── globals.css               # Tailwind directives + CSS variables
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives (Button, Dialog, Card …)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Top navigation bar
│   │   │   ├── Sidebar.tsx           # Dashboard sidebar
│   │   │   ├── Footer.tsx            # Marketing footer
│   │   │   └── MobileNav.tsx         # Responsive drawer menu
│   │   ├── dashboard/
│   │   │   ├── UsageCard.tsx         # Quota usage ring chart
│   │   │   ├── GenerationForm.tsx    # AI prompt input + parameter controls
│   │   │   ├── ResultViewer.tsx      # Streaming AI output display
│   │   │   └── HistoryTable.tsx      # Paginated generation history
│   │   └── admin/
│   │       ├── UserTable.tsx         # Admin user management table
│   │       ├── RevenueChart.tsx      # MRR / churn visualization
│   │       └── SystemStatus.tsx      # Health check dashboard
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser Supabase client (anon key)
│   │   │   ├── server.ts            # Server-side Supabase client (service role)
│   │   │   ├── middleware.ts         # Supabase auth middleware helper
│   │   │   └── types.ts             # Auto-generated database types
│   │   ├── stripe/
│   │   │   ├── client.ts            # Stripe SDK initialization
│   │   │   ├── plans.ts             # Plan ID ↔ feature mapping
│   │   │   └── webhooks.ts          # Webhook signature verification + event routing
│   │   └── ai/
│   │       ├── client.ts            # MiniMax API client via AI Gateway
│   │       ├── prompts.ts           # System prompt templates
│   │       └── stream.ts            # SSE / ReadableStream helpers
│   ├── hooks/
│   │   ├── useUser.ts               # Current user + subscription state
│   │   ├── useUsage.ts              # Real-time usage quota tracking
│   │   └── useGeneration.ts         # AI generation with streaming state
│   └── types/
│       ├── database.ts              # Supabase-generated table types
│       ├── api.ts                   # API request/response contracts
│       └── subscription.ts          # Plan & feature flag types
├── edge-functions/                   # EdgeOne Edge Functions (V8)
│   └── api/
│       ├── gateway.ts               # Main entry: rate limit → CORS → JWT → sanitize → route
│       ├── rate-limiter.ts          # Sliding-window algorithm using EdgeOne KV
│       ├── jwt.ts                   # JWT decode + verify helpers
│       └── sanitize.ts              # Input validation schemas
├── cloud-functions/                  # EdgeOne Cloud Functions (Node.js)
│   └── api/
│       ├── auth.ts                  # Register, login, refresh, logout
│       ├── payment.ts               # Stripe Checkout, portal, webhook receiver
│       ├── ai.ts                    # Prompt → MiniMax M2.7 → streamed response
│       ├── user.ts                  # Profile CRUD, quota enforcement
│       └── admin.ts                 # Admin-only data endpoints
├── middleware.ts                     # Next.js / EdgeOne middleware — auth redirect + locale detection
├── public/                           # Static assets served from CDN
│   ├── og/                          # Open Graph images
│   └── icons/                       # Favicons + PWA icons
├── dictionaries/                     # i18n JSON translation files
│   ├── en.json
│   └── zh.json
└── database/
    ├── schema.sql                   # Table definitions + RLS policies
    ├── seed.sql                     # Dev seed data
    └── migrations/                  # Incremental migration scripts
```

---

## 4. Request Flow

A typical authenticated AI-generation request travels through the system as follows:

```
Browser                    Edge Layer                 Cloud Layer               Storage Layer
  │                            │                          │                         │
  │  POST /api/ai/generate     │                          │                         │
  ├───────────────────────────►│                          │                         │
  │                            │ 1. Rate-limit check      │                         │
  │                            │    (EdgeOne KV counter)   │                         │
  │                            │ 2. CORS validation        │                         │
  │                            │ 3. JWT verification       │                         │
  │                            │ 4. Input sanitization     │                         │
  │                            │                          │                         │
  │                            │  Forwarded request       │                         │
  │                            │  (+ X-User-Id header)    │                         │
  │                            ├─────────────────────────►│                         │
  │                            │                          │ 5. Load user plan       │
  │                            │                          ├────────────────────────►│
  │                            │                          │◄────────────────────────┤
  │                            │                          │ 6. Check quota          │
  │                            │                          │ 7. Call MiniMax M2.7    │
  │                            │                          │    via AI Gateway       │
  │                            │                          │ 8. Stream response      │
  │   SSE stream               │◄─────────────────────────┤                         │
  │◄───────────────────────────┤                          │ 9. Log usage            │
  │                            │                          ├────────────────────────►│
  │                            │                          │                         │
```

**Step-by-step:**

1. **Rate Limit** — Edge Function reads the sliding-window counter for this user from EdgeOne KV. If the limit is exceeded, return `429 Too Many Requests` immediately.
2. **CORS** — Validate the `Origin` header against the allowlist; set appropriate `Access-Control-*` headers.
3. **JWT Verify** — Decode the `Authorization: Bearer <token>`, verify signature and expiry. Extract `user_id` and `role`, inject as `X-User-Id` / `X-User-Role` headers.
4. **Sanitize** — Validate the JSON body against the endpoint schema; strip HTML tags, enforce max prompt length.
5. **Load User Plan** — Cloud Function queries Supabase for the user's active subscription and current-period usage count.
6. **Quota Check** — Compare usage against plan limits. Return `402 Payment Required` if exhausted.
7. **AI Call** — Forward the sanitized prompt to MiniMax M2.7 through EdgeOne AI Gateway. The gateway handles retries, token counting, and model fallback.
8. **Stream** — Pipe the model's streaming response back to the client as Server-Sent Events (SSE).
9. **Log** — After the stream completes, write a usage log entry to Supabase (`ai_generations` + increment `usage_logs`).

---

## 5. Security Boundaries

Each layer enforces a distinct set of security controls. A compromised layer does not automatically grant access to the layers below it.

### Edge Layer (Untrusted → Semi-trusted boundary)

- **DDoS / abuse mitigation** — Rate limiting happens before any compute-heavy work.
- **Identity verification** — JWT is verified at the edge; unsigned or expired tokens are rejected with `401`.
- **Input validation** — Malformed or oversized payloads never reach the Cloud Layer.
- **No direct storage access** — Edge Functions can only read/write EdgeOne KV (ephemeral data). They cannot query Supabase directly.

### Cloud Layer (Semi-trusted → Trusted boundary)

- **Role-based access control** — Cloud Functions check `X-User-Role` before executing admin operations. The header is set exclusively by the Edge Layer and cannot be spoofed by clients.
- **Row-Level Security** — All Supabase queries run through the authenticated client, so RLS policies enforce per-user data isolation even if application code has a bug.
- **Secret isolation** — Stripe secret key, Supabase service-role key, and MiniMax API key are environment variables available only to Cloud Functions, never exposed to the edge or client.
- **Webhook verification** — Stripe webhooks are verified via `stripe.webhooks.constructEvent` before processing.

### Storage Layer (Trusted → Data boundary)

- **RLS policies** — Every table has `USING (auth.uid() = user_id)` policies; even the service-role client uses scoped queries as a defense-in-depth measure.
- **Encryption at rest** — Supabase encrypts all data at rest (AES-256). EdgeOne KV values are encrypted in transit and at rest.
- **Backup & point-in-time recovery** — Supabase provides daily backups and WAL-based PITR for the PostgreSQL database.
- **KV TTL enforcement** — All EdgeOne KV entries are written with explicit TTLs to prevent stale data accumulation and reduce the blast radius of a leaked session token.

---

## Appendix: Key Environment Variables

| Variable                     | Layer | Purpose                              |
| ---------------------------- | ----- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`   | Client / Edge | Supabase project URL          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client    | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY`  | Cloud | Supabase admin key (server-only)     |
| `STRIPE_SECRET_KEY`          | Cloud | Stripe API secret                    |
| `STRIPE_WEBHOOK_SECRET`      | Cloud | Stripe webhook signing secret        |
| `MINIMAX_API_KEY`            | Cloud | MiniMax M2.7 API key                 |
| `EDGEONE_KV_NAMESPACE`       | Edge / Cloud | KV binding identifier         |
| `JWT_SECRET`                 | Edge  | Shared secret for JWT verification   |
