"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";

type EditEvidenceButtonProps = {
  imageId: string;
  evidenceName?: string | null;
  caption?: string | null;
};

export function EditEvidenceButton({
  imageId,
  evidenceName,
  caption,
}: EditEvidenceButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(evidenceName ?? "");
  const [nextCaption, setNextCaption] = useState(caption ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    const { error } = await supabase
      .from("finding_images")
      .update({
        evidence_name: name.trim() || null,
        caption: nextCaption.trim() || null,
      })
      .eq("id", imageId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Evidence updated.");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-5 items-center text-sm font-medium leading-none text-slate-600 hover:text-slate-950"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Edit evidence
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Update the evidence name and caption used in findings and reports.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <FormField label="Evidence name">
                <TextInput
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Landing page hero"
                />
              </FormField>

              <FormField label="Caption">
                <TextArea
                  value={nextCaption}
                  onChange={(event) => setNextCaption(event.target.value)}
                  placeholder="Describe what this evidence shows."
                />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save evidence"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
