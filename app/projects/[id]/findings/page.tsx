import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Finding } from "@/types/finding";

export default async function FindingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabase
    .from("findings")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const findings = (data ?? []) as Finding[];

  return (
    <main className="min-h-screen bg-slate-50 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/projects/${id}`} className="text-sm text-violet-600">
            ← Back to Project
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Findings</h1>
        </div>

        <Link
          href={`/projects/${id}/findings/new`}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white"
        >
          + Add Finding
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="grid grid-cols-4 border-b p-4 text-sm font-medium text-slate-500">
          <span>Finding</span>
          <span>Severity</span>
          <span>Status</span>
          <span>Recommendation</span>
        </div>

        {findings.map((finding) => (
          <div
            key={finding.id}
            className="grid grid-cols-4 border-b p-4 text-sm"
          >
            <span className="font-medium">{finding.title}</span>
            <span>{finding.severity}</span>
            <span>{finding.status}</span>
            <span className="truncate">{finding.recommendation}</span>
          </div>
        ))}

        {findings.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No findings yet.</p>
        )}
      </div>
    </main>
  );
}