"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { auditFrameworks } from "@/lib/audit-frameworks";
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

type FrameworkOption = {
  id: string;
  source: "builtin" | "studio";
  name: string;
  category: string | null;
  description: string | null;
  auditType: string;
  journeys: {
    name: string;
    description: string | null;
    steps: string[];
  }[];
};

const blankFrameworkId = "blank";

export function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialFrameworkId = searchParams.get("frameworkId") ?? blankFrameworkId;
  const initialClientId = searchParams.get("clientId") ?? "";

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [studioFrameworks, setStudioFrameworks] = useState<FrameworkOption[]>([]);
  const [frameworkId, setFrameworkId] = useState(initialFrameworkId);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState(initialClientId);
  const [clientName, setClientName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [auditType, setAuditType] = useState("Onboarding");
  const [isSaving, setIsSaving] = useState(false);

  const builtInFrameworks = useMemo<FrameworkOption[]>(
    () =>
      auditFrameworks.map((framework) => ({
        id: framework.id,
        source: "builtin",
        name: framework.name,
        category: framework.category,
        description: framework.description,
        auditType: framework.auditType,
        journeys: framework.journeys.map((journey) => ({
          name: journey.name,
          description: journey.description,
          steps: journey.steps,
        })),
      })),
    []
  );

  const frameworks = [...studioFrameworks, ...builtInFrameworks];
  const selectedFramework = frameworks.find(
    (framework) => framework.id === frameworkId && frameworkId !== blankFrameworkId
  );
  const selectedClient = clients.find((client) => client.id === clientId);

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [{ data: clientData }, { data: frameworkData }] = await Promise.all([
        supabase
          .from("clients")
          .select("id,name,website_url")
          .eq("user_id", user.id)
          .eq("status", "Active")
          .order("name", { ascending: true }),
        supabase
          .from("studio_frameworks")
          .select("*, journey_stages:studio_framework_journey_stages(*)")
          .eq("user_id", user.id)
          .eq("status", "Active")
          .order("updated_at", { ascending: false }),
      ]);

      if (!isMounted) return;

      const clientOptions = (clientData ?? []) as ClientOption[];
      setClients(clientOptions);

      const studioOptions = (frameworkData ?? []).map((framework: any) => ({
        id: framework.id,
        source: "studio" as const,
        name: framework.name,
        category: framework.category,
        description: framework.description,
        auditType: framework.audit_type || "General UX",
        journeys: (Array.isArray(framework.journey_stages)
          ? framework.journey_stages
          : []
        )
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((stage: any) => ({
            name: stage.name,
            description: stage.description,
            steps: Array.isArray(stage.steps) ? stage.steps : [],
          })),
      }));

      setStudioFrameworks(studioOptions);

      const initialClient = clientOptions.find((client) => client.id === initialClientId);
      if (initialClient) {
        setClientName(initialClient.name);
        setWebsiteUrl((current) => current || initialClient.website_url || "");
      }
    }

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [initialClientId, supabase]);

  useEffect(() => {
    if (selectedFramework) {
      setAuditType(selectedFramework.auditType);
    }
  }, [selectedFramework]);

  function handleClientChange(value: string) {
    setClientId(value);
    const nextClient = clients.find((client) => client.id === value);

    if (nextClient) {
      setClientName(nextClient.name);
      setWebsiteUrl((current) => current || nextClient.website_url || "");
    } else {
      setClientName("");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        clientId: clientId || null,
        clientName: selectedClient?.name || clientName || null,
        websiteUrl: websiteUrl || null,
        auditType,
        frameworkId: selectedFramework?.id ?? null,
        frameworkSource: selectedFramework?.source ?? null,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 403 && result?.upgradeRequired) {
        router.push("/settings/billing?limit=projects");
        return;
      }

      toast.error(result?.error || "Unable to create project.");
      setIsSaving(false);
      return;
    }

    toast.success(selectedFramework ? "Project created from framework." : "Project created.");
    router.push(`/projects/${result.projectId}`);
    router.refresh();
  }

  return (
    <PageShell>
      <PageHeader
        title="New Project"
        description="Create a blank UX audit project or start from a reusable framework. Studio client workspaces are optional."
      />

      <Card className="mx-auto mt-8 max-w-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Start from">
            <SelectInput value={frameworkId} onChange={(e) => setFrameworkId(e.target.value)}>
              <option value={blankFrameworkId}>Blank project</option>
              {studioFrameworks.length > 0 && (
                <option disabled>──────── Studio frameworks ────────</option>
              )}
              {studioFrameworks.map((framework) => (
                <option key={framework.id} value={framework.id}>
                  {framework.name}
                </option>
              ))}
              <option disabled>──────── Built-in frameworks ────────</option>
              {builtInFrameworks.map((framework) => (
                <option key={framework.id} value={framework.id}>
                  {framework.name}
                </option>
              ))}
            </SelectInput>
          </FormField>

          {selectedFramework && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-sm font-semibold text-violet-700">
                Using framework: {selectedFramework.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-violet-700">
                This creates {selectedFramework.journeys.length} journey groups and their suggested steps. You can still edit everything after creation.
              </p>
            </div>
          )}

          {clients.length > 0 && (
            <FormField
              label="Client workspace"
              description="Optional. Connect this project to a Studio client workspace."
            >
              <SelectInput value={clientId} onChange={(e) => handleClientChange(e.target.value)}>
                <option value="">No client / personal project</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          )}

          <FormField label="Project name">
            <TextInput
              placeholder="e.g. SaaS onboarding audit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>

          {!selectedClient && (
            <FormField label="Client name" description="Optional">
              <TextInput
                placeholder="e.g. Acme"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </FormField>
          )}

          <FormField label="Website URL" description="Optional">
            <TextInput
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </FormField>

          <FormField label="Audit type">
            <SelectInput value={auditType} onChange={(e) => setAuditType(e.target.value)}>
              <option>Onboarding</option>
              <option>SaaS</option>
              <option>Mobile App</option>
              <option>Ecommerce</option>
              <option>Accessibility</option>
              <option>Dashboard</option>
              <option>General UX</option>
            </SelectInput>
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={clientId ? `/clients/${clientId}` : "/projects"}>Cancel</Link>
            </Button>
            <Button disabled={isSaving} className="flex-1">
              {isSaving ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
