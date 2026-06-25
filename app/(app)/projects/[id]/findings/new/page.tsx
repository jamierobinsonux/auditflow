"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type EvidenceImage = {
  file: File | null;
  caption: string;
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

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [steps, setSteps] = useState<JourneyStep[]>([]);

  const [images, setImages] = useState<EvidenceImage[]>([
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

  function updateImage(index: number, update: Partial<EvidenceImage>) {
    setImages((current) =>
      current.map((item, i) => (i === index ? { ...item, ...update } : item))
    );
  }

  function addImageField() {
    setImages((current) => [...current, { file: null, caption: "" }]);
  }

  function removeImageField(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
      alert(error.message);
      return;
    }

    for (const imageItem of images) {
      if (!imageItem.file) continue;

      const filePath = `${finding.id}/${Date.now()}-${imageItem.file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("finding-images")
        .upload(filePath, imageItem.file);

      if (uploadError) {
        alert(uploadError.message);
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
        alert(imageInsertError.message);
        return;
      }
    }

    await supabase
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", projectId);

    router.push(`/projects/${projectId}/findings/${finding.id}`);
    router.refresh();
  }

  return (
    <main className="p-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-[24px] font-semibold text-slate-950">
          Add Finding
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <input
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Finding title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
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
            </select>

            <select
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
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
            </select>
          </div>

          <textarea
            className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Describe the issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="P0">P0 - Critical</option>
              <option value="P1">P1 - High</option>
              <option value="P2">P2 - Medium</option>
              <option value="P3">P3 - Low</option>
            </select>

            <select
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Open</option>
              <option>In Progress</option>
              <option>In Review</option>
              <option>Resolved</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
            >
              <option value="">Impact</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              value={effort}
              onChange={(e) => setEffort(e.target.value)}
            >
              <option value="">Effort</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <textarea
            className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Recommendation"
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
          />

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">
              Evidence images
            </p>

            {images.map((imageItem, index) => (
              <div key={index} className="space-y-3 rounded-xl bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">
                    Image {index + 1}
                  </p>

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="text-sm font-medium text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={(e) =>
                    updateImage(index, {
                      file: e.target.files?.[0] ?? null,
                    })
                  }
                />

                <textarea
                  className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
                  placeholder="Image caption"
                  value={imageItem.caption}
                  onChange={(e) =>
                    updateImage(index, { caption: e.target.value })
                  }
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addImageField}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium"
            >
              + Add another image
            </button>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/projects/${projectId}`}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
              Save Finding
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}