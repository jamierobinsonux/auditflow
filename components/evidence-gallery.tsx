"use client";

import { useState } from "react";

type EvidenceImage = {
  id: string;
  image_url: string;
  caption: string | null;
};

export function EvidenceGallery({ images }: { images: EvidenceImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return <p className="mt-3 text-sm text-slate-500">No evidence images added.</p>;
  }

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  return (
    <>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="overflow-hidden rounded-xl border border-slate-200 text-left hover:bg-slate-50"
          >
            <img src={image.image_url} alt="" className="w-full" />

            {image.caption && (
              <div className="p-3 text-sm text-slate-600">{image.caption}</div>
            )}
          </button>
        ))}
      </div>

      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
          <div className="max-h-full max-w-5xl rounded-2xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">
                Image {activeIndex! + 1} of {images.length}
              </p>

              <button
                onClick={() => setActiveIndex(null)}
                className="rounded-lg border px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <img
              src={activeImage.image_url}
              alt=""
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />

            {activeImage.caption && (
              <p className="mt-3 text-sm text-slate-600">
                {activeImage.caption}
              </p>
            )}

            <div className="mt-4 flex justify-between">
              <button
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((i) => Math.max((i ?? 0) - 1, 0))}
                className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={activeIndex === images.length - 1}
                onClick={() =>
                  setActiveIndex((i) => Math.min((i ?? 0) + 1, images.length - 1))
                }
                className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}