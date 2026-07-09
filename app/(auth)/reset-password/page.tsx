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

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordIsLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!passwordIsLongEnough) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || "Unable to update your password. Please request a new reset link and try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8"><BrandLogo /></div>
        <h1 className="text-[24px] font-semibold text-slate-950">Choose a new password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Use at least {MIN_PASSWORD_LENGTH} characters. Longer passwords or passphrases are more secure.
        </p>

        <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-xl border border-slate-200 p-3 pr-11 text-sm"
                placeholder="New password"
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
                placeholder="Confirm new password"
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

          {errorMessage ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}

          <button disabled={isSubmitting} className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need a new link? <Link href="/forgot-password" className="font-semibold text-violet-600 hover:text-violet-700">Send another reset email</Link>
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
