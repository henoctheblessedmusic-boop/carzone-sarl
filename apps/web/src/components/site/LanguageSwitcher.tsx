"use client";

import { useRouter } from "next/navigation";
import {
  SITE_LOCALES,
  SITE_LOCALE_COOKIE,
  cookieWriteOptions,
  isSiteLocale,
  type SiteLocale,
} from "@/lib/site-prefs";

interface LanguageSwitcherProps {
  locale: SiteLocale;
  label: string;
  className?: string;
}

export function LanguageSwitcher({ locale, label, className }: LanguageSwitcherProps) {
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!isSiteLocale(next) || next === locale) return;
    document.cookie = `${SITE_LOCALE_COOKIE}=${next}; ${cookieWriteOptions()}`;
    router.refresh();
  }

  return (
    <label className={className ? `site-lang-switch ${className}` : "site-lang-switch"}>
      <span className="site-sr-only">{label}</span>
      <select
        className="site-lang-switch-select"
        value={locale}
        onChange={handleChange}
        aria-label={label}
      >
        {SITE_LOCALES.map((option) => (
          <option key={option.code} value={option.code}>
            {option.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
