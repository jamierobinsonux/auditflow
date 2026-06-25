import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types/project";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as Project[];

  return (
    <main className="p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-slate-950">Projects</h1>

        <Link
          href="/projects/new"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"
        >
          + New Project
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block border-t border-slate-100 p-4 text-sm hover:bg-slate-50"
          >
            <p className="font-semibold text-slate-950">{project.name}</p>
            <p className="text-slate-500">{project.website_url || "No website"}</p>
          </Link>
        ))}

        {projects.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No projects yet.</p>
        )}
      </div>
    </main>
  );
}