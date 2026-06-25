"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteJourneyButton({
  projectId,
  journeyId,
}: {
  projectId: string;
  journeyId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this journey? Existing findings will no longer be attached to this journey."
    );

    if (!confirmed) return;

    await supabase
      .from("findings")
      .update({
        journey_id: null,
        journey_step_id: null,
      })
      .eq("journey_id", journeyId);

    await supabase.from("journey_steps").delete().eq("journey_id", journeyId);

    const { error } = await supabase
      .from("journeys")
      .delete()
      .eq("id", journeyId);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/projects/${projectId}/journeys`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      Delete Journey
    </button>
  );
}