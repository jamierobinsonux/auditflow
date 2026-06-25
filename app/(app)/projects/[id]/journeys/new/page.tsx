"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const projectId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
      .from("journeys")
      .insert({
        project_id: projectId,
        user_id: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Journey name, e.g. Signup Flow"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Link
              href={`/projects/${projectId}/journeys`}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
              Create Journey
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}