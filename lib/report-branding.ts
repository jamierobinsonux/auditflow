import { createClient } from "@/lib/supabase/server";

export type ReportBranding = {
  id?: string;
  user_id: string;
  company_name: string | null;
  logo_url: string | null;
  primary_color: string;
  prepared_by: string | null;
  footer_text: string;
  show_watermark: boolean;
};

export const DEFAULT_REPORT_BRANDING = {
  company_name: null,
  logo_url: null,
  primary_color: "#7C3AED",
  prepared_by: null,
  footer_text: "Generated with AuditFlow",
  show_watermark: false,
};

export async function getReportBranding(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("report_branding")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return data as ReportBranding | null;
}

export function normalizeReportBranding(
  branding: ReportBranding | null | undefined,
  userId: string
): ReportBranding {
  return {
    user_id: userId,
    company_name: branding?.company_name ?? DEFAULT_REPORT_BRANDING.company_name,
    logo_url: branding?.logo_url ?? DEFAULT_REPORT_BRANDING.logo_url,
    primary_color:
      branding?.primary_color ?? DEFAULT_REPORT_BRANDING.primary_color,
    prepared_by: branding?.prepared_by ?? DEFAULT_REPORT_BRANDING.prepared_by,
    footer_text: branding?.footer_text ?? DEFAULT_REPORT_BRANDING.footer_text,
    show_watermark:
      branding?.show_watermark ?? DEFAULT_REPORT_BRANDING.show_watermark,
  };
}
