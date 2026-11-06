export function AuditTypeBadge({ type }: { type?: string | null }) {
  const label = type || "Audit";
  const normalized = label.toLowerCase();

  const styles = normalized.includes("mobile")
    ? "bg-blue-100 text-blue-700"
    : normalized.includes("ecommerce")
    ? "bg-amber-100 text-amber-700"
    : normalized.includes("dashboard")
    ? "bg-rose-100 text-rose-700"
    : normalized.includes("saas")
    ? "bg-green-100 text-green-700"
    : normalized.includes("accessibility")
    ? "bg-indigo-100 text-indigo-700"
    : "bg-violet-100 text-violet-700";

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