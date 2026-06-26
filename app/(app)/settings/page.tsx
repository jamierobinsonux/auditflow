import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
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
          <SettingRow label="Email" value={user?.email || "No email found"} />
          <SettingRow
            label="Sign-in provider"
            value={user?.app_metadata?.provider || "Email"}
          />
        </div>
      </section>

      <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-slate-950">Workspace</h2>

        <div className="mt-6 space-y-5">
          <SettingRow label="Workspace name" value="AuditFlow Workspace" />
          <SettingRow label="Plan" value="Free" />
          <SettingRow label="Default audit framework" value="Blank project" />
        </div>
      </section>

      <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-slate-950">
          Report Preferences
        </h2>

        <div className="mt-6 space-y-5">
          <SettingRow label="Report branding" value="AuditFlow default" />
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