import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPlanFromStripePriceId, stripe } from "@/lib/stripe";
import { sendPostmarkEmail, escapeHtml } from "@/lib/postmark";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Webhook error: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.subscription || !session.customer) {
          break;
        }

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        const userId = await resolveSubscriptionUserId(subscription, {
          metadataUserId: session.metadata?.user_id,
          customerId,
          subscriptionId,
        });

        if (!userId) {
          console.warn("Stripe subscription email/sync skipped: user could not be resolved for checkout session.", {
            customerId,
            subscriptionId,
          });
          break;
        }

        const syncedPlan = await syncSubscription({
          userId,
          customerId,
          subscription,
        });

        if (syncedPlan !== "Free") {
          await sendSubscriptionStartedEmail({
            request,
            userId,
            plan: syncedPlan,
          });
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const userId = await resolveSubscriptionUserId(subscription);

        if (!userId) {
          console.warn("Stripe subscription update skipped: user could not be resolved.", {
            customerId: subscription.customer,
            subscriptionId: subscription.id,
          });
          break;
        }

        const previousPlan = await getStoredPlan(userId);
        const syncedPlan = await syncSubscription({
          userId,
          customerId: subscription.customer as string,
          subscription,
        });

        if (isPaidPlan(previousPlan) && isPaidPlan(syncedPlan) && previousPlan !== syncedPlan) {
          await sendSubscriptionUpdatedEmail({
            request,
            userId,
            previousPlan,
            newPlan: syncedPlan,
          });
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const userId = await resolveSubscriptionUserId(subscription);

        if (!userId) {
          console.warn("Stripe subscription deletion skipped: user could not be resolved.", {
            customerId: subscription.customer,
            subscriptionId: subscription.id,
          });
          break;
        }

        const previousPlan = await getStoredPlan(userId);

        await syncSubscription({
          userId,
          customerId: subscription.customer as string,
          subscription,
        });

        if (isPaidPlan(previousPlan)) {
          await sendSubscriptionCancelledEmail({
            userId,
            previousPlan,
          });
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}


async function resolveSubscriptionUserId(
  subscription: Stripe.Subscription,
  fallback?: {
    metadataUserId?: string | null;
    customerId?: string | null;
    subscriptionId?: string | null;
  }
) {
  const metadataUserId =
    fallback?.metadataUserId ||
    subscription.metadata?.user_id ||
    null;

  if (metadataUserId) return metadataUserId;

  const customerId = String(
    fallback?.customerId || subscription.customer || ""
  ).trim();
  const subscriptionId = String(
    fallback?.subscriptionId || subscription.id || ""
  ).trim();

  if (customerId) {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (error) {
      console.warn("Unable to resolve user by Stripe customer ID.", error.message);
    }

    if (data?.user_id) return data.user_id as string;
  }

  if (subscriptionId) {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (error) {
      console.warn("Unable to resolve user by Stripe subscription ID.", error.message);
    }

    if (data?.user_id) return data.user_id as string;
  }

  return null;
}


async function syncSubscription({
  userId,
  customerId,
  subscription,
}: {
  userId: string;
  customerId: string;
  subscription: Stripe.Subscription;
}) {
  const periodEnd = getCurrentPeriodEnd(subscription);
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const planFromPrice = getPlanFromStripePriceId(priceId);
  const active = ["active", "trialing", "past_due", "unpaid"].includes(
    subscription.status
  );
  const plan = active ? planFromPrice : "Free";

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      status: subscription.status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return plan;
}

async function getStoredPlan(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Unable to read stored subscription plan before Stripe sync.", error.message);
  }

  return normalizePlanName(data?.plan);
}

function normalizePlanName(plan: unknown) {
  if (plan === "Pro" || plan === "Studio") return plan;
  return "Free";
}

function isPaidPlan(plan: string) {
  return plan === "Pro" || plan === "Studio";
}

async function getAccountEmail(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !data?.user?.email) {
    console.warn("Subscription email skipped: account email not found.", error?.message);
    return null;
  }

  const displayName =
    data.user.user_metadata?.full_name ||
    data.user.user_metadata?.name ||
    data.user.email.split("@")[0] ||
    "there";

  return {
    email: data.user.email,
    displayName,
  };
}

function getAppUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

