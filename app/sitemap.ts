import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://auditflowapp.co",
      priority: 1,
    },
    {
      url: "https://auditflowapp.co/academy",
      priority: 0.8,
    },
    {
      url: "https://auditflowapp.co/academy/what-is-a-ux-audit",
      priority: 0.7,
    },
    {
      url: "https://auditflowapp.co/academy/ux-audit-process",
      priority: 0.7,
    },
    {
      url: "https://auditflowapp.co/academy/ux-audit-checklist",
      priority: 0.7,
    },
    {
      url: "https://auditflowapp.co/academy/write-better-ux-findings",
      priority: 0.7,
    },
    {
      url: "https://auditflowapp.co/academy/prioritize-ux-issues",
      priority: 0.7,
    },
    {
      url: "https://auditflowapp.co/academy/heuristic-evaluation",
      priority: 0.7,
    },
    {
      url: "https://auditflowapp.co/privacy",
    },
    {
      url: "https://auditflowapp.co/terms",
    },
  ];
}