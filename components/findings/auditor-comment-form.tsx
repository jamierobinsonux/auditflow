"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [editedCommentIds, setEditedCommentIds] = useState<Set<string>>(new Set());

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
    setEditingCommentId(comment.id);
    setEditingBody(comment.body);
  }

  function cancelEditing() {
    setEditingCommentId(null);
    setEditingBody("");
  }

  async function saveEditedComment(commentId: string) {
    const cleanBody = editingBody.trim();

    if (!cleanBody) {
      toast.error("Comment is required.");
      return;
    }

    setSavingEditId(commentId);

    const response = await fetch(`/api/findings/${findingId}/comments`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, body: cleanBody }),
    });

    const payload = await response.json().catch(() => null);
    setSavingEditId(null);

    if (!response.ok) {
      toast.error(payload?.error || "Unable to update reply.");
      return;
    }

    setComments((current) =>
      current.map((comment) => (comment.id === commentId ? payload.comment : comment))
    );
    setEditedCommentIds((current) => new Set(current).add(commentId));
    cancelEditing();
    toast.success("Reply updated.");
  }

  async function deleteComment(commentId: string) {
    const response = await fetch(`/api/findings/${findingId}/comments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(payload?.error || "Unable to delete reply.");
      throw new Error(payload?.error || "Unable to delete reply.");
    }

    setComments((current) => current.filter((comment) => comment.id !== commentId));
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
            const isAuditorReply = comment.author_type === "auditor";
            const isEditing = editingCommentId === comment.id;

            return (
              <div key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {comment.author_name || (isAuditorReply ? "Auditor" : "Client")}
                      {isAuditorReply && (
                        <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">Auditor reply</span>
                      )}
                      {editedCommentIds.has(comment.id) && (
                        <span className="ml-2 text-xs font-medium text-slate-400">Edited</span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(comment.created_at)}</p>
                  </div>

                  {isAuditorReply && !isEditing ? (
                    <div className="flex items-center gap-4 text-sm font-semibold">
                      <button
                        type="button"
                        onClick={() => startEditing(comment)}
                        className="text-violet-600 hover:text-violet-700"
                      >
                        Edit
                      </button>
                      <ConfirmDialog
                        title="Delete reply?"
                        description="This reply will be removed from the client portal. This action cannot be undone."
                        confirmLabel="Delete reply"
                        destructive
                        onConfirm={() => deleteComment(comment.id)}
                        trigger={
                          <button type="button" className="text-red-600 hover:text-red-700">
                            Delete
                          </button>
                        }
                      />
                    </div>
                  ) : null}
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-3">
                    <TextArea
                      value={editingBody}
                      onChange={(event) => setEditingBody(event.target.value)}
                      maxLength={MAX_COMMENT_LENGTH}
                      className="min-h-[100px] bg-white"
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">{editingBody.length}/{MAX_COMMENT_LENGTH} characters</p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button type="button" variant="outline" onClick={cancelEditing} disabled={savingEditId === comment.id}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={() => saveEditedComment(comment.id)}
                          disabled={savingEditId === comment.id || !editingBody.trim()}
                        >
                          {savingEditId === comment.id ? "Saving..." : "Save reply"}
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
