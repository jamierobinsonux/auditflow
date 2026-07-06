import Link from "next/link";
import { MailCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <MailCheck className="h-7 w-7" />
        </div>

        <h1 className="mt-6 text-[24px] font-semibold text-slate-950">
          Check your email
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          We sent a confirmation link{email ? ` to ${email}` : ""}. Click the link to verify your email and finish setting up your AuditFlow account.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm leading-6 text-slate-600">
          <p className="font-semibold text-slate-900">Didn’t get it?</p>
          <p className="mt-1">Check your spam folder, make sure the email address is correct, or create your account again to send a fresh confirmation email.</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/login" className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
            Go to sign in
          </Link>
          <Link href="/signup" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Use a different email
          </Link>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          <Link href="/terms" className="font-semibold text-slate-500 hover:text-violet-600">Terms</Link>{" "}
          ·{" "}
          <Link href="/privacy" className="font-semibold text-slate-500 hover:text-violet-600">Privacy</Link>
        </p>
      </div>
    </main>
  );
}
