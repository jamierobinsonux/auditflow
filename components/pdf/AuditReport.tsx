import { Document } from "@react-pdf/renderer";
import { createReportTheme } from "./theme";
import type {
  AuditReportProps,
  ReportOptions,
  ReportSectionId,
  ReportStats,
} from "./types";
import { CoverPage } from "./pages/CoverPage";
import { ContentsPage, type ContentsItem } from "./pages/ContentsPage";
import { ExecutiveSummaryPage } from "./pages/ExecutiveSummaryPage";
import { ScopePage } from "./pages/ScopePage";
import { RisksPage } from "./pages/RisksPage";
import { FindingsPage } from "./pages/FindingsPage";
import { JourneyAnalysisPage } from "./pages/JourneyAnalysisPage";
import { PrioritizationPage } from "./pages/PrioritizationPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { AppendixPage } from "./pages/AppendixPage";
import { ConclusionPage } from "./pages/ConclusionPage";

const SEVERITY_ORDER = [
  "P0",
  "P1",
  "P2",
  "P3",
  "critical",
  "high",
  "medium",
  "low",
];

const DEFAULT_SECTIONS: ReportSectionId[] = [
  "cover",
  "contents",
  "executive",
  "scope",
  "risks",
  "findings",
  "journeys",
  "prioritization",
  "recommendations",
  "appendix",
  "conclusion",
];

const TEMPLATE_SECTIONS: Record<string, ReportSectionId[]> = {
  professional: DEFAULT_SECTIONS,
  executive: [
    "cover",
    "contents",
    "executive",
    "scope",
    "risks",
    "prioritization",
    "recommendations",
    "conclusion",
  ],
  minimal: ["cover", "contents", "executive", "findings", "recommendations"],
  findings: ["cover", "contents", "findings", "prioritization", "recommendations"],
  evidence: ["cover", "contents", "findings", "appendix"],
  accessibility: [
    "cover",
    "contents",
    "executive",
    "scope",
    "findings",
    "prioritization",
    "recommendations",
    "appendix",
    "conclusion",
  ],
};

const SECTION_LABELS: Record<ReportSectionId, string> = {
  cover: "Cover",
  contents: "Contents",
  executive: "Executive Summary",
  scope: "Scope & Methodology",
  risks: "Top Risks",
  findings: "Findings",
  journeys: "Journey Analysis",
  prioritization: "Prioritization",
  recommendations: "Recommendations",
  appendix: "Evidence Appendix",
  conclusion: "Conclusion",
};

type NumberedSectionId = Exclude<ReportSectionId, "cover" | "contents">;

function isNumberedSection(section: ReportSectionId): section is NumberedSectionId {
  return section !== "cover" && section !== "contents";
}

function severityRank(value: unknown) {
  if (!value) return 99;

  const severity = String(value).toLowerCase();

  if (severity === "p0" || severity === "critical") return 0;
  if (severity === "p1" || severity === "high") return 1;
  if (severity === "p2" || severity === "medium") return 2;
  if (severity === "p3" || severity === "low") return 3;

  const index = SEVERITY_ORDER.map((item) => item.toLowerCase()).indexOf(severity);
  return index === -1 ? 99 : index;
}

function hasSeverity(
  finding: any,
  expected: "critical" | "high" | "medium" | "low"
) {
  const rank = severityRank(finding.severity);
  return (
    (expected === "critical" && rank === 0) ||
    (expected === "high" && rank === 1) ||
    (expected === "medium" && rank === 2) ||
    (expected === "low" && rank === 3)
  );
}

function resolveSections(options?: ReportOptions | null, hasEvidence = false) {
  const template = options?.template || "professional";
  const baseSections = options?.sections?.length
    ? options.sections
    : TEMPLATE_SECTIONS[String(template)] ?? DEFAULT_SECTIONS;

  const normalized = baseSections.filter((section): section is ReportSectionId =>
    DEFAULT_SECTIONS.includes(section as ReportSectionId)
  );

  const unique = Array.from(new Set(normalized));
  const sections = unique.length ? unique : DEFAULT_SECTIONS;

  if (!hasEvidence) {
    return sections.filter((section) => section !== "appendix");
  }

  return sections;
}

function createContentsItems(sections: ReportSectionId[]): ContentsItem[] {
  return sections.filter(isNumberedSection).map((section, index) => ({
    number: String(index + 1).padStart(2, "0"),
    title: SECTION_LABELS[section],
  }));
}

