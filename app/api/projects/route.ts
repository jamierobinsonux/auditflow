import { NextResponse } from "next/server";
import { auditFrameworks } from "@/lib/audit-frameworks";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/posthog-server";
import {
  canCreateProject,
  getUsage,
  getUserSubscription,
} from "@/lib/subscription";

type CreateProjectBody = {
  name?: string;
  clientId?: string | null;
  clientName?: string | null;
  websiteUrl?: string | null;
  auditType?: string | null;
  frameworkId?: string | null;
  frameworkSource?: "builtin" | "studio" | null;
};

type FrameworkJourney = {
  name: string;
  description: string | null;
  steps: string[];
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [subscription, usage] = await Promise.all([
    getUserSubscription(user.id),
    getUsage(user.id),
  ]);

  if (
    !canCreateProject({
      planId: subscription.planId,
      projectsUsed: usage.projectsUsed,
    })
  ) {
    return NextResponse.json(
      {
        error: "You've reached the Free plan limit of 1 project.",
        upgradeRequired: true,
      },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as CreateProjectBody;
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }

  const { data: duplicateProject, error: duplicateProjectError } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (duplicateProjectError) {
    return NextResponse.json({ error: duplicateProjectError.message }, { status: 500 });
  }

  if (duplicateProject) {
    return NextResponse.json(
      { error: `A project named "${name}" already exists.` },
      { status: 409 }
    );
  }

  let clientName = body.clientName?.trim() || null;
  let websiteUrl = body.websiteUrl?.trim() || null;
  let frameworkId: string | null = null;
  let auditType = body.auditType?.trim() || "General UX";
  let journeys: FrameworkJourney[] = [];

  if (body.clientId) {
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id,name,website_url")
      .eq("id", body.clientId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 });
    }

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    clientName = client.name;
    websiteUrl = websiteUrl || client.website_url || null;
  }

  if (body.frameworkId && body.frameworkSource === "builtin") {
    const builtInFramework = auditFrameworks.find(
      (framework) => framework.id === body.frameworkId
    );

    if (!builtInFramework) {
      return NextResponse.json({ error: "Framework not found." }, { status: 404 });
    }

    auditType = builtInFramework.auditType;
    journeys = builtInFramework.journeys.map((journey) => ({
      name: journey.name,
      description: journey.description,
      steps: journey.steps,
    }));
  }

  if (body.frameworkId && body.frameworkSource === "studio") {
    const { data: framework, error: frameworkError } = await supabase
      .from("studio_frameworks")
      .select("id,audit_type,status,journey_stages:studio_framework_journey_stages(*)")
      .eq("id", body.frameworkId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (frameworkError) {
      return NextResponse.json({ error: frameworkError.message }, { status: 500 });
    }

    if (!framework || framework.status !== "Active") {
      return NextResponse.json({ error: "Framework not found." }, { status: 404 });
    }

    frameworkId = framework.id;
    auditType = framework.audit_type || auditType;
    journeys = (Array.isArray(framework.journey_stages)
      ? framework.journey_stages
      : []
    )
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((stage: any) => ({
        name: stage.name,
        description: stage.description || null,
        steps: Array.isArray(stage.steps) ? stage.steps : [],
      }));
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      name,
      client_id: body.clientId || null,
      framework_id: frameworkId,
      client_name: clientName,
      website_url: websiteUrl,
      audit_type: auditType,
      status: "In Progress",
      user_id: user.id,
    })
    .select()
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: projectError?.message || "Unable to create project." },
      { status: 500 }
    );
  }

  for (const journey of journeys) {
    const { data: createdJourney, error: journeyError } = await supabase
      .from("journeys")
      .insert({
        project_id: project.id,
        user_id: user.id,
        name: journey.name,
        description: journey.description,
      })
      .select()
      .single();

    if (journeyError || !createdJourney) {
      return NextResponse.json(
        { error: journeyError?.message || "Unable to create framework journey." },
        { status: 500 }
      );
    }

    if (journey.steps.length > 0) {
      const { error: stepError } = await supabase.from("journey_steps").insert(
        journey.steps.map((stepTitle, index) => ({
          journey_id: createdJourney.id,
          user_id: user.id,
          title: stepTitle,
          sort_order: index + 1,
        }))
      );

      if (stepError) {
        return NextResponse.json({ error: stepError.message }, { status: 500 });
      }
    }
  }

  await captureServerEvent({
    distinctId: user.id,
    event: "project_created",
    properties: {
      project_id: project.id,
      audit_type: auditType,
      framework_source: body.frameworkSource || "none",
      has_client: Boolean(body.clientId),
      plan: subscription.planId,
    },
  });

  return NextResponse.json({ projectId: project.id });
}
