import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import { FrameworkForm } from "@/components/framework-form";
import type { StudioFrameworkWithItems } from "@/types/framework";

export default async function EditFrameworkPage({
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
        title="Custom frameworks are available on Studio"
        description="Upgrade to Studio to edit reusable audit frameworks."
      />
    );
  }

  const { data } = await supabase
    .from("studio_frameworks")
    .select("*, categories:studio_framework_categories(*), journey_stages:studio_framework_journey_stages(*), recommendations:studio_framework_recommendations(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return <PageShell>Framework not found.</PageShell>;

  const framework = {
    ...data,
    categories: Array.isArray((data as any).categories) ? (data as any).categories : [],
    journey_stages: Array.isArray((data as any).journey_stages) ? (data as any).journey_stages : [],
    recommendations: Array.isArray((data as any).recommendations) ? (data as any).recommendations : [],
  } as StudioFrameworkWithItems;

  return (
    <PageShell>
      <PageHeader
        title={`Edit ${framework.name}`}
        description="Update the framework used to create future projects. Existing projects will not be changed."
      />
      <div className="mt-8">
        <FrameworkForm userId={user.id} framework={framework} />
      </div>
    </PageShell>
  );
}
