# PostHog cleanup

This patch keeps the wizard foundation while avoiding duplicate or misleading events.

## Kept
- `instrumentation-client.ts` initializes PostHog once.
- `components/posthog-provider.tsx` only provides the initialized client.
- `PostHogIdentity` identifies authenticated users and includes their plan.
- Sign-out resets the PostHog identity.
- Successful server-side events for projects, findings, reports, subscriptions, downgrades, cancellations, portal enablement, demo projects, and account deletion.
- Successful client creation and email signup events.

## Changed
- Login-page identification remains removed to prevent duplicate `identify()` calls.
- Report generation is captured in the report API after the export record is created, rather than when the download button is clicked.
- Account deletion is captured only after the auth user is successfully deleted.
- Stripe customer, subscription, and session IDs were removed from analytics properties for data minimization.
- Formatting from automatically inserted snippets was cleaned up.

## Required environment variables
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

The existing `lib/posthog-server.ts` helper and `posthog-node` dependency are still required for server events.
