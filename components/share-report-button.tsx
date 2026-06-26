"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ShareReportButton({ projectId }: { projectId: string }) {
  const supabase = createClient();
  const [shareUrl, setShareUrl] = useState("");

  async function generateLink() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const token = crypto.randomUUID();

    const { data, error } = await supabase
      .from("public_reports")
      .insert({
        project_id: projectId,
        user_id: user.id,
        share_token: token,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const url = `${window.location.origin}/report/public/${data.share_token}`;
    setShareUrl(url);
    await navigator.clipboard.writeText(url);
    alert("Share link copied.");
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={generateLink}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Share Report
      </button>

      {shareUrl && (
        <span className="text-xs text-slate-500">Copied to clipboard</span>
      )}
    </div>
  );
}