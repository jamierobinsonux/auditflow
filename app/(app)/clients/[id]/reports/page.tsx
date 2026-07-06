import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Eye, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { formatClientDate } from "@/lib/studio";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import { ClientWorkspaceTabs } from "@/components/client-workspace-tabs";
import type { Client } from "@/types/client";
import type { ReportExport } from "@/types/report";

export default async function ClientReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const subscription = await getUserSubscription(user.id);
  if (!subscription.isStudio) {
    return <UpgradeRequiredCard title="Client report history is available on Studio" description="Upgrade to Studio to view reports grouped by client workspace." />;
  }
  const { data: clientData } = await supabase.from("clients").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!clientData) return <PageShell>Client not found.</PageShell>;
  const client = clientData as Client;
  const { data } = await supabase
    .from("report_exports")
    .select("id,user_id,project_id,client_id,title,template,sections,options,version,file_name,created_at, project:projects(id,name,client_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const reports = normalizeReports(data ?? []).filter(
    (report) => report.client_id === client.id || report.project?.client_id === client.id
  );
  return (
    <PageShell>
      <PageHeader title={`${client.name} Reports`} description="View report exports generated across this client's projects." action={<Button asChild><Link href={`/projects/new?clientId=${client.id}`}>+ New Project</Link></Button>} />
      <ClientWorkspaceTabs clientId={client.id} active="reports" />
      {reports.length === 0 ? <div className="mt-8"><EmptyState icon={FileText} title="No reports yet" description="Reports exported from this client's projects will appear here." /></div> : (
        <Card className="mt-8 overflow-hidden">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.35fr)_64px_112px_96px] items-center gap-6 bg-slate-100 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600"><span className="min-w-0">Report</span><span className="min-w-0">Project</span><span>Version</span><span>Generated</span><span className="text-right">Actions</span></div>
          <div className="divide-y divide-slate-100">
            {reports.map((report) => {
              const projectName = report.project?.name || "Project";
              const title = report.title || `${projectName} Report`;
              const query = buildReportQuery(report, title);
              const previewUrl = `/api/projects/${report.project_id}/report?mode=preview&${query}`;
              const downloadUrl = `/api/projects/${report.project_id}/report?mode=download&${query}`;
              return (
                <div key={report.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.35fr)_64px_112px_96px] items-center gap-6 px-6 py-5 text-sm">
                  <div className="min-w-0"><p className="truncate font-semibold text-slate-950" title={title}>{title}</p><p className="mt-1 truncate text-xs text-slate-500">{labelize(report.template || "professional")} template</p></div>
                  <Link href={`/projects/${report.project_id}`} className="min-w-0 truncate font-medium text-slate-700 hover:text-violet-700" title={projectName}>{projectName}</Link>
                  <span className="text-slate-600">v{report.version ?? 1}</span>
                  <span className="text-slate-500">{formatClientDate(report.created_at)}</span>
                  <div className="flex min-w-0 justify-end gap-2"><Button asChild variant="outline" size="icon-sm"><a href={previewUrl} target="_blank" rel="noreferrer" aria-label="Preview report"><Eye className="size-4" /></a></Button><Button asChild variant="outline" size="icon-sm"><a href={downloadUrl} aria-label="Download report"><Download className="size-4" /></a></Button></div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </PageShell>
  );
}
function normalizeReports(data: any[]): ReportExport[] { return data.map((report) => { const project = Array.isArray(report.project) ? report.project[0] : report.project; return { ...report, project: project ?? null } as ReportExport; }); }
function buildReportQuery(report: ReportExport, title: string) { const params = new URLSearchParams(); params.set("title", title); params.set("template", report.template || "professional"); if (report.sections?.length) params.set("sections", report.sections.join(",")); return params.toString(); }
function labelize(value: string) { return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); }
