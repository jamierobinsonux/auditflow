"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";

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
        <Button type="button" variant="destructive">
          Delete Project
        </Button>
      }
    />
  );
}