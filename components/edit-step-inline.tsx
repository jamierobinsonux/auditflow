"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const [title, setTitle] = useState(initialTitle);

  async function saveStep() {
    const { error } = await supabase
      .from("journey_steps")
      .update({ title })
      .eq("id", stepId);

    if (error) {
      alert(error.message);
      return;
    }

    setIsEditing(false);
    router.refresh();
  }

  if (isEditing) {
    return (
      <div className="flex flex-1 items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <button
          type="button"
          onClick={saveStep}
          className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
        >
          Save
        </button>

        <button
          type="button"
          onClick={() => {
            setTitle(initialTitle);
            setIsEditing(false);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
        >
          Cancel
        </button>
      </div>
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