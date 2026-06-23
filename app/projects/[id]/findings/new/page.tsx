"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewFindingPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("P2");
  const [status, setStatus] = useState("Open");
  const [recommendation, setRecommendation] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("findings").insert({
      project_id: projectId,
      title,
      description,
      severity,
      status,
      recommendation,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/projects/${projectId}/findings`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Add Finding</h1>
        <p className="mt-1 text-sm text-slate-500">
          Capture an issue, assign priority, and add a recommendation.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Finding title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="min-h-32 w-full rounded-lg border p-3"
            placeholder="Describe the issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full rounded-lg border p-3"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="P0">P0 - Critical</option>
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Medium</option>
            <option value="P3">P3 - Low</option>
          </select>

          <select
            className="w-full rounded-lg border p-3"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>In Review</option>
            <option>Resolved</option>
          </select>

          <textarea
            className="min-h-32 w-full rounded-lg border p-3"
            placeholder="Recommendation"
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
          />

          <button className="w-full rounded-lg bg-violet-600 px-4 py-3 font-medium text-white">
            Save Finding
          </button>
        </form>
      </div>
    </main>
  );
}