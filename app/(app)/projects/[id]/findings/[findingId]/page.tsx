import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectTabs } from "@/components/project-tabs";
import { EvidenceGallery } from "@/components/evidence-gallery";
import { DeleteFindingButton } from "@/components/delete-finding-button";

export default async function FindingViewPage({
  params,
}: {
  params: Promise<{ id: string; findingId: string }>;
}) {
  const { id, findingId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: finding } = await supabase
    .from("findings")
    .select("*")
    .eq("id", findingId)
    .eq("project_id", id)
    .eq("user_id", user?.id)
    .single();

  const { data: images } = await supabase
    .from("finding_images")
    .select("*")
    .eq("finding_id", findingId)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: true });

  if (!finding) return <main className="p-10">Finding not found.</main>;

  return (
    <main className="p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold">{finding.title}</h1>

          <div className="mt-3 flex gap-2">
            <span className="rounded-lg bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
              {finding.severity}
            </span>
            <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              {finding.status}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/projects/${id}/findings/${findingId}/edit`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Edit Finding
          </Link>

          <DeleteFindingButton projectId={id} findingId={findingId} />
        </div>
      </div>

      <ProjectTabs projectId={id} />

      <div className="mt-6 space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-[16px] font-semibold">Description</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {finding.description || "No description added."}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-[16px] font-semibold">Recommendation</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {finding.recommendation || "No recommendation added."}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-[16px] font-semibold">Evidence</h2>
          <EvidenceGallery images={images ?? []} />
        </section>
      </div>
    </main>
  );
}