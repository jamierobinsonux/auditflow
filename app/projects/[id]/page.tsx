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
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">Project not found.</h1>
        <p className="mt-2 text-gray-500">
          The project may have been deleted or the ID is invalid.
        </p>

        <Link
          href="/dashboard"
          className="mt-4 inline-block text-violet-600"
        >
          ← Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-violet-600"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          {project.name}
        </h1>

        <p className="mt-1 text-slate-500">
          {project.website_url || "No website provided"}
        </p>
      </div>

      <nav className="flex gap-6 border-b pb-4 text-sm">
        <Link
          href={`/projects/${id}`}
          className="font-medium text-violet-600"
        >
          Overview
        </Link>

        <Link
          href={`/projects/${id}/findings`}
          className="text-slate-600 hover:text-slate-950"
        >
          Findings
        </Link>

        <Link
          href={`/projects/${id}/report`}
          className="text-slate-600 hover:text-slate-950"
        >
          Report
        </Link>
      </nav>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          title="Audit Type"
          value={project.audit_type}
        />

        <InfoCard
          title="Status"
          value={project.status}
        />

        <InfoCard
          title="Client"
          value={project.client_name}
        />
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Next Steps
        </h2>

        <p className="mt-2 text-slate-500">
          Add findings, prioritize issues, and generate a report.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href={`/projects/${id}/findings/new`}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white"
          >
            + Add Finding
          </Link>

          <Link
            href={`/projects/${id}/findings`}
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            View Findings
          </Link>

          <Link
            href={`/projects/${id}/report`}
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            View Report
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-semibold text-slate-950">
        {value || "—"}
      </p>
    </div>
  );
}