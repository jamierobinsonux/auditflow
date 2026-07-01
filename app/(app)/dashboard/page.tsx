import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  FileText,
  FolderKanban,
  Lightbulb,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDisplayName } from "@/lib/format-name";
import { FreePlanUsageCard } from "@/components/free-plan-usage-card";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { WelcomeBanner } from "@/components/welcome-banner";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AuditTypeBadge } from "@/components/ui/audit-type-badge";
import type { Project } from "@/types/project";
import type { Finding } from "@/types/finding";

type ReportExport = {
  id: string;
  project_id: string;
  title: string | null;
  template: string | null;
  created_at: string;
};

type StudioRecommendation = {
  id: string;
  updated_at?: string | null;
  created_at: string;
};

type ClientLite = {
  id: string;
  name: string;
  updated_at?: string | null;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rawName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0];

  const displayName = formatDisplayName(rawName);

  const [
    { data: projectData },
    { data: findingData },
    { data: evidenceData },
    { data: subscription },
    { data: reportData },
    { data: clientData },
    { data: recommendationData },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", user?.id)
      .eq("archived", false)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase.from("findings").select("*").eq("user_id", user?.id),
    supabase
      .from("finding_images")
      .select("id, finding_id")
      .eq("user_id", user?.id),
    supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user?.id)
      .maybeSingle(),
    supabase
      .from("report_exports")
      .select("id,project_id,title,template,created_at")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("id,name,created_at,updated_at")
      .eq("user_id", user?.id)
      .order("updated_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("studio_recommendations")
      .select("id,created_at,updated_at")
      .eq("user_id", user?.id)
      .order("updated_at", { ascending: false, nullsFirst: false }),
  ]);

  const currentPlan = subscription?.plan || "Free";
  const isFreePlan = currentPlan === "Free";
  const isStudioPlan = currentPlan === "Studio" || currentPlan === "studio";

  const projects = (projectData ?? []) as Project[];
  const activeProjectIds = projects.map((project) => project.id);
  const findings = ((findingData ?? []) as Finding[]).filter((finding) =>
    activeProjectIds.includes(finding.project_id)
  );
  const reportExports = (reportData ?? []) as ReportExport[];
  const clients = (clientData ?? []) as ClientLite[];
  const recommendations = (recommendationData ?? []) as StudioRecommendation[];

  const activeFindingIds = findings.map((finding) => finding.id);
  const evidence = (evidenceData ?? []).filter((item) =>
    activeFindingIds.includes(item.finding_id)
  );

  const totalProjects = projects.length;
  const totalFindings = findings.length;
  const totalEvidence = evidence.length;
  const totalRecommendations = findings.filter((f) => f.recommendation).length;
  const completedAudits = projects.filter((p) => p.status === "Completed").length;
  const completedReports = reportExports.length;
  const openFindings = findings.filter((f) => f.status !== "Resolved").length;


  const projectStatValue = isFreePlan
    ? `${totalProjects} / 1`
    : totalProjects.toString();

  const findingStatValue = isFreePlan
    ? `${totalFindings} / 5`
    : totalFindings.toString();

  const summary =
    totalProjects === 0
      ? "Create your first audit and start organizing UX findings, evidence, journeys, and reports."
      : `You have ${totalProjects} active ${totalProjects === 1 ? "project" : "projects"}, ${openFindings} open ${openFindings === 1 ? "finding" : "findings"}, and ${completedReports} exported ${completedReports === 1 ? "report" : "reports"}.`;

  const activityItems = buildActivityItems({
    projects,
    findings,
    reports: reportExports,
    clients,
    recommendations,
  });

  return (
    <PageShell>
      <PageHeader
        title={`Welcome, ${displayName}`}
        description={summary}
        action={
          <Button asChild size="lg">
            <Link href="/projects/new">+ New Project</Link>
          </Button>
        }
      />

      {totalProjects === 0 && <WelcomeBanner />}

      <FreePlanUsageCard
        plan={currentPlan}
        projectsUsed={totalProjects}
        findingsUsed={totalFindings}
      />

      <OnboardingChecklist
        projectCount={totalProjects}
        findingCount={totalFindings}
        evidenceCount={totalEvidence}
        completedReportCount={completedReports}
        latestProjectId={projects[0]?.id}
        latestFindingProjectId={findings[0]?.project_id}
        latestFindingId={findings[0]?.id}
      />

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={projectStatValue} label="Projects" meta="Active audit workspaces" />
        <StatCard value={findingStatValue} label="Findings" meta={`${openFindings} open`} />
        <StatCard value={completedReports.toString()} label="Reports" meta="Generated deliverables" />
        <StatCard
          value={isStudioPlan ? clients.length.toString() : completedAudits.toString()}
          label={isStudioPlan ? "Clients" : "Completed Audits"}
          meta={isStudioPlan ? "Studio workspaces" : "Finished projects"}
        />
      </section>

      <section className="mt-6 space-y-6">
        {projects.length > 0 && (
          <section>
            <SectionHeader title="Recent projects" />

            <Card className="mt-5 overflow-hidden">
              <div className="grid grid-cols-[2fr_1.1fr_1fr_0.8fr_1fr] bg-slate-100 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <span>Project</span>
                <span>Type</span>
                <span>Updated</span>
                <span>Findings</span>
                <span>Status</span>
              </div>

              {projects.slice(0, 6).map((project) => {
                const projectFindings = findings.filter(
                  (finding) => finding.project_id === project.id
                );

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="grid grid-cols-[2fr_1.1fr_1fr_0.8fr_1fr] items-center border-t border-slate-100 px-6 py-4 text-sm transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">
                        {project.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {project.website_url || "No website"}
                      </p>
                    </div>

                    <AuditTypeBadge type={project.audit_type} />

                    <span className="font-medium text-slate-600">
                      {formatDate(project.updated_at || project.created_at)}
                    </span>

                    <span className="font-medium text-slate-600">
                      {projectFindings.length}
                    </span>

                    <StatusBadge status={project.status} />
                  </Link>
                );
              })}
            </Card>
          </section>
        )}

        <section>
          <SectionHeader title="Recent activity" />
          <Card className="mt-5 divide-y divide-slate-100 overflow-hidden">
            {activityItems.length > 0 ? (
              activityItems.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="flex items-start gap-3 px-5 py-4 text-sm transition hover:bg-slate-50"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                    <item.icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-950">{item.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">{item.meta}</span>
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-5 text-sm leading-6 text-slate-500">
                Activity will appear here as you create projects, add findings, and export reports.
              </div>
            )}
          </Card>
        </section>
      </section>
    </PageShell>
  );
}

