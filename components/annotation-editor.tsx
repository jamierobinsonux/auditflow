"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Annotation = {
  id: string;
  image_id: string;
  x_position: number;
  y_position: number;
  label: string;
  note: string | null;
};

export function AnnotationEditor({
  image,
  annotations,
  findingId,
}: {
  image: {
    id: string;
    image_url: string;
    caption: string | null;
  };
  annotations: Annotation[];
  findingId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [draftPoint, setDraftPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [note, setNote] = useState("");

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDraftPoint({ x, y });
    setActiveId(null);
    setEditingId(null);
  }

  async function saveAnnotation() {
    if (!draftPoint) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You need to be signed in.");
      return;
    }

    const nextLabel = String(annotations.length + 1);

    const { error } = await supabase.from("image_annotations").insert({
      image_id: image.id,
      finding_id: findingId,
      user_id: user.id,
      x_position: draftPoint.x,
      y_position: draftPoint.y,
      label: nextLabel,
      note,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Annotation added.");
    setDraftPoint(null);
    setNote("");
    router.refresh();
  }

  function startEditing(annotation: Annotation) {
    setEditingId(annotation.id);
    setActiveId(annotation.id);
    setDraftPoint(null);
    setEditNote(annotation.note ?? "");
  }

  async function saveEdit(annotationId: string) {
    const { error } = await supabase
      .from("image_annotations")
      .update({ note: editNote })
      .eq("id", annotationId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Annotation updated.");
    setEditingId(null);
    setEditNote("");
    router.refresh();
  }

  async function deleteAnnotation(annotationId: string) {
    const { error } = await supabase
      .from("image_annotations")
      .delete()
      .eq("id", annotationId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Annotation deleted.");

    if (activeId === annotationId) setActiveId(null);
    if (editingId === annotationId) setEditingId(null);

    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex justify-center rounded-2xl bg-slate-50 p-4">
            <div
              onClick={handleImageClick}
              className="relative cursor-crosshair overflow-hidden rounded-xl border border-slate-200 bg-white"
              style={{ maxWidth: 720, width: "100%" }}
            >
              <img
                src={image.image_url}
                alt=""
                className="mx-auto block max-h-[620px] w-auto max-w-full object-contain"
              />

              {annotations.map((annotation) => {
                const isActive = activeId === annotation.id;

                return (
                  <button
                    key={annotation.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveId(annotation.id);
                      setDraftPoint(null);
                      setEditingId(null);
                    }}
                    className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold text-white shadow transition ${
                      isActive
                        ? "scale-110 bg-violet-700 ring-4 ring-violet-200"
                        : "bg-violet-600 hover:scale-105"
                    }`}
                    style={{
                      left: `${annotation.x_position}%`,
                      top: `${annotation.y_position}%`,
                    }}
                  >
                    {annotation.label}
                  </button>
                );
              })}

              {draftPoint && (
                <div
                  className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow ring-4 ring-red-100"
                  style={{
                    left: `${draftPoint.x}%`,
                    top: `${draftPoint.y}%`,
                  }}
                >
                  +
                </div>
              )}
            </div>
          </div>

          {image.caption && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {image.caption}
            </p>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-950">Annotations</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Click the screenshot to add a note, or select a marker to review it.
          </p>

          {draftPoint && (
            <div className="mt-4 rounded-xl border border-violet-200 bg-white p-4">
              <p className="text-sm font-semibold text-violet-700">
                New annotation
              </p>

              <textarea
                className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                placeholder="What should the client notice here?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftPoint(null);
                    setNote("");
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveAnnotation}
                  className="flex-1 rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {annotations.length === 0 && !draftPoint && (
              <p className="rounded-xl bg-white p-4 text-sm leading-6 text-slate-500">
                No annotations yet. Click the image to add the first callout.
              </p>
            )}

            {annotations.map((annotation) => {
              const isActive = activeId === annotation.id;
              const isEditing = editingId === annotation.id;

              return (
                <div
                  key={annotation.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveId(annotation.id);
                    setDraftPoint(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveId(annotation.id);
                      setDraftPoint(null);
                    }
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    isActive
                      ? "border-violet-300 bg-violet-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                      {annotation.label}
                    </div>

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div>
                          <textarea
                            className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                            value={editNote}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setEditNote(e.target.value)}
                          />

                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveEdit(annotation.id);
                              }}
                              className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                                setEditNote("");
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm leading-6 text-slate-700">
                            {annotation.note || "No note added."}
                          </p>

                          <div className="mt-2 flex gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(annotation);
                              }}
                              className="text-xs font-medium text-violet-600"
                            >
                              Edit
                            </button>

                            <ConfirmDialog
                              title="Delete annotation?"
                              description="This will permanently delete this annotation. This action cannot be undone."
                              confirmLabel="Delete"
                              destructive
                              onConfirm={() => deleteAnnotation(annotation.id)}
                              trigger={
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs font-medium text-red-600"
                                >
                                  Delete
                                </button>
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}