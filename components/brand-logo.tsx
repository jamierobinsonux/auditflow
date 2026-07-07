import Image from "next/image";

export function BrandLogo({
  size = 28,
  showText = true,
}: {
  size?: number;
  showText?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <Image
        src="/AFLogo.png"
        alt="AuditFlow logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />

      {showText && (
        <div>
          <p className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
            AuditFlow
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.11em] text-slate-400 sm:text-[11px] sm:tracking-[0.14em]">
            UX Audit Platform
          </p>
        </div>
      )}
    </div>
  );
}