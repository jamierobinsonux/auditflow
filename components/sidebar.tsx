"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[260px] flex-col justify-between border-r border-slate-200 bg-slate-100">
      <div>
        <div className="px-6 pt-8">
          <Image
            src="/AFLogo.png"
            alt="AuditFlow"
            width={190}
            height={50}
            priority
            className="h-auto w-[190px]"
          />
        </div>

        <nav className="mt-12 px-4">
          <div className="space-y-2">
            <NavItem href="/dashboard" active={pathname.startsWith("/dashboard")}>
              Dashboard
            </NavItem>

            <NavItem href="/projects" active={pathname.startsWith("/projects")}>
              Projects
            </NavItem>

            <NavItem href="/templates" active={pathname.startsWith("/templates")}>
              Templates
            </NavItem>

            <NavItem href="/reports" active={pathname.startsWith("/reports")}>
              Reports
            </NavItem>

            <NavItem href="/settings" active={pathname.startsWith("/settings")}>
              Settings
            </NavItem>
          </div>
        </nav>
      </div>

      <div>
        <div className="mx-4 mb-6 rounded-2xl bg-violet-100 p-5">
          <h3 className="font-semibold text-violet-700">Upgrade to Pro</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Unlock unlimited audits, custom branding, and more.
          </p>
          <button className="mt-4 w-full rounded-xl bg-violet-600 py-3 text-sm font-medium text-white hover:bg-violet-700">
            Upgrade Now
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-200 text-sm font-semibold text-violet-700">
            JD
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">Jane Doe</p>
            <p className="text-xs text-slate-500">jane@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-violet-200 text-violet-700"
          : "text-slate-600 hover:bg-white"
      }`}
    >
      {children}
    </Link>
  );
}