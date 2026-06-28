import path from "path";
import type { ReportBranding } from "@/lib/report-branding";

export type ReportTheme = {
  brandName: string;
  logoSrc: string | null;
  primaryColor: string;
  footerText: string;
  preparedBy: string | null;
  showWatermark: boolean;
  isWhiteLabeled: boolean;
};

export function createReportTheme({
  branding,
  isPro,
}: {
  branding: ReportBranding | null;
  isPro: boolean;
}): ReportTheme {
  if (isPro && branding) {
    return {
      brandName: branding.company_name || "Client Report",
      logoSrc: branding.logo_url,
      primaryColor: branding.primary_color || "#7C3AED",
      footerText: branding.footer_text || "Confidential",
      preparedBy: branding.prepared_by || null,
      showWatermark: Boolean(branding.show_watermark),
      isWhiteLabeled: true,
    };
  }

  return {
    brandName: "AuditFlow",
    logoSrc: path.join(process.cwd(), "public", "AFLogo.png"),
    primaryColor: "#7C3AED",
    footerText: "Generated with AuditFlow",
    preparedBy: null,
    showWatermark: false,
    isWhiteLabeled: false,
  };
}
