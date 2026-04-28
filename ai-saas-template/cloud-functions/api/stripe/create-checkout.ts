import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

interface CheckoutRequestBody {
  priceId: string;
  userId: string;
  email: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(req: Request) {
  try {
    const body: CheckoutRequestBody = await req.json();
    const { priceId, userId, email, successUrl, cancelUrl } = body;

    if (!priceId || !userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: priceId, userId, email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: { userId },
      },
      allow_promotion_codes: true,
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Stripe.errors.StripeError
      ? error.message
      : 'Internal server error';
    const status = error instanceof Stripe.errors.StripeError ? 400 : 500;

    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
