import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectTabs } from "@/components/project-tabs";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { EditProjectMetaCard } from "@/components/edit-project-meta-card";
import type { Finding } from "@/types/finding";

export default async function ProjectDetailPage({
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
    .maybeSingle();

  const { data: findingData } = await supabase
    .from("findings")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const findings = (findingData ?? []) as Finding[];

  if (!project) return <main className="p-10">Project not found.</main>;

  return (
    <main className="p-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-slate-950">
            {project.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {project.website_url || "No website provided"}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/projects/${id}/edit`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Edit Project
          </Link>

          <DeleteProjectButton projectId={id} />
        </div>
      </div>

      <ProjectTabs projectId={id} />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <EditProjectMetaCard
          projectId={id}
          label="Audit Type"
          value={project.audit_type}
          field="audit_type"
          type="select"
          options={[
            "Onboarding",
            "SaaS",
            "Mobile App",
            "Ecommerce",
            "Accessibility",
            "Dashboard",
          ]}
        />

        <EditProjectMetaCard
          projectId={id}
          label="Status"
          value={project.status}
          field="status"
          type="select"
          options={["In Progress", "In Review", "Completed"]}
        />

        <EditProjectMetaCard
          projectId={id}
          label="Client"
          value={project.client_name}
          field="client_name"
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-slate-950">
              Findings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review, prioritize, and annotate issues found during the audit.
            </p>
          </div>

          <Link
            href={`/projects/${id}/findings/new`}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            + Add Finding
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-4 bg-slate-100 p-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <span>Finding</span>
            <span>Severity</span>
            <span>Status</span>
            <span>Recommendation</span>
          </div>

          {findings.map((finding) => (
            <Link
              key={finding.id}
              href={`/projects/${id}/findings/${finding.id}`}
              className="grid grid-cols-4 border-t border-slate-100 p-4 text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-950">
                {finding.title}
              </span>
              <span>{finding.severity}</span>
              <span>{finding.status}</span>
              <span className="truncate">
                {finding.recommendation || "—"}
              </span>
            </Link>
          ))}

          {findings.length === 0 && (
            <p className="border-t border-slate-100 p-6 text-sm text-slate-500">
              No findings yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}