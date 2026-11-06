import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_COMMENT_LENGTH = 2000;

type OwnedFinding = {
  id: string;
  project_id: string;
  user_id: string;
  projects?: { id: string; client_id: string | null } | { id: string; client_id: string | null }[] | null;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ findingId: string }> }
) {
  const { findingId } = await params;
  const authContext = await getAuditorFindingContext(findingId);
  if (authContext instanceof NextResponse) return authContext;

  const body = await request.json().catch(() => null);
  const commentBody = String(body?.body || "").trim();
  const validationError = validateCommentBody(commentBody);
  if (validationError) return validationError;

  const { user, finding } = authContext;
  const project = Array.isArray(finding.projects) ? finding.projects[0] : finding.projects;

  // Use the service-role client for the insert after verifying above that
  // the signed-in auditor owns this finding. The finding_comments table is
  // also written by the public client portal, so its RLS policies do not
  // currently include an authenticated INSERT policy for auditor replies.
  const { data: comment, error } = await supabaseAdmin
    .from("finding_comments")
    .insert({
      user_id: user.id,
      client_id: project?.client_id ?? null,
      project_id: finding.project_id,
      finding_id: finding.id,
      author_type: "auditor",
      author_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Auditor",
      body: commentBody,
    })
    .select("id,author_name,body,created_at,author_type")
    .single();

  if (error || !comment) {
    return NextResponse.json(
      { error: error?.message || "Unable to save reply." },
      { status: 500 }
    );
  }

  return NextResponse.json({ comment });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ findingId: string }> }
) {
  const { findingId } = await params;
  const authContext = await getAuditorFindingContext(findingId);
  if (authContext instanceof NextResponse) return authContext;

  const body = await request.json().catch(() => null);
  const commentId = String(body?.commentId || "").trim();
  const commentBody = String(body?.body || "").trim();

  if (!commentId) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  const validationError = validateCommentBody(commentBody);
  if (validationError) return validationError;

  const { user, finding } = authContext;

  // Service-role update is scoped tightly to the signed-in auditor's own reply.
  const { data: comment, error } = await supabaseAdmin
    .from("finding_comments")
    .update({ body: commentBody })
    .eq("id", commentId)
    .eq("finding_id", finding.id)
    .eq("project_id", finding.project_id)
    .eq("user_id", user.id)
    .eq("author_type", "auditor")
    .select("id,author_name,body,created_at,author_type")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!comment) {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  }

  return NextResponse.json({ comment });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ findingId: string }> }
) {
  const { findingId } = await params;
  const authContext = await getAuditorFindingContext(findingId);
  if (authContext instanceof NextResponse) return authContext;

  const body = await request.json().catch(() => null);
  const url = new URL(request.url);
  const commentId = String(body?.commentId || url.searchParams.get("commentId") || "").trim();

  if (!commentId) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  const { user, finding } = authContext;

  // Service-role delete is scoped tightly to the signed-in auditor's own reply.
  const { error, count } = await supabaseAdmin
    .from("finding_comments")
    .delete({ count: "exact" })
    .eq("id", commentId)
    .eq("finding_id", finding.id)
    .eq("project_id", finding.project_id)
    .eq("user_id", user.id)
    .eq("author_type", "auditor");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!count) {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
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

async function getAuditorFindingContext(findingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: finding } = await supabase
    .from("findings")
    .select("id,project_id,user_id, projects(id,client_id)")
    .eq("id", findingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!finding) {
    return NextResponse.json({ error: "Finding not found." }, { status: 404 });
  }

  return { user, finding: finding as OwnedFinding };
}
