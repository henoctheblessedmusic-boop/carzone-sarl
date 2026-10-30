import type { SiteLocale } from "@/lib/site-prefs";
import type { SiteCopy } from "./types";
import { fr } from "./fr";
import { en } from "./en";
import { es } from "./es";
import { zh } from "./zh";

export type { SiteCopy };

export const siteCopy: Record<SiteLocale, SiteCopy> = { fr, en, es, zh };
