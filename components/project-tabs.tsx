"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Overview",
      href: `/projects/${projectId}`,
      active: pathname === `/projects/${projectId}`,
    },
    {
      label: "Journeys",
      href: `/projects/${projectId}/journeys`,
      active: pathname.includes(`/projects/${projectId}/journeys`),
    },
    {
      label: "Reports",
      href: `/projects/${projectId}/report`,
      active: pathname.includes(`/projects/${projectId}/report`),
    },
  ];

  return (
    <nav className="mt-6 flex gap-8 border-b border-slate-200 pb-4">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`text-sm font-medium transition ${
            tab.active
              ? "text-violet-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
