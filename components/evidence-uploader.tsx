"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ImagePlus, UploadCloud, X } from "lucide-react";

export type EvidenceUpload = {
  file: File | null;
  caption: string;
};

type EvidenceUploaderProps = {
  images: EvidenceUpload[];
  setImages: React.Dispatch<React.SetStateAction<EvidenceUpload[]>>;
};

function formatFileSize(bytes: number) {
  if (!bytes) return "";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function EvidenceUploader({ images, setImages }: EvidenceUploaderProps) {
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Evidence images</p>
          <p className="mt-1 text-xs text-slate-500">
            Upload screenshots or supporting visuals for this finding.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {images.map((imageItem, index) => (
          <EvidenceUploadItem
            key={index}
            imageItem={imageItem}
            index={index}
            canRemove={images.length > 1}
            onUpdate={(update) => updateImage(index, update)}
            onRemove={() => removeImageField(index)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addImageField}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      >
        <ImagePlus className="h-4 w-4" />
        Add another image
      </button>
    </div>
  );
}

function EvidenceUploadItem({
  imageItem,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: {
  imageItem: EvidenceUpload;
  index: number;
  canRemove: boolean;
  onUpdate: (update: Partial<EvidenceUpload>) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file?: File | null) {
    if (!file) return;
    onUpdate({ file });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    handleFile(droppedFile);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">Image {index + 1}</p>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={[
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
          isDragging
            ? "border-violet-400 bg-violet-50"
            : "border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50",
        ].join(" ")}
      >
        {!imageItem.file ? (
          <>
            <UploadCloud className="mb-3 h-9 w-9 text-violet-500" />
            <p className="text-sm font-semibold text-slate-900">
              Drag and drop an image here
            </p>
            <p className="mt-1 text-xs text-slate-500">
              or click to browse PNG, JPG, JPEG, or WebP files
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mb-3 h-9 w-9 text-green-500" />
            <p className="max-w-full truncate text-sm font-semibold text-slate-900">
              {imageItem.file.name}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatFileSize(imageItem.file.size)} · Click or drop to replace
            </p>
          </>
        )}
      </div>

      <textarea
        className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
        placeholder="Image caption, e.g. Checkout screen showing unclear payment error"
        value={imageItem.caption}
        onChange={(event) => onUpdate({ caption: event.target.value })}
      />
    </div>
  );
}
