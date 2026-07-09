"use client";

import Link from "next/link";
import { X } from "lucide-react";

type Notification = {
  id: string;
  href: string;
  authorName: string;
  findingTitle: string;
  projectName: string;
  createdAt: string;
  body: string;
};

export function ClientPortalNotifications({
  notifications,
}: {
  notifications: Notification[];
}) {
  const dismissedKey = "auditflow-dismissed-client-notifications";

  const dismissed =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(dismissedKey) || "[]")
      : [];

  const visibleNotifications = notifications.filter(
    (notification) => !dismissed.includes(notification.id)
  );

  function dismissNotification(id: string) {
    const current = JSON.parse(localStorage.getItem(dismissedKey) || "[]");
    localStorage.setItem(dismissedKey, JSON.stringify([...current, id]));
    window.location.reload();
  }

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="relative rounded-2xl border border-violet-100 bg-violet-50/60 p-4 transition hover:border-violet-200 hover:bg-violet-50"
        >
          <button
            type="button"
            onClick={() => dismissNotification(notification.id)}
            className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>

          <Link href={notification.href} className="block pr-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Consultant reply
            </p>
            <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-950">
              {notification.authorName} replied on {notification.findingTitle}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {notification.projectName} · {notification.createdAt}
            </p>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
              {notification.body}
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}