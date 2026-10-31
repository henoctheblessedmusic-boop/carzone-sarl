import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSiteLocale } from "@/lib/site-locale-server";
import { siteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteLangSync } from "@/components/site/SiteLangSync";
import { OrganizationJsonLd } from "@/components/site/OrganizationJsonLd";
import { SITE_WEBSITE } from "@/lib/site-constants";
import { Analytics } from "@vercel/analytics/react";
import { MobileWhatsAppBar } from "@/components/site/MobileWhatsAppBar";
import "./site.css";

const OG_LOCALE: Record<SiteLocale, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  zh: "zh_CN",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return {
    metadataBase: new URL(SITE_WEBSITE),
    title: copy.meta.home.title,
    description: copy.meta.home.description,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: "CARZONE SARL",
      locale: OG_LOCALE[locale],
      title: copy.meta.home.title,
      description: copy.meta.home.description,
      images: [{ url: "/brand/carzone-og.png", width: 1200, height: 630, alt: "CARZONE SARL" }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.meta.home.title,
      description: copy.meta.home.description,
      images: ["/brand/carzone-og.png"],
    },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return (
    <div className="site-shell" lang={locale}>
      <SiteLangSync locale={locale} />
      <OrganizationJsonLd />
      <a href="#site-main-content" className="site-skip-link">
        {copy.common.skipToContent}
      </a>
      <SiteHeader locale={locale} copy={copy} />
      <main id="site-main-content">{children}</main>
      <SiteFooter copy={copy} />
      <MobileWhatsAppBar copy={copy.quote} />
      <Analytics />
    </div>
  );
}
