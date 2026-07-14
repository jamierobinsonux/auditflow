import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppToaster } from "@/components/app-toaster";
import PHProvider from "@/components/posthog-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://auditflowapp.co"),

  title: "AuditFlow | Professional UX Audit Platform",

  description:
    "Manage UX audits from first finding to final report. Capture findings, annotate screenshots, collaborate with clients, and generate professional PDF reports.",

  openGraph: {
    title: "AuditFlow | Professional UX Audit Platform",

    description:
      "Capture findings, annotate evidence, collaborate with clients, and generate polished reports in one workspace.",

    url: "https://auditflowapp.co",

    siteName: "AuditFlow",

    images: [
      {
        url: "/auditflow-og.png",
        width: 1200,
        height: 630,
        alt: "AuditFlow professional UX audit platform",
      },
    ],

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "AuditFlow | Professional UX Audit Platform",

    description:
      "Capture findings, annotate evidence, collaborate with clients, and generate polished reports in one workspace.",

    images: ["/auditflow-og.png"],
  },
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
        <PHProvider>
        {children}
        </PHProvider>
        <AppToaster />
      </body>
    </html>
  );
}