async function sendSubscriptionStartedEmail({
  request,
  userId,
  plan,
}: {
  request: Request;
  userId: string;
  plan: string;
}) {
  const account = await getAccountEmail(userId);

  if (!account) return;

  const appUrl = getAppUrl(request);

  await sendPostmarkEmail({
    to: account.email,
    subject: `Welcome to AuditFlow ${plan}`,
    textBody: [
      `Hi ${account.displayName},`,
      "",
      `Thanks for subscribing to AuditFlow ${plan}. Your subscription is active.`,
      "",
      `Open AuditFlow: ${appUrl}/dashboard`,
      "",
      "— The AuditFlow Team",
    ].join("\n"),
    htmlBody: renderSubscriptionEmail({
      eyebrow: "Subscription started",
      title: `Welcome to AuditFlow ${plan}`,
      displayName: account.displayName,
      paragraphs: [
        `Thanks for subscribing to AuditFlow ${plan}. Your subscription is active and ready to use.`,
        plan === "Studio"
          ? "You now have access to Studio features, including Client Spaces and client comment notifications."
          : "You now have unlimited projects and findings for your audit workflow.",
      ],
      buttonLabel: "Open AuditFlow",
      buttonHref: `${appUrl}/dashboard`,
    }),
  });
}

async function sendSubscriptionUpdatedEmail({
  request,
  userId,
  previousPlan,
  newPlan,
}: {
  request: Request;
  userId: string;
  previousPlan: string;
  newPlan: string;
}) {
  const account = await getAccountEmail(userId);

  if (!account) return;

  const appUrl = getAppUrl(request);
  const isUpgrade = previousPlan === "Pro" && newPlan === "Studio";

  await sendPostmarkEmail({
    to: account.email,
    subject: "Your AuditFlow subscription has been updated",
    textBody: [
      `Hi ${account.displayName},`,
      "",
      `Your AuditFlow subscription changed from ${previousPlan} to ${newPlan}.`,
      isUpgrade
        ? "Stripe may apply a prorated charge or credit based on the time remaining in your billing period."
        : "Your billing will reflect your updated plan according to Stripe's subscription settings.",
      "",
      `Manage AuditFlow: ${appUrl}/settings`,
      "",
      "— The AuditFlow Team",
    ].join("\n"),
    htmlBody: renderSubscriptionEmail({
      eyebrow: "Subscription updated",
      title: "Your subscription has been updated",
      displayName: account.displayName,
      paragraphs: [
        `Your AuditFlow subscription changed from ${previousPlan} to ${newPlan}.`,
        isUpgrade
          ? "Stripe may apply a prorated charge or credit based on the time remaining in your billing period."
          : "Your billing will reflect your updated plan according to Stripe's subscription settings.",
      ],
      buttonLabel: "Manage subscription",
      buttonHref: `${appUrl}/settings`,
    }),
  });
}

async function sendSubscriptionCancelledEmail({
  userId,
  previousPlan,
}: {
  userId: string;
  previousPlan: string;
}) {
  const account = await getAccountEmail(userId);

  if (!account) return;

  await sendPostmarkEmail({
    to: account.email,
    subject: "Your AuditFlow subscription has been cancelled",
    textBody: [
      `Hi ${account.displayName},`,
      "",
      `Your AuditFlow ${previousPlan} subscription has been cancelled.`,
      "You will not be billed again for this subscription.",
      "",
      "You can resubscribe anytime from your AuditFlow account.",
      "",
      "— The AuditFlow Team",
    ].join("\n"),
    htmlBody: renderSubscriptionEmail({
      eyebrow: "Subscription cancelled",
      title: "Your subscription has been cancelled",
      displayName: account.displayName,
      paragraphs: [
        `Your AuditFlow ${previousPlan} subscription has been cancelled. You will not be billed again for this subscription.`,
        "You can resubscribe anytime from your AuditFlow account.",
      ],
    }),
  });
}

function renderSubscriptionEmail({
  eyebrow,
  title,
  displayName,
  paragraphs,
  buttonLabel,
  buttonHref,
}: {
  eyebrow: string;
  title: string;
  displayName: string;
  paragraphs: string[];
  buttonLabel?: string;
  buttonHref?: string;
}) {
  const button = buttonLabel && buttonHref
    ? `<a href="${escapeHtml(buttonHref)}" style="display:inline-block;background:#7C3AED;color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px;">${escapeHtml(buttonLabel)}</a>`
    : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#F1F5F9;padding:32px;">
      <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;padding:32px;">
        <p style="margin:0 0 8px;color:#7C3AED;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">AuditFlow</p>
        <h1 style="margin:0;color:#0F172A;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
        <p style="color:#334155;font-size:15px;line-height:1.6;">Hi ${escapeHtml(displayName)},</p>
        ${paragraphs
          .map((paragraph) => `<p style="color:#64748B;font-size:15px;line-height:1.6;">${escapeHtml(paragraph)}</p>`)
          .join("")}
        ${button ? `<p style="margin:24px 0 0;">${button}</p>` : ""}
        <p style="color:#94A3B8;font-size:13px;margin-top:28px;">— The AuditFlow Team</p>
      </div>
    </div>
  `;
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const subscriptionWithPeriod = subscription as Stripe.Subscription & {
    current_period_end?: number;
  };

  return (
    subscriptionWithPeriod.current_period_end ??
    subscription.items?.data?.[0]?.current_period_end ??
    null
  );
}
