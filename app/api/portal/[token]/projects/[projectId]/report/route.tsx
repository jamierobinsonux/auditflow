import { renderToStream } from "@react-pdf/renderer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AuditReport } from "@/components/pdf/AuditReport";
import type { ReportOptions, ReportSectionId, ReportTemplateId } from "@/components/pdf/types";
import { buildRecommendationMap, hydrateFindingRecommendation, uniqueRecommendationIdsFromFindings, type LinkedRecommendation } from "@/lib/recommendations";

const VALID_SECTIONS: ReportSectionId[] = ["cover", "contents", "executive", "scope", "risks", "findings", "journeys", "prioritization", "recommendations", "appendix", "conclusion"];
const VALID_TEMPLATES: ReportTemplateId[] = ["professional", "executive", "minimal", "findings", "evidence", "accessibility"];


export async function GET(request: Request, { params }: { params: Promise<{ token: string; projectId: string }> }) {
  const { token, projectId } = await params;
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "download" ? "download" : "preview";
  const options = parseReportOptions(url.searchParams);

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("id,user_id,name,logo_url,brand_color,portal_enabled")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .maybeSingle();

  if (!client) return Response.json({ error: "Portal not found" }, { status: 404 });

  const { data: project } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("client_id", client.id)
    .eq("user_id", client.user_id)
    .maybeSingle();

  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

  const reportProject = { ...project, client_name: client.name };

  const [{ data: findings }, { data: journeys }, { data: steps }] = await Promise.all([
    supabaseAdmin.from("findings").select("*").eq("project_id", projectId).eq("user_id", client.user_id).order("severity", { ascending: true }),
    supabaseAdmin.from("journeys").select("*").eq("project_id", projectId).eq("user_id", client.user_id).order("created_at", { ascending: true }),
    supabaseAdmin.from("journey_steps").select("*").eq("user_id", client.user_id).order("sort_order", { ascending: true }),
  ]);

  const findingIds = (findings ?? []).map((finding: any) => finding.id);
  const savedRecommendationIds = uniqueRecommendationIdsFromFindings(findings ?? [], "library");
  const frameworkRecommendationIds = uniqueRecommendationIdsFromFindings(findings ?? [], "framework");

  const [{ data: savedRecommendations }, { data: frameworkRecommendations }, { data: images }, { data: annotations }, { data: clientBranding }] = await Promise.all([
    savedRecommendationIds.length ? supabaseAdmin.from("studio_recommendations").select("id,title,recommendation,category,impact").in("id", savedRecommendationIds).eq("user_id", client.user_id) : Promise.resolve({ data: [] as LinkedRecommendation[] }),
    frameworkRecommendationIds.length ? supabaseAdmin.from("studio_framework_recommendations").select("id,title,recommendation,category,impact").in("id", frameworkRecommendationIds).eq("user_id", client.user_id) : Promise.resolve({ data: [] as LinkedRecommendation[] }),
    findingIds.length ? supabaseAdmin.from("finding_images").select("*").in("finding_id", findingIds).eq("user_id", client.user_id).order("created_at", { ascending: true }) : Promise.resolve({ data: [] }),
    findingIds.length ? supabaseAdmin.from("image_annotations").select("*").in("finding_id", findingIds).eq("user_id", client.user_id).order("created_at", { ascending: true }) : Promise.resolve({ data: [] }),
    supabaseAdmin.from("client_branding").select("*").eq("user_id", client.user_id).eq("client_id", client.id).maybeSingle(),
  ]);

  const savedById = buildRecommendationMap((savedRecommendations ?? []) as LinkedRecommendation[], "library");
  const frameworkById = buildRecommendationMap((frameworkRecommendations ?? []) as LinkedRecommendation[], "framework");
  const hydratedFindings = (findings ?? []).map((finding: any) =>
    hydrateFindingRecommendation({
      finding,
      savedRecommendations: savedById,
      frameworkRecommendations: frameworkById,
    })
  );

  const branding = {
    user_id: client.user_id,
    company_name: clientBranding?.company_name ?? client.name,
    logo_url: clientBranding?.logo_url ?? client.logo_url ?? null,
    primary_color: clientBranding?.primary_color ?? client.brand_color ?? "#7C3AED",
    secondary_color: clientBranding?.secondary_color ?? null,
    cover_image_url: clientBranding?.cover_image_url ?? null,
    prepared_by: clientBranding?.prepared_by ?? null,
    footer_text: clientBranding?.footer_text ?? "Confidential",
    show_watermark: clientBranding?.show_watermark ?? false,
  };

  const stream = await renderToStream(<AuditReport project={reportProject} findings={hydratedFindings} journeys={journeys ?? []} steps={steps ?? []} images={images ?? []} annotations={annotations ?? []} branding={branding} isPro options={options} />);
  const fileName = `${safeFileName(options.title || project.name)}.pdf`;
  const disposition = mode === "download" ? "attachment" : "inline";

  return new Response(stream as unknown as ReadableStream, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${disposition}; filename="${fileName}"`, "Cache-Control": "no-store" } });
}

function parseReportOptions(searchParams: URLSearchParams): ReportOptions {
  const templateParam = searchParams.get("template") || "professional";
  const template = VALID_TEMPLATES.includes(templateParam as ReportTemplateId) ? (templateParam as ReportTemplateId) : "professional";
  const sections = (searchParams.get("sections") || "").split(",").map((section) => section.trim()).filter((section): section is ReportSectionId => VALID_SECTIONS.includes(section as ReportSectionId));
  const title = searchParams.get("title")?.slice(0, 120) || null;
  return { title, template, sections: sections.length ? sections : null };
}
function safeFileName(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
