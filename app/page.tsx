import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { BarChart3, ClipboardCheck, FileText, GitBranch } from "lucide-react";
import { LandingProductTour } from "@/components/landing-product-tour";
import { LandingFAQ } from "@/components/landing-faq";
import { subscriptionPlans } from "@/lib/subscription-plans";

const workflow = [
  {
    title: "Capture",
    icon: ClipboardCheck,
    description: "Record findings with screenshots, severity, evidence, and recommendations.",
  },
  {
    title: "Connect",
    icon: GitBranch,
    description: "Organize findings by journey, client, project, and reusable framework.",
  },
  {
    title: "Prioritize",
    icon: BarChart3,
    description: "Use analytics and scoring to identify the highest-impact UX issues.",
  },
  {
    title: "Deliver",
    icon: FileText,
    description: "Export polished reports and keep every client audit organized.",
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
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:px-4"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="whitespace-nowrap rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-700 sm:px-4"
          >
            Start free
          </Link>
        </div>
      </header>

      <section className="relative mx-auto flex max-w-7xl justify-center px-4 pb-12 pt-12 text-center sm:px-8 lg:pb-16 lg:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[520px] max-w-5xl rounded-full bg-violet-100/40 blur-3xl" />
        <div className="mx-auto max-w-4xl">
          <p className="mx-auto inline-flex rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            UX audit platform
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[64px]">
            Organize UX audits from insight to action.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
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
              className="hidden rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
            >
              See the workflow
            </a>
          </div>
        </div>

      </section>

      <div className="hidden md:block">
        <LandingProductTour />
      </div>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            One connected workflow
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Replace scattered audit work with structure.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600">
            AuditFlow brings findings, screenshots, journey notes, prioritization, and reporting into one workflow so teams can move from usability issues to product decisions faster.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {workflow.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/70"
              >
                {index < workflow.length - 1 && (
                  <div className="pointer-events-none absolute left-[calc(100%+0.125rem)] top-1/2 z-10 hidden h-px w-5 -translate-y-1/2 bg-slate-200 lg:block" />
                )}

                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
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
            Pricing that scales from solo audits to studio work
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Start with the core audit workflow, then upgrade for branded reports, client workspaces, and reusable Studio systems.
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

      <LandingFAQ />

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="rounded-[2rem] bg-slate-950 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Run cleaner audits from the first finding to the final report.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
            Use AuditFlow to organize findings, evidence, journeys, frameworks, clients, and reports without stitching together spreadsheets and slide decks.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Start free
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AuditFlow. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <Link href="/terms" className="font-medium hover:text-violet-600">
              Terms of Service
            </Link>
            <Link href="/privacy" className="font-medium hover:text-violet-600">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
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