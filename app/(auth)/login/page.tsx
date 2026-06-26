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

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
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
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to AuditFlow?{" "}
          <Link href="/signup" className="font-semibold text-violet-600">
            Start free
          </Link>
        </p>
      </div>
    </main>
  );
}