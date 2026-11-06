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
  email,
}: {
  initialDisplayName: string;
  initialWorkspaceName: string;
  initialTimezone: string;
  initialDateFormat: string;
  email: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [workspaceName, setWorkspaceName] = useState(initialWorkspaceName);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [dateFormat, setDateFormat] = useState(initialDateFormat);
  const [isSaving, setIsSaving] = useState(false);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName.trim() || null,
        workspace_name: workspaceName.trim() || "AuditFlow Workspace",
        timezone,
        date_format: dateFormat,
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save settings"}</Button>
      </div>
    </form>
  );
}
