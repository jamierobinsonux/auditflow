import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string; findingId: string }> }
) {
  const { token, findingId } = await params;
  const body = await request.json().catch(() => null);

  const commentBody = String(body?.body || "").trim();
  const authorName = String(body?.authorName || "").trim();

  if (!commentBody) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  if (commentBody.length > 2000) {
    return NextResponse.json(
      { error: "Comment must be 2,000 characters or fewer." },
      { status: 400 }
    );
  }

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("id,user_id,portal_enabled")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "Portal not found." }, { status: 404 });
  }

  const { data: finding } = await supabaseAdmin
    .from("findings")
    .select("id,project_id,user_id, projects!inner(id,client_id,archived)")
    .eq("id", findingId)
    .eq("user_id", client.user_id)
    .eq("projects.client_id", client.id)
    .eq("projects.archived", false)
    .maybeSingle();

  if (!finding) {
    return NextResponse.json({ error: "Finding not found." }, { status: 404 });
  }

  const { data: comment, error } = await supabaseAdmin
    .from("finding_comments")
    .insert({
      user_id: client.user_id,
      client_id: client.id,
      project_id: finding.project_id,
      finding_id: finding.id,
      author_type: "client",
      author_name: authorName || null,
      body: commentBody,
    })
    .select("id,author_name,body,created_at")
    .single();

  if (error || !comment) {
    return NextResponse.json(
      { error: error?.message || "Unable to save comment." },
      { status: 500 }
    );
  }

  return NextResponse.json({ comment });
}