function getSectionNumber(sections: ReportSectionId[], section: ReportSectionId) {
  if (!isNumberedSection(section)) return "";
  const contentSections = sections.filter(isNumberedSection);
  const index = contentSections.indexOf(section);
  return index >= 0 ? String(index + 1).padStart(2, "0") : "";
}

function calculateUxScore(stats: Omit<ReportStats, "uxScore">) {
  const penalty = stats.critical * 18 + stats.high * 10 + stats.medium * 5 + stats.low * 2;
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function AuditReport({
  project,
  findings,
  journeys,
  steps,
  images,
  annotations,
  branding,
  isPro,
  options,
}: AuditReportProps) {
  const safeFindings = findings ?? [];
  const safeJourneys = journeys ?? [];
  const safeSteps = steps ?? [];
  const safeImages = images ?? [];
  const safeAnnotations = annotations ?? [];

  const theme = createReportTheme({ branding, isPro });
  const sections = resolveSections(options, safeImages.length > 0);
  const contentsItems = createContentsItems(sections);

  const sortedFindings = [...safeFindings].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity)
  );

  const baseStats = {
    totalFindings: safeFindings.length,
    critical: safeFindings.filter((finding) => hasSeverity(finding, "critical")).length,
    high: safeFindings.filter((finding) => hasSeverity(finding, "high")).length,
    medium: safeFindings.filter((finding) => hasSeverity(finding, "medium")).length,
    low: safeFindings.filter((finding) => hasSeverity(finding, "low")).length,
    quickWins: safeFindings.filter(
      (finding) =>
        String(finding.impact || "").toLowerCase() === "high" &&
        String(finding.effort || "").toLowerCase() === "low"
    ).length,
    journeys: safeJourneys.length,
    evidence: safeImages.length,
  };

  const stats: ReportStats = {
    ...baseStats,
    uxScore: calculateUxScore(baseStats),
  };

  const reportTitle = options?.title?.trim() || `${project.name || "UX Audit"} Report`;

  return (
    <Document
      title={reportTitle}
      author={theme.preparedBy}
      subject="UX audit report"
      creator="AuditFlow"
      producer="AuditFlow"
    >
      {sections.includes("cover") && <CoverPage project={project} theme={theme} />}
      {sections.includes("contents") && <ContentsPage theme={theme} items={contentsItems} />}
      {sections.includes("executive") && (
        <ExecutiveSummaryPage
          project={project}
          findings={sortedFindings}
          stats={stats}
          theme={theme}
          sectionNumber={getSectionNumber(sections, "executive")}
        />
      )}
      {sections.includes("scope") && (
        <ScopePage
          project={project}
          theme={theme}
          sectionNumber={getSectionNumber(sections, "scope")}
        />
      )}
      {sections.includes("risks") && (
        <RisksPage
          findings={sortedFindings}
          journeys={safeJourneys}
          theme={theme}
          sectionNumber={getSectionNumber(sections, "risks")}
        />
      )}
      {sections.includes("findings") && (
        <FindingsPage
          findings={sortedFindings}
          journeys={safeJourneys}
          images={safeImages}
          annotations={safeAnnotations}
          theme={theme}
          sectionNumber={getSectionNumber(sections, "findings")}
        />
      )}
      {sections.includes("journeys") && (
        <JourneyAnalysisPage
          journeys={safeJourneys}
          steps={safeSteps}
          findings={safeFindings}
          theme={theme}
          sectionNumber={getSectionNumber(sections, "journeys")}
        />
      )}
      {sections.includes("prioritization") && (
        <PrioritizationPage
          findings={sortedFindings}
          theme={theme}
          sectionNumber={getSectionNumber(sections, "prioritization")}
        />
      )}
      {sections.includes("recommendations") && (
        <RecommendationsPage
          findings={sortedFindings}
          theme={theme}
          sectionNumber={getSectionNumber(sections, "recommendations")}
        />
      )}
      {sections.includes("appendix") && safeImages.length > 0 && (
        <AppendixPage
          images={safeImages}
          findings={safeFindings}
          annotations={safeAnnotations}
          theme={theme}
          sectionNumber={getSectionNumber(sections, "appendix")}
        />
      )}
      {sections.includes("conclusion") && (
        <ConclusionPage
          theme={theme}
          sectionNumber={getSectionNumber(sections, "conclusion")}
        />
      )}
    </Document>
  );
}
