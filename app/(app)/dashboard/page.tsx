import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/project";
import type { Finding } from "@/types/finding";

export default async function DashboardPage() {
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: findingData, error: findingError } = await supabase
    .from("findings")
    .select("*");

  if (projectError || findingError) {
    return (
      <main className="p-8">
        Error: {projectError?.message || findingError?.message}
      </main>
    );
  }

  const projects = (projectData ?? []) as Project[];
  const findings = (findingData ?? []) as Finding[];

  const totalProjects = projects.length;
  const totalFindings = findings.length;
  const totalRecommendations = findings.filter((f) => f.recommendation).length;
  const totalReports = projects.filter((p) => p.status === "Completed").length;

  return (
    <main className="px-12 py-10">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-[36px] tracking-[-0.02em] text-slate-950">
              Welcome back, Jane! 👋
              </h1>
              
              <p className="mt-3 text-[14px] leading-6 text-slate-700">
                Here’s what’s happening with your audits.
                </p>
          </div>

          <Link
            href="/projects/new"
            className="mt-2 rounded-xl bg-violet-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            + New Project
          </Link>
        </header>

        <section className="mt-8 grid grid-cols-4 gap-5">
          <StatCard value={totalProjects.toString()} label="Projects" />
          <StatCard value={totalFindings.toString()} label="Findings" />
          <StatCard
            value={totalRecommendations.toString()}
            label="Recommendations"
          />
          <StatCard value={totalReports.toString()} label="Reports generated" />
        </section>

        <section className="mt-8">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-slate-950">
            Recent Projects
            </h2>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[2fr_1.2fr_1.2fr_0.9fr_1fr] bg-slate-100 px-10 py-5 text-sm font-semibold uppercase tracking-wide text-slate-600">
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
                  className="grid grid-cols-[2fr_1.2fr_1.2fr_0.9fr_1fr] items-center border-t border-slate-100 px-10 py-5 text-sm transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <ProjectIcon name={project.name} />

                    <div>
                      <p className="font-semibold text-slate-950">
                        {project.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {project.website_url || "No website"}
                      </p>
                    </div>
                  </div>

                  <TypeBadge label={project.audit_type || "Audit"} />

                  <span className="font-medium text-slate-600">
                    {formatDate(project.updated_at || project.created_at)}
                  </span>

                  <span className="font-medium text-slate-600">
                    {projectFindings.length}
                  </span>

                  <StatusBadge label={project.status || "In Progress"} />
                </Link>
              );
            })}

            {projects.length === 0 && (
              <div className="border-t border-slate-100 px-10 py-10 text-slate-500">
                No projects yet. Create your first audit project.
              </div>
            )}
          </div>
        </section>
      </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
      <p className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-slate-950">
        {value}
        </p>

      <p className="mt-2 text-[14px] text-slate-900">{label}</p>

      <p className="mt-4 text-sm text-slate-500">Based on current audit data</p>
    </div>
  );
}

function TypeBadge({ label }: { label: string }) {
  return (
    <span
      className={`w-fit rounded-lg px-3 py-1 text-sm font-semibold ${getTypeStyles(
        label
      )}`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ label }: { label: string }) {
  const normalized = label.toLowerCase();

  const styles = normalized.includes("complete")
    ? "bg-green-100 text-green-600"
    : normalized.includes("review")
    ? "bg-violet-100 text-violet-700"
    : "bg-blue-100 text-blue-600";

  return (
    <span className={`w-fit rounded-lg px-3 py-1 text-sm font-semibold ${styles}`}>
      {label}
    </span>
  );
}

function ProjectIcon({ name }: { name: string }) {
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-semibold text-violet-700">
      {firstLetter}
    </div>
  );
}

function getTypeStyles(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("mobile")) return "bg-blue-100 text-blue-700";
  if (normalized.includes("ecommerce")) return "bg-amber-100 text-amber-700";
  if (normalized.includes("dashboard")) return "bg-rose-100 text-rose-700";
  if (normalized.includes("saas")) return "bg-green-100 text-green-700";

  return "bg-violet-100 text-violet-700";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}