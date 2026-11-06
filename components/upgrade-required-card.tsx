import Link from "next/link";

export function UpgradeRequiredCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="p-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-violet-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-violet-600">
          Upgrade required
        </p>

        <h1 className="mt-3 text-[24px] font-semibold text-slate-950">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {description}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
  <Link
    href="/settings/billing"
    className="w-full rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-violet-700 sm:flex-1"
  >
    View Plans
  </Link>

  <Link
    href="/dashboard"
    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-1"
  >
    Back to Dashboard
  </Link>
</div>
      </div>
    </main>
  );
}