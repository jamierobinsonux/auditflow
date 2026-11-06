"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is AuditFlow?",
    answer:
      "AuditFlow is an all-in-one platform for UX designers, consultants, and agencies to manage usability audits, document findings, collaborate with clients, and generate professional reports.",
  },
  {
    question: "Who is AuditFlow for?",
    answer:
      "AuditFlow is built for UX designers, UX researchers, consultants, agencies, and product teams conducting website or application audits.",
  },
  {
    question: "Can I generate professional reports?",
    answer:
      "Yes. AuditFlow generates polished PDF reports complete with findings, evidence, annotations, recommendations, and executive summaries.",
  },
  {
    question: "Can clients review my work?",
    answer:
      "Yes. Share projects through a secure client portal where clients can review findings, download reports, and leave comments.",
  },
  {
    question: "Can I upload screenshots and evidence?",
    answer:
      "Absolutely. Upload screenshots, annotate images, and attach supporting evidence to every finding.",
  },
  {
    question: "Is my data secure?",
    answer:
      "AuditFlow uses secure authentication, encrypted connections, and trusted cloud infrastructure to help protect your data.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel your subscription at any time from the billing portal.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. AuditFlow is entirely web-based and works in your browser.",
  },
  {
    question: "Why not use spreadsheets or Notion?",
    answer:
      "While spreadsheets and note-taking tools can store audit information, AuditFlow is built specifically for UX audits. It keeps findings, evidence, annotations, journey maps, client feedback, and professional reports connected in one purpose-built workflow.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
          FAQ
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
          Questions before you get started?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
          Learn how AuditFlow helps you manage audits, collaborate with clients,
          and deliver polished reports.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={faq.question}
              className={index === 0 ? "" : "border-t border-slate-200"}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-slate-50 sm:px-7"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-base font-semibold text-slate-950">
                  {faq.question}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-violet-600" : ""
                  }`}
                />
              </button>

              <div
                id={`faq-answer-${index}`}
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-sm leading-7 text-slate-600 sm:px-7">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}