import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { escapeHtml, sendPostmarkEmail } from "@/lib/postmark";

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

  await emailAccountHolderAboutClientComment({
    request,
    context,
    authorName,
    commentBody,
    notificationHref,
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


async function emailAccountHolderAboutClientComment({
  request,
  context,
  authorName,
  commentBody,
  notificationHref,
}: {
  request: Request;
  context: PortalContext;
  authorName: string;
  commentBody: string;
  notificationHref: string;
}) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(context.client.user_id);

    if (error || !data?.user?.email) {
      console.warn("Client comment email skipped: account holder email not found.", error?.message);
      return;
    }

    if (data.user.user_metadata?.email_client_comments === false) {
      return;
    }

    const origin = new URL(request.url).origin;
    const findingTitle = context.finding.title || "Untitled finding";
    const project = Array.isArray(context.finding.projects) ? context.finding.projects[0] : context.finding.projects;
    const projectName = project?.name || "Audit project";
    const clientName = context.client.name || "Client";
    const commenter = authorName || clientName;
    const href = `${origin}${notificationHref}`;

    await sendPostmarkEmail({
      to: data.user.email,
      subject: `New client comment in AuditFlow`,
      textBody: [
        `${commenter} commented on a finding in AuditFlow.`,
        "",
        `Client: ${clientName}`,
        `Project: ${projectName}`,
        `Finding: ${findingTitle}`,
        "",
        commentBody,
        "",
        `View the finding: ${href}`,
      ].join("\\n"),
      htmlBody: `
        <div style="font-family:Inter,Arial,sans-serif;background:#F1F5F9;padding:32px;">
          <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;padding:32px;">
            <p style="margin:0 0 8px;color:#7C3AED;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">AuditFlow</p>
            <h1 style="margin:0;color:#0F172A;font-size:24px;line-height:1.25;">New client comment</h1>
            <p style="color:#64748B;font-size:15px;line-height:1.6;">${escapeHtml(commenter)} commented on a finding.</p>
            <div style="margin:20px 0;padding:16px;border:1px solid #E2E8F0;border-radius:14px;background:#F8FAFC;">
              <p style="margin:0 0 8px;color:#0F172A;font-weight:700;">${escapeHtml(findingTitle)}</p>
              <p style="margin:0;color:#64748B;font-size:14px;">${escapeHtml(clientName)} · ${escapeHtml(projectName)}</p>
              <p style="margin:14px 0 0;color:#334155;font-size:15px;line-height:1.6;">${escapeHtml(commentBody)}</p>
            </div>
            <a href="${escapeHtml(href)}" style="display:inline-block;background:#7C3AED;color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px;">View finding</a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Unable to send client comment email.", error);
  }
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
