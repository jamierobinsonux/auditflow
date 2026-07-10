"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export function PostHogIdentity({
  userId,
  email,
  plan,
}: {
  userId: string;
  email?: string | null;
  plan: string;
}) {
  useEffect(() => {
    posthog.identify(userId, {
      email: email ?? undefined,
      plan,
    });

    return () => {
      // Do not reset here. Reset PostHog only when the user explicitly signs out.
    };
  }, [userId, email, plan]);

  return null;
}