import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/project";

export default async function ProjectsPage() {
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projectList = (projects ?? []) as Project[];

  return (
    <main className="p-8 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>

        <Link
          href="/projects/new"
          className="rounded-lg bg-violet-600 px-4 py-2 text-white"
        >
          + New Project
        </Link>
      </div>

      <div className="rounded-xl border bg-white divide-y">
        {projectList.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block p-4 hover:bg-gray-50"
          >
            <p className="font-semibold">{project.name}</p>
            <p className="text-sm text-gray-500">{project.website_url}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}