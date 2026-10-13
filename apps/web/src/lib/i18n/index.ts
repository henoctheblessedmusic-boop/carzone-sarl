/**
 * Lightweight i18n for CARZONE (client-safe).
 *
 * To add a language:
 * 1. Create `src/lib/i18n/messages/<code>.ts` exporting a `Messages` object (copy fr.ts).
 * 2. Register it in `dictionaries` below and add `<code>` to `Locale` in `src/lib/prefs.ts`.
 * 3. Add a label under `lang` in every dictionary (including fr/en).
 */
import type { Role } from "@/lib/roles";
import { DEFAULT_LOCALE, type Locale } from "@/lib/prefs";
import type { Messages, StepCopy } from "./types";
import { fr } from "./messages/fr";
import { en } from "./messages/en";
import { ONBOARDING_STEPS, type OnboardingStep } from "@/lib/onboarding";

export type { Messages, StepCopy };

const dictionaries: Record<Locale, Messages> = {
  fr,
  en,
};

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function roleLabel(messages: Messages, role: Role): string {
  return messages.roles[role] ?? role;
}

export function localizedOnboardingSteps(role: Role, messages: Messages): OnboardingStep[] {
  const base = ONBOARDING_STEPS[role] ?? ONBOARDING_STEPS.DG;
  const copy = messages.onboarding.steps[role] ?? messages.onboarding.steps.DG;
  return base.map((step) => {
    const t = copy[step.id];
    return t ? { ...step, label: t.label, hint: t.hint } : step;
  });
}

export type NavKey = keyof Messages["nav"];

export const NAV_KEYS_BY_HREF: Record<string, Exclude<NavKey, "aria">> = {
  "/dashboard": "dashboard",
  "/clients": "clients",
  "/leads": "leads",
  "/vehicles": "vehicles",
  "/catalog": "catalog",
  "/opportunities": "opportunities",
  "/quotes": "quotes",
  "/invoices": "invoices",
  "/rentals": "rentals",
  "/fleet": "fleet",
  "/workshop": "workshop",
  "/parts": "parts",
  "/imports": "imports",
  "/installers": "installers",
  "/charge-requests": "chargeRequests",
  "/charging": "charging",
  "/terminal": "terminal",
  "/services": "services",
  "/mailbox": "mailbox",
  "/chat": "chat",
  "/users": "users",
  "/hr": "hr",
  "/expenses": "expenses",
};

export type PageKey = keyof Messages["pages"];
