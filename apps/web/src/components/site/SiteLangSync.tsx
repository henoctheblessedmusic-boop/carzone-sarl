"use client";

import { useEffect } from "react";
import type { SiteLocale } from "@/lib/site-prefs";

/** Keeps `<html lang>` aligned with the showcase locale without touching the internal app's root layout. */
export function SiteLangSync({ locale }: { locale: SiteLocale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
