import { createClient } from "@/lib/supabase/server";

export type ReportBranding = {
  id?: string;
  user_id: string;
  company_name: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color?: string | null;
  cover_image_url?: string | null;
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

export async function getClientReportBranding({
  userId,
  clientId,
}: {
  userId: string;
  clientId?: string | null;
}) {
  if (!clientId) return null;

  const supabase = await createClient();

  const [{ data: clientBranding }, { data: client }] = await Promise.all([
    supabase
      .from("client_branding")
      .select("*")
      .eq("user_id", userId)
      .eq("client_id", clientId)
      .maybeSingle(),
    supabase
      .from("clients")
      .select("id,name,logo_url,brand_color")
      .eq("user_id", userId)
      .eq("id", clientId)
      .maybeSingle(),
  ]);

  if (!clientBranding && !client) return null;

  return {
    user_id: userId,
    company_name: clientBranding?.company_name ?? client?.name ?? null,
    logo_url: clientBranding?.logo_url ?? client?.logo_url ?? null,
    primary_color:
      clientBranding?.primary_color ?? client?.brand_color ?? DEFAULT_REPORT_BRANDING.primary_color,
    secondary_color: clientBranding?.secondary_color ?? null,
    cover_image_url: clientBranding?.cover_image_url ?? null,
    prepared_by: clientBranding?.prepared_by ?? null,
    footer_text: clientBranding?.footer_text ?? "Confidential",
    show_watermark: clientBranding?.show_watermark ?? false,
  } satisfies ReportBranding;
}

export async function getEffectiveReportBranding({
  userId,
  clientId,
  preferClientBranding,
}: {
  userId: string;
  clientId?: string | null;
  preferClientBranding?: boolean;
}) {
  if (preferClientBranding) {
    const clientBranding = await getClientReportBranding({ userId, clientId });
    if (clientBranding) return clientBranding;
  }

  return getReportBranding(userId);
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
    secondary_color: branding?.secondary_color ?? null,
    cover_image_url: branding?.cover_image_url ?? null,
    prepared_by: branding?.prepared_by ?? DEFAULT_REPORT_BRANDING.prepared_by,
    footer_text: branding?.footer_text ?? DEFAULT_REPORT_BRANDING.footer_text,
    show_watermark:
      branding?.show_watermark ?? DEFAULT_REPORT_BRANDING.show_watermark,
  };
}
