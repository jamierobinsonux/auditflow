import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_PROJECT_CLIENT_NAME, DEMO_PROJECT_NAME, DEMO_PROJECT_URL } from "@/lib/subscription";

const demoFindings = [
  {
    title: "Primary CTA is difficult to notice",
    description:
      "The main action blends into the surrounding layout, making it harder for users to know what to do next.",
    recommendation:
      "Increase CTA contrast, simplify nearby competing actions, and use clearer action-oriented copy.",
    severity: "P1",
    status: "Open",
    impact: "High",
    effort: "Low",
  },
  {
    title: "Search results lack useful filtering",
    description:
      "Users may need to scan too many results manually because key filters are not surfaced early enough.",
    recommendation:
      "Add prominent filters for category, relevance, and recency near the top of the results view.",
    severity: "P2",
    status: "In Progress",
    impact: "High",
    effort: "Medium",
  },
  {
    title: "Empty state does not explain next steps",
    description:
      "The empty state tells users there is no content, but does not explain how to move forward.",
    recommendation:
      "Add a short explanation and a primary action that guides users to create or import content.",
    severity: "P2",
    status: "Open",
    impact: "Medium",
    effort: "Low",
  },
  {
    title: "Confirmation feedback is easy to miss",
    description:
      "After completing an action, the success feedback appears too subtly and may be overlooked.",
    recommendation:
      "Use a clearer success message with stronger visual feedback and a direct link to the completed item.",
    severity: "P3",
    status: "Resolved",
    impact: "Medium",
    effort: "Low",
  },
];

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existingDemo } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", DEMO_PROJECT_NAME)
    .eq("client_name", DEMO_PROJECT_CLIENT_NAME)
    .eq("website_url", DEMO_PROJECT_URL)
    .maybeSingle();

  if (existingDemo) {
    return NextResponse.json({ project: existingDemo });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: DEMO_PROJECT_NAME,
      client_name: DEMO_PROJECT_CLIENT_NAME,
      website_url: DEMO_PROJECT_URL,
      audit_type: "Mobile App",
      status: "Completed",
    })
    .select()
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: projectError?.message || "Could not create demo project." },
      { status: 500 }
    );
  }

  const { data: journey, error: journeyError } = await supabase
    .from("journeys")
    .insert({
      project_id: project.id,
      user_id: user.id,
      name: "Core User Flow",
      description: "A sample journey showing how users move through the app.",
    })
    .select()
    .single();

  if (journeyError || !journey) {
    return NextResponse.json(
      { error: journeyError?.message || "Could not create demo journey." },
      { status: 500 }
    );
  }

  const steps = ["Discover", "Evaluate", "Take action", "Confirm"];

  await supabase.from("journey_steps").insert(
    steps.map((step, index) => ({
      journey_id: journey.id,
      user_id: user.id,
      title: step,
      sort_order: index + 1,
    }))
  );

  const { error: findingsError } = await supabase.from("findings").insert(
    demoFindings.map((finding) => ({
      ...finding,
      project_id: project.id,
      user_id: user.id,
      journey_id: journey.id,
    }))
  );

  if (findingsError) {
    return NextResponse.json(
      { error: findingsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ projectId: project.id });
}