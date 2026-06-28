import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import {
  getReportBranding,
  normalizeReportBranding,
} from "@/lib/report-branding";
import { ReportBrandingForm } from "@/components/report-branding-form";

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

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Account";

  return (
    <main className="p-10">
      <div>
        <h1 className="text-[24px] font-semibold text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account, workspace, and report preferences.
        </p>
      </div>

      <section className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-slate-950">Account</h2>

        <div className="mt-6 space-y-5">
          <SettingRow label="Name" value={displayName} />
          <SettingRow label="Email" value={user.email || "No email found"} />
          <SettingRow
            label="Sign-in provider"
            value={user.app_metadata?.provider || "Email"}
          />
        </div>
      </section>

      <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-slate-950">Workspace</h2>

        <div className="mt-6 space-y-5">
          <SettingRow label="Workspace name" value="AuditFlow Workspace" />
          <SettingRow label="Plan" value={subscription.planId} />
          <SettingRow label="Default audit framework" value="Blank project" />
        </div>
      </section>

      <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            Pro
          </span>
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

      <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-slate-950">
          Report Preferences
        </h2>

        <div className="mt-6 space-y-5">
          <SettingRow
            label="Report branding"
            value={isProReportBranding ? "Custom branding" : "AuditFlow default"}
          />
          <SettingRow label="PDF format" value="Professional report" />
          <SettingRow label="Evidence images" value="Included in appendix" />
        </div>
      </section>
    </main>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="max-w-[320px] truncate text-right text-sm text-slate-500">
        {value}
      </p>
    </div>
  );
}
