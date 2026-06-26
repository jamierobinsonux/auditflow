export type AuditFramework = {
  id: string;
  name: string;
  category: string;
  description: string;
  auditType: string;
  journeys: {
    name: string;
    description: string;
    steps: string[];
  }[];
};

export const auditFrameworks: AuditFramework[] = [
  {
    id: "saas-onboarding",
    name: "SaaS Onboarding Audit",
    category: "SaaS",
    auditType: "SaaS",
    description:
      "Review signup, onboarding, activation, empty states, and first-value moments.",
    journeys: [
      {
        name: "Landing Page",
        description: "Evaluate clarity, trust, CTA hierarchy, and conversion path.",
        steps: ["Hero Section", "Value Proposition", "Primary CTA", "Social Proof", "Footer"],
      },
      {
        name: "Signup Flow",
        description: "Review form friction, account creation, and validation states.",
        steps: ["Account Creation", "Form Fields", "Error States", "Password Requirements"],
      },
      {
        name: "Onboarding",
        description: "Evaluate guidance, setup steps, and time to first value.",
        steps: ["Welcome Screen", "Product Setup", "Guided Tour", "First Success Moment"],
      },
      {
        name: "First Dashboard Experience",
        description: "Review empty states, hierarchy, and next-step guidance.",
        steps: ["Empty State", "Navigation", "Key Metrics", "Next Best Action"],
      },
    ],
  },
  {
    id: "mobile-app",
    name: "Mobile App Audit",
    category: "Mobile",
    auditType: "Mobile App",
    description:
      "Review first launch, permissions, navigation, key flows, and mobile usability.",
    journeys: [
      {
        name: "First Launch",
        description: "Evaluate first impression, permissions, and orientation.",
        steps: ["Splash / Welcome", "Permissions", "Account Prompt", "Initial Guidance"],
      },
      {
        name: "Core Navigation",
        description: "Review tab structure, discoverability, and wayfinding.",
        steps: ["Bottom Navigation", "Search", "Profile", "Settings"],
      },
      {
        name: "Primary Task Flow",
        description: "Evaluate the app’s main user task from start to completion.",
        steps: ["Entry Point", "Task Setup", "Review", "Completion"],
      },
    ],
  },
  {
    id: "ecommerce",
    name: "Ecommerce Audit",
    category: "Ecommerce",
    auditType: "Ecommerce",
    description:
      "Review product discovery, product pages, cart, checkout, and purchase confidence.",
    journeys: [
      {
        name: "Product Discovery",
        description: "Evaluate browsing, filtering, searching, and category navigation.",
        steps: ["Homepage", "Category Page", "Search", "Filters", "Sort"],
      },
      {
        name: "Product Detail Page",
        description: "Review product information, images, pricing, reviews, and CTA.",
        steps: ["Images", "Product Info", "Reviews", "Shipping Info", "Add to Cart"],
      },
      {
        name: "Checkout Flow",
        description: "Evaluate cart, payment, trust, and order completion.",
        steps: ["Cart", "Shipping", "Payment", "Review Order", "Confirmation"],
      },
    ],
  },
  {
    id: "accessibility",
    name: "Accessibility Audit",
    category: "Accessibility",
    auditType: "Accessibility",
    description:
      "Review accessibility fundamentals including keyboard, contrast, focus, labels, and structure.",
    journeys: [
      {
        name: "Keyboard Navigation",
        description: "Evaluate whether users can complete key tasks without a mouse.",
        steps: ["Tab Order", "Focus States", "Skip Links", "Keyboard Traps"],
      },
      {
        name: "Visual Accessibility",
        description: "Review contrast, sizing, spacing, and visual hierarchy.",
        steps: ["Color Contrast", "Text Size", "Icon Labels", "Error Visibility"],
      },
      {
        name: "Screen Reader Experience",
        description: "Review semantic structure, labels, and assistive technology support.",
        steps: ["Headings", "Form Labels", "Alt Text", "ARIA Usage"],
      },
    ],
  },
  {
    id: "dashboard",
    name: "Dashboard Audit",
    category: "Dashboard",
    auditType: "Dashboard",
    description:
      "Review information architecture, data hierarchy, filters, tables, charts, and workflows.",
    journeys: [
      {
        name: "Dashboard Overview",
        description: "Evaluate whether the dashboard communicates status and priority clearly.",
        steps: ["Summary Cards", "Charts", "Alerts", "Primary Actions"],
      },
      {
        name: "Data Exploration",
        description: "Review tables, filtering, sorting, and drill-down behavior.",
        steps: ["Tables", "Filters", "Search", "Drill Downs", "Export"],
      },
      {
        name: "Decision Support",
        description: "Evaluate whether users can understand what happened and what to do next.",
        steps: ["Insights", "Trends", "Recommendations", "Empty States"],
      },
    ],
  },
];