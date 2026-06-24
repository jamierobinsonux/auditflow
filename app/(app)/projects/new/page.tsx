"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewProjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [auditType, setAuditType] = useState("Onboarding");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name,
        client_name: clientName,
        website_url: websiteUrl,
        audit_type: auditType,
        status: "In Progress",
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/projects/${data.id}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-xl rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">New Project</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new UX audit workspace.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full rounded-lg border p-3"
            placeholder="Client name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />

          <input
            className="w-full rounded-lg border p-3"
            placeholder="Website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />

          <select
            className="w-full rounded-lg border p-3"
            value={auditType}
            onChange={(e) => setAuditType(e.target.value)}
          >
            <option>Onboarding</option>
            <option>SaaS</option>
            <option>Mobile App</option>
            <option>Ecommerce</option>
            <option>Accessibility</option>
          </select>

          <button className="w-full rounded-lg bg-violet-600 px-4 py-3 font-medium text-white">
            Create Project
          </button>
        </form>
      </div>
    </main>
  );
}