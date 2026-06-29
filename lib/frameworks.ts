import { auditFrameworks, type AuditFramework } from "@/lib/audit-frameworks";
import type { StudioFrameworkDetail } from "@/types/framework";

export type ResolvedFramework = {
  id: string;
  source: "built-in" | "studio";
  name: string;
  category: string;
  description: string;
  auditType: string;
  defaultReportTemplate?: string;
  categories: { name: string; description?: string | null }[];
  journeys: {
    name: string;
    description: string;
    steps: string[];
  }[];
  recommendations: {
    title: string;
    category?: string | null;
    recommendation: string;
    impact?: string | null;
  }[];
};

const builtInCategories: Record<string, string[]> = {
  "saas-onboarding": [
    "Activation",
    "Navigation",
    "Empty States",
    "Forms",
    "Trust",
  ],
  "mobile-app": [
    "Navigation",
    "Permissions",
    "Interaction Design",
    "Accessibility",
    "Performance",
  ],
  ecommerce: ["Discovery", "Product Detail", "Cart", "Checkout", "Trust"],
  accessibility: ["Keyboard", "Contrast", "Semantics", "Forms", "Screen Reader"],
  dashboard: ["Data Hierarchy", "Filtering", "Tables", "Charts", "Decision Support"],
};

export function getBuiltInFramework(id: string) {
  return auditFrameworks.find((framework) => framework.id === id) ?? null;
}

export function builtInToResolvedFramework(
  framework: AuditFramework
): ResolvedFramework {
  return {
    id: framework.id,
    source: "built-in",
    name: framework.name,
    category: framework.category,
    description: framework.description,
    auditType: framework.auditType,
    categories: (builtInCategories[framework.id] ?? []).map((name) => ({
      name,
    })),
    journeys: framework.journeys,
    recommendations: [],
  };
}

export function studioToResolvedFramework(
  framework: StudioFrameworkDetail
): ResolvedFramework {
  return {
    id: framework.id,
    source: "studio",
    name: framework.name,
    category: framework.category || "Custom",
    description: framework.description || "Custom Studio audit framework.",
    auditType: framework.audit_type || "Custom",
    defaultReportTemplate: framework.report_defaults?.template || "professional",
    categories: [...(framework.categories ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((category) => ({
        name: category.name,
      })),
    journeys: [...(framework.journey_stages ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((stage) => ({
        name: stage.name,
        description: stage.description || "",
        steps: stage.steps ?? [],
      })),
    recommendations: [...(framework.recommendations ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        title: item.title,
        category: item.category,
        recommendation: item.recommendation,
        impact: item.impact,
      })),
  };
}

export function getFrameworkSourceLabel(frameworkId: string) {
  return getBuiltInFramework(frameworkId) ? "Built-in" : "Studio";
}