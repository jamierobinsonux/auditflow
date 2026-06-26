import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { AuditReport } from "@/components/pdf/AuditReport";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

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

  const stream = await renderToStream(
    <AuditReport
      project={project}
      findings={findings ?? []}
      journeys={journeys ?? []}
      steps={steps ?? []}
      images={images ?? []}
    />
  );

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileName(
        project.name
      )}-ux-audit-report.pdf"`,
    },
  });
}

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}