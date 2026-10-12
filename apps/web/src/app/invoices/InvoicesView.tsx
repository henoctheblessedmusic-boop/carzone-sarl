"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CreditCard,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Ban,
  X,
  FileCheck,
  Download,
  TrendingUp,
} from "lucide-react";
import { formatXof, formatDate } from "@/lib/format";
import { voidInvoice, certifyInvoiceDgi } from "./actions";
import { PaymentModal, type InvoiceOption } from "./PaymentModal";
import {
  FinancialBilanTab,
  type ExpenseItem,
  type SalaryItem,
  type VehicleStat,
  type WorkOrderStat,
} from "./FinancialBilanTab";

export type InvoiceItem = {
  id: string;
  number: string;
  status: string;
  kind: string;
  taxMode: string;
  taxRatePct: number;
  subtotalHtXof: number;
  taxXof: number;
  totalXof: number;
  paidXof: number;
  dueDate: string | null;
  createdAt: string;
  isFiscalCertified?: boolean;
  mecefCode?: string | null;
  mecefNim?: string | null;
  mecefQrCode?: string | null;
  customer: {
    id: string;
    contactName: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
  };
  quote?: {
    id: string;
    number: string;
  } | null;
  payments: Array<{
    id: string;
    amountXof: number;
    method: string;
    reference: string | null;
    paidAt: string;
    notes: string | null;
  }>;
};

export type PaymentRow = {
  id: string;
  amountXof: number;
  method: string;
  reference: string | null;
  paidAt: string;
  notes: string | null;
  invoice: {
    id: string;
    number: string;
    totalXof: number;
    customer: {
      contactName: string;
      companyName: string | null;
    };
  };
};

const PAYMENT_METHOD_LABELS: Record<string, { label: string; color: string }> = {
  MTN_MOMO: { label: "MTN MoMo", color: "#f59e0b" },
  MOOV_MONEY: { label: "Moov Money", color: "#3b82f6" },
  MOBILE_MONEY: { label: "Mobile Money", color: "#f59e0b" },
  VIREMENT_ECOBANK: { label: "Virement Ecobank", color: "#10b981" },
  VIREMENT_BOA: { label: "Virement BOA", color: "#10b981" },
  VIREMENT: { label: "Virement Bancaire", color: "#10b981" },
  CHEQUE: { label: "Chèque", color: "#8b5cf6" },
  ESPECES: { label: "Espèces (Caisse)", color: "#14b8a6" },
  CARTE: { label: "Carte Bancaire", color: "#ec4899" },
};

