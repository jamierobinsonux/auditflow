export type NotificationSeverity = "info" | "success" | "warning" | "danger";

export type AuditFlowNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  href: string | null;
  severity: NotificationSeverity;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  dismissed_at: string | null;
  resolved_at: string | null;
  dedupe_key: string | null;
  created_at: string;
  updated_at: string;
};