function StatCard({
  value,
  label,
  meta,
}: {
  value: string;
  label: string;
  meta: string;
}) {
  return (
    <Card className="px-6 py-5">
      <p className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-3 text-xs text-slate-500">{meta}</p>
    </Card>
  );
}

function buildActivityItems({
  projects,
  findings,
  reports,
  clients,
  recommendations,
}: {
  projects: Project[];
  findings: Finding[];
  reports: ReportExport[];
  clients: ClientLite[];
  recommendations: StudioRecommendation[];
}) {
  return [
    ...reports.map((report) => ({
      id: report.id,
      type: "report",
      title: report.title || "Report exported",
      meta: `Report exported ${formatRelativeDate(report.created_at)}`,
      href: "/reports",
      date: report.created_at,
      icon: FileText,
    })),
    ...projects.map((project) => ({
      id: project.id,
      type: "project",
      title: project.name,
      meta: `Project updated ${formatRelativeDate(project.updated_at || project.created_at)}`,
      href: `/projects/${project.id}`,
      date: project.updated_at || project.created_at,
      icon: FolderKanban,
    })),
    ...findings.map((finding) => ({
      id: finding.id,
      type: "finding",
      title: finding.title || "Finding added",
      meta: `Finding updated ${formatRelativeDate(finding.updated_at || finding.created_at)}`,
      href: `/projects/${finding.project_id}`,
      date: finding.updated_at || finding.created_at,
      icon: AlertTriangle,
    })),
    ...clients.map((client) => ({
      id: client.id,
      type: "client",
      title: client.name,
      meta: `Client updated ${formatRelativeDate(client.updated_at || client.created_at)}`,
      href: `/clients/${client.id}`,
      date: client.updated_at || client.created_at,
      icon: Building2,
    })),
    ...recommendations.map((recommendation) => ({
      id: recommendation.id,
      type: "recommendation",
      title: "Recommendation updated",
      meta: `Saved ${formatRelativeDate(recommendation.updated_at || recommendation.created_at)}`,
      href: "/recommendations",
      date: recommendation.updated_at || recommendation.created_at,
      icon: Lightbulb,
    })),
  ]
    .filter((item) => Boolean(item.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeDate(date: string) {
  const timestamp = new Date(date).getTime();
  const diffMs = Date.now() - timestamp;
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (Number.isNaN(timestamp)) return "recently";
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return formatDate(date);
}
