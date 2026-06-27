"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  EvidenceUploader,
  type EvidenceUpload,
} from "@/components/evidence-uploader";
import { createSafeStoragePath } from "@/lib/storage";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { SelectInput } from "@/components/ui/select-input";
import { Button } from "@/components/ui/button";

type Journey = {
  id: string;
  name: string;
};

type JourneyStep = {
  id: string;
  journey_id: string;
  title: string;
};

export default function NewFindingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const projectId = params.id as string;
  const preselectedJourneyId = searchParams.get("journeyId") ?? "";
  const preselectedStepId = searchParams.get("stepId") ?? "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("P2");
  const [status, setStatus] = useState("Open");
  const [recommendation, setRecommendation] = useState("");
  const [impact, setImpact] = useState("");
  const [effort, setEffort] = useState("");
  const [journeyId, setJourneyId] = useState(preselectedJourneyId);
  const [journeyStepId, setJourneyStepId] = useState(preselectedStepId);
  const [isSaving, setIsSaving] = useState(false);

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [steps, setSteps] = useState<JourneyStep[]>([]);

  const [images, setImages] = useState<EvidenceUpload[]>([
    { file: null, caption: "" },
  ]);

  const availableSteps = useMemo(() => {
    return steps.filter((step) => step.journey_id === journeyId);
  }, [steps, journeyId]);

  useEffect(() => {
    async function loadJourneys() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: journeyData } = await supabase
        .from("journeys")
        .select("id, name")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      const { data: stepData } = await supabase
        .from("journey_steps")
        .select("id, journey_id, title")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      setJourneys((journeyData ?? []) as Journey[]);
      setSteps((stepData ?? []) as JourneyStep[]);
    }

    loadJourneys();
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

    const { count: findingCount } = await supabase
      .from("findings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentPlan = subscription?.plan || "Free";

    if (currentPlan === "Free" && (findingCount ?? 0) >= 25) {
      router.push("/settings/billing?limit=findings");
      return;
    }

    const { data: finding, error } = await supabase
      .from("findings")
      .insert({
        project_id: projectId,
        user_id: user.id,
        journey_id: journeyId || null,
        journey_step_id: journeyStepId || null,
        title,
        description,
        severity,
        status,
        recommendation,
        impact,
        effort,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    for (const imageItem of images) {
      if (!imageItem.file) continue;

      const filePath = createSafeStoragePath(finding.id, imageItem.file);

      const { error: uploadError } = await supabase.storage
        .from("finding-images")
        .upload(filePath, imageItem.file);

      if (uploadError) {
        toast.error(uploadError.message);
        setIsSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("finding-images")
        .getPublicUrl(filePath);

      const { error: imageInsertError } = await supabase
        .from("finding_images")
        .insert({
          finding_id: finding.id,
          user_id: user.id,
          image_url: publicUrlData.publicUrl,
          caption: imageItem.caption,
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

  return (
    <PageShell>
      <PageHeader
        title="Add Finding"
        description="Document an issue, connect it to a journey, and add evidence."
      />

      <Card className="mx-auto mt-8 max-w-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Finding title">
            <TextInput
              placeholder="e.g. Primary CTA is difficult to notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Journey" description="Optional">
              <SelectInput
                value={journeyId}
                onChange={(e) => {
                  setJourneyId(e.target.value);
                  setJourneyStepId("");
                }}
              >
                <option value="">No journey</option>
                {journeys.map((journey) => (
                  <option key={journey.id} value={journey.id}>
                    {journey.name}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Journey step" description="Optional">
              <SelectInput
                value={journeyStepId}
                onChange={(e) => setJourneyStepId(e.target.value)}
                disabled={!journeyId}
              >
                <option value="">No step</option>
                {availableSteps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.title}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          </div>

          <FormField label="Description">
            <TextArea
              placeholder="Describe the issue and where it appears."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Severity">
              <SelectInput
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="P0">P0 - Critical</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Medium</option>
                <option value="P3">P3 - Low</option>
              </SelectInput>
            </FormField>

            <FormField label="Status">
              <SelectInput
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>In Review</option>
                <option>Resolved</option>
              </SelectInput>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Impact" description="Optional">
              <SelectInput
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
              >
                <option value="">Select impact</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </SelectInput>
            </FormField>

            <FormField label="Effort" description="Optional">
              <SelectInput
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
              >
                <option value="">Select effort</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </SelectInput>
            </FormField>
          </div>

          <FormField label="Recommendation">
            <TextArea
              placeholder="Explain what should change and why."
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
            />
          </FormField>

          <EvidenceUploader images={images} setImages={setImages} />

          <div className="flex gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/projects/${projectId}`}>Cancel</Link>
            </Button>

            <Button disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Finding"}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}