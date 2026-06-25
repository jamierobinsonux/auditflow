import { createClient } from "@/lib/supabase/server";
import { ProjectTabs } from "@/components/project-tabs";
import { ExportReportButton } from "@/components/export-report-button";
import type { Finding } from "@/types/finding";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user?.id)
    .single();

  const { data: findings } = await supabase
    .from("findings")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const findingList = (findings ?? []) as Finding[];

  if (!project) return <main className="p-10">Project not found.</main>;

  return (
    <main className="p-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-slate-950">
            {project.name} Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            UX audit report preview
          </p>
        </div>

        <ExportReportButton projectId={id} />
      </div>

      <ProjectTabs projectId={id} />

      <section className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-8">
        <div>
          <h2 className="text-[18px] font-semibold">Executive Summary</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This audit reviews the user experience of {project.name}, focusing
            on usability friction, conversion opportunities, and actionable UX
            improvements.
          </p>
        </div>

        <div>
          <h2 className="text-[18px] font-semibold">Project Details</h2>

          <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <p>
              <strong>Client:</strong> {project.client_name || "—"}
            </p>
            <p>
              <strong>Audit Type:</strong> {project.audit_type || "—"}
            </p>
            <p>
              <strong>Status:</strong> {project.status || "—"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-[18px] font-semibold">Key Findings</h2>

          <div className="mt-4 space-y-4">
            {findingList.map((finding) => (
              <div
                key={finding.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">
                    {finding.severity}
                  </span>
                  <span className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
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
              </div>
            ))}

            {findingList.length === 0 && (
              <p className="text-sm text-slate-500">
                No findings have been added yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}