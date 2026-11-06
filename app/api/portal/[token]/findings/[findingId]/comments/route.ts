import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type PortalContext = {
  client: { id: string; user_id: string; portal_enabled: boolean; name: string | null };
  finding: {
    id: string;
    project_id: string;
    user_id: string;
    title: string | null;
    projects?: { id: string; name: string | null; client_id: string | null; archived: boolean } | { id: string; name: string | null; client_id: string | null; archived: boolean }[] | null;
  };
};

const MAX_COMMENT_LENGTH = 2000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string; findingId: string }> }
) {
  const { token, findingId } = await params;
  const body = await request.json().catch(() => null);

  const commentBody = String(body?.body || "").trim();
  const authorName = String(body?.authorName || "").trim();

  const validationError = validateCommentBody(commentBody);
  if (validationError) return validationError;

  const context = await getPortalContext(token, findingId);
  if (context instanceof NextResponse) return context;

  const { data: comment, error } = await supabaseAdmin
    .from("finding_comments")
    .insert({
      user_id: context.client.user_id,
      client_id: context.client.id,
      project_id: context.finding.project_id,
      finding_id: context.finding.id,
      author_type: "client",
      author_name: authorName || null,
      body: commentBody,
    })
    .select("id,author_name,body,created_at,author_type")
    .single();

  if (error || !comment) {
    return NextResponse.json(
      { error: error?.message || "Unable to save comment." },
      { status: 500 }
    );
  }

  const notificationHref = `/projects/${context.finding.project_id}/findings/${context.finding.id}`;

  await supabaseAdmin.from("notifications").insert({
    user_id: context.client.user_id,
    type: "client_comment",
    title: "New client comment",
    message: `${authorName || "A client"} commented on a finding.`,
    href: notificationHref,
    severity: "info",
    dedupe_key: null,
    metadata: {
      client_id: context.client.id,
      project_id: context.finding.project_id,
      finding_id: context.finding.id,
      comment_id: comment.id,
    },
  });

  return NextResponse.json({ comment });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string; findingId: string }> }
) {
  const { token, findingId } = await params;
  const body = await request.json().catch(() => null);

  const commentId = String(body?.commentId || "").trim();
  const commentBody = String(body?.body || "").trim();

  if (!commentId) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  const validationError = validateCommentBody(commentBody);
  if (validationError) return validationError;

  const context = await getPortalContext(token, findingId);
  if (context instanceof NextResponse) return context;

  const { data: comment, error } = await supabaseAdmin
    .from("finding_comments")
    .update({ body: commentBody })
    .eq("id", commentId)
    .eq("finding_id", context.finding.id)
    .eq("project_id", context.finding.project_id)
    .eq("client_id", context.client.id)
    .eq("user_id", context.client.user_id)
    .eq("author_type", "client")
    .select("id,author_name,body,created_at,author_type")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  return NextResponse.json({ comment });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ token: string; findingId: string }> }
) {
  const { token, findingId } = await params;
  const body = await request.json().catch(() => null);
  const url = new URL(request.url);
  const commentId = String(body?.commentId || url.searchParams.get("commentId") || "").trim();

  if (!commentId) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  const context = await getPortalContext(token, findingId);
  if (context instanceof NextResponse) return context;

  const { error, count } = await supabaseAdmin
    .from("finding_comments")
    .delete({ count: "exact" })
    .eq("id", commentId)
    .eq("finding_id", context.finding.id)
    .eq("project_id", context.finding.project_id)
    .eq("client_id", context.client.id)
    .eq("user_id", context.client.user_id)
    .eq("author_type", "client");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!count) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, commentId });
}


function validateCommentBody(commentBody: string) {
  if (!commentBody) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  if (commentBody.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json(
      { error: "Comment must be 2,000 characters or fewer." },
      { status: 400 }
    );
  }

  return null;
}

async function getPortalContext(
  token: string,
  findingId: string
): Promise<PortalContext | NextResponse> {
  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("id,user_id,portal_enabled,name")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "Portal not found." }, { status: 404 });
  }

  const { data: finding } = await supabaseAdmin
    .from("findings")
    .select("id,project_id,user_id,title, projects!inner(id,name,client_id,archived)")
    .eq("id", findingId)
    .eq("user_id", client.user_id)
    .eq("projects.client_id", client.id)
    .eq("projects.archived", false)
    .maybeSingle();

  if (!finding) {
    return NextResponse.json({ error: "Finding not found." }, { status: 404 });
  }

  return { client, finding: finding as PortalContext["finding"] };
}
