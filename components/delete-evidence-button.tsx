"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function DeleteEvidenceButton({
  imageId,
  onDeleted,
}: {
  imageId: string;
  onDeleted?: (imageId: string) => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    const { error } = await supabase
      .from("finding_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      toast.error(error.message);
      return;
    }

    onDeleted?.(imageId);
    toast.success("Evidence deleted.");
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Delete evidence?"
      description="This screenshot and all of its annotations will be permanently removed. This action cannot be undone."
      confirmLabel="Delete evidence"
      destructive
      onConfirm={handleDelete}
      trigger={
        <button
          type="button"
          className="inline-flex h-5 items-center text-sm font-medium leading-none text-red-600 hover:text-red-700"
        >
          Delete
        </button>
      }
    />
  );
}
