"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("If an account exists for that email, you’ll receive a password reset link shortly.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <BrandLogo />
        </div>

        <h1 className="text-[24px] font-semibold text-slate-950">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email and we’ll send you a secure link to choose a new password.
        </p>

        <form onSubmit={handlePasswordReset} className="mt-6 space-y-4">
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {errorMessage ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <button
            disabled={isSubmitting}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700">
            Sign in
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-slate-400">
          <Link href="/terms" className="font-semibold text-slate-500 hover:text-violet-600">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="font-semibold text-slate-500 hover:text-violet-600">
            Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}
