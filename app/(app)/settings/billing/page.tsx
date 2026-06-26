import { createClient } from "@/lib/supabase/server";
import { subscriptionPlans } from "@/lib/subscription-plans";
import { PlanCard } from "@/components/billing/plan-card";

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user?.id)
    .maybeSingle();

  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user?.id);

  const { data: findings } = await supabase
    .from("findings")
    .select("id")
    .eq("user_id", user?.id);

  const currentPlan = subscription?.plan || "Free";
  const plan = subscriptionPlans.find((item) => item.id === currentPlan);

  return (
    <main className="p-10">
      <div>
        <h1 className="text-[24px] font-semibold text-slate-950">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your plan, usage, and subscription settings.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <UsageCard
          label="Current plan"
          value={currentPlan}
          helper={subscription?.status || "active"}
        />
        <UsageCard
          label="Projects used"
          value={`${projects?.length ?? 0} / ${
            plan?.limits.projects ?? "Unlimited"
          }`}
          helper="Project limit"
        />
        <UsageCard
          label="Findings used"
          value={`${findings?.length ?? 0} / ${
            plan?.limits.findings ?? "Unlimited"
          }`}
          helper="Finding limit"
        />
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-slate-950">
              Subscription
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Stripe billing will be connected later. These plan controls are
              currently for UI and product setup.
            </p>
          </div>

          <button
            disabled
            className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500"
          >
            Manage subscription
          </button>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} currentPlan={currentPlan} />
        ))}
      </section>
    </main>
  );
}

function UsageCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-[24px] font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}