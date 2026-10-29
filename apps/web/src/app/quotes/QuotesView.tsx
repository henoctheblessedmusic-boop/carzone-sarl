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
import { formatXof } from "@/lib/format";
import {
  canConfirmOrder,
  canNormalizeInvoice,
  canSendProforma,
  canStaffVoid,
} from "@/lib/billing";
import { usePrefs } from "@/components/PrefsProvider";
import { quotesCopy, formatQuoteDate } from "@/lib/i18n/messages/quotes";
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
  const { locale } = usePrefs();
  const copy = quotesCopy[locale];

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
    if (!window.confirm(copy.list.actions.deleteConfirm(number))) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteQuote(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : copy.list.actions.deleteError);
    } finally {
      setDeletingId(null);
    }
  }

  function openEmailModal(quote: QuoteItem) {
    setEmailModalQuote(quote);
    setEmailTo(quote.customer.email || "");
    setEmailSubject(copy.list.emailModal.defaultSubject(quote.number));
    const linesSummary = quote.lines
      .map((l) => `• ${l.quantity}x ${l.description.replace(/\s*\(\s*\)/g, "").trim()} : ${formatXof(l.unitPriceXof * l.quantity)}`)
      .join("\n");
    const body = copy.list.emailModal.defaultBody({
      contactName: quote.customer.contactName,
      number: quote.number,
      total: formatXof(quote.totalXof),
      taxMode: quote.taxMode,
      linesSummary,
      validUntil: formatQuoteDate(copy, quote.validUntil),
    });
    setEmailBody(body);
  }

  const canVoid =
    userRole === "DEVELOPER" ||
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
    userRole === "DEVELOPER" ||
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
            {copy.list.kpi.totalLabel}
          </div>
          <div className="ox-metric-val" style={{ fontSize: "1.6rem" }}>
            {totalCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
            {copy.list.kpi.totalHint}
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
            {copy.list.kpi.pendingLabel}
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#38bdf8" }}>
            {pendingQuotes.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--ice)", fontWeight: 600 }}>
            {copy.list.kpi.pendingHint(formatXof(potentialRevenue))}
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
            {copy.list.kpi.confirmedLabel}
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--gold)" }}>
            {confirmedQuotes.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 600 }}>
            {copy.list.kpi.confirmedHint(formatXof(confirmedRevenue))}
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
            {copy.list.kpi.invoicedLabel}
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#4ade80" }}>
            {invoicedQuotes.length}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
            {copy.list.kpi.invoicedHint}
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
              placeholder={copy.list.searchPlaceholder}
              className="ox-input"
              style={{ width: "100%", paddingLeft: 36, fontSize: "0.85rem" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: copy.list.filters.all },
              { id: "PENDING", label: copy.list.filters.pending },
              { id: "CONFIRMED", label: copy.list.filters.confirmed },
              { id: "INVOICED", label: copy.list.filters.invoiced },
              { id: "VOID", label: copy.list.filters.voided },
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
                <th style={{ padding: "0.85rem 1rem" }}>{copy.list.table.proforma}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.list.table.client}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.list.table.items}</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>{copy.list.table.total}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.list.table.validity}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.list.table.status}</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>{copy.list.table.actions}</th>
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
                    {copy.list.empty}
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
                          {formatQuoteDate(copy, q.createdAt)} · {copy.docKinds[q.docKind] || q.docKind}
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
                              {copy.list.moreLines(q.lines.length - 2)}
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
                          {formatXof(q.subtotalHtXof)} {copy.list.amountBase} {q.taxRatePct > 0 ? copy.list.amountVat(q.taxRatePct) : ""}
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
                                {discount.type === "PERCENT" ? copy.list.discountPercent(discount.value) : copy.list.discountAmount(formatXof(discount.value))}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Validité */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontSize: "0.82rem" }}>{formatQuoteDate(copy, q.validUntil)}</div>
                        {q.sentAt && (
                          <div style={{ fontSize: "0.7rem", opacity: 0.55, display: "flex", alignItems: "center", gap: 3 }}>
                            <Mail size={11} /> {copy.list.sent}
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
                          {copy.statuses[q.status] || q.status}
                        </span>
                        {q.invoice && (
                          <div style={{ fontSize: "0.72rem", opacity: 0.7, marginTop: 4 }}>
                            {copy.list.invoiceRef(q.invoice.number)}
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
                            title={copy.list.actions.pdfTitle}
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
                                className="ox-btn ox-btn-ghost ox-btn-sm"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  color: "var(--brand)",
                                  borderColor: "rgba(0, 120, 212, 0.3)",
                                }}
                                title={copy.list.actions.ficheTitle}
                              >
                                <FileText size={12} />
                                {copy.list.actions.ficheLabel}
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
                              title={copy.list.actions.editTitle}
                            >
                              <Edit2 size={13} />
                              {copy.list.actions.editLabel}
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
                                  ? copy.list.actions.lockedConfirmedTitle
                                  : q.status === "FACTURE_NORMALISEE"
                                  ? copy.list.actions.lockedInvoicedTitle
                                  : copy.list.actions.lockedCancelledTitle
                              }
                            >
                              <Lock size={11} />
                              {copy.list.actions.lockedLabel}
                            </span>
                          )}

                          {/* Envoi par email avec personnalisation */}
                          {canSendProforma(q.status) && (
                            <button
                              type="button"
                              onClick={() => openEmailModal(q)}
                              className="ox-btn ox-btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                              title={copy.list.actions.sendTitle}
                            >
                              <Mail size={13} />
                              {q.sentAt ? copy.list.actions.resendLabel : copy.list.actions.sendLabel}
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
                                title={copy.list.actions.confirmTitle}
                              >
                                <CheckCircle size={13} />
                                {copy.list.actions.confirmLabel}
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
                                title={copy.list.actions.invoiceTitle}
                              >
                                <FileCheck size={13} />
                                {copy.list.actions.invoiceLabel}
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
                              title={copy.list.actions.voidTitle}
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
                              title={copy.list.actions.deleteTitle}
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
                            {copy.list.actions.clientCancelLocked}
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
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{copy.list.voidModal.title}</h3>
              </div>
              <button
                onClick={() => setVoidModalQuoteId(null)}
                style={{ background: "transparent", border: "none", color: "#fff", opacity: 0.6, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              {copy.list.voidModal.bodyLead}
              <strong>{copy.list.voidModal.roleDirection}</strong>
              {copy.list.voidModal.bodyMiddle}
              <strong>{copy.list.voidModal.roleAccounting}</strong>
              {copy.list.voidModal.bodyTail}
            </div>

            <form action={voidInternally}>
              <input type="hidden" name="id" value={voidModalQuoteId} />
              <textarea
                name="cancelReason"
                required
                minLength={8}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder={copy.list.voidModal.reasonPlaceholder}
                className="ox-input"
                style={{ width: "100%", height: 80, fontSize: "0.85rem", marginBottom: "1rem" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setVoidModalQuoteId(null)}
                  className="ox-btn ox-btn-ghost"
                >
                  {copy.common.close}
                </button>
                <button
                  type="submit"
                  disabled={voidReason.trim().length < 8}
                  className="ox-btn ox-btn-danger"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Ban size={14} />
                  {copy.list.voidModal.confirm}
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
                    {copy.list.emailModal.title}
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
                    {copy.list.emailModal.subtitleLead} <strong>{emailModalQuote.number}</strong> · {formatXof(emailModalQuote.totalXof)} {copy.list.emailModal.taxIncluded}
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
                📜 {copy.list.emailModal.cgvTitle}
              </div>
              <div style={{ opacity: 0.85, marginTop: 2 }}>
                {copy.list.emailModal.cgvBody(Boolean(emailModalQuote.customer.companyName))}
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
                  {copy.list.emailModal.toLabel}
                </label>
                <input
                  type="email"
                  name="emailTo"
                  required
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder={copy.list.emailModal.toPlaceholder}
                  className="ox-input"
                  style={{ width: "100%", fontSize: "0.88rem" }}
                  disabled={isSendingEmail}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                  {copy.list.emailModal.subjectLabel}
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
                  {copy.list.emailModal.bodyLabel}
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
                  {copy.common.cancel}
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
                    <span>{copy.list.emailModal.sending}</span>
                  ) : (
                    <>
                      <Mail size={15} />
                      <span>{copy.list.emailModal.send}</span>
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
