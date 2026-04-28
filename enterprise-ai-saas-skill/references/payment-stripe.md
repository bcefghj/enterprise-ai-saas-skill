# Stripe Subscription Payment Integration

Enterprise AI SaaS 在 EdgeOne Pages 上的 Stripe 订阅支付集成方案。

---

## 1. Subscription Model

| Feature | Free | Pro ($19/mo) | Enterprise ($49/mo) |
|---|---|---|---|
| AI Chats | 10/day | 500/day | Unlimited |
| Features | Basic | All | All + Admin |
| Support | Community | Priority | Dedicated + SLA |
| Admin Dashboard | — | — | ✓ |
| Audit Log | — | — | ✓ |

对应 Stripe 中创建三个 Product，每个 Product 下挂一个 recurring Price。

---

## 2. Stripe Setup

### 2.1 Dashboard 中创建 Products & Prices

1. 进入 **Stripe Dashboard → Products**，创建三个产品：
   - `AI SaaS Free` — Price: $0/month (或直接跳过 Stripe，本地处理)
   - `AI SaaS Pro` — Price: $19/month, recurring
   - `AI SaaS Enterprise` — Price: $49/month, recurring

2. 记录每个 Price 的 `price_xxx` ID，写入环境变量。

### 2.2 Webhook Configuration

在 **Developers → Webhooks** 中添加 endpoint：

```
https://your-domain.edgeone.app/api/stripe/webhook
```

监听事件：
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 2.3 Test Mode Keys

开发时使用 Test Mode 密钥（`sk_test_*` / `pk_test_*`），上线切换为 Live Mode。

---

## 3. Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_FREE=price_free_xxx
STRIPE_PRICE_PRO=price_pro_xxx
STRIPE_PRICE_ENTERPRISE=price_enterprise_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

EdgeOne Cloud Functions 通过 `process.env` 读取，前端仅暴露 `NEXT_PUBLIC_*` 前缀变量。

---

## 4. Server-side Implementation (EdgeOne Cloud Functions)

