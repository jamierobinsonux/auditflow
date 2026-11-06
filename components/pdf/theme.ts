import path from "path";
import type { ReportBranding } from "./types";

export type ReportTheme = {
  brandName: string;
  logoUrl: string | null;
  accent: string;
  accentSoft: string;
  text: string;
  mutedText: string;
  faintText: string;
  border: string;
  subtle: string;
  footerText: string;
  preparedBy: string;
  showWatermark: boolean;
  isWhiteLabeled: boolean;
};

const DEFAULT_ACCENT = "#7C3AED";

function readBrandingValue<T>(branding: ReportBranding | null | undefined, snake: string, camel: string): T | null {
  if (!branding) return null;
  const record = branding as Record<string, unknown>;
  return (record[snake] ?? record[camel] ?? null) as T | null;
}

function normalizeHex(value?: string | null) {
  if (!value) return DEFAULT_ACCENT;
  const color = value.trim();
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : DEFAULT_ACCENT;
}

export function createReportTheme({
  branding,
  isPro,
}: {
  branding?: ReportBranding | null;
  isPro?: boolean;
}): ReportTheme {
  const canUseBranding = Boolean(isPro && branding);
  const companyName = readBrandingValue<string>(branding, "company_name", "companyName");
  const logoUrl = readBrandingValue<string>(branding, "logo_url", "logoUrl");
  const primaryColor = readBrandingValue<string>(branding, "primary_color", "primaryColor");
  const preparedBy = readBrandingValue<string>(branding, "prepared_by", "preparedBy");
  const footerText = readBrandingValue<string>(branding, "footer_text", "footerText");
  const showWatermark = readBrandingValue<boolean>(branding, "show_watermark", "showWatermark");

  return {
    brandName: canUseBranding && companyName ? companyName : "AuditFlow",
    logoUrl: canUseBranding && logoUrl ? logoUrl : path.join(process.cwd(), "public", "AFLogo.png"),
    accent: canUseBranding ? normalizeHex(primaryColor) : DEFAULT_ACCENT,
    accentSoft: "#F5F3FF",
    text: "#0F172A",
    mutedText: "#475569",
    faintText: "#94A3B8",
    border: "#E2E8F0",
    subtle: "#F8FAFC",
    footerText: canUseBranding && footerText ? footerText : canUseBranding ? "Confidential" : "Generated with AuditFlow",
    preparedBy: canUseBranding && preparedBy ? preparedBy : canUseBranding && companyName ? companyName : "AuditFlow",
    showWatermark: Boolean(canUseBranding && showWatermark),
    isWhiteLabeled: canUseBranding,
  };
}