export function InvoicesView({
  invoices,
  allPayments,
  expenses = [],
  salaries = [],
  vehicles = [],
  workOrders = [],
  currentYear = new Date().getFullYear(),
  userRole,
}: {
  invoices: InvoiceItem[];
  allPayments: PaymentRow[];
  expenses?: ExpenseItem[];
  salaries?: SalaryItem[];
  vehicles?: VehicleStat[];
  workOrders?: WorkOrderStat[];
  currentYear?: number;
  userRole: string;
}) {
  const [activeTab, setActiveTab] = useState<"INVOICES" | "PAYMENTS" | "BILAN">("INVOICES");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetInvoiceId, setTargetInvoiceId] = useState<string | null>(null);

  // Void modal state
  const [voidModalInvoiceId, setVoidModalInvoiceId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const canVoid =
    userRole === "DG" ||
    userRole === "PDG" ||
    userRole === "SG" ||
    userRole === "ADV" ||
    userRole === "RF" ||
    userRole === "COMPTA";

  const canExportFinancials =
    userRole === "DG" ||
    userRole === "PDG" ||
    userRole === "SG" ||
    userRole === "ADV" ||
    userRole === "RF" ||
    userRole === "COMPTA";

  // KPIs
  const totalInvoicedTtc = invoices
    .filter((i) => i.status !== "ANNULEE")
    .reduce((s, i) => s + i.totalXof, 0);

  const totalCollected = invoices
    .filter((i) => i.status !== "ANNULEE")
    .reduce((s, i) => s + i.paidXof, 0);

  const totalOutstanding = Math.max(0, totalInvoicedTtc - totalCollected);

  const overdueCount = invoices.filter((i) => i.status === "EN_RETARD").length;
  const fullyPaidCount = invoices.filter((i) => i.status === "PAYEE").length;

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "UNPAID") {
        if (inv.status === "PAYEE" || inv.status === "ANNULEE") return false;
      } else if (statusFilter === "PAID") {
        if (inv.status !== "PAYEE") return false;
      } else if (statusFilter === "OVERDUE") {
        if (inv.status !== "EN_RETARD") return false;
      } else if (statusFilter === "VOID") {
        if (inv.status !== "ANNULEE") return false;
      } else if (inv.status !== statusFilter) {
        return false;
      }
    }

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const matchNum = inv.number.toLowerCase().includes(s);
      const matchQuote = inv.quote?.number.toLowerCase().includes(s);
      const matchClient =
        inv.customer.contactName.toLowerCase().includes(s) ||
        (inv.customer.companyName && inv.customer.companyName.toLowerCase().includes(s));
      if (!matchNum && !matchQuote && !matchClient) return false;
    }

    return true;
  });

  // Filtered payments
  const filteredPayments = allPayments.filter((p) => {
    if (methodFilter !== "ALL") {
      if (p.method !== methodFilter) return false;
    }

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const matchInv = p.invoice.number.toLowerCase().includes(s);
      const matchRef = p.reference ? p.reference.toLowerCase().includes(s) : false;
      const matchClient =
        p.invoice.customer.contactName.toLowerCase().includes(s) ||
        (p.invoice.customer.companyName &&
          p.invoice.customer.companyName.toLowerCase().includes(s));
      if (!matchInv && !matchRef && !matchClient) return false;
    }

    return true;
  });

  // Invoice options for the PaymentModal
  const unpaidInvoiceOptions: InvoiceOption[] = invoices
    .filter((i) => i.status !== "ANNULEE" && i.paidXof < i.totalXof)
    .map((i) => ({
      id: i.id,
      number: i.number,
      totalXof: i.totalXof,
      paidXof: i.paidXof,
      customer: {
        contactName: i.customer.contactName,
        companyName: i.customer.companyName,
      },
    }));

  function openPaymentForInvoice(id: string) {
    setTargetInvoiceId(id);
    setIsPaymentModalOpen(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* KPI Cards */}
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
            Total Facturé TTC
          </div>
          <div className="ox-metric-val" style={{ fontSize: "1.6rem" }}>
            {formatXof(totalInvoicedTtc)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
            {invoices.length} facture(s) émises
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
            borderLeft: "4px solid #10b981",
          }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            Total Encaissé
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981" }}>
            {formatXof(totalCollected)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>
            {fullyPaidCount} facture(s) entièrement soldée(s)
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
            Créances / Reste à Encaisser
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: totalOutstanding > 0 ? "var(--gold)" : "#10b981" }}>
            {formatXof(totalOutstanding)}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
            Solde restant dû à recouvrer
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
            borderLeft: "4px solid #ef4444",
          }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            Factures en Retard
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: overdueCount > 0 ? "#ef4444" : "#4ade80" }}>
            {overdueCount}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
            Dépassement de la date d&apos;échéance
          </div>
        </div>
      </div>

      {/* Main Switcher: Factures vs Règlements */}
      <div
        className="ox-glass"
        style={{
          padding: "0.5rem",
          borderRadius: 12,
          display: "flex",
          gap: 6,
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("INVOICES")}
          className="ox-btn"
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "0.75rem 1.25rem",
            borderRadius: 8,
            fontWeight: 650,
            background:
              activeTab === "INVOICES"
                ? "linear-gradient(135deg, rgba(197, 216, 228, 0.25) 0%, rgba(197, 216, 228, 0.1) 100%)"
                : "transparent",
            color: activeTab === "INVOICES" ? "#fff" : "rgba(255, 255, 255, 0.6)",
            border: activeTab === "INVOICES" ? "1px solid rgba(197, 216, 228, 0.3)" : "none",
          }}
        >
          <FileText size={18} />
          Factures Commerciales ({invoices.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PAYMENTS")}
          className="ox-btn"
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "0.75rem 1.25rem",
            borderRadius: 8,
            fontWeight: 650,
            background:
              activeTab === "PAYMENTS"
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 100%)"
                : "transparent",
            color: activeTab === "PAYMENTS" ? "#10b981" : "rgba(255, 255, 255, 0.6)",
            border: activeTab === "PAYMENTS" ? "1px solid rgba(16, 185, 129, 0.3)" : "none",
          }}
        >
          <CreditCard size={18} />
          Règlements & Quittances ({allPayments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("BILAN")}
          className="ox-btn"
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "0.75rem 1.25rem",
            borderRadius: 8,
            fontWeight: 650,
            background:
              activeTab === "BILAN"
                ? "linear-gradient(135deg, rgba(0, 120, 212, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%)"
                : "transparent",
            color: activeTab === "BILAN" ? "#38bdf8" : "rgba(255, 255, 255, 0.6)",
            border: activeTab === "BILAN" ? "1px solid rgba(56, 189, 248, 0.3)" : "none",
          }}
        >
          <TrendingUp size={18} />
          Bilan Mensuel &amp; Rentabilité (P&amp;L)
        </button>
      </div>

      {/* Control Bar: Search + Filters + Action */}
      {activeTab !== "BILAN" && (
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
          {/* Search */}
          <div style={{ position: "relative", minWidth: 260, maxWidth: 360, flex: 1 }}>
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
              placeholder={
                activeTab === "INVOICES"
                  ? "Rechercher par N° facture, proforma, client..."
                  : "Rechercher par réf. paiement, client, N° facture..."
              }
              className="ox-input"
              style={{ width: "100%", paddingLeft: 36, fontSize: "0.85rem" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tab-specific filters */}
          {activeTab === "INVOICES" ? (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[
                { id: "ALL", label: "Toutes" },
                { id: "UNPAID", label: "Non soldées" },
                { id: "PAID", label: "Soldées" },
                { id: "OVERDUE", label: "En retard" },
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
                    border:
                      statusFilter === tab.id
                        ? "1px solid rgba(197, 216, 228, 0.4)"
                        : "1px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[
                { id: "ALL", label: "Tous modes" },
                { id: "MTN_MOMO", label: "MTN MoMo" },
                { id: "MOOV_MONEY", label: "Moov Money" },
                { id: "VIREMENT_ECOBANK", label: "Ecobank" },
                { id: "VIREMENT_BOA", label: "BOA" },
                { id: "CHEQUE", label: "Chèques" },
                { id: "ESPECES", label: "Espèces" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMethodFilter(tab.id)}
                  className="ox-btn ox-btn-sm"
                  style={{
                    background:
                      methodFilter === tab.id
                        ? "rgba(16, 185, 129, 0.25)"
                        : "transparent",
                    color: methodFilter === tab.id ? "#10b981" : "rgba(255, 255, 255, 0.65)",
                    border:
                      methodFilter === tab.id
                        ? "1px solid rgba(16, 185, 129, 0.4)"
                        : "1px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {canExportFinancials && (
            <a
              href="/api/reports/financial-excel"
              className="ox-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "0.65rem 1.15rem",
                borderRadius: 8,
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(180, 140, 40, 0.35))",
                border: "1px solid rgba(212, 175, 55, 0.5)",
                color: "var(--gold, #d4af37)",
                fontWeight: 650,
                fontSize: "0.85rem",
                textDecoration: "none",
                cursor: "pointer",
              }}
              title="Extraction du bilan financier de l'entreprise (Excel .xlsx)"
            >
              <Download size={16} />
              Extraire le Bilan Financier (Excel)
            </a>
          )}

          {/* Global Record Payment button */}
          {unpaidInvoiceOptions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setTargetInvoiceId(null);
                setIsPaymentModalOpen(true);
              }}
              className="ox-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
                fontWeight: 650,
                padding: "0.65rem 1.25rem",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              <CreditCard size={18} />
              Enregistrer un Règlement
            </button>
          )}
        </div>
      </div>
      )}

      {/* VIEW 1: FACTURES */}
      {activeTab === "INVOICES" && (
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
                  <th style={{ padding: "0.85rem 1rem" }}>Facture</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Client</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Dates</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Total TTC</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Encaissé</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Solde Dû</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Statut</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "2.5rem 1rem", textAlign: "center", opacity: 0.6 }}>
                      Aucune facture ne correspond aux critères.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const balanceDue = Math.max(0, inv.totalXof - inv.paidXof);
                    const isFullyPaid = inv.status === "PAYEE" || balanceDue === 0;

                    return (
                      <tr
                        key={inv.id}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* N° & Proforma */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ fontWeight: 700, color: "var(--ice-text-strong)", display: "flex", alignItems: "center", gap: 6 }}>
                            <FileText size={15} color="var(--brand)" />
                            {inv.number}
                          </div>
                          {inv.quote && (
                            <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
                              Devis : {inv.quote.number}
                            </div>
                          )}
                        </td>

                        {/* Client */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ fontWeight: 600 }}>{inv.customer.contactName}</div>
                          {inv.customer.companyName && (
                            <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
                              {inv.customer.companyName}
                            </div>
                          )}
                          {inv.customer.phone && (
                            <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)" }}>
                              {inv.customer.phone}
                            </div>
                          )}
                        </td>

                        {/* Dates */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ fontSize: "0.82rem" }}>Émis : {formatDate(inv.createdAt)}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)" }}>
                            Échéance : {formatDate(inv.dueDate)}
                          </div>
                        </td>

                        {/* Total TTC */}
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                          <div style={{ fontWeight: 750, color: "var(--ice-text-strong)", fontSize: "0.95rem" }}>
                            {formatXof(inv.totalXof)}
                          </div>
                          <div style={{ fontSize: "0.72rem", opacity: 0.65 }}>
                            {formatXof(inv.subtotalHtXof)} HT {inv.taxRatePct > 0 ? `· TVA ${inv.taxRatePct}%` : ""}
                          </div>
                        </td>

                        {/* Encaissé */}
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: "#4ade80", fontSize: "0.92rem" }}>
                            {formatXof(inv.paidXof)}
                          </div>
                          <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>
                            {inv.payments.length} règlement(s)
                          </div>
                        </td>

                        {/* Solde restant dû */}
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: "0.95rem",
                              color: balanceDue > 0 ? "var(--gold)" : "#4ade80",
                            }}
                          >
                            {formatXof(balanceDue)}
                          </div>
                          <div style={{ fontSize: "0.7rem", opacity: 0.65 }}>
                            {balanceDue === 0 ? "Soldé" : "Reste à payer"}
                          </div>
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
                                inv.status === "PAYEE"
                                  ? "rgba(74, 222, 128, 0.15)"
                                  : inv.status === "ANNULEE" || inv.status === "EN_RETARD"
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : inv.status === "PAYEE_PARTIEL"
                                      ? "rgba(56, 189, 248, 0.15)"
                                      : "rgba(234, 179, 8, 0.15)",
                              color:
                                inv.status === "PAYEE"
                                  ? "#4ade80"
                                  : inv.status === "ANNULEE" || inv.status === "EN_RETARD"
                                    ? "#ef4444"
                                    : inv.status === "PAYEE_PARTIEL"
                                      ? "#38bdf8"
                                      : "#eab308",
                              border: `1px solid ${
                                inv.status === "PAYEE"
                                  ? "rgba(74, 222, 128, 0.3)"
                                  : inv.status === "ANNULEE" || inv.status === "EN_RETARD"
                                    ? "rgba(239, 68, 68, 0.3)"
                                    : inv.status === "PAYEE_PARTIEL"
                                      ? "rgba(56, 189, 248, 0.3)"
                                      : "rgba(234, 179, 8, 0.3)"
                              }`,
                            }}
                          >
                            {inv.status === "PAYEE"
                              ? "Soldée"
                              : inv.status === "PAYEE_PARTIEL"
                                ? "Acompte reçu"
                                : inv.status === "EN_RETARD"
                                  ? "En retard"
                                  : inv.status === "ANNULEE"
                                    ? "Annulée"
                                    : inv.status}
                          </span>
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
                            {/* Imprimer Facture */}
                            <Link
                              href={`/invoices/${inv.id}/print`}
                              target="_blank"
                              className="ox-btn ox-btn-ghost ox-btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                              title="Imprimer la Facture Normalisée"
                            >
                              <Printer size={13} />
                              Facture
                            </Link>

                            {/* Certification DGI e-MECeF */}
                            {inv.isFiscalCertified ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  padding: "0.2rem 0.5rem",
                                  borderRadius: 4,
                                  background: "rgba(16, 185, 129, 0.15)",
                                  color: "#10b981",
                                  border: "1px solid rgba(16, 185, 129, 0.3)",
                                }}
                                title={`Certifiée DGI Bénin (Code: ${inv.mecefCode})`}
                              >
                                <ShieldCheck size={12} />
                                e-MECeF
                              </span>
                            ) : canVoid && inv.status !== "ANNULEE" ? (
                              <form action={certifyInvoiceDgi} style={{ display: "inline" }}>
                                <input type="hidden" name="invoiceId" value={inv.id} />
                                <button
                                  type="submit"
                                  className="ox-btn ox-btn-sm"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    background: "rgba(56, 189, 248, 0.15)",
                                    color: "#38bdf8",
                                    border: "1px solid rgba(56, 189, 248, 0.3)",
                                  }}
                                  title="Certifier cette facture auprès de la DGI Bénin (e-MECeF)"
                                >
                                  <ShieldCheck size={12} />
                                  DGI
                                </button>
                              </form>
                            ) : null}

                            {/* Encaisser Acompte / Solde */}
                            {!isFullyPaid && inv.status !== "ANNULEE" && (
                              <button
                                type="button"
                                onClick={() => openPaymentForInvoice(inv.id)}
                                className="ox-btn ox-btn-sm"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "rgba(16, 185, 129, 0.2)",
                                  color: "#10b981",
                                  border: "1px solid rgba(16, 185, 129, 0.4)",
                                }}
                                title="Enregistrer un acompte ou solder la facture"
                              >
                                <CreditCard size={13} />
                                Encaisser
                              </button>
                            )}

                            {/* Annuler interne pour DG/Compta */}
                            {canVoid && inv.status !== "ANNULEE" && !isFullyPaid && (
                              <button
                                type="button"
                                onClick={() => {
                                  setVoidModalInvoiceId(inv.id);
                                  setVoidReason("");
                                }}
                                className="ox-btn ox-btn-danger ox-btn-sm"
                                style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
                                title="Annulation interne par la direction (justification obligatoire)"
                              >
                                <Ban size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: REGLEMENTS & QUITTANCES (Djaboo /admin/payments) */}
      {activeTab === "PAYMENTS" && (
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
                  <th style={{ padding: "0.85rem 1rem" }}>Réf. Règlement</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Date</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Facture Liée</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Client</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Mode d&apos;Encaissement</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Réf. Transaction</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Montant Encaissé</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>Quittance / Reçu</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "2.5rem 1rem", textAlign: "center", opacity: 0.6 }}>
                      Aucun encaissement enregistré pour le moment.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const methodInfo = PAYMENT_METHOD_LABELS[p.method] || {
                      label: p.method,
                      color: "#94a3b8",
                    };
                    const regNumber = `REG-${new Date(p.paidAt).getFullYear()}-${p.id.slice(-4).toUpperCase()}`;

                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* Réf Règlement */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ fontWeight: 700, color: "var(--ice-text-strong)", display: "flex", alignItems: "center", gap: 6 }}>
                            <FileCheck size={15} color="#10b981" />
                            {regNumber}
                          </div>
                          {p.notes && (
                            <div style={{ fontSize: "0.72rem", opacity: 0.6, marginTop: 2 }}>
                              {p.notes}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ fontSize: "0.82rem" }}>{formatDate(p.paidAt)}</div>
                        </td>

                        {/* Facture */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <Link
                            href={`/invoices/${p.invoice.id}/print`}
                            target="_blank"
                            style={{ color: "var(--ice)", textDecoration: "underline", fontWeight: 600 }}
                          >
                            {p.invoice.number}
                          </Link>
                          <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>
                            Total : {formatXof(p.invoice.totalXof)}
                          </div>
                        </td>

                        {/* Client */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ fontWeight: 600 }}>{p.invoice.customer.contactName}</div>
                          {p.invoice.customer.companyName && (
                            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                              {p.invoice.customer.companyName}
                            </div>
                          )}
                        </td>

                        {/* Mode */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.2rem 0.55rem",
                              borderRadius: 6,
                              fontSize: "0.75rem",
                              fontWeight: 650,
                              background: `${methodInfo.color}22`,
                              color: methodInfo.color,
                              border: `1px solid ${methodInfo.color}44`,
                            }}
                          >
                            {methodInfo.label}
                          </span>
                        </td>

                        {/* Réf Transaction */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>
                            {p.reference || "—"}
                          </div>
                        </td>

                        {/* Montant */}
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                          <div style={{ fontWeight: 800, color: "#10b981", fontSize: "0.95rem" }}>
                            {formatXof(p.amountXof)}
                          </div>
                        </td>

                        {/* Quittance Button */}
                        <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                          <Link
                            href={`/invoices/payments/${p.id}/receipt`}
                            target="_blank"
                            className="ox-btn ox-btn-ghost ox-btn-sm"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: "var(--gold)",
                              borderColor: "rgba(212, 175, 55, 0.3)",
                            }}
                            title="Imprimer la quittance d'encaissement"
                          >
                            <Printer size={13} />
                            Quittance
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: BILAN FINANCIER & RENTABILITE P&L */}
      {activeTab === "BILAN" && (
        <FinancialBilanTab
          invoices={invoices}
          payments={allPayments}
          expenses={expenses}
          salaries={salaries}
          vehicles={vehicles}
          workOrders={workOrders}
          currentYear={currentYear}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        invoices={unpaidInvoiceOptions}
        selectedInvoiceId={targetInvoiceId}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setTargetInvoiceId(null);
        }}
      />

      {/* Modal d'annulation interne (DG / Compta) */}
      {voidModalInvoiceId && (
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
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444" }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Annulation Interne d&apos;une Facture</h3>
              </div>
              <button
                onClick={() => setVoidModalInvoiceId(null)}
                style={{ background: "transparent", border: "none", color: "#fff", opacity: 0.6, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              Cette action est strictement réservée à la <strong>Direction Générale</strong> et à la{" "}
              <strong>Comptabilité</strong>. Une justification écrite auditée est obligatoire (minimum 8 caractères).
            </div>

            <form action={voidInvoice}>
              <input type="hidden" name="id" value={voidModalInvoiceId} />
              <textarea
                name="cancelReason"
                required
                minLength={8}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Exemple: Erreur de saisie / Annulation commande justifiée par DG / Remplacement par FAC-..."
                className="ox-input"
                style={{ width: "100%", height: 80, fontSize: "0.85rem", marginBottom: "1rem" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setVoidModalInvoiceId(null)}
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
        </div>
      )}
    </div>
  );
}
