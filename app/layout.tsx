import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppToaster } from "@/components/app-toaster";
import PHProvider from "@/components/posthog-provider";
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://auditflowapp.co"),

  title: {
    default: "AuditFlow | Professional UX Audit Platform",
    template: "%s | AuditFlow",
  },

  description:
    "Manage UX audits from first finding to final report. Capture findings, annotate screenshots, collaborate with clients, and generate professional PDF reports.",

  applicationName: "AuditFlow",

  keywords: [
    "UX audit software",
    "UX audit",
    "UX consulting",
    "usability audit",
    "website audit",
    "user experience audit",
    "UX report",
    "UX consultant tools",
    "heuristic evaluation",
    "SaaS UX",
  ],

  authors: [
    {
      name: "AuditFlow",
      url: "https://auditflowapp.co",
    },
  ],

  creator: "AuditFlow",

  publisher: "AuditFlow",

  alternates: {
    canonical: "https://auditflowapp.co",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://auditflowapp.co",
    siteName: "AuditFlow",

    title: "AuditFlow | Professional UX Audit Platform",

    description:
      "Capture findings, annotate evidence, collaborate with clients, and generate polished reports in one workspace.",

    images: [
      {
        url: "/auditflow-og.png",
        width: 1200,
        height: 630,
        alt: "AuditFlow professional UX audit platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "AuditFlow | Professional UX Audit Platform",

    description:
      "Capture findings, annotate evidence, collaborate with clients, and generate polished reports in one workspace.",

    images: ["/auditflow-og.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],

    apple: "/apple-touch-icon.png",

    shortcut: "/favicon.ico",
  },

  manifest: "/site.webmanifest",

  category: "business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "AuditFlow",
                  url: "https://auditflowapp.co",
                  logo: "https://auditflowapp.co/android-chrome-512x512.png",
                },
                {
                  "@type": "SoftwareApplication",
                  name: "AuditFlow",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Web",
                  description:
                    "Manage UX audits from first finding to final report. Capture findings, annotate screenshots, collaborate with clients, and generate professional PDF reports.",
                  url: "https://auditflowapp.co",
                  image: "https://auditflowapp.co/auditflow-og.png",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                  },
                  creator: {
                    "@type": "Organization",
                    name: "AuditFlow",
                  },
                },
              ],
            }),
          }}
        />

        <PHProvider>
          {children}
        </PHProvider>

        <AppToaster />
      </body>
    </html>
  );
}