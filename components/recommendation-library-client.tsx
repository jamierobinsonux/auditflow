"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { SelectInput } from "@/components/ui/select-input";
import type { StudioRecommendation } from "@/types/recommendation";

type DraftRecommendation = {
  id?: string;
  title: string;
  category: string;
  recommendation: string;
  impact: string;
};

const emptyDraft: DraftRecommendation = {
  title: "",
  category: "UX Writing",
  recommendation: "",
  impact: "Medium",
};

export function RecommendationLibraryClient({
  userId,
  recommendations,
}: {
  userId: string;
  recommendations: StudioRecommendation[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [draft, setDraft] = useState<DraftRecommendation>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(draft.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      user_id: userId,
      title: draft.title.trim(),
      category: draft.category || null,
      recommendation: draft.recommendation.trim(),
      impact: draft.impact || null,
    };

    const query = draft.id
      ? supabase
          .from("studio_recommendations")
          .update(payload)
          .eq("id", draft.id)
          .eq("user_id", userId)
      : supabase.from("studio_recommendations").insert(payload);

    const { error } = await query;

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    toast.success(isEditing ? "Recommendation updated." : "Recommendation saved.");
    setDraft(emptyDraft);
    setSaving(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from("studio_recommendations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Recommendation deleted.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-950">Saved recommendations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Reuse common recommendations across audits so findings stay consistent.
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-950">No recommendations yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Save your most common UX recommendations here, then reuse them while documenting findings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recommendations.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-950">{item.title}</h3>
                      {item.category && (
                        <span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">
                          {item.category}
                        </span>
                      )}
                      {item.impact && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {item.impact} impact
                        </span>
                      )}
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                      {item.recommendation}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDraft({
                          id: item.id,
                          title: item.title,
                          category: item.category ?? "UX Writing",
                          recommendation: item.recommendation,
                          impact: item.impact ?? "Medium",
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">
          {isEditing ? "Edit recommendation" : "New recommendation"}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Create reusable guidance for patterns you audit often.
        </p>

        <div className="mt-6 space-y-5">
          <FormField label="Title">
            <TextInput
              value={draft.title}
              onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
              placeholder="Improve form validation"
              required
            />
          </FormField>

          <FormField label="Category">
            <SelectInput
              value={draft.category}
              onChange={(e) => setDraft((current) => ({ ...current, category: e.target.value }))}
            >
              <option>UX Writing</option>
              <option>Forms</option>
              <option>Navigation</option>
              <option>Accessibility</option>
              <option>Onboarding</option>
              <option>Trust & Credibility</option>
              <option>Performance</option>
              <option>Other</option>
            </SelectInput>
          </FormField>

          <FormField label="Impact">
            <SelectInput
              value={draft.impact}
              onChange={(e) => setDraft((current) => ({ ...current, impact: e.target.value }))}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </SelectInput>
          </FormField>

          <FormField label="Recommendation">
            <TextArea
              value={draft.recommendation}
              onChange={(e) => setDraft((current) => ({ ...current, recommendation: e.target.value }))}
              placeholder="Explain the recommended change and why it improves the experience."
              required
            />
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {isEditing && (
            <Button type="button" variant="outline" onClick={() => setDraft(emptyDraft)}>
              Cancel
            </Button>
          )}
          <Button disabled={saving}>{saving ? "Saving..." : isEditing ? "Save changes" : "Save recommendation"}</Button>
        </div>
      </form>
    </div>
  );
}
