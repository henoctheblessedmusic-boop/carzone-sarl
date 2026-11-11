"use client";

import { MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";
import type { SiteCopy } from "@/lib/i18n/site/types";
import { buildQuoteWhatsAppHref, quoteVersionTitle, type QuoteVehicle } from "@/lib/site-quote";
import { useQuoteRequest } from "./QuoteRequestProvider";

interface QuoteActionsProps {
  vehicle: QuoteVehicle | null;
  copy: SiteCopy["quote"];
  statusLabels?: Record<string, string>;
  energyLabels?: Record<string, string>;
  variant?: "default" | "card" | "hero";
  /** Code de la configuration choisie, pour la mesure. */
  configurationCode?: string | null;
}

export function QuoteActions({
  vehicle,
  copy,
  statusLabels,
  energyLabels,
  variant = "default",
  configurationCode = null,
}: QuoteActionsProps) {
  const { open } = useQuoteRequest();
  const whatsappHref = buildQuoteWhatsAppHref(copy, vehicle, null, { statusLabels, energyLabels });
  const trackingPayload = {
    source: variant,
    vehicule: vehicle ? quoteVersionTitle(vehicle) : "general",
    configuration: configurationCode ?? "",
  };

  return (
    <div className={variant === "default" ? "site-quote-actions" : `site-quote-actions site-quote-actions--${variant}`}>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="site-cta site-quote-whatsapp"
        onClick={() => track("cotation_whatsapp", trackingPayload)}
      >
        <MessageCircle aria-hidden="true" size={16} />
        {copy.whatsappCtaLabel}
      </a>
      <button
        type="button"
        className="site-cta site-cta--primary site-quote-main"
        onClick={() => {
          track("quote_click", trackingPayload);
          open(vehicle);
        }}
      >
        {copy.ctaLabel}
      </button>
    </div>
  );
}
