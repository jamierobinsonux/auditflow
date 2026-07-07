export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div>
        <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action && <div className="w-full shrink-0 sm:w-auto [&_[data-slot=button]]:w-full sm:[&_[data-slot=button]]:w-auto">{action}</div>}
    </div>
  );
}