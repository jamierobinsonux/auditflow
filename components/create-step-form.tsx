"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  // Stay disabled until the page has refreshed, so the next step always gets
  // an up-to-date sort order and a double-click can't create duplicates.
  const isBusy = isSaving || isRefreshing;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || isBusy) return;

    setIsSaving(true);

    const { error } = await supabase.from("journey_steps").insert({
      journey_id: journeyId,
      user_id: userId,
      title: trimmedTitle,
      sort_order: nextSortOrder,
    });

    setIsSaving(false);

    if (error) {
      toast.error("Couldn't add the step. Try again.", {
        description: error.message,
      });
      return;
    }

    setTitle("");
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
      <TextInput
        className="flex-1"
        aria-label="Journey step name"
        placeholder="Add journey step"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Button type="submit" size="lg" disabled={isBusy || !title.trim()}>
        {isBusy ? "Adding..." : "Add Step"}
      </Button>
    </form>
  );
}
