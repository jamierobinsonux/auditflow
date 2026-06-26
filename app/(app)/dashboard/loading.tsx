import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="px-12 py-10">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-4 h-5 w-96" />
        </div>

        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="mt-8 h-36 w-full rounded-2xl" />

      <section className="mt-8 grid grid-cols-4 gap-5">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </section>

      <section className="mt-8">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-5 h-80 rounded-2xl" />
      </section>
    </main>
  );
}