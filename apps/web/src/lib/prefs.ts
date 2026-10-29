/** Theme & locale preference cookies (SSR-friendly). */

export const THEME_COOKIE = "carzone-theme";
export const LOCALE_COOKIE = "carzone-locale";

export type ThemePref = "dark" | "light" | "auto";
export type Locale = "fr" | "en" | "zh";

export const THEME_PREFS: ThemePref[] = ["dark", "light", "auto"];
export const LOCALES: Locale[] = ["fr", "en", "zh"];
export const DEFAULT_LOCALE: Locale = "fr";
export const DEFAULT_THEME: ThemePref = "dark";

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isThemePref(value: string | undefined | null): value is ThemePref {
  return value === "dark" || value === "light" || value === "auto";
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en" || value === "zh";
}

export function parseAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
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
    if (tag.startsWith("zh")) return "zh";
  }
  return DEFAULT_LOCALE;
}

export function cookieWriteOptions(maxAge = COOKIE_MAX_AGE) {
  return `Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

/** Inline script: apply data-theme before paint (avoids FOUC). Dark theme applied first; manual user choice respected. */
export const THEME_BOOT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var pref=m?decodeURIComponent(m[1]):"${DEFAULT_THEME}";if(pref==="auto"||(pref!=="dark"&&pref!=="light"))pref="${DEFAULT_THEME}";document.documentElement.setAttribute("data-theme",pref);document.documentElement.setAttribute("data-theme-pref",pref);}catch(e){}})();`;
