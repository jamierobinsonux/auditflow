import { CheckCircle2 } from "lucide-react";
import { UpgradeButton } from "@/components/billing/upgrade-button";

type PlanCardProps = {
  plan: {
    id: string;
    name: string;
    price: string;
    cadence: string;
    description: string;
    features: readonly string[];
    recommended?: boolean;
  };
  currentPlan: string;
};

export function PlanCard({ plan, currentPlan }: PlanCardProps) {
  const isCurrent = currentPlan === plan.id;
  const showRecommended = Boolean(plan.recommended && currentPlan === "Free");
  const isPaidPlan = currentPlan === "Pro" || currentPlan === "Studio";
  const upgradeLabel = isPaidPlan && plan.id !== currentPlan ? `Switch to ${plan.name}` : undefined;

  const priceId =
    plan.id === "Pro"
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
      : plan.id === "Studio"
      ? process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID
      : undefined;

  return (
    <div
      className={`relative rounded-3xl border bg-white p-6 shadow-sm ${
        showRecommended ? "border-violet-300" : "border-slate-200"
      }`}
    >
      {showRecommended && (
        <div className="absolute right-5 top-5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          Recommended
        </div>
      )}

      <h3 className="text-[20px] font-semibold text-slate-950">{plan.name}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {plan.description}
      </p>

      <div className="mt-5 flex items-end gap-1">
        <p className="text-[32px] font-semibold text-slate-950">
          {plan.price}
        </p>
        {plan.cadence !== "forever" && (
          <p className="pb-2 text-sm text-slate-500">/{plan.cadence}</p>
        )}
      </div>

      {plan.id === "Free" ? (
        <button
          disabled
          className="mt-6 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
        >
          {isCurrent ? "Current Plan" : "Free Plan"}
        </button>
      ) : (
        <UpgradeButton
          plan={plan.id}
          currentPlan={currentPlan}
          priceId={priceId}
          disabled={isCurrent}
          label={upgradeLabel}
        />
      )}

      <div className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-violet-600" />
            <p className="text-sm text-slate-600">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}