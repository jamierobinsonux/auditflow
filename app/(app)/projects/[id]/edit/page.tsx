"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [auditType, setAuditType] = useState("");
  const [status, setStatus] = useState("In Progress");

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
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
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
      alert(error.message);
      return;
    }

    router.push(`/projects/${id}`);
    router.refresh();
  }

  return (
    <main className="p-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-[24px] font-semibold text-slate-950">
          Edit Project
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update audit details, status, and project metadata.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            required
          />

          <input
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client name"
          />

          <input
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="Website URL"
          />

          <select
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
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
          </select>

          <select
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>In Progress</option>
            <option>In Review</option>
            <option>Completed</option>
          </select>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/projects/${id}`}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}