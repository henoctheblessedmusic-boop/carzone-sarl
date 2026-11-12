"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, Loader2, Truck } from "lucide-react";
import { transcribeRentalContract, type RentalTranscriptionResult } from "./actions";

type ExistingDocument = { id: string; number: string };

export function RentalBillingActions({
  rentalId,
  existingInvoice,
  existingDeliveryNote,
}: {
  rentalId: string;
  existingInvoice: ExistingDocument | null;
  existingDeliveryNote: ExistingDocument | null;
}) {
  const [result, setResult] = useState<RentalTranscriptionResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function transcribe(mode: "BL_INTERNE" | "FACTURE_NORMALISEE") {
    setError("");
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("rentalId", rentalId);
        formData.set("mode", mode);
        setResult(await transcribeRentalContract(formData));
      } catch (err) {
        setError(err instanceof Error ? err.message : "La transcription a échoué.");
      }
    });
  }

  const invoice = result?.invoiceId
    ? { id: result.invoiceId, number: result.invoiceNumber || "" }
    : existingInvoice;
  const deliveryNote = result?.deliveryNoteId
    ? { id: result.deliveryNoteId, number: result.deliveryNoteNumber || "" }
    : existingDeliveryNote;

  return (
    <section className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10 }}>
      <div>
        <strong>Facturation du contrat</strong>
        <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: 2 }}>
          Le BL interne et la facture normalisée utilisent les mêmes informations CARZONE. La facture est générée en mode démonstration e-MECeF.
        </div>
      </div>

      {invoice || deliveryNote ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {invoice && (
            <Link href={`/invoices/${invoice.id}/print`} className="ox-btn ox-btn-primary ox-btn-sm" target="_blank">
              <FileText size={15} /> Facture normalisée {invoice.number}
            </Link>
          )}
          {deliveryNote && (
            <Link href={`/delivery-notes/${deliveryNote.id}/print`} className="ox-btn ox-btn-ghost ox-btn-sm" target="_blank">
              <Truck size={15} /> BL interne {deliveryNote.number}
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="ox-btn ox-btn-primary ox-btn-sm" onClick={() => transcribe("FACTURE_NORMALISEE")} disabled={isPending}>
            {isPending ? <Loader2 size={15} className="ox-spin" /> : <FileText size={15} />} Facture normalisée démo
          </button>
          <button type="button" className="ox-btn ox-btn-ghost ox-btn-sm" onClick={() => transcribe("BL_INTERNE")} disabled={isPending}>
            {isPending ? <Loader2 size={15} className="ox-spin" /> : <Truck size={15} />} BL interne
          </button>
        </div>
      )}

      {result?.certificationMessage ? (
        <div style={{ fontSize: "0.78rem", color: "var(--success-fg)" }}>{result.certificationMessage}</div>
      ) : null}
      {error ? (
        <div role="alert" style={{ padding: "8px 10px", borderRadius: 8, background: "var(--danger-soft)", color: "var(--danger-fg)", fontSize: "0.8rem" }}>
          {error}
        </div>
      ) : null}
    </section>
  );
}
