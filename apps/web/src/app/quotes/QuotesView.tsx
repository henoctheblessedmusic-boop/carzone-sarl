"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  FileText,
  Search,
  Mail,
  CheckCircle,
  FileCheck,
  Ban,
  Printer,
  AlertTriangle,
  X,
  Edit2,
  Lock,
  Tag,
  Trash2,
} from "lucide-react";
import { formatXof, formatDate } from "@/lib/format";
import {
  canConfirmOrder,
  canNormalizeInvoice,
  canSendProforma,
  canStaffVoid,
  QUOTE_STATUS_LABELS,
} from "@/lib/billing";
import { decodeDiscountFromNotes } from "@/lib/quote-discount";
import {
  sendProforma,
  confirmOrder,
  normalizeInvoice,
  voidInternally,
  deleteQuote,
} from "./actions";
import {
  QuoteCreator,
  type CustomerOption,
  type ArticleOption,
  type VehicleOption,
  type OpportunityOption,
} from "./QuoteCreator";
import { QuoteEditorModal } from "./QuoteEditorModal";

export type QuoteItem = {
  id: string;
  number: string;
  status: string;
  docKind: string;
  taxMode: string;
  taxRatePct: number;
  subtotalHtXof: number;
  taxXof: number;
  totalXof: number;
  validUntil: string | null;
  notes: string | null;
  createdAt: string;
  sentAt: string | null;
  customerId?: string;
  customer: {
    id: string;
    contactName: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
  };
  lines: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPriceXof: number;
    vehicleId?: string | null;
    vehicle?: {
      brand: string;
      model: string;
      vin: string | null;
    } | null;
  }>;
  invoice?: {
    id: string;
    number: string;
    status: string;
  } | null;
};

