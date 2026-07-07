import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectTabs } from "@/components/project-tabs";
import { CreateStepForm } from "@/components/create-step-form";
import { DeleteJourneyButton } from "@/components/delete-journey-button";
import { EditStepInline } from "@/components/edit-step-inline";
import { DeleteStepButton } from "@/components/delete-step-button";
import { EditJourneyButton } from "@/components/edit-journey-button";

export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ id: string; journeyId: string }>;
}) {
  const { id, journeyId } = await params;
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

  const { data: journey } = await supabase
    .from("journeys")
    .select("*")
    .eq("id", journeyId)
    .eq("project_id", id)
    .eq("user_id", user?.id)
    .maybeSingle();

  const { data: steps } = await supabase
    .from("journey_steps")
    .select("*")
    .eq("journey_id", journeyId)
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  const { data: findings } = await supabase
    .from("findings")
    .select("*")
    .eq("journey_id", journeyId)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  if (!project || !journey || !user) {
    return <main className="p-10">Journey not found.</main>;
  }

  return (
    <main className="p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-slate-950">
            {journey.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {journey.description || "No description added."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <EditJourneyButton
            journeyId={journeyId}
            projectId={id}
            initialName={journey.name}
            initialDescription={journey.description}
          />
          <DeleteJourneyButton projectId={id} journeyId={journeyId} />

          <Link
            href={`/projects/${id}/findings/new?journeyId=${journeyId}`}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 sm:w-auto"
          >
            + Add Finding
          </Link>
        </div>
      </div>

      <ProjectTabs projectId={id} />

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-[18px] font-semibold text-slate-950">Steps</h2>

        <div className="mt-4 space-y-3">
          {(steps ?? []).map((step, index) => {
            const stepFindings = (findings ?? []).filter(
              (finding) => finding.journey_step_id === step.id
            );

            return (
              <div
                key={step.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-1 items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>

                    <EditStepInline
                      stepId={step.id}
                      initialTitle={step.title}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <DeleteStepButton stepId={step.id} />

                    <Link
                      href={`/projects/${id}/findings/new?journeyId=${journeyId}&stepId=${step.id}`}
                      className="text-sm font-medium text-violet-600"
                    >
                      Add finding
                    </Link>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {stepFindings.length} findings
                </p>

                {stepFindings.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {stepFindings.map((finding) => (
                      <Link
                        key={finding.id}
                        href={`/projects/${id}/findings/${finding.id}`}
                        className="block rounded-lg bg-slate-50 p-3 text-sm hover:bg-slate-100"
                      >
                        <span className="font-medium">{finding.title}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {finding.severity}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {(steps ?? []).length === 0 && (
            <p className="text-sm text-slate-500">
              No steps yet. Add the first step in this journey.
            </p>
          )}
        </div>

        <CreateStepForm
          journeyId={journeyId}
          userId={user.id}
          nextSortOrder={(steps ?? []).length + 1}
        />
      </section>

      {(findings ?? []).some((finding) => !finding.journey_step_id) && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-[18px] font-semibold text-slate-950">
            Findings not assigned to a step
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            These findings are attached to this journey, but not to a specific journey step yet.
          </p>

          <div className="mt-4 space-y-2">
            {(findings ?? [])
              .filter((finding) => !finding.journey_step_id)
              .map((finding) => (
                <Link
                  key={finding.id}
                  href={`/projects/${id}/findings/${finding.id}`}
                  className="block rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50"
                >
                  <span className="font-medium">{finding.title}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {finding.severity}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}