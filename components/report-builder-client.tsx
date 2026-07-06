"use client";

import { useMemo, useState } from "react";
import { Download, Eye, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout/card";

type ReportSectionId =
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

type ReportTemplateId =
  | "professional"
  | "executive"
  | "minimal"
  | "findings";

type ProjectSummary = {
  id: string;
  name: string;
  client_id?: string | null;
  client_name?: string | null;
  audit_type?: string | null;
  status?: string | null;
};

type ReportHistoryItem = {
  id: string;
  title?: string | null;
  template?: string | null;
  created_at?: string | null;
};

type ReportBuilderClientProps = {
  project: ProjectSummary;
  counts: {
    findings: number;
    journeys: number;
    evidence: number;
  };
  isProReport: boolean;
  isStudioReport?: boolean;
  brandingName?: string | null;
  clientBrandingName?: string | null;
  history?: ReportHistoryItem[];
};

const templates: {
  id: ReportTemplateId;
  name: string;
  description: string;
  sections: ReportSectionId[];
}[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Complete client-ready report with risks, findings, prioritization, recommendations, and appendix.",
    sections: ["cover", "contents", "executive", "scope", "risks", "findings", "journeys", "prioritization", "recommendations", "appendix", "conclusion"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Stakeholder version focused on summary, top risks, prioritization, and decisions.",
    sections: ["cover", "contents", "executive", "scope", "risks", "prioritization", "recommendations", "conclusion"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Lean report with only the essentials.",
    sections: ["cover", "contents", "executive", "findings", "recommendations"],
  },
  {
    id: "findings",
    name: "Findings Only",
    description: "Detailed findings, prioritization, and recommendations without broader report narrative.",
    sections: ["cover", "contents", "findings", "prioritization", "recommendations"],
  },
];

const sectionLabels: Record<ReportSectionId, string> = {
  cover: "Cover",
  contents: "Table of contents",
  executive: "Executive summary",
  scope: "Scope & methodology",
  risks: "Top risks",
  findings: "Audit findings",
  journeys: "Journey analysis",
  prioritization: "Prioritization",
  recommendations: "Recommendations",
  appendix: "Evidence appendix",
  conclusion: "Conclusion",
};

const allSections = Object.keys(sectionLabels) as ReportSectionId[];

function buildReportUrl(
  projectId: string,
  values: {
    title: string;
    template: string;
    sections: ReportSectionId[];
    mode: "preview" | "download";
    brandingMode?: "account" | "client";
  }
) {
  const params = new URLSearchParams();
  params.set("mode", values.mode);
  params.set("title", values.title);
  params.set("template", values.template);
  params.set("sections", values.sections.join(","));
  if (values.brandingMode) params.set("branding", values.brandingMode);
  return `/api/projects/${projectId}/report?${params.toString()}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function ReportBuilderClient({
  project,
  counts,
  isProReport,
  isStudioReport = false,
  brandingName,
  clientBrandingName,
  history = [],
}: ReportBuilderClientProps) {
  const [template, setTemplate] = useState<ReportTemplateId>("professional");
  const [title, setTitle] = useState(`${project.name} UX Audit Report`);
  const [sections, setSections] = useState<ReportSectionId[]>(templates[0].sections);
  const [isExporting, setIsExporting] = useState(false);
  const canUseClientBranding = Boolean(isStudioReport && project.client_id);
  const [brandingMode, setBrandingMode] = useState<"account" | "client">(
    canUseClientBranding ? "client" : "account"
  );

  const previewUrl = useMemo(
    () =>
      buildReportUrl(project.id, {
        title,
        template,
        sections,
        mode: "preview",
        brandingMode,
      }),
    [project.id, title, template, sections, brandingMode]
  );

  const downloadUrl = useMemo(
    () =>
      buildReportUrl(project.id, {
        title,
        template,
        sections,
        mode: "download",
        brandingMode,
      }),
    [project.id, title, template, sections, brandingMode]
  );

  function selectTemplate(nextTemplate: ReportTemplateId) {
    const option = templates.find((item) => item.id === nextTemplate) ?? templates[0];
    setTemplate(nextTemplate);
    setSections(option.sections);
  }

  function toggleSection(section: ReportSectionId) {
    setSections((current) => {
      if (current.includes(section)) {
        if (section === "cover") return current;
        return current.filter((item) => item !== section);
      }
      return allSections.filter((item) => [...current, section].includes(item));
    });
  }

  function exportPdf() {
    setIsExporting(true);
    window.location.href = downloadUrl;
    window.setTimeout(() => setIsExporting(false), 2500);
  }

  function previewPdf() {
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Report builder</p>
          <p className="mt-1 text-sm text-slate-500">
            Configure the report, preview it inline, or export a downloadable PDF.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={previewPdf}>
            <Eye className="h-4 w-4" />
            Preview PDF
          </Button>
          <Button type="button" onClick={exportPdf} disabled={isExporting}>
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">Report template</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Choose the structure that best fits the audience before exporting.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {templates.map((item) => {
                const isSelected = item.id === template;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTemplate(item.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                      <span className={`h-3 w-3 rounded-full border ${isSelected ? "border-violet-600 bg-violet-600" : "border-slate-300"}`} />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-950">Report details</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Configure the title and included sections for this export.
            </p>

            <label className="mt-5 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Report title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Included sections</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {allSections.map((section) => (
                  <label key={section} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={sections.includes(section)}
                      onChange={() => toggleSection(section)}
                      disabled={section === "cover"}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    {sectionLabels[section]}
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {isProReport && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-950">Branding</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Choose which branding should appear on this report.
              </p>

              <div className="mt-4 grid gap-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
                  <input
                    type="radio"
                    name="brandingMode"
                    value="account"
                    checked={brandingMode === "account"}
                    onChange={() => setBrandingMode("account")}
                    className="mt-0.5 h-4 w-4 border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">
                      Use my branding
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {brandingName || "Your account report branding"}
                    </span>
                  </span>
                </label>

                {canUseClientBranding && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
                    <input
                      type="radio"
                      name="brandingMode"
                      value="client"
                      checked={brandingMode === "client"}
                      onChange={() => setBrandingMode("client")}
                      className="mt-0.5 h-4 w-4 border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">
                        Use client branding
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {clientBrandingName || project.client_name || "Client brand assets"}
                      </span>
                    </span>
                  </label>
                )}
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-950">Audit snapshot</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Findings</dt><dd className="font-semibold text-slate-950">{counts.findings}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Journeys</dt><dd className="font-semibold text-slate-950">{counts.journeys}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Evidence items</dt><dd className="font-semibold text-slate-950">{counts.evidence}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Branding</dt><dd className="font-semibold text-slate-950">{isProReport ? (brandingMode === "client" ? clientBrandingName || project.client_name || "Client" : brandingName || "Custom") : "AuditFlow"}</dd></div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-950">Recent exports</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-500">Exported reports will appear here.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-medium text-slate-950">{item.title || "UX Audit Report"}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.template || "Professional"} · {formatDate(item.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
