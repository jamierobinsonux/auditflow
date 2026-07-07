"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";

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
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">
                  {comment.author_name || (comment.author_type === "auditor" ? "Auditor" : "Client")}
                  {comment.author_type === "auditor" && (
                    <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">Auditor reply</span>
                  )}
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
