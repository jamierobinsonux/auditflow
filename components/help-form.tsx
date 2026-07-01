"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout/card";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { SelectInput } from "@/components/ui/select-input";

export function HelpForm({ userEmail }: { userEmail: string }) {
  const [category, setCategory] = useState("Bug report");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const response = await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, subject, message }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      toast.error(result.error || "Unable to send your message.");
      setSaving(false);
      return;
    }

    toast.success("Message sent. Thanks for the feedback.");
    setSubject("");
    setMessage("");
    setCategory("Bug report");
    setSaving(false);
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-950">Contact AuditFlow support</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          This sends your message to jamie@auditflowapp.co and saves it for follow-up.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Your email">
          <TextInput value={userEmail} disabled />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Category">
            <SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Bug report</option>
              <option>Billing question</option>
              <option>Feature request</option>
              <option>UX feedback</option>
              <option>Account help</option>
              <option>Other</option>
            </SelectInput>
          </FormField>

          <FormField label="Subject">
            <TextInput
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary"
              required
            />
          </FormField>
        </div>

        <FormField label="Message">
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what happened, what you expected, and any steps to reproduce the issue."
            className="min-h-40"
            required
          />
        </FormField>

        <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          For screenshots or recordings, mention that you have one in the message. You can reply to the support email with attachments after the first response.
        </div>

        <div className="flex justify-end">
          <Button disabled={saving}>{saving ? "Sending..." : "Send message"}</Button>
        </div>
      </form>
    </Card>
  );
}
