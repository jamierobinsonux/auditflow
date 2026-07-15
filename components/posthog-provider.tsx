"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export default function PHProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (posthogKey && !posthog.__loaded) {
      posthog.init(posthogKey, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST ||
          "https://us.i.posthog.com",

        persistence: "localStorage",

        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        person_profiles: "identified_only",

        loaded: (client) => {
          if (process.env.NODE_ENV === "development") {
            client.debug();
          }
        },
      });
    }

    setIsReady(true);
  }, []);

  if (!isReady) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  );
}