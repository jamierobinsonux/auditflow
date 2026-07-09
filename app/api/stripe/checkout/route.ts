import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripePriceIdForPlan, normalizePlanId, stripe } from "@/lib/stripe";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
]);

export async function POST(request: Request) {
  try {
    const { priceId: requestedPriceId, plan: requestedPlan } = await request.json();

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plan = normalizePlanId(requestedPlan);
    const expectedPriceId = getStripePriceIdForPlan(requestedPlan);

    if (!plan || plan === "Free" || !expectedPriceId) {
      return NextResponse.json(
        { error: "Invalid subscription plan." },
        { status: 400 }
      );
    }

    if (requestedPriceId && requestedPriceId !== expectedPriceId) {
      return NextResponse.json(
        { error: "The selected price does not match the requested plan." },
        { status: 400 }
      );
    }

    const { data: subscriptionRecord } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const existingSubscriptionId = String(
      subscriptionRecord?.stripe_subscription_id || ""
    ).trim();
    const existingSubscriptionStatus = String(subscriptionRecord?.status || "");

    if (
      existingSubscriptionId &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(existingSubscriptionStatus)
    ) {
      const existingSubscription = await stripe.subscriptions.retrieve(
        existingSubscriptionId
      );
      const subscriptionItem = existingSubscription.items.data[0];

      if (!subscriptionItem) {
        return NextResponse.json(
          { error: "Unable to find the current Stripe subscription item." },
          { status: 500 }
        );
      }

      const currentPriceId = subscriptionItem.price.id;

      if (currentPriceId === expectedPriceId) {
        return NextResponse.json({ url: `${appUrl}/settings/billing?success=true` });
      }

      const currentPlan = normalizePlanId(subscriptionRecord?.plan);
      const isUpgrade = currentPlan === "Pro" && plan === "Studio";

      await stripe.subscriptions.update(existingSubscription.id, {
        items: [
          {
            id: subscriptionItem.id,
            price: expectedPriceId,
          },
        ],
        metadata: {
          ...existingSubscription.metadata,
          user_id: user.id,
          plan,
        },
        proration_behavior: isUpgrade ? "create_prorations" : "none",
      });

      return NextResponse.json({ url: `${appUrl}/settings/billing?success=true` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: subscriptionRecord?.stripe_customer_id || undefined,
      customer_email: subscriptionRecord?.stripe_customer_id
        ? undefined
        : user.email ?? undefined,
      line_items: [{ price: expectedPriceId, quantity: 1 }],
      metadata: {
        user_id: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
        },
      },
      success_url: `${appUrl}/settings/billing?success=true`,
      cancel_url: `${appUrl}/settings/billing?canceled=true`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session.",
      },
      { status: 500 }
    );
  }
}
