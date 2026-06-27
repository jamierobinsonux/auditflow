export function SeverityBadge({ severity }: { severity?: string | null }) {
  const label = severity || "Unprioritized";
  const normalized = label.toLowerCase();

  const styles =
    normalized.includes("p0") || normalized.includes("critical")
      ? "bg-red-100 text-red-700"
      : normalized.includes("p1") || normalized.includes("high")
      ? "bg-orange-100 text-orange-700"
      : normalized.includes("p2") || normalized.includes("medium")
      ? "bg-amber-100 text-amber-700"
      : normalized.includes("p3") || normalized.includes("low")
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