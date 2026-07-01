import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { HelpForm } from "@/components/help-form";

export default async function HelpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <PageShell>
      <PageHeader
        title="Help & Support"
        description="Report an issue, ask a question, or share feedback about AuditFlow."
      />

      <div className="mt-8 max-w-3xl">
        <HelpForm userEmail={user.email ?? ""} />
      </div>
    </PageShell>
  );
}
