export type PlanId = "Free" | "Pro" | "Studio";

export const subscriptionPlans = [
  {
    id: "Free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "For testing AuditFlow with small audits.",
    limits: {
      projects: 3,
      findings: 25,
      publicReports: false,
      teamMembers: 1,
    },
    features: [
      "3 projects",
      "25 findings",
      "Audit frameworks",
      "Screenshot annotations",
      "Basic PDF export",
    ],
  },
  {
    id: "Pro",
    name: "Pro",
    price: "$19",
    cadence: "per month",
    description: "For freelancers and solo UX consultants.",
    limits: {
      projects: null,
      findings: null,
      publicReports: true,
      teamMembers: 1,
    },
    features: [
      "Unlimited projects",
      "Unlimited findings",
      "Public report links",
      "Professional PDF exports",
      "Screenshot annotations",
      "Custom branding later",
    ],
    recommended: true,
  },
  {
    id: "Studio",
    name: "Studio",
    price: "$49",
    cadence: "per month",
    description: "For agencies and small teams.",
    limits: {
      projects: null,
      findings: null,
      publicReports: true,
      teamMembers: 5,
    },
    features: [
      "Everything in Pro",
      "Client management later",
      "Team members later",
      "Report versions later",
      "Priority support",
    ],
  },
] as const;