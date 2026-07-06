import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { exists: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Supabase may intentionally hide duplicate-email signups from the client
    // when email confirmation is enabled. Use the service role server-side so
    // the signup page can show a helpful sign-in/reset-password path.
    let page = 1;
    const perPage = 1000;

    while (page <= 10) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error("Unable to check existing signup email.", error.message);
        return NextResponse.json({ exists: false, checked: false });
      }

      const users = data?.users ?? [];
      const exists = users.some(
        (user) => normalizeEmail(user.email) === email
      );

      if (exists) {
        return NextResponse.json({ exists: true, checked: true });
      }

      if (users.length < perPage) break;
      page += 1;
    }

    return NextResponse.json({ exists: false, checked: true });
  } catch (error) {
    console.error("Existing email check failed.", error);
    return NextResponse.json({ exists: false, checked: false });
  }
}
