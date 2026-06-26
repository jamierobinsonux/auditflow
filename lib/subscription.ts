import { createClient } from "@/lib/supabase/server";
import { subscriptionPlans, type PlanId } from "@/lib/subscription-plans";

export async function getUserSubscription(userId: string) {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const planId = (subscription?.plan || "Free") as PlanId;
  const plan = subscriptionPlans.find((item) => item.id === planId);

  return {
    subscription,
    plan,
    planId,
    isFree: planId === "Free",
    isPro: planId === "Pro",
    isStudio: planId === "Studio",
  };
}

export async function getUsage(userId: string) {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId);

  const { data: findings } = await supabase
    .from("findings")
    .select("id")
    .eq("user_id", userId);

  return {
    projectsUsed: projects?.length ?? 0,
    findingsUsed: findings?.length ?? 0,
  };
}

export function canCreateProject({
  planId,
  projectsUsed,
}: {
  planId: PlanId;
  projectsUsed: number;
}) {
  const plan = subscriptionPlans.find((item) => item.id === planId);
  const limit = plan?.limits.projects;

  if (limit === null || limit === undefined) return true;

  return projectsUsed < limit;
}

export function canCreateFinding({
  planId,
  findingsUsed,
}: {
  planId: PlanId;
  findingsUsed: number;
}) {
  const plan = subscriptionPlans.find((item) => item.id === planId);
  const limit = plan?.limits.findings;

  if (limit === null || limit === undefined) return true;

  return findingsUsed < limit;
}

export function canUsePublicReports(planId: PlanId) {
  const plan = subscriptionPlans.find((item) => item.id === planId);
  return Boolean(plan?.limits.publicReports);
}