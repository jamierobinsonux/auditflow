import Link from "next/link";
import { Archive, ChevronDown, FolderOpen, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AuditTypeBadge } from "@/components/ui/audit-type-badge";
import { AutoSubmitForm } from "@/components/auto-submit-form";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; clientId?: string; q?: string; status?: string }>;
}) {
  const { view, clientId, q = "", status = "all" } = await searchParams;
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

  const allProjects = (data ?? []) as Project[];
  const projects = allProjects.filter((project) => {
    const matchesSearch = q.trim()
      ? [project.name, project.client_name, project.website_url, project.audit_type, project.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q.trim().toLowerCase()))
      : true;
    const matchesStatus = status === "all" ? true : String(project.status || "").toLowerCase() === status;
    return matchesSearch && matchesStatus;
  });
  const clients = (clientsData ?? []) as Pick<Client, "id" | "name">[];
  const selectedClient = clients.find((client) => client.id === clientId);
  const clientNameById = new Map(clients.map((client) => [client.id, client.name]));

  const activeParams = new URLSearchParams();
  if (clientId) activeParams.set("clientId", clientId);
  if (q) activeParams.set("q", q);
  if (status !== "all") activeParams.set("status", status);
  const activeHref = activeParams.toString() ? `/projects?${activeParams.toString()}` : "/projects";
  const archivedParams = new URLSearchParams(activeParams);
  archivedParams.set("view", "archived");
  const archivedHref = `/projects?${archivedParams.toString()}`;
  const searchAction = "/projects";

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

      <AutoSubmitForm className="mt-8 flex flex-col gap-3 sm:flex-row" action={searchAction}>
        {clientId && <input type="hidden" name="clientId" value={clientId} />}
        {showArchived && <input type="hidden" name="view" value="archived" />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search projects..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          />
        </div>

        <div className="relative sm:w-56">
          <select
            name="status"
            defaultValue={status}
            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-14 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          >
            <option value="all">All Statuses</option>
            <option value="in progress">In Progress</option>
            <option value="in review">In Review</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
        </div>

      </AutoSubmitForm>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button asChild variant={!showArchived ? "default" : "outline"}>
          <Link href={activeHref}>Active</Link>
        </Button>

        <Button asChild variant={showArchived ? "default" : "outline"}>
          <Link href={archivedHref}>Archived</Link>
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
            title={q || status !== "all" ? "No projects match your filters" : showArchived ? "No archived projects" : "No active projects yet"}
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
                className={`block p-5 transition hover:bg-slate-50 sm:p-6 ${
                  index !== 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold text-slate-950">
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

                  <div className="flex w-full items-center justify-between sm:block sm:w-auto sm:text-right">
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
