import Link from "next/link";
import { Archive, FolderOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AuditTypeBadge } from "@/components/ui/audit-type-badge";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; clientId?: string }>;
}) {
  const { view, clientId } = await searchParams;
  const showArchived = view === "archived";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("projects")
    .select("*")
    .eq("user_id", user?.id)
    .eq("archived", showArchived)
    .order("created_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const [{ data }, { data: clientsData }] = await Promise.all([
    query,
    supabase
      .from("clients")
      .select("id,name")
      .eq("user_id", user?.id)
      .order("name", { ascending: true }),
  ]);

  const projects = (data ?? []) as Project[];
  const clients = (clientsData ?? []) as Pick<Client, "id" | "name">[];
  const selectedClient = clients.find((client) => client.id === clientId);
  const clientNameById = new Map(clients.map((client) => [client.id, client.name]));

  const baseHref = clientId ? `/projects?clientId=${clientId}` : "/projects";

  return (
    <PageShell>
      <PageHeader
        title={selectedClient ? `${selectedClient.name} Projects` : "Projects"}
        description={
          selectedClient
            ? "Manage projects connected to this client workspace."
            : "Manage active and archived UX audit projects."
        }
        action={
          <Button asChild size="lg">
            <Link href={clientId ? `/projects/new?clientId=${clientId}` : "/projects/new"}>
              + New Project
            </Link>
          </Button>
        }
      />

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Button asChild variant={!showArchived ? "default" : "outline"}>
          <Link href={baseHref}>Active</Link>
        </Button>

        <Button asChild variant={showArchived ? "default" : "outline"}>
          <Link href={clientId ? `/projects?clientId=${clientId}&view=archived` : "/projects?view=archived"}>
            Archived
          </Link>
        </Button>

        {selectedClient && (
          <Button asChild variant="ghost">
            <Link href={`/clients/${selectedClient.id}`}>Back to client</Link>
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={showArchived ? Archive : FolderOpen}
            title={showArchived ? "No archived projects" : "No active projects yet"}
            description={
              showArchived
                ? "Archived projects will appear here when you want to hide completed work from your active dashboard."
                : selectedClient
                ? `Create the first project for ${selectedClient.name}.`
                : "Create your first UX audit project to start tracking findings, evidence, and recommendations."
            }
            actionLabel={showArchived ? undefined : "Create Project"}
            actionHref={showArchived ? undefined : clientId ? `/projects/new?clientId=${clientId}` : "/projects/new"}
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden">
          {projects.map((project, index) => {
            const currentClientName = project.client_id
              ? clientNameById.get(project.client_id) || project.client_name
              : project.client_name;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`block p-6 transition hover:bg-slate-50 ${
                  index !== 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      {project.name}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <AuditTypeBadge type={project.audit_type} />
                      {currentClientName && (
                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {currentClientName}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {project.website_url || "No website provided"}
                    </p>
                  </div>

                  <div className="text-right">
                    <StatusBadge status={project.status} />

                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(
                        project.updated_at || project.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </Card>
      )}
    </PageShell>
  );
}
