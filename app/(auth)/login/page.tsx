"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function getLoginErrorMessage(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes("invalid login credentials")) {
      return "We couldn't find an account with that email and password. Check your email and password, or reset your password.";
    }

    if (normalized.includes("email not confirmed")) {
      return "Please confirm your email before signing in. Check your inbox for the AuditFlow confirmation email.";
    }

    if (normalized.includes("too many requests") || normalized.includes("rate limit")) {
      return "Too many sign-in attempts. Please wait a moment, then try again.";
    }

    return "Something went wrong while signing you in. Please try again.";
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(getLoginErrorMessage(error.message));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <BrandLogo />
        </div>

        <h1 className="text-[24px] font-semibold text-slate-950">
          Sign in to AuditFlow
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Continue managing your UX audits, findings, and reports.
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Continue with Google
        </button>

        <form onSubmit={handleEmailLogin} className="mt-5 space-y-4">
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage(null);
            }}
            required
          />

          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage(null);
            }}
            required
          />

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700" role="alert">
              {errorMessage}
              <div className="mt-2">
                <Link href="/forgot-password" className="font-semibold text-red-700 underline underline-offset-2 hover:text-red-800">
                  Reset your password
                </Link>
              </div>
            </div>
          ) : null}

          <button
            disabled={isSubmitting}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Forgot your password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to AuditFlow?{" "}
          <Link href="/signup" className="font-semibold text-violet-600">
            Start free
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