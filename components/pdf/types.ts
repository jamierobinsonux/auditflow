import type { ReportBranding as SharedReportBranding } from "@/lib/report-branding";

export type ReportBranding = SharedReportBranding;

export type ReportSectionId =
  | "cover"
  | "contents"
  | "executive"
  | "scope"
  | "risks"
  | "findings"
  | "journeys"
  | "prioritization"
  | "recommendations"
  | "appendix"
  | "conclusion";

export type ReportTemplateId =
  | "professional"
  | "executive"
  | "minimal"
  | "findings"
  | "evidence"
  | "accessibility";

export type ReportOptions = {
  title?: string | null;
  template?: ReportTemplateId | string | null;
  sections?: ReportSectionId[] | string[] | null;
};

export type AuditReportProps = {
  project: any;
  findings?: any[] | null;
  journeys?: any[] | null;
  steps?: any[] | null;
  images?: any[] | null;
  annotations?: any[] | null;
  branding?: ReportBranding | null;
  isPro?: boolean;
  options?: ReportOptions | null;
};

export type ReportStats = {
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  quickWins: number;
  journeys: number;
  evidence: number;
  uxScore: number;
};
