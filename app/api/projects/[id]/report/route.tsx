import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { AuditReport } from "@/components/pdf/AuditReport";
import { getUserSubscription } from "@/lib/subscription";
import { getEffectiveReportBranding } from "@/lib/report-branding";
import type {
  ReportOptions,
  ReportSectionId,
  ReportTemplateId,
} from "@/components/pdf/types";

type LinkedRecommendation = {
  id: string;
  title: string | null;
  recommendation: string | null;
  category: string | null;
  impact: string | null;
};

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
  const mode =
    url.searchParams.get("mode") === "download" ? "download" : "preview";

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

  const { data: projectClient } = project.client_id
    ? await supabase
        .from("clients")
        .select("id,name,logo_url,brand_color")
        .eq("id", project.client_id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const reportProject = {
    ...project,
    client_name: projectClient?.name ?? project.client_name ?? null,
  };

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

  const savedRecommendationIds = (findings ?? [])
    .map((finding: any) => finding.saved_recommendation_id)
    .filter(Boolean);

  const frameworkRecommendationIds = (findings ?? [])
    .map((finding: any) => finding.framework_recommendation_id)
    .filter(Boolean);

  const [{ data: savedRecommendations }, { data: frameworkRecommendations }] =
    await Promise.all([
      savedRecommendationIds.length
        ? supabase
            .from("studio_recommendations")
            .select("id,title,recommendation,category,impact")
            .in("id", savedRecommendationIds)
            .eq("user_id", user.id)
        : Promise.resolve({ data: [] as LinkedRecommendation[] }),
      frameworkRecommendationIds.length
        ? supabase
            .from("studio_framework_recommendations")
            .select("id,title,recommendation,category,impact")
            .in("id", frameworkRecommendationIds)
            .eq("user_id", user.id)
        : Promise.resolve({ data: [] as LinkedRecommendation[] }),
    ]);

  const savedRecommendationById = new Map<string, LinkedRecommendation>(
    ((savedRecommendations ?? []) as LinkedRecommendation[]).map((item) => [
      item.id,
      item,
    ])
  );

  const frameworkRecommendationById = new Map<string, LinkedRecommendation>(
    ((frameworkRecommendations ?? []) as LinkedRecommendation[]).map((item) => [
      item.id,
      item,
    ])
  );

  const hydratedFindings = (findings ?? []).map((finding: any) => {
    const linkedRecommendation: LinkedRecommendation | undefined =
      finding.saved_recommendation_id
        ? savedRecommendationById.get(finding.saved_recommendation_id)
        : finding.framework_recommendation_id
          ? frameworkRecommendationById.get(finding.framework_recommendation_id)
          : undefined;

    return {
      ...finding,
      category: finding.category ?? linkedRecommendation?.category ?? null,
      impact: finding.impact ?? linkedRecommendation?.impact ?? null,
      recommendation:
        finding.recommendation || linkedRecommendation?.recommendation || null,
      linked_recommendation_title: linkedRecommendation?.title ?? null,
    };
  });

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

  const branding = isProReport
    ? await getEffectiveReportBranding({
        userId: user.id,
        clientId: project.client_id,
        preferClientBranding: subscription.isStudio,
      })
    : null;

  const stream = await renderToStream(
    <AuditReport
      project={reportProject}
      findings={hydratedFindings}
      journeys={journeys ?? []}
      steps={steps ?? []}
      images={images ?? []}
      annotations={annotations ?? []}
      branding={branding}
      isPro={isProReport}
      options={options}
    />
  );

  const fileName = `${safeFileName(options.title || project.name)}.pdf`;

  if (mode === "download") {
    const { data: latestExport } = await supabase
      .from("report_exports")
      .select("version")
      .eq("user_id", user.id)
      .eq("project_id", project.id)
      .order("version", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = Number(latestExport?.version || 0) + 1;

    await supabase.from("report_exports").insert({
      user_id: user.id,
      project_id: project.id,
      client_id: project.client_id ?? null,
      template: options.template,
      sections: options.sections,
      options,
      title: options.title || `${project.name} Report`,
      version: nextVersion,
      file_name: fileName,
    });
  }

  const disposition = mode === "download" ? "attachment" : "inline";

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