import Link from "next/link";

const tabs = [
  { name: "Overview", href: "" },
  { name: "Projects", href: "projects" },
  { name: "Reports", href: "reports" },
  { name: "Brand Assets", href: "brand-assets" },
];

export function ClientWorkspaceTabs({
  clientId,
  active,
}: {
  clientId: string;
  active: "overview" | "projects" | "reports" | "brand-assets";
}) {
  return (
    <div className="mt-8 border-b border-slate-200">
      <nav className="flex gap-6 overflow-x-auto" aria-label="Client workspace tabs">
        {tabs.map((tab) => {
          const isActive = active === (tab.href || "overview");
          const href = tab.href ? `/clients/${clientId}/${tab.href}` : `/clients/${clientId}`;

          return (
            <Link
              key={tab.name}
              href={href}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                isActive
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
