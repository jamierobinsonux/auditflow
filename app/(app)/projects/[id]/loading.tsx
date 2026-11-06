import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <main className="p-10">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="mt-3 h-5 w-96" />
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Skeleton className="mt-8 h-12 w-full rounded-2xl" />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </section>

      <section className="mt-8">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-5 h-80 rounded-2xl" />
      </section>
    </main>
  );
}