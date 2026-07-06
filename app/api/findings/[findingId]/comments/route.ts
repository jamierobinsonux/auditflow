import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_COMMENT_LENGTH = 2000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ findingId: string }> }
) {
  const { findingId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const commentBody = String(body?.body || "").trim();

  if (!commentBody) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  if (commentBody.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json(
      { error: "Comment must be 2,000 characters or fewer." },
      { status: 400 }
    );
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

  const project = Array.isArray((finding as any).projects)
    ? (finding as any).projects[0]
    : (finding as any).projects;

  const { data: comment, error } = await supabase
    .from("finding_comments")
    .insert({
      user_id: user.id,
      client_id: project?.client_id ?? null,
      project_id: (finding as any).project_id,
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
