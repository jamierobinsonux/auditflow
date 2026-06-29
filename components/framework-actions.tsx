"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function FrameworkActions({
  frameworkId,
  userId,
  status,
}: {
  frameworkId: string;
  userId: string;
  status: "Active" | "Archived";
}) {
  const router = useRouter();
  const supabase = createClient();

  async function setDefault() {
    await supabase.from("studio_frameworks").update({ is_default: false }).eq("user_id", userId);
    const { error } = await supabase
      .from("studio_frameworks")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("id", frameworkId)
      .eq("user_id", userId);

    if (error) return toast.error(error.message);
    toast.success("Default framework updated.");
    router.refresh();
  }

  async function toggleArchive() {
    const nextStatus = status === "Active" ? "Archived" : "Active";
    const { error } = await supabase
      .from("studio_frameworks")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", frameworkId)
      .eq("user_id", userId);

    if (error) return toast.error(error.message);
    toast.success(nextStatus === "Archived" ? "Framework archived." : "Framework restored.");
    router.refresh();
  }

  async function duplicate() {
    const { data: source, error } = await supabase
      .from("studio_frameworks")
      .select("*, categories:studio_framework_categories(*), journey_stages:studio_framework_journey_stages(*), recommendations:studio_framework_recommendations(*)")
      .eq("id", frameworkId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !source) return toast.error(error?.message ?? "Framework not found.");

    const { data: copy, error: copyError } = await supabase
      .from("studio_frameworks")
      .insert({
        user_id: userId,
        name: `${source.name} Copy`,
        category: source.category,
        description: source.description,
        audit_type: source.audit_type,
        status: "Active",
        is_default: false,
      })
      .select("id")
      .single();

    if (copyError) return toast.error(copyError.message);

    const categories = (source.categories ?? []).map((item: any) => ({
      user_id: userId,
      framework_id: copy.id,
      name: item.name,
      sort_order: item.sort_order,
    }));
    const stages = (source.journey_stages ?? []).map((item: any) => ({
      user_id: userId,
      framework_id: copy.id,
      name: item.name,
      description: item.description,
      steps: item.steps ?? [],
      sort_order: item.sort_order,
    }));
    const recommendations = (source.recommendations ?? []).map((item: any) => ({
      user_id: userId,
      framework_id: copy.id,
      title: item.title,
      category: item.category,
      recommendation: item.recommendation,
      impact: item.impact,
      sort_order: item.sort_order,
    }));

    await Promise.all([
      categories.length ? supabase.from("studio_framework_categories").insert(categories) : Promise.resolve({ error: null }),
      stages.length ? supabase.from("studio_framework_journey_stages").insert(stages) : Promise.resolve({ error: null }),
      recommendations.length ? supabase.from("studio_framework_recommendations").insert(recommendations) : Promise.resolve({ error: null }),
    ]);

    toast.success("Framework duplicated.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" onClick={setDefault}>Set default</Button>
      <Button type="button" size="sm" variant="outline" onClick={duplicate}>Duplicate</Button>
      <Button type="button" size="sm" variant="ghost" onClick={toggleArchive}>{status === "Active" ? "Archive" : "Restore"}</Button>
    </div>
  );
}
