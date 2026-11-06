"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function DeleteReportButton({
  reportId,
  title,
}: {
  reportId: string;
  title: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function deleteReport() {
    const { error } = await supabase
      .from("report_exports")
      .delete()
      .eq("id", reportId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Report deleted.");
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Delete report?"
      description={`This will permanently delete ${title}. This action cannot be undone.`}
      confirmLabel="Delete"
      destructive
      onConfirm={deleteReport}
      trigger={
        <Button type="button" variant="outline" size="icon-sm" aria-label="Delete report">
          <Trash2 className="size-4" />
        </Button>
      }
    />
  );
}
