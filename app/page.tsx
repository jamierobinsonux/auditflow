import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { subscriptionPlans } from "@/lib/subscription-plans";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <BrandLogo />

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Start free
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-8 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
          UX audit software for consultants and teams
        </p>

        <h1 className="mt-5 text-[56px] font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950">
          Create professional UX audits faster.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          AuditFlow helps designers organize findings, annotate screenshots,
          generate client-ready reports, and track audit work from one place.
        </p>

        <div className="mt-10 flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Start free
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-8 py-10 md:grid-cols-4">
        <FeatureCard
          title="Screenshot annotation"
          description="Add numbered notes directly to evidence images."
        />
        <FeatureCard
          title="Professional PDFs"
          description="Export polished reports with findings, recommendations, and evidence."
        />
        <FeatureCard
          title="Audit frameworks"
          description="Start with structured SaaS, mobile, ecommerce, and accessibility audits."
        />
        <FeatureCard
          title="Analytics"
          description="Track project health, severity mix, and priority findings."
        />
      </section>

      <section className="mx-auto max-w-7xl px-8 py-24">
        <div className="text-center">
          <h2 className="text-[36px] font-semibold tracking-[-0.03em] text-slate-950">
            Simple pricing for audit work
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Start free, then upgrade when your audit workflow grows.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => {
            const isRecommended =
              "recommended" in plan && Boolean(plan.recommended);

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border bg-white p-6 shadow-sm ${
                  isRecommended ? "border-violet-300" : "border-slate-200"
                }`}
              >
                {isRecommended && (
                  <p className="mb-4 w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                    Recommended
                  </p>
                )}

                <h3 className="text-[22px] font-semibold text-slate-950">
                  {plan.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-end gap-1">
                  <p className="text-[36px] font-semibold text-slate-950">
                    {plan.price}
                  </p>
                  <p className="pb-2 text-sm text-slate-500">{plan.cadence}</p>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm text-slate-600">
                      ✓ {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`mt-8 flex rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                    isRecommended
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="w-full">Start free</span>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}