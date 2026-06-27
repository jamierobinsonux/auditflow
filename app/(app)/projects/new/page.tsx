"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const frameworkId = searchParams.get("frameworkId");

  const selectedFramework = useMemo(() => {
    return auditFrameworks.find((framework) => framework.id === frameworkId);
  }, [frameworkId]);

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [auditType, setAuditType] = useState(
    selectedFramework?.auditType || "Onboarding"
  );
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
        client_name: clientName,
        website_url: websiteUrl,
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

    toast.success("Project created.");
    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  return (
    <PageShell>
      <PageHeader
        title="New Project"
        description="Create a UX audit project to organize findings, evidence, and recommendations."
      />

      <Card className="mx-auto mt-8 max-w-xl p-8">
        {selectedFramework && (
          <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-700">
              Using framework: {selectedFramework.name}
            </p>
            <p className="mt-1 text-sm leading-6 text-violet-700">
              This will automatically create {selectedFramework.journeys.length}{" "}
              journeys and their suggested audit steps.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Project name">
            <TextInput
              placeholder="e.g. SaaS onboarding audit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Client name" description="Optional">
            <TextInput
              placeholder="e.g. Acme"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </FormField>

          <FormField label="Website URL" description="Optional">
            <TextInput
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </FormField>

          <FormField label="Audit type">
            <SelectInput
              value={auditType}
              onChange={(e) => setAuditType(e.target.value)}
            >
              <option>Onboarding</option>
              <option>SaaS</option>
              <option>Mobile App</option>
              <option>Ecommerce</option>
              <option>Accessibility</option>
              <option>Dashboard</option>
            </SelectInput>
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={selectedFramework ? "/frameworks" : "/projects"}>
                Cancel
              </Link>
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