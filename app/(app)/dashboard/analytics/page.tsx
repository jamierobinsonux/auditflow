import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Finding } from "@/types/finding";
import type { Project } from "@/types/project";

export default async function AnalyticsDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projectsData } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user?.id);

  const { data: findingsData } = await supabase
    .from("findings")
    .select("*")
    .eq("user_id", user?.id);

  const projects = (projectsData ?? []) as Project[];
  const findings = (findingsData ?? []) as Finding[];

  const severityItems = [
    { label: "P0 Critical", value: count(findings, "severity", "P0"), color: "#EF4444" },
    { label: "P1 High", value: count(findings, "severity", "P1"), color: "#F97316" },
    { label: "P2 Medium", value: count(findings, "severity", "P2"), color: "#F59E0B" },
    { label: "P3 Low", value: count(findings, "severity", "P3"), color: "#3B82F6" },
  ];

  const findingStatusItems = [
    { label: "Open", value: count(findings, "status", "Open"), color: "#3B82F6" },
    { label: "In Progress", value: count(findings, "status", "In Progress"), color: "#8B5CF6" },
    { label: "In Review", value: count(findings, "status", "In Review"), color: "#F59E0B" },
    { label: "Resolved", value: count(findings, "status", "Resolved"), color: "#22C55E" },
  ];

  const projectStatusItems = [
    { label: "In Progress", value: projects.filter((p) => p.status === "In Progress").length, color: "#8B5CF6" },
    { label: "In Review", value: projects.filter((p) => p.status === "In Review").length, color: "#F59E0B" },
    { label: "Completed", value: projects.filter((p) => p.status === "Completed").length, color: "#22C55E" },
  ];

  const highImpact = findings.filter((f) => f.impact === "High").length;
  const quickWins = findings.filter(
    (f) => f.impact === "High" && f.effort === "Low"
  ).length;

  const avgFindings =
    projects.length > 0 ? Math.round((findings.length / projects.length) * 10) / 10 : 0;

  const projectsWithCounts = projects
    .map((project) => ({
      ...project,
      findingCount: findings.filter((finding) => finding.project_id === project.id).length,
      openCount: findings.filter(
        (finding) => finding.project_id === project.id && finding.status !== "Resolved"
      ).length,
    }))
    .sort((a, b) => b.findingCount - a.findingCount)
    .slice(0, 5);

  return (
    <main className="p-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-slate-950">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Portfolio and finding-level insights across your audit work.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Dashboard
        </Link>
      </div>

      <SectionHeading
        title="Portfolio Overview"
        description="Project-level health across your audit portfolio."
      />

      <section className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="Total projects" value={projects.length} helper="All audit projects" />
        <StatCard label="Total findings" value={findings.length} helper="Across all projects" />
        <StatCard label="Avg. findings / project" value={avgFindings} helper="Audit size indicator" />
        <StatCard
          label="Completed projects"
          value={projects.filter((p) => p.status === "Completed").length}
          helper="Project status = completed"
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card
          title="Projects by status"
          description="Current status of your audit projects."
        >
          <DonutChart items={projectStatusItems} totalLabel="Projects" />
        </Card>

        <Card
          title="Findings by project"
          description="Top projects by finding volume."
        >
          <ProjectFindingList projects={projectsWithCounts} />
        </Card>
      </section>

      <SectionHeading
        title="Finding Analytics"
        description="Finding-level severity, workflow, and prioritization insights."
      />

      <section className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="High impact findings" value={highImpact} helper="Impact = High" />
        <StatCard label="Quick wins" value={quickWins} helper="High impact / low effort" />
        <StatCard
          label="Open findings"
          value={findings.filter((f) => f.status !== "Resolved").length}
          helper="Not yet resolved"
        />
        <StatCard
          label="Resolved findings"
          value={findings.filter((f) => f.status === "Resolved").length}
          helper="Completed fixes"
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card
          title="Finding severity"
          description="Breakdown of findings by priority level across all projects."
        >
          <DonutChart items={severityItems} totalLabel="Findings" />
        </Card>

        <Card
          title="Finding workflow"
          description="Distribution of findings by workflow stage."
        >
          <DonutChart items={findingStatusItems} totalLabel="Findings" />
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card
          title="Prioritization matrix"
          description="Impact and effort breakdown for scoped findings."
        >
          <div className="grid grid-cols-2 gap-3">
            <MatrixCell
              title="Quick Wins"
              subtitle="High impact / Low effort"
              count={quickWins}
            />
            <MatrixCell
              title="Strategic Bets"
              subtitle="High impact / High effort"
              count={
                findings.filter(
                  (f) => f.impact === "High" && f.effort === "High"
                ).length
              }
            />
            <MatrixCell
              title="Small Fixes"
              subtitle="Low impact / Low effort"
              count={
                findings.filter(
                  (f) => f.impact === "Low" && f.effort === "Low"
                ).length
              }
            />
            <MatrixCell
              title="Deprioritize"
              subtitle="Low impact / High effort"
              count={
                findings.filter(
                  (f) => f.impact === "Low" && f.effort === "High"
                ).length
              }
            />
          </div>
        </Card>

        <Card
          title="Highest priority findings"
          description="P0 and P1 findings that need attention first."
        >
          <PriorityList findings={findings} />
        </Card>
      </section>
    </main>
  );
}

