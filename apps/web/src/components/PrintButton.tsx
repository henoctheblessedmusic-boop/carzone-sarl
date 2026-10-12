"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="ox-btn"
      title="Ouvrir la boîte de dialogue d'impression"
    >
      Imprimer
    </button>
  );
}
