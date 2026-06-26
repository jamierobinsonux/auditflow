"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createSafeStoragePath } from "@/lib/storage";

export function AddEvidenceForm({ findingId }: { findingId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [evidenceName, setEvidenceName] = useState("");
  const [caption, setCaption] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      alert("Please choose an image.");
      return;
    }

    setIsUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsUploading(false);
      return;
    }

    const filePath = createSafeStoragePath(findingId, file);

    const { error: uploadError } = await supabase.storage
      .from("finding-images")
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("finding-images")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("finding_images").insert({
      finding_id: findingId,
      user_id: user.id,
      image_url: publicUrlData.publicUrl,
      evidence_name: evidenceName || file.name,
      caption,
    });

    if (insertError) {
      alert(insertError.message);
      setIsUploading(false);
      return;
    }

    setFile(null);
    setEvidenceName("");
    setCaption("");
    setIsOpen(false);
    setIsUploading(false);
    router.refresh();
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        + Add Evidence
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
    >
      <p className="text-sm font-semibold text-slate-900">Add evidence image</p>

      <div className="mt-4 space-y-4">
        <input
          id="evidence-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <label
          htmlFor="evidence-upload"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-8 text-center transition hover:border-violet-400 hover:bg-violet-50"
        >
          {!file ? (
            <>
              <UploadCloud className="mb-3 h-10 w-10 text-violet-500" />
              <p className="text-sm font-semibold text-slate-900">
                Upload Screenshot
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click to browse your files
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="mb-3 h-10 w-10 text-green-500" />
              <p className="max-w-full truncate text-sm font-semibold text-slate-900">
                {file.name}
              </p>
              <p className="mt-2 text-xs text-violet-600">
                Click to choose another image
              </p>
            </>
          )}
        </label>

        <input
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
          placeholder="Evidence name, e.g. Landing Page Hero"
          value={evidenceName}
          onChange={(e) => setEvidenceName(e.target.value)}
        />

        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
          placeholder="Description, e.g. Primary CTA lacks enough contrast."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setFile(null);
              setEvidenceName("");
              setCaption("");
            }}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>

          <button
            disabled={isUploading}
            className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Save Evidence"}
          </button>
        </div>
      </div>
    </form>
  );
}