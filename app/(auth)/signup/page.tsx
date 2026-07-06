"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function getSignupErrorMessage(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes("already registered") || normalized.includes("already exists")) {
      return "An account with this email already exists. Sign in instead, or reset your password if you need help getting back in.";
    }

    if (normalized.includes("password")) {
      return "Please choose a stronger password. Use at least 8 characters.";
    }

    if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
      return "Too many signup attempts. Please wait a moment, then try again.";
    }

    return "Something went wrong while creating your account. Please try again.";
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!acceptedTerms) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy before creating your account.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    setIsSubmitting(true);

    const existingEmailResponse = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: trimmedEmail }),
    });

    if (existingEmailResponse.ok) {
      const existingEmailResult = (await existingEmailResponse.json()) as {
        exists?: boolean;
      };

      if (existingEmailResult.exists) {
        setIsSubmitting(false);
        setErrorMessage("An account with this email already exists. Sign in instead, or reset your password if you need help getting back in.");
        return;
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: name.trim(),
          accepted_terms: true,
          accepted_terms_at: new Date().toISOString(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(getSignupErrorMessage(error.message));
      return;
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setErrorMessage("An account with this email already exists. Sign in instead, or reset your password if you need help getting back in.");
      return;
    }

    router.push(`/check-email?email=${encodeURIComponent(trimmedEmail)}`);
  }

  async function handleGoogleSignup() {
    setErrorMessage(null);

    if (!acceptedTerms) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy before continuing with Google.");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
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
          Create your AuditFlow account
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Start building professional UX audits and client-ready reports.
        </p>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Continue with Google
        </button>

        <form onSubmit={handleEmailSignup} className="mt-5 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrorMessage(null);
            }}
            required
          />

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

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-5 text-slate-600">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                setErrorMessage(null);
              }}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-600"
              required
            />
            <span>
              I agree to AuditFlow&apos;s {" "}
              <Link href="/terms" className="font-semibold text-violet-600 hover:text-violet-700">
                Terms of Service
              </Link>{" "}
              and {" "}
              <Link href="/privacy" className="font-semibold text-violet-600 hover:text-violet-700">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700" role="alert">
              <p>{errorMessage}</p>
              {errorMessage.toLowerCase().includes("already exists") ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <Link href="/login" className="font-semibold text-red-800 underline underline-offset-4 hover:text-red-900">
                    Sign in
                  </Link>
                  <Link href="/forgot-password" className="font-semibold text-red-800 underline underline-offset-4 hover:text-red-900">
                    Reset password
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            disabled={isSubmitting}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Start free"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-violet-600">
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