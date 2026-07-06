"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function EditJourneyButton({
  journeyId,
  projectId,
  initialName,
  initialDescription,
}: {
  journeyId: string;
  projectId: string;
  initialName: string;
  initialDescription?: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function saveJourney(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Journey name is required.");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from("journeys")
      .update({
        name: trimmedName,
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", journeyId)
      .eq("project_id", projectId);

    setIsSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Journey updated.");
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
        Edit Journey
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Edit journey</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the name and description shown across this project.
              </p>
            </div>

            <form onSubmit={saveJourney} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Journey name</span>
                <Input
                  className="mt-2 h-11 rounded-xl bg-white px-3"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <Textarea
                  className="mt-2 min-h-[110px] rounded-xl bg-white px-3 py-2"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add a short description of this journey."
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setName(initialName);
                    setDescription(initialDescription ?? "");
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
