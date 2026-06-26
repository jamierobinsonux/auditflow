import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <main className="p-10">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-3 h-5 w-80" />
        </div>

        <Skeleton className="h-10 w-32" />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}