import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, ExternalLink, FileText } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

type Section = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  callout?: string;
  exampleReport?: boolean;
};

type Guide = {
  title: string;
  description: string;
  category: string;
  intro: string;
  sections: Section[];
};

const guides: Record<string, Guide> = {
  "what-is-a-ux-audit": {
    title: "What Is a UX Audit?",
    description: "Learn what a UX audit evaluates, when to conduct one, and what a useful audit should deliver.",
    category: "Fundamentals",
    intro: "A UX audit is a structured evaluation of a digital product that identifies usability problems, explains their impact, and recommends practical improvements.",
    sections: [
      {
        heading: "What a UX audit evaluates",
        paragraphs: [
          "A strong audit looks beyond visual polish. It examines whether people can understand the product, complete important tasks, recover from mistakes, and feel confident while using it.",
        ],
        bullets: [
          "Navigation and information architecture",
          "First-run experience and onboarding",
          "Content clarity and terminology",
          "Interaction patterns and feedback",
          "Accessibility and inclusive design",
          "Trust, credibility, and conversion friction",
        ],
      },
      {
        heading: "When to conduct one",
        paragraphs: [
          "Audits are especially useful before a launch, redesign, or major feature release. They can also help explain low conversion, weak activation, support volume, or recurring user confusion.",
        ],
      },
      {
        heading: "What the deliverable should include",
        paragraphs: [
          "The final report should help a team decide what to fix next. Every finding should identify where the issue appears, what is wrong, why it matters, how to improve it, and how urgently it should be addressed.",
        ],
        callout: "A useful audit does not say “improve the UX.” It gives the team a clear, implementable next step.",
      },
      {
        heading: "See a Real UX Audit Report",
        paragraphs: [
          "Reading about UX audits is helpful—but seeing a real report makes everything click.",
          "This example was created for a fictional ecommerce checkout experience. It shows how findings, evidence, journey analysis, prioritization, and recommendations can be organized into a polished stakeholder-ready report.",
        ],
        exampleReport: true,
      },
      {
        heading: "Common UX audit mistakes",
        paragraphs:["Many audits stop at identifying problems. Great audits explain why each issue matters and provide recommendations that a product team can act on immediately."],
        bullets:["Avoid vague findings","Include annotated evidence","Prioritize by user impact","Focus on critical user journeys first"]
      },
      {
        heading:"Frequently asked questions",
        paragraphs:["How long does a UX audit take? The answer depends on scope, but most audits range from a few hours for a landing page to several days for complex products.","Should every issue be fixed before launch? No. Prioritize issues that create friction in key journeys or block business goals."]
      },
    ],
  },
  "ux-audit-process": {
    title: "The UX Audit Process",
    description: "A practical, step-by-step overview of planning an audit, reviewing flows, and documenting findings.",
    category: "Getting started",
    intro: "A repeatable process keeps an audit focused, reduces missed issues, and makes the final recommendations easier to defend.",
    sections: [
      {
        heading: "1. Define the scope",
        paragraphs: ["Clarify the product areas, user types, devices, and business goals included in the review. A narrow, explicit scope produces more useful findings than an unfocused review of everything."],
      },
      {
        heading: "2. Identify critical journeys",
        paragraphs: ["List the tasks that matter most, such as registration, first-use setup, search, checkout, sharing, or account management. Review each journey from the user’s perspective."],
      },
      {
        heading: "3. Evaluate the experience",
        bullets: [
          "Walk through each journey as a first-time user",
          "Apply relevant usability heuristics",
          "Review labels, hierarchy, feedback, and error handling",
          "Check responsive behavior and accessibility basics",
        ],
      },
      {
        heading: "4. Capture evidence",
        paragraphs: ["Record screenshots, locations, steps, and context as soon as you find an issue. Evidence should make the problem understandable without requiring the reader to recreate the entire journey."],
      },
      {
        heading: "5. Write and prioritize findings",
        paragraphs: ["Explain the user impact, recommend a specific change, and assign severity consistently. Group related issues so the report does not overwhelm stakeholders with duplicates."],
      },
      {
        heading: "6. Summarize the next steps",
        paragraphs: ["End with the most important themes, quick wins, and launch-critical issues. A prioritized roadmap is often more valuable than a long list of disconnected observations."],
      },
    ],
  },
  "ux-audit-checklist": {
    title: "UX Audit Checklist",
    description: "Use a repeatable checklist to review navigation, content, interaction patterns, accessibility, and trust.",
    category: "Resources",
    intro: "Use this checklist as a starting point, then adapt it to the product, audience, and journeys included in your audit.",
    sections: [
      { heading: "Clarity", bullets: ["The product purpose is immediately understandable", "Labels use familiar, specific language", "Primary actions are visually clear", "Instructions appear before users need them"] },
      { heading: "Navigation and structure", bullets: ["Users can predict where links will lead", "Current location is visible", "Related content is grouped logically", "Important destinations do not require unnecessary steps"] },
      { heading: "Interactions", bullets: ["Controls look interactive", "Actions provide immediate feedback", "Loading, empty, success, and error states are handled", "Destructive actions include appropriate safeguards"] },
      { heading: "Forms and input", bullets: ["Only necessary information is requested", "Field labels and formats are clear", "Errors explain what happened and how to fix it", "Entered data is preserved when errors occur"] },
      { heading: "Accessibility", bullets: ["Text has sufficient contrast", "Keyboard navigation is usable", "Focus states are visible", "Images and icons have meaningful alternatives", "Content does not rely on color alone"] },
      { heading: "Trust and confidence", bullets: ["Pricing and commitments are clear", "Privacy and security claims are understandable", "Users can review or undo important actions", "Contact and support options are easy to find"] },
    ],
  },
  "write-better-ux-findings": {
    title: "How to Write Better UX Findings",
    description: "Turn observations into specific findings with clear user impact and actionable recommendations.",
    category: "Reporting",
    intro: "A good finding connects an observable interface problem to a user consequence and a realistic recommendation.",
    sections: [
      {
        heading: "Use a consistent structure",
        bullets: ["Where: identify the screen, section, or step", "Issue: describe the observable problem", "Impact: explain the likely user consequence", "Recommendation: provide a specific improvement", "Priority: indicate urgency using a consistent scale"],
      },
      {
        heading: "Describe the problem, not your preference",
        paragraphs: ["Avoid presenting personal taste as evidence. Instead of saying a design feels dated, explain how weak hierarchy, unclear labels, or insufficient feedback makes a task harder."],
      },
      {
        heading: "Make recommendations implementable",
        paragraphs: ["Recommendations should be precise enough to act on while leaving room for design exploration. Name the element, desired change, and intended outcome."],
        callout: "Weak: “Make onboarding clearer.” Better: “Replace the empty dashboard with a three-step setup checklist that starts with creating the first project.”",
      },
      {
        heading: "Keep one main issue per finding",
        paragraphs: ["Combining several unrelated problems makes prioritization and implementation difficult. Split findings when they have different causes, impacts, or owners."],
      },
    ],
  },
  "prioritize-ux-issues": {
    title: "How to Prioritize UX Issues",
    description: "Learn how severity, frequency, user impact, and implementation effort can guide prioritization.",
    category: "Reporting",
    intro: "Prioritization helps teams distinguish launch blockers from small refinements and prevents every finding from appearing equally urgent.",
    sections: [
      { heading: "Evaluate user impact", bullets: ["Does the issue prevent task completion?", "Can users recover without help?", "Does it affect trust, safety, or sensitive data?", "How important is the affected journey?"] },
      { heading: "Consider frequency and reach", paragraphs: ["An issue that affects nearly every new user may deserve more attention than a severe edge case. Estimate how often the problem occurs and how many users are exposed to it."] },
      { heading: "Use clear severity definitions", bullets: ["Critical: blocks an essential task, creates serious risk, or is likely to cause abandonment", "Medium: creates meaningful friction, confusion, or delay but has a workaround", "Minor: causes small inefficiency, inconsistency, or polish concerns without blocking progress"] },
      { heading: "Separate severity from effort", paragraphs: ["Severity describes the user problem, not how difficult it is to fix. After severity is assigned, compare implementation effort to identify quick wins and longer-term investments."] },
      { heading: "Create a practical roadmap", bullets: ["Fix launch-critical issues first", "Bundle related findings", "Prioritize high-impact, low-effort improvements", "Validate larger changes before investing heavily"] },
    ],
  },
  "heuristic-evaluation": {
    title: "Heuristic Evaluation Explained",
    description: "Understand heuristic evaluation and how to apply usability principles without producing generic feedback.",
    category: "Methods",
    intro: "A heuristic evaluation reviews an interface against established usability principles to identify likely sources of confusion and friction.",
    sections: [
      { heading: "What heuristics are", paragraphs: ["Heuristics are broad usability principles rather than rigid rules. They help evaluators ask consistent questions about feedback, language, control, error prevention, recognition, efficiency, and clarity."] },
      { heading: "How to conduct the review", bullets: ["Choose the journeys and screens in scope", "Complete an initial pass without stopping to document every detail", "Complete a second pass using each heuristic as a lens", "Capture evidence and consolidate overlapping findings", "Assign severity based on real user impact"] },
      { heading: "Common principles to examine", bullets: ["Visibility of system status", "Match between the product and the real world", "User control and freedom", "Consistency and standards", "Error prevention and recovery", "Recognition rather than recall", "Efficiency and flexibility", "Clear, focused presentation"] },
      { heading: "Avoid generic conclusions", paragraphs: ["Do not list a violated heuristic without explaining the actual interface problem. The principle supports the finding; it is not the finding itself."], callout: "Instead of “violates consistency,” identify which control behaves differently, where the expected pattern appears elsewhere, and how the inconsistency affects users." },
      { heading: "Know the limitations", paragraphs: ["Heuristic evaluation predicts usability issues, but it does not replace research with real users. Pair it with analytics, support feedback, interviews, or usability testing when possible."] },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) return {};
  return {
    title: `${guide.title} | UX Audit Academy`,
    description: guide.description,
    alternates: { canonical: `https://auditflowapp.co/academy/${slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) notFound();

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <BrandLogo />
        <Link href="/academy#guides" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:px-4">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Academy
        </Link>
      </header>

      <article>
        <header className="border-y border-slate-100 bg-slate-50/70">
          <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">{guide.category}</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] text-slate-950 sm:text-6xl">{guide.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{guide.intro}</p>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14">
          <div className="space-y-10">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-5 text-base leading-8 text-slate-600">{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="mt-5 space-y-3">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-base leading-7 text-slate-600">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.callout && (
                  <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-6 text-base leading-7 text-slate-700">{section.callout}</div>
                )}
                {section.exampleReport && (
                  <div className="mt-8 space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ["Executive Summary", "A concise overview of findings, severity, and priority actions."],
                        ["Scope & Methodology", "What was reviewed and the evaluation lens used during the audit."],
                        ["Findings", "Clear observations, impact, recommendations, priority, and supporting evidence."],
                        ["Journey Analysis", "A view of where usability issues cluster across important user flows."],
                        ["Prioritization", "A practical ranking based on user impact and implementation effort."],
                        ["Recommendations", "Concrete product actions that teams can move into planning and delivery."],
                      ].map(([title, description]) => (
                        <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <FileText className="h-5 w-5 text-violet-600" aria-hidden="true" />
                          <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">Preview the report</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Review the complete example directly on the page, or open and download the PDF below.
                      </p>

                      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                        <iframe
                          src="/academy/examples/nova-commerce-checkout-audit.pdf#view=FitH"
                          title="Nova Commerce checkout UX audit example"
                          className="h-[620px] w-full"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/academy/examples/nova-commerce-checkout-audit.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                      >
                        View full report <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <a
                        href="/academy/examples/nova-commerce-checkout-audit.pdf"
                        download
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Download example <Download className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6 sm:p-7">
                      <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">This report was generated using AuditFlow.</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                        Capture evidence, organize findings, prioritize usability issues, and generate polished reports without spending hours formatting documents.
                      </p>
                      <Link href="/signup" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800">
                        Try AuditFlow free <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] bg-slate-950 px-7 py-10 text-white sm:px-10">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Put the process into practice.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">AuditFlow keeps evidence, findings, recommendations, priorities, and reports connected in one workspace.</p>
            <Link href="/signup" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700">
              Start free <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <Link href="/academy#guides" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to all guides
          </Link>
        </div>
      </article>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AuditFlow. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="font-medium hover:text-violet-600">Terms of Service</Link>
            <Link href="/privacy" className="font-medium hover:text-violet-600">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}