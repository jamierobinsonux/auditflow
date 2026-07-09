import { notFound } from "next/navigation";
import Link from "next/link";
import { Bell, Download, Eye, FileText, FolderKanban } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card } from "@/components/layout/card";
import { SectionHeader } from "@/components/layout/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { AuditTypeBadge } from "@/components/ui/audit-type-badge";
import { Button } from "@/components/ui/button";
import { ClientPortalNotifications } from "@/components/client-portal-notifications";

export default async function ClientPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ priority?: string; projectId?: string }>;
}) {
  const { token } = await params;
  const { priority, projectId } = await searchParams;
  const selectedPriority = normalizePriority(priority);

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("id,user_id,name,website_url,industry,brand_color,logo_url,portal_enabled")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .maybeSingle();

  if (!client) notFound();

  const [
    { data: branding },
    { data: projects },
    { data: reports },
    { data: findings },
    { data: auditorComments },
  ] = await Promise.all([
    supabaseAdmin
      .from("client_branding")
      .select("company_name,logo_url,primary_color,secondary_color,footer_text")
      .eq("client_id", client.id)
      .eq("user_id", client.user_id)
      .maybeSingle(),
    supabaseAdmin
      .from("projects")
      .select("id,name,website_url,audit_type,status,created_at,updated_at")
      .eq("client_id", client.id)
      .eq("user_id", client.user_id)
      .eq("archived", false)
      .order("updated_at", { ascending: false }),
    supabaseAdmin
      .from("report_exports")
      .select("id,project_id,title,template,sections,options,version,created_at, project:projects(id,name,client_id)")
      .eq("user_id", client.user_id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("findings")
      .select("id,project_id,title,severity,status,category,recommendation,impact,created_at")
      .eq("user_id", client.user_id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("finding_comments")
      .select("id,finding_id,project_id,author_name,body,created_at,author_type")
      .eq("user_id", client.user_id)
      .eq("client_id", client.id)
      .eq("author_type", "auditor")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const clientProjects = projects ?? [];
  const projectIds = new Set(clientProjects.map((project: any) => project.id));
  const selectedProject = clientProjects.find((project: any) => project.id === projectId) ?? null;
  const activeProjectIds = selectedProject ? new Set([selectedProject.id]) : projectIds;

  const clientReports = normalizeReports(reports ?? []).filter(
    (report) =>
      (report.project?.client_id === client.id || projectIds.has(report.project_id)) &&
      activeProjectIds.has(report.project_id)
  );

  const allClientFindings = (findings ?? []).filter((finding: any) => projectIds.has(finding.project_id));
  const clientFindings = allClientFindings.filter((finding: any) => activeProjectIds.has(finding.project_id));
  const findingById = new Map(allClientFindings.map((finding: any) => [finding.id, finding]));

  const auditorNotifications = (auditorComments ?? [])
    .filter((comment: any) => projectIds.has(comment.project_id))
    .filter((comment: any) => activeProjectIds.has(comment.project_id))
    .map((comment: any) => ({
      ...comment,
      finding: findingById.get(comment.finding_id),
      project: clientProjects.find((project: any) => project.id === comment.project_id),
    }));

  const filteredFindings =
    selectedPriority === "all"
      ? clientFindings
      : clientFindings.filter((finding: any) => finding.severity === selectedPriority);

  const logoUrl = branding?.logo_url || client.logo_url;
  const primaryColor = branding?.primary_color || client.brand_color || "#7C3AED";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-2" style={{ backgroundColor: primaryColor }} />
          <div className="p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="h-16 w-16 rounded-2xl border border-slate-200 bg-white object-contain p-2" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ backgroundColor: primaryColor }}>
                    {client.name.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Client Portal</p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    {branding?.company_name || client.name}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    {client.website_url || client.industry || "UX audit workspace"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <Metric label="Projects" value={clientProjects.length} />
                <Metric label="Reports" value={clientReports.length} />
                <Metric label="Findings" value={clientFindings.length} />
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 space-y-6">
          <Card className="p-6">
            <SectionHeader title="Projects" description="Click a project to view its reports and findings." />
            {clientProjects.length === 0 ? (
              <EmptyPortalState icon={FolderKanban} title="No projects shared yet" />
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {clientProjects.map((project: any) => {
                  const isSelected = selectedProject?.id === project.id;

                  return (
                    <Link
                      key={project.id}
                      href={isSelected ? `/portal/${token}` : `/portal/${token}?projectId=${project.id}`}
                      className={`flex flex-col gap-3 rounded-2xl px-3 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between ${
                        isSelected ? "bg-violet-50 ring-1 ring-violet-100" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">{project.name}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <AuditTypeBadge type={project.audit_type} />
                          <StatusBadge status={project.status} />
                        </div>
                      </div>
                      <p className="shrink-0 text-xs text-slate-500">
                        Updated {formatDate(project.updated_at || project.created_at)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="flex h-[420px] flex-col p-6">
              <SectionHeader title="Notifications" description="Recent replies from your consultant." />
              {auditorNotifications.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="max-w-xs text-center">
                    <Bell className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      You're all caught up
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      When your consultant replies to a finding or shares new feedback,
                      you'll see those updates here.
                    </p>
                  </div>
                </div>
              ) : (
                <ClientPortalNotifications
                  notifications={auditorNotifications.map((notification: any) => ({
                    id: notification.id,
                    href: `/portal/${token}/projects/${notification.project_id}/findings/${notification.finding_id}`,
                    authorName: notification.author_name || "Your consultant",
                    findingTitle: notification.finding?.title || "A finding",
                    projectName: notification.project?.name || "Client project",
                    createdAt: formatDate(notification.created_at),
                    body: notification.body,
                  }))}
                />
              )}
            </Card>

            <Card className="flex h-[420px] flex-col p-6">
              <SectionHeader title="Reports" description="Download exported reports anytime." />
              {clientReports.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="max-w-xs text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      No reports available
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Exported audit reports will appear here once your consultant
                      shares them with you.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-2">
                  {clientReports.map((report: any) => {
                    const title = report.title || `${report.project?.name || "Audit"} Report`;
                    const query = buildReportQuery(report, title);

                    return (
                      <div key={report.id} className="rounded-2xl border border-slate-200 p-4">
                        <p className="line-clamp-2 font-semibold text-slate-950">{title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {labelize(report.template || "professional")} · {formatDate(report.created_at)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button asChild variant="outline" size="sm">
                            <a href={`/api/portal/${token}/projects/${report.project_id}/report?mode=preview&${query}`} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                              Preview
                            </a>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <a href={`/api/portal/${token}/projects/${report.project_id}/report?mode=download&${query}`}>
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </section>

        <Card className="mt-8 p-6">
          <SectionHeader
            title={selectedProject ? `${selectedProject.name} findings` : "Findings and recommendations"}
            description={
              selectedProject
                ? "A read-only summary for the selected project."
                : "A read-only summary of documented UX findings and recommended improvements."
            }
            action={
              selectedProject ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/${token}`}>View all projects</Link>
                </Button>
              ) : undefined
            }
          />

          {clientFindings.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {["all", "P0", "P1", "P2", "P3"].map((item) => {
                const active = selectedPriority === item;
                const projectParam = selectedProject ? `projectId=${selectedProject.id}` : "";
                const priorityParam = item === "all" ? "" : `priority=${item}`;
                const query = [projectParam, priorityParam].filter(Boolean).join("&");
                const href = query ? `/portal/${token}?${query}` : `/portal/${token}`;

                return (
                  <Link
                    key={item}
                    href={href}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
                    }`}
                  >
                    {item === "all" ? "All priorities" : item}
                  </Link>
                );
              })}
            </div>
          )}

          {clientFindings.length === 0 ? (
            <EmptyPortalState icon={FileText} title="No findings shared yet" />
          ) : filteredFindings.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No {selectedPriority} findings shared yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Choose another priority filter to view more findings.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {filteredFindings.slice(0, 20).map((finding: any) => {
                const project = clientProjects.find((item: any) => item.id === finding.project_id);

                return (
                  <Link
                    key={finding.id}
                    href={`/portal/${token}/projects/${finding.project_id}/findings/${finding.id}`}
                    className="block py-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={finding.severity} />
                      <StatusBadge status={finding.status} />
                      {finding.category && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {finding.category}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-slate-950">{finding.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{project?.name || "Client project"}</p>
                    {finding.recommendation && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                        {finding.recommendation}
                      </p>
                    )}
                    <p className="mt-3 text-xs font-semibold text-violet-700">
                      View finding details →
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

function normalizePriority(priority?: string) {
  return ["P0", "P1", "P2", "P3"].includes(priority || "") ? (priority as string) : "all";
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-5 py-4">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function EmptyPortalState({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
      <Icon className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
    </div>
  );
}

function normalizeReports(data: any[]) {
  return data.map((report) => ({
    ...report,
    project: Array.isArray(report.project) ? report.project[0] : report.project,
  }));
}

function buildReportQuery(report: any, title: string) {
  const params = new URLSearchParams();
  params.set("title", title);
  params.set("template", report.template || "professional");
  if (report.sections?.length) params.set("sections", report.sections.join(","));
  return params.toString();
}

function labelize(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}