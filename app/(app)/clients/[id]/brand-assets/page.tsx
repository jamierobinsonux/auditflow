import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import { ClientWorkspaceTabs } from "@/components/client-workspace-tabs";
import { ClientBrandAssetsForm } from "@/components/client-brand-assets-form";
import type { Client, ClientBranding } from "@/types/client";

export default async function ClientBrandAssetsPage({
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
        title="Client brand assets are available on Studio"
        description="Upgrade to Studio to manage client-specific logos, colors, cover images, and report branding."
      />
    );
  }

  const [{ data: clientData }, { data: brandingData }] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("client_branding")
      .select("*")
      .eq("client_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!clientData) return <PageShell>Client not found.</PageShell>;

  const client = clientData as Client;
  const branding = (brandingData ?? null) as ClientBranding | null;

  return (
    <PageShell>
      <PageHeader
        title={`${client.name} Brand Assets`}
        description="Manage the client-specific branding used automatically in Studio reports."
      />
      <ClientWorkspaceTabs clientId={client.id} active="brand-assets" />
      <div className="mt-8">
        <ClientBrandAssetsForm userId={user.id} client={client} branding={branding} />
      </div>
    </PageShell>
  );
}
