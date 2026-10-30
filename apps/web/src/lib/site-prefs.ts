/** Public showcase ("vitrine") locale preferences — separate from the internal app's `Locale` (`@/lib/prefs`). */

export type SiteLocale = "fr" | "en" | "es" | "zh";

export const SITE_LOCALE_COOKIE = "carzone-site-locale";
export const DEFAULT_SITE_LOCALE: SiteLocale = "fr";

export const SITE_LOCALE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export interface SiteLocaleOption {
  code: SiteLocale;
  nativeLabel: string;
}

export const SITE_LOCALES: SiteLocaleOption[] = [
  { code: "fr", nativeLabel: "Français" },
  { code: "en", nativeLabel: "English" },
  { code: "es", nativeLabel: "Español" },
  { code: "zh", nativeLabel: "中文" },
];

export function isSiteLocale(value: string | undefined | null): value is SiteLocale {
  return value === "fr" || value === "en" || value === "es" || value === "zh";
}

export function parseAcceptLanguageSite(header: string | null | undefined): SiteLocale {
  if (!header) return DEFAULT_SITE_LOCALE;

  const parts = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number(q.split("=")[1]) || 0 : 1;
      return { tag: tag.toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of parts) {
    if (tag.startsWith("fr")) return "fr";
    if (tag.startsWith("en")) return "en";
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("zh")) return "zh";
  }
  return DEFAULT_SITE_LOCALE;
}

export function cookieWriteOptions(maxAge = SITE_LOCALE_MAX_AGE): string {
  return `Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
