import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function GoodbyePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="mt-8 text-[24px] font-semibold text-slate-950">
          Your account has been deleted
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your AuditFlow account deletion request has been completed. If a paid subscription
          was active, it was cancelled before deletion.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Return to homepage
        </Link>
      </div>
    </main>
  );
}
