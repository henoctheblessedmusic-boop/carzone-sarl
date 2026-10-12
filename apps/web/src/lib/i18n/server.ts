import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE,
  type Locale,
  isLocale,
  parseAcceptLanguage,
} from "@/lib/prefs";
import { getMessages, type Messages } from "@/lib/i18n";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const hdrs = await headers();
  return parseAcceptLanguage(hdrs.get("accept-language"));
}

export async function getServerMessages(): Promise<{ locale: Locale; messages: Messages }> {
  const locale = await getLocale();
  return { locale, messages: getMessages(locale) };
}
