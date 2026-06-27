"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DeleteEvidenceButton } from "@/components/delete-evidence-button";
import {
  EvidenceUploader,
  type EvidenceUpload,
} from "@/components/evidence-uploader";
import { createSafeStoragePath } from "@/lib/storage";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { SectionHeader } from "@/components/layout/section-header";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { SelectInput } from "@/components/ui/select-input";
import { Button } from "@/components/ui/button";

type ExistingImage = {
  id: string;
  image_url: string;
  caption: string | null;
};

type Journey = {
  id: string;
  name: string;
};

type JourneyStep = {
  id: string;
  journey_id: string;
  title: string;
};

export default function EditFindingPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const projectId = params.id as string;
  const findingId = params.findingId as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("P2");
  const [status, setStatus] = useState("Open");
  const [recommendation, setRecommendation] = useState("");
  const [impact, setImpact] = useState("");
  const [effort, setEffort] = useState("");
  const [journeyId, setJourneyId] = useState("");
  const [journeyStepId, setJourneyStepId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [steps, setSteps] = useState<JourneyStep[]>([]);

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [images, setImages] = useState<EvidenceUpload[]>([
    { file: null, caption: "" },
  ]);

  const availableSteps = useMemo(() => {
    return steps.filter((step) => step.journey_id === journeyId);
  }, [steps, journeyId]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: finding, error: findingError } = await supabase
        .from("findings")
        .select("*")
        .eq("id", findingId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (findingError) {
        toast.error(findingError.message);
        return;
      }

      if (!finding) {
        toast.error("Finding not found.");
        router.push(`/projects/${projectId}`);
        return;
      }

      setTitle(finding.title ?? "");
      setDescription(finding.description ?? "");
      setSeverity(finding.severity ?? "P2");
      setStatus(finding.status ?? "Open");
      setRecommendation(finding.recommendation ?? "");
      setImpact(finding.impact ?? "");
      setEffort(finding.effort ?? "");
      setJourneyId(finding.journey_id ?? "");
      setJourneyStepId(finding.journey_step_id ?? "");

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

      const { data: imageData, error: imageError } = await supabase
        .from("finding_images")
        .select("*")
        .eq("finding_id", findingId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (imageError) {
        toast.error(imageError.message);
        return;
      }

      setJourneys((journeyData ?? []) as Journey[]);
      setSteps((stepData ?? []) as JourneyStep[]);
      setExistingImages((imageData ?? []) as ExistingImage[]);
    }

    loadData();
  }, [findingId, projectId, router, supabase]);

  function updateExistingCaption(id: string, caption: string) {
    setExistingImages((current) =>
      current.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  }

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

    const { error } = await supabase
      .from("findings")
      .update({
        title,
        description,
        severity,
        status,
        recommendation,
        impact,
        effort,
        journey_id: journeyId || null,
        journey_step_id: journeyStepId || null,
      })
      .eq("id", findingId)
      .eq("user_id", user.id);

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    for (const existingImage of existingImages) {
      const { error: captionError } = await supabase
        .from("finding_images")
        .update({ caption: existingImage.caption })
        .eq("id", existingImage.id)
        .eq("user_id", user.id);

      if (captionError) {
        toast.error(captionError.message);
        setIsSaving(false);
        return;
      }
    }

    for (const image of images) {
      if (!image.file) continue;

      const filePath = createSafeStoragePath(findingId, image.file);

      const { error: uploadError } = await supabase.storage
        .from("finding-images")
        .upload(filePath, image.file);

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
          finding_id: findingId,
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

    toast.success("Finding updated.");
    router.push(`/projects/${projectId}/findings/${findingId}`);
    router.refresh();
  }

  return (
    <PageShell>
      <PageHeader
        title="Edit Finding"
        description="Update finding details, prioritization, recommendations, and evidence."
      />

      <Card className="mx-auto mt-8 max-w-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Finding title">
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Finding title"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
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
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Recommendation"
            />
          </FormField>

          <Card className="bg-slate-50 p-5">
            <SectionHeader
              title="Existing evidence"
              description="Review captions or remove evidence that no longer supports this finding."
            />

            {existingImages.length === 0 && (
              <p className="text-sm text-slate-500">
                No evidence images added yet.
              </p>
            )}

            <div className="space-y-4">
              {existingImages.map((image) => (
                <div
                  key={image.id}
                  className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <img
                    src={image.image_url}
                    alt=""
                    className="rounded-lg border border-slate-200"
                  />

                  <FormField label="Image caption">
                    <TextArea
                      className="min-h-20"
                      placeholder="Image caption"
                      value={image.caption ?? ""}
                      onChange={(e) =>
                        updateExistingCaption(image.id, e.target.value)
                      }
                    />
                  </FormField>

                  <DeleteEvidenceButton imageId={image.id} />
                </div>
              ))}
            </div>
          </Card>

          <EvidenceUploader images={images} setImages={setImages} />

          <div className="flex gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/projects/${projectId}/findings/${findingId}`}>
                Cancel
              </Link>
            </Button>

            <Button disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}