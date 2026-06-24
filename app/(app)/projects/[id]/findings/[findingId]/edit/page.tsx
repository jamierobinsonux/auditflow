"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ExistingImage = {
  id: string;
  image_url: string;
  caption: string | null;
};

type NewImage = {
  file: File | null;
  caption: string;
};

export default function EditFindingPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = params.id as string;
  const findingId = params.findingId as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("P2");
  const [status, setStatus] = useState("Open");
  const [recommendation, setRecommendation] = useState("");
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([
    { file: null, caption: "" },
  ]);

  useEffect(() => {
    async function loadData() {
      const { data: finding, error: findingError } = await supabase
        .from("findings")
        .select("*")
        .eq("id", findingId)
        .single();

      if (findingError) {
        alert(findingError.message);
        return;
      }

      if (finding) {
        setTitle(finding.title ?? "");
        setDescription(finding.description ?? "");
        setSeverity(finding.severity ?? "P2");
        setStatus(finding.status ?? "Open");
        setRecommendation(finding.recommendation ?? "");
      }

      const { data: images, error: imageError } = await supabase
        .from("finding_images")
        .select("*")
        .eq("finding_id", findingId)
        .order("created_at", { ascending: true });

      if (imageError) {
        alert(imageError.message);
        return;
      }

      setExistingImages((images ?? []) as ExistingImage[]);
    }

    loadData();
  }, [findingId]);

  function updateExistingCaption(id: string, caption: string) {
    setExistingImages((current) =>
      current.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  }

  function updateNewImage(index: number, update: Partial<NewImage>) {
    setNewImages((current) =>
      current.map((img, i) => (i === index ? { ...img, ...update } : img))
    );
  }

  function addNewImageField() {
    setNewImages((current) => [...current, { file: null, caption: "" }]);
  }

  function removeNewImageField(index: number) {
    setNewImages((current) => current.filter((_, i) => i !== index));
  }

  async function deleteExistingImage(imageId: string) {
    const { error } = await supabase
      .from("finding_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      alert(error.message);
      return;
    }

    setExistingImages((current) => current.filter((img) => img.id !== imageId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from("findings")
      .update({
        title,
        description,
        severity,
        status,
        recommendation,
      })
      .eq("id", findingId);

    if (error) {
      alert(error.message);
      return;
    }

    for (const image of existingImages) {
      const { error: captionError } = await supabase
        .from("finding_images")
        .update({ caption: image.caption })
        .eq("id", image.id);

      if (captionError) {
        alert(captionError.message);
        return;
      }
    }

    for (const image of newImages) {
      if (!image.file) continue;

      const filePath = `${findingId}/${Date.now()}-${image.file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("finding-images")
        .upload(filePath, image.file);

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
          finding_id: findingId,
          image_url: publicUrlData.publicUrl,
          caption: image.caption,
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

    router.push(`/projects/${projectId}/findings/${findingId}`);
    router.refresh();
  }

  return (
    <main className="p-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-[24px] font-semibold text-slate-950">
          Edit Finding
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update the finding details and supporting evidence.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <input
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Finding title"
            required
          />

          <textarea
            className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
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
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            placeholder="Recommendation"
          />

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">
              Existing images
            </p>

            {existingImages.length === 0 && (
              <p className="text-sm text-slate-500">
                No evidence images added yet.
              </p>
            )}

            {existingImages.map((image) => (
              <div key={image.id} className="space-y-3 rounded-xl bg-white p-4">
                <img
                  src={image.image_url}
                  alt=""
                  className="rounded-lg border border-slate-200"
                />

                <textarea
                  className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
                  placeholder="Image caption"
                  value={image.caption ?? ""}
                  onChange={(e) =>
                    updateExistingCaption(image.id, e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() => deleteExistingImage(image.id)}
                  className="text-sm font-medium text-red-600"
                >
                  Delete image
                </button>
              </div>
            ))}

            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm font-semibold text-slate-700">
                Add more images
              </p>

              <div className="mt-3 space-y-3">
                {newImages.map((image, index) => (
                  <div
                    key={index}
                    className="space-y-3 rounded-xl bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        New image {index + 1}
                      </p>

                      {newImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeNewImageField(index)}
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
                        updateNewImage(index, {
                          file: e.target.files?.[0] ?? null,
                        })
                      }
                    />

                    <textarea
                      className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
                      placeholder="Image caption"
                      value={image.caption}
                      onChange={(e) =>
                        updateNewImage(index, { caption: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addNewImageField}
                className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium"
              >
                + Add another image
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/projects/${projectId}/findings/${findingId}`}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}