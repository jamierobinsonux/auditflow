import Link from "next/link";

export function FreePlanUsageCard({
  plan,
  projectsUsed,
  findingsUsed,
}: {
  plan: string;
  projectsUsed: number;
  findingsUsed: number;
}) {
  if (plan !== "Free") return null;

  const projectLimit = 1;
  const findingLimit = 5;

  const projectPercent = Math.min((projectsUsed / projectLimit) * 100, 100);
  const findingPercent = Math.min((findingsUsed / findingLimit) * 100, 100);

  const hasHitLimit = projectsUsed >= projectLimit && findingsUsed >= findingLimit;
  const isNearLimit =
    hasHitLimit || projectsUsed >= projectLimit || findingsUsed >= findingLimit - 1;

  return (
    <section
      className={`mt-8 rounded-2xl border p-6 shadow-sm ${
        isNearLimit
          ? "border-violet-200 bg-violet-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-violet-700">Free plan usage</p>
          <h2 className="mt-2 text-[18px] font-semibold text-slate-950">
            {hasHitLimit
              ? "You’ve hit your Free plan limit"
              : isNearLimit
              ? "You’re getting close to your Free plan limit"
              : "Track your Free plan usage"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {hasHitLimit
              ? "You’ve used your 1 project and 5 findings. Upgrade to Pro to keep creating audits, findings, public report links, and professional exports."
              : "Free includes 1 project and 5 findings. Upgrade to Pro for unlimited projects, unlimited findings, public report links, and professional exports."}
          </p>
        </div>

        <Link
          href="/settings/billing"
          className="shrink-0 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Upgrade
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <UsageBar
          label="Projects"
          value={projectsUsed}
          limit={projectLimit}
          percent={projectPercent}
        />
        <UsageBar
          label="Findings"
          value={findingsUsed}
          limit={findingLimit}
          percent={findingPercent}
        />
      </div>
    </section>
  );
}

function UsageBar({
  label,
  value,
  limit,
  percent,
}: {
  label: string;
  value: number;
  limit: number;
  percent: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {value} / {limit}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}