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

          <p className="text-sm leading-6 text-slate-600">
            {finding.recommendation || "No recommendation added."}
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