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
        <button type="button" className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 hover:bg-red-100 sm:h-auto sm:w-auto sm:border-0 sm:bg-transparent sm:p-0 sm:text-red-600 sm:hover:bg-transparent">
          Delete
        </button>
      }
    />
  );
}
