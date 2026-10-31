"use client";

import type { SiteCopy } from "@/lib/i18n/site/types";
import { useQuoteRequest } from "./QuoteRequestProvider";

interface QuoteOpenButtonProps {
  copy: SiteCopy["quote"];
}

/** Bouton générique (sans véhicule) pour ouvrir la modale de cotation. */
export function QuoteOpenButton({ copy }: QuoteOpenButtonProps) {
  const { open } = useQuoteRequest();

  return (
    <button type="button" className="site-cta site-cta--primary" onClick={() => open(null)}>
      {copy.ctaLabel}
    </button>
  );
}
