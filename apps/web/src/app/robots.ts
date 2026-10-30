import type { MetadataRoute } from "next";
import { SITE_WEBSITE } from "@/lib/site-constants";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_WEBSITE.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/vehicules", "/sur-mesure", "/nos-services", "/recharge", "/equipe", "/contact"],
        disallow: [
          "/dashboard",
          "/login",
          "/api/",
          "/clients",
          "/leads",
          "/quotes",
          "/invoices",
          "/vehicles",
          "/workshop",
          "/parts",
          "/imports",
          "/charging",
          "/terminal",
          "/mailbox",
          "/chat",
          "/users",
          "/hr",
          "/expenses",
          "/fleet",
          "/rentals",
          "/opportunities",
          "/invoices",
          "/catalog",
          "/installers",
          "/charge-requests",
          "/presentation",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
