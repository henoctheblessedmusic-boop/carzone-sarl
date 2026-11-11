"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type RentalModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  /** Empeche la fermeture tant qu'une action serveur est en cours. */
  busy?: boolean;
};

/**
 * Modale commune aux actions du module Location.
 *
 * Elle est rendue dans un portail sur `document.body`, et ce point est
 * structurel, pas cosmetique : les boutons qui l'ouvrent vivent dans une
 * cellule de tableau, donc dans une carte `.ox-glass`. Or la feuille de style
 * applique `.ox-glass:active { transform: translateY(1px) }`. Un `transform`
 * non nul fait de la carte le bloc conteneur de tous ses descendants en
 * `position: fixed`. Rendue en place, la modale changeait donc de repere des
 * le mousedown, se deplacait entre le mousedown et le mouseup, et le clic
 * etait delivre a l'overlay au lieu du bouton vise : Annuler, Confirmer et le
 * champ de saisie devenaient inoperants pendant que l'ecran sautait.
 * Le portail la sort definitivement de ce sous-arbre.
 */
export function RentalModal({ title, children, onClose, busy = false }: RentalModalProps) {
  const [mounted, setMounted] = useState(false);
  const pressStartedOnOverlay = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const requestClose = useCallback(() => {
    if (!busy) onClose();
  }, [busy, onClose]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  // Le portail n'existe qu'apres le montage client : rien n'est emis au rendu
  // serveur, donc aucune divergence d'hydratation.
  if (!mounted) return null;

  return createPortal(
    <div
      role="presentation"
      onMouseDown={(event) => {
        pressStartedOnOverlay.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        // Fermeture au clic exterieur uniquement si l'appui ET le relachement
        // ont eu lieu sur le fond : une selection de texte qui deborde de la
        // boite de dialogue ne ferme plus la modale par surprise.
        const closesOnBackdrop = pressStartedOnOverlay.current && event.target === event.currentTarget;
        pressStartedOnOverlay.current = false;
        if (closesOnBackdrop) requestClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        display: "grid",
        placeItems: "center",
        padding: "1rem",
        background: "var(--surface-overlay)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        overflowY: "auto",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          width: "min(720px,100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "1.2rem",
          borderRadius: 14,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <strong>{title}</strong>
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            aria-label="Fermer"
            className="ox-btn ox-btn-ghost ox-btn-sm"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
