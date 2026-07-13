import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const updatedDate = "July 13, 2026";

const sections = [
  {
    title: "1. Overview",
    body: [
      "AuditFlow is a workspace for UX audits, product reviews, findings, evidence, client feedback, recommendations, and report generation. This Privacy Policy explains what information we collect, how we use it, and the choices available to you when you use AuditFlow.",
      "By using AuditFlow, you acknowledge that your workspace may include client names, website URLs, screenshots, audit findings, notes, annotations, reports, and comments that you choose to upload or create in the product.",
    ],
  },
  {
    title: "2. Information we collect",
    body: [
      "Account information: name, email address, login details, authentication events, account settings, subscription status, and related account metadata.",
      "Workspace content: clients, projects, websites, audit types, findings, journeys, steps, recommendations, framework items, evidence files, image annotations, report settings, exported report content, and client portal comments.",
      "Billing information: subscription plan, billing status, payment method details, invoices, receipts, and tax-related billing details. Payments are processed by Stripe. AuditFlow does not store full credit card numbers on its own servers.",
      "Technical information: device and browser details, IP address, pages visited, features used, product interaction events, session diagnostics, error logs, security events, and performance information used to operate, secure, troubleshoot, and improve AuditFlow.",
    ],
  },
  {
    title: "3. How we use information",
    body: [
      "We use information to create and manage accounts, authenticate users, provide the AuditFlow workspace, save audit content, generate previews and PDF reports, support client portal access, process billing, troubleshoot bugs, improve reliability, prevent abuse, and communicate service-related updates.",
      "We may also use aggregated or de-identified information to understand product usage and improve AuditFlow. We do not use your private client workspaces to sell advertising.",
    ],
  },
  {
    title: "4. Service providers",
    body: [
      "AuditFlow relies on third-party service providers to operate the product. Supabase provides authentication, database services, and file storage. Vercel provides hosting and deployment infrastructure. Stripe provides payment processing, subscriptions, invoices, and billing-related services. Postmark provides transactional email delivery for account emails, password resets, billing-related messages, and client portal notifications.",
      "These providers may process information only as needed to provide their services to AuditFlow and are subject to their own security, privacy, and compliance practices. Postmark may process email addresses, message content, delivery status, and limited email metadata so that AuditFlow can send transactional and notification emails. PostHog provides product analytics and session replay to help us understand how AuditFlow is used, diagnose issues, and improve the product. PostHog may collect information such as pages visited, feature usage, browser and device information, and session diagnostics. Where enabled, session replay recordings are used to improve usability and troubleshoot technical issues. We configure PostHog to avoid capturing sensitive information such as passwords and take reasonable steps to limit the collection of confidential customer data.",
    ],
  },
  {
    title: "5. Customer content and client data",
    body: [
      "You are responsible for the client materials and screenshots you upload to AuditFlow. You should only upload content that you have permission to store, review, annotate, and include in reports.",
      "If you invite a client or share a client portal link, you are responsible for making sure the link is shared only with appropriate reviewers. Client portal comments and feedback may become part of your project record.",
    ],
  },
  {
    title: "6. Data sharing",
    body: [
      "We do not sell personal information. We may share information with service providers that help us operate AuditFlow, comply with legal obligations, enforce our terms, protect the product, investigate abuse, process payments, or complete a business transaction such as a merger, acquisition, or sale of assets.",
    ],
  },
  {
    title: "7. Data retention and deletion",
    body: [
      "We keep account information and workspace content for as long as needed to provide AuditFlow, comply with legal or billing obligations, resolve disputes, maintain security, and support backups. If you delete content from your workspace, it may take a reasonable period of time for copies to be removed from backups or logs.",
      "You may request access, correction, export, or deletion of your account information using the contact method provided in AuditFlow or on the AuditFlow website. Some information may be retained where required for tax, security, legal, fraud prevention, or legitimate business reasons.",
    ],
  },
  {
    title: "8. Security",
    body: [
      "We use reasonable administrative, technical, and organizational safeguards designed to protect information in AuditFlow. However, no online service can guarantee complete security. You are responsible for using a strong password, protecting your account credentials, and controlling who can access your client portal links.",
    ],
  },
  {
    title: "9. International use",
    body: [
      "AuditFlow and its providers may process information in the United States and other locations where our service providers operate. By using AuditFlow, you understand that information may be processed outside your state, province, or country.",
    ],
  },
  {
    title: "10. Changes to this policy",
    body: [
      "We may update this Privacy Policy as AuditFlow changes. The updated date above shows when this page was last revised. Continued use of AuditFlow after an update means you acknowledge the revised policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F1F5F9] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <BrandLogo />
          <Link href="/" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Back to home
          </Link>
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">AuditFlow</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {updatedDate}</p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-semibold text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
