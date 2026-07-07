import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import {
  getReportBranding,
  normalizeReportBranding,
} from "@/lib/report-branding";
import { ReportBrandingForm } from "@/components/report-branding-form";
import { AccountSettingsForm } from "@/components/account-settings-form";
import { DangerZone } from "@/components/danger-zone";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const subscription = await getUserSubscription(user.id);
  const isProReportBranding = subscription.isPro || subscription.isStudio;
  const savedBranding = await getReportBranding(user.id);
  const branding = normalizeReportBranding(savedBranding, user.id);

  const metadata = user.user_metadata ?? {};
  const displayName =
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    "Account";
  const workspaceName = metadata.workspace_name || "AuditFlow Workspace";
  const timezone = metadata.timezone || "America/New_York";
  const dateFormat = metadata.date_format || "MMM d, yyyy";
  const emailClientActivity = metadata.email_client_comments !== false;
  const hasActiveSubscription = Boolean(
    subscription.subscription?.stripe_subscription_id &&
      ["active", "trialing", "past_due", "unpaid"].includes(
        String(subscription.subscription?.status || "")
      )
  );

  return (
    <main className="p-6 md:p-10">
      <div className="max-w-4xl">
        <h1 className="text-[24px] font-semibold text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your profile, workspace defaults, notifications, security, and report branding.
        </p>
      </div>

      <div className="mt-8 max-w-4xl space-y-6">
        <AccountSettingsForm
          initialDisplayName={displayName}
          initialWorkspaceName={workspaceName}
          initialTimezone={timezone}
          initialDateFormat={dateFormat}
          initialClientActivityEmails={emailClientActivity}
          email={user.email || ""}
          canUseClientNotifications={subscription.isStudio}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold text-slate-950">
                Report Branding
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Brand exported PDF reports with your company logo, accent color,
                prepared-by line, and confidentiality settings.
              </p>
            </div>

            {!isProReportBranding && (
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Pro
              </span>
            )}
          </div>

          {isProReportBranding ? (
            <ReportBrandingForm userId={user.id} branding={branding} />
          ) : (
            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                Custom PDF branding is available on Pro.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Upgrade to remove AuditFlow branding and export client-ready
                reports with your own logo, brand color, footer text, and
                confidentiality watermark.
              </p>
              <Link
                href="/settings/billing"
                className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Upgrade to Pro
              </Link>
            </div>
          )}
        </section>

        <DangerZone
          accountEmail={user.email || ""}
          currentPlan={subscription.planId}
          hasActiveSubscription={hasActiveSubscription}
        />
      </div>
    </main>
  );
}
