import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import { FrameworkForm } from "@/components/framework-form";

export default async function NewFrameworkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const subscription = await getUserSubscription(user.id);

  if (!subscription.isStudio) {
    return (
      <UpgradeRequiredCard
        title="Custom frameworks are available on Studio"
        description="Upgrade to Studio to create reusable audit frameworks for your client work."
      />
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="New Framework"
        description="Create reusable categories, journey stages, and recommendations for future projects."
      />
      <div className="mt-8">
        <FrameworkForm userId={user.id} />
      </div>
    </PageShell>
  );
}
