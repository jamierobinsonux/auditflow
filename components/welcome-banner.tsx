import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout/card";
import { CreateDemoProjectButton } from "@/components/create-demo-project-button";

export function WelcomeBanner() {
  return (
    <Card className="mt-8 overflow-hidden border-violet-200 bg-gradient-to-r from-violet-50 to-white">
      <div className="flex items-center justify-between gap-8 p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome to AuditFlow
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Start your first UX audit in minutes.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Create a blank audit project or begin with one of our built-in
            frameworks for onboarding, SaaS, ecommerce, accessibility, mobile
            apps, and dashboards.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
  <Button asChild size="lg">
    <Link href="/projects/new">Create Project</Link>
  </Button>

  <Button asChild variant="outline" size="lg">
    <Link href="/frameworks">Browse Frameworks</Link>
  </Button>

  <CreateDemoProjectButton />
</div>
        </div>

        <div className="hidden lg:flex h-44 w-44 items-center justify-center rounded-3xl bg-violet-100">
          <Sparkles className="h-16 w-16 text-violet-600" />
        </div>
      </div>
    </Card>
  );
}