### 4.1 `cloud-functions/api/stripe/create-checkout.ts`

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function onRequest(context: any) {
  const { priceId, userId, email } = await context.request.json();

  if (!priceId || !userId) {
    return new Response(JSON.stringify({ error: "Missing params" }), { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${context.request.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${context.request.headers.get("origin")}/pricing`,
    metadata: { userId },
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### 4.2 `cloud-functions/api/stripe/webhook.ts`

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function onRequest(context: any) {
  const body = await context.request.text();
  const sig = context.request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  // Idempotency: skip already-processed events
  const kv = context.env.KV;
  const processed = await kv.get(`stripe_event:${event.id}`);
  if (processed) {
    return new Response("Already processed", { status: 200 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, context);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, context);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, context);
      break;
    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.Invoice, context);
      break;
  }

  await kv.put(`stripe_event:${event.id}`, "1", { expirationTtl: 86400 * 7 });

  return new Response("OK", { status: 200 });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, ctx: any) {
  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = sub.items.data[0].price.id;
  const plan = priceIdToPlan(priceId);

  await ctx.env.DB.prepare(
    `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end)
     VALUES (?, ?, ?, ?, 'active', ?)
     ON CONFLICT (user_id) DO UPDATE SET
       stripe_customer_id = excluded.stripe_customer_id,
       stripe_subscription_id = excluded.stripe_subscription_id,
       plan = excluded.plan,
       status = 'active',
       current_period_end = excluded.current_period_end`
  )
    .bind(userId, customerId, subscriptionId, plan, new Date(sub.current_period_end * 1000).toISOString())
    .run();
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription, ctx: any) {
  const priceId = sub.items.data[0].price.id;
  const plan = priceIdToPlan(priceId);

  await ctx.env.DB.prepare(
    `UPDATE subscriptions SET plan = ?, status = ?, current_period_end = ? WHERE stripe_subscription_id = ?`
  )
    .bind(plan, sub.status, new Date(sub.current_period_end * 1000).toISOString(), sub.id)
    .run();
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription, ctx: any) {
  await ctx.env.DB.prepare(
    `UPDATE subscriptions SET plan = 'free', status = 'canceled' WHERE stripe_subscription_id = ?`
  )
    .bind(sub.id)
    .run();
}

async function handlePaymentFailed(invoice: Stripe.Invoice, ctx: any) {
  const customerId = invoice.customer as string;
  // 查找用户并发送通知（邮件 / 站内消息）
  await ctx.env.DB.prepare(
    `INSERT INTO notifications (user_id, type, message, created_at)
     SELECT user_id, 'payment_failed', '您的订阅付款失败，请更新支付方式。', datetime('now')
     FROM subscriptions WHERE stripe_customer_id = ?`
  )
    .bind(customerId)
    .run();
}

function priceIdToPlan(priceId: string): string {
  const map: Record<string, string> = {
    [process.env.STRIPE_PRICE_FREE!]: "free",
    [process.env.STRIPE_PRICE_PRO!]: "pro",
    [process.env.STRIPE_PRICE_ENTERPRISE!]: "enterprise",
  };
  return map[priceId] ?? "free";
}
```

### 4.3 `cloud-functions/api/stripe/portal.ts`

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function onRequest(context: any) {
  const { customerId } = await context.request.json();

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${context.request.headers.get("origin")}/dashboard`,
  });

  return new Response(JSON.stringify({ url: portalSession.url }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### 4.4 `cloud-functions/api/stripe/subscription-status.ts`

```typescript
export async function onRequest(context: any) {
  const userId = context.request.headers.get("x-user-id");
  if (!userId) {
    return new Response(JSON.stringify({ plan: "free" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const row = await context.env.DB.prepare(
    `SELECT plan, status, current_period_end, stripe_customer_id
     FROM subscriptions WHERE user_id = ? AND status = 'active'`
  )
    .bind(userId)
    .first();

  const plan = row?.plan ?? "free";
  const isActive = row?.status === "active" && new Date(row.current_period_end) > new Date();

  return new Response(
    JSON.stringify({
      plan: isActive ? plan : "free",
      status: row?.status ?? "none",
      currentPeriodEnd: row?.current_period_end ?? null,
      stripeCustomerId: row?.stripe_customer_id ?? null,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
```

---

## 5. Webhook Event Handling Summary

| Event | Action |
|---|---|
| `checkout.session.completed` | 激活订阅，写入 `subscriptions` 表 |
| `customer.subscription.updated` | 更新 plan / status / period_end |
| `customer.subscription.deleted` | 降级为 free，status 设为 canceled |
| `invoice.payment_failed` | 写入 `notifications` 表，通知用户更新支付方式 |

**Idempotency**：每个 `event.id` 写入 KV（TTL 7 天），重复事件直接 200 返回。

---

## 6. Security

### 6.1 Webhook Signature Verification

```typescript
const event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
```

永远使用原始请求体（`request.text()`），不要先 JSON.parse 再传入——签名校验需要原始字符串。

### 6.2 Idempotency Keys

Webhook 可能重复投递。用 `event.id` 作为幂等键存入 KV，处理前先检查是否已存在。

### 6.3 Never Trust Client-side Status

订阅状态必须从服务端查询。前端展示的 plan badge 仅用于 UI 提示，所有用量限制在 API 层校验：

```typescript
async function enforceQuota(userId: string, ctx: any): Promise<boolean> {
  const sub = await getSubscription(userId, ctx);
  const usage = await getDailyUsage(userId, ctx);

  const limits: Record<string, number> = {
    free: 10,
    pro: 500,
    enterprise: Infinity,
  };

  return usage < (limits[sub.plan] ?? 10);
}
```

---

## 7. Frontend Components

### 7.1 PricingTable

```typescript
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  { name: "Free", price: "$0", priceId: null, features: ["10 AI chats/day", "Basic features"] },
  { name: "Pro", price: "$19/mo", priceId: "price_pro_xxx", features: ["500 AI chats/day", "All features", "Priority support"], popular: true },
  { name: "Enterprise", price: "$49/mo", priceId: "price_enterprise_xxx", features: ["Unlimited AI chats", "Admin dashboard", "Audit log", "SLA guarantee"] },
];

export function PricingTable({ currentPlan }: { currentPlan: string }) {
  const handleSubscribe = async (priceId: string) => {
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, userId: getCurrentUserId() }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div key={plan.name} className={`rounded-2xl border p-6 ${plan.popular ? "border-blue-500 shadow-lg" : "border-gray-200"}`}>
          {plan.popular && <span className="text-xs font-bold text-blue-600 uppercase">Most Popular</span>}
          <h3 className="text-xl font-bold mt-2">{plan.name}</h3>
          <p className="text-3xl font-extrabold mt-2">{plan.price}</p>
          <ul className="mt-4 space-y-2">
            {plan.features.map((f) => <li key={f} className="flex items-center gap-2"><CheckIcon /> {f}</li>)}
          </ul>
          <button
            disabled={currentPlan === plan.name.toLowerCase()}
            onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
            className="mt-6 w-full rounded-lg bg-blue-600 py-2 text-white font-medium disabled:opacity-50"
          >
            {currentPlan === plan.name.toLowerCase() ? "Current Plan" : "Subscribe"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 7.2 SubscriptionBadge

```typescript
const badgeColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  enterprise: "bg-purple-100 text-purple-700",
};

export function SubscriptionBadge({ plan }: { plan: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[plan] ?? badgeColors.free}`}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
}
```

### 7.3 UpgradeButton

```typescript
export function UpgradeButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, userId: getCurrentUserId() }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <button onClick={handleUpgrade} disabled={loading} className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-white font-medium">
      {loading ? "Redirecting…" : "Upgrade"}
    </button>
  );
}
```

### 7.4 ManageSubscriptionButton

```typescript
export function ManageSubscriptionButton({ customerId }: { customerId: string }) {
  const handleManage = async () => {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <button onClick={handleManage} className="text-sm text-blue-600 underline">
      Manage Subscription
    </button>
  );
}
```

---

## 8. Database Schema (Supabase)

```sql
CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status        TEXT NOT NULL DEFAULT 'none' CHECK (status IN ('none', 'active', 'canceled', 'past_due')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  current_period_end     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub      ON subscriptions(stripe_subscription_id);

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  type       TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE usage_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  chat_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE INDEX idx_usage_logs_user_date ON usage_logs(user_id, date);
```

**Row Level Security (RLS)** — 确保用户只能读取自己的订阅和用量记录：

```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own usage"
  ON usage_logs FOR SELECT USING (auth.uid() = user_id);
```