function count(items: Finding[], key: keyof Finding, value: string) {
  return items.filter((item) => item[key] === value).length;
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-10">
      <h2 className="text-[20px] font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[24px] font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-[18px] font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function DonutChart({
  items,
  totalLabel,
}: {
  items: { label: string; value: number; color: string }[];
  totalLabel: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  let runningPercent = 0;

  const gradient =
    total === 0
      ? "#E2E8F0 0deg 360deg"
      : items
          .map((item) => {
            const start = runningPercent;
            const percent = (item.value / total) * 100;
            runningPercent += percent;

            return `${item.color} ${start * 3.6}deg ${runningPercent * 3.6}deg`;
          })
          .join(", ");

  return (
    <div className="flex items-center gap-8">
      <div
        className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute h-28 w-28 rounded-full bg-white" />
        <div className="relative text-center">
          <p className="text-[28px] font-semibold text-slate-950">{total}</p>
          <p className="text-xs text-slate-500">{totalLabel}</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                </div>

                <span className="text-slate-500">
                  {item.value} / {percent}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectFindingList({
  projects,
}: {
  projects: (Project & { findingCount: number; openCount: number })[];
}) {
  if (projects.length === 0) {
    return <p className="text-sm text-slate-500">No projects yet.</p>;
  }

  const max = Math.max(...projects.map((project) => project.findingCount), 1);

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const percent = Math.round((project.findingCount / max) * 100);

        return (
          <div key={project.id}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-slate-700">{project.name}</p>
                <p className="text-xs text-slate-500">
                  {project.openCount} open findings
                </p>
              </div>
              <span className="text-slate-500">
                {project.findingCount} findings
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-600"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatrixCell({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[24px] font-semibold text-slate-950">{count}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function PriorityList({ findings }: { findings: Finding[] }) {
  const topFindings = findings
    .filter((f) => f.severity === "P0" || f.severity === "P1")
    .slice(0, 5);

  if (topFindings.length === 0) {
    return <p className="text-sm text-slate-500">No P0 or P1 findings yet.</p>;
  }

  return (
    <div className="space-y-3">
      {topFindings.map((finding) => (
        <div
          key={finding.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">
              {finding.severity}
            </span>
            <span className="text-xs text-slate-500">{finding.status}</span>
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {finding.title}
          </p>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {finding.recommendation || "No recommendation added."}
          </p>
        </div>
      ))}
    </div>
  );
}