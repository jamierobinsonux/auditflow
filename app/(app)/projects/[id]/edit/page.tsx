"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type ClientOption = {
  id: string;
  name: string;
  website_url: string | null;
};

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [auditType, setAuditType] = useState("");
  const [status, setStatus] = useState("In Progress");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === clientId),
    [clients, clientId]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const [{ data: projectData, error: projectError }, { data: clientData }] =
        await Promise.all([
          supabase
            .from("projects")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("clients")
            .select("id,name,website_url")
            .eq("user_id", user.id)
            .eq("status", "Active")
            .order("name", { ascending: true }),
        ]);

      if (!isMounted) return;

      if (projectError) {
        toast.error(projectError.message);
        return;
      }

      setClients((clientData ?? []) as ClientOption[]);

      if (projectData) {
        setName(projectData.name ?? "");
        setClientId(projectData.client_id ?? "");
        setClientName(projectData.client_name ?? "");
        setWebsiteUrl(projectData.website_url ?? "");
        setAuditType(projectData.audit_type ?? "");
        setStatus(projectData.status ?? "In Progress");
      }
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id, router, supabase]);

  function handleClientChange(value: string) {
    setClientId(value);
    const nextClient = clients.find((client) => client.id === value);

    if (nextClient) {
      setClientName(nextClient.name);
      setWebsiteUrl((current) => current || nextClient.website_url || "");
    }
  }

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

    const clientSnapshotName = selectedClient?.name || clientName || null;

    const { error } = await supabase
      .from("projects")
      .update({
        name,
        client_id: clientId || null,
        client_name: clientSnapshotName,
        website_url: websiteUrl || null,
        audit_type: auditType || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

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
        description="Update audit details, status, client assignment, and project metadata."
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

          {clients.length > 0 && (
            <FormField
              label="Client workspace"
              description="Optional. Use this to assign existing projects to a Studio client workspace."
            >
              <SelectInput
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
              >
                <option value="">No client / personal project</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          )}

          {!selectedClient && (
            <FormField label="Client name" description="Optional">
              <TextInput
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
              />
            </FormField>
          )}

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
              <option>General UX</option>
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
