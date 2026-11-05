"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle, Printer } from "lucide-react";

function phoneDigits(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 8 ? digits : null;
}

export function RentalContractActions({
  publicUrl,
  customerEmail,
  customerPhone,
  reference,
  vehicleLabel,
  publicView = false,
}: {
  publicUrl: string;
  customerEmail: string | null;
  customerPhone: string | null;
  reference: string;
  vehicleLabel: string;
  publicView?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const subject = encodeURIComponent(`Contrat de location ${reference} - CARZONE SARL`);
  const body = encodeURIComponent(
    [
      "Bonjour,",
      "",
      `Veuillez trouver votre contrat de location ${reference} pour le véhicule ${vehicleLabel}.`,
      "Vous pouvez consulter, imprimer et signer le contrat depuis le lien ci-dessous :",
      publicUrl,
      "",
      "Pour toute question, contactez CARZONE SARL au +229 01 92 61 61 61.",
      "",
      "Cordialement,",
      "CARZONE SARL",
    ].join("\n")
  );
  const mailto = `mailto:${customerEmail || ""}?subject=${subject}&body=${body}`;
  const digits = phoneDigits(customerPhone);
  const whatsapp = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(
        `Bonjour, voici votre contrat de location ${reference} pour le véhicule ${vehicleLabel} : ${publicUrl}`
      )}`
    : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copiez ce lien :", publicUrl);
    }
  }

  return (
    <div className="ox-contract-actions ox-rental-contract-toolbar" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <button type="button" onClick={() => window.print()} className="ox-btn ox-btn-primary ox-btn-sm">
        <Printer size={15} /> Imprimer / PDF
      </button>
      {!publicView && (
        <>
          <a
            href={mailto}
            className="ox-btn ox-btn-ghost ox-btn-sm"
            title={customerEmail ? "Envoyer le contrat par e-mail" : "Ouvrir un e-mail avec le lien du contrat"}
          >
            <Mail size={15} /> Envoyer par e-mail
          </a>
          <a
            href={whatsapp || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="ox-btn ox-btn-ghost ox-btn-sm"
            aria-disabled={!whatsapp}
            title={whatsapp ? "Envoyer le contrat sur WhatsApp" : "Aucun téléphone client renseigné"}
            style={!whatsapp ? { opacity: 0.5, pointerEvents: "none" } : undefined}
          >
            <MessageCircle size={15} /> Envoyer par WhatsApp
          </a>
          <button type="button" onClick={copyLink} className="ox-btn ox-btn-ghost ox-btn-sm">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Lien copié" : "Copier le lien client"}
          </button>
        </>
      )}
    </div>
  );
}
