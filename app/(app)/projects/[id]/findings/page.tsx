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
    <main className="min-h-screen bg-[#F1F5F9] p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/projects/${id}`} className="text-sm text-violet-600">
            ← Back to Project
          </Link>
          <h1 className="mt-4 text-[24px] font-semibold">Findings</h1>
        </div>

        <Link
          href={`/projects/${id}/findings/new`}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"
        >
          + Add Finding
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-4 bg-slate-100 p-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <span>Finding</span>
          <span>Severity</span>
          <span>Status</span>
          <span>Recommendation</span>
        </div>

        {findings.map((finding) => (
          <Link
            key={finding.id}
            href={`/projects/${id}/findings/${finding.id}/edit`}
            className="grid grid-cols-4 border-t border-slate-100 p-4 text-sm transition hover:bg-slate-50"
          >
            <span className="font-medium">{finding.title}</span>
            <span>{finding.severity}</span>
            <span>{finding.status}</span>
            <span className="truncate">{finding.recommendation}</span>
          </Link>
        ))}

        {findings.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No findings yet.</p>
        )}
      </div>
    </main>
  );
}