"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { TextInput } from "@/components/ui/text-input";

type PortalFindingComment = {
  id: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

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

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();

    const cleanBody = body.trim();
    if (!cleanBody) {
      toast.error("Add a comment before sending.");
      return;
    }

    setSaving(true);

    const response = await fetch(`/api/portal/${token}/findings/${findingId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName: authorName.trim(), body: cleanBody }),
    });

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

  return (
    <div className="mt-5 space-y-5">
      <form onSubmit={submitComment} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <TextInput
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Your name"
            maxLength={80}
          />
          <TextArea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add a comment for the consultant..."
            required
            maxLength={2000}
          />
        </div>

        <div className="mt-3 flex justify-end">
          <Button type="submit" disabled={saving}>
            <Send className="h-4 w-4" />
            {saving ? "Sending..." : "Add comment"}
          </Button>
        </div>
      </form>

      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <MessageSquare className="mx-auto h-7 w-7 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-700">No comments yet</p>
          <p className="mt-1 text-sm text-slate-500">Comments you add here are visible to the consultant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">
                  {comment.author_name || "Client"}
                </p>
                <p className="text-xs text-slate-500">{formatDate(comment.created_at)}</p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{comment.body}</p>
            </div>
          ))}
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
