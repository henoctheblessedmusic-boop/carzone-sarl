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
  ArrowRightLeft,
  Truck,
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
  type PartOption,
  type VehicleBrandOption,
  type OpportunityOption,
} from "./QuoteCreator";
import { QuoteEditorModal } from "./QuoteEditorModal";
import { TranscribeQuoteModal } from "./TranscribeQuoteModal";

export type QuoteItem = {
  id: string;
  number: string;
  status: string;
  docKind: string;
  activity: string;
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
    lineType?: string | null;
    partItemId?: string | null;
    laborHours?: number | null;
    unitLabel?: string | null;
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
  transcribedAt?: string | null;
  transcriptionMode?: string | null;
  deliveryNotes?: Array<{ id: string; number: string; status: string }>;
};

export function QuotesView({
  quotes,
  customers,
  articles,
  vehicles,
  parts = [],
  vehicleBrands = [],
  opportunities,
  userRole,
  scope,
}: {
  quotes: QuoteItem[];
  customers: CustomerOption[];
  articles: ArticleOption[];
  vehicles: VehicleOption[];
  parts?: PartOption[];
  vehicleBrands?: VehicleBrandOption[];
  opportunities: OpportunityOption[];
  userRole: string;
  scope: "SHOWROOM" | "GARAGE";
}) {
  const { locale } = usePrefs();
  const copy = quotesCopy[locale];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activityFilter, setActivityFilter] = useState<"ALL" | "SHOWROOM" | "GARAGE">("ALL");
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
  const [transcribeTarget, setTranscribeTarget] = useState<QuoteItem | null>(null);

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

  // Transcription (BL interne / facture normalisée) : réservée aux rôles qui gèrent les BL
  // (cf. lib/permissions.ts peutGererBL). La Comptable Garage ne transcrit que le périmètre GARAGE.
  // Doit rester le reflet exact de peutGererBL() dans lib/permissions.ts : ADMIN n'y figure
  // pas (seuls les super-admins DEVELOPER/DG/PDG/SG et la Comptabilité ont des droits BL).
  const canTranscribeRole =
    userRole === "DEVELOPER" ||
    userRole === "DG" ||
    userRole === "PDG" ||
    userRole === "SG" ||
    userRole === "COMPTA" ||
    userRole === "COMPTA_GARAGE";

  function canTranscribeQuote(q: QuoteItem): boolean {
    if (!canTranscribeRole) return false;
    if (userRole === "COMPTA_GARAGE" && q.activity !== "GARAGE") return false;
    if (q.status === "ANNULEE_INTERNE" || q.status === "FACTURE_NORMALISEE") return false;
    if (q.invoice || q.transcribedAt) return false;
    return true;
  }

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
  const showActivityToggle = quotes.some((q) => q.activity === "GARAGE");
  const filteredQuotes = quotes.filter((q) => {
    if (activityFilter !== "ALL" && q.activity !== activityFilter) return false;
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
            borderLeft: "4px solid var(--info)",
          }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            {copy.list.kpi.pendingLabel}
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--info-fg)" }}>
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
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--gold-fg)" }}>
            {confirmedQuotes.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--gold-fg)", fontWeight: 600 }}>
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
            borderLeft: "4px solid var(--success)",
          }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            {copy.list.kpi.invoicedLabel}
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--success-fg)" }}>
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
                      ? "var(--info-soft)"
                      : "transparent",
                  color: statusFilter === tab.id ? "var(--text-strong)" : "var(--text-muted)",
                  border: statusFilter === tab.id ? "1px solid var(--info)" : "1px solid transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {showActivityToggle && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[
                { id: "ALL" as const, label: "Toutes" },
                { id: "SHOWROOM" as const, label: "Showroom" },
                { id: "GARAGE" as const, label: "Garage" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivityFilter(tab.id)}
                  className="ox-btn ox-btn-sm"
                  style={{
                    background:
                      activityFilter === tab.id ? "var(--info-soft)" : "transparent",
                    color: activityFilter === tab.id ? "var(--text-strong)" : "var(--text-muted)",
                    border:
                      activityFilter === tab.id
                        ? "1px solid var(--info)"
                        : "1px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Creator Trigger */}
        <QuoteCreator
          customers={customers}
          articles={articles}
          vehicles={vehicles}
          parts={parts}
          vehicleBrands={vehicleBrands}
          opportunities={opportunities}
          scope={scope}
        />
      </div>

      {/* Quotes List Table */}
      <div className="ox-glass" style={{ borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr
                style={{
                  background: "var(--surface-soft)",
                  borderBottom: "1px solid var(--border)",
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
                        borderBottom: "1px solid var(--border)",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* N° & Type */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: 700, color: "var(--ice-text-strong)", display: "flex", alignItems: "center", gap: 6 }}>
                          <FileText size={15} color="var(--accent-fg)" />
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
                                  color: "var(--gold-fg)",
                                  background: "var(--gold-soft)",
                                  border: "1px solid var(--gold)",
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
                                ? "var(--success-soft)"
                                : q.status === "ANNULEE_INTERNE"
                                  ? "var(--danger-soft)"
                                  : q.status === "PROFORMA_ENVOYEE"
                                    ? "var(--info-soft)"
                                    : "var(--warning-soft)",
                            color:
                              q.status === "FACTURE_NORMALISEE" || q.status === "COMMANDE_CONFIRMEE"
                                ? "var(--success-fg)"
                                : q.status === "ANNULEE_INTERNE"
                                  ? "var(--danger-fg)"
                                  : q.status === "PROFORMA_ENVOYEE"
                                    ? "var(--info-fg)"
                                    : "var(--warning-fg)",
                            border: `1px solid ${
                              q.status === "FACTURE_NORMALISEE" || q.status === "COMMANDE_CONFIRMEE"
                                ? "var(--success)"
                                : q.status === "ANNULEE_INTERNE"
                                  ? "var(--danger)"
                                  : q.status === "PROFORMA_ENVOYEE"
                                    ? "var(--info)"
                                    : "var(--warning)"
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
                                  color: "var(--accent-fg)",
                                  borderColor: "var(--info)",
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
                                background: "var(--info-soft)",
                                color: "var(--info-fg)",
                                border: "1px solid var(--info)",
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
                                background: "var(--surface-soft)",
                                color: "var(--text-subtle)",
                                border: "1px solid var(--border)",
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
                                  background: "var(--gold-soft)",
                                  color: "var(--gold-fg)",
                                  border: "1px solid var(--gold)",
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
                                  background: "var(--success-soft)",
                                  color: "var(--success-fg)",
                                  border: "1px solid var(--success)",
                                }}
                                title={copy.list.actions.invoiceTitle}
                              >
                                <FileCheck size={13} />
                                {copy.list.actions.invoiceLabel}
                              </button>
                            </form>
                          )}

                          {/* Transcription en BL interne ou facture normalisée */}
                          {canTranscribeQuote(q) && (
                            <button
                              type="button"
                              onClick={() => setTranscribeTarget(q)}
                              className="ox-btn ox-btn-sm"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "var(--info-soft)",
                                color: "var(--info-fg)",
                                border: "1px solid var(--info)",
                              }}
                              title="Transcrire en BL interne ou en facture normalisée"
                            >
                              <ArrowRightLeft size={13} />
                              Transcrire
                            </button>
                          )}

                          {/* BL interne issu d'une transcription */}
                          {q.transcriptionMode === "BL_INTERNE" && q.deliveryNotes && q.deliveryNotes[0] && (
                            <Link
                              href={`/delivery-notes/${q.deliveryNotes[0].id}/print`}
                              target="_blank"
                              className="ox-btn ox-btn-ghost ox-btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                              title="Imprimer le BL interne"
                            >
                              <Truck size={13} />
                              BL
                            </Link>
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
            backgroundColor: "var(--surface)",
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
              background: "var(--surface)",
              border: "1px solid var(--danger)",
              borderRadius: 14,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              margin: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--danger-fg)" }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{copy.list.voidModal.title}</h3>
              </div>
              <button
                onClick={() => setVoidModalQuoteId(null)}
                style={{ background: "transparent", border: "none", color: "var(--surface)", opacity: 0.6, cursor: "pointer" }}
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
            backgroundColor: "var(--surface)",
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
              background: "var(--surface)",
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
                <Mail size={22} color="var(--gold-fg)" />
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
                background: "var(--info-soft)",
                border: "1px solid var(--info)",
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

      {/* Modale de transcription en BL interne / facture normalisée */}
      {transcribeTarget && mounted && (
        <TranscribeQuoteModal
          quote={transcribeTarget}
          onClose={() => setTranscribeTarget(null)}
        />
      )}

      {/* Modal d'édition d'une proforma */}
      {editingQuote && (
        <QuoteEditorModal
          quote={editingQuote}
          customers={customers}
          articles={articles}
          vehicles={vehicles}
          scope={scope}
          onClose={() => setEditingQuote(null)}
        />
      )}
    </div>
  );
}
