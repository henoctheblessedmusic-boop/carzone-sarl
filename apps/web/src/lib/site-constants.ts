/** Factual company data shared across the public showcase (all locales). Source: CLAUDE.md. */

export const SITE_PHONES = [
  "+229 01 92 61 61 61",
  "+229 01 63 70 00 00",
  "+229 01 92 62 62 62",
] as const;

export const SITE_PRIMARY_PHONE = SITE_PHONES[0];

export const SITE_EMAILS = {
  contact: "contact@topcarzone.com",
  direction: "direction@topcarzone.com",
} as const;

export const SITE_ADDRESS = {
  line1: "Zone Maro-Militaire",
  line2: "Quartier Gbèdomidji",
  city: "Cotonou",
  country: "Bénin",
} as const;

export const SITE_MAPS_URL = "https://maps.app.goo.gl/ie79JAW6ri2km8Qx8?g_st=ac";
export const SITE_WEBSITE = "https://www.topcarzone.com";

/** Facebook has no confirmed official URL — shown as plain text. Instagram URL is confirmed and linked. */
export const SITE_SOCIAL = {
  instagram: "@carzone_229",
  instagramUrl: "https://www.instagram.com/carzone_229",
  facebook: "CarZone Cotonou",
} as const;

export const SITE_FISCAL = {
  ifu: "0202314589201",
  rccm: "RB/COT/23 B 34567",
} as const;

export const SITE_BRANDS = [
  "Changan",
  "Deepal",
  "Jetour",
  "BYD",
  "Geely",
  "BAIC",
  "Forthing",
  "Chery",
  "Toyota",
] as const;

export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function whatsAppHref(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
