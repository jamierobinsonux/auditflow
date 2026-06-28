"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CreateDemoProjectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreateDemo() {
    setLoading(true);

    const res = await fetch("/api/demo-project", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Could not create demo project.");
      setLoading(false);
      return;
    }

    toast.success("Demo project created.");
    router.push(`/projects/${data.projectId}`);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handleCreateDemo}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating demo...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Explore Demo Project
        </>
      )}
    </Button>
  );
}