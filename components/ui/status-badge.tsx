export function StatusBadge({ status }: { status?: string | null }) {
  const label = status || "In Progress";
  const normalized = label.toLowerCase();

  const styles = normalized.includes("complete") || normalized.includes("resolved")
    ? "bg-green-100 text-green-700"
    : normalized.includes("review")
    ? "bg-violet-100 text-violet-700"
    : normalized.includes("progress")
    ? "bg-blue-100 text-blue-700"
    : "bg-slate-100 text-slate-700";

  return <Badge label={label} className={styles} />;
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-lg px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}