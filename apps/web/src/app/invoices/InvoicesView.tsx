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
import { formatXof } from "@/lib/format";
import { usePrefs } from "@/components/PrefsProvider";
import {
  invoicesCopy,
  invoiceStatusLabel,
  paymentMethodLabel,
  formatInvoiceDate,
} from "@/lib/i18n/messages/invoices";
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

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  MTN_MOMO: "#f59e0b",
  MOOV_MONEY: "#3b82f6",
  MOBILE_MONEY: "#f59e0b",
  VIREMENT_ECOBANK: "#10b981",
  VIREMENT_BOA: "#10b981",
  VIREMENT: "#10b981",
  CHEQUE: "#8b5cf6",
  ESPECES: "#14b8a6",
  CARTE: "#ec4899",
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
  const { locale } = usePrefs();
  const copy = invoicesCopy[locale];
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
    userRole === "DEVELOPER" ||
    userRole === "DG" ||
    userRole === "PDG" ||
    userRole === "SG" ||
    userRole === "ADV" ||
    userRole === "RF" ||
    userRole === "COMPTA";

  const canExportFinancials =
    userRole === "DEVELOPER" ||
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
            {copy.kpi.invoicedLabel}
          </div>
          <div className="ox-metric-val" style={{ fontSize: "1.6rem" }}>
            {formatXof(totalInvoicedTtc)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
            {copy.kpi.invoicedHint(invoices.length)}
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
            {copy.kpi.collectedLabel}
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981" }}>
            {formatXof(totalCollected)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>
            {copy.kpi.collectedHint(fullyPaidCount)}
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
            {copy.kpi.outstandingLabel}
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: totalOutstanding > 0 ? "var(--gold)" : "#10b981" }}>
            {formatXof(totalOutstanding)}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
            {copy.kpi.outstandingHint}
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
            {copy.kpi.overdueLabel}
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: overdueCount > 0 ? "#ef4444" : "#4ade80" }}>
            {overdueCount}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
            {copy.kpi.overdueHint}
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
          {copy.tabs.invoices(invoices.length)}
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
          {copy.tabs.payments(allPayments.length)}
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
          {copy.tabs.bilan}
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
                  ? copy.search.invoices
                  : copy.search.payments
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
                { id: "ALL", label: copy.filters.all },
                { id: "UNPAID", label: copy.filters.unpaid },
                { id: "PAID", label: copy.filters.paid },
                { id: "OVERDUE", label: copy.filters.overdue },
                { id: "VOID", label: copy.filters.voided },
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
                { id: "ALL", label: copy.filters.methodAll },
                { id: "MTN_MOMO", label: copy.filters.methodChips.MTN_MOMO },
                { id: "MOOV_MONEY", label: copy.filters.methodChips.MOOV_MONEY },
                { id: "VIREMENT_ECOBANK", label: copy.filters.methodChips.VIREMENT_ECOBANK },
                { id: "VIREMENT_BOA", label: copy.filters.methodChips.VIREMENT_BOA },
                { id: "CHEQUE", label: copy.filters.methodChips.CHEQUE },
                { id: "ESPECES", label: copy.filters.methodChips.ESPECES },
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
              title={copy.toolbar.exportExcelTitle}
            >
              <Download size={16} />
              {copy.toolbar.exportExcel}
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
              {copy.toolbar.recordPayment}
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
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.invoiceTable.headers.number}</th>
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.invoiceTable.headers.client}</th>
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.invoiceTable.headers.dates}</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>{copy.invoiceTable.headers.totalTtc}</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>{copy.invoiceTable.headers.collected}</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>{copy.invoiceTable.headers.balance}</th>
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.invoiceTable.headers.status}</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>{copy.invoiceTable.headers.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "2.5rem 1rem", textAlign: "center", opacity: 0.6 }}>
                      {copy.invoiceTable.empty}
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
                              {copy.invoiceTable.quoteRef(inv.quote.number)}
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
                          <div style={{ fontSize: "0.82rem" }}>{copy.invoiceTable.issued(formatInvoiceDate(copy, inv.createdAt))}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)" }}>
                            {copy.invoiceTable.due(formatInvoiceDate(copy, inv.dueDate))}
                          </div>
                        </td>

                        {/* Total TTC */}
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                          <div style={{ fontWeight: 750, color: "var(--ice-text-strong)", fontSize: "0.95rem" }}>
                            {formatXof(inv.totalXof)}
                          </div>
                          <div style={{ fontSize: "0.72rem", opacity: 0.65 }}>
                            {copy.invoiceTable.htAndVat(formatXof(inv.subtotalHtXof), inv.taxRatePct)}
                          </div>
                        </td>

                        {/* Encaissé */}
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: "#4ade80", fontSize: "0.92rem" }}>
                            {formatXof(inv.paidXof)}
                          </div>
                          <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>
                            {copy.invoiceTable.paymentsCount(inv.payments.length)}
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
                            {balanceDue === 0 ? copy.invoiceTable.settled : copy.invoiceTable.remaining}
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
                            {invoiceStatusLabel(copy, inv.status)}
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
                              title={copy.invoiceTable.rowActions.printTitle}
                            >
                              <Printer size={13} />
                              {copy.invoiceTable.rowActions.printLabel}
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
                                title={copy.invoiceTable.rowActions.certifiedTitle(inv.mecefCode ?? "")}
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
                                  title={copy.invoiceTable.rowActions.dgiTitle}
                                >
                                  <ShieldCheck size={12} />
                                  {copy.invoiceTable.rowActions.dgiLabel}
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
                                title={copy.invoiceTable.rowActions.collectTitle}
                              >
                                <CreditCard size={13} />
                                {copy.invoiceTable.rowActions.collectLabel}
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
                                title={copy.invoiceTable.rowActions.voidTitle}
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
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.paymentsTable.headers.reference}</th>
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.paymentsTable.headers.date}</th>
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.paymentsTable.headers.invoice}</th>
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.paymentsTable.headers.client}</th>
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.paymentsTable.headers.method}</th>
                  <th style={{ padding: "0.85rem 1rem" }}>{copy.paymentsTable.headers.transaction}</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>{copy.paymentsTable.headers.amount}</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>{copy.paymentsTable.headers.receipt}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "2.5rem 1rem", textAlign: "center", opacity: 0.6 }}>
                      {copy.paymentsTable.empty}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const methodColor = PAYMENT_METHOD_COLORS[p.method] || "#94a3b8";
                    const methodLabel = paymentMethodLabel(copy, p.method);
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
                          <div style={{ fontSize: "0.82rem" }}>{formatInvoiceDate(copy, p.paidAt)}</div>
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
                            {copy.paymentsTable.invoiceTotal(formatXof(p.invoice.totalXof))}
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
                              background: `${methodColor}22`,
                              color: methodColor,
                              border: `1px solid ${methodColor}44`,
                            }}
                          >
                            {methodLabel}
                          </span>
                        </td>

                        {/* Réf Transaction */}
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>
                            {p.reference || "-"}
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
                            title={copy.paymentsTable.receiptTitle}
                          >
                            <Printer size={13} />
                            {copy.paymentsTable.receiptLabel}
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
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{copy.voidModal.title}</h3>
              </div>
              <button
                onClick={() => setVoidModalInvoiceId(null)}
                style={{ background: "transparent", border: "none", color: "#fff", opacity: 0.6, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              {copy.voidModal.bodyLead}
              <strong>{copy.voidModal.roleDirection}</strong>
              {copy.voidModal.bodyMiddle}
              <strong>{copy.voidModal.roleAccounting}</strong>
              {copy.voidModal.bodyTail}
            </div>

            <form action={voidInvoice}>
              <input type="hidden" name="id" value={voidModalInvoiceId} />
              <textarea
                name="cancelReason"
                required
                minLength={8}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder={copy.voidModal.reasonPlaceholder}
                className="ox-input"
                style={{ width: "100%", height: 80, fontSize: "0.85rem", marginBottom: "1rem" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setVoidModalInvoiceId(null)}
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
                  {copy.voidModal.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
