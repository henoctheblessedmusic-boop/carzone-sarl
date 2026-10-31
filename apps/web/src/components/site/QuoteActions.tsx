"use client";

import { MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";
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
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="site-cta site-quote-whatsapp"
        onClick={() =>
          track("cotation_whatsapp", {
            source: variant,
            vehicule: vehicle ? [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ") : "general",
          })
        }
      >
        <MessageCircle aria-hidden="true" size={16} />
        {copy.whatsappCtaLabel}
      </a>
      <button type="button" className="site-cta site-cta--primary site-quote-main" onClick={() => open(vehicle)}>
        {copy.ctaLabel}
      </button>
    </div>
  );
}
