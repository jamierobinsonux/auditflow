import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeRecommendationId } from "@/lib/recommendations";
import {
  canCreateFinding,
  getUsage,
  getUserSubscription,
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
    .select("id,user_id")
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
    })
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
    .select("id")
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

  return NextResponse.json({ finding });
}
