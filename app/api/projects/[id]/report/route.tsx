import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { AuditReport } from "@/components/pdf/AuditReport";
import { getUserSubscription } from "@/lib/subscription";
import { getReportBranding } from "@/lib/report-branding";
import type { ReportOptions, ReportSectionId, ReportTemplateId } from "@/components/pdf/types";

const VALID_SECTIONS: ReportSectionId[] = [
  "cover",
  "contents",
  "executive",
  "scope",
  "risks",
  "findings",
  "journeys",
  "prioritization",
  "recommendations",
  "appendix",
  "conclusion",
];

const VALID_TEMPLATES: ReportTemplateId[] = [
  "professional",
  "executive",
  "minimal",
  "findings",
  "evidence",
  "accessibility",
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const url = new URL(request.url);
  const options = parseReportOptions(url.searchParams);
  const mode = url.searchParams.get("mode") === "download" ? "download" : "preview";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: findings } = await supabase
    .from("findings")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .order("severity", { ascending: true });

  const { data: journeys } = await supabase
    .from("journeys")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { data: steps } = await supabase
    .from("journey_steps")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  const findingIds = (findings ?? []).map((finding) => finding.id);

  const { data: images } = findingIds.length
    ? await supabase
        .from("finding_images")
        .select("*")
        .in("finding_id", findingIds)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const { data: annotations } = findingIds.length
    ? await supabase
        .from("image_annotations")
        .select("*")
        .in("finding_id", findingIds)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const subscription = await getUserSubscription(user.id);
  const isProReport = subscription.isPro || subscription.isStudio;
  const branding = isProReport ? await getReportBranding(user.id) : null;

  const stream = await renderToStream(
    <AuditReport
      project={project}
      findings={findings ?? []}
      journeys={journeys ?? []}
      steps={steps ?? []}
      images={images ?? []}
      annotations={annotations ?? []}
      branding={branding}
      isPro={isProReport}
      options={options}
    />
  );

  if (mode === "download") {
    await supabase.from("report_exports").insert({
      user_id: user.id,
      project_id: project.id,
      template: options.template,
      sections: options.sections,
      title: options.title,
    });
  }

  const disposition = mode === "download" ? "attachment" : "inline";
  const fileName = `${safeFileName(options.title || project.name)}.pdf`;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}

function parseReportOptions(searchParams: URLSearchParams): ReportOptions {
  const templateParam = searchParams.get("template") || "professional";
  const template = VALID_TEMPLATES.includes(templateParam as ReportTemplateId)
    ? (templateParam as ReportTemplateId)
    : "professional";

  const sections = (searchParams.get("sections") || "")
    .split(",")
    .map((section) => section.trim())
    .filter((section): section is ReportSectionId =>
      VALID_SECTIONS.includes(section as ReportSectionId)
    );

  const title = searchParams.get("title")?.slice(0, 120) || null;

  return {
    title,
    template,
    sections: sections.length ? sections : null,
  };
}

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
