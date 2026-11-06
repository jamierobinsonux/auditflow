"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

export function ShareReportButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [shareUrl, setShareUrl] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Couldn't copy automatically. Select the link and copy it.");
    }
  }

  async function handleClick() {
    if (shareUrl) {
      await copyLink(shareUrl);
      return;
    }

    setIsWorking(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Reuse the project's active link instead of creating a new one per click.
      const { data: existing } = await supabase
        .from("public_reports")
        .select("share_token")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .is("disabled_at", null)
        .limit(1)
        .maybeSingle();

      let token: string | undefined = existing?.share_token;

      if (!token) {
        const { data, error } = await supabase
          .from("public_reports")
          .insert({
            project_id: projectId,
            user_id: user.id,
            share_token: crypto.randomUUID(),
          })
          .select("share_token")
          .single();

        if (error || !data) {
          toast.error("Couldn't create the share link. Try again.", {
            description: error?.message,
          });
          return;
        }

        token = data.share_token;
      }

      const url = `${window.location.origin}/report/public/${token}`;
      setShareUrl(url);
      await copyLink(url);
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button type="button" variant="outline" onClick={handleClick} disabled={isWorking}>
        {isWorking ? "Preparing link..." : shareUrl ? "Copy link" : "Share report"}
      </Button>

      {shareUrl && (
        <TextInput
          readOnly
          aria-label="Public report link"
          value={shareUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="sm:w-80"
        />
      )}
    </div>
  );
}
