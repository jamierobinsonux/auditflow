import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <main className="p-10">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-3 h-5 w-96" />
        </div>

        <Skeleton className="h-10 w-28" />
      </div>

      <section className="mt-10">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-3 h-5 w-80" />

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </section>

      <section className="mt-10">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="mt-3 h-5 w-96" />

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </section>
    </main>
  );
}