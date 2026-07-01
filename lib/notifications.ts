import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationSeverity } from "@/types/notification";

type NotificationPayload = {
  userId: string;
  type: string;
  title: string;
  message?: string | null;
  href?: string | null;
  severity?: NotificationSeverity;
  dedupeKey?: string | null;
  metadata?: Record<string, unknown> | null;
};

type AttentionNotification = {
  type: string;
  title: string;
  message: string;
  href: string;
  severity: NotificationSeverity;
  dedupe_key: string;
  metadata?: Record<string, unknown>;
};

type FindingLite = {
  id: string;
  project_id: string;
  title?: string | null;
  severity?: string | null;
  status?: string | null;
};

type ProjectLite = {
  id: string;
  name: string;
  client_id?: string | null;
};

export async function createNotification(
  supabase: SupabaseClient,
  payload: NotificationPayload
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message ?? null,
    href: payload.href ?? null,
    severity: payload.severity ?? "info",
    dedupe_key: payload.dedupeKey ?? null,
    metadata: payload.metadata ?? {},
  });

  if (error) {
    console.error("Failed to create notification", error.message);
  }
}

export async function syncAttentionNotifications({
  supabase,
  userId,
  isStudio,
}: {
  supabase: SupabaseClient;
  userId: string;
  isStudio: boolean;
}) {
  const [
    { data: projectsData },
    { data: findingsData },
    { data: evidenceData },
    { data: reportsData },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id,name,client_id")
      .eq("user_id", userId)
      .eq("archived", false),
    supabase
      .from("findings")
      .select("id,project_id,title,severity,status")
      .eq("user_id", userId),
    supabase.from("finding_images").select("id,finding_id").eq("user_id", userId),
    supabase.from("report_exports").select("id,project_id").eq("user_id", userId),
  ]);

  const projects = (projectsData ?? []) as ProjectLite[];
  const projectIds = new Set(projects.map((project) => project.id));
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const findings = ((findingsData ?? []) as FindingLite[]).filter((finding) =>
    projectIds.has(finding.project_id)
  );

  const findingsWithEvidence = new Set(
    (evidenceData ?? []).map((item: any) => item.finding_id as string)
  );
  const projectsWithReports = new Set(
    (reportsData ?? []).map((item: any) => item.project_id as string).filter(Boolean)
  );

  const attentionItems: AttentionNotification[] = [];

  for (const project of projects) {
    const projectFindings = findings.filter((finding) => finding.project_id === project.id);

    if (projectFindings.length > 0 && !projectsWithReports.has(project.id)) {
      attentionItems.push({
        type: "attention_project_missing_report",
        title: "Project has no report yet",
        message: `${project.name} has findings but no exported report.`,
        href: `/projects/${project.id}/report`,
        severity: "warning",
        dedupe_key: `attention:project-missing-report:${project.id}`,
        metadata: { project_id: project.id },
      });
    }

    const highPriorityOpenFindings = projectFindings.filter((finding) => {
      const severity = String(finding.severity ?? "").toLowerCase();
      const isHighPriority = ["p0", "p1", "critical", "high"].includes(severity);
      return isHighPriority && finding.status !== "Resolved";
    });

    if (highPriorityOpenFindings.length > 0) {
      attentionItems.push({
        type: "attention_high_priority_findings",
        title: "High-priority findings open",
        message: `${project.name} has ${highPriorityOpenFindings.length} high-priority ${highPriorityOpenFindings.length === 1 ? "finding" : "findings"} still open.`,
        href: `/projects/${project.id}`,
        severity: "danger",
        dedupe_key: `attention:high-priority-open:${project.id}`,
        metadata: { project_id: project.id, count: highPriorityOpenFindings.length },
      });
    }

    if (isStudio && !project.client_id) {
      attentionItems.push({
        type: "attention_project_missing_client",
        title: "Project is not assigned to a client",
        message: `${project.name} is not assigned to a client workspace.`,
        href: `/projects/${project.id}`,
        severity: "info",
        dedupe_key: `attention:project-missing-client:${project.id}`,
        metadata: { project_id: project.id },
      });
    }
  }

  for (const finding of findings) {
    if (!findingsWithEvidence.has(finding.id)) {
      const project = projectById.get(finding.project_id);
      attentionItems.push({
        type: "attention_finding_missing_evidence",
        title: "Finding is missing evidence",
        message: `${finding.title || "A finding"} ${project ? `in ${project.name} ` : ""}does not have supporting screenshots yet.`,
        href: `/projects/${finding.project_id}/findings/${finding.id}/edit`,
        severity: "warning",
        dedupe_key: `attention:finding-missing-evidence:${finding.id}`,
        metadata: { finding_id: finding.id, project_id: finding.project_id },
      });
    }
  }

  const currentKeys = new Set(attentionItems.map((item) => item.dedupe_key));

  const { data: existingAttentionData } = await supabase
    .from("notifications")
    .select("id,dedupe_key,dismissed_at,resolved_at")
    .eq("user_id", userId)
    .like("type", "attention_%")
    .is("resolved_at", null);

  const existingAttention = existingAttentionData ?? [];
  const existingByKey = new Map(
    existingAttention
      .filter((item: any) => item.dedupe_key)
      .map((item: any) => [item.dedupe_key as string, item])
  );

  const inserts = attentionItems
    .filter((item) => !existingByKey.has(item.dedupe_key))
    .map((item) => ({
      user_id: userId,
      type: item.type,
      title: item.title,
      message: item.message,
      href: item.href,
      severity: item.severity,
      dedupe_key: item.dedupe_key,
      metadata: item.metadata ?? {},
    }));

  if (inserts.length > 0) {
    const { error } = await supabase.from("notifications").insert(inserts);
    if (error) console.error("Failed to insert attention notifications", error.message);
  }

  const resolvedIds = existingAttention
    .filter((item: any) => item.dedupe_key && !currentKeys.has(item.dedupe_key))
    .map((item: any) => item.id as string);

  if (resolvedIds.length > 0) {
    const { error } = await supabase
      .from("notifications")
      .update({ resolved_at: new Date().toISOString(), is_read: true })
      .in("id", resolvedIds)
      .eq("user_id", userId);

    if (error) console.error("Failed to resolve attention notifications", error.message);
  }
}
