import type { SiteLocale } from "@/lib/site-prefs";

const INTL_LOCALE: Record<SiteLocale, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  zh: "zh-CN",
};

export function formatSiteNumber(value: number, locale: SiteLocale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits: 0 }).format(value);
}

export function formatSitePrice(priceXof: number, locale: SiteLocale): string {
  return `${formatSiteNumber(priceXof, locale)} FCFA`;
}
