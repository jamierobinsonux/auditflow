import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { ClientWorkspaceTabs } from "@/components/client-workspace-tabs";
import { ClientPortalManager } from "@/components/client-portal-manager";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";

export default async function ClientPortalSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const subscription = await getUserSubscription(user.id);
  if (!subscription.isStudio) {
    return (
      <UpgradeRequiredCard
        title="Client portals are available on Studio"
        description="Upgrade to Studio to share read-only client portals with projects, findings, and reports."
      />
    );
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id,name,portal_enabled,portal_token,portal_last_regenerated")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!client) return <PageShell>Client not found.</PageShell>;

  return (
    <PageShell>
      <PageHeader
        title={`${client.name} Portal`}
        description="Create and manage the secure client-facing view for this workspace."
      />
      <ClientWorkspaceTabs clientId={client.id} active="portal" />
      <div className="mt-8">
        <ClientPortalManager
          clientId={client.id}
          initialEnabled={Boolean(client.portal_enabled)}
          initialToken={client.portal_token}
          lastRegenerated={client.portal_last_regenerated}
        />
      </div>
    </PageShell>
  );
}
