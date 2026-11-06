import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/layout/card";

type OnboardingStep = {
  label: string;
  description: string;
  complete: boolean;
  href: string;
};

export function OnboardingChecklist({
  projectCount,
  findingCount,
  evidenceCount,
  completedReportCount,
  latestProjectId,
  latestFindingProjectId,
  latestFindingId,
}: {
  projectCount: number;
  findingCount: number;
  evidenceCount: number;
  completedReportCount: number;
  latestProjectId?: string;
  latestFindingProjectId?: string;
  latestFindingId?: string;
}) {
  const projectHref = latestProjectId
    ? `/projects/${latestProjectId}`
    : "/projects/new";

  const findingHref =
    latestFindingProjectId && latestFindingId
      ? `/projects/${latestFindingProjectId}/findings/${latestFindingId}`
      : projectHref;

  const steps: OnboardingStep[] = [
    {
      label: "Create your first project",
      description: "Set up an audit workspace.",
      complete: projectCount > 0,
      href: "/projects/new",
    },
    {
      label: "Add your first finding",
      description: "Document a usability issue.",
      complete: findingCount > 0,
      href: projectCount > 0 && latestProjectId
        ? `/projects/${latestProjectId}/findings/new`
        : "/projects/new",
    },
    {
      label: "Upload evidence",
      description: "Attach screenshots to support findings.",
      complete: evidenceCount > 0,
      href: findingHref,
    },
    {
      label: "Export a report",
      description: "Create a client-ready PDF.",
      complete: completedReportCount > 0,
      href: projectHref,
    },
  ];

  const completedSteps = steps.filter((step) => step.complete).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  if (completedSteps === steps.length) return null;

  return (
    <Card className="mt-8 overflow-hidden">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Getting started
            </p>

            <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-slate-950">
              Set up your first UX audit
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Complete these steps to see how AuditFlow helps you document
              findings, support them with evidence, and generate reports.
            </p>
          </div>

          <div className="rounded-xl bg-violet-50 px-4 py-3 text-right">
            <p className="text-[22px] font-semibold text-violet-700">
              {progress}%
            </p>
            <p className="text-xs font-medium text-violet-600">complete</p>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className="flex items-center gap-4 p-5 transition hover:bg-slate-50"
          >
            {step.complete ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-slate-300" />
            )}

            <div>
              <p className="text-sm font-semibold text-slate-950">
                {step.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {step.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}