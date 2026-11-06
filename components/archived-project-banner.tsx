import { Archive } from "lucide-react";
import { ArchiveProjectButton } from "@/components/archive-project-button";
import { Card } from "@/components/layout/card";

export function ArchivedProjectBanner({ projectId }: { projectId: string }) {
  return (
    <Card className="mt-6 border-slate-300 bg-slate-50 p-5">
      <div className="flex items-center justify-between gap-6">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
            <Archive className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">
              This project is archived.
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Archived projects are hidden from your dashboard and active
              project list. Restore it to make changes again.
            </p>
          </div>
        </div>

        <ArchiveProjectButton projectId={projectId} archived />
      </div>
    </Card>
  );
}