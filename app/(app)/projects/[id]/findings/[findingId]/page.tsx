import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { FindingImage } from "@/types/finding";

export default async function FindingViewPage({
  params,
}: {
  params: Promise<{ id: string; findingId: string }>;
}) {
  const { id, findingId } = await params;

  const { data: finding } = await supabase
    .from("findings")
    .select("*")
    .eq("id", findingId)
    .single();

  const { data: images } = await supabase
    .from("finding_images")
    .select("*")
    .eq("finding_id", findingId)
    .order("created_at", { ascending: true });

  const evidenceImages = (images ?? []) as FindingImage[];

  if (!finding) {
    return <main className="p-10">Finding not found.</main>;
  }

  return (
    <main className="min-h-screen bg-[#F1F5F9] p-10 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/projects/${id}/findings`} className="text-sm text-violet-600">
            ← Back to Findings
          </Link>

          <h1 className="mt-4 text-[24px] font-semibold text-slate-950">
            {finding.title}
          </h1>

          <div className="mt-3 flex gap-2 text-sm">
            <span className="rounded-lg bg-violet-100 px-3 py-1 font-medium text-violet-700">
              {finding.severity}
            </span>
            <span className="rounded-lg bg-blue-100 px-3 py-1 font-medium text-blue-700">
              {finding.status}
            </span>
          </div>
        </div>

        <Link
          href={`/projects/${id}/findings/${findingId}/edit`}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm"
        >
          Edit Finding
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[16px] font-semibold">Description</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {finding.description || "No description added."}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold">Recommendation</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {finding.recommendation || "No recommendation added."}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold">Evidence</h2>

        {evidenceImages.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">No evidence images added.</p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {evidenceImages.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-xl border border-slate-200">
              <img src={image.image_url} alt={image.caption || "Evidence image"} className="w-full" />
              {image.caption && (
                <p className="p-3 text-sm text-slate-600">{image.caption}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}