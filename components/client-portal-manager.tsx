"use client";

import { useMemo, useState } from "react";
import { Copy, ExternalLink, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout/card";

export function ClientPortalManager({
  clientId,
  initialEnabled,
  initialToken,
  lastRegenerated,
}: {
  clientId: string;
  initialEnabled: boolean;
  initialToken: string;
  lastRegenerated?: string | null;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [token, setToken] = useState(initialToken);
  const [regeneratedAt, setRegeneratedAt] = useState(lastRegenerated ?? null);
  const [saving, setSaving] = useState(false);

  const portalUrl = useMemo(() => {
    if (typeof window === "undefined") return `/portal/${token}`;
    return `${window.location.origin}/portal/${token}`;
  }, [token]);

  async function updatePortal(body: Record<string, unknown>) {
    setSaving(true);
    const response = await fetch(`/api/client-portals/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      toast.error(payload?.error || "Unable to update client portal.");
      return null;
    }

    return payload.client as {
      portal_enabled: boolean;
      portal_token: string;
      portal_last_regenerated: string | null;
    };
  }

  async function toggleEnabled() {
    const next = !enabled;
    const client = await updatePortal({ portal_enabled: next });
    if (!client) return;
    setEnabled(client.portal_enabled);
    toast.success(next ? "Client portal enabled." : "Client portal disabled.");
  }

  async function regenerate() {
    const client = await updatePortal({ action: "regenerate" });
    if (!client) return;
    setEnabled(client.portal_enabled);
    setToken(client.portal_token);
    setRegeneratedAt(client.portal_last_regenerated);
    toast.success("Client portal link regenerated.");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(portalUrl);
    toast.success("Portal link copied.");
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Client portal</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Share a secure read-only page with this client so they can view projects, findings, recommendations, and exported reports.
          </p>
        </div>
        <Button type="button" variant={enabled ? "outline" : "default"} onClick={toggleEnabled} disabled={saving}>
          {enabled ? "Disable portal" : "Enable portal"}
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Share link</p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
          <code className="min-w-0 flex-1 truncate rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {portalUrl}
          </code>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={copyLink} disabled={!enabled}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button asChild variant="outline">
              <a href={`/portal/${token}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open
              </a>
            </Button>
          </div>
        </div>
        {!enabled && (
          <p className="mt-3 text-sm text-amber-700">This link is currently disabled. Enable the portal before sending it to a client.</p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-500">
          {regeneratedAt ? `Last regenerated ${new Date(regeneratedAt).toLocaleDateString()}` : "This portal link has not been regenerated yet."}
        </p>
        <Button type="button" variant="outline" onClick={regenerate} disabled={saving}>
          <RefreshCcw className="h-4 w-4" />
          Regenerate link
        </Button>
      </div>
    </Card>
  );
}
