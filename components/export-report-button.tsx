"use client";

export function ExportReportButton({ projectId }: { projectId: string }) {
  return (
    <a
      href={`/api/projects/${projectId}/report`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
    >
      Export PDF
    </a>
  );
}