"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { SelectInput } from "@/components/ui/select-input";
import type { StudioFrameworkDetail } from "@/types/framework";

export type FrameworkDraftCategory = {
  id?: string;
  name: string;
};

export type FrameworkDraftJourney = {
  id?: string;
  name: string;
  description: string;
  stepsText: string;
};

export type FrameworkDraftRecommendation = {
  id?: string;
  title: string;
  category: string;
  recommendation: string;
  impact: string;
};

const defaultCategories: FrameworkDraftCategory[] = [
  { name: "Navigation" },
  { name: "Forms" },
  { name: "Accessibility" },
];

const defaultJourneys: FrameworkDraftJourney[] = [
  {
    name: "Primary Task Flow",
    description: "Review the main user task from entry point to completion.",
    stepsText: "Entry point\nTask setup\nReview\nCompletion",
  },
];

const defaultRecommendations: FrameworkDraftRecommendation[] = [
  {
    title: "Clarify the primary action",
    category: "Navigation",
    recommendation:
      "Make the primary next step visually prominent and label it with clear, action-oriented language.",
    impact: "Medium",
  },
];

export function FrameworkBuilderClient({
  userId,
  framework,
}: {
  userId: string;
  framework?: StudioFrameworkDetail | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const initialCategories = useMemo<FrameworkDraftCategory[]>(() => {
    if (!framework) return defaultCategories;

    return [...(framework.categories ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        name: item.name,
      }));
  }, [framework]);

  const initialJourneys = useMemo<FrameworkDraftJourney[]>(() => {
    if (!framework) return defaultJourneys;

    return [...(framework.journey_stages ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        stepsText: (item.steps ?? []).join("\n"),
      }));
  }, [framework]);

  const initialRecommendations = useMemo<FrameworkDraftRecommendation[]>(() => {
    if (!framework) return defaultRecommendations;

    return [...(framework.recommendations ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category || "General",
        recommendation: item.recommendation,
        impact: item.impact || "Medium",
      }));
  }, [framework]);

  const [name, setName] = useState(framework?.name ?? "");
  const [category, setCategory] = useState(framework?.category ?? "Custom");
  const [description, setDescription] = useState(framework?.description ?? "");
  const [auditType, setAuditType] = useState(framework?.audit_type ?? "Custom");
  const [defaultReportTemplate, setDefaultReportTemplate] = useState(
    framework?.report_defaults?.template ?? "professional"
  );
  const [categories, setCategories] =
    useState<FrameworkDraftCategory[]>(initialCategories);
  const [journeys, setJourneys] =
    useState<FrameworkDraftJourney[]>(initialJourneys);
  const [recommendations, setRecommendations] =
    useState<FrameworkDraftRecommendation[]>(initialRecommendations);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(framework?.id);

  function addCategory() {
    setCategories((current) => [...current, { name: "" }]);
  }

  function addJourney() {
    setJourneys((current) => [
      ...current,
      { name: "", description: "", stepsText: "" },
    ]);
  }

  function addRecommendation() {
    setRecommendations((current) => [
      ...current,
      { title: "", category: "General", recommendation: "", impact: "Medium" },
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const cleanCategories = categories
      .map((item) => ({
        name: item.name.trim(),
      }))
      .filter((item) => item.name.length > 0);

    const cleanJourneys = journeys
      .map((item) => ({
        name: item.name.trim(),
        description: item.description.trim(),
        steps: item.stepsText
          .split("\n")
          .map((step) => step.trim())
          .filter(Boolean),
      }))
      .filter((item) => item.name.length > 0);

    const cleanRecommendations = recommendations
      .map((item) => ({
        title: item.title.trim(),
        category: item.category.trim(),
        recommendation: item.recommendation.trim(),
        impact: item.impact.trim(),
      }))
      .filter((item) => item.title.length > 0 && item.recommendation.length > 0);

    const frameworkPayload = {
      user_id: userId,
      name: name.trim(),
      category: category.trim() || null,
      description: description.trim() || null,
      audit_type: auditType.trim() || null,
      status: "Active",
    };

    const frameworkQuery = framework?.id
      ? supabase
          .from("studio_frameworks")
          .update(frameworkPayload)
          .eq("id", framework.id)
          .eq("user_id", userId)
          .select()
          .single()
      : supabase
          .from("studio_frameworks")
          .insert({
            ...frameworkPayload,
            is_default: false,
          })
          .select()
          .single();

    const { data: savedFramework, error: frameworkError } =
      await frameworkQuery;

    if (frameworkError || !savedFramework) {
      toast.error(frameworkError?.message || "Unable to save framework.");
      setSaving(false);
      return;
    }

    const frameworkId = savedFramework.id as string;

    if (isEditing) {
      const deleteResults = await Promise.all([
        supabase
          .from("studio_framework_categories")
          .delete()
          .eq("framework_id", frameworkId)
          .eq("user_id", userId),
        supabase
          .from("studio_framework_journey_stages")
          .delete()
          .eq("framework_id", frameworkId)
          .eq("user_id", userId),
        supabase
          .from("studio_framework_recommendations")
          .delete()
          .eq("framework_id", frameworkId)
          .eq("user_id", userId),
        supabase
          .from("studio_framework_report_defaults")
          .delete()
          .eq("framework_id", frameworkId)
          .eq("user_id", userId),
      ]);

      const deleteError = deleteResults.find((result) => result.error)?.error;

      if (deleteError) {
        toast.error(deleteError.message);
        setSaving(false);
        return;
      }
    }

    const inserts = [];

    if (cleanCategories.length > 0) {
      inserts.push(
        supabase.from("studio_framework_categories").insert(
          cleanCategories.map((item, index) => ({
            user_id: userId,
            framework_id: frameworkId,
            name: item.name,
            sort_order: index + 1,
          }))
        )
      );
    }

    if (cleanJourneys.length > 0) {
      inserts.push(
        supabase.from("studio_framework_journey_stages").insert(
          cleanJourneys.map((item, index) => ({
            user_id: userId,
            framework_id: frameworkId,
            name: item.name,
            description: item.description || null,
            steps: item.steps,
            sort_order: index + 1,
          }))
        )
      );
    }

    if (cleanRecommendations.length > 0) {
      inserts.push(
        supabase.from("studio_framework_recommendations").insert(
          cleanRecommendations.map((item, index) => ({
            user_id: userId,
            framework_id: frameworkId,
            title: item.title,
            category: item.category || null,
            recommendation: item.recommendation,
            impact: item.impact || null,
            sort_order: index + 1,
          }))
        )
      );
    }

    inserts.push(
      supabase.from("studio_framework_report_defaults").insert({
        user_id: userId,
        framework_id: frameworkId,
        template: defaultReportTemplate,
        sections: [
          "cover",
          "contents",
          "executive",
          "scope",
          "findings",
          "journeys",
          "recommendations",
          "appendix",
          "conclusion",
        ],
      })
    );

    const insertResults = await Promise.all(inserts);
    const insertError = insertResults.find((result) => result.error)?.error;

    if (insertError) {
      toast.error(insertError.message);
      setSaving(false);
      return;
    }

    toast.success(isEditing ? "Framework updated." : "Framework created.");
    router.push(`/templates/${frameworkId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">
          Framework details
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Define the reusable audit methodology Studio projects can start from.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FormField label="Name">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enterprise SaaS Audit"
              required
            />
          </FormField>

          <FormField label="Category">
            <TextInput
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="SaaS, Ecommerce, Accessibility..."
            />
          </FormField>

          <FormField label="Audit type">
            <TextInput
              value={auditType}
              onChange={(e) => setAuditType(e.target.value)}
              placeholder="SaaS"
            />
          </FormField>

          <FormField label="Default report template">
            <SelectInput
              value={defaultReportTemplate}
              onChange={(e) => setDefaultReportTemplate(e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="executive">Executive</option>
              <option value="minimal">Minimal</option>
              <option value="accessibility">Accessibility</option>
              <option value="findings">Findings only</option>
            </SelectInput>
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Description">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when this framework should be used and what it includes."
              />
            </FormField>
          </div>
        </div>
      </div>

      <FrameworkListSection
        title="Categories"
        description="Categories help organize findings and recommendations during the audit."
        actionLabel="Add category"
        onAdd={addCategory}
      >
        {categories.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_auto]"
          >
            <TextInput
              value={item.name}
              onChange={(e) =>
                setCategories((current) =>
                  current.map((category, categoryIndex) =>
                    categoryIndex === index
                      ? { ...category, name: e.target.value }
                      : category
                  )
                )
              }
              placeholder="Navigation"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setCategories((current) =>
                  current.filter((_, i) => i !== index)
                )
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </FrameworkListSection>

      <FrameworkListSection
        title="Journey stages"
        description="These become journeys and journey steps when a project is created from this framework."
        actionLabel="Add journey"
        onAdd={addJourney}
      >
        {journeys.map((item, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-xl border border-slate-200 p-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput
                value={item.name}
                onChange={(e) =>
                  setJourneys((current) =>
                    current.map((journey, journeyIndex) =>
                      journeyIndex === index
                        ? { ...journey, name: e.target.value }
                        : journey
                    )
                  )
                }
                placeholder="Checkout Flow"
              />
              <TextInput
                value={item.description}
                onChange={(e) =>
                  setJourneys((current) =>
                    current.map((journey, journeyIndex) =>
                      journeyIndex === index
                        ? { ...journey, description: e.target.value }
                        : journey
                    )
                  )
                }
                placeholder="What to evaluate in this journey"
              />
            </div>

            <TextArea
              value={item.stepsText}
              onChange={(e) =>
                setJourneys((current) =>
                  current.map((journey, journeyIndex) =>
                    journeyIndex === index
                      ? { ...journey, stepsText: e.target.value }
                      : journey
                  )
                )
              }
              placeholder={"Cart\nShipping\nPayment\nConfirmation"}
            />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setJourneys((current) =>
                    current.filter((_, i) => i !== index)
                  )
                }
              >
                Remove journey
              </Button>
            </div>
          </div>
        ))}
      </FrameworkListSection>

      <FrameworkListSection
        title="Recommended guidance"
        description="Optional reusable recommendations that travel with the framework."
        actionLabel="Add recommendation"
        onAdd={addRecommendation}
      >
        {recommendations.map((item, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-xl border border-slate-200 p-4"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_180px_140px]">
              <TextInput
                value={item.title}
                onChange={(e) =>
                  setRecommendations((current) =>
                    current.map((recommendation, recommendationIndex) =>
                      recommendationIndex === index
                        ? { ...recommendation, title: e.target.value }
                        : recommendation
                    )
                  )
                }
                placeholder="Improve form validation"
              />

              <TextInput
                value={item.category}
                onChange={(e) =>
                  setRecommendations((current) =>
                    current.map((recommendation, recommendationIndex) =>
                      recommendationIndex === index
                        ? { ...recommendation, category: e.target.value }
                        : recommendation
                    )
                  )
                }
                placeholder="Forms"
              />

              <SelectInput
                value={item.impact}
                onChange={(e) =>
                  setRecommendations((current) =>
                    current.map((recommendation, recommendationIndex) =>
                      recommendationIndex === index
                        ? { ...recommendation, impact: e.target.value }
                        : recommendation
                    )
                  )
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </SelectInput>
            </div>

            <TextArea
              value={item.recommendation}
              onChange={(e) =>
                setRecommendations((current) =>
                  current.map((recommendation, recommendationIndex) =>
                    recommendationIndex === index
                      ? {
                          ...recommendation,
                          recommendation: e.target.value,
                        }
                      : recommendation
                  )
                )
              }
              placeholder="Explain the recommended change and expected UX benefit."
            />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setRecommendations((current) =>
                    current.filter((_, i) => i !== index)
                  )
                }
              >
                Remove recommendation
              </Button>
            </div>
          </div>
        ))}
      </FrameworkListSection>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/templates")}
        >
          Cancel
        </Button>
        <Button disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Save framework" : "Create framework"}
        </Button>
      </div>
    </form>
  );
}

function FrameworkListSection({
  title,
  description,
  actionLabel,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onAdd}>
          {actionLabel}
        </Button>
      </div>

      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}