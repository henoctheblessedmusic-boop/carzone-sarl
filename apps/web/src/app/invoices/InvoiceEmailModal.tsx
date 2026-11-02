"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Mail, X } from "lucide-react";
import { formatXof } from "@/lib/format";
import { sendInvoiceEmail } from "./actions";

export type InvoiceEmailTarget = {
  id: string;
  number: string;
  totalXof: number;
  customer: { contactName: string; companyName: string | null; email: string | null };
  deliveryNoteNumber: string | null;
};

export function InvoiceEmailModal({
  invoice,
  onClose,
}: {
  invoice: InvoiceEmailTarget;
  onClose: () => void;
}) {
  const [emailTo, setEmailTo] = useState(invoice.customer.email || "");
  const [subject, setSubject] = useState(
    `Facture ${invoice.number}${invoice.deliveryNoteNumber ? ` et bon de livraison ${invoice.deliveryNoteNumber}` : ""} · CARZONE SARL`,
  );
  const [body, setBody] = useState(
    `Bonjour ${invoice.customer.contactName},\n\nVeuillez trouver ci-joint votre facture normalisée ${invoice.number}, d'un montant total de ${formatXof(invoice.totalXof)}.\n\nRestant à votre entière disposition,\nL'équipe CARZONE SARL\nShowroom Zone Maro-Militaire, Gbèdomidji · Cotonou, Bénin`,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("invoiceId", invoice.id);
        fd.set("emailTo", emailTo);
        fd.set("subject", subject);
        fd.set("body", body);
        await sendInvoiceEmail(fd);
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "L'envoi n'a pas abouti.");
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
        if (e.target === e.currentTarget && !isSending) onClose();
      }}
    >
      <div
        className="ox-modal-box"
        style={{
          width: "100%",
          maxWidth: 640,
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
            <Mail size={20} color="var(--gold)" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              Envoyer la facture {invoice.number} par e-mail
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            style={{ background: "transparent", border: "none", color: "#fff", opacity: 0.7, cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: "0.65rem 0.9rem",
            borderRadius: 8,
            background: "rgba(0, 120, 212, 0.08)",
            border: "1px solid rgba(0, 120, 212, 0.25)",
            fontSize: "0.78rem",
            lineHeight: 1.5,
            opacity: 0.9,
          }}
        >
          Le message est enregistré dans la boîte Mail de l'application (dossier Envoyés) avec les
          liens d'impression. Aucun envoi SMTP réel n'est effectué.
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
            Destinataire (e-mail du client) *
          </label>
          <input
            type="email"
            required
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="contact@client.bj"
            className="ox-input"
            style={{ width: "100%", fontSize: "0.88rem" }}
            disabled={isSending}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
            Objet *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="ox-input"
            style={{ width: "100%", fontSize: "0.88rem" }}
            disabled={isSending}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
            Message *
          </label>
          <textarea
            required
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="ox-input"
            style={{ width: "100%", fontSize: "0.83rem", lineHeight: 1.5, resize: "vertical" }}
            disabled={isSending}
          />
        </div>

        {error && <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            borderTop: "1px solid var(--ice-border)",
            paddingTop: 12,
          }}
        >
          <button type="button" className="ox-btn ox-btn-ghost" onClick={onClose} disabled={isSending}>
            Annuler
          </button>
          <button
            type="button"
            className="ox-btn"
            disabled={isSending || !emailTo.trim()}
            onClick={handleSubmit}
          >
            {isSending ? "Envoi..." : "Envoyer au client"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
