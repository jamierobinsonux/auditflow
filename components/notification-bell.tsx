"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CircleAlert,
  FileText,
  Info,
  X,
} from "lucide-react";
import type { AuditFlowNotification } from "@/types/notification";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AuditFlowNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  async function loadNotifications() {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      setNotifications(payload.notifications ?? []);
      setUnreadCount(payload.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, is_read: true }))
    );
    setUnreadCount(0);
  }

  async function dismissAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss_all" }),
    });
    setNotifications([]);
    setUnreadCount(0);
  }

  async function dismissNotification(id: string) {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
    setUnreadCount((current) => Math.max(0, current - 1));

    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss" }),
    });
  }

  async function markRead(id: string) {
    const notification = notifications.find((item) => item.id === id);
    if (!notification || notification.is_read) return;

    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );
    setUnreadCount((current) => Math.max(0, current - 1));

    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read" }),
    });
  }

  const latestNotifications = useMemo(() => notifications.slice(0, 8), [notifications]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold leading-none text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Notifications</p>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                <CheckCheck size={14} />
                Mark read
              </button>
              <button
                type="button"
                onClick={dismissAll}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Dismiss all
              </button>
            </div>
          </div>

          <div className="max-h-[460px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestNotifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {latestNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={() => dismissNotification(notification.id)}
                    onOpen={() => markRead(notification.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                  <Bell size={20} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-950">No notifications</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  We'll let you know when something needs your attention.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onDismiss,
  onOpen,
}: {
  notification: AuditFlowNotification;
  onDismiss: () => void;
  onOpen: () => void;
}) {
  const Icon = getNotificationIcon(notification.type, notification.severity);

  const content = (
    <>
      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getIconClass(notification.severity)}`}>
        <Icon size={16} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {!notification.is_read && <span className="h-2 w-2 rounded-full bg-violet-600" />}
          <span className="truncate text-sm font-semibold text-slate-950">
            {notification.title}
          </span>
        </span>
        {notification.message && (
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {notification.message}
          </span>
        )}
        <span className="mt-1 block text-[11px] font-medium text-slate-400">
          {formatRelativeDate(notification.created_at)}
        </span>
      </span>
    </>
  );

  return (
    <div className="group relative flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50">
      {notification.href ? (
        <Link href={notification.href} onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 pr-8">
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 pr-8 text-left">
          {content}
        </button>
      )}

      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function getNotificationIcon(type: string, severity: string) {
  if (type.includes("report")) return FileText;
  if (severity === "danger") return CircleAlert;
  if (severity === "warning") return AlertTriangle;
  return Info;
}

function getIconClass(severity: string) {
  if (severity === "danger") return "bg-red-50 text-red-700";
  if (severity === "warning") return "bg-amber-50 text-amber-700";
  if (severity === "success") return "bg-emerald-50 text-emerald-700";
  return "bg-violet-50 text-violet-700";
}

function formatRelativeDate(date: string) {
  const timestamp = new Date(date).getTime();
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (Number.isNaN(timestamp)) return "recently";
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
