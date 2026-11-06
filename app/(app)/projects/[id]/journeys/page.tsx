import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectTabs } from "@/components/project-tabs";

export default async function JourneysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user?.id)
    .maybeSingle();

  const { data: journeys } = await supabase
    .from("journeys")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: true });

  const { data: steps } = await supabase
    .from("journey_steps")
    .select("*")
    .eq("user_id", user?.id);

  const { data: findings } = await supabase
    .from("findings")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", user?.id);

  if (!project) return <main className="p-10">Project not found.</main>;

  return (
    <main className="p-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-slate-950">
            Journeys
          </h1>
          <p className="mt-1 text-sm text-slate-500">{project.name}</p>
        </div>

        <Link
          href={`/projects/${id}/journeys/new`}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          + New Journey
        </Link>
      </div>

      <ProjectTabs projectId={id} />

      <div className="mt-6 grid gap-4">
        {(journeys ?? []).map((journey) => {
          const journeySteps = (steps ?? []).filter(
            (step) => step.journey_id === journey.id
          );

          const journeyFindings = (findings ?? []).filter(
            (finding) => finding.journey_id === journey.id
          );

          return (
            <Link
              key={journey.id}
              href={`/projects/${id}/journeys/${journey.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-950">
                    {journey.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {journey.description || "No description added."}
                  </p>
                </div>

                <div className="flex gap-3 text-sm text-slate-500">
                  <span>{journeySteps.length} steps</span>
                  <span>{journeyFindings.length} findings</span>
                </div>
              </div>
            </Link>
          );
        })}

        {(journeys ?? []).length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            No journeys yet. Create a journey to organize findings by user flow.
          </div>
        )}
      </div>
    </main>
  );
}