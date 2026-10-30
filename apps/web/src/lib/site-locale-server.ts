import { cookies, headers } from "next/headers";
import {
  SITE_LOCALE_COOKIE,
  isSiteLocale,
  parseAcceptLanguageSite,
  type SiteLocale,
} from "@/lib/site-prefs";

/** Resolves the showcase locale for the current request: cookie first, then `Accept-Language`. */
export async function getSiteLocale(): Promise<SiteLocale> {
  const jar = await cookies();
  const fromCookie = jar.get(SITE_LOCALE_COOKIE)?.value;
  if (isSiteLocale(fromCookie)) return fromCookie;

  const hdrs = await headers();
  return parseAcceptLanguageSite(hdrs.get("accept-language"));
}
