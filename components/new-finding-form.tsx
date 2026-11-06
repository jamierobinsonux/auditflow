"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createSafeStoragePath } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { normalizeRecommendationId } from "@/lib/recommendations";
import { EvidenceUploader, type EvidenceUpload } from "@/components/evidence-uploader";
import {
  RecommendationPicker,
  type RecommendationOption,
} from "@/components/recommendation-picker";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { SelectInput } from "@/components/ui/select-input";
import { Button } from "@/components/ui/button";

type Journey = { id: string; name: string };
type JourneyStep = { id: string; journey_id: string; title: string };

type SaveIntent = "view" | "another";

const DEFAULT_SEVERITY = "P2";
const DEFAULT_STATUS = "Open";

function emptyEvidence(): EvidenceUpload[] {
  return [{ file: null, evidenceName: "", caption: "" }];
}

export function NewFindingForm({
  projectId,
  userId,
  journeys,
  steps,
  recommendations,
  frameworkCategories,
  initialJourneyId,
  initialStepId,
}: {
  projectId: string;
  userId: string;
  journeys: Journey[];
  steps: JourneyStep[];
  recommendations: RecommendationOption[];
  frameworkCategories: string[];
  initialJourneyId: string;
  initialStepId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const intentRef = useRef<SaveIntent>("view");

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(DEFAULT_SEVERITY);
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [category, setCategory] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationOption | null>(null);
  const [impact, setImpact] = useState("");
  const [effort, setEffort] = useState("");
  const [journeyId, setJourneyId] = useState(initialJourneyId);
  const [journeyStepId, setJourneyStepId] = useState(initialStepId);
  const [images, setImages] = useState<EvidenceUpload[]>(emptyEvidence);

  // Open "More details" up front when the link already points at a journey or step.
  const [detailsOpen, setDetailsOpen] = useState(
    Boolean(initialJourneyId || initialStepId)
  );
  const [savingIntent, setSavingIntent] = useState<SaveIntent | null>(null);
  // Bumped after "Add and create another" so the picker forgets its old selection.
  const [formVersion, setFormVersion] = useState(0);

  const isSaving = savingIntent !== null;

  const availableSteps = useMemo(
    () => steps.filter((step) => step.journey_id === journeyId),
    [steps, journeyId]
  );

  function applyRecommendation(item: RecommendationOption) {
    setRecommendation(item.recommendation);
    setImpact(item.impact ?? impact);
    setCategory(item.category ?? category);
    setSelectedRecommendation(item);

    // Make sure the person can see the fields the recommendation just filled in.
    if (item.impact || item.category) setDetailsOpen(true);
  }

  function resetForNextFinding() {
    // Keep the journey, step and category: consecutive findings usually share them.
    setTitle("");
    setTitleError("");
    setDescription("");
    setSeverity(DEFAULT_SEVERITY);
    setStatus(DEFAULT_STATUS);
    setRecommendation("");
    setSelectedRecommendation(null);
    setImpact("");
    setEffort("");
    setImages(emptyEvidence());
    setFormVersion((version) => version + 1);

    requestAnimationFrame(() => titleRef.current?.focus());
  }

  async function saveFinding(intent: SaveIntent) {
    if (isSaving) return;

    setTitleError("");
    setSavingIntent(intent);

    // The page stays locked while we navigate away, so it can't be submitted twice.
    let navigating = false;

    try {
      const response = await fetch("/api/findings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          title,
          description,
          severity,
          status,
          category: category || null,
          recommendation,
          recommendation_source: selectedRecommendation?.source ?? null,
          saved_recommendation_id:
            selectedRecommendation?.source === "library"
              ? normalizeRecommendationId(selectedRecommendation.id)
              : null,
          framework_recommendation_id:
            selectedRecommendation?.source === "framework"
              ? normalizeRecommendationId(selectedRecommendation.id)
              : null,
          impact,
          effort,
          journey_id: journeyId || null,
          journey_step_id: journeyStepId || null,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.finding) {
        if (response.status === 401) {
          navigating = true;
          router.push("/login");
          return;
        }

        if (response.status === 403 && result?.redirectTo) {
          navigating = true;
          router.push(result.redirectTo);
          return;
        }

        if (response.status === 409) {
          setTitleError(
            `${result?.error ?? "A finding with this title already exists."} Use a different title.`
          );
          titleRef.current?.focus();
          return;
        }

        toast.error(result?.error || "Couldn't save the finding. Try again.");
        return;
      }

      const finding = result.finding as { id: string };

      // The finding now exists. From here on, a failed image must not trap the
      // person on this form, because saving again would create a duplicate.
      const failedUploads: string[] = [];

      for (const image of images) {
        if (!image.file) continue;

        const evidenceName =
          image.evidenceName || image.file.name.replace(/\.[^/.]+$/, "");
        const filePath = createSafeStoragePath(finding.id, image.file);

        const { error: uploadError } = await supabase.storage
          .from("finding-images")
          .upload(filePath, image.file);

        if (uploadError) {
          failedUploads.push(evidenceName);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("finding-images")
          .getPublicUrl(filePath);

        const { error: imageInsertError } = await supabase
          .from("finding_images")
          .insert({
            finding_id: finding.id,
            user_id: userId,
            image_url: publicUrlData.publicUrl,
            evidence_name: evidenceName,
            caption: image.caption,
          });

        if (imageInsertError) {
          failedUploads.push(evidenceName);
          // Best-effort cleanup so the file isn't left orphaned in storage.
          await supabase.storage.from("finding-images").remove([filePath]);
        }
      }

      if (failedUploads.length > 0) {
        const count = failedUploads.length;

        toast.warning(
          `Finding saved, but ${count} image${count === 1 ? "" : "s"} didn't upload.`,
          {
            description: "Add the missing evidence from the finding page.",
          }
        );

        navigating = true;
        router.push(`/projects/${projectId}/findings/${finding.id}`);
        router.refresh();
        return;
      }

      if (intent === "another") {
        toast.success("Finding added.");
        resetForNextFinding();
        // Re-runs the server page, which re-checks the plan limit. If this was the
        // last finding on the Free plan, the person is sent to billing now instead
        // of after typing the next one.
        router.refresh();
        return;
      }

      toast.success("Finding added.");
      navigating = true;
      router.push(`/projects/${projectId}/findings/${finding.id}`);
      router.refresh();
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      if (!navigating) setSavingIntent(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const intent = intentRef.current;
    intentRef.current = "view";

    void saveFinding(intent);
  }

  return (
    <PageShell>
      <PageHeader
        title="New Finding"
        description="Document a usability issue and add supporting evidence. Journey, status and other details are optional."
      />

      <Card className="mx-auto mt-8 max-w-2xl p-8">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Finding title" error={titleError}>
            <TextInput
              ref={titleRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              placeholder="Users cannot recover after payment validation fails"
              required
              autoFocus
            />
          </FormField>

          <FormField label="Description">
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you observe?"
            />
          </FormField>

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

          <RecommendationPicker
            key={formVersion}
            recommendations={recommendations}
            onApply={applyRecommendation}
          />

          <FormField label="Recommendation">
            <TextArea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Recommended change and expected outcome."
            />
          </FormField>

          <EvidenceUploader images={images} setImages={setImages} />

          <div>
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-controls="finding-more-details"
              onClick={() => setDetailsOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition outline-none hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-violet-200"
            >
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  More details
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Journey and step, status, category, impact, effort
                </span>
              </span>

              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 shrink-0 text-slate-500 transition-transform",
                  detailsOpen && "rotate-180"
                )}
              />
            </button>

            {detailsOpen && (
              <div id="finding-more-details" className="mt-5 space-y-5">
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

                <div className="grid gap-4 md:grid-cols-2">
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

                  <FormField label="Category" description="Optional">
                    {frameworkCategories.length > 0 ? (
                      <SelectInput
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">Select category</option>
                        {frameworkCategories.map((frameworkCategory) => (
                          <option key={frameworkCategory} value={frameworkCategory}>
                            {frameworkCategory}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </SelectInput>
                    ) : (
                      <TextInput
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Forms, Navigation, Accessibility..."
                      />
                    )}
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
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button asChild variant="outline" className="sm:px-6">
              <Link href={`/projects/${projectId}`}>Cancel</Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSaving}
              onClick={() => {
                intentRef.current = "another";
                formRef.current?.requestSubmit();
              }}
            >
              {savingIntent === "another" ? "Saving..." : "Add and create another"}
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={isSaving}
              onClick={() => {
                // Also runs for Enter-key submits, and clears an "another" intent
                // left behind by a secondary click that failed validation.
                intentRef.current = "view";
              }}
            >
              {savingIntent === "view" ? "Saving..." : "Add Finding"}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
