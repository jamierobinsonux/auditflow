"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function deleteProject() {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Project deleted.");
    router.push("/projects");
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Delete project?"
      description="This will permanently delete the project and its related findings. This action cannot be undone."
      confirmLabel="Delete project"
      destructive
      onConfirm={deleteProject}
      trigger={
        <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Delete Project
        </button>
      }
    />
  );
}