"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Printer, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  approveRentalVehicleTechSheet,
  generateRentalVehicleTechSheet,
} from "@/app/rentals/actions";

export function RentalTechSheetActions({
  vehicleId,
  vehicleTitle,
  isApproved,
}: {
  vehicleId: string;
  vehicleTitle: string;
  isApproved: boolean;
}) {
  const [shareState, setShareState] = useState<string | null>(null);

  async function shareSheet() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Fiche technique - ${vehicleTitle}`,
          text: `Fiche technique officielle CARZONE SARL - ${vehicleTitle}`,
          url,
        });
        setShareState("Fiche partagée.");
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareState("Lien copié. Vous pouvez l'envoyer au client.");
    } catch {
      setShareState("Partage annulé.");
    }
  }

  return (
    <div className="ox-tech-sheet-actions no-print" style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href="/rentals" className="ox-btn ox-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
          <ArrowLeft size={15} /> Retour au parc de location
        </Link>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => window.print()} className="ox-btn ox-btn-ghost">
            <Printer size={15} /> Imprimer / PDF
          </button>
          <button type="button" onClick={shareSheet} className="ox-btn ox-btn-ghost">
            <Share2 size={15} /> Envoyer au client
          </button>
          <form action={generateRentalVehicleTechSheet}>
            <input type="hidden" name="vehicleId" value={vehicleId} />
            <button type="submit" className="ox-btn ox-btn-ghost">
              <Sparkles size={15} /> Générer avec DeepSeek
            </button>
          </form>
          {!isApproved && (
            <form action={approveRentalVehicleTechSheet}>
              <input type="hidden" name="vehicleId" value={vehicleId} />
              <button type="submit" className="ox-btn ox-btn-primary">
                <CheckCircle2 size={15} /> Valider la fiche technique
              </button>
            </form>
          )}
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: "0.82rem", opacity: 0.8 }}>
        {isApproved
          ? "Fiche technique approuvée et sauvegardée pour ce modèle de véhicule."
          : "Fiche générée. Vérifiez les informations puis validez-la pour la sauvegarder définitivement pour ce modèle."}
      </div>
      {shareState && <div style={{ marginTop: 6, fontSize: "0.8rem", color: "var(--success-fg)" }}>{shareState}</div>}
    </div>
  );
}
