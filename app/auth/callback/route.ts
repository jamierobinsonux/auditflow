import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPostmarkEmail, escapeHtml } from "@/lib/postmark";

function getSafeRedirectPath(rawNext: string | null) {
  if (!rawNext) return "/dashboard";

  try {
    const decoded = decodeURIComponent(rawNext);

    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    return "/dashboard";
  }

  return "/dashboard";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && !user.user_metadata?.welcome_email_sent_at) {
      await sendWelcomeEmail({
        request,
        email: user.email,
        displayName:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "there",
      });

      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          welcome_email_sent_at: new Date().toISOString(),
        },
      });
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}

async function sendWelcomeEmail({
  request,
  email,
  displayName,
}: {
  request: Request;
  email?: string;
  displayName: string;
}) {
  if (!email) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

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
      `Open AuditFlow: ${appUrl}/dashboard`,
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
            <a href="${escapeHtml(appUrl)}/dashboard" style="display:inline-block;background:#7C3AED;color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px;">Open AuditFlow</a>
          </p>
          <p style="color:#94A3B8;font-size:13px;margin-top:28px;">— The AuditFlow Team</p>
        </div>
      </div>
    `,
  });
}