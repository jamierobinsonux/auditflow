"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteFindingButton({
  projectId,
  findingId,
}: {
  projectId: string;
  findingId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this finding? This will also remove its evidence images."
    );

    if (!confirmed) return;

    const { error: imageError } = await supabase
      .from("finding_images")
      .delete()
      .eq("finding_id", findingId);

    if (imageError) {
      alert(imageError.message);
      return;
    }

    const { error } = await supabase
      .from("findings")
      .delete()
      .eq("id", findingId);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", projectId);

    router.push(`/projects/${projectId}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      Delete Finding
    </button>
  );
}