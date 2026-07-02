"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { SelectInput } from "@/components/ui/select-input";
import { TextArea } from "@/components/ui/text-area";
import type { Client } from "@/types/client";

type ClientFormProps = {
  client?: Client | null;
};

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = Boolean(client?.id);

  const [name, setName] = useState(client?.name ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(client?.website_url ?? "");
  const [industry, setIndustry] = useState(client?.industry ?? "");
  const [primaryContactName, setPrimaryContactName] = useState(
    client?.primary_contact_name ?? ""
  );
  const [primaryContactEmail, setPrimaryContactEmail] = useState(
    client?.primary_contact_email ?? ""
  );
  const [phone, setPhone] = useState(formatPhoneNumber(client?.phone ?? ""));
  const [brandColor, setBrandColor] = useState(client?.brand_color ?? "#7C3AED");
  const [status, setStatus] = useState(client?.status ?? "Active");
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const payload = {
      name,
      website_url: websiteUrl || null,
      industry: industry || null,
      primary_contact_name: primaryContactName || null,
      primary_contact_email: primaryContactEmail || null,
      phone: phone || null,
      brand_color: brandColor || "#7C3AED",
      status,
      notes: notes || null,
      user_id: user.id,
    };

    const query = isEditing
      ? supabase
          .from("clients")
          .update(payload)
          .eq("id", client!.id)
          .eq("user_id", user.id)
          .select("id")
          .single()
      : supabase.from("clients").insert(payload).select("id").single();

    const { data, error } = await query;

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    toast.success(isEditing ? "Client updated." : "Client created.");
    router.push(`/clients/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Company name">
          <TextInput
            placeholder="e.g. Acme Inc."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Website" description="Optional">
          <TextInput
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </FormField>

        <FormField label="Industry" description="Optional">
          <SelectInput value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">Select industry</option>
            <option>E-commerce</option>
            <option>SaaS</option>
            <option>Fintech</option>
            <option>Healthcare</option>
            <option>Education</option>
            <option>Marketplace</option>
            <option>Consumer App</option>
            <option>Other</option>
          </SelectInput>
        </FormField>

        <FormField label="Status">
  <SelectInput
    value={status}
    onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
  >
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </SelectInput>
</FormField>

        <FormField label="Primary contact" description="Optional">
          <TextInput
            placeholder="e.g. Sarah Johnson"
            value={primaryContactName}
            onChange={(e) => setPrimaryContactName(e.target.value)}
          />
        </FormField>

        <FormField label="Work email" description="Optional">
          <TextInput
            type="email"
            placeholder="name@company.com"
            value={primaryContactEmail}
            onChange={(e) => setPrimaryContactEmail(e.target.value)}
          />
        </FormField>

        <FormField label="Phone" description="Optional">
          <TextInput
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
          />
        </FormField>

        <FormField label="Brand color" description="Used for reports and portal branding.">
          <div className="flex gap-3">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="h-11 w-14 rounded-xl border border-slate-200 bg-white p-1"
              aria-label="Brand color"
            />
            <TextInput value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
          </div>
        </FormField>
      </div>

      <FormField label="Notes" description="Optional">
        <TextArea
          placeholder="Add any client context, stakeholders, or delivery notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <Button asChild variant="outline">
          <Link href={client?.id ? `/clients/${client.id}` : "/clients"}>Cancel</Link>
        </Button>

        <Button disabled={isSaving}>{isSaving ? "Saving..." : isEditing ? "Save Client" : "Create Client"}</Button>
      </div>
    </form>
  );
}


function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
