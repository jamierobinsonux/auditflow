import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { NotificationBell } from "@/components/notification-bell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPostmarkEmail, escapeHtml } from "@/lib/postmark";
import { PostHogIdentity } from "@/components/posthog-identity";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user ? await getUserSubscription(user.id) : null;

  if (user) {
  await ensureWelcomeEmailSent({
    userId: user.id,
    email: user.email,
    displayName:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "there",
  });
}

  return (
  <div className="min-h-screen bg-[#F1F5F9]">
    {user ? (
      <PostHogIdentity
        userId={user.id}
        email={user.email}
        plan={subscription?.planId || "Free"}
      />
    ) : null}
      <Sidebar user={user} isStudio={Boolean(subscription?.isStudio)} />

      <main className="min-h-screen lg:ml-72">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-end border-b border-slate-200 bg-[#F1F5F9]/90 px-4 pl-16 backdrop-blur sm:px-6 lg:pl-6">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}
async function ensureWelcomeEmailSent({
  userId,
  email,
  displayName,
}: {
  userId: string;
  email?: string;
  displayName: string;
}) {
  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("welcome_email_sent_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.welcome_email_sent_at) return;

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: "Free",
      status: "active",
      welcome_email_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (!email) return;

  await sendPostmarkEmail({
    to: email,
    subject: "Welcome to AuditFlow",
    textBody: [
      `Hi ${displayName},`,
      "",
      "Welcome to AuditFlow!",
      "",
      "Your account is ready. You can now create UX audits, organize findings, and generate client-ready reports.",
      "",
      "Open AuditFlow: https://auditflowapp.co/dashboard",
      "",
      "— The AuditFlow Team",
    ].join("\n"),
    htmlBody: `
      <div style="font-family:Inter,Arial,sans-serif;background:#F1F5F9;padding:32px;">
        <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;padding:32px;">
          <p style="margin:0 0 8px;color:#7C3AED;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">AuditFlow</p>
          <h1 style="margin:0;color:#0F172A;font-size:24px;line-height:1.25;">Welcome to AuditFlow</h1>
          <p style="color:#334155;font-size:15px;line-height:1.6;">Hi ${escapeHtml(displayName)},</p>
          <p style="color:#64748B;font-size:15px;line-height:1.6;">Your account is ready. You can now create UX audits, organize findings, and generate client-ready reports.</p>
          <p style="margin:24px 0 0;">
            <a href="https://auditflowapp.co/dashboard" style="display:inline-block;background:#7C3AED;color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px;">Open AuditFlow</a>
          </p>
          <p style="color:#94A3B8;font-size:13px;margin-top:28px;">— The AuditFlow Team</p>
        </div>
      </div>
    `,
  });
}