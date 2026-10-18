"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  LOCALE_COOKIE,
  LOCALES,
  THEME_COOKIE,
  cookieWriteOptions,
  isLocale,
  isThemePref,
  type Locale,
  type ThemePref,
} from "@/lib/prefs";
import { getMessages, type Messages } from "@/lib/i18n";

type PrefsContextValue = {
  themePref: ThemePref;
  resolvedTheme: "dark" | "light";
  setThemePref: (pref: ThemePref) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieWriteOptions(COOKIE_MAX_AGE)}`;
}

function resolveTheme(pref: ThemePref): "dark" | "light" {
  if (pref === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

function applyTheme(pref: ThemePref) {
  const resolved = resolveTheme(pref);
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-theme-pref", pref);
  return resolved;
}

export function PrefsProvider({
  children,
  initialLocale,
  initialTheme,
  persistLocaleCookie,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialTheme: ThemePref;
  /** When true, write locale cookie on mount if missing (first-visit Accept-Language). */
  persistLocaleCookie?: boolean;
}) {
  const [themePref, setThemePrefState] = useState<ThemePref>(() => {
    if (initialTheme === "dark" || initialTheme === "light") return initialTheme;
    return DEFAULT_THEME;
  });
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() =>
    themePref === "light" ? "light" : "dark",
  );
  const [locale, setLocaleState] = useState<Locale>(
    isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE,
  );

  useEffect(() => {
    setResolvedTheme(applyTheme(themePref));
  }, [themePref]);

  useEffect(() => {
    if (themePref !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(applyTheme("auto"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [themePref]);

  useEffect(() => {
    document.documentElement.lang = locale;
    if (persistLocaleCookie) {
      writeCookie(LOCALE_COOKIE, locale);
    }
  }, [locale, persistLocaleCookie]);

  const setThemePref = useCallback((pref: ThemePref) => {
    setThemePrefState(pref);
    writeCookie(THEME_COOKIE, pref);
    setResolvedTheme(applyTheme(pref));
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (!LOCALES.includes(next)) return;
    setLocaleState(next);
    writeCookie(LOCALE_COOKIE, next);
    document.documentElement.lang = next;
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);

  const value = useMemo(
    () => ({
      themePref,
      resolvedTheme,
      setThemePref,
      locale,
      setLocale,
      messages,
    }),
    [themePref, resolvedTheme, setThemePref, locale, setLocale, messages],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used within PrefsProvider");
  return ctx;
}

export function useMessages() {
  return usePrefs().messages;
}
