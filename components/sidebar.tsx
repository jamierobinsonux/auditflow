"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { formatDisplayName } from "@/lib/format-name";
import {
  LayoutDashboard,
  BarChart3,
  FolderKanban,
  Building2,
  Shapes,
  FileText,
  Lightbulb,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

type SidebarProps = {
  user: {
    email?: string | null;
    user_metadata?: {
      full_name?: string;
      name?: string;
    };
  } | null;
};

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    exact: false,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
    exact: false,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Building2,
    exact: false,
    studio: true,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    exact: false,
    studio: true,
  },
  {
    name: "Recommendations",
    href: "/recommendations",
    icon: Lightbulb,
    exact: false,
    studio: true,
  },
  {
    name: "Frameworks",
    href: "/templates",
    icon: Shapes,
    exact: false,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const rawName =
  user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  user?.email?.split("@")[0];

const displayName = formatDisplayName(rawName);

  const initials = getInitials(displayName);

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-slate-200 bg-white">

      <Link
  href="/dashboard"
  className="border-b border-slate-200 px-6 py-5 transition hover:bg-slate-50"
>
  <BrandLogo />
</Link>

      <nav className="flex-1 px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.slice(0, 2).map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} />
          ))}
        </div>

        <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Audits
        </p>

        <div className="space-y-1">
          {navigation.slice(2).map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4">

        <NavItem
          item={{
            name: "Settings",
            href: "/settings",
            icon: Settings,
            exact: true,
          }}
          pathname={pathname}
        />

        <NavItem
          item={{
            name: "Billing",
            href: "/settings/billing",
            icon: CreditCard,
            exact: false,
          }}
          pathname={pathname}
        />

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-slate-500">
            <LogOut size={14} />
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  item,
  pathname,
}: {
  item: {
    name: string;
    href: string;
    icon: React.ElementType;
    exact: boolean;
    studio?: boolean;
  };
  pathname: string;
}) {
  const Icon = item.icon;

  const active = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={`grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-violet-50 text-violet-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      <span className="min-w-0 truncate">{item.name}</span>
      {item.studio && (
        <span className="shrink-0 rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-semibold leading-none text-violet-700">
          Studio
        </span>
      )}
    </Link>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}