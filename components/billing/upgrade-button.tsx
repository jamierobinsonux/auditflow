"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

type UpgradeButtonProps = {
  plan: string;
  currentPlan?: string;
  priceId?: string;
  disabled?: boolean;
  label?: string;
};

function getPlanSwitchCopy(currentPlan: string | undefined, nextPlan: string) {
  const isPaidSwitch =
    (currentPlan === "Pro" || currentPlan === "Studio") &&
    currentPlan !== nextPlan;

  if (!isPaidSwitch) {
    return {
      title: `Upgrade to ${nextPlan}?`,
      description: (
        <div className="space-y-3">
          <p>
            You’ll start a paid AuditFlow subscription for the {nextPlan} plan.
          </p>
          <p>
            Stripe will securely collect your payment information and confirm the
            subscription before any charges are made.
          </p>
        </div>
      ),
      confirmLabel: `Upgrade to ${nextPlan}`,
      cancelLabel: "Cancel",
    };
  }

  if (currentPlan === "Pro" && nextPlan === "Studio") {
    return {
      title: "Switch to Studio?",
      description: (
        <div className="space-y-3">
          <p>
            You’ll move from Pro to Studio and keep a single active Stripe
            subscription.
          </p>
          <div>
            <p className="font-medium text-slate-700">Studio adds:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Client workspaces</li>
              <li>Client portal access</li>
              <li>Client comment email notifications</li>
              <li>Client-aware branding and reports</li>
            </ul>
          </div>
          <p>
            Stripe may apply a prorated charge or credit based on the time left
            in your current Pro billing period.
          </p>
        </div>
      ),
      confirmLabel: "Switch to Studio",
      cancelLabel: "Cancel",
    };
  }

  if (currentPlan === "Studio" && nextPlan === "Pro") {
    return {
      title: "Switch to Pro?",
      description: (
        <div className="space-y-3">
          <p>
            You’ll move from Studio to Pro and keep a single active Stripe
            subscription.
          </p>
          <div>
            <p className="font-medium text-slate-700">You’ll lose access to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Client workspaces</li>
              <li>Client portal access</li>
              <li>Client comment email notifications</li>
              <li>Client-aware branding and reports</li>
            </ul>
          </div>
          <p>
            Your existing audit projects, findings, and reports will remain
            available on Pro.
          </p>
        </div>
      ),
      confirmLabel: "Switch to Pro",
      cancelLabel: "Keep Studio",
    };
  }

  return {
    title: `Switch to ${nextPlan}?`,
    description: (
      <div className="space-y-3">
        <p>
          You’ll change your AuditFlow subscription from {currentPlan} to
          {" "}{nextPlan}.
        </p>
        <p>
          Your current Stripe subscription will be updated instead of creating a
          second subscription.
        </p>
      </div>
    ),
    confirmLabel: `Switch to ${nextPlan}`,
    cancelLabel: "Cancel",
  };
}

export function UpgradeButton({
  plan,
  currentPlan,
  priceId,
  disabled,
  label,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const copy = getPlanSwitchCopy(currentPlan, plan);
  const buttonLabel = label || `Upgrade to ${plan}`;

  async function handleUpgrade() {
    if (!priceId) {
      toast.error("Missing Stripe price ID.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not update your subscription.");
        return;
      }

      if (!data.url) {
        toast.error("Stripe did not return a redirect URL.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update your subscription."
      );
    } finally {
      setLoading(false);
    }
  }

  const button = (
    <button
      type="button"
      disabled={disabled || loading}
      className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold ${
        disabled
          ? "bg-slate-100 text-slate-500"
          : "bg-violet-600 text-white hover:bg-violet-700"
      }`}
    >
      {disabled ? "Current Plan" : loading ? "Working..." : buttonLabel}
    </button>
  );

  if (disabled) {
    return button;
  }

  return (
    <ConfirmDialog
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      cancelLabel={copy.cancelLabel}
      onConfirm={handleUpgrade}
      trigger={button}
      disabled={loading}
    />
  );
}
