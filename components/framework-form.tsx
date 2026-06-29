"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { SelectInput } from "@/components/ui/select-input";
import type { StudioFrameworkWithItems } from "@/types/framework";

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseJourneyStages(value: string) {
  return lines(value).map((line, index) => {
    const [namePart, stepsPart = ""] = line.split("|");
    const steps = stepsPart
      .split(",")
      .map((step) => step.trim())
      .filter(Boolean);

    return {
      name: namePart.trim(),
      description: null as string | null,
      steps,
      sort_order: index + 1,
    };
  });
}

function parseRecommendations(value: string) {
  return lines(value).map((line, index) => {
    const [title = "Recommendation", category = "General", impact = "Medium", ...body] = line.split("|");
    return {
      title: title.trim(),
      category: category.trim() || null,
      impact: impact.trim() || null,
      recommendation: body.join("|").trim() || title.trim(),
      sort_order: index + 1,
    };
  });
}

function stringifyJourneyStages(framework?: StudioFrameworkWithItems | null) {
  return (framework?.journey_stages ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((stage) => `${stage.name} | ${(stage.steps ?? []).join(", ")}`)
    .join("\n");
}

function stringifyRecommendations(framework?: StudioFrameworkWithItems | null) {
  return (framework?.recommendations ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(
      (item) =>
        `${item.title} | ${item.category ?? "General"} | ${item.impact ?? "Medium"} | ${item.recommendation}`
    )
    .join("\n");
}

export function FrameworkForm({
  userId,
  framework,
}: {
  userId: string;
  framework?: StudioFrameworkWithItems | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(framework?.name ?? "");
  const [category, setCategory] = useState(framework?.category ?? "UX Audit");
  const [description, setDescription] = useState(framework?.description ?? "");
  const [auditType, setAuditType] = useState(framework?.audit_type ?? "SaaS");
  const [status, setStatus] = useState<"Active" | "Archived">(framework?.status ?? "Active");
  const [isDefault, setIsDefault] = useState(Boolean(framework?.is_default));
  const [categories, setCategories] = useState(
    (framework?.categories ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => item.name)
      .join("\n") || "Navigation\nContent\nForms\nAccessibility\nTrust"
  );
  const [journeyStages, setJourneyStages] = useState(
    stringifyJourneyStages(framework) ||
      "Discovery | Landing page, Navigation, Search\nTask Completion | Forms, Error states, Confirmation\nPost-task | Feedback, Follow-up, Support"
  );
  const [recommendations, setRecommendations] = useState(
    stringifyRecommendations(framework) ||
      "Improve form validation | Forms | High | Add inline validation and clear recovery guidance so users can correct errors without losing progress.\nClarify primary actions | Navigation | Medium | Increase CTA hierarchy and make the next step visually obvious."
  );
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    return {
      categories: lines(categories),
      journeyStages: parseJourneyStages(journeyStages),
      recommendations: parseRecommendations(recommendations),
    };
  }, [categories, journeyStages, recommendations]);

  async function saveFramework(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      user_id: userId,
      name: name.trim(),
      category: category.trim() || null,
      description: description.trim() || null,
      audit_type: auditType.trim() || null,
      status,
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    };

    if (!payload.name) {
      toast.error("Framework name is required.");
      setSaving(false);
      return;
    }

    let frameworkId = framework?.id;

    if (frameworkId) {
      const { error } = await supabase
        .from("studio_frameworks")
        .update(payload)
        .eq("id", frameworkId)
        .eq("user_id", userId);

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("studio_frameworks")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }

      frameworkId = data.id;
    }

    if (isDefault) {
      await supabase
        .from("studio_frameworks")
        .update({ is_default: false })
        .eq("user_id", userId)
        .neq("id", frameworkId);
    }

    await Promise.all([
      supabase.from("studio_framework_categories").delete().eq("framework_id", frameworkId).eq("user_id", userId),
      supabase.from("studio_framework_journey_stages").delete().eq("framework_id", frameworkId).eq("user_id", userId),
      supabase.from("studio_framework_recommendations").delete().eq("framework_id", frameworkId).eq("user_id", userId),
    ]);

    const categoryRows = preview.categories.map((item, index) => ({
      user_id: userId,
      framework_id: frameworkId,
      name: item,
      sort_order: index + 1,
    }));

    const stageRows = preview.journeyStages.map((item) => ({
      user_id: userId,
      framework_id: frameworkId,
      ...item,
    }));

    const recommendationRows = preview.recommendations.map((item) => ({
      user_id: userId,
      framework_id: frameworkId,
      ...item,
    }));

    const inserts = [];
    if (categoryRows.length) inserts.push(supabase.from("studio_framework_categories").insert(categoryRows));
    if (stageRows.length) inserts.push(supabase.from("studio_framework_journey_stages").insert(stageRows));
    if (recommendationRows.length) inserts.push(supabase.from("studio_framework_recommendations").insert(recommendationRows));

    const results = await Promise.all(inserts);
    const insertError = results.find((result) => result.error)?.error;

    if (insertError) {
      toast.error(insertError.message);
      setSaving(false);
      return;
    }

    toast.success("Framework saved.");
    router.push("/templates");
    router.refresh();
  }

  return (
    <form onSubmit={saveFramework} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Framework name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="SaaS UX Audit" required />
          </FormField>

          <FormField label="Category">
            <TextInput value={category} onChange={(e) => setCategory(e.target.value)} placeholder="SaaS" />
          </FormField>
        </div>

        <FormField label="Description">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe when this framework should be used." />
        </FormField>

        <div className="grid gap-5 md:grid-cols-3">
          <FormField label="Audit type">
            <SelectInput value={auditType} onChange={(e) => setAuditType(e.target.value)}>
              <option>SaaS</option>
              <option>Mobile App</option>
              <option>Ecommerce</option>
              <option>Accessibility</option>
              <option>Dashboard</option>
              <option>General UX</option>
            </SelectInput>
          </FormField>

          <FormField label="Status">
            <SelectInput value={status} onChange={(e) => setStatus(e.target.value as "Active" | "Archived")}>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </SelectInput>
          </FormField>

          <FormField label="Default">
            <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm text-slate-700">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              Use by default
            </label>
          </FormField>
        </div>

        <FormField label="Finding categories" description="One category per line. These appear as options while creating findings.">
          <TextArea className="min-h-36" value={categories} onChange={(e) => setCategories(e.target.value)} />
        </FormField>

        <FormField label="Journey stages" description="Use: Journey name | Step 1, Step 2, Step 3">
          <TextArea className="min-h-40" value={journeyStages} onChange={(e) => setJourneyStages(e.target.value)} />
        </FormField>

        <FormField label="Framework recommendations" description="Use: Title | Category | Impact | Recommendation text">
          <TextArea className="min-h-44" value={recommendations} onChange={(e) => setRecommendations(e.target.value)} />
        </FormField>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/templates">Cancel</Link>
          </Button>
          <Button disabled={saving}>{saving ? "Saving..." : "Save Framework"}</Button>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-950">Preview</p>
        <div className="mt-5 space-y-5 text-sm">
          <PreviewBlock label="Categories" items={preview.categories} />
          <PreviewBlock label="Journeys" items={preview.journeyStages.map((stage) => `${stage.name} (${stage.steps.length} steps)`)} />
          <PreviewBlock label="Recommendations" items={preview.recommendations.map((item) => item.title)} />
        </div>
      </aside>
    </form>
  );
}

function PreviewBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">None configured</p>
      ) : (
        <ul className="mt-2 space-y-1 text-slate-700">
          {items.slice(0, 5).map((item) => (
            <li key={item}>• {item}</li>
          ))}
          {items.length > 5 && <li className="text-slate-400">+ {items.length - 5} more</li>}
        </ul>
      )}
    </div>
  );
}
