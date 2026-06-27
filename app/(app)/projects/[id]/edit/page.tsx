"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { SelectInput } from "@/components/ui/select-input";
import { Button } from "@/components/ui/button";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [auditType, setAuditType] = useState("");
  const [status, setStatus] = useState("In Progress");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data) {
        setName(data.name ?? "");
        setClientName(data.client_name ?? "");
        setWebsiteUrl(data.website_url ?? "");
        setAuditType(data.audit_type ?? "");
        setStatus(data.status ?? "In Progress");
      }
    }

    loadProject();
  }, [id, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase
      .from("projects")
      .update({
        name,
        client_name: clientName,
        website_url: websiteUrl,
        audit_type: auditType,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    toast.success("Project updated.");
    router.push(`/projects/${id}`);
    router.refresh();
  }

  return (
    <PageShell>
      <PageHeader
        title="Edit Project"
        description="Update audit details, status, and project metadata."
      />

      <Card className="mx-auto mt-8 max-w-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Project name">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              required
            />
          </FormField>

          <FormField label="Client name" description="Optional">
            <TextInput
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client name"
            />
          </FormField>

          <FormField label="Website URL" description="Optional">
            <TextInput
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </FormField>

          <FormField label="Audit type">
            <SelectInput
              value={auditType}
              onChange={(e) => setAuditType(e.target.value)}
            >
              <option value="">Select audit type</option>
              <option>Onboarding</option>
              <option>SaaS</option>
              <option>Mobile App</option>
              <option>Ecommerce</option>
              <option>Dashboard</option>
              <option>Accessibility</option>
            </SelectInput>
          </FormField>

          <FormField label="Status">
            <SelectInput
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>In Progress</option>
              <option>In Review</option>
              <option>Completed</option>
            </SelectInput>
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/projects/${id}`}>Cancel</Link>
            </Button>

            <Button disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}