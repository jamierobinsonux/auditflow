"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EvidenceImage = {
  id?: string;
  image_url?: string | null;
  url?: string | null;
  public_url?: string | null;
  evidence_name?: string | null;
  caption?: string | null;
};

type EvidenceAnnotation = {
  id?: string;
  image_id?: string | null;
  evidence_image_id?: string | null;
  label?: string | null;
  note?: string | null;
  text?: string | null;
  x_position?: number | null;
  y_position?: number | null;
};

export function ReadOnlyEvidenceGallery({
  images,
  annotations,
}: {
  images: EvidenceImage[];
  annotations: EvidenceAnnotation[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex];

  const selectedAnnotations = useMemo(() => {
    if (!selectedImage?.id) return [];

    return annotations.filter(
      (annotation) =>
        annotation.image_id === selectedImage.id ||
        annotation.evidence_image_id === selectedImage.id
    );
  }, [annotations, selectedImage?.id]);

  if (!selectedImage) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
        <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700">
          No evidence shared yet
        </p>
      </div>
    );
  }

  const imageUrl =
    selectedImage.image_url || selectedImage.url || selectedImage.public_url || "";
  const imageTitle =
    selectedImage.evidence_name ||
    selectedImage.caption ||
    `Evidence ${selectedIndex + 1}`;

  function goToPrevious() {
    setSelectedIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }

  function goToNext() {
    setSelectedIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <p className="line-clamp-1 text-sm font-semibold text-slate-950">
            {imageTitle}
          </p>

          {selectedImage.caption && selectedImage.evidence_name && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
              {selectedImage.caption}
            </p>
          )}
        </div>

        <div className="p-5">
          <div className="relative flex max-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:max-h-[460px] lg:max-h-[550px]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="h-full max-h-[320px] w-full object-contain sm:max-h-[460px] lg:max-h-[550px]"
              />
            ) : (
              <div className="flex min-h-[220px] items-center justify-center text-sm font-medium text-slate-500">
                Image unavailable
              </div>
            )}

            {selectedAnnotations.map((annotation, annotationIndex) => {
              const label = annotation.label || String(annotationIndex + 1);

              return (
                <span
                  key={annotation.id || `${selectedImage.id}-${annotationIndex}`}
                  className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-xs font-bold text-white shadow-md"
                  style={{
                    left: `${annotation.x_position ?? 0}%`,
                    top: `${annotation.y_position ?? 0}%`,
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>

          {images.length > 1 ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                {selectedIndex + 1} of {images.length}
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-3">
            {images.map((image, index) => {
              const thumbnailUrl = image.image_url || image.url || image.public_url || "";
              const active = index === selectedIndex;

              return (
                <button
                  key={image.id || index}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`w-28 shrink-0 overflow-hidden rounded-xl border bg-white text-left transition ${
                    active
                      ? "border-violet-500 ring-4 ring-violet-100"
                      : "border-slate-200 hover:border-violet-200"
                  }`}
                >
                  <div className="flex h-16 items-center justify-center bg-slate-100">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <p className="line-clamp-1 px-2 py-2 text-xs font-semibold text-slate-700">
                    {image.evidence_name || image.caption || `Evidence ${index + 1}`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {selectedAnnotations.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Annotation notes
          </p>

          <div className="mt-3 space-y-2">
            {selectedAnnotations.map((annotation, annotationIndex) => {
              const label = annotation.label || String(annotationIndex + 1);
              const note = annotation.note || annotation.text;

              if (!note) return null;

              return (
                <p
                  key={annotation.id || `note-${annotationIndex}`}
                  className="text-sm leading-6 text-slate-600"
                >
                  <span className="font-semibold text-slate-950">
                    {label}.
                  </span>{" "}
                  {note}
                </p>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
