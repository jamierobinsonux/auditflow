"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
    const { error: findingError } = await supabase
      .from("findings")
      .update({
        journey_id: null,
        journey_step_id: null,
      })
      .eq("journey_id", journeyId);

    if (findingError) {
      toast.error(findingError.message);
      return;
    }

    const { error: stepError } = await supabase
      .from("journey_steps")
      .delete()
      .eq("journey_id", journeyId);

    if (stepError) {
      toast.error(stepError.message);
      return;
    }

    const { error } = await supabase
      .from("journeys")
      .delete()
      .eq("id", journeyId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Journey deleted.");
    router.push(`/projects/${projectId}/journeys`);
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Delete journey?"
      description="Existing findings will stay in the project but will no longer be attached to this journey. This action cannot be undone."
      confirmLabel="Delete journey"
      destructive
      onConfirm={handleDelete}
      trigger={
        <button
          type="button"
          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete Journey
        </button>
      }
    />
  );
}
