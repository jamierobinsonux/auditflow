"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteStepButton({ stepId }: { stepId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this step? Findings attached to it will stay in the journey but become unassigned to a step."
    );

    if (!confirmed) return;

    await supabase
      .from("findings")
      .update({ journey_step_id: null })
      .eq("journey_step_id", stepId);

    const { error } = await supabase
      .from("journey_steps")
      .delete()
      .eq("id", stepId);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-sm font-medium text-red-600"
    >
      Delete
    </button>
  );
}