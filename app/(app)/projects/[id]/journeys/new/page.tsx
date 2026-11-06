"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { Button } from "@/components/ui/button";

export default function NewJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const projectId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || isSaving) return;

    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("journeys")
      .insert({
        project_id: projectId,
        user_id: user.id,
        name: trimmedName,
        description,
      })
      .select()
      .single();

    if (error) {
      toast.error("Couldn't create the journey. Try again.", {
        description: error.message,
      });
      setIsSaving(false);
      return;
    }

    toast.success("Journey created.");
    router.push(`/projects/${projectId}/journeys/${data.id}`);
    router.refresh();
  }

  return (
    <main className="p-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-[24px] font-semibold text-slate-950">
          New Journey
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a user journey or flow for this audit.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <FormField label="Journey name">
            <TextInput
              placeholder="e.g. Signup Flow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Description" description="Optional">
            <TextArea
              placeholder="What part of the product does this journey cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href={`/projects/${projectId}/journeys`}>Cancel</Link>
            </Button>

            <Button type="submit" size="lg" className="flex-1" disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Journey"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
