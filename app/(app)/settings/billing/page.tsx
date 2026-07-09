import { createClient } from "@/lib/supabase/server";
import { subscriptionPlans } from "@/lib/subscription-plans";
import { getUsage } from "@/lib/subscription";
import { PlanCard } from "@/components/billing/plan-card";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    limit?: string;
    feature?: string;
    success?: string;
    canceled?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user?.id)
    .maybeSingle();

  const usage = user?.id
    ? await getUsage(user.id)
    : { projectsUsed: 0, findingsUsed: 0, demoProjectsUsed: 0 };

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

      <BillingNotice
        limit={params.limit}
        feature={params.feature}
        success={params.success}
        canceled={params.canceled}
      />

      {subscription?.cancel_at_period_end ? (
        <CancellationScheduledNotice
          plan={currentPlan}
          currentPeriodEnd={subscription.current_period_end}
        />
      ) : null}

      {!subscription?.cancel_at_period_end && subscription?.scheduled_plan ? (
        <PlanChangeScheduledNotice
          currentPlan={currentPlan}
          scheduledPlan={subscription.scheduled_plan}
          scheduledChangeDate={subscription.scheduled_change_date}
        />
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <UsageCard
          label="Current plan"
          value={currentPlan}
          helper={getCurrentPlanHelper({
            status: subscription?.status,
            scheduledPlan: subscription?.scheduled_plan,
            scheduledChangeDate: subscription?.scheduled_change_date,
          })}
        />
        <UsageCard
          label="Projects used"
          value={`${usage.projectsUsed} / ${
            plan?.limits.projects ?? "Unlimited"
          }`}
          helper="Project limit"
        />
        <UsageCard
          label="Findings used"
          value={`${usage.findingsUsed} / ${
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
              Upgrade to unlock unlimited audits, public report sharing, and
              professional exports.
            </p>
          </div>

          <ManageSubscriptionButton
            disabled={!subscription?.stripe_customer_id}
          />
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

function BillingNotice({
  limit,
  feature,
  success,
  canceled,
}: {
  limit?: string;
  feature?: string;
  success?: string;
  canceled?: string;
}) {
  if (success) {
    return (
      <Notice
        tone="success"
        title="Subscription updated"
        description="Your billing settings have been updated. Scheduled downgrades keep your current plan active until the end of the billing period."
      />
    );
  }

  if (canceled) {
    return (
      <Notice
        tone="neutral"
        title="Checkout canceled"
        description="No changes were made to your subscription."
      />
    );
  }

  if (limit === "projects") {
    return (
      <Notice
        tone="upgrade"
        title="You’ve reached the Free plan project limit"
        description="Free includes 1 project. Upgrade to Pro to create unlimited audit projects."
      />
    );
  }

  if (limit === "findings") {
    return (
      <Notice
        tone="upgrade"
        title="You’ve reached the Free plan finding limit"
        description="Free includes 5 findings. Upgrade to Pro to add unlimited findings across your audits."
      />
    );
  }

  if (feature === "public-reports") {
    return (
      <Notice
        tone="upgrade"
        title="Public report sharing is a Pro feature"
        description="Upgrade to Pro to create client-ready public report links."
      />
    );
  }

  return null;
}

function CancellationScheduledNotice({
  plan,
  currentPeriodEnd,
}: {
  plan: string;
  currentPeriodEnd?: string | null;
}) {
  const expirationDate = formatBillingDate(currentPeriodEnd);

  return (
    <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 shadow-sm">
      <p className="text-sm font-semibold">Subscription cancellation scheduled</p>
      <p className="mt-2 text-sm leading-6">
        Your {plan} plan will remain active
        {expirationDate ? ` until ${expirationDate}` : " until the end of your current billing period"}.
        {" "}You won’t be billed again for this subscription.
      </p>
      <p className="mt-2 text-xs leading-5 text-amber-700">
        Need to keep AuditFlow? Use Manage subscription to reactivate before access expires.
      </p>
    </section>
  );
}

function PlanChangeScheduledNotice({
  currentPlan,
  scheduledPlan,
  scheduledChangeDate,
}: {
  currentPlan: string;
  scheduledPlan?: string | null;
  scheduledChangeDate?: string | null;
}) {
  const changeDate = formatBillingDate(scheduledChangeDate);

  if (!scheduledPlan) return null;

  return (
    <section className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-violet-800 shadow-sm">
      <p className="text-sm font-semibold">Plan change scheduled</p>
      <p className="mt-2 text-sm leading-6">
        Your {currentPlan} plan will remain active
        {changeDate ? ` until ${changeDate}` : " until the end of your current billing period"}.
        {" "}After that, your plan will change to {scheduledPlan}.
      </p>
      <p className="mt-2 text-xs leading-5 text-violet-700">
        You’ll keep your current paid features until the scheduled change takes effect.
      </p>
    </section>
  );
}

function getCurrentPlanHelper({
  status,
  scheduledPlan,
  scheduledChangeDate,
}: {
  status?: string | null;
  scheduledPlan?: string | null;
  scheduledChangeDate?: string | null;
}) {
  const changeDate = formatBillingDate(scheduledChangeDate);

  if (scheduledPlan) {
    return changeDate
      ? `Changes to ${scheduledPlan} on ${changeDate}`
      : `Changes to ${scheduledPlan} at period end`;
  }

  return status || "active";
}

function formatBillingDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function Notice({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: "upgrade" | "success" | "neutral";
}) {
  const styles =
    tone === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : tone === "upgrade"
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : "border-slate-200 bg-white text-slate-700";

  return (
    <section className={`mt-8 rounded-2xl border p-5 shadow-sm ${styles}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6">{description}</p>
    </section>
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