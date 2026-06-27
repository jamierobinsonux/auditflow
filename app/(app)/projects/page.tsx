import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
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
    <PageShell>
      <PageHeader
        title="Projects"
        description="Manage your UX audit projects and keep everything organized in one place."
        action={
          <Button asChild size="lg">
            <Link href="/projects/new">+ New Project</Link>
          </Button>
        }
      />

      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Create your first UX audit project to start tracking findings, evidence, and recommendations."
            actionLabel="Create Project"
            actionHref="/projects/new"
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden">
          {projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={`block p-6 transition hover:bg-slate-50 ${
                index !== 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    {project.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {project.website_url || "No website provided"}
                  </p>
                </div>

                <div className="text-right">
                  <span className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                    {project.status || "In Progress"}
                  </span>

                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(
                      project.updated_at || project.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </PageShell>
  );
}