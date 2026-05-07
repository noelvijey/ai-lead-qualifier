import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Signature verification failed";
    console.error("[stripe-webhook] Signature error:", msg);
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[stripe-webhook] Handler error for ${event.type}:`, msg);
    // Return 500 so Stripe retries the event
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function toISOString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "number") return new Date(value * 1000).toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return null;
}

// Stripe API 2026-04-22.dahlia moved current_period_end from top-level to items.data[0]
function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const raw = subscription as unknown as Record<string, unknown>;
  if (raw.current_period_end != null) return toISOString(raw.current_period_end);
  const items = subscription.items?.data;
  if (items?.length) {
    const item = items[0] as unknown as Record<string, unknown>;
    return toISOString(item.current_period_end);
  }
  return null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.subscription || !session.customer) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  const userId =
    (subscription.metadata?.supabase_user_id as string | undefined) ??
    (session.metadata?.supabase_user_id as string | undefined);

  if (!userId) {
    console.error("[stripe-webhook] checkout.session.completed: no supabase_user_id in metadata");
    return;
  }

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_sub_id: subscription.id,
      plan: "pro",
      status: mapStripeStatus(subscription.status),
      current_period_end: getPeriodEnd(subscription),
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: "user_id" }
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id as string | undefined;
  const isPro =
    subscription.status === "active" || subscription.status === "trialing";

  const payload = {
    plan: isPro ? "pro" : "free",
    status: mapStripeStatus(subscription.status),
    current_period_end: getPeriodEnd(subscription),
    cancel_at_period_end: subscription.cancel_at_period_end,
    stripe_sub_id: subscription.id,
  };

  if (userId) {
    await supabaseAdmin.from("subscriptions").update(payload).eq("user_id", userId);
  } else {
    await supabaseAdmin.from("subscriptions").update(payload).eq("stripe_sub_id", subscription.id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id as string | undefined;

  const payload = {
    plan: "free",
    status: "canceled",
    stripe_sub_id: null,
    current_period_end: null,
    cancel_at_period_end: false,
  };

  if (userId) {
    await supabaseAdmin.from("subscriptions").update(payload).eq("user_id", userId);
  } else {
    await supabaseAdmin.from("subscriptions").update(payload).eq("stripe_sub_id", subscription.id);
  }
}

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "inactive";
  }
}
