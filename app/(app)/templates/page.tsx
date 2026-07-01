import Link from "next/link";
import { redirect } from "next/navigation";
import { Archive, Shapes } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { auditFrameworks } from "@/lib/audit-frameworks";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { FrameworkActions } from "@/components/framework-actions";
import type { StudioFrameworkWithItems } from "@/types/framework";

export default async function FrameworksPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams?.tab === "archived" ? "archived" : "active";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const subscription = await getUserSubscription(user.id);

  const { data } = subscription.isStudio
    ? await supabase
        .from("studio_frameworks")
        .select("*, categories:studio_framework_categories(*), journey_stages:studio_framework_journey_stages(*), recommendations:studio_framework_recommendations(*)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  const customFrameworks = normalizeFrameworks(data ?? []);
  const activeCustom = customFrameworks.filter(
    (framework) => framework.status === "Active"
  );
  const archivedCustom = customFrameworks.filter(
    (framework) => framework.status === "Archived"
  );
  const visibleCustom = activeTab === "archived" ? archivedCustom : activeCustom;

  return (
    <PageShell>
      <PageHeader
        title="Audit Frameworks"
        description="Start from built-in frameworks or create Studio frameworks that standardize your agency's audit process."
        action={
          subscription.isStudio ? (
            <Button asChild>
              <Link href="/templates/new">+ New Framework</Link>
            </Button>
          ) : undefined
        }
      />

      {!subscription.isStudio && (
        <Card className="mt-8 border-violet-200 bg-violet-50 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-700">
                Studio feature
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                Create your own reusable audit frameworks
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Studio lets you save custom categories, journey stages,
                recommendations, and report defaults so every client audit starts
                with your process already in place.
              </p>
            </div>
            <Button asChild>
              <Link href="/settings/billing">Upgrade to Studio</Link>
            </Button>
          </div>
        </Card>
      )}

      {subscription.isStudio && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant={activeTab === "active" ? "default" : "outline"}>
              <Link href="/templates">Active</Link>
            </Button>

            <Button asChild variant={activeTab === "archived" ? "default" : "outline"}>
              <Link href="/templates?tab=archived">Archived</Link>
            </Button>
          </div>

          <div className="mt-8 mb-5">
            <h2 className="text-base font-semibold text-slate-950">
              Studio frameworks
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Custom frameworks create project journeys and suggest reusable
              recommendations.
            </p>
          </div>

          {visibleCustom.length === 0 ? (
            activeTab === "archived" ? (
              <EmptyState
                icon={Archive}
                title="No archived frameworks"
                description="Archived frameworks will appear here so your active framework library stays focused."
              />
            ) : (
              <EmptyState
                icon={Shapes}
                title="No custom frameworks yet"
                description="Create a Studio framework to reuse your categories, journey stages, and recommendations across client projects."
                actionLabel="Create Framework"
                actionHref="/templates/new"
              />
            )
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {visibleCustom.map((framework) => (
                <CustomFrameworkCard
                  key={framework.id}
                  framework={framework}
                  userId={user.id}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-10">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Built-in frameworks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            AuditFlow starter frameworks are available to all users.
          </p>
        </div>

        <div className="mt-5 grid items-stretch gap-5 md:grid-cols-2">
          {auditFrameworks.map((framework) => (
            <Card
              key={framework.id}
              className="flex h-full min-h-[300px] flex-col p-6 transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >
              <div className="flex flex-1 flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                  {framework.category}
                </p>
                <h3 className="mt-2 text-[18px] font-semibold text-slate-950">
                  {framework.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {framework.description}
                </p>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Includes
                  </p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                    {framework.journeys.slice(0, 4).map((journey) => (
                      <li key={journey.name}>• {journey.name}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6">
                  <Button asChild>
                    <Link href={`/projects/new?frameworkId=${framework.id}`}>
                      Use Framework
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function CustomFrameworkCard({
  framework,
  userId,
}: {
  framework: StudioFrameworkWithItems;
  userId: string;
}) {
  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                {framework.category || "Studio"}
              </p>
              {framework.is_default && (
                <span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">
                  Default
                </span>
              )}
              {framework.status === "Archived" && (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  Archived
                </span>
              )}
            </div>
            <h3 className="mt-2 text-[18px] font-semibold text-slate-950">
              {framework.name}
            </h3>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/templates/${framework.id}/edit`}>Edit</Link>
          </Button>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {framework.description || "Reusable Studio audit framework."}
        </p>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <MiniMetric label="Categories" value={framework.categories.length} />
          <MiniMetric label="Journeys" value={framework.journey_stages.length} />
          <MiniMetric
            label="Recommendations"
            value={framework.recommendations.length}
          />
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          {framework.status === "Active" && (
            <Button asChild>
              <Link href={`/projects/new?frameworkId=${framework.id}`}>
                Use Framework
              </Link>
            </Button>
          )}
          <FrameworkActions
            frameworkId={framework.id}
            userId={userId}
            status={framework.status}
          />
        </div>
      </div>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-lg font-semibold text-slate-950">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function normalizeFrameworks(data: any[]): StudioFrameworkWithItems[] {
  return data.map((framework) => ({
    ...framework,
    categories: Array.isArray(framework.categories) ? framework.categories : [],
    journey_stages: Array.isArray(framework.journey_stages)
      ? framework.journey_stages
      : [],
    recommendations: Array.isArray(framework.recommendations)
      ? framework.recommendations
      : [],
  })) as StudioFrameworkWithItems[];
}
