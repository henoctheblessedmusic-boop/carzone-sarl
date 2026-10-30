import type { ReactNode } from "react";
import { getSiteLocale } from "@/lib/site-locale-server";
import { siteCopy } from "@/lib/i18n/site";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteLangSync } from "@/components/site/SiteLangSync";
import "./site.css";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return (
    <div className="site-shell" lang={locale}>
      <SiteLangSync locale={locale} />
      <a href="#site-main-content" className="site-skip-link">
        {copy.common.skipToContent}
      </a>
      <SiteHeader locale={locale} copy={copy} />
      <main id="site-main-content">{children}</main>
      <SiteFooter copy={copy} />
    </div>
  );
}
