import Link from "next/link";
import { auditFrameworks } from "@/lib/audit-frameworks";

export default function FrameworksPage() {
  return (
    <main className="p-10">
      <div>
        <h1 className="text-[24px] font-semibold text-slate-950">
          Audit Frameworks
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Start with a structured audit framework instead of a blank project.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {auditFrameworks.map((framework) => (
          <div
            key={framework.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
              {framework.category}
            </p>

            <h2 className="mt-2 text-[18px] font-semibold text-slate-950">
              {framework.name}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {framework.description}
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Includes
              </p>

              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {framework.journeys.slice(0, 4).map((journey) => (
                  <li key={journey.name}>• {journey.name}</li>
                ))}
              </ul>
            </div>

            <Link
              href={`/projects/new?frameworkId=${framework.id}`}
              className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
            >
              Use Framework
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}