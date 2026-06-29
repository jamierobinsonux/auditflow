import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import { RecommendationLibraryClient } from "@/components/recommendation-library-client";
import type { StudioRecommendation } from "@/types/recommendation";

export default async function RecommendationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const subscription = await getUserSubscription(user.id);

  if (!subscription.isStudio) {
    return (
      <UpgradeRequiredCard
        title="Recommendation Library is available on Studio"
        description="Upgrade to Studio to save and reuse common UX recommendations across audits."
      />
    );
  }

  const { data } = await supabase
    .from("studio_recommendations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <PageShell>
      <PageHeader
        title="Recommendation Library"
        description="Save reusable UX recommendations for recurring patterns across client work."
      />
      <div className="mt-8">
        <RecommendationLibraryClient
          userId={user.id}
          recommendations={(data ?? []) as StudioRecommendation[]}
        />
      </div>
    </PageShell>
  );
}
