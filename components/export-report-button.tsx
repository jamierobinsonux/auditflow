"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportReportButton({
  projectId,
}: {
  projectId: string;
}) {
  const [isExporting, setIsExporting] = useState(false);

  function handleClick() {
    setIsExporting(true);

    window.open(
      `/api/projects/${projectId}/report`,
      "_blank",
      "noopener,noreferrer"
    );

    // Give the browser a moment to start the download.
    setTimeout(() => {
      setIsExporting(false);
    }, 2500);
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        "Export PDF"
      )}
    </Button>
  );
}