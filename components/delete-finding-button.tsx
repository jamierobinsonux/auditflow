"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function DeleteFindingButton({
  projectId,
  findingId,
}: {
  projectId: string;
  findingId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function deleteFinding() {
    const { error } = await supabase
      .from("findings")
      .delete()
      .eq("id", findingId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Finding deleted.");
    router.push(`/projects/${projectId}`);
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Delete finding?"
      description="This will permanently delete this finding and its related evidence. This action cannot be undone."
      confirmLabel="Delete finding"
      destructive
      onConfirm={deleteFinding}
      trigger={
        <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Delete Finding
        </button>
      }
    />
  );
}