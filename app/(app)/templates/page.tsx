import Link from "next/link";
import { auditFrameworks } from "@/lib/audit-frameworks";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";

export default function FrameworksPage() {
  return (
    <PageShell>
      <PageHeader
        title="Audit Frameworks"
        description="Start with a structured audit framework instead of a blank project."
      />

      <section className="mt-8 grid items-stretch gap-5 md:grid-cols-2">
        {auditFrameworks.map((framework) => (
          <Card
            key={framework.id}
            className="flex h-full min-h-[360px] flex-col p-6 transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
          >
            <div className="flex flex-1 flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                {framework.category}
              </p>

              <h2 className="mt-2 text-[18px] font-semibold text-slate-950">
                {framework.name}
              </h2>

              <p className="mt-3 min-h-[56px] text-sm leading-6 text-slate-500">
                {framework.description}
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Includes
                </p>

                <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                  {framework.journeys.slice(0, 4).map((journey) => (
                    <li key={journey.name}>• {journey.name}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-6">
                <Button asChild>
                  <Link href={`/projects/new?frameworkId=${framework.id}`}>
                    Use Framework
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}