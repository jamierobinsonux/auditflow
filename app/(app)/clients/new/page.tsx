import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { ClientForm } from "@/components/client-form";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";

export default async function NewClientPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const subscription = await getUserSubscription(user.id);

  if (!subscription.isStudio) {
    return (
      <UpgradeRequiredCard
        title="Client workspaces are available on Studio"
        description="Upgrade to Studio to create client workspaces and organize projects by client."
      />
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Create Client"
        description="Add client details that will power Studio workspaces, reports, and brand context."
      />

      <Card className="mt-8 p-8">
        <ClientForm />
      </Card>
    </PageShell>
  );
}
