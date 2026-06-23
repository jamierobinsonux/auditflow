import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/project";

export default async function DashboardPage() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  const projects = (data ?? []) as Project[];

  return (
    <main className="min-h-screen bg-slate-50 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Welcome back 👋</h1>
          <p className="text-slate-500">Here’s what’s happening with your audits.</p>
        </div>

        <Link
          href="/projects/new"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white"
        >
          + New Project
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Findings" value={0} />
        <StatCard label="Recommendations" value={0} />
        <StatCard label="Reports Generated" value={0} />
      </section>

      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4 font-semibold text-slate-900">
          Recent Projects
        </div>

        <div className="divide-y">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="grid grid-cols-4 gap-4 p-4 text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{project.name}</span>
              <span className="text-slate-600">{project.audit_type}</span>
              <span className="text-slate-600">{project.status}</span>
              <span className="text-right text-violet-600">View →</span>
            </Link>
          ))}

          {projects.length === 0 && (
            <p className="p-4 text-sm text-slate-500">No projects yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-3xl font-bold text-violet-600">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}