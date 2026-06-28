import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LandingProductTour } from "@/components/landing-product-tour";
import { subscriptionPlans } from "@/lib/subscription-plans";

const workflow = [
  {
    title: "Capture",
    description: "Document issues with severity, status, impact, effort, and recommendation details.",
  },
  {
    title: "Connect",
    description: "Attach screenshots, captions, annotations, and journey context to every finding.",
  },
  {
    title: "Prioritize",
    description: "Understand top risks, quick wins, audit health, and what should be addressed first.",
  },
  {
    title: "Deliver",
    description: "Generate polished reports for stakeholders without rebuilding everything in slides.",
  },
];

const features = [
  {
    title: "Project workspace",
    description: "Keep each UX audit organized with project status, findings, journeys, and evidence in one place.",
  },
  {
    title: "Structured findings",
    description: "Capture severity, impact, effort, status, recommendations, and evidence with a repeatable format.",
  },
  {
    title: "Evidence uploads",
    description: "Add screenshots, captions, and annotation notes so stakeholders can see exactly what happened.",
  },
  {
    title: "Journey maps",
    description: "Map friction across onboarding, checkout, dashboards, mobile flows, and other user journeys.",
  },
  {
    title: "Audit analytics",
    description: "Track project health, finding volume, status, and priority patterns across your audit portfolio.",
  },
  {
    title: "Client-ready reports",
    description: "Export executive summaries, detailed findings, roadmaps, and evidence appendices when the audit is ready.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <BrandLogo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#tour" className="hover:text-slate-950">
            Product tour
          </a>
          <a href="#features" className="hover:text-slate-950">
            Features
          </a>
          <a href="#pricing" className="hover:text-slate-950">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-700"
          >
            Start free
          </Link>
        </div>
      </header>

      <section className="relative mx-auto flex max-w-7xl justify-center px-6 pb-14 pt-16 text-center sm:px-8 lg:pb-16 lg:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[520px] max-w-5xl rounded-full bg-violet-100/40 blur-3xl" />
        <div className="mx-auto max-w-4xl">
          <p className="mx-auto inline-flex rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            UX audit platform
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[64px]">
            Organize UX audits from insight to action.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Capture findings, connect evidence, map journeys, prioritize issues, and create stakeholder-ready reports from one focused workspace.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-violet-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
            >
              Start free
            </Link>

            <a
              href="#tour"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              See the workflow
            </a>
          </div>
        </div>

      </section>

      <LandingProductTour />

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              One connected workflow
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Replace scattered audit work with structure.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              AuditFlow brings findings, screenshots, journey notes, prioritization, and reporting into one workflow so teams can move from usability issues to product decisions faster.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item, index) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            Features
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Everything you need to run a professional UX audit.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-500">
              Before AuditFlow
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Audit work gets scattered.
            </h2>
            <ul className="mt-8 space-y-4 text-sm leading-6 text-slate-600">
              <li>• Findings live in spreadsheets.</li>
              <li>• Screenshots sit in random folders.</li>
              <li>• Journey notes are disconnected from evidence.</li>
              <li>• Reports are rebuilt manually in slides or docs.</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-violet-200 bg-violet-50 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              With AuditFlow
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Everything stays connected.
            </h2>
            <ul className="mt-8 space-y-4 text-sm leading-6 text-slate-700">
              <li>• Findings, evidence, and recommendations stay linked.</li>
              <li>• Screenshots include captions and annotations.</li>
              <li>• Journey maps explain where friction happens.</li>
              <li>• Reports export with structure, polish, and branding.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Simple pricing for audit work
          </h2>
          <p className="mt-4 text-base text-slate-600">
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
                className={`rounded-3xl border bg-white p-6 shadow-sm ${
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
                  {plan.cadence && plan.cadence !== "forever" && (
                    <p className="pb-2 text-sm text-slate-500">/{plan.cadence}</p>
                  )}
                </div>

                <Link
                  href="/signup"
                  className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                    isRecommended
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Get started
                </Link>

                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  {plan.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="rounded-[2rem] bg-slate-950 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Bring structure to your next UX audit.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
            Start with a project, capture findings, connect evidence, and export a report when your audit is ready.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Start free
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
