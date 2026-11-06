"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { ConfirmDialog } from "@/components/confirm-dialog";

const MAX_COMMENT_LENGTH = 2000;

type Comment = {
  id: string;
  author_name: string | null;
  body: string;
  created_at: string;
  author_type: string | null;
};

export function AuditorCommentForm({
  findingId,
  initialComments,
}: {
  findingId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    const cleanBody = body.trim();

    if (!cleanBody) {
      toast.error("Comment is required.");
      return;
    }

    setSaving(true);

    const response = await fetch(`/api/findings/${findingId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: cleanBody }),
    });

    const payload = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      toast.error(payload?.error || "Unable to add reply.");
      return;
    }

    setComments((current) => [payload.comment, ...current]);
    setBody("");
    toast.success("Reply added to the client portal.");
  }

  function startEditing(comment: Comment) {
    setEditingId(comment.id);
    setEditingBody(comment.body);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingBody("");
  }

  async function saveComment(commentId: string) {
    const cleanBody = editingBody.trim();

    if (!cleanBody) {
      toast.error("Reply cannot be empty.");
      return;
    }

    setBusyCommentId(commentId);

    const response = await fetch(`/api/findings/${findingId}/comments`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, body: cleanBody }),
    });

    const payload = await response.json().catch(() => null);
    setBusyCommentId(null);

    if (!response.ok) {
      toast.error(payload?.error || "Unable to update reply.");
      return;
    }

    setComments((current) =>
      current.map((comment) =>
        comment.id === commentId ? { ...comment, ...payload.comment } : comment
      )
    );
    cancelEditing();
    toast.success("Reply updated.");
  }

  async function deleteComment(commentId: string) {
    setBusyCommentId(commentId);

    const response = await fetch(`/api/findings/${findingId}/comments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });

    const payload = await response.json().catch(() => null);
    setBusyCommentId(null);

    if (!response.ok) {
      toast.error(payload?.error || "Unable to delete reply.");
      return;
    }

    setComments((current) => current.filter((comment) => comment.id !== commentId));
    if (editingId === commentId) cancelEditing();
    toast.success("Reply deleted.");
  }

  return (
    <div className="mt-5 space-y-5">
      <form onSubmit={submitComment} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Reply to client</span>
          <TextArea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add a response that will appear in the client portal..."
            maxLength={MAX_COMMENT_LENGTH}
            className="mt-2 min-h-[110px] bg-white"
          />
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">{body.length}/{MAX_COMMENT_LENGTH} characters</p>
          <Button type="submit" disabled={saving || !body.trim()}>
            <Send className="h-4 w-4" />
            {saving ? "Sending..." : "Send reply"}
          </Button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm leading-6 text-slate-500">No client comments have been added yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isEditing = editingId === comment.id;
            const isBusy = busyCommentId === comment.id;
            const canManage = comment.author_type === "auditor";

            return (
              <div key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950">
                      {comment.author_name || (comment.author_type === "auditor" ? "Auditor" : "Client")}
                      {comment.author_type === "auditor" && (
                        <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">Auditor reply</span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(comment.created_at)}</p>
                  </div>

                  {canManage && !isEditing && (
                    <div className="inline-flex items-center gap-2 leading-none">
                      <button
                        type="button"
                        onClick={() => startEditing(comment)}
                        className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <ConfirmDialog
                        title="Delete reply?"
                        description="This auditor reply will be permanently deleted from the client portal. This action cannot be undone."
                        confirmLabel="Delete reply"
                        destructive
                        onConfirm={() => deleteComment(comment.id)}
                        trigger={
                          <button
                            type="button"
                            disabled={isBusy}
                            className="inline-flex h-8 items-center gap-1 rounded-full border border-rose-100 bg-white px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isBusy ? "Deleting..." : "Delete"}
                          </button>
                        }
                      />
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-3">
                    <TextArea
                      value={editingBody}
                      onChange={(event) => setEditingBody(event.target.value)}
                      maxLength={MAX_COMMENT_LENGTH}
                      className="min-h-[110px] resize-y bg-white"
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        {editingBody.length}/{MAX_COMMENT_LENGTH} characters
                      </p>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={cancelEditing} disabled={isBusy}>
                          Cancel
                        </Button>
                        <Button type="button" onClick={() => saveComment(comment.id)} disabled={isBusy || !editingBody.trim()}>
                          {isBusy ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{comment.body}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
