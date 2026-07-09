import Stripe from "stripe";
import type { PlanId } from "@/lib/subscription-plans";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_PRICE_IDS: Partial<Record<PlanId, string | undefined>> = {
  Pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  Studio: process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID,
};

export function getStripePriceIdForPlan(plan: string) {
  const normalizedPlan = normalizePlanId(plan);

  if (!normalizedPlan || normalizedPlan === "Free") return null;

  return PLAN_PRICE_IDS[normalizedPlan] || null;
}

export function getPlanFromStripePriceId(priceId?: string | null): PlanId {
  if (priceId && priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    return "Pro";
  }

  if (priceId && priceId === process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID) {
    return "Studio";
  }

  return "Free";
}

export function normalizePlanId(plan?: string | null): PlanId | null {
  if (plan === "Free" || plan === "Pro" || plan === "Studio") {
    return plan;
  }

  return null;
}
