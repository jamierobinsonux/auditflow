type SendPostmarkEmailInput = {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
};

const POSTMARK_API_URL = "https://api.postmarkapp.com/email";

export async function sendPostmarkEmail({
  to,
  subject,
  htmlBody,
  textBody,
}: SendPostmarkEmailInput) {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  const from = process.env.POSTMARK_FROM_EMAIL;

  if (!token || !from) {
    console.warn("Postmark email skipped: POSTMARK_SERVER_TOKEN or POSTMARK_FROM_EMAIL is not configured.");
    return { skipped: true };
  }

  const response = await fetch(POSTMARK_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": token,
    },
    body: JSON.stringify({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: process.env.POSTMARK_MESSAGE_STREAM || "outbound",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Postmark send failed (${response.status}): ${errorText || response.statusText}`);
  }

  return { skipped: false };
}

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
