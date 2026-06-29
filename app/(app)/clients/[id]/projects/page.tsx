import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { formatClientDate } from "@/lib/studio";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { AuditTypeBadge } from "@/components/ui/audit-type-badge";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import { ClientWorkspaceTabs } from "@/components/client-workspace-tabs";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";

export default async function ClientProjectsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const subscription = await getUserSubscription(user.id);

  if (!subscription.isStudio) {
    return (
      <UpgradeRequiredCard
        title="Client projects are available on Studio"
        description="Upgrade to Studio to organize projects by client workspace."
      />
    );
  }

  const [{ data: clientData }, { data: projectData }] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("*")
      .eq("client_id", id)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (!clientData) return <PageShell>Client not found.</PageShell>;

  const client = clientData as Client;
  const projects = (projectData ?? []) as Project[];

  return (
    <PageShell>
      <PageHeader
        title={`${client.name} Projects`}
        description="Manage all audit projects connected to this client."
        action={
          <Button asChild>
            <Link href={`/projects/new?clientId=${client.id}`}>+ New Project</Link>
          </Button>
        }
      />
      <ClientWorkspaceTabs clientId={client.id} active="projects" />

      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create a project for this client to start organizing audit work."
            actionLabel="Create Project"
            actionHref={`/projects/new?clientId=${client.id}`}
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-slate-100 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <span>Project</span>
            <span>Type</span>
            <span>Status</span>
            <span>Updated</span>
          </div>
          <div className="divide-y divide-slate-100">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-6 py-5 text-sm transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-semibold text-slate-950">{project.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{project.website_url || "No website"}</p>
                </div>
                <AuditTypeBadge type={project.audit_type} />
                <StatusBadge status={project.status} />
                <span className="text-slate-500">{formatClientDate(project.updated_at || project.created_at)}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
}
