import Link from "next/link";
import { ChevronDown, ClipboardList, Search } from "lucide-react";
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
import { AutoSubmitForm } from "@/components/auto-submit-form";
import type { Finding } from "@/types/finding";
import { hydrateFindingRecommendation, uniqueRecommendationIds, type LinkedRecommendation } from "@/lib/recommendations";


export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ findingQ?: string; sort?: string }>;
}) {
  const { id } = await params;
  const { findingQ = "", sort = "newest" } = await searchParams;
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
  const savedRecommendationIds = uniqueRecommendationIds(rawFindings.map((finding: any) => finding.saved_recommendation_id));
  const frameworkRecommendationIds = uniqueRecommendationIds(rawFindings.map((finding: any) => finding.framework_recommendation_id));

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
  const findings = sortFindings(
    rawFindings
      .map((finding: any) =>
        hydrateFindingRecommendation({
          finding,
          savedRecommendations: savedRecommendationById,
          frameworkRecommendations: frameworkRecommendationById,
        })
      )
      .filter((finding: any) => {
        const query = findingQ.trim().toLowerCase();
        if (!query) return true;
        return [finding.title, finding.description, finding.category, finding.recommendation, finding.status, finding.severity]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      }),
    sort
  );

  if (!project) return <PageShell>Project not found.</PageShell>;

  return (
    <PageShell>
      <PageHeader
        title={project.name}
        description={project.website_url || "No website provided"}
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
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

        {rawFindings.length > 0 && (
          <AutoSubmitForm className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]" action={`/projects/${id}`}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                name="findingQ"
                defaultValue={findingQ}
                placeholder="Search findings..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </div>
            <div className="relative min-w-[180px]">
              <select
                name="sort"
                defaultValue={sort}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-14 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="severity">Severity: P0 to P3</option>
                <option value="severity-desc">Severity: P3 to P0</option>
                <option value="status">Status</option>
                <option value="journey">Journey</option>
                <option value="title">Title A-Z</option>
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
            </div>
          </AutoSubmitForm>
        )}

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
            <div className="hidden grid-cols-[minmax(260px,1.5fr)_120px_140px_minmax(220px,1.2fr)] items-center gap-8 bg-slate-100 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600 md:grid">
              <span className="min-w-0">Finding</span>
              <span>Severity</span>
              <span>Status</span>
              <span className="min-w-0">Recommendation</span>
            </div>

            {findings.map((finding) => (
              <Link
                key={finding.id}
                href={`/projects/${id}/findings/${finding.id}`}
                className="block border-t border-slate-100 px-5 py-4 text-sm hover:bg-slate-50 md:grid md:grid-cols-[minmax(260px,1.5fr)_120px_140px_minmax(220px,1.2fr)] md:items-center md:gap-8 md:px-6"
              >
                <span className="min-w-0 truncate font-medium text-slate-950" title={finding.title}>
                  {finding.title}
                </span>

                <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-0 md:block">
                  <SeverityBadge severity={finding.severity} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 md:mt-0 md:block">
                  <StatusBadge status={finding.status} />
                </div>

                <span className="mt-3 block min-w-0 truncate text-slate-600 md:mt-0" title={finding.recommendation || "—"}>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">Recommendation</span>
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

function sortFindings(findings: any[], sort: string) {
  const severityRank: Record<string, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };
  const statusRank: Record<string, number> = { open: 0, "in progress": 1, "in review": 2, resolved: 3 };

  return [...findings].sort((a, b) => {
    if (sort === "oldest") {
      return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
    }

    if (sort === "severity") {
      return (severityRank[String(a.severity ?? "").toLowerCase()] ?? 99) - (severityRank[String(b.severity ?? "").toLowerCase()] ?? 99);
    }

    if (sort === "severity-desc") {
      return (severityRank[String(b.severity ?? "").toLowerCase()] ?? 99) - (severityRank[String(a.severity ?? "").toLowerCase()] ?? 99);
    }

    if (sort === "status") {
      return (statusRank[String(a.status ?? "").toLowerCase()] ?? 99) - (statusRank[String(b.status ?? "").toLowerCase()] ?? 99);
    }

    if (sort === "journey") {
      return String(a.journey_id ?? "").localeCompare(String(b.journey_id ?? ""));
    }

    if (sort === "title") {
      return String(a.title ?? "").localeCompare(String(b.title ?? ""));
    }

    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
  });
}
