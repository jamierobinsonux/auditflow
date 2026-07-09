"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 12;

function getPasswordStrength(password: string) {
  if (!password) return null;

  let score = 0;

  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 16) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return "Weak";
  if (score === 2) return "Fair";
  if (score === 3) return "Good";
  return "Strong";
}

function PasswordVisibilityButton({
  isVisible,
  onClick,
  label,
}: {
  isVisible: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
      aria-label={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordIsLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  function getSignupErrorMessage(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes("already registered") || normalized.includes("already exists")) {
      return "An account with this email already exists. Sign in instead, or reset your password if you need help getting back in.";
    }

    if (normalized.includes("password")) {
      return `Please choose a stronger password. Use at least ${MIN_PASSWORD_LENGTH} characters.`;
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

    if (!passwordIsLongEnough) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    setIsSubmitting(true);

    /*const existingEmailResponse = await fetch("/api/auth/check-email", {
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
    }*/

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
    <main className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-6 py-10">
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

          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-xl border border-slate-200 p-3 pr-11 text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
              <PasswordVisibilityButton
                isVisible={showPassword}
                onClick={() => setShowPassword((current) => !current)}
                label={showPassword ? "Hide password" : "Show password"}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
              <div className={passwordIsLongEnough ? "text-emerald-700" : "text-slate-500"}>
                {passwordIsLongEnough ? "✓" : "•"} Use at least {MIN_PASSWORD_LENGTH} characters.
              </div>
              {passwordStrength ? (
                <div className="mt-1">
                  Strength: <span className="font-semibold text-slate-700">{passwordStrength}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-xl border border-slate-200 p-3 pr-11 text-sm"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage(null);
                }}
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
              <PasswordVisibilityButton
                isVisible={showConfirmPassword}
                onClick={() => setShowConfirmPassword((current) => !current)}
                label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              />
            </div>

            {confirmPassword ? (
              <p className={`text-xs ${passwordsMatch ? "text-emerald-700" : "text-red-600"}`}>
                {passwordsMatch ? "✓ Passwords match." : "Passwords do not match."}
              </p>
            ) : null}
          </div>

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
