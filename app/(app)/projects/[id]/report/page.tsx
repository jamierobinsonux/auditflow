import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectTabs } from "@/components/project-tabs";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ReportBuilderClient } from "@/components/report-builder-client";
import { getUserSubscription } from "@/lib/subscription";
import { getClientReportBranding, getReportBranding } from "@/lib/report-branding";

export default async function ReportPage({
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

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) return <PageShell>Project not found.</PageShell>;

  const [{ count: findingsCount }, { count: journeysCount }] = await Promise.all([
    supabase
      .from("findings")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id)
      .eq("user_id", user.id),
    supabase
      .from("journeys")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id)
      .eq("user_id", user.id),
  ]);

  const { data: findingIds } = await supabase
    .from("findings")
    .select("id")
    .eq("project_id", id)
    .eq("user_id", user.id);

  const ids = (findingIds ?? []).map((finding) => finding.id);

  const { count: evidenceCount } = ids.length
    ? await supabase
        .from("finding_images")
        .select("id", { count: "exact", head: true })
        .in("finding_id", ids)
        .eq("user_id", user.id)
    : { count: 0 };

  const { data: exportHistory } = await supabase
    .from("report_exports")
    .select("id,title,template,created_at")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const subscription = await getUserSubscription(user.id);
  const isProReport = subscription.isPro || subscription.isStudio;
  const [branding, clientBranding] = isProReport
    ? await Promise.all([
        getReportBranding(user.id),
        subscription.isStudio
          ? getClientReportBranding({ userId: user.id, clientId: project.client_id })
          : Promise.resolve(null),
      ])
    : [null, null];

  return (
    <PageShell>
      <PageHeader
        title="Reports"
        description="Configure, preview, and export client-ready audit reports."
      />

      <ProjectTabs projectId={id} />

      <ReportBuilderClient
        project={project}
        counts={{
          findings: findingsCount ?? 0,
          journeys: journeysCount ?? 0,
          evidence: evidenceCount ?? 0,
        }}
        isProReport={isProReport}
        isStudioReport={subscription.isStudio}
        brandingName={branding?.company_name}
        clientBrandingName={clientBranding?.company_name}
        history={exportHistory ?? []}
      />
    </PageShell>
  );
}
