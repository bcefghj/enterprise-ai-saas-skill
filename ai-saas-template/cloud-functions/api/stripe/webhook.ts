import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const processedEvents = new Set<string>();

function tierFromPriceId(priceId: string): 'free' | 'pro' | 'enterprise' {
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'enterprise';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  return 'free';
}

async function updateSubscription(
  userId: string,
  status: 'active' | 'inactive' | 'past_due' | 'canceled',
  tier: 'free' | 'pro' | 'enterprise',
  stripeCustomerId?: string
) {
  const updateData: Record<string, unknown> = {
    subscription_status: status,
    subscription_tier: tier,
    updated_at: new Date().toISOString(),
  };
  if (stripeCustomerId) {
    updateData.stripe_customer_id = stripeCustomerId;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }
}

async function logAudit(action: string, userId: string | null, details: Record<string, unknown>) {
  await supabase.from('audit_log').insert({
    action,
    user_id: userId,
    resource_type: 'subscription',
    details,
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: `Webhook verification failed: ${message}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (processedEvents.has(event.id)) {
    return new Response(JSON.stringify({ received: true, deduplicated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  processedEvents.add(event.id);

  // Prevent memory leaks: cap the idempotency set
  if (processedEvents.size > 10000) {
    const firstKey = processedEvents.values().next().value;
    if (firstKey) processedEvents.delete(firstKey);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id || '';
        const tier = tierFromPriceId(priceId);

        await updateSubscription(userId, 'active', tier, session.customer as string);
        await logAudit('subscription.created', userId, { tier, priceId, sessionId: session.id });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        const priceId = subscription.items.data[0]?.price.id || '';
        const tier = tierFromPriceId(priceId);
        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : 'inactive';

        await updateSubscription(userId, status, tier);
        await logAudit('subscription.updated', userId, { tier, status, subscriptionId: subscription.id });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        await updateSubscription(userId, 'canceled', 'free');
        await logAudit('subscription.canceled', userId, { subscriptionId: subscription.id });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .limit(1);

        if (profiles?.[0]) {
          await updateSubscription(profiles[0].id, 'past_due', 'pro');
          await logAudit('payment.failed', profiles[0].id, { invoiceId: invoice.id });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
