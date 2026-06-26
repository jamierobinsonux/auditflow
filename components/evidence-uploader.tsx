"use client";

import { useState } from "react";

export type EvidenceUpload = {
  file: File | null;
  caption: string;
};

export function EvidenceUploader({
  images,
  setImages,
}: {
  images: EvidenceUpload[];
  setImages: React.Dispatch<React.SetStateAction<EvidenceUpload[]>>;
}) {
  function updateImage(index: number, update: Partial<EvidenceUpload>) {
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

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-700">Evidence images</p>

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

          {imageItem.file && (
            <p className="text-xs text-slate-500">{imageItem.file.name}</p>
          )}

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
  );
}