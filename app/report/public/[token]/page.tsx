import { supabaseAdmin } from "@/lib/supabase/admin";
import { hydrateFindingRecommendation, uniqueRecommendationIds, type LinkedRecommendation } from "@/lib/recommendations";


export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: publicReport } = await supabaseAdmin
    .from("public_reports")
    .select("*")
    .eq("share_token", token)
    .is("disabled_at", null)
    .maybeSingle();

  if (!publicReport) {
    return <main className="p-10">Report not found or no longer available.</main>;
  }

  const { data: project } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", publicReport.project_id)
    .maybeSingle();

  if (!project) {
    return <main className="p-10">Project not found.</main>;
  }

  const { data: findings } = await supabaseAdmin
    .from("findings")
    .select("*")
    .eq("project_id", publicReport.project_id)
    .order("severity", { ascending: true });

  const rawFindings = findings ?? [];
  const savedRecommendationIds = uniqueRecommendationIds(rawFindings.map((finding: any) => finding.saved_recommendation_id));
  const frameworkRecommendationIds = uniqueRecommendationIds(rawFindings.map((finding: any) => finding.framework_recommendation_id));

  const [{ data: savedRecommendations }, { data: frameworkRecommendations }] =
    await Promise.all([
      savedRecommendationIds.length
        ? supabaseAdmin
            .from("studio_recommendations")
            .select("id,title,recommendation,category,impact")
            .in("id", savedRecommendationIds)
            .eq("user_id", publicReport.user_id)
        : Promise.resolve({ data: [] as LinkedRecommendation[] }),
      frameworkRecommendationIds.length
        ? supabaseAdmin
            .from("studio_framework_recommendations")
            .select("id,title,recommendation,category,impact")
            .in("id", frameworkRecommendationIds)
            .eq("user_id", publicReport.user_id)
        : Promise.resolve({ data: [] as LinkedRecommendation[] }),
    ]);

  const savedRecommendationById = new Map<string, LinkedRecommendation>(
    ((savedRecommendations ?? []) as LinkedRecommendation[]).map((item) => [
      item.id,
      item,
    ])
  );
  const frameworkRecommendationById = new Map<string, LinkedRecommendation>(
    ((frameworkRecommendations ?? []) as LinkedRecommendation[]).map((item) => [
      item.id,
      item,
    ])
  );

  const hydratedFindings = rawFindings.map((finding: any) =>
    hydrateFindingRecommendation({
      finding,
      savedRecommendations: savedRecommendationById,
      frameworkRecommendations: frameworkRecommendationById,
    })
  );

  return (
    <main className="min-h-screen bg-[#F1F5F9] p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-violet-600">AuditFlow Report</p>
          <h1 className="mt-3 text-[28px] font-semibold text-slate-950">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {project.client_name || "Client report"}
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-[18px] font-semibold">Findings</h2>

          <div className="mt-5 space-y-4">
            {hydratedFindings.map((finding) => (
              <div
                key={finding.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">
                    {finding.severity}
                  </span>
                  <span className="text-xs text-slate-500">
                    {finding.status}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-950">
                  {finding.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {finding.description || "No description added."}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  <strong>Recommendation:</strong>{" "}
                  {finding.recommendation || "No recommendation added."}
                </p>

                {finding.linked_recommendation_title && (
                  <p className="mt-2 text-xs font-medium text-violet-700">
                    Linked recommendation: {finding.linked_recommendation_title}
                  </p>
                )}
              </div>
            ))}

            {hydratedFindings.length === 0 && (
              <p className="text-sm text-slate-500">No findings available.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
