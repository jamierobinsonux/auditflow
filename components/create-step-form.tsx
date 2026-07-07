"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CreateStepForm({
  journeyId,
  userId,
  nextSortOrder,
}: {
  journeyId: string;
  userId: string;
  nextSortOrder: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("journey_steps").insert({
      journey_id: journeyId,
      user_id: userId,
      title,
      sort_order: nextSortOrder,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
      <input
        className="min-w-0 flex-1 rounded-xl border border-slate-200 p-3 text-sm"
        placeholder="Add journey step"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <button className="h-11 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 sm:h-auto">
        Add Step
      </button>
    </form>
  );
}