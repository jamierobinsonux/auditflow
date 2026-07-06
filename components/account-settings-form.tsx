"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/select-input";

export function AccountSettingsForm({
  initialDisplayName,
  initialWorkspaceName,
  initialTimezone,
  initialDateFormat,
  initialClientCommentEmails,
  initialClientReplyEmails,
  email,
  canUseClientNotifications,
}: {
  initialDisplayName: string;
  initialWorkspaceName: string;
  initialTimezone: string;
  initialDateFormat: string;
  initialClientCommentEmails: boolean;
  initialClientReplyEmails: boolean;
  email: string;
  canUseClientNotifications: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [workspaceName, setWorkspaceName] = useState(initialWorkspaceName);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [dateFormat, setDateFormat] = useState(initialDateFormat);
  const [clientCommentEmails, setClientCommentEmails] = useState(initialClientCommentEmails);
  const [clientReplyEmails, setClientReplyEmails] = useState(initialClientReplyEmails);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName.trim() || null,
        workspace_name: workspaceName.trim() || "AuditFlow Workspace",
        timezone,
        date_format: dateFormat,
        email_client_comments: canUseClientNotifications ? clientCommentEmails : false,
        email_client_replies: canUseClientNotifications ? clientReplyEmails : false,
      },
    });

    setIsSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Settings updated.");
    router.refresh();
  }

  async function sendPasswordReset() {
    if (!email) return;
    setIsSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setIsSendingReset(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password reset email sent.");
  }

  return (
    <form onSubmit={saveSettings} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-slate-950">Profile</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Display name</span>
            <Input className="mt-2 h-11 rounded-xl bg-white px-3" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <Input className="mt-2 h-11 rounded-xl bg-slate-50 px-3 text-slate-500" value={email} readOnly />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-slate-950">Workspace</h2>
        <p className="mt-1 text-sm text-slate-500">Set the defaults used across your AuditFlow workspace.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="block md:col-span-3">
            <span className="text-sm font-medium text-slate-700">Workspace name</span>
            <Input className="mt-2 h-11 rounded-xl bg-white px-3" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Timezone</span>
            <SelectInput className="mt-2" value={timezone} onChange={(event) => setTimezone(event.target.value)}>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
            </SelectInput>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Date format</span>
            <SelectInput className="mt-2" value={dateFormat} onChange={(event) => setDateFormat(event.target.value)}>
              <option value="MMM d, yyyy">Jul 6, 2026</option>
              <option value="MM/dd/yyyy">07/06/2026</option>
              <option value="yyyy-MM-dd">2026-07-06</option>
            </SelectInput>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-slate-950">Notifications</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose which client portal updates should send email notifications.
            </p>
          </div>
          {!canUseClientNotifications && (
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              Studio
            </span>
          )}
        </div>

        {canUseClientNotifications ? (
          <div className="mt-6 space-y-4">
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600" checked={clientCommentEmails} onChange={(event) => setClientCommentEmails(event.target.checked)} />
              <span>
                <span className="block text-sm font-semibold text-slate-950">Client comments</span>
                <span className="block text-sm text-slate-500">Email me when a client leaves a new comment in the portal.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600" checked={clientReplyEmails} onChange={(event) => setClientReplyEmails(event.target.checked)} />
              <span>
                <span className="block text-sm font-semibold text-slate-950">Client replies</span>
                <span className="block text-sm text-slate-500">Email me when a client replies to a comment thread.</span>
              </span>
            </label>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <p className="text-sm font-semibold text-slate-950">
              Client email notifications are available on Studio.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Studio includes client spaces, portal comments, and email notifications when clients leave comments or replies.
            </p>
            <a href="/settings/billing" className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
              Upgrade to Studio
            </a>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-slate-950">Security</h2>
        <p className="mt-1 text-sm text-slate-500">Manage password access for your AuditFlow account.</p>
        <Button type="button" variant="outline" className="mt-5" onClick={sendPasswordReset} disabled={isSendingReset}>
          {isSendingReset ? "Sending..." : "Send password reset email"}
        </Button>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save settings"}</Button>
      </div>
    </form>
  );
}
