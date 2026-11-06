"use client";

export function DailyAuditPrintButton() {
  return (
    <button type="button" className="ox-btn ox-btn-primary ox-btn-sm" onClick={() => window.print()}>
      Imprimer / PDF
    </button>
  );
}
