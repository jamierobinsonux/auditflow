"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { SelectInput } from "@/components/ui/select-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const categories = [
  "UX Writing",
  "Forms",
  "Navigation",
  "Accessibility",
  "Onboarding",
  "Trust & Credibility",
  "Performance",
  "Other",
];

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
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const isEditing = Boolean(draft.id);

  const filteredRecommendations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return recommendations;

    return recommendations.filter((item) => {
      return [item.title, item.category, item.impact, item.recommendation]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [query, recommendations]);

  function openCreate() {
    setDraft(emptyDraft);
    setOpen(true);
  }

  function openEdit(item: StudioRecommendation) {
    setDraft({
      id: item.id,
      title: item.title,
      category: item.category ?? "UX Writing",
      recommendation: item.recommendation,
      impact: item.impact ?? "Medium",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      user_id: userId,
      title: draft.title.trim(),
      category: draft.category || null,
      recommendation: draft.recommendation.trim(),
      impact: draft.impact || null,
      updated_at: new Date().toISOString(),
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

    toast.success(isEditing ? "Recommendation updated." : "Recommendation created.");
    setDraft(emptyDraft);
    setSaving(false);
    setOpen(false);
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
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recommendations..."
              className="pl-9"
            />
          </div>

          <Button type="button" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Recommendation
          </Button>
        </div>

        {recommendations.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-base font-semibold text-slate-950">No recommendations yet</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Save your most common UX recommendations here, then reuse them while documenting findings.
            </p>
            <div className="mt-6">
              <Button type="button" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Create Recommendation
              </Button>
            </div>
          </Card>
        ) : filteredRecommendations.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="font-semibold text-slate-950">No matches found</p>
            <p className="mt-2 text-sm text-slate-500">Try a different search term.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1.2fr_160px_120px_120px] bg-slate-100 p-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <span>Recommendation</span>
              <span>Category</span>
              <span>Impact</span>
              <span className="text-right">Actions</span>
            </div>

            {filteredRecommendations.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.2fr_160px_120px_120px] items-start gap-4 border-t border-slate-100 p-4 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 max-h-12 overflow-hidden text-sm leading-6 text-slate-500">
                    {item.recommendation}
                  </p>
                </div>

                <span className="text-slate-600">{item.category || "—"}</span>
                <span className="text-slate-600">{item.impact || "—"}</span>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(item)}>
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <ConfirmDialog
                    title="Delete recommendation?"
                    description="This removes the saved recommendation from your library. Findings that already used this text will not be changed."
                    confirmLabel="Delete"
                    destructive
                    onConfirm={() => handleDelete(item.id)}
                    trigger={
                      <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit recommendation" : "New recommendation"}</DialogTitle>
            <DialogDescription>
              Create reusable guidance for patterns you audit often.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Title">
              <TextInput
                value={draft.title}
                onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
                placeholder="Improve form validation"
                required
              />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Category">
                <SelectInput
                  value={draft.category}
                  onChange={(e) => setDraft((current) => ({ ...current, category: e.target.value }))}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
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
            </div>

            <FormField label="Recommendation">
              <TextArea
                value={draft.recommendation}
                onChange={(e) => setDraft((current) => ({ ...current, recommendation: e.target.value }))}
                placeholder="Explain the recommended change and why it improves the experience."
                required
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button disabled={saving}>{saving ? "Saving..." : isEditing ? "Save changes" : "Create recommendation"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
