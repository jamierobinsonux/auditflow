import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Finding } from "@/types/finding";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  const { data: findings } = await supabase
    .from("findings")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const findingList = (findings ?? []) as Finding[];

  if (!project) {
    return <main className="p-8">Project not found.</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 space-y-8">
      <div>
        <Link href={`/projects/${id}`} className="text-sm text-violet-600">
          ← Back to Project
        </Link>

        <h1 className="mt-4 text-3xl font-bold">{project.name} Report</h1>
        <p className="text-slate-500">UX Audit Report Preview</p>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Executive Summary</h2>
        <p className="text-slate-600">
          This audit reviews the user experience of {project.name}, with a focus
          on usability, friction points, and opportunities to improve conversion.
        </p>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Key Findings</h2>

        {findingList.map((finding) => (
          <div key={finding.id} className="border-b py-4">
            <p className="font-semibold">
              {finding.severity}: {finding.title}
            </p>
            <p className="text-slate-600">{finding.description}</p>
            <p className="text-sm text-slate-500">
              Recommendation: {finding.recommendation}
            </p>
          </div>
        ))}

        {findingList.length === 0 && (
          <p className="text-slate-500">No findings added yet.</p>
        )}
      </section>
    </main>
  );
}