import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canCreateFinding,
  getUsage,
  getUserSubscription,
  isDemoProject,
} from "@/lib/subscription";
import { NewFindingForm } from "@/components/new-finding-form";
import type { RecommendationOption } from "@/components/recommendation-picker";

type RecommendationRow = Omit<RecommendationOption, "source">;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewFindingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: projectId } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Everything that doesn't depend on the project row loads in one round trip.
  const [
    { data: project },
    subscription,
    usage,
    { data: journeyData },
    { data: libraryData },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id,framework_id,name,client_name,website_url")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle(),
    getUserSubscription(user.id),
    getUsage(user.id),
    supabase
      .from("journeys")
      .select("id,name")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("studio_recommendations")
      .select("id,title,category,recommendation,impact")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (!project) redirect("/projects");

  // Same rule the API enforces, checked before the person starts typing.
  if (
    !isDemoProject(project) &&
    !canCreateFinding({
      planId: subscription.planId,
      findingsUsed: usage.findingsUsed,
    })
  ) {
    redirect("/settings/billing?limit=findings");
  }

  const journeys = (journeyData ?? []) as { id: string; name: string }[];
  const journeyIds = journeys.map((journey) => journey.id);

  // These need the project's framework and the journey ids.
  const [
    { data: stepData },
    { data: frameworkData },
    { data: categoryData },
  ] = await Promise.all([
    journeyIds.length > 0
      ? supabase
          .from("journey_steps")
          .select("id,journey_id,title")
          .eq("user_id", user.id)
          .in("journey_id", journeyIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    project.framework_id
      ? supabase
          .from("studio_framework_recommendations")
          .select("id,title,category,recommendation,impact")
          .eq("user_id", user.id)
          .eq("framework_id", project.framework_id)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    project.framework_id
      ? supabase
          .from("studio_framework_categories")
          .select("name")
          .eq("user_id", user.id)
          .eq("framework_id", project.framework_id)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  const steps = (stepData ?? []) as {
    id: string;
    journey_id: string;
    title: string;
  }[];

  const recommendations: RecommendationOption[] = [
    ...((frameworkData ?? []) as RecommendationRow[]).map((item) => ({
      ...item,
      source: "framework" as const,
    })),
    ...((libraryData ?? []) as RecommendationRow[]).map((item) => ({
      ...item,
      source: "library" as const,
    })),
  ];

  const frameworkCategories = ((categoryData ?? []) as { name: string | null }[])
    .map((item) => item.name)
    .filter((name): name is string => Boolean(name));

  // Prefill from links like ?journeyId=...&stepId=... (used by the journey pages).
  const requestedJourneyId = firstValue(query.journeyId) ?? "";
  const requestedStepId =
    firstValue(query.stepId) ?? firstValue(query.journeyStepId) ?? "";

  const matchingStep = requestedStepId
    ? steps.find((step) => step.id === requestedStepId)
    : null;

  const initialJourneyId = journeys.some(
    (journey) => journey.id === requestedJourneyId
  )
    ? requestedJourneyId
    : (matchingStep?.journey_id ?? "");

  const initialStepId =
    matchingStep &&
    (!initialJourneyId || matchingStep.journey_id === initialJourneyId)
      ? matchingStep.id
      : "";

  return (
    <NewFindingForm
      projectId={projectId}
      userId={user.id}
      journeys={journeys}
      steps={steps}
      recommendations={recommendations}
      frameworkCategories={frameworkCategories}
      initialJourneyId={initialJourneyId}
      initialStepId={initialStepId}
    />
  );
}
