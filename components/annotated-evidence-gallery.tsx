"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AnnotationEditor } from "@/components/annotation-editor";

type Image = {
  id: string;
  image_url: string;
  evidence_name: string | null;
  caption: string | null;
};

type Annotation = {
  id: string;
  image_id: string;
  x_position: number;
  y_position: number;
  label: string;
  note: string | null;
};

export function AnnotatedEvidenceGallery({
  images,
  annotations,
  findingId,
}: {
  images: Image[];
  annotations: Annotation[];
  findingId: string;
}) {
  const [openImageId, setOpenImageId] = useState<string | null>(
    images[0]?.id ?? null
  );

  if (images.length === 0) {
    return <p className="mt-3 text-sm text-slate-500">No evidence images added.</p>;
  }

  return (
    <div className="mt-4 space-y-3">
      {images.map((image, index) => {
        const imageAnnotations = annotations.filter(
          (annotation) => annotation.image_id === image.id
        );

        const isOpen = openImageId === image.id;

        return (
          <div
            key={image.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <button
              type="button"
              onClick={() => setOpenImageId(isOpen ? null : image.id)}
              className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left hover:bg-slate-100"
            >
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {image.evidence_name || image.caption || `Evidence image ${index + 1}`}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {imageAnnotations.length} annotation
                  {imageAnnotations.length === 1 ? "" : "s"}
                </p>
              </div>

              {isOpen ? (
                <ChevronDown size={18} className="text-slate-500" />
              ) : (
                <ChevronRight size={18} className="text-slate-500" />
              )}
            </button>

            {isOpen && (
              <div className="p-5">
                <AnnotationEditor
                  image={image}
                  findingId={findingId}
                  annotations={imageAnnotations}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}