export function QuotesView({
  quotes,
  customers,
  articles,
  vehicles,
  opportunities,
  userRole,
}: {
  quotes: QuoteItem[];
  customers: CustomerOption[];
  articles: ArticleOption[];
  vehicles: VehicleOption[];
  opportunities: OpportunityOption[];
  userRole: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [voidModalQuoteId, setVoidModalQuoteId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [editingQuote, setEditingQuote] = useState<QuoteItem | null>(null);

  // Email sending modal states
  const [emailModalQuote, setEmailModalQuote] = useState<QuoteItem | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteQuote(id: string, number: string) {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement la facture proforma ${number} ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteQuote(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression de la proforma.");
    } finally {
      setDeletingId(null);
    }
  }

  function openEmailModal(quote: QuoteItem) {
    setEmailModalQuote(quote);
    setEmailTo(quote.customer.email || "");
    setEmailSubject(`Facture Proforma ${quote.number} — CARZONE SARL`);
    const linesSummary = quote.lines
      .map((l) => `• ${l.quantity}x ${l.description.replace(/\s*\(\s*\)/g, "").trim()} : ${formatXof(l.unitPriceXof * l.quantity)}`)
      .join("\n");
    const body = `Bonjour ${quote.customer.contactName},

Veuillez trouver ci-joint votre devis proforma ${quote.number} d'un montant total de ${formatXof(quote.totalXof)} (${quote.taxMode}).

Détail des prestations et véhicules :
${linesSummary}

Ce devis proforma est valable jusqu'au ${formatDate(quote.validUntil)}.

Conformément à nos engagements de transparence, nos Conditions Générales de Vente sont adossées en Page 2 du document officiel (garanties batterie 8 ans / véhicule 5 ans, SAV, modalités de livraison en showroom et conditions de paiement).

Restant à votre entière disposition pour validation de votre commande ou tout essai au showroom,

Bien cordialement,
L'équipe commerciale CARZONE SARL
Showrooms Akpakpa & Étoile Rouge · Cotonou, Bénin
Tél : +229 21 33 00 00 / 97 00 00 00
Web : www.topcarzone.com`;
    setEmailBody(body);
  }

  const canVoid =
    userRole === "DG" ||
    userRole === "PDG" ||
    userRole === "SG" ||
    userRole === "ADV" ||
    userRole === "RF" ||
    userRole === "RTA" ||
    userRole === "DC" ||
    userRole === "COMPTA" ||
    userRole === "ASSISTANTE_COMPTABLE" ||
    userRole === "ADMIN";

  const canDelete =
    userRole === "DG" ||
    userRole === "PDG" ||
    userRole === "SG" ||
    userRole === "ADV" ||
    userRole === "RF" ||
    userRole === "RTA" ||
    userRole === "DC" ||
    userRole === "COMPTA" ||
    userRole === "ASSISTANTE_COMPTABLE" ||
    userRole === "COMMERCIAL" ||
    userRole === "ADMIN";

  // KPIs
  const totalCount = quotes.length;
  const pendingQuotes = quotes.filter(
    (q) => q.status === "BROUILLON" || q.status === "PROFORMA_ENVOYEE" || q.status === "ENVOYE"
  );
  const confirmedQuotes = quotes.filter(
    (q) => q.status === "COMMANDE_CONFIRMEE" || q.status === "ACCEPTE"
  );
  const invoicedQuotes = quotes.filter((q) => q.status === "FACTURE_NORMALISEE");

  const potentialRevenue = pendingQuotes.reduce((sum, q) => sum + q.totalXof, 0);
  const confirmedRevenue = confirmedQuotes.reduce((sum, q) => sum + q.totalXof, 0);

  // Filtering
  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "PENDING") {
        if (!["BROUILLON", "PROFORMA_ENVOYEE", "ENVOYE"].includes(q.status)) return false;
      } else if (statusFilter === "CONFIRMED") {
        if (!["COMMANDE_CONFIRMEE", "ACCEPTE"].includes(q.status)) return false;
      } else if (statusFilter === "INVOICED") {
        if (q.status !== "FACTURE_NORMALISEE") return false;
      } else if (statusFilter === "VOID") {
        if (q.status !== "ANNULEE_INTERNE") return false;
      } else if (q.status !== statusFilter) {
        return false;
      }
    }

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const matchNumber = q.number.toLowerCase().includes(s);
      const matchClient = q.customer.contactName.toLowerCase().includes(s) ||
        (q.customer.companyName && q.customer.companyName.toLowerCase().includes(s));
      const matchLines = q.lines.some((l) => l.description.toLowerCase().includes(s));
      if (!matchNumber && !matchClient && !matchLines) return false;
    }

    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Banner & KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: "1rem",
        }}
      >
        <div
          className="ox-glass"
          style={{
            padding: "1.1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            borderRadius: 12,
            borderLeft: "4px solid var(--ice)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Total Proformas
          </div>
          <div className="ox-metric-val" style={{ fontSize: "1.6rem" }}>
            {totalCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
            Toutes périodes confondues
          </div>
        </div>

        <div
          className="ox-glass"
          style={{
            padding: "1.1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            borderRadius: 12,
            borderLeft: "4px solid #38bdf8",
          }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            En attente / Envoyées
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#38bdf8" }}>
            {pendingQuotes.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--ice)", fontWeight: 600 }}>
            {formatXof(potentialRevenue)} potentiel
          </div>
        </div>

        <div
          className="ox-glass"
          style={{
            padding: "1.1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            borderRadius: 12,
            borderLeft: "4px solid var(--gold)",
          }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            Commandes Confirmées
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--gold)" }}>
            {confirmedQuotes.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 600 }}>
            {formatXof(confirmedRevenue)} engagé ferme
          </div>
        </div>

        <div
          className="ox-glass"
          style={{
            padding: "1.1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            borderRadius: 12,
            borderLeft: "4px solid #4ade80",
          }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            Factures Normalisées
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#4ade80" }}>
            {invoicedQuotes.length}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
            Transférées en comptabilité
          </div>
        </div>
      </div>

      {/* Control Bar: Search + Filter Tabs + New Quote Button */}
      <div
        className="ox-glass"
        style={{
          padding: "1rem 1.25rem",
          borderRadius: 12,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", flex: 1 }}>
          {/* Search Bar */}
          <div
            style={{
              position: "relative",
              minWidth: 260,
              maxWidth: 380,
              flex: 1,
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.5,
              }}
            />
            <input
              type="text"
              placeholder="Rechercher par N°, client, article..."
              className="ox-input"
              style={{ width: "100%", paddingLeft: 36, fontSize: "0.85rem" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: "Toutes" },
              { id: "PENDING", label: "En cours" },
              { id: "CONFIRMED", label: "Confirmées" },
              { id: "INVOICED", label: "Normalisées" },
              { id: "VOID", label: "Annulées" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className="ox-btn ox-btn-sm"
                style={{
                  background:
                    statusFilter === tab.id
                      ? "rgba(197, 216, 228, 0.25)"
                      : "transparent",
                  color: statusFilter === tab.id ? "#fff" : "rgba(255, 255, 255, 0.65)",
                  border: statusFilter === tab.id ? "1px solid rgba(197, 216, 228, 0.4)" : "1px solid transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Creator Trigger */}
        <QuoteCreator
          customers={customers}
          articles={articles}
          vehicles={vehicles}
          opportunities={opportunities}
        />
      </div>

      {/* Quotes List Table */}
      <div className="ox-glass" style={{ borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  textAlign: "left",
                  opacity: 0.75,
                }}
              >
                <th style={{ padding: "0.85rem 1rem" }}>Proforma</th>
                <th style={{ padding: "0.85rem 1rem" }}>Client</th>
                <th style={{ padding: "0.85rem 1rem" }}>Prestations / Lignes</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Montant Total</th>
                <th style={{ padding: "0.85rem 1rem" }}>Validité</th>
                <th style={{ padding: "0.85rem 1rem" }}>Statut</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "2.5rem 1rem",
                      textAlign: "center",
                      opacity: 0.6,
                    }}
                  >
                    Aucune facture proforma ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const isLocked =
                    q.status === "COMMANDE_CONFIRMEE" ||
                    q.status === "PROFORMA_ENVOYEE" ||
                    q.status === "FACTURE_NORMALISEE";

                  return (
                    <tr
                      key={q.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* N° & Type */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: 700, color: "var(--ice-text-strong)", display: "flex", alignItems: "center", gap: 6 }}>
                          <FileText size={15} color="var(--brand)" />
                          {q.number}
                        </div>
                        <div style={{ fontSize: "0.72rem", opacity: 0.6, marginTop: 2 }}>
                          {formatDate(q.createdAt)} · {q.docKind}
                        </div>
                      </td>

                      {/* Client */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: 600 }}>{q.customer.contactName}</div>
                        {q.customer.companyName && (
                          <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                            {q.customer.companyName}
                          </div>
                        )}
                        {q.customer.phone && (
                          <div style={{ fontSize: "0.72rem", opacity: 0.55 }}>
                            {q.customer.phone}
                          </div>
                        )}
                      </td>

                      {/* Lignes aperçu */}
                      <td style={{ padding: "0.85rem 1rem", maxWidth: 280 }}>
                        <div style={{ fontSize: "0.82rem" }}>
                          {q.lines.slice(0, 2).map((l, idx) => (
                            <div
                              key={idx}
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                marginBottom: 2,
                              }}
                            >
                              • {l.quantity > 1 ? `${l.quantity}x ` : ""}
                              {l.description.replace(/\s*\(\s*\)/g, "").trim()}
                            </div>
                          ))}
                          {q.lines.length > 2 && (
                            <div style={{ fontSize: "0.72rem", opacity: 0.6, fontStyle: "italic" }}>
                              + {q.lines.length - 2} autre(s) ligne(s)
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Montants */}
                      <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                        <div style={{ fontWeight: 750, color: "var(--ice-text-strong)", fontSize: "0.95rem" }}>
                          {formatXof(q.totalXof)}
                        </div>
                        <div style={{ fontSize: "0.72rem", opacity: 0.65 }}>
                          {formatXof(q.subtotalHtXof)} HT {q.taxRatePct > 0 ? `· TVA ${q.taxRatePct}%` : ""}
                        </div>
                        {(() => {
                          const { discount } = decodeDiscountFromNotes(q.notes);
                          if (!discount || discount.type === "NONE" || discount.value <= 0) return null;
                          return (
                            <div style={{ marginTop: 3 }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  color: "var(--gold)",
                                  background: "rgba(212, 175, 55, 0.12)",
                                  border: "1px solid rgba(212, 175, 55, 0.3)",
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                <Tag size={10} />
                                {discount.type === "PERCENT" ? `Remise -${discount.value}%` : `Remise -${formatXof(discount.value)}`}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Validité */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontSize: "0.82rem" }}>{formatDate(q.validUntil)}</div>
                        {q.sentAt && (
                          <div style={{ fontSize: "0.7rem", opacity: 0.55, display: "flex", alignItems: "center", gap: 3 }}>
                            <Mail size={11} /> Envoyé
                          </div>
                        )}
                      </td>

                      {/* Statut Badge */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.6rem",
                            borderRadius: 6,
                            fontSize: "0.75rem",
                            fontWeight: 650,
                            background:
                              q.status === "FACTURE_NORMALISEE" || q.status === "COMMANDE_CONFIRMEE"
                                ? "rgba(74, 222, 128, 0.15)"
                                : q.status === "ANNULEE_INTERNE"
                                  ? "rgba(239, 68, 68, 0.15)"
                                  : q.status === "PROFORMA_ENVOYEE"
                                    ? "rgba(56, 189, 248, 0.15)"
                                    : "rgba(234, 179, 8, 0.15)",
                            color:
                              q.status === "FACTURE_NORMALISEE" || q.status === "COMMANDE_CONFIRMEE"
                                ? "#4ade80"
                                : q.status === "ANNULEE_INTERNE"
                                  ? "#ef4444"
                                  : q.status === "PROFORMA_ENVOYEE"
                                    ? "#38bdf8"
                                    : "#eab308",
                            border: `1px solid ${
                              q.status === "FACTURE_NORMALISEE" || q.status === "COMMANDE_CONFIRMEE"
                                ? "rgba(74, 222, 128, 0.3)"
                                : q.status === "ANNULEE_INTERNE"
                                  ? "rgba(239, 68, 68, 0.3)"
                                  : q.status === "PROFORMA_ENVOYEE"
                                    ? "rgba(56, 189, 248, 0.3)"
                                    : "rgba(234, 179, 8, 0.3)"
                            }`,
                          }}
                        >
                          {QUOTE_STATUS_LABELS[q.status] || q.status}
                        </span>
                        {q.invoice && (
                          <div style={{ fontSize: "0.72rem", opacity: 0.7, marginTop: 4 }}>
                            Facture : <strong>{q.invoice.number}</strong>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          {/* Imprimer / PDF */}
                          <Link
                            href={`/quotes/${q.id}/print`}
                            target="_blank"
                            className="ox-btn ox-btn-ghost ox-btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                            title="Imprimer / Télécharger PDF (Proforma + CGV + Fiche Technique)"
                          >
                            <Printer size={13} />
                            PDF
                          </Link>

                          {/* Fiche Technique si véhicule présent */}
                          {(() => {
                            const vLine = q.lines.find((l) => l.vehicleId);
                            if (!vLine?.vehicleId) return null;
                            return (
                              <Link
                                href={`/vehicles/${vLine.vehicleId}/fiche-technique`}
                                target="_blank"
                                className="ox-btn ox-btn-ghost ox-btn-sm"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  color: "var(--brand)",
                                  borderColor: "rgba(0, 120, 212, 0.3)",
                                }}
                                title="Voir la Fiche Technique officielle (FR)"
                              >
                                <FileText size={12} />
                                Fiche
                              </Link>
                            );
                          })()}

                          {/* Modifier Devis / Proforma (Figé si Commande Confirmée ou Facture Normalisée) */}
                          {q.status !== "COMMANDE_CONFIRMEE" && q.status !== "FACTURE_NORMALISEE" && q.status !== "ANNULEE_INTERNE" ? (
                            <button
                              type="button"
                              onClick={() => setEditingQuote(q)}
                              className="ox-btn ox-btn-sm"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "rgba(56, 189, 248, 0.15)",
                                color: "#38bdf8",
                                border: "1px solid rgba(56, 189, 248, 0.35)",
                              }}
                              title="Modifier ce devis / cette facture proforma"
                            >
                              <Edit2 size={13} />
                              Modifier
                            </button>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: "0.72rem",
                                padding: "0.2rem 0.5rem",
                                borderRadius: 4,
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "rgba(255, 255, 255, 0.5)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                              }}
                              title={
                                q.status === "COMMANDE_CONFIRMEE"
                                  ? "Bon de commande ferme : non modifiable (Réglementation commerciale)"
                                  : q.status === "FACTURE_NORMALISEE"
                                  ? "Facture normalisée certifiée : document fiscal figé non modifiable"
                                  : "Document annulé en interne"
                              }
                            >
                              <Lock size={11} />
                              Figé
                            </span>
                          )}

                          {/* Envoi par email avec personnalisation */}
                          {canSendProforma(q.status) && (
                            <button
                              type="button"
                              onClick={() => openEmailModal(q)}
                              className="ox-btn ox-btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                              title={`Préparer et envoyer l'e-mail avec personnalisation du texte`}
                            >
                              <Mail size={13} />
                              {q.sentAt ? "Renvoyer" : "Envoyer"}
                            </button>
                          )}

                          {/* Confirmer Commande */}
                          {canConfirmOrder(q.status) && q.status !== "BROUILLON" && (
                            <form action={confirmOrder} style={{ display: "inline" }}>
                              <input type="hidden" name="id" value={q.id} />
                              <button
                                type="submit"
                                className="ox-btn ox-btn-sm"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "rgba(212, 175, 55, 0.2)",
                                  color: "var(--gold)",
                                  border: "1px solid rgba(212, 175, 55, 0.4)",
                                }}
                                title="Valider la commande ferme du client"
                              >
                                <CheckCircle size={13} />
                                Confirmer
                              </button>
                            </form>
                          )}

                          {/* Facture normalisée */}
                          {canNormalizeInvoice(q.status) && !q.invoice && (
                            <form action={normalizeInvoice} style={{ display: "inline" }}>
                              <input type="hidden" name="id" value={q.id} />
                              <button
                                type="submit"
                                className="ox-btn ox-btn-sm"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "rgba(74, 222, 128, 0.2)",
                                  color: "#4ade80",
                                  border: "1px solid rgba(74, 222, 128, 0.4)",
                                }}
                                title="Transformer en facture normalisée"
                              >
                                <FileCheck size={13} />
                                Facturer
                              </button>
                            </form>
                          )}

                          {/* Annulation interne pour DG/Compta */}
                          {canVoid && canStaffVoid(q.status) && (
                            <button
                              type="button"
                              onClick={() => {
                                setVoidModalQuoteId(q.id);
                                setVoidReason("");
                              }}
                              className="ox-btn ox-btn-danger ox-btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
                              title="Annulation interne par la direction avec motif obligatoire"
                            >
                              <Ban size={12} />
                            </button>
                          )}

                          {/* Supprimer définitivement pour Directeur, Compta et Commercial (sauf si facture normalisée) */}
                          {canDelete && q.status !== "FACTURE_NORMALISEE" && !q.invoice && (
                            <button
                              type="button"
                              onClick={() => handleDeleteQuote(q.id, q.number)}
                              disabled={deletingId === q.id}
                              className="ox-btn ox-btn-danger ox-btn-sm"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                opacity: deletingId === q.id ? 0.5 : 1,
                              }}
                              title="Supprimer définitivement cette facture proforma"
                            >
                              <Trash2 size={12} />
                              {deletingId === q.id ? "..." : ""}
                            </button>
                          )}
                        </div>

                        {isLocked && (
                          <div
                            style={{
                              fontSize: "0.68rem",
                              opacity: 0.5,
                              marginTop: 4,
                              fontStyle: "italic",
                            }}
                          >
                            Annulation client verrouillée
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'annulation interne (DG / Compta) */}
      {voidModalQuoteId && mounted && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(3, 8, 15, 0.88)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#161b22",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 14,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              margin: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444" }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Annulation Interne d&apos;un Devis</h3>
              </div>
              <button
                onClick={() => setVoidModalQuoteId(null)}
                style={{ background: "transparent", border: "none", color: "#fff", opacity: 0.6, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              Cette action est strictement réservée à la <strong>Direction Générale</strong> et à la{" "}
              <strong>Comptabilité</strong>. Une justification écrite auditée est obligatoire (minimum 8 caractères).
            </div>

            <form action={voidInternally}>
              <input type="hidden" name="id" value={voidModalQuoteId} />
              <textarea
                name="cancelReason"
                required
                minLength={8}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Exemple: Client a décliné le modèle après essai / Changement de projet / Remplacement par PRO-..."
                className="ox-input"
                style={{ width: "100%", height: 80, fontSize: "0.85rem", marginBottom: "1rem" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setVoidModalQuoteId(null)}
                  className="ox-btn ox-btn-ghost"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={voidReason.trim().length < 8}
                  className="ox-btn ox-btn-danger"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Ban size={14} />
                  Confirmer l&apos;annulation
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL ENVOI E-MAIL AVEC PERSONNALISATION DU TEXTE & CGV */}
      {emailModalQuote && mounted && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(3, 8, 15, 0.88)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSendingEmail) {
              setEmailModalQuote(null);
            }
          }}
        >
          <div
            className="ox-modal-box"
            style={{
              width: "100%",
              maxWidth: 680,
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              margin: "auto",
              background: "rgba(10, 24, 34, 0.98)",
              border: "1px solid var(--ice-border)",
              borderRadius: 18,
              boxShadow: "0 25px 65px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--ice-border)",
                paddingBottom: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Mail size={22} color="var(--gold)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                    Envoi du Devis Proforma par E-mail
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
                    Proforma <strong>{emailModalQuote.number}</strong> · {formatXof(emailModalQuote.totalXof)} TTC
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalQuote(null)}
                disabled={isSendingEmail}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--ice-text)",
                  opacity: 0.7,
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Note informative CGV */}
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: 8,
                background: "rgba(0, 120, 212, 0.08)",
                border: "1px solid rgba(0, 120, 212, 0.25)",
                fontSize: "0.82rem",
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 650, color: "var(--ice-highlight)" }}>
                📜 Conditions Générales de Vente automatiquement adossées (Page 2)
              </div>
              <div style={{ opacity: 0.85, marginTop: 2 }}>
                Le document officiel attaché comprend les clauses contractuelles ({emailModalQuote.customer.companyName ? "Professionnel" : "Particulier"}, garanties batterie et véhicule, livraison showroom Akpakpa).
              </div>
            </div>

            <form
              action={async (formData) => {
                setIsSendingEmail(true);
                try {
                  await sendProforma(formData);
                  setEmailModalQuote(null);
                } finally {
                  setIsSendingEmail(false);
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <input type="hidden" name="id" value={emailModalQuote.id} />

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                  Destinataire (Email du client) *
                </label>
                <input
                  type="email"
                  name="emailTo"
                  required
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="contact@client.bj"
                  className="ox-input"
                  style={{ width: "100%", fontSize: "0.88rem" }}
                  disabled={isSendingEmail}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                  Objet de l&apos;e-mail *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="ox-input"
                  style={{ width: "100%", fontSize: "0.88rem" }}
                  disabled={isSendingEmail}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                  Corps du message (personnalisable selon l&apos;échange showroom) *
                </label>
                <textarea
                  name="body"
                  required
                  rows={9}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="ox-input"
                  style={{
                    width: "100%",
                    fontSize: "0.83rem",
                    lineHeight: 1.5,
                    fontFamily: "Segoe UI, sans-serif",
                    resize: "vertical",
                  }}
                  disabled={isSendingEmail}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  borderTop: "1px solid var(--ice-border)",
                  paddingTop: 12,
                  marginTop: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() => setEmailModalQuote(null)}
                  className="ox-btn ox-btn-ghost"
                  disabled={isSendingEmail}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="ox-btn"
                  disabled={isSendingEmail || !emailTo.trim()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    minWidth: 160,
                    justifyContent: "center",
                  }}
                >
                  {isSendingEmail ? (
                    <span>Envoi en cours...</span>
                  ) : (
                    <>
                      <Mail size={15} />
                      <span>Envoyer au client</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal d'édition d'une proforma */}
      {editingQuote && (
        <QuoteEditorModal
          quote={editingQuote}
          customers={customers}
          articles={articles}
          vehicles={vehicles}
          onClose={() => setEditingQuote(null)}
        />
      )}
    </div>
  );
}
