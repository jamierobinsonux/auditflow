"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [auditType, setAuditType] = useState("Onboarding");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
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
      alert(error.message);
      return;
    }

    router.push(`/projects/${data.id}`);
    router.refresh();
  }

  return (
    <main className="p-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-[24px] font-semibold text-slate-950">New Project</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <input className="w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Website URL" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />

          <select className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={auditType} onChange={(e) => setAuditType(e.target.value)}>
            <option>Onboarding</option>
            <option>SaaS</option>
            <option>Mobile App</option>
            <option>Ecommerce</option>
            <option>Accessibility</option>
          </select>

          <div className="flex gap-3 pt-2">
            <Link href="/projects" className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </Link>

            <button className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}