import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const updatedDate = "July 2026";

const sections = [
  {
    title: "1. Agreement to these terms",
    body: [
      "These Terms of Service govern your access to and use of AuditFlow. By creating an account, starting a subscription, inviting a client, generating a report, or otherwise using AuditFlow, you agree to these terms.",
      "If you use AuditFlow on behalf of a company, agency, client, or other organization, you represent that you have authority to accept these terms for that organization.",
    ],
  },
  {
    title: "2. The AuditFlow service",
    body: [
      "AuditFlow helps UX professionals, product teams, consultants, and agencies manage audit work. The product may include client records, projects, journeys, findings, evidence uploads, annotations, recommendation libraries, frameworks, client portal feedback, report previews, and PDF exports.",
      "We may improve, modify, add, or remove features over time. Some features may be available only on certain plans or during beta periods.",
    ],
  },
  {
    title: "3. Accounts and security",
    body: [
      "You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You agree to provide accurate account information and keep it up to date.",
      "You must not share credentials, attempt to access another user workspace, bypass authentication, misuse client portal links, interfere with the service, or use AuditFlow for unlawful activity.",
    ],
  },
  {
    title: "4. Your content",
    body: [
      "You retain ownership of the audit content you upload or create in AuditFlow, including client information, screenshots, findings, annotations, recommendations, comments, and reports.",
      "You grant AuditFlow a limited license to host, store, process, display, copy, transmit, and format your content only as needed to provide, secure, support, and improve the service.",
      "You are responsible for making sure you have the rights and permissions needed to upload, store, annotate, share, and export any client materials or website screenshots that you place in AuditFlow.",
    ],
  },
  {
    title: "5. Client portals and sharing",
    body: [
      "AuditFlow may allow you to share project information, findings, evidence, reports, or comment areas with clients through portal links or access controls. You are responsible for deciding who receives access and for removing access when it is no longer appropriate.",
      "Client comments, feedback, and uploaded or entered information may be visible to users who have access to the related project or portal area.",
    ],
  },
  {
    title: "6. Billing and subscriptions",
    body: [
      "Paid plans, subscriptions, invoices, and payment methods are processed through Stripe. By subscribing to a paid plan, you authorize recurring charges according to the plan, billing cycle, and price shown at checkout or in your billing settings.",
      "You can cancel or manage your subscription through the billing area when available. Unless otherwise stated, fees already paid are non-refundable except where required by law or expressly agreed by AuditFlow.",
      "AuditFlow may change plan features or pricing in the future. If a change affects an active paid subscription, we will provide notice where required or appropriate.",
    ],
  },
  {
    title: "7. Acceptable use",
    body: [
      "You agree not to upload malicious code, infringe third-party rights, use AuditFlow to harass or harm others, probe or attack the service, overload infrastructure, scrape the product, resell access without permission, or attempt to reverse engineer non-public parts of AuditFlow.",
      "We may suspend or terminate access if we believe your use creates security risk, legal exposure, payment issues, product abuse, or harm to AuditFlow, customers, or third parties.",
    ],
  },
  {
    title: "8. Third-party services",
    body: [
      "AuditFlow uses service providers to operate the product, including Supabase for authentication, database, and storage; Vercel for hosting and deployment; Stripe for payments and billing; and Postmark for transactional email delivery. Your use of AuditFlow may also be subject to those providers policies where applicable.",
    ],
  },
  {
    title: "9. Availability and beta features",
    body: [
      "AuditFlow is provided on an as-available basis. We aim to provide a reliable service, but we do not guarantee uninterrupted availability, perfect accuracy, error-free reports, or that every feature will meet every customer requirement.",
      "Beta, preview, or experimental features may change, break, or be discontinued at any time.",
    ],
  },
  {
    title: "10. Disclaimers and limitation of liability",
    body: [
      "To the fullest extent permitted by law, AuditFlow is provided without warranties of any kind, whether express, implied, statutory, or otherwise, including warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      "To the fullest extent permitted by law, AuditFlow will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost revenue, lost data, business interruption, or reputational harm arising from or related to your use of the service.",
    ],
  },
  {
    title: "11. Termination",
    body: [
      "You may stop using AuditFlow at any time. We may suspend or terminate access if you violate these terms, fail to pay required fees, create security risk, or use AuditFlow in a way that may harm the product, customers, or third parties.",
      "After termination, we may retain certain information as described in the Privacy Policy or as required for legal, tax, billing, security, backup, or legitimate business reasons.",
    ],
  },
  {
    title: "12. Changes to these terms",
    body: [
      "We may update these terms as AuditFlow changes. The updated date above shows when this page was last revised. Continued use of AuditFlow after changes become effective means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Terms of Service</h1>
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
