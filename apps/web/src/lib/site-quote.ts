import type { SiteCopy } from "@/lib/i18n/site/types";
import { SITE_PRIMARY_PHONE, SITE_WEBSITE, whatsAppHref } from "@/lib/site-constants";

/** Véhicule minimal utilisé pour une demande de cotation (aucun prix public). */
export interface QuoteVehicle {
  id?: string;
  brand: string;
  model: string;
  variant?: string | null;
  year?: number | null;
  energy?: string | null;
  status?: string | null;
}

export interface QuoteContact {
  name?: string;
  phone?: string;
  email?: string;
}

interface QuoteLabelMaps {
  statusLabels?: Record<string, string>;
  energyLabels?: Record<string, string>;
}

export function quoteVehicleTitle(vehicle: QuoteVehicle): string {
  return [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
}

export function buildQuoteWhatsAppMessage(
  copy: SiteCopy["quote"],
  vehicle: QuoteVehicle | null,
  contact?: QuoteContact | null,
  maps?: QuoteLabelMaps,
): string {
  const lines: string[] = [];

  if (vehicle) {
    const title = quoteVehicleTitle(vehicle);
    lines.push(copy.whatsapp.introWithVehicleTemplate.replace("{vehicle}", title));

    const details = [
      vehicle.year ? String(vehicle.year) : null,
      vehicle.energy ? maps?.energyLabels?.[vehicle.energy] ?? vehicle.energy : null,
      vehicle.status ? maps?.statusLabels?.[vehicle.status] ?? vehicle.status : null,
    ].filter((detail): detail is string => Boolean(detail));

    lines.push("");
    lines.push(`${copy.whatsapp.detailsLabel} : ${title}${details.length ? ` · ${details.join(" · ")}` : ""}`);
    lines.push(`${copy.whatsapp.linkLabel} : ${SITE_WEBSITE.replace(/\/$/, "")}/vehicules`);
  } else {
    lines.push(copy.whatsapp.introGeneric);
  }

  const contactLines = [
    contact?.name?.trim() ? `${copy.whatsapp.contactNameLabel} : ${contact.name.trim()}` : null,
    contact?.phone?.trim() ? `${copy.whatsapp.contactPhoneLabel} : ${contact.phone.trim()}` : null,
    contact?.email?.trim() ? `${copy.whatsapp.contactEmailLabel} : ${contact.email.trim()}` : null,
  ].filter((line): line is string => Boolean(line));

  if (contactLines.length > 0) {
    lines.push("");
    lines.push(...contactLines);
  }

  return lines.join("\n");
}

export function buildQuoteWhatsAppHref(
  copy: SiteCopy["quote"],
  vehicle: QuoteVehicle | null,
  contact?: QuoteContact | null,
  maps?: QuoteLabelMaps,
  phone: string = SITE_PRIMARY_PHONE,
): string {
  return whatsAppHref(phone, buildQuoteWhatsAppMessage(copy, vehicle, contact, maps));
}
