import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://auditflowapp.co",
      priority: 1,
    },
    {
      url: "https://auditflowapp.co/privacy",
    },
    {
      url: "https://auditflowapp.co/terms",
    },
  ];
}