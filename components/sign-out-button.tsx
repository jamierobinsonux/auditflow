"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import posthog from "posthog-js";

export function SignOutButton({
  className = "text-xs font-medium text-slate-500 hover:text-slate-900",
  showIcon = false,
}: {
  className?: string;
  showIcon?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    posthog.reset();
    router.push("/login");
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Sign out?"
      description="Are you sure you want to sign out of AuditFlow?"
      confirmLabel="Sign out"
      onConfirm={handleSignOut}
      trigger={
        <button type="button" className={className}>
          <span className="inline-flex items-center gap-2">
            {showIcon ? <LogOut size={14} /> : null}
            Sign out
          </span>
        </button>
      }
    />
  );
}
