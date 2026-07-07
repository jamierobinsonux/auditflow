"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You need to be signed in.");
      return;
    }

    const { error: projectError } = await supabase
      .from("projects")
      .update({ client_id: null, updated_at: new Date().toISOString() })
      .eq("client_id", clientId)
      .eq("user_id", user.id);

    if (projectError) {
      toast.error(projectError.message);
      return;
    }

    const { error: brandingError } = await supabase
      .from("client_branding")
      .delete()
      .eq("client_id", clientId)
      .eq("user_id", user.id);

    if (brandingError) {
      toast.error(brandingError.message);
      return;
    }

    const { error } = await supabase.from("clients").delete().eq("id", clientId).eq("user_id", user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Client deleted. Existing projects were kept and unassigned.");
    router.push("/clients");
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Delete client?"
      description="This permanently deletes the client workspace. Existing projects and reports will be kept, but they will no longer be assigned to this client."
      confirmLabel="Delete client"
      destructive
      onConfirm={handleDelete}
      trigger={
        <Button type="button" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
          Delete Client
        </Button>
      }
    />
  );
}
