import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { ClientForm } from "@/components/client-form";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import type { Client } from "@/types/client";

export default async function EditClientPage({
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
        title="Client workspaces are available on Studio"
        description="Upgrade to Studio to edit client workspaces and brand context."
      />
    );
  }

  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return <PageShell>Client not found.</PageShell>;

  const client = data as Client;

  return (
    <PageShell>
      <PageHeader
        title={`Edit ${client.name}`}
        description="Update client details, contact information, and brand context."
      />

      <Card className="mt-8 p-8">
        <ClientForm client={client} />
      </Card>
    </PageShell>
  );
}
