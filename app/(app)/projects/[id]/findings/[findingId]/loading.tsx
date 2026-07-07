import { Skeleton } from "@/components/ui/skeleton";

export default function FindingDetailLoading() {
  return (
    <main className="p-10">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-80" />

          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Skeleton className="mt-8 h-12 w-full rounded-2xl" />

      <div className="mt-6 space-y-6">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    </main>
  );
}