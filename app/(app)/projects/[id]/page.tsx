import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProjectTabs } from "@/components/project-tabs";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { EditProjectMetaCard } from "@/components/edit-project-meta-card";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
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

  if (!project) return <PageShell>Project not found.</PageShell>;

  return (
    <PageShell>
      <PageHeader
        title={project.name}
        description={project.website_url || "No website provided"}
        action={
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/projects/${id}/edit`}>Edit Project</Link>
            </Button>

            <DeleteProjectButton projectId={id} />
          </div>
        }
      />

      <ProjectTabs projectId={id} />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
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
      </section>

      <section className="mt-8">
        <SectionHeader
          title="Findings"
          description="Review, prioritize, and annotate issues found during the audit."
          action={
            <Button asChild>
              <Link href={`/projects/${id}/findings/new`}>+ Add Finding</Link>
            </Button>
          }
        />

        {findings.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No findings yet"
            description="Start documenting usability issues, friction points, and recommendations for this audit."
            actionLabel="Add Finding"
            actionHref={`/projects/${id}/findings/new`}
          />
        ) : (
          <Card className="overflow-hidden">
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
                className="grid grid-cols-4 items-center border-t border-slate-100 p-4 text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-950">
                  {finding.title}
                </span>

                <SeverityBadge severity={finding.severity} />

                <StatusBadge status={finding.status} />

                <span className="truncate text-slate-600">
                  {finding.recommendation || "—"}
                </span>
              </Link>
            ))}
          </Card>
        )}
      </section>
    </PageShell>
  );
}