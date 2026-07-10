import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { sendPostmarkEmail, escapeHtml } from "@/lib/postmark";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { captureServerEvent } from "@/lib/posthog-server";

const DELETE_CONFIRMATION = "DELETE AUDITFLOW";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const confirmation = String(body?.confirmation || "").trim();

  if (confirmation !== DELETE_CONFIRMATION) {
    return NextResponse.json(
      { error: `Type ${DELETE_CONFIRMATION} to confirm account deletion.` },
      { status: 400 }
    );
  }

  const accountEmail = user.email || "";
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    accountEmail?.split("@")[0] ||
    "there";

  const { data: subscription, error: subscriptionError } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (subscriptionError) {
    return NextResponse.json(
      { error: subscriptionError.message || "Unable to check subscription." },
      { status: 500 }
    );
  }

  const stripeSubscriptionId = String(subscription?.stripe_subscription_id || "").trim();
  const paidPlan = subscription?.plan && subscription.plan !== "Free";
  const activeSubscription =
    Boolean(stripeSubscriptionId) &&
    ["active", "trialing", "past_due", "unpaid"].includes(String(subscription?.status || ""));

  if (activeSubscription) {
    try {
      await stripe.subscriptions.cancel(stripeSubscriptionId);

      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: "Free",
          status: "canceled",
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (accountEmail) {
        await sendSubscriptionCancelledEmail({
          to: accountEmail,
          displayName,
          previousPlan: String(subscription?.plan || "paid"),
        });
      }
    } catch (error: any) {
      return NextResponse.json(
        {
          error:
            error?.message ||
            "Unable to cancel your subscription. Please contact support before deleting your account.",
        },
        { status: 500 }
      );
    }
  }

  try {
    await deleteWorkspaceData(user.id);

    if (accountEmail) {
      await sendAccountDeletedEmail({
        to: accountEmail,
        displayName,
        subscriptionWasCancelled: activeSubscription || Boolean(paidPlan),
      });
    }

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      return NextResponse.json(
        { error: deleteUserError.message || "Workspace data was deleted, but the auth user could not be removed." },
        { status: 500 }
      );
    }

    await captureServerEvent({
      distinctId: user.id,
      event: "account_deleted",
      properties: {
        subscription_cancelled: activeSubscription,
        had_paid_plan: Boolean(paidPlan),
      },
    });

    return NextResponse.json({
      ok: true,
      subscriptionCancelled: activeSubscription,
      accountDeleted: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to delete account." },
      { status: 500 }
    );
  }
}

async function deleteWorkspaceData(userId: string) {
  const { data: imageRows } = await supabaseAdmin
    .from("finding_images")
    .select("image_url")
    .eq("user_id", userId);

  await removeStorageObjects(imageRows ?? []);

  const userScopedTables = [
    "notifications",
    "finding_comments",
    "image_annotations",
    "finding_images",
    "findings",
    "journey_steps",
    "journeys",
    "report_exports",
    "public_reports",
    "client_branding",
    "studio_framework_report_defaults",
    "studio_framework_recommendations",
    "studio_framework_journey_stages",
    "studio_framework_categories",
    "studio_frameworks",
    "studio_recommendations",
    "report_branding",
    "support_requests",
    "projects",
    "clients",
    "subscriptions",
  ];

  for (const table of userScopedTables) {
    const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);

    if (error) {
      throw new Error(`Unable to delete ${table}: ${error.message}`);
    }
  }
}

async function removeStorageObjects(
  imageRows: Array<{ image_url?: string | null }>
) {
  const candidatePaths = imageRows
    .map((row) => getStoragePathFromPublicUrl(row.image_url))
    .filter((value): value is string => Boolean(value && !value.startsWith("http")));

  const uniquePaths = Array.from(new Set(candidatePaths));

  if (!uniquePaths.length) return;

  await supabaseAdmin.storage.from("finding-images").remove(uniquePaths).catch((error) => {
    console.warn("Unable to remove some finding image storage objects.", error);
  });
}

function getStoragePathFromPublicUrl(value?: string | null) {
  if (!value || !value.includes("/storage/v1/object/public/finding-images/")) return null;

  return value.split("/storage/v1/object/public/finding-images/")[1] || null;
}

async function sendSubscriptionCancelledEmail({
  to,
  displayName,
  previousPlan,
}: {
  to: string;
  displayName: string;
  previousPlan: string;
}) {
  await sendPostmarkEmail({
    to,
    subject: "Your AuditFlow subscription has been cancelled",
    textBody: [
      `Hi ${displayName},`,
      "",
      `Your AuditFlow ${previousPlan} subscription has been cancelled.`,
      "You will not be billed again for this subscription.",
      "",
      "If you did not request this cancellation, contact support right away.",
      "",
      "— The AuditFlow Team",
    ].join("\n"),
    htmlBody: `
      <div style="font-family:Inter,Arial,sans-serif;background:#F1F5F9;padding:32px;">
        <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;padding:32px;">
          <p style="margin:0 0 8px;color:#7C3AED;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">AuditFlow</p>
          <h1 style="margin:0;color:#0F172A;font-size:24px;line-height:1.25;">Subscription cancelled</h1>
          <p style="color:#334155;font-size:15px;line-height:1.6;">Hi ${escapeHtml(displayName)},</p>
          <p style="color:#64748B;font-size:15px;line-height:1.6;">Your AuditFlow ${escapeHtml(previousPlan)} subscription has been cancelled. You will not be billed again for this subscription.</p>
          <p style="color:#64748B;font-size:14px;line-height:1.6;">If you did not request this cancellation, contact support right away.</p>
          <p style="color:#94A3B8;font-size:13px;margin-top:28px;">— The AuditFlow Team</p>
        </div>
      </div>
    `,
  });
}

async function sendAccountDeletedEmail({
  to,
  displayName,
  subscriptionWasCancelled,
}: {
  to: string;
  displayName: string;
  subscriptionWasCancelled: boolean;
}) {
  await sendPostmarkEmail({
    to,
    subject: "Your AuditFlow account has been deleted",
    textBody: [
      `Hi ${displayName},`,
      "",
      "Your AuditFlow account and workspace data have been deleted.",
      subscriptionWasCancelled
        ? "Your paid subscription was also cancelled as part of this request."
        : "No active paid subscription was found for this account.",
      "",
      "If you did not request this deletion, contact support right away.",
      "",
      "— The AuditFlow Team",
    ].join("\n"),
    htmlBody: `
      <div style="font-family:Inter,Arial,sans-serif;background:#F1F5F9;padding:32px;">
        <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;padding:32px;">
          <p style="margin:0 0 8px;color:#7C3AED;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">AuditFlow</p>
          <h1 style="margin:0;color:#0F172A;font-size:24px;line-height:1.25;">Account deleted</h1>
          <p style="color:#334155;font-size:15px;line-height:1.6;">Hi ${escapeHtml(displayName)},</p>
          <p style="color:#64748B;font-size:15px;line-height:1.6;">Your AuditFlow account and workspace data have been deleted.</p>
          <p style="color:#64748B;font-size:15px;line-height:1.6;">${subscriptionWasCancelled ? "Your paid subscription was also cancelled as part of this request." : "No active paid subscription was found for this account."}</p>
          <p style="color:#64748B;font-size:14px;line-height:1.6;">If you did not request this deletion, contact support right away.</p>
          <p style="color:#94A3B8;font-size:13px;margin-top:28px;">— The AuditFlow Team</p>
        </div>
      </div>
    `,
  });
}
