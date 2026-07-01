import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import { FrameworkBuilderClient } from "@/components/framework-builder-client";
import type {
  StudioFramework,
  StudioFrameworkCategory,
  StudioFrameworkJourneyStage,
  StudioFrameworkRecommendation,
  StudioFrameworkReportDefault,
  StudioFrameworkWithItems,
} from "@/types/framework";

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

  const { data: framework } = await supabase
    .from("studio_frameworks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!framework) notFound();

  const [
    { data: categories },
    { data: journeyStages },
    { data: recommendations },
    { data: reportDefault },
  ] = await Promise.all([
    supabase
      .from("studio_framework_categories")
      .select("*")
      .eq("framework_id", id)
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("studio_framework_journey_stages")
      .select("*")
      .eq("framework_id", id)
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("studio_framework_recommendations")
      .select("*")
      .eq("framework_id", id)
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("studio_framework_report_defaults")
      .select("*")
      .eq("framework_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const detail: StudioFrameworkWithItems = {
    ...((framework ?? {}) as StudioFramework),
    categories: (categories ?? []) as StudioFrameworkCategory[],
    journey_stages: (journeyStages ?? []) as StudioFrameworkJourneyStage[],
    recommendations: (recommendations ?? []) as StudioFrameworkRecommendation[],
    report_defaults: (reportDefault ?? null) as StudioFrameworkReportDefault | null,
  };

  return (
    <PageShell>
      <PageHeader
        title={detail.name}
        description="Edit this Studio framework and reuse it when creating client projects."
      />

      <div className="mt-8">
        <FrameworkBuilderClient userId={user.id} framework={detail} />
      </div>
    </PageShell>
  );
}