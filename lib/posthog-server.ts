import { PostHog } from "posthog-node";

type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export async function captureServerEvent({
  distinctId,
  event,
  properties = {},
}: {
  distinctId: string;
  event: string;
  properties?: EventProperties;
}) {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!apiKey) {
    console.warn(`PostHog event "${event}" skipped: API key is missing.`);
    return;
  }

  const posthog = new PostHog(apiKey, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });

  try {
    posthog.capture({
      distinctId,
      event,
      properties,
    });

    await posthog.shutdown();
  } catch (error) {
    console.error(`Unable to capture PostHog event "${event}".`, error);
  }
}