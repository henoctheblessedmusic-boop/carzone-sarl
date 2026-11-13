"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, Loader2, Receipt, Truck } from "lucide-react";
import { transcribeRentalContract, type RentalTranscriptionResult } from "./actions";

type ExistingDocument = { id: string; number: string };

export function RentalBillingActions({
  rentalId,
  existingInternal,
  existingClient,
}: {
  rentalId: string;
  existingInternal: ExistingDocument | null;
  existingClient: ExistingDocument | null;
}) {
  const [result, setResult] = useState<RentalTranscriptionResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function transcribe(mode: "BL_INTERNE" | "BL_CLIENT") {
    setError("");
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("rentalId", rentalId);
        formData.set("mode", mode);
        setResult(await transcribeRentalContract(formData));
      } catch (err) {
        setError(err instanceof Error ? err.message : "La création du BL a échoué.");
      }
    });
  }

  const createdInternal = result?.mode === "BL_INTERNE" ? { id: result.deliveryNoteId, number: result.deliveryNoteNumber } : null;
  const createdClient = result?.mode === "BL_CLIENT" ? { id: result.deliveryNoteId, number: result.deliveryNoteNumber } : null;
  const internal = createdInternal || existingInternal;
  const client = createdClient || existingClient;

  return (
    <section className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10 }}>
      <div>
        <strong>Documents du contrat</strong>
        <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: 2 }}>
          Le BL interne sert au suivi CARZONE. Le BL client est une preuve de paiement professionnelle, sans en-tête ni identité fiscale CARZONE.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {internal ? (
          <Link href={`/delivery-notes/${internal.id}/print`} className="ox-btn ox-btn-ghost ox-btn-sm" target="_blank">
            <Truck size={15} /> BL interne {internal.number}
          </Link>
        ) : (
          <button type="button" className="ox-btn ox-btn-ghost ox-btn-sm" onClick={() => transcribe("BL_INTERNE")} disabled={isPending}>
            {isPending ? <Loader2 size={15} className="ox-spin" /> : <Truck size={15} />} Créer le BL interne
          </button>
        )}
        {client ? (
          <Link href={`/delivery-notes/${client.id}/print`} className="ox-btn ox-btn-primary ox-btn-sm" target="_blank">
            <Receipt size={15} /> BL client {client.number}
          </Link>
        ) : (
          <button type="button" className="ox-btn ox-btn-primary ox-btn-sm" onClick={() => transcribe("BL_CLIENT")} disabled={isPending}>
            {isPending ? <Loader2 size={15} className="ox-spin" /> : <FileText size={15} />} Créer le BL client
          </button>
        )}
      </div>

      {result?.message ? (
        <div style={{ fontSize: "0.78rem", color: "var(--success-fg)" }}>{result.message}</div>
      ) : null}
      {error ? (
        <div role="alert" style={{ padding: "8px 10px", borderRadius: 8, background: "var(--danger-soft)", color: "var(--danger-fg)", fontSize: "0.8rem" }}>
          {error}
        </div>
      ) : null}
    </section>
  );
}
