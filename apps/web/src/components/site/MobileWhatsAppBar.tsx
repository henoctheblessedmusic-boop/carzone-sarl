"use client";

import { MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";
import type { SiteCopy } from "@/lib/i18n/site/types";
import { buildQuoteWhatsAppHref } from "@/lib/site-quote";

interface MobileWhatsAppBarProps {
  copy: SiteCopy["quote"];
}

/** Barre WhatsApp fixe en bas d'écran sur mobile (conversion prioritaire). */
export function MobileWhatsAppBar({ copy }: MobileWhatsAppBarProps) {
  const href = buildQuoteWhatsAppHref(copy, null);

  return (
    <a
      className="site-mobile-wa-bar"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("cotation_whatsapp", { source: "barre_mobile" })}
    >
      <MessageCircle aria-hidden="true" size={20} />
      <span>{copy.whatsappCtaLabel}</span>
    </a>
  );
}
