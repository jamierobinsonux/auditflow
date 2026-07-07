import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Building2, FileText, FolderKanban, Palette, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { getClientHealth, getClientHealthClasses, getClientInitials, formatClientDate } from "@/lib/studio";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AuditTypeBadge } from "@/components/ui/audit-type-badge";
import { UpgradeRequiredCard } from "@/components/upgrade-required-card";
import { ClientWorkspaceTabs } from "@/components/client-workspace-tabs";
import { DeleteClientButton } from "@/components/delete-client-button";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";
import type { Finding } from "@/types/finding";

export default async function ClientDetailPage({
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
        title="Client workspaces are available on Studio"
        description="Upgrade to Studio to view client workspaces, client projects, reports, and brand assets."
      />
    );
  }

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!clientData) return <PageShell>Client not found.</PageShell>;

  const client = clientData as Client;

  const [{ data: projectData }, { data: findingData }, { data: reportData }, { data: brandingData }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("client_id", id)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("findings")
      .select("id,project_id,status,title,created_at")
      .eq("user_id", user.id),
    supabase
      .from("report_exports")
      .select("id,title,template,project_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("client_branding")
      .select("logo_url,primary_color,secondary_color,footer_text,cover_image_url,show_watermark")
      .eq("user_id", user.id)
      .eq("client_id", id)
      .maybeSingle(),
  ]);

  const projects = (projectData ?? []) as Project[];
  const projectIds = new Set(projects.map((project) => project.id));
  const findings = ((findingData ?? []) as (Pick<Finding, "id" | "project_id" | "status" | "title"> & { created_at: string })[]).filter((finding) => projectIds.has(finding.project_id));
  const reports = ((reportData ?? []) as { id: string; title: string | null; template: string | null; project_id: string; created_at: string }[]).filter((report) => projectIds.has(report.project_id));

  const openFindings = findings.filter((finding) => finding.status !== "Resolved").length;
  const draftReports = projects.filter((project) => project.status !== "Completed").length;
  const health = getClientHealth({
    client,
    activeProjects: projects.length,
    openFindings,
  });
  const recentProjects = projects.slice(0, 5);
  const recentReports = reports.slice(0, 5);
  const recentActivity = [
    ...reports.slice(0, 3).map((report) => ({
      icon: FileText,
      title: `${report.title || "Report"} exported`,
      description: `${labelize(report.template || "Professional")} report`,
      date: report.created_at,
    })),
    ...findings.slice(0, 3).map((finding) => ({
      icon: Activity,
      title: `Finding added`,
      description: finding.title || "UX finding",
      date: finding.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <PageShell>
      <PageHeader
        title={client.name}
        description={client.website_url || client.industry || "Client workspace"}
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild variant="outline">
              <Link href={`/clients/${client.id}/edit`}>Edit Client</Link>
            </Button>
            <DeleteClientButton clientId={client.id} />
            <Button asChild>
              <Link href={`/projects/new?clientId=${client.id}`}>+ New Project</Link>
            </Button>
          </div>
        }
      />

      <ClientWorkspaceTabs clientId={client.id} active="overview" />

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <MetricCard label="Active Projects" value={projects.length} helper="Client projects" />
        <MetricCard label="Draft Reports" value={draftReports} helper="Projects in progress" />
        <MetricCard label="Open Findings" value={openFindings} helper="Across client work" />
        <MetricCard label="Total Reports" value={reports.length} helper="Exported reports" />
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client Health</p>
          <span className={`mt-3 inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${getClientHealthClasses(health)}`}>
            {health}
          </span>
          <p className="mt-3 text-xs text-slate-500">Based on activity and open findings.</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <SectionHeader
            title="Recent Projects"
            description="Current audit work for this client."
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href={`/projects?clientId=${client.id}`}>View all</Link>
              </Button>
            }
          />

          {recentProjects.length === 0 ? (
            <EmptyClientBlock icon={FolderKanban} title="No projects yet" description="Create a project for this client to start organizing audit work." />
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {recentProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center justify-between gap-4 py-4 hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-950">{project.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <AuditTypeBadge type={project.audit_type} />
                      <StatusBadge status={project.status} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Updated {formatClientDate(project.updated_at || project.created_at)}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeader
            title="Brand Status"
            description="Client branding used in Studio reports."
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href={`/clients/${client.id}/brand-assets`}>Manage</Link>
              </Button>
            }
          />
          <div className="mt-5 space-y-3 text-sm">
            <BrandStatusRow label="Logo" ready={Boolean(brandingData?.logo_url || client.logo_url)} />
            <BrandStatusRow label="Primary color" ready={Boolean(brandingData?.primary_color || client.brand_color)} />
            <BrandStatusRow label="Secondary color" ready={Boolean(brandingData?.secondary_color)} />
            <BrandStatusRow label="Footer" ready={Boolean(brandingData?.footer_text)} />
            <BrandStatusRow label="Cover image" ready={Boolean(brandingData?.cover_image_url)} />
            <BrandStatusRow label="Watermark" ready={Boolean(brandingData?.show_watermark)} />
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Client Profile" description="Brand and contact context." />
          <div className="mt-5 flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
              style={{ backgroundColor: client.brand_color || "#7C3AED" }}
            >
              {getClientInitials(client.name)}
            </div>
            <div>
              <p className="font-semibold text-slate-950">{client.name}</p>
              <p className="mt-1 text-sm text-slate-500">{client.industry || "No industry set"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <ProfileRow label="Primary Contact" value={client.primary_contact_name} icon={UserRound} />
            <ProfileRow label="Email" value={client.primary_contact_email} icon={UserRound} />
            <ProfileRow label="Brand Color" value={client.brand_color || "#7C3AED"} icon={Palette} />
            <ProfileRow label="Website" value={client.website_url} icon={Building2} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <SectionHeader title="Recent Reports" description="Exports created for this client." />
          {recentReports.length === 0 ? (
            <EmptyClientBlock icon={FileText} title="No reports yet" description="Reports exported from this client's projects will appear here." />
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold text-slate-950">{report.title || "UX Audit Report"}</p>
                    <p className="mt-1 text-xs text-slate-500">{labelize(report.template || "Professional")}</p>
                  </div>
                  <p className="text-xs text-slate-500">{formatClientDate(report.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeader title="Activity" description="Recent work across this client." />
          {recentActivity.length === 0 ? (
            <EmptyClientBlock icon={Activity} title="No activity yet" description="Project updates, findings, and exports will appear here." />
          ) : (
            <div className="mt-5 space-y-4">
              {recentActivity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={`${item.title}-${index}`} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.description} · {formatClientDate(item.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </Card>
  );
}

function ProfileRow({ label, value, icon: Icon }: { label: string; value?: string | null; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 text-slate-400" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-medium text-slate-700">{value || "Not set"}</p>
      </div>
    </div>
  );
}

function BrandStatusRow({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
      <span className="font-medium text-slate-600">{label}</span>
      <span className={ready ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>
        {ready ? "Configured" : "Not set"}
      </span>
    </div>
  );
}

function EmptyClientBlock({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <Icon className="mx-auto size-6 text-slate-400" />
      <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function labelize(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
