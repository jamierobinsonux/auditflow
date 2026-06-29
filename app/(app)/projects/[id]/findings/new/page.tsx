"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { EvidenceUploader, type EvidenceUpload } from "@/components/evidence-uploader";
import { createSafeStoragePath } from "@/lib/storage";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { SelectInput } from "@/components/ui/select-input";
import { Button } from "@/components/ui/button";
import { RecommendationPicker, type RecommendationOption } from "@/components/recommendation-picker";

type Journey = { id: string; name: string };
type JourneyStep = { id: string; journey_id: string; title: string };

type ProjectContext = {
  id: string;
  framework_id: string | null;
};

export default function NewFindingPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const projectId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("P2");
  const [status, setStatus] = useState("Open");
  const [category, setCategory] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [impact, setImpact] = useState("");
  const [effort, setEffort] = useState("");
  const [journeyId, setJourneyId] = useState("");
  const [journeyStepId, setJourneyStepId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<ProjectContext | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationOption[]>([]);
  const [images, setImages] = useState<EvidenceUpload[]>([{ file: null, caption: "" }]);

  const availableSteps = useMemo(
    () => steps.filter((step) => step.journey_id === journeyId),
    [steps, journeyId]
  );

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const [{ data: projectData }, { data: journeyData }, { data: stepData }] = await Promise.all([
        supabase
          .from("projects")
          .select("id,framework_id")
          .eq("id", projectId)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("journeys")
          .select("id,name")
          .eq("project_id", projectId)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("journey_steps")
          .select("id,journey_id,title")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true }),
      ]);

      if (!projectData) {
        toast.error("Project not found.");
        router.push("/projects");
        return;
      }

      setProject(projectData as ProjectContext);
      setJourneys((journeyData ?? []) as Journey[]);
      setSteps((stepData ?? []) as JourneyStep[]);

      const libraryQuery = supabase
        .from("studio_recommendations")
        .select("id,title,category,recommendation,impact")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      const frameworkQuery = projectData.framework_id
        ? supabase
            .from("studio_framework_recommendations")
            .select("id,title,category,recommendation,impact")
            .eq("user_id", user.id)
            .eq("framework_id", projectData.framework_id)
            .order("sort_order", { ascending: true })
        : Promise.resolve({ data: [], error: null } as any);

      const [{ data: libraryData }, { data: frameworkData }] = await Promise.all([
        libraryQuery,
        frameworkQuery,
      ]);

      const libraryOptions = (libraryData ?? []).map((item: any) => ({ ...item, source: "library" as const }));
      const frameworkOptions = (frameworkData ?? []).map((item: any) => ({ ...item, source: "framework" as const }));
      setRecommendations([...frameworkOptions, ...libraryOptions]);
    }

    loadData();
  }, [projectId, router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: finding, error } = await supabase
      .from("findings")
      .insert({
        project_id: projectId,
        user_id: user.id,
        title,
        description,
        severity,
        status,
        category: category || null,
        recommendation,
        impact,
        effort,
        journey_id: journeyId || null,
        journey_step_id: journeyStepId || null,
      })
      .select("id")
      .single();

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    for (const image of images) {
      if (!image.file) continue;

      const filePath = createSafeStoragePath(finding.id, image.file);
      const { error: uploadError } = await supabase.storage.from("finding-images").upload(filePath, image.file);

      if (uploadError) {
        toast.error(uploadError.message);
        setIsSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("finding-images").getPublicUrl(filePath);
      const { error: imageInsertError } = await supabase.from("finding_images").insert({
        finding_id: finding.id,
        user_id: user.id,
        image_url: publicUrlData.publicUrl,
        caption: image.caption,
      });

      if (imageInsertError) {
        toast.error(imageInsertError.message);
        setIsSaving(false);
        return;
      }
    }

    await supabase
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", user.id);

    toast.success("Finding added.");
    router.push(`/projects/${projectId}/findings/${finding.id}`);
    router.refresh();
  }

  function applyRecommendation(item: RecommendationOption) {
    setRecommendation(item.recommendation);
    setImpact(item.impact ?? impact);
    setCategory(item.category ?? category);
  }

  return (
    <PageShell>
      <PageHeader title="New Finding" description="Document a usability issue, connect it to the journey, and add supporting evidence." />

      <Card className="mx-auto mt-8 max-w-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Finding title">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Users cannot recover after payment validation fails" required />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Journey" description="Optional">
              <SelectInput value={journeyId} onChange={(e) => { setJourneyId(e.target.value); setJourneyStepId(""); }}>
                <option value="">No journey</option>
                {journeys.map((journey) => <option key={journey.id} value={journey.id}>{journey.name}</option>)}
              </SelectInput>
            </FormField>

            <FormField label="Journey step" description="Optional">
              <SelectInput value={journeyStepId} onChange={(e) => setJourneyStepId(e.target.value)} disabled={!journeyId}>
                <option value="">No step</option>
                {availableSteps.map((step) => <option key={step.id} value={step.id}>{step.title}</option>)}
              </SelectInput>
            </FormField>
          </div>

          <FormField label="Description">
            <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you observe?" />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Severity">
              <SelectInput value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="P0">P0 - Critical</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Medium</option>
                <option value="P3">P3 - Low</option>
              </SelectInput>
            </FormField>

            <FormField label="Status">
              <SelectInput value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Open</option>
                <option>In Progress</option>
                <option>In Review</option>
                <option>Resolved</option>
              </SelectInput>
            </FormField>
          </div>

          <FormField label="Category" description="Optional">
            <TextInput value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Forms, Navigation, Accessibility..." />
          </FormField>

          <RecommendationPicker recommendations={recommendations} onApply={applyRecommendation} />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Impact" description="Optional">
              <SelectInput value={impact} onChange={(e) => setImpact(e.target.value)}>
                <option value="">Select impact</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </SelectInput>
            </FormField>

            <FormField label="Effort" description="Optional">
              <SelectInput value={effort} onChange={(e) => setEffort(e.target.value)}>
                <option value="">Select effort</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </SelectInput>
            </FormField>
          </div>

          <FormField label="Recommendation">
            <TextArea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="Recommended change and expected outcome." />
          </FormField>

          <EvidenceUploader images={images} setImages={setImages} />

          <div className="flex gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/projects/${projectId}`}>Cancel</Link>
            </Button>
            <Button disabled={isSaving} className="flex-1">{isSaving ? "Saving..." : "Add Finding"}</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
