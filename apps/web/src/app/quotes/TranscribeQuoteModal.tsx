"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRightLeft, AlertTriangle, X, Truck, FileCheck } from "lucide-react";
import { formatXof } from "@/lib/format";
import { transcribeQuote, type TranscribeQuoteResult } from "./actions";

type TranscribeTarget = {
  id: string;
  number: string;
  totalXof: number;
  customer: { contactName: string; companyName: string | null };
};

type Mode = "BL_INTERNE" | "FACTURE_NORMALISEE";

export function TranscribeQuoteModal({
  quote,
  onClose,
}: {
  quote: TranscribeTarget;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"choice" | "confirm" | "result">("choice");
  const [mode, setMode] = useState<Mode>("BL_INTERNE");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscribeQuoteResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("id", quote.id);
        fd.set("mode", mode);
        const res = await transcribeQuote(fd);
        setResult(res);
        setStep("result");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "La transcription a échoué.");
      }
    });
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(3, 8, 15, 0.88)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "1rem",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className="ox-modal-box"
        style={{
          width: "100%",
          maxWidth: 560,
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.1rem",
          margin: "auto",
          background: "rgba(10, 24, 34, 0.98)",
          border: "1px solid var(--ice-border)",
          borderRadius: 18,
          boxShadow: "0 25px 65px rgba(0, 0, 0, 0.8)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ArrowRightLeft size={20} color="var(--gold)" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              Transcrire la proforma {quote.number}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{ background: "transparent", border: "none", color: "#fff", opacity: 0.7, cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          Client : <strong>{quote.customer.companyName || quote.customer.contactName}</strong> · Total :{" "}
          <strong>{formatXof(quote.totalXof)}</strong>
        </div>

        {step === "choice" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "0.85rem 1rem",
                  borderRadius: 10,
                  border: `1px solid ${mode === "BL_INTERNE" ? "rgba(56, 189, 248, 0.5)" : "rgba(255,255,255,0.12)"}`,
                  background: mode === "BL_INTERNE" ? "rgba(56, 189, 248, 0.08)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="transcribe-mode"
                  checked={mode === "BL_INTERNE"}
                  onChange={() => setMode("BL_INTERNE")}
                  style={{ marginTop: 4 }}
                />
                <span>
                  <strong>Transcrire en BL interne</strong>
                  <div style={{ fontSize: "0.8rem", opacity: 0.75, marginTop: 2 }}>
                    Document non fiscal de déstockage. Aucune facture n'est créée.
                  </div>
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "0.85rem 1rem",
                  borderRadius: 10,
                  border: `1px solid ${mode === "FACTURE_NORMALISEE" ? "rgba(74, 222, 128, 0.5)" : "rgba(255,255,255,0.12)"}`,
                  background: mode === "FACTURE_NORMALISEE" ? "rgba(74, 222, 128, 0.08)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="transcribe-mode"
                  checked={mode === "FACTURE_NORMALISEE"}
                  onChange={() => setMode("FACTURE_NORMALISEE")}
                  style={{ marginTop: 4 }}
                />
                <span>
                  <strong>Transcrire en facture normalisée</strong>
                  <div style={{ fontSize: "0.8rem", opacity: 0.75, marginTop: 2 }}>
                    Document fiscal certifié DGI (e-MECeF). Le BL interne lié est généré automatiquement.
                  </div>
                </span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="ox-btn ox-btn-ghost" onClick={onClose}>
                Annuler
              </button>
              <button type="button" className="ox-btn" onClick={() => setStep("confirm")}>
                Continuer
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "0.85rem 1rem",
                borderRadius: 10,
                border: "1px solid rgba(234, 179, 8, 0.4)",
                background: "rgba(234, 179, 8, 0.08)",
                fontSize: "0.85rem",
                lineHeight: 1.5,
              }}
            >
              <AlertTriangle size={18} color="#eab308" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                {mode === "FACTURE_NORMALISEE" ? (
                  <>
                    La <strong>facture normalisée</strong> est un document fiscal certifié DGI (e-MECeF).
                    Une fois émise, elle ne peut plus être corrigée directement : seul un avoir justifié
                    auprès de la DGI permet une rectification.
                  </>
                ) : (
                  <>
                    Le <strong>BL interne</strong> est un document non fiscal de déstockage. Il ne peut en
                    aucun cas servir de facture ni être présenté à l'administration fiscale.
                  </>
                )}
              </span>
            </div>

            <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
              Récapitulatif : proforma <strong>{quote.number}</strong> ·{" "}
              {quote.customer.companyName || quote.customer.contactName} ·{" "}
              <strong>{formatXof(quote.totalXof)}</strong> → transcription en{" "}
              <strong>{mode === "FACTURE_NORMALISEE" ? "facture normalisée" : "BL interne"}</strong>.
            </div>

            {error && <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                className="ox-btn ox-btn-ghost"
                disabled={isPending}
                onClick={() => setStep("choice")}
              >
                Retour
              </button>
              <button type="button" className="ox-btn" disabled={isPending} onClick={handleConfirm}>
                {isPending ? "Transcription..." : "Confirmer la transcription"}
              </button>
            </div>
          </>
        )}

        {step === "result" && result && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.88rem" }}>
              {result.mode === "FACTURE_NORMALISEE" ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ade80" }}>
                    <FileCheck size={16} />
                    Facture {result.invoiceNumber} créée.
                  </div>
                  <div style={{ opacity: 0.85 }}>{result.certificationMessage}</div>
                  {result.deliveryNoteNumber ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#38bdf8" }}>
                      <Truck size={16} />
                      BL interne {result.deliveryNoteNumber} généré.
                    </div>
                  ) : (
                    <div style={{ color: "#eab308" }}>
                      BL interne non généré : {result.deliveryNoteError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    {result.invoiceId && (
                      <Link
                        href={`/invoices/${result.invoiceId}/print`}
                        target="_blank"
                        className="ox-btn ox-btn-sm"
                      >
                        Imprimer la facture
                      </Link>
                    )}
                    {result.deliveryNoteId && (
                      <Link
                        href={`/delivery-notes/${result.deliveryNoteId}/print`}
                        target="_blank"
                        className="ox-btn ox-btn-sm ox-btn-ghost"
                      >
                        Imprimer le BL interne
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#38bdf8" }}>
                    <Truck size={16} />
                    BL interne {result.deliveryNoteNumber} créé et déstockage effectué.
                  </div>
                  {result.deliveryNoteId && (
                    <Link
                      href={`/delivery-notes/${result.deliveryNoteId}/print`}
                      target="_blank"
                      className="ox-btn ox-btn-sm"
                      style={{ alignSelf: "flex-start" }}
                    >
                      Imprimer le BL interne
                    </Link>
                  )}
                </>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="ox-btn" onClick={onClose}>
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
