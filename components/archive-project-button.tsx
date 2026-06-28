"use client";

import { useRouter } from "next/navigation";
import { Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ArchiveProjectButton({
  projectId,
  archived,
}: {
  projectId: string;
  archived?: boolean | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleClick() {
    const { error } = await supabase
      .from("projects")
      .update({
        archived: !archived,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(archived ? "Project restored." : "Project archived.");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleClick}>
      {archived ? (
        <>
          <RotateCcw className="h-4 w-4" />
          Restore Project
        </>
      ) : (
        <>
          <Archive className="h-4 w-4" />
          Archive Project
        </>
      )}
    </Button>
  );
}