"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createSafeStoragePath } from "@/lib/storage";
import type { ReportBranding } from "@/lib/report-branding";

export function ReportBrandingForm({
  userId,
  branding,
}: {
  userId: string;
  branding: ReportBranding;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [companyName, setCompanyName] = useState(branding.company_name ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    branding.primary_color || "#7C3AED"
  );
  const [preparedBy, setPreparedBy] = useState(branding.prepared_by ?? "");
  const [footerText, setFooterText] = useState(
    branding.footer_text || "Confidential"
  );
  const [showWatermark, setShowWatermark] = useState(
    Boolean(branding.show_watermark)
  );
  const [logoUrl, setLogoUrl] = useState(branding.logo_url ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function uploadLogo() {
    if (!logoFile) return logoUrl || null;

    const filePath = createSafeStoragePath(`${userId}/logos`, logoFile);

    const { error: uploadError } = await supabase.storage
      .from("branding-assets")
      .upload(filePath, logoFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("branding-assets")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const nextLogoUrl = await uploadLogo();

      const { error } = await supabase.from("report_branding").upsert(
        {
          user_id: userId,
          company_name: companyName.trim() || null,
          logo_url: nextLogoUrl,
          primary_color: primaryColor,
          prepared_by: preparedBy.trim() || null,
          footer_text: footerText.trim() || "Confidential",
          show_watermark: showWatermark,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      setLogoUrl(nextLogoUrl ?? "");
      setLogoFile(null);
      toast.success("Report branding saved.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Could not save report branding.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">Company name</label>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Studio"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Logo</label>
        <input
          id="report-logo-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
        />

        <label
          htmlFor="report-logo-upload"
          className="mt-2 flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-5 transition hover:border-violet-400 hover:bg-violet-50"
        >
          <div className="flex items-center gap-3">
            {logoFile || logoUrl ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <UploadCloud className="h-8 w-8 text-violet-500" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {logoFile ? logoFile.name : logoUrl ? "Logo uploaded" : "Upload logo"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                PNG, JPG, or WebP. A transparent PNG works best.
              </p>
            </div>
          </div>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <div>
          <label className="text-sm font-medium text-slate-700">Brand color</label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white p-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Hex value</label>
          <input
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#7C3AED"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Prepared by</label>
        <input
          value={preparedBy}
          onChange={(e) => setPreparedBy(e.target.value)}
          placeholder="Jamie Robinson"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Footer text</label>
        <input
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          placeholder="Confidential"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input
          type="checkbox"
          checked={showWatermark}
          onChange={(e) => setShowWatermark(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium text-slate-800">
            Add confidential watermark
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Adds a subtle enterprise-style confidentiality marker to branded reports.
          </span>
        </span>
      </label>

      <button
        disabled={saving}
        className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save branding"}
      </button>
    </form>
  );
}
