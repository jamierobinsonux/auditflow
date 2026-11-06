import Image from "next/image";

export function BrandLogo({
  size = 28,
  showText = true,
}: {
  size?: number;
  showText?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
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
          <p className="text-lg font-semibold tracking-tight text-slate-950">
            AuditFlow
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-400">
            UX Audit Platform
          </p>
        </div>
      )}
    </div>
  );
}