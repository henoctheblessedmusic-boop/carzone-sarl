import type { MetadataRoute } from "next";
import { SITE_WEBSITE } from "@/lib/site-constants";

/** Pages publiques de la vitrine (les routes applicatives internes ne sont pas indexées). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE_WEBSITE.replace(/\/$/, "");

  const routes: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/vehicules", priority: 0.9, changeFrequency: "daily" },
    { path: "/sur-mesure", priority: 0.8, changeFrequency: "monthly" },
    { path: "/nos-services", priority: 0.8, changeFrequency: "monthly" },
    { path: "/recharge", priority: 0.7, changeFrequency: "monthly" },
    { path: "/equipe", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/confidentialite", priority: 0.3, changeFrequency: "monthly" },
    { path: "/mentions-legales", priority: 0.3, changeFrequency: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
