"use client";

import { useState } from "react";
import { MessageSquare, Pencil, Send, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { TextInput } from "@/components/ui/text-input";

type PortalFindingComment = {
  id: string;
  author_name: string | null;
  body: string;
  created_at: string;
  author_type?: string | null;
};

const MAX_COMMENT_LENGTH = 2000;

export function PortalFindingComments({
  token,
  findingId,
  initialComments,
}: {
  token: string;
  findingId: string;
  initialComments: PortalFindingComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();

    const cleanBody = body.trim();
    if (!cleanBody) {
      toast.error("Add a comment before sending.");
      return;
    }

    setSaving(true);

    const response = await fetch(
      `/api/portal/${token}/findings/${findingId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim(),
          body: cleanBody,
        }),
      }
    );

    const payload = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      toast.error(payload?.error || "Unable to add comment.");
      return;
    }

    setComments((current) => [payload.comment, ...current]);
    setBody("");
    toast.success("Comment added.");
  }

  function startEditing(comment: PortalFindingComment) {
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
      toast.error("Comment cannot be empty.");
      return;
    }

    setBusyCommentId(commentId);

    const response = await fetch(
      `/api/portal/${token}/findings/${findingId}/comments`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, body: cleanBody }),
      }
    );

    const payload = await response.json().catch(() => null);
    setBusyCommentId(null);

    if (!response.ok) {
      toast.error(payload?.error || "Unable to update comment.");
      return;
    }

    setComments((current) =>
      current.map((comment) =>
        comment.id === commentId ? { ...comment, ...payload.comment } : comment
      )
    );
    cancelEditing();
    toast.success("Comment updated.");
  }

  async function deleteComment(commentId: string) {
    setBusyCommentId(commentId);

    const response = await fetch(
      `/api/portal/${token}/findings/${findingId}/comments`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      }
    );

    const payload = await response.json().catch(() => null);
    setBusyCommentId(null);

    if (!response.ok) {
      toast.error(payload?.error || "Unable to delete comment.");
      return;
    }

    setComments((current) => current.filter((comment) => comment.id !== commentId));
    if (editingId === commentId) cancelEditing();
    toast.success("Comment deleted.");
  }

  return (
    <div className="mt-5 space-y-5">
      <form
        onSubmit={submitComment}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Add a comment or question
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Your comment will be shared with the consultant, but you cannot edit the finding itself.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">
              Name <span className="font-normal text-slate-400">optional</span>
            </span>
            <TextInput
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              placeholder="Your name"
              maxLength={80}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">
              Comment
            </span>
            <TextArea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Add feedback, ask a question, or note anything you want clarified..."
              required
              maxLength={MAX_COMMENT_LENGTH}
              className="min-h-[130px] resize-y"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {body.length}/{MAX_COMMENT_LENGTH} characters
            </p>
            <Button type="submit" disabled={saving || !body.trim()}>
              <Send className="h-4 w-4" />
              {saving ? "Sending..." : "Send comment"}
            </Button>
          </div>
        </div>
      </form>

      {comments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <MessageSquare className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-800">
            No comments yet
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
            Comments you add here will appear for the consultant in AuditFlow.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Comment thread
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {comments.length} {comments.length === 1 ? "comment" : "comments"}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {comments.map((comment) => {
              const isEditing = editingId === comment.id;
              const isBusy = busyCommentId === comment.id;
              const canManage = !comment.author_type || comment.author_type === "client";

              return (
                <article key={comment.id} className="flex gap-3 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                    <UserRound className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {comment.author_name || "Client"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>

                      {canManage && !isEditing && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(comment)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteComment(comment.id)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isBusy ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-3 space-y-3">
                        <TextArea
                          value={editingBody}
                          onChange={(event) => setEditingBody(event.target.value)}
                          maxLength={MAX_COMMENT_LENGTH}
                          className="min-h-[110px] resize-y"
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
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {comment.body}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
