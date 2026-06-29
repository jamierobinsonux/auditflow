"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

export default function NewProjectPage() {
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
  const selectedFramework = frameworks.find((framework) => framework.id === frameworkId && frameworkId !== blankFrameworkId);
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
          .order("is_default", { ascending: false })
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
        journeys: (Array.isArray(framework.journey_stages) ? framework.journey_stages : [])
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

    const { count: projectCount } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentPlan = subscription?.plan || "Free";

    if (currentPlan === "Free" && (projectCount ?? 0) >= 3) {
      router.push("/settings/billing?limit=projects");
      return;
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name,
        client_id: clientId || null,
        framework_id: selectedFramework?.source === "studio" ? selectedFramework.id : null,
        client_name: selectedClient?.name || clientName || null,
        website_url: websiteUrl || null,
        audit_type: auditType,
        status: "In Progress",
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    if (selectedFramework) {
      for (const journey of selectedFramework.journeys) {
        const { data: createdJourney, error: journeyError } = await supabase
          .from("journeys")
          .insert({
            project_id: project.id,
            user_id: user.id,
            name: journey.name,
            description: journey.description,
          })
          .select()
          .single();

        if (journeyError) {
          toast.error(journeyError.message);
          setIsSaving(false);
          return;
        }

        for (const [index, stepTitle] of journey.steps.entries()) {
          const { error: stepError } = await supabase
            .from("journey_steps")
            .insert({
              journey_id: createdJourney.id,
              user_id: user.id,
              title: stepTitle,
              sort_order: index + 1,
            });

          if (stepError) {
            toast.error(stepError.message);
            setIsSaving(false);
            return;
          }
        }
      }
    }

    toast.success(selectedFramework ? "Project created from framework." : "Project created.");
    router.push(`/projects/${project.id}`);
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
              {studioFrameworks.length > 0 && <option disabled>──────── Studio frameworks ────────</option>}
              {studioFrameworks.map((framework) => (
                <option key={framework.id} value={framework.id}>{framework.name}</option>
              ))}
              <option disabled>──────── Built-in frameworks ────────</option>
              {builtInFrameworks.map((framework) => (
                <option key={framework.id} value={framework.id}>{framework.name}</option>
              ))}
            </SelectInput>
          </FormField>

          {selectedFramework && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-sm font-semibold text-violet-700">Using framework: {selectedFramework.name}</p>
              <p className="mt-1 text-sm leading-6 text-violet-700">
                This creates {selectedFramework.journeys.length} journey groups and their suggested steps. You can still edit everything after creation.
              </p>
            </div>
          )}

          {clients.length > 0 && (
            <FormField label="Client workspace" description="Optional. Connect this project to a Studio client workspace.">
              <SelectInput value={clientId} onChange={(e) => handleClientChange(e.target.value)}>
                <option value="">No client / personal project</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </SelectInput>
            </FormField>
          )}

          <FormField label="Project name">
            <TextInput placeholder="e.g. SaaS onboarding audit" value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>

          {!selectedClient && (
            <FormField label="Client name" description="Optional">
              <TextInput placeholder="e.g. Acme" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </FormField>
          )}

          <FormField label="Website URL" description="Optional">
            <TextInput placeholder="https://example.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
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
            <Button disabled={isSaving} className="flex-1">{isSaving ? "Creating..." : "Create Project"}</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
