import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading({
  action = true,
  variant = "list",
}: {
  action?: boolean;
  variant?: "list" | "cards" | "form" | "dashboard" | "detail";
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        </div>
        {action && <Skeleton className="h-11 w-36 shrink-0" />}
      </div>

      {variant === "dashboard" && <DashboardSkeleton />}
      {variant === "list" && <ListSkeleton />}
      {variant === "cards" && <CardsSkeleton />}
      {variant === "form" && <FormSkeleton />}
      {variant === "detail" && <DetailSkeleton />}
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </section>
      <section className="mt-8 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </section>
      <section className="mt-8 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </section>
    </>
  );
}

function ListSkeleton() {
  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
      </div>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
}

function CardsSkeleton() {
  return (
    <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-52 rounded-2xl" />
      ))}
    </section>
  );
}

function FormSkeleton() {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-28 w-full rounded-xl" />
      <div className="mt-6 flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <Skeleton className="mt-8 h-12 w-full rounded-2xl" />
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </section>
      <section className="mt-8 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </section>
    </>
  );
}
