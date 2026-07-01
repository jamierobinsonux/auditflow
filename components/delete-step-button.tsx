"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function DeleteStepButton({ stepId }: { stepId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    const { error: findingError } = await supabase
      .from("findings")
      .update({ journey_step_id: null })
      .eq("journey_step_id", stepId);

    if (findingError) {
      toast.error(findingError.message);
      return;
    }

    const { error } = await supabase
      .from("journey_steps")
      .delete()
      .eq("id", stepId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Journey step deleted.");
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Delete step?"
      description="Findings attached to this step will stay in the journey but become unassigned to a specific step. This action cannot be undone."
      confirmLabel="Delete step"
      destructive
      onConfirm={handleDelete}
      trigger={
        <button type="button" className="text-sm font-medium text-red-600">
          Delete
        </button>
      }
    />
  );
}
