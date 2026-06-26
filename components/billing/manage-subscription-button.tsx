"use client";

import { useState } from "react";

export function ManageSubscriptionButton({
  disabled,
}: {
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    const res = await fetch("/api/stripe/portal", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Could not open billing portal.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <button
      disabled={disabled || loading}
      onClick={handleClick}
      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
    >
      {loading ? "Opening..." : "Manage subscription"}
    </button>
  );
}