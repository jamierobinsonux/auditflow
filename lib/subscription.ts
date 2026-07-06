import { createClient } from "@/lib/supabase/server";
import { subscriptionPlans, type PlanId } from "@/lib/subscription-plans";

export const DEMO_PROJECT_NAME = "Demo Mobile App Audit";
export const DEMO_PROJECT_CLIENT_NAME = "Demo Client";
export const DEMO_PROJECT_URL = "https://example.com";

export type UsageProject = {
  id: string;
  name?: string | null;
  client_name?: string | null;
  website_url?: string | null;
};

export type UsageFinding = {
  id: string;
  project_id?: string | null;
};

export function isDemoProject(project: {
  name?: string | null;
  client_name?: string | null;
  website_url?: string | null;
}) {
  return (
    project.name === DEMO_PROJECT_NAME &&
    project.client_name === DEMO_PROJECT_CLIENT_NAME &&
    project.website_url === DEMO_PROJECT_URL
  );
}

export function getDemoProjectIds(projects: UsageProject[]) {
  return new Set(
    projects.filter((project) => isDemoProject(project)).map((project) => project.id)
  );
}

export function countBillableProjects(projects: UsageProject[]) {
  const demoProjectIds = getDemoProjectIds(projects);
  return projects.filter((project) => !demoProjectIds.has(project.id)).length;
}

export function countBillableFindings({
  projects,
  findings,
}: {
  projects: UsageProject[];
  findings: UsageFinding[];
}) {
  const demoProjectIds = getDemoProjectIds(projects);
  return findings.filter((finding) => {
    if (!finding.project_id) return true;
    return !demoProjectIds.has(finding.project_id);
  }).length;
}

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
    .select("id,name,client_name,website_url")
    .eq("user_id", userId);

  const projectRows = projects ?? [];

  const { data: findings } = await supabase
    .from("findings")
    .select("id,project_id")
    .eq("user_id", userId);

  const findingRows = findings ?? [];
  const demoProjectIds = getDemoProjectIds(projectRows);

  return {
    projectsUsed: countBillableProjects(projectRows),
    findingsUsed: countBillableFindings({
      projects: projectRows,
      findings: findingRows,
    }),
    demoProjectsUsed: demoProjectIds.size,
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