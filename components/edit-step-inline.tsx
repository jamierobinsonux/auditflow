"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function EditStepInline({
  stepId,
  initialTitle,
  mobileStacked = false,
}: {
  stepId: string;
  initialTitle: string;
  mobileStacked?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  function cancelEditing() {
    setTitle(initialTitle);
    setIsEditing(false);
  }

  async function saveStep(e?: React.FormEvent) {
    e?.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSaving) return;

    setIsSaving(true);

    const { error } = await supabase
      .from("journey_steps")
      .update({ title: trimmedTitle })
      .eq("id", stepId);

    setIsSaving(false);

    if (error) {
      toast.error("Couldn't save the step. Try again.", {
        description: error.message,
      });
      return;
    }

    setTitle(trimmedTitle);
    setIsEditing(false);
    router.refresh();
  }

  if (isEditing) {
    return (
      <form onSubmit={saveStep} className="flex flex-1 items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          aria-label="Step name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancelEditing();
          }}
          autoFocus
        />

        <Button type="submit" size="sm" disabled={isSaving || !title.trim()}>
          {isSaving ? "Saving..." : "Save"}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaving}
          onClick={cancelEditing}
        >
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <div
      className={
        mobileStacked
          ? "flex min-w-0 flex-1 flex-col items-start gap-2 md:flex-row md:items-center md:justify-between md:gap-3"
          : "flex flex-1 items-center justify-between gap-3"
      }
    >
      <p className="min-w-0 text-sm font-semibold text-slate-950">
        {initialTitle}
      </p>

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-sm font-medium text-violet-600"
      >
        Edit
      </button>
    </div>
  );
}
