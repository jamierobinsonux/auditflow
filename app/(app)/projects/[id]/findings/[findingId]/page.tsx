import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProjectTabs } from "@/components/project-tabs";
import { DeleteFindingButton } from "@/components/delete-finding-button";
import { AnnotatedEvidenceGallery } from "@/components/annotated-evidence-gallery";
import { AddEvidenceForm } from "@/components/add-evidence-form";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SeverityBadge } from "@/components/ui/severity-badge";

export default async function FindingViewPage({
  params,
}: {
  params: Promise<{ id: string; findingId: string }>;
}) {
  const { id, findingId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: finding } = await supabase
    .from("findings")
    .select("*")
    .eq("id", findingId)
    .eq("project_id", id)
    .eq("user_id", user?.id)
    .single();

  const { data: images } = await supabase
    .from("finding_images")
    .select("*")
    .eq("finding_id", findingId)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: true });

  const { data: annotations } = await supabase
    .from("image_annotations")
    .select("*")
    .eq("finding_id", findingId)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: true });

  if (!finding) return <PageShell>Finding not found.</PageShell>;

  const linkedRecommendation = await loadLinkedRecommendation({
    supabase,
    userId: user?.id,
    savedRecommendationId: finding.saved_recommendation_id,
    frameworkRecommendationId: finding.framework_recommendation_id,
  });

  const recommendationText = finding.recommendation || linkedRecommendation?.recommendation || null;
  const recommendationTitle = linkedRecommendation?.title ?? null;
  const findingCategory = finding.category ?? linkedRecommendation?.category ?? null;

  const evidenceImages = images ?? [];

  return (
    <PageShell>
      <PageHeader
        title={finding.title}
        description="Review finding details, recommendations, and annotated evidence."
        action={
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/projects/${id}/findings/${findingId}/edit`}>
                Edit Finding
              </Link>
            </Button>

            <DeleteFindingButton projectId={id} findingId={findingId} />
          </div>
        }
      />

      <div className="mt-3 flex gap-2">
        <SeverityBadge severity={finding.severity} />
        <StatusBadge status={finding.status} />
        {findingCategory && (
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {findingCategory}
          </span>
        )}
      </div>

      <ProjectTabs projectId={id} />

      <div className="mt-6 space-y-6">
        <Card className="p-6">
          <SectionHeader title="Description" />

          <p className="text-sm leading-6 text-slate-600">
            {finding.description || "No description added."}
          </p>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Recommendation" />

          {recommendationTitle && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-600">
              Linked recommendation: {recommendationTitle}
            </p>
          )}

          <p className="text-sm leading-6 text-slate-600">
            {recommendationText || "No recommendation added."}
          </p>
        </Card>

        <Card className="p-6">
          <SectionHeader
            title="Annotated Evidence"
            description="Add screenshots, then click anywhere on an image to add numbered annotations."
            action={<AddEvidenceForm findingId={findingId} />}
          />

          <div className="mt-5">
            {evidenceImages.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="No evidence added yet"
                description="Upload screenshots or product images to support this finding and add numbered annotations."
              />
            ) : (
              <AnnotatedEvidenceGallery
                images={evidenceImages}
                annotations={annotations ?? []}
                findingId={findingId}
              />
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

async function loadLinkedRecommendation({
  supabase,
  userId,
  savedRecommendationId,
  frameworkRecommendationId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId?: string;
  savedRecommendationId?: string | null;
  frameworkRecommendationId?: string | null;
}) {
  if (!userId) return null;

  if (savedRecommendationId) {
    const { data } = await supabase
      .from("studio_recommendations")
      .select("id,title,category,recommendation,impact")
      .eq("id", savedRecommendationId)
      .eq("user_id", userId)
      .maybeSingle();

    return data;
  }

  if (frameworkRecommendationId) {
    const { data } = await supabase
      .from("studio_framework_recommendations")
      .select("id,title,category,recommendation,impact")
      .eq("id", frameworkRecommendationId)
      .eq("user_id", userId)
      .maybeSingle();

    return data;
  }

  return null;
}
