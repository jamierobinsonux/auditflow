"use client";

import { useState } from "react";

export function UpgradeButton({
  plan,
  priceId,
  disabled,
}: {
  plan: string;
  priceId?: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!priceId) {
      alert("Missing Stripe price ID.");
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
      alert(data.error || "Could not start checkout.");
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
      {disabled ? "Current Plan" : loading ? "Redirecting..." : `Upgrade to ${plan}`}
    </button>
  );
}