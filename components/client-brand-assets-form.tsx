"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImageIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createSafeStoragePath } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import type { Client, ClientBranding } from "@/types/client";

type ClientBrandAssetsFormProps = {
  userId: string;
  client: Client;
  branding: ClientBranding | null;
};

export function ClientBrandAssetsForm({
  userId,
  client,
  branding,
}: ClientBrandAssetsFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [companyName, setCompanyName] = useState(
    branding?.company_name ?? client.name
  );
  const [primaryColor, setPrimaryColor] = useState(
    branding?.primary_color ?? client.brand_color ?? "#7C3AED"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    branding?.secondary_color ?? "#111827"
  );
  const [preparedBy, setPreparedBy] = useState(branding?.prepared_by ?? "");
  const [footerText, setFooterText] = useState(
    branding?.footer_text ?? "Confidential"
  );
  const [showWatermark, setShowWatermark] = useState(
    Boolean(branding?.show_watermark)
  );
  const [logoUrl, setLogoUrl] = useState(
    branding?.logo_url ?? client.logo_url ?? ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    branding?.cover_image_url ?? ""
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(logoUrl);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(logoUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile, logoUrl]);

  async function uploadAsset(file: File | null, currentUrl: string, folder: string) {
    if (!file) return currentUrl || null;

    const filePath = createSafeStoragePath(`${userId}/clients/${client.id}/${folder}`, file);

    const { error } = await supabase.storage
      .from("branding-assets")
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from("branding-assets").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const nextLogoUrl = await uploadAsset(logoFile, logoUrl, "logos");
      const nextCoverImageUrl = await uploadAsset(coverFile, coverImageUrl, "covers");

      const { error: brandingError } = await supabase.from("client_branding").upsert(
        {
          user_id: userId,
          client_id: client.id,
          company_name: companyName.trim() || client.name,
          logo_url: nextLogoUrl,
          primary_color: primaryColor || "#7C3AED",
          secondary_color: secondaryColor || "#111827",
          prepared_by: preparedBy.trim() || null,
          footer_text: footerText.trim() || "Confidential",
          show_watermark: showWatermark,
          cover_image_url: nextCoverImageUrl,
        },
        { onConflict: "client_id" }
      );

      if (brandingError) throw brandingError;

      const { error: clientError } = await supabase
        .from("clients")
        .update({
          logo_url: nextLogoUrl,
          brand_color: primaryColor || "#7C3AED",
        })
        .eq("id", client.id)
        .eq("user_id", userId);

      if (clientError) throw clientError;

      setLogoUrl(nextLogoUrl ?? "");
      setCoverImageUrl(nextCoverImageUrl ?? "");
      setLogoFile(null);
      setCoverFile(null);
      toast.success("Brand assets saved.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Could not save brand assets.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Brand Assets</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            These assets are automatically applied to Studio reports for this client.
          </p>
        </div>

        <FormField label="Company name">
          <TextInput value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Primary color">
            <div className="flex gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-11 w-14 rounded-xl border border-slate-200 bg-white p-1"
                aria-label="Primary color"
              />
              <TextInput value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
            </div>
          </FormField>

          <FormField label="Secondary color">
            <div className="flex gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-11 w-14 rounded-xl border border-slate-200 bg-white p-1"
                aria-label="Secondary color"
              />
              <TextInput value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
            </div>
          </FormField>
        </div>

        <UploadField
          id="client-logo-upload"
          label="Logo"
          helper="PNG, JPG, WebP, or SVG. Transparent logos work best."
          selectedFile={logoFile}
          existingUrl={logoUrl}
          onChange={setLogoFile}
        />

        <UploadField
          id="client-cover-upload"
          label="Cover image"
          helper="Optional. Used on branded report covers when available."
          selectedFile={coverFile}
          existingUrl={coverImageUrl}
          onChange={setCoverFile}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Prepared by">
            <TextInput
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="Jamie Robinson"
            />
          </FormField>

          <FormField label="Footer text">
            <TextInput
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Confidential"
            />
          </FormField>
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
              Adds a subtle confidentiality marker to this client's branded reports.
            </span>
          </span>
        </label>

        <div className="flex justify-end">
          <Button disabled={saving}>{saving ? "Saving..." : "Save brand assets"}</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-950">Report Preview</h3>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: primaryColor }} />
            <div className="mt-8 flex items-center gap-3">
              {logoPreviewUrl ? (
                <img
                  src={logoPreviewUrl}
                  alt=""
                  className="h-12 w-12 rounded-xl border border-slate-200 bg-white object-contain p-1"
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {companyName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-950">{companyName || client.name}</p>
                <p className="mt-1 text-xs text-slate-500">UX Audit Report</p>
              </div>
            </div>
            <div className="mt-10 space-y-3">
              <div className="h-3 w-2/3 rounded-full" style={{ backgroundColor: secondaryColor }} />
              <div className="h-2 w-full rounded-full bg-slate-200" />
              <div className="h-2 w-5/6 rounded-full bg-slate-200" />
              <div className="h-2 w-1/2 rounded-full bg-slate-200" />
            </div>
            <div className="mt-12 border-t border-slate-100 pt-4 text-xs text-slate-500">
              {footerText || "Confidential"}
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <StatusRow label="Logo" ready={Boolean(logoFile || logoUrl)} />
          <StatusRow label="Primary color" ready={Boolean(primaryColor)} />
          <StatusRow label="Secondary color" ready={Boolean(secondaryColor)} />
          <StatusRow label="Footer" ready={Boolean(footerText)} />
          <StatusRow label="Cover image" ready={Boolean(coverFile || coverImageUrl)} />
        </div>
      </div>
    </form>
  );
}

function UploadField({
  id,
  label,
  helper,
  selectedFile,
  existingUrl,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  selectedFile: File | null;
  existingUrl: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <label
        htmlFor={id}
        className="mt-2 flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-5 transition hover:border-violet-400 hover:bg-violet-50"
      >
        <div className="flex items-center gap-3">
          {selectedFile || existingUrl ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          ) : (
            <UploadCloud className="h-8 w-8 text-violet-500" />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {selectedFile ? selectedFile.name : existingUrl ? `${label} uploaded` : `Upload ${label.toLowerCase()}`}
            </p>
            <p className="mt-1 text-xs text-slate-500">{helper}</p>
          </div>
        </div>
        <ImageIcon className="size-5 text-slate-400" />
      </label>
    </div>
  );
}

function StatusRow({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className={ready ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>
        {ready ? "Configured" : "Not set"}
      </span>
    </div>
  );
}
