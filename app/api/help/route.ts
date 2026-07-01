import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

const SUPPORT_EMAIL = "jamie@auditflowapp.co";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const category = String(body?.category || "Other").slice(0, 80);
  const subject = String(body?.subject || "").trim().slice(0, 160);
  const message = String(body?.message || "").trim().slice(0, 8000);

  if (!subject || !message) {
    return Response.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const { error } = await supabase.from("support_requests").insert({
    user_id: user.id,
    user_email: user.email,
    category,
    subject,
    message,
    status: "Open",
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await sendSupportEmail({
    fromEmail: user.email || "unknown user",
    category,
    subject,
    message,
  });

  await createNotification(supabase, {
    userId: user.id,
    type: "support_request_sent",
    title: "Help request sent",
    message: "Your message was saved and sent to AuditFlow support.",
    href: "/help",
    severity: "success",
  });

  return Response.json({ ok: true });
}

async function sendSupportEmail({
  fromEmail,
  category,
  subject,
  message,
}: {
  fromEmail: string;
  category: string;
  subject: string;
  message: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.SUPPORT_FROM_EMAIL || "AuditFlow <support@auditflowapp.co>";

  if (!resendApiKey) {
    console.warn("Help request saved, but RESEND_API_KEY is not configured. Email was not sent.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: SUPPORT_EMAIL,
      reply_to: fromEmail,
      subject: `[AuditFlow ${category}] ${subject}`,
      text: `From: ${fromEmail}\nCategory: ${category}\n\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error("Unable to send support email", await response.text());
  }
}
