"use client";

import { useState } from "react";
import { toast } from "sonner";

export function UpgradeButton({
  plan,
  priceId,
  disabled,
  label,
}: {
  plan: string;
  priceId?: string;
  disabled?: boolean;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!priceId) {
      toast.error("Missing Stripe price ID.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId, plan }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Could not start checkout.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <button
      disabled={disabled || loading}
      onClick={handleUpgrade}
      className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold ${
        disabled
          ? "bg-slate-100 text-slate-500"
          : "bg-violet-600 text-white hover:bg-violet-700"
      }`}
    >
      {disabled
        ? "Current Plan"
        : loading
        ? "Redirecting..."
        : label || `Upgrade to ${plan}`}
    </button>
  );
}