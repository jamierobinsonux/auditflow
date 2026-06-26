import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <main className="p-10">
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-3 h-5 w-96" />
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </section>

      <Skeleton className="mt-8 h-32 rounded-2xl" />

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[420px] rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </section>
    </main>
  );
}