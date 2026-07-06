import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, ChevronDown, Info, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { getClientHealth, getClientHealthClasses, getClientInitials } from "@/lib/studio";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";
import type { Finding } from "@/types/finding";

type ClientWithStats = Client & {
  projectCount: number;
  draftReports: number;
  openFindings: number;
  latestActivity: string | null;
  health: ReturnType<typeof getClientHealth>;
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "all" } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const subscription = await getUserSubscription(user.id);

  if (!subscription.isStudio) {
    return (
      <UpgradeRequiredCard
        title="Client workspaces are available on Studio"
        description="Upgrade to Studio to organize projects, reports, contacts, and brand assets by client."
      />
    );
  }

  const [{ data: clientData }, { data: projectData }, { data: findingData }, { data: reportData }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("projects")
        .select("id,client_id,status,created_at,updated_at")
        .eq("user_id", user.id),
      supabase
        .from("findings")
        .select("id,project_id,status")
        .eq("user_id", user.id),
      supabase
        .from("report_exports")
        .select("id,project_id,created_at")
        .eq("user_id", user.id),
    ]);

  const clients = (clientData ?? []) as Client[];
  const projects = (projectData ?? []) as Pick<Project, "id" | "client_id" | "status" | "created_at" | "updated_at">[];
  const findings = (findingData ?? []) as Pick<Finding, "id" | "project_id" | "status">[];
  const reports = (reportData ?? []) as { id: string; project_id: string; created_at: string }[];

  const clientsWithStats = clients
    .map((client): ClientWithStats => {
      const clientProjects = projects.filter((project) => project.client_id === client.id);
      const clientProjectIds = new Set(clientProjects.map((project) => project.id));
      const clientFindings = findings.filter((finding) => clientProjectIds.has(finding.project_id));
      const clientReports = reports.filter((report) => clientProjectIds.has(report.project_id));
      const latestProjectActivity = clientProjects
        .map((project) => project.updated_at || project.created_at)
        .filter(Boolean)
        .sort()
        .at(-1);
      const latestReportActivity = clientReports.map((report) => report.created_at).sort().at(-1);
      const latestActivity = [client.updated_at || client.created_at, latestProjectActivity, latestReportActivity]
        .filter(Boolean)
        .sort()
        .at(-1) ?? null;
      const openFindings = clientFindings.filter((finding) => finding.status !== "Resolved").length;
      const draftReports = clientProjects.filter((project) => project.status !== "Completed").length;
      const health = getClientHealth({
        client,
        activeProjects: clientProjects.length,
        openFindings,
      });

      return {
        ...client,
        projectCount: clientProjects.length,
        draftReports,
        openFindings,
        latestActivity,
        health,
      };
    })
    .filter((client) => {
      const matchesQuery = q
        ? client.name.toLowerCase().includes(q.toLowerCase()) ||
          client.industry?.toLowerCase().includes(q.toLowerCase()) ||
          client.website_url?.toLowerCase().includes(q.toLowerCase())
        : true;
      const matchesStatus = status === "all" ? true : client.health.toLowerCase().replace(" ", "-") === status;
      return matchesQuery && matchesStatus;
    });

  return (
    <PageShell>
      <PageHeader
        title="Clients"
        description="Manage client workspaces, projects, reports, and brand context in one place."
        action={
          <Button asChild size="lg">
            <Link href="/clients/new">+ New Client</Link>
          </Button>
        }
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <form className="relative flex-1" action="/clients">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search clients..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          />
        </form>

        <form action="/clients">
          {q && <input type="hidden" name="q" value={q} />}
          <div className="relative">
            <select
              name="status"
              defaultValue={status}
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-14 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="on-track">On Track</option>
              <option value="not-started">Not Started</option>
              <option value="at-risk">At Risk</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
          </div>
        </form>
      </div>

      {clientsWithStats.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Building2}
            title={clients.length === 0 ? "No clients yet" : "No clients match your filters"}
            description={
              clients.length === 0
                ? "Create your first client workspace to organize projects, reports, contacts, and branding."
                : "Try adjusting your search or status filter."
            }
            actionLabel={clients.length === 0 ? "Create Client" : undefined}
            actionHref={clients.length === 0 ? "/clients/new" : undefined}
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden">
          <div className="hidden bg-slate-100 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]">
            <span>Client</span>
            <span>Projects</span>
            <span>Draft Reports</span>
            <span>Open Findings</span>
            <span>Last Activity</span>
            <span className="inline-flex items-center gap-1">
              Status
              <span
                title="Client health is based on active projects and open findings. Healthy means no open findings, On Track means work is active, At Risk means there are many open findings, and Not Started means no projects yet."
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400"
              >
                <Info className="h-3.5 w-3.5" />
              </span>
            </span>
          </div>

          {clientsWithStats.map((client, index) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className={`block px-5 py-5 text-sm transition hover:bg-slate-50 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] md:items-center md:px-6 md:py-4 ${
                index !== 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <span className="flex items-center gap-3">
                {client.logo_url ? (
                  <img
                    src={client.logo_url}
                    alt=""
                    className="h-10 w-10 rounded-xl border border-slate-200 bg-white object-contain p-1"
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: client.brand_color || "#7C3AED" }}
                  >
                    {getClientInitials(client.name)}
                  </span>
                )}
                <span>
                  <span className="block font-semibold text-slate-950">{client.name}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{client.industry || client.website_url || "Client workspace"}</span>
                </span>
              </span>
              <span className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 md:mt-0 md:block md:border-0 md:pt-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">Projects</span>
                <span>
                  <span className="font-semibold text-slate-950">{client.projectCount}</span>
                  <span className="mt-0.5 hidden text-xs text-slate-500 md:block">Active</span>
                </span>
              </span>
              <span className="mt-3 flex items-center justify-between md:mt-0 md:block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">Draft Reports</span>
                <span className="font-semibold text-slate-950">{client.draftReports}</span>
              </span>
              <span className="mt-3 flex items-center justify-between md:mt-0 md:block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">Open Findings</span>
                <span className="font-semibold text-slate-950">{client.openFindings}</span>
              </span>
              <span className="mt-3 flex items-center justify-between md:mt-0 md:block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">Last Activity</span>
                <span className="text-right md:text-left">
                  <span className="font-medium text-slate-900">{formatRelativeDate(client.latestActivity)}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{latestActivityLabel(client)}</span>
                </span>
              </span>
              <span className="mt-3 flex items-center justify-between md:mt-0 md:block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">Status</span>
                <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${getClientHealthClasses(client.health)}`}>
                  {client.health}
                </span>
              </span>
            </Link>
          ))}
        </Card>
      )}
    </PageShell>
  );
}

function formatRelativeDate(value?: string | null) {
  if (!value) return "No activity";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"} ago`;
}

function latestActivityLabel(client: ClientWithStats) {
  if (client.openFindings > 0) return "Findings open";
  if (client.projectCount > 0) return "Project updated";
  return "Client created";
}
