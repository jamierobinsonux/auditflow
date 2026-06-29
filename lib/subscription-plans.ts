export const subscriptionPlans = [
  {
    id: "Free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description:
      "For trying AuditFlow with small UX audits before upgrading to a professional workflow.",
    limits: {
      projects: 3,
      findings: 25,
      publicReports: false,
      teamMembers: 1,
    },
    features: [
      "3 audit projects",
      "25 total findings",
      "Evidence uploads and journey maps",
      "Basic PDF exports with AuditFlow branding",
    ],
  },
  {
    id: "Pro",
    name: "Pro",
    price: "$19",
    cadence: "month",
    description:
      "For independent UX consultants who need polished reports and flexible audit workflows.",
    recommended: true,
    limits: {
      projects: null,
      findings: null,
      publicReports: true,
      teamMembers: 1,
    },
    features: [
      "Unlimited projects and findings",
      "Custom report branding",
      "Advanced report builder and templates",
      "Public report sharing",
      "Audit analytics and prioritization",
    ],
  },
  {
    id: "Studio",
    name: "Studio",
    price: "$49",
    cadence: "month",
    description:
      "For agencies and consultancies managing multiple clients, reusable frameworks, and branded deliverables.",
    limits: {
      projects: null,
      findings: null,
      publicReports: true,
      teamMembers: 5,
    },
    features: [
      "Everything in Pro",
      "Client workspaces and client-aware projects",
      "Client brand assets applied to reports",
      "Reusable Studio frameworks",
      "Recommendation library and report history",
    ],
  },
] as const;

export type PlanId = (typeof subscriptionPlans)[number]["id"];
export type SubscriptionPlan = (typeof subscriptionPlans)[number];
