import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeRecommendationId } from "@/lib/recommendations";
import { captureServerEvent } from "@/lib/posthog-server";
import {
  canCreateFinding,
  getUsage,
  getUserSubscription,
  isDemoProject,
} from "@/lib/subscription";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const projectId = String(body.project_id || "");

  if (!projectId) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id,user_id,name,client_name,website_url")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const [subscription, usage] = await Promise.all([
    getUserSubscription(user.id),
    getUsage(user.id),
  ]);

  if (
    !canCreateFinding({
      planId: subscription.planId,
      findingsUsed: usage.findingsUsed,
    }) && !isDemoProject(project)
  ) {
    return NextResponse.json(
      {
        error: "Free plan finding limit reached.",
        upgradeRequired: true,
        redirectTo: "/settings/billing?limit=findings",
      },
      { status: 403 }
    );
  }

  const title = String(body.title || "").trim();

  if (!title) {
    return NextResponse.json({ error: "Finding title is required." }, { status: 400 });
  }

  const { data: duplicateFinding, error: duplicateFindingError } = await supabase
    .from("findings")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .ilike("title", title)
    .limit(1)
    .maybeSingle();

  if (duplicateFindingError) {
    return NextResponse.json({ error: duplicateFindingError.message }, { status: 500 });
  }

  if (duplicateFinding) {
    return NextResponse.json(
      { error: `A finding named "${title}" already exists in this project.` },
      { status: 409 }
    );
  }

  const { data: finding, error } = await supabase
    .from("findings")
    .insert({
      project_id: projectId,
      user_id: user.id,
      title,
      description: body.description || null,
      severity: body.severity || "P2",
      status: body.status || "Open",
      category: body.category || null,
      recommendation: body.recommendation || null,
      recommendation_source: body.recommendation_source || null,
      saved_recommendation_id: normalizeRecommendationId(body.saved_recommendation_id),
      framework_recommendation_id: normalizeRecommendationId(body.framework_recommendation_id),
      impact: body.impact || null,
      effort: body.effort || null,
      journey_id: body.journey_id || null,
      journey_step_id: body.journey_step_id || null,
    })
    .select("id, project_id, severity, category, status")
.single();

  if (error || !finding) {
    return NextResponse.json(
      { error: error?.message || "Unable to create finding." },
      { status: 400 }
    );
  }

  await supabase
    .from("projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", user.id);

  await captureServerEvent({
  distinctId: user.id,
  event: "finding_created",
  properties: {
    finding_id: finding.id,
    project_id: finding.project_id,
    severity: finding.severity || null,
    category: finding.category || null,
    status: finding.status || null,
  },
});

return NextResponse.json({ finding });
}
