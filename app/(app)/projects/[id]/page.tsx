import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    return <main className="p-8">Project not found.</main>;
  }

  return (
    <main className="min-h-screen bg-[#F1F5F9] p-10 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard" className="text-sm font-medium text-violet-600">
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-[28px] font-semibold">
            {project.name}
          </h1>

          <p className="mt-1 text-[18px] font-semibold">
            {project.website_url || "No website provided"}
          </p>
        </div>

        <Link
          href={`/projects/${id}/edit`}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Edit Project
        </Link>
      </div>

      <nav className="flex gap-6 border-b border-slate-200 pb-4 text-sm">
        <Link href={`/projects/${id}`} className="font-medium text-violet-600">
          Overview
        </Link>
        <Link href={`/projects/${id}/findings`}>Findings</Link>
        <Link href={`/projects/${id}/report`}>Report</Link>
      </nav>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title="Audit Type" value={project.audit_type} />
        <InfoCard title="Status" value={project.status} />
        <InfoCard title="Client" value={project.client_name} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Next Steps</h2>

        <div className="mt-6 flex gap-3">
          <Link
            href={`/projects/${id}/findings/new`}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"
          >
            + Add Finding
          </Link>

          <Link
            href={`/projects/${id}/findings`}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
          >
            View Findings
          </Link>

          <Link
            href={`/projects/${id}/report`}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
          >
            View Report
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">
        {value || "—"}
      </p>
    </div>
  );
}