import Link from "next/link";
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

const { data: projectData } = await supabase
  .from("projects")
  .select("*")
  .eq("user_id", user?.id)
  .eq("archived", false)
  .order("created_at", { ascending: false });

  const { data: findingData } = await supabase
    .from("findings")
    .select("*")
    .eq("user_id", user?.id);

const { data: evidenceData } = await supabase
  .from("finding_images")
  .select("id, finding_id")
  .eq("user_id", user?.id);

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user?.id)
    .maybeSingle();

  const currentPlan = subscription?.plan || "Free";

  const projects = (projectData ?? []) as Project[];
  const activeProjectIds = projects.map((project) => project.id);

const findings = ((findingData ?? []) as Finding[]).filter((finding) =>
  activeProjectIds.includes(finding.project_id)
);

  const totalProjects = projects.length;
  const totalFindings = findings.length;
  const activeFindingIds = findings.map((finding) => finding.id);

const totalEvidence =
  evidenceData?.filter((evidence) =>
    activeFindingIds.includes(evidence.finding_id)
  ).length ?? 0;
  const totalRecommendations = findings.filter((f) => f.recommendation).length;
  const completedAudits = projects.filter(
    (p) => p.status === "Completed"
  ).length;
const { data: reportExports } = await supabase
  .from("report_exports")
  .select("id")
  .eq("user_id", user?.id);

const completedReports = reportExports?.length ?? 0;
  const openFindings = findings.filter((f) => f.status !== "Resolved").length;

  const isFreePlan = currentPlan === "Free";

  const projectStatValue = isFreePlan
    ? `${totalProjects} / 3`
    : totalProjects.toString();

  const findingStatValue = isFreePlan
    ? `${totalFindings} / 25`
    : totalFindings.toString();

  const summary =
    totalProjects === 0
      ? "Let's create your first UX audit project."
      : `You have ${totalProjects} ${
          totalProjects === 1 ? "project" : "projects"
        }, ${totalFindings} ${
          totalFindings === 1 ? "finding" : "findings"
        }, and ${openFindings} open ${
          openFindings === 1 ? "finding" : "findings"
        }.`;

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

      <section className="mt-8 grid grid-cols-4 gap-5">
        <StatCard value={projectStatValue} label="Projects" />
        <StatCard value={findingStatValue} label="Findings" />
        <StatCard
          value={totalRecommendations.toString()}
          label="Recommendations"
        />
        <StatCard value={completedAudits.toString()} label="Completed Audits" />
      </section>

      {projects.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Recent Projects" />

          <Card className="overflow-hidden">
            <div className="grid grid-cols-[2fr_1.2fr_1.2fr_0.9fr_1fr] bg-slate-100 px-10 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <span>Project</span>
              <span>Type</span>
              <span>Last Updated</span>
              <span>Findings</span>
              <span>Status</span>
            </div>

            {projects.map((project) => {
              const projectFindings = findings.filter(
                (finding) => finding.project_id === project.id
              );

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="grid grid-cols-[2fr_1.2fr_1.2fr_0.9fr_1fr] items-center border-t border-slate-100 px-10 py-4 text-sm transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {project.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
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
    </PageShell>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <Card className="px-6 py-5">
      <p className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-900">{label}</p>
      <p className="mt-3 text-xs text-slate-500">Based on your audit data</p>
    </Card>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}