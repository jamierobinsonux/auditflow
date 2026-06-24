"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EvidenceImage = {
  file: File | null;
  caption: string;
};

export default function NewFindingPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("P2");
  const [status, setStatus] = useState("Open");
  const [recommendation, setRecommendation] = useState("");
  const [images, setImages] = useState<EvidenceImage[]>([
    { file: null, caption: "" },
  ]);

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

    const { data: finding, error } = await supabase
      .from("findings")
      .insert({
        project_id: projectId,
        title,
        description,
        severity,
        status,
        recommendation,
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

          <textarea
            className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Describe the issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

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
              href={`/projects/${projectId}/findings`}
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