import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  FileText,
  Gauge,
  Layers3,
  Search,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "UX Audit Academy",
  description:
    "Free guides, templates, examples, and practical advice for conducting clearer, more effective UX audits.",
  alternates: {
    canonical: "https://auditflowapp.co/academy",
  },
};

const guides = [
  {
    title: "What Is a UX Audit?",
    description:
      "Learn what a UX audit evaluates, when to conduct one, and what a useful audit should deliver.",
    category: "Fundamentals",
    icon: BookOpen,
    href: "/academy/what-is-a-ux-audit",
  },
  {
    title: "The UX Audit Process",
    description:
      "A practical, step-by-step overview of planning an audit, reviewing flows, and documenting findings.",
    category: "Getting started",
    icon: Layers3,
    href: "/academy/ux-audit-process",
  },
  {
    title: "UX Audit Checklist",
    description:
      "Use a repeatable checklist to review navigation, content, interaction patterns, accessibility, and trust.",
    category: "Resources",
    icon: CheckSquare,
    href: "/academy/ux-audit-checklist",
  },
  {
    title: "How to Write Better UX Findings",
    description:
      "Turn observations into specific findings with clear user impact and actionable recommendations.",
    category: "Reporting",
    icon: FileText,
    href: "/academy/write-better-ux-findings",
  },
  {
    title: "How to Prioritize UX Issues",
    description:
      "Learn how severity, frequency, user impact, and implementation effort can guide prioritization.",
    category: "Reporting",
    icon: Gauge,
    href: "/academy/prioritize-ux-issues",
  },
  {
    title: "Heuristic Evaluation Explained",
    description:
      "Understand heuristic evaluation and how to apply usability principles without producing generic feedback.",
    category: "Methods",
    icon: Search,
    href: "/academy/heuristic-evaluation",
  },
];

const learningPath = [
  "Understand the purpose and scope of a UX audit",
  "Choose the right evaluation methods",
  "Capture evidence and write actionable findings",
  "Assign severity and prioritize recommendations",
  "Create a clear, stakeholder-ready report",
];

export default function AcademyPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <BrandLogo />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:px-4"
          >
            Back to AuditFlow
          </Link>
          <Link
            href="/signup"
            className="whitespace-nowrap rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-700 sm:px-4"
          >
            Start free
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-y border-slate-100 bg-slate-50/70">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="mx-auto max-w-7xl px-6 py-14 text-center sm:px-8 sm:py-20">
          <p className="mx-auto inline-flex rounded-full border border-violet-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            UX Audit Academy
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-6xl">
            Learn how to conduct better UX audits.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Practical guides, templates, examples, and best practices for UX designers, researchers, freelancers, and agencies.
          </p>
          <a
            href="#guides"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
          >
            Browse guides
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="guides" className="mx-auto max-w-7xl scroll-mt-6 px-6 py-10 sm:px-8 sm:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            Featured guides
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Build a stronger audit practice.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Start with the fundamentals, then work through research methods, finding documentation, prioritization, and reporting.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.title}
                href={guide.href}
                className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                  {guide.category}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                  {guide.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {guide.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600">
                  Read guide
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 sm:pb-20">
        <div className="grid gap-8 rounded-[2rem] border border-violet-100 bg-violet-50 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              Learning path
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              From first review to final report.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              The Academy is being built as a practical curriculum you can follow in order or use as a reference during client work.
            </p>
          </div>

          <ol className="space-y-3">
            {learningPath.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <span className="font-semibold text-violet-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8">
        <div className="rounded-[2rem] bg-slate-950 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Put the process into practice.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
            AuditFlow keeps findings, evidence, recommendations, prioritization, and reports connected in one workspace.
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
