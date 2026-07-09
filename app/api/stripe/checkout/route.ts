import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripePriceIdForPlan, normalizePlanId, stripe } from "@/lib/stripe";
import { sendPostmarkEmail, escapeHtml } from "@/lib/postmark";
import type Stripe from "stripe";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
]);

const PLAN_RANK = {
  Free: 0,
  Pro: 1,
  Studio: 2,
} as const;

function getCurrentPeriodStart(subscription: Stripe.Subscription) {
  const subscriptionWithPeriod = subscription as Stripe.Subscription & {
    current_period_start?: number;
  };

  return (
    subscriptionWithPeriod.current_period_start ??
    subscription.items?.data?.[0]?.current_period_start ??
    Math.floor(Date.now() / 1000)
  );
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

function getSubscriptionScheduleId(subscription: Stripe.Subscription) {
  const subscriptionWithSchedule = subscription as Stripe.Subscription & {
    schedule?: string | Stripe.SubscriptionSchedule | null;
  };

  const schedule = subscriptionWithSchedule.schedule;

  if (!schedule) return null;
  if (typeof schedule === "string") return schedule;

  return schedule.id;
}

export async function POST(request: Request) {
  try {
    const { priceId: requestedPriceId, plan: requestedPlan } =
      await request.json();

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
        await supabase
          .from("subscriptions")
          .update({
            scheduled_plan: null,
            scheduled_change_date: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        return NextResponse.json({
          url: `${appUrl}/settings/billing?success=true`,
        });
      }

      const currentPlan = normalizePlanId(subscriptionRecord?.plan);

      if (!currentPlan || currentPlan === "Free") {
        return NextResponse.json(
          { error: "Unable to determine your current subscription plan." },
          { status: 400 }
        );
      }

      const isUpgrade = PLAN_RANK[plan] > PLAN_RANK[currentPlan];
      const isDowngrade = PLAN_RANK[plan] < PLAN_RANK[currentPlan];

      if (isUpgrade) {
        const scheduleId = getSubscriptionScheduleId(existingSubscription);

        if (scheduleId) {
          await stripe.subscriptionSchedules.release(scheduleId);
        }

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
          proration_behavior: "create_prorations",
        });

        await supabase
          .from("subscriptions")
          .update({
            scheduled_plan: null,
            scheduled_change_date: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        return NextResponse.json({
          url: `${appUrl}/settings/billing?success=true`,
        });
      }

      if (isDowngrade) {
        const periodStart = getCurrentPeriodStart(existingSubscription);
        const periodEnd = getCurrentPeriodEnd(existingSubscription);

        if (!periodEnd) {
          return NextResponse.json(
            { error: "Unable to find the current billing period end date." },
            { status: 500 }
          );
        }

        const quantity = subscriptionItem.quantity ?? 1;
        const existingScheduleId = getSubscriptionScheduleId(existingSubscription);

        const schedule = existingScheduleId
          ? await stripe.subscriptionSchedules.retrieve(existingScheduleId)
          : await stripe.subscriptionSchedules.create({
              from_subscription: existingSubscription.id,
            });

        await stripe.subscriptionSchedules.update(schedule.id, {
          end_behavior: "release",
          metadata: {
            user_id: user.id,
            scheduled_plan: plan,
          },
          phases: [
            {
              start_date: periodStart,
              end_date: periodEnd,
              items: [
                {
                  price: currentPriceId,
                  quantity,
                },
              ],
              metadata: {
                user_id: user.id,
                plan: currentPlan,
              },
            },
            {
              start_date: periodEnd,
              items: [
                {
                  price: expectedPriceId,
                  quantity,
                },
              ],
              metadata: {
                user_id: user.id,
                plan,
              },
            },
          ],
        });

        await supabase
          .from("subscriptions")
          .update({
            scheduled_plan: plan,
            scheduled_change_date: new Date(periodEnd * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        return NextResponse.json({
          url: `${appUrl}/settings/billing?success=true`,
        });

         const userEmail = user?.email ?? null;
const userDisplayName =
  user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  user?.email?.split("@")[0] ||
  "there";

if (userEmail && currentPlan === "Studio" && plan === "Pro") {
  await sendStudioToProDowngradeEmail({
    email: userEmail,
    displayName: userDisplayName,
    effectiveDate: periodEnd,
    appUrl,
  });
}
      }

      return NextResponse.json({
        url: `${appUrl}/settings/billing?success=true`,
      });
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
  async function sendStudioToProDowngradeEmail({
  email,
  displayName,
  effectiveDate,
  appUrl,
}: {
  email?: string | null;
  displayName: string;
  effectiveDate: number;
  appUrl: string;
}) {
  if (!email) return;

  const formattedDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(effectiveDate * 1000));

  await sendPostmarkEmail({
    to: email,
    subject: "Your AuditFlow plan will change to Pro",
    textBody: [
      `Hi ${displayName},`,
      "",
      `Your AuditFlow Studio plan will remain active until ${formattedDate}.`,
      "",
      "On that date, your subscription will automatically change to Pro.",
      "",
      "You’ll continue to have access to Studio features until then.",
      "",
      `Manage subscription: ${appUrl}/settings/billing`,
      "",
      "— The AuditFlow Team",
    ].join("\n"),
    htmlBody: `
      <div style="font-family:Inter,Arial,sans-serif;background:#F1F5F9;padding:32px;">
        <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;padding:32px;">
          <p style="margin:0 0 8px;color:#7C3AED;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">AuditFlow</p>
          <h1 style="margin:0;color:#0F172A;font-size:24px;line-height:1.25;">Your plan will change to Pro</h1>
          <p style="color:#334155;font-size:15px;line-height:1.6;">Hi ${escapeHtml(displayName)},</p>
          <p style="color:#64748B;font-size:15px;line-height:1.6;">Your AuditFlow Studio plan will remain active until ${escapeHtml(formattedDate)}.</p>
          <p style="color:#64748B;font-size:15px;line-height:1.6;">On that date, your subscription will automatically change to Pro.</p>
          <p style="color:#64748B;font-size:15px;line-height:1.6;">You’ll continue to have access to Studio features until then.</p>
          <p style="margin:24px 0 0;">
            <a href="${escapeHtml(appUrl)}/settings/billing" style="display:inline-block;background:#7C3AED;color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px;">Manage subscription</a>
          </p>
          <p style="color:#94A3B8;font-size:13px;margin-top:28px;">— The AuditFlow Team</p>
        </div>
      </div>
    `,
  });
}
}