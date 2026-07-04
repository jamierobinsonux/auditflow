"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
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
      setErrorMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8"><BrandLogo /></div>
        <h1 className="text-[24px] font-semibold text-slate-950">Choose a new password</h1>
        <p className="mt-2 text-sm text-slate-500">Enter a new password for your AuditFlow account.</p>

        <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
          <input type="password" className="w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <input type="password" className="w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />

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
