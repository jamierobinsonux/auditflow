import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProjectTabs } from "@/components/project-tabs";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { EditProjectMetaCard } from "@/components/edit-project-meta-card";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { ArchiveProjectButton } from "@/components/archive-project-button";
import { ArchivedProjectBanner } from "@/components/archived-project-banner";
import { ArchivedBadge } from "@/components/ui/archived-badge";
import type { Finding } from "@/types/finding";

type LinkedRecommendation = {
  id: string;
  title: string | null;
  recommendation: string | null;
  category: string | null;
  impact: string | null;
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user?.id)
    .maybeSingle();

  const { data: client } = project?.client_id
    ? await supabase
        .from("clients")
        .select("id,name,industry")
        .eq("id", project.client_id)
        .eq("user_id", user?.id)
        .maybeSingle()
    : { data: null };

  const { data: findingData } = await supabase
    .from("findings")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const rawFindings = (findingData ?? []) as Finding[];
  const savedRecommendationIds = rawFindings
    .map((finding: any) => finding.saved_recommendation_id)
    .filter(Boolean);
  const frameworkRecommendationIds = rawFindings
    .map((finding: any) => finding.framework_recommendation_id)
    .filter(Boolean);

  const [{ data: savedRecommendations }, { data: frameworkRecommendations }] = await Promise.all([
    savedRecommendationIds.length
      ? supabase
          .from("studio_recommendations")
          .select("id,title,recommendation,category,impact")
          .in("id", savedRecommendationIds)
          .eq("user_id", user?.id)
      : Promise.resolve({ data: [] } as any),
    frameworkRecommendationIds.length
      ? supabase
          .from("studio_framework_recommendations")
          .select("id,title,recommendation,category,impact")
          .in("id", frameworkRecommendationIds)
          .eq("user_id", user?.id)
      : Promise.resolve({ data: [] } as any),
  ]);

  const savedRecommendationById = new Map<string, LinkedRecommendation>(
  ((savedRecommendations ?? []) as LinkedRecommendation[]).map((item) => [
    item.id,
    item,
  ])
);

const frameworkRecommendationById = new Map<string, LinkedRecommendation>(
  ((frameworkRecommendations ?? []) as LinkedRecommendation[]).map((item) => [
    item.id,
    item,
  ])
);
  const findings = rawFindings.map((finding: any) => {
  const linkedRecommendation: LinkedRecommendation | undefined =
    finding.saved_recommendation_id
      ? savedRecommendationById.get(finding.saved_recommendation_id)
      : finding.framework_recommendation_id
        ? frameworkRecommendationById.get(finding.framework_recommendation_id)
        : undefined;

  return {
    ...finding,
    recommendation:
      finding.recommendation ||
      linkedRecommendation?.recommendation ||
      null,
    category: finding.category ?? linkedRecommendation?.category ?? null,
    impact: finding.impact ?? linkedRecommendation?.impact ?? null,
  };
});

  if (!project) return <PageShell>Project not found.</PageShell>;

  return (
    <PageShell>
      <PageHeader
        title={project.name}
        description={project.website_url || "No website provided"}
        action={
          <div className="flex gap-3">
            {!project.archived && (
              <Button asChild variant="outline">
                <Link href={`/projects/${id}/edit`}>Edit Project</Link>
              </Button>
            )}

            <ArchiveProjectButton projectId={id} archived={project.archived} />

            {!project.archived && <DeleteProjectButton projectId={id} />}
          </div>
        }
      />

      {project.archived && <ArchivedProjectBanner projectId={id} />}

      <div className="mt-4">
        {project.archived && <ArchivedBadge />}
      </div>

      <ProjectTabs projectId={id} />

      {!project.archived && (
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <EditProjectMetaCard
            projectId={id}
            label="Audit Type"
            value={project.audit_type}
            field="audit_type"
            type="select"
            options={[
              "Onboarding",
              "SaaS",
              "Mobile App",
              "Ecommerce",
              "Accessibility",
              "Dashboard",
            ]}
          />

          <EditProjectMetaCard
            projectId={id}
            label="Status"
            value={project.status}
            field="status"
            type="select"
            options={["In Progress", "In Review", "Completed"]}
          />

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Client
            </p>
            {client ? (
              <Link
                href={`/clients/${client.id}`}
                className="mt-2 block text-sm font-semibold text-violet-700 hover:text-violet-800"
              >
                {client.name}
              </Link>
            ) : (
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {project.client_name || "No client"}
              </p>
            )}
          </Card>
        </section>
      )}

      {project.archived && (
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Audit Type
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {project.audit_type || "—"}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {project.status || "—"}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Client
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {client ? client.name : project.client_name || "—"}
            </p>
          </Card>
        </section>
      )}

      <section className="mt-8">
        <SectionHeader
          title="Findings"
          description="Review, prioritize, and annotate issues found during the audit."
          action={
            !project.archived ? (
              <Button asChild>
                <Link href={`/projects/${id}/findings/new`}>+ Add Finding</Link>
              </Button>
            ) : undefined
          }
        />

        {findings.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No findings yet"
            description={
              project.archived
                ? "This archived project has no findings."
                : "Start documenting usability issues, friction points, and recommendations for this audit."
            }
            actionLabel={!project.archived ? "Add Finding" : undefined}
            actionHref={!project.archived ? `/projects/${id}/findings/new` : undefined}
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-4 bg-slate-100 p-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <span>Finding</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Recommendation</span>
            </div>

            {findings.map((finding) => (
              <Link
                key={finding.id}
                href={`/projects/${id}/findings/${finding.id}`}
                className="grid grid-cols-4 items-center border-t border-slate-100 p-4 text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-950">
                  {finding.title}
                </span>

                <SeverityBadge severity={finding.severity} />
                <StatusBadge status={finding.status} />

                <span className="truncate text-slate-600">
                  {finding.recommendation || "—"}
                </span>
              </Link>
            ))}
          </Card>
        )}
      </section>
    </PageShell>
  );
}