"use client";

import { MessageCircle } from "lucide-react";
import type { SiteCopy } from "@/lib/i18n/site/types";
import { buildQuoteWhatsAppHref, type QuoteVehicle } from "@/lib/site-quote";
import { useQuoteRequest } from "./QuoteRequestProvider";

interface QuoteActionsProps {
  vehicle: QuoteVehicle | null;
  copy: SiteCopy["quote"];
  statusLabels?: Record<string, string>;
  energyLabels?: Record<string, string>;
  variant?: "default" | "card" | "hero";
}

export function QuoteActions({ vehicle, copy, statusLabels, energyLabels, variant = "default" }: QuoteActionsProps) {
  const { open } = useQuoteRequest();
  const whatsappHref = buildQuoteWhatsAppHref(copy, vehicle, null, { statusLabels, energyLabels });

  return (
    <div className={variant === "default" ? "site-quote-actions" : `site-quote-actions site-quote-actions--${variant}`}>
      <button type="button" className="site-cta site-cta--primary site-quote-main" onClick={() => open(vehicle)}>
        {copy.ctaLabel}
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="site-cta site-cta--ghost site-quote-whatsapp"
      >
        <MessageCircle aria-hidden="true" size={16} />
        {copy.whatsappCtaLabel}
      </a>
    </div>
  );
}
