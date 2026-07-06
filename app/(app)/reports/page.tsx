import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Eye, FileText, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { formatClientDate } from "@/lib/studio";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { DeleteReportButton } from "@/components/delete-report-button";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import type { ReportExport } from "@/types/report";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const subscription = await getUserSubscription(user.id);

  if (!subscription.isStudio) {
    return (
      <UpgradeRequiredCard
        title="Report history is available on Studio"
        description="Upgrade to Studio to view reports across clients and projects."
      />
    );
  }

  const { data } = await supabase
    .from("report_exports")
    .select("id,user_id,project_id,client_id,title,template,sections,options,version,file_name,created_at, project:projects(id,name,client_id,client_name, client:clients(id,name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allReports = normalizeReports(data ?? []);
  const reports = q.trim()
    ? allReports.filter((report) => {
        const projectName = report.project?.name || "";
        const clientName = report.project?.client?.name || (report.project as any)?.client_name || "";
        const title = report.title || `${projectName} Report`;
        const query = q.trim().toLowerCase();
        return [title, projectName, clientName, report.template, report.file_name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
    : allReports;

  return (
    <PageShell>
      <PageHeader
        title="Reports"
        description="View, preview, and re-download report exports across all Studio client workspaces."
      />

      {allReports.length > 0 && (
        <form className="mt-8 max-w-xl" action="/reports">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search reports..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </form>
      )}

      {reports.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={FileText}
            title={allReports.length === 0 ? "No reports yet" : "No reports match your search"}
            description={
              allReports.length === 0
                ? "Export a report from any project and it will appear here with its client, template, and version."
                : "Try searching by report, client, project, or template."
            }
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden">
          <div className="grid grid-cols-[minmax(240px,1.5fr)_minmax(150px,0.9fr)_minmax(180px,1fr)_80px_120px_120px] items-center bg-slate-100 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <span>Report</span>
            <span>Client</span>
            <span>Project</span>
            <span>Version</span>
            <span>Generated</span>
            <span className="text-right pr-4">Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {reports.map((report) => {
              const projectName = report.project?.name || "Project";
              const clientName = report.project?.client?.name || (report.project as any)?.client_name || "No client";
              const title = report.title || `${projectName} Report`;
              const query = buildReportQuery(report, title);
              const previewUrl = `/api/projects/${report.project_id}/report?mode=preview&${query}`;
              const downloadUrl = `/api/projects/${report.project_id}/report?mode=download&${query}`;

              return (
                <div key={report.id} className="grid grid-cols-[minmax(240px,1.5fr)_minmax(150px,0.9fr)_minmax(180px,1fr)_80px_120px_120px] items-center gap-4 px-6 py-5 text-sm">
                  <div>
                    <p className="max-w-[360px] whitespace-normal break-words font-semibold leading-snug text-slate-950">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">{labelize(report.template || "professional")} template</p>
                  </div>
                  <span className="min-w-0 whitespace-normal break-words text-left font-medium leading-snug text-slate-700">{clientName}</span>
                  <Link href={`/projects/${report.project_id}`} className="min-w-0 whitespace-normal break-words text-left font-medium leading-snug text-slate-700 hover:text-violet-700">
                    {projectName}
                  </Link>
                  <span className="text-slate-600">v{report.version ?? 1}</span>
                  <span className="text-slate-500">{formatClientDate(report.created_at)}</span>
                  <div className="flex justify-end gap-2 pr-4">
                    <Button asChild variant="outline" size="icon-sm">
                      <a href={previewUrl} target="_blank" rel="noreferrer" aria-label="Preview report"><Eye className="size-4" /></a>
                    </Button>
                    <Button asChild variant="outline" size="icon-sm">
                      <a href={downloadUrl} aria-label="Download report"><Download className="size-4" /></a>
                    </Button>
                    <DeleteReportButton reportId={report.id} title={title} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </PageShell>
  );
}

function normalizeReports(data: any[]): ReportExport[] {
  return data.map((report) => {
    const project = Array.isArray(report.project) ? report.project[0] : report.project;
    const client = Array.isArray(project?.client) ? project.client[0] : project?.client;

    return {
      ...report,
      project: project ? { ...project, client: client ?? null } : null,
    } as ReportExport;
  });
}

function buildReportQuery(report: ReportExport, title: string) {
  const params = new URLSearchParams();
  params.set("title", title);
  params.set("template", report.template || "professional");
  if (report.sections?.length) params.set("sections", report.sections.join(","));
  return params.toString();
}

function labelize(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
