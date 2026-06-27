import type { ReactNode } from "react";

export function FormField({
  label,
  description,
  error,
  children,
}: {
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800">
        {label}
      </label>

      {description && (
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      )}

      <div className="mt-2">{children}</div>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}