import { Skeleton } from "@/components/ui/skeleton";

export default function TemplatesLoading() {
  return (
    <main className="p-10">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-5 w-96" />
        </div>

        <Skeleton className="h-10 w-36" />
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </section>
    </main>
  );
}