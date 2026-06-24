"use client";

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
      const { data: finding } = await supabase
        .from("findings")
        .select("*")
        .eq("id", findingId)
        .single();

      if (finding) {
        setTitle(finding.title ?? "");
        setDescription(finding.description ?? "");
        setSeverity(finding.severity ?? "P2");
        setStatus(finding.status ?? "Open");
        setRecommendation(finding.recommendation ?? "");
      }

      const { data: images } = await supabase
        .from("finding_images")
        .select("*")
        .eq("finding_id", findingId)
        .order("created_at", { ascending: true });

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
      await supabase
        .from("finding_images")
        .update({ caption: image.caption })
        .eq("id", image.id);
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

      await supabase.from("finding_images").insert({
        finding_id: findingId,
        image_url: publicUrlData.publicUrl,
        caption: image.caption,
      });
    }

    await supabase
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", projectId);

    router.push(`/projects/${projectId}/findings/${findingId}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F1F5F9] p-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-[24px] font-semibold text-slate-950">
          Edit Finding
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <input className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <textarea className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />

          <select className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="P0">P0 - Critical</option>
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Medium</option>
            <option value="P3">P3 - Low</option>
          </select>

          <select className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Open</option>
            <option>In Progress</option>
            <option>In Review</option>
            <option>Resolved</option>
          </select>

          <textarea className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
            <p className="text-sm font-semibold">Existing images</p>

            {existingImages.map((image) => (
              <div key={image.id} className="rounded-xl bg-white p-4 space-y-3">
                <img src={image.image_url} alt="" className="rounded-lg border" />

                <textarea
                  className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
                  value={image.caption ?? ""}
                  onChange={(e) => updateExistingCaption(image.id, e.target.value)}
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

            <p className="text-sm font-semibold">Add more images</p>

            {newImages.map((image, index) => (
              <div key={index} className="rounded-xl bg-white p-4 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updateNewImage(index, { file: e.target.files?.[0] ?? null })
                  }
                />

                <textarea
                  className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
                  placeholder="Image caption"
                  value={image.caption}
                  onChange={(e) => updateNewImage(index, { caption: e.target.value })}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addNewImageField}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium"
            >
              + Add another image
            </button>
          </div>

          <button className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}