"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SelectInput } from "@/components/ui/select-input";

export function EditProjectMetaCard({
  projectId,
  label,
  value,
  field,
  type = "text",
  options = [],
}: {
  projectId: string;
  label: string;
  value: string | null;
  field: "audit_type" | "status" | "client_name";
  type?: "text" | "select";
  options?: string[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value || "");

  async function save() {
    const { error } = await supabase
      .from("projects")
      .update({
        [field]: draftValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      alert(error.message);
      return;
    }

    setEditing(false);
    router.refresh();
  }

  return (
    <div
      onClick={() => !editing && setEditing(true)}
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:bg-violet-50/40"
    >
      <p className="text-sm text-slate-500">{label}</p>

      {editing ? (
        <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          {type === "select" ? (
            <SelectInput
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
            >
              {options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </SelectInput>
          ) : (
            <input
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              autoFocus
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={save}
              className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Save
            </button>

            <button
              onClick={() => {
                setDraftValue(value || "");
                setEditing(false);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[16px] font-semibold text-slate-950">
          {value || "—"}
        </p>
      )}
    </div>
  );
}