<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into AuditFlow. Seven new events were added across client and server-side code. PostHog initialization was migrated from a `useEffect` in the provider component to the recommended `instrumentation-client.ts` file (Next.js 15.3+ pattern), and user identification via `posthog.identify()` was wired to the email login flow. All server-side events use the existing `captureServerEvent` helper in `lib/posthog-server.ts`.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `user_logged_in` | User successfully signs in with email and password | `app/(auth)/login/page.tsx` |
| `checkout_session_started` | User initiates a new Stripe checkout session to subscribe to a paid plan | `app/api/stripe/checkout/route.ts` |
| `report_exported` | User exports a PDF report from the report builder | `components/report-builder-client.tsx` |
| `client_created` | User creates a new client workspace | `components/client-form.tsx` |
| `demo_project_created` | User creates the demo project during onboarding | `app/api/demo-project/route.ts` |
| `account_deleted` | User deletes their AuditFlow account and all workspace data | `app/api/account/delete/route.ts` |
| `client_portal_enabled` | User enables or regenerates a client portal for a client | `app/api/client-portals/[id]/route.ts` |

### Pre-existing events (not duplicated)

The following events were already instrumented before this run: `account_created`, `google_signup_started`, `project_created`, `finding_created`, `subscription_started`, `subscription_upgraded`, `subscription_downgrade_completed`, `subscription_downgrade_scheduled`, `subscription_cancelled`.

## Infrastructure changes

- **Created `instrumentation-client.ts`** — Initializes PostHog via the Next.js 15.3+ recommended pattern with `capture_exceptions: true` for error tracking.
- **Updated `components/posthog-provider.tsx`** — Removed duplicate `posthog.init()` from `useEffect`; the `PostHogProvider` wrapper is retained for React context.
- **Updated `.env.local`** — Confirmed `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` are set to the correct values.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/506850/dashboard/1830725)
- [Signup to paid conversion (wizard)](https://us.posthog.com/project/506850/insights/VlXlQEpp)
- [New signups over time (wizard)](https://us.posthog.com/project/506850/insights/HvkSGRJT)
- [Reports exported by template (wizard)](https://us.posthog.com/project/506850/insights/xMwkD1qY)
- [Core product actions (wizard)](https://us.posthog.com/project/506850/insights/JhsYF0zI)
- [Subscription events (wizard)](https://us.posthog.com/project/506850/insights/yVHL2fGi)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any CI/deployment bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the current login handler identifies on fresh email login, but OAuth (Google) login does not yet call `posthog.identify()` client-side after redirect. Consider adding it in the auth callback or the app layout if needed.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
