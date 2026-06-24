"use client";

export function ExportReportButton({ projectId }: { projectId: string }) {
  function handleExport() {
    window.open(`/api/projects/${projectId}/report`, "_blank");
  }

  return (
    <button
      onClick={handleExport}
      className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
    >
      Export PDF
    </button>
  );
}