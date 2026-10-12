import {
  DEFAULT_THEME,
  THEME_BOOT_SCRIPT,
  THEME_COOKIE,
  LOCALE_COOKIE,
  isLocale,
  isThemePref,
  parseAcceptLanguage,
  type Locale,
  type ThemePref,
} from "@/lib/prefs";
import { PrefsProvider } from "@/components/PrefsProvider";
import { cookies, headers } from "next/headers";

export async function resolvePrefs(): Promise<{
  locale: Locale;
  theme: ThemePref;
  localeFromCookie: boolean;
}> {
  const jar = await cookies();
  const themeRaw = jar.get(THEME_COOKIE)?.value;
  const theme: ThemePref = isThemePref(themeRaw) ? themeRaw : DEFAULT_THEME;

  const localeRaw = jar.get(LOCALE_COOKIE)?.value;
  if (isLocale(localeRaw)) {
    return { locale: localeRaw, theme, localeFromCookie: true };
  }

  const hdrs = await headers();
  return {
    locale: parseAcceptLanguage(hdrs.get("accept-language")),
    theme,
    localeFromCookie: false,
  };
}

export { THEME_BOOT_SCRIPT };

export function AppPrefs({
  locale,
  theme,
  persistLocaleCookie,
  children,
}: {
  locale: Locale;
  theme: ThemePref;
  persistLocaleCookie: boolean;
  children: React.ReactNode;
}) {
  return (
    <PrefsProvider
      initialLocale={locale}
      initialTheme={theme}
      persistLocaleCookie={persistLocaleCookie}
    >
      {children}
    </PrefsProvider>
  );
}
