"use client";

import { useState, useTransition } from "react";
import { X, CreditCard, Check, AlertCircle } from "lucide-react";
import { formatXof } from "@/lib/format";
import { addPayment } from "./actions";

export type InvoiceOption = {
  id: string;
  number: string;
  totalXof: number;
  paidXof: number;
  customer: {
    contactName: string;
    companyName: string | null;
  };
};

export function PaymentModal({
  invoices,
  selectedInvoiceId,
  isOpen,
  onClose,
  onSuccess,
}: {
  invoices: InvoiceOption[];
  selectedInvoiceId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [invoiceId, setInvoiceId] = useState<string>(selectedInvoiceId || invoices[0]?.id || "");
  const [amountXof, setAmountXof] = useState<number>(0);
  const [method, setMethod] = useState<string>("MTN_MOMO");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [paidAt, setPaidAt] = useState<string>(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeInvoice = invoices.find((i) => i.id === (selectedInvoiceId || invoiceId));
  const remainingXof = activeInvoice ? Math.max(0, activeInvoice.totalXof - activeInvoice.paidXof) : 0;

  // When invoice changes or modal opens, suggest the full remaining balance
  function handleSelectInvoice(id: string) {
    setInvoiceId(id);
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      setAmountXof(Math.max(0, inv.totalXof - inv.paidXof));
    }
  }

  function handleSubmit() {
    if (!activeInvoice) {
      setError("Veuillez sélectionner une facture.");
      return;
    }
    if (!amountXof || amountXof <= 0) {
      setError("Le montant du règlement doit être supérieur à 0.");
      return;
    }
    if (amountXof > remainingXof) {
      setError(`Le montant (${formatXof(amountXof)}) dépasse le solde restant dû (${formatXof(remainingXof)}).`);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("invoiceId", activeInvoice.id);
        formData.append("amountXof", String(amountXof));
        formData.append("method", method);
        formData.append("reference", reference);
        formData.append("notes", notes);
        formData.append("paidAt", paidAt);

        await addPayment(formData);
        onClose();
        if (onSuccess) onSuccess();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement du règlement";
        setError(msg);
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(5, 12, 20, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className="ox-modal-box"
        style={{
          width: "100%",
          maxWidth: 580,
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--ice-border)",
            paddingBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(74, 222, 128, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16a34a",
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                Enregistrer un Règlement
              </h3>
              <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)" }}>
                Émission de quittance d&apos;encaissement · Caisse & Banque CARZONE SARL
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            style={{ background: "transparent", border: "none", color: "var(--ice-text)", opacity: 0.7, cursor: "pointer", padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 8,
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.85rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Facture cible & Résumé */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", opacity: 0.8, marginBottom: 4 }}>
            Facture concernée *
          </label>
          <select
            className="ox-select"
            style={{ width: "100%", fontSize: "0.9rem" }}
            value={activeInvoice?.id || invoiceId}
            onChange={(e) => handleSelectInvoice(e.target.value)}
            disabled={Boolean(selectedInvoiceId) || isPending}
          >
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.number} · {inv.customer.contactName} ({formatXof(inv.totalXof)}) · Reste: {formatXof(inv.totalXof - inv.paidXof)}
              </option>
            ))}
          </select>
        </div>

        {activeInvoice && (
          <div
            className="ox-card-row"
            style={{
              padding: "0.85rem 1rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
              gap: "0.75rem",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)" }}>Total Facture</div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ice-text-strong)" }}>
                {formatXof(activeInvoice.totalXof)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)" }}>Déjà Encaissé</div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#16a34a" }}>
                {formatXof(activeInvoice.paidXof)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)" }}>Solde Restant Dû</div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: remainingXof > 0 ? "var(--gold)" : "#16a34a" }}>
                {formatXof(remainingXof)}
              </div>
            </div>
          </div>
        )}

        {/* Détails du paiement */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", opacity: 0.8, marginBottom: 4 }}>
              Montant à encaisser (FCFA) *
            </label>
            <input
              type="number"
              min="1"
              max={remainingXof || undefined}
              className="ox-input"
              style={{ width: "100%", fontSize: "0.95rem", fontWeight: 700 }}
              value={amountXof || ""}
              onChange={(e) => setAmountXof(parseInt(e.target.value) || 0)}
              disabled={isPending}
            />
            {remainingXof > 0 && amountXof !== remainingXof && (
              <button
                type="button"
                onClick={() => setAmountXof(remainingXof)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--ice)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  marginTop: 4,
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Régler la totalité du solde ({formatXof(remainingXof)})
              </button>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", opacity: 0.8, marginBottom: 4 }}>
              Mode d&apos;encaissement *
            </label>
            <select
              className="ox-select"
              style={{ width: "100%", fontSize: "0.88rem" }}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              disabled={isPending}
            >
              <option value="MTN_MOMO">MTN Mobile Money Bénin</option>
              <option value="MOOV_MONEY">Moov Money Bénin</option>
              <option value="VIREMENT_ECOBANK">Virement Ecobank Bénin</option>
              <option value="VIREMENT_BOA">Virement BOA Bénin</option>
              <option value="VIREMENT">Autre Virement Bancaire</option>
              <option value="CHEQUE">Chèque Bancaire</option>
              <option value="ESPECES">Espèces (Caisse Showroom)</option>
              <option value="CARTE">Carte Bancaire (TPE)</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", opacity: 0.8, marginBottom: 4 }}>
              Réf. Transaction / Chèque / Bordereau
            </label>
            <input
              type="text"
              className="ox-input"
              style={{ width: "100%", fontSize: "0.85rem" }}
              placeholder="Ex: MTN-849202, CHQ-BOA-7491..."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", opacity: 0.8, marginBottom: 4 }}>
              Date de paiement
            </label>
            <input
              type="date"
              className="ox-input"
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", opacity: 0.8, marginBottom: 4 }}>
            Remarques & Mémo interne
          </label>
          <input
            type="text"
            className="ox-input"
            style={{ width: "100%", fontSize: "0.85rem" }}
            placeholder="Ex: Acompte 50% commande véhicule BYD Dolphin"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "1rem",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="ox-btn ox-btn-ghost"
            disabled={isPending}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="ox-btn"
            disabled={isPending || !amountXof || amountXof <= 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 650,
              minWidth: 160,
              justifyContent: "center",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#fff",
              border: "none",
            }}
          >
            {isPending ? (
              <span>Enregistrement...</span>
            ) : (
              <>
                <Check size={18} />
                Valider l&apos;encaissement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
