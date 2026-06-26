import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <main className="p-10">
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-3 h-5 w-96" />
      </div>

      <section className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-6 w-28" />

        <div className="mt-6 space-y-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>

      <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-6 w-32" />

        <div className="mt-6 space-y-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>

      <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-6 w-44" />

        <div className="mt-6 space-y-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
    </main>
  );
}