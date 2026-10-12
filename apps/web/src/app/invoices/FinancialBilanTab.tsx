"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Printer,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
} from "lucide-react";
import { formatXof } from "@/lib/format";
import type { InvoiceItem, PaymentRow } from "./InvoicesView";

export type ExpenseItem = {
  id: string;
  expenseNumber: string;
  category: string;
  title: string;
  supplierName: string;
  purchaseOrderNo: string | null;
  amountHtXof: number;
  taxXof: number;
  amountTtcXof: number;
  status: string;
  paymentMethod: string | null;
  serviceDate: string;
  paymentDate: string | null;
};

export type SalaryItem = {
  id: string;
  month: number;
  year: number;
  amountXof: number;
  paymentDate: string;
  status: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
};

export type VehicleStat = {
  id: string;
  vin: string | null;
  brand: string;
  model: string;
  costXof: number | null;
  priceXof: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkOrderStat = {
  id: string;
  number: string;
  laborXof: number;
  partsXof: number;
  status: string;
  openedAt: string;
  closedAt: string | null;
};

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function FinancialBilanTab({
  invoices,
  payments,
  expenses,
  salaries,
  vehicles,
  workOrders,
  currentYear,
}: {
  invoices: InvoiceItem[];
  payments: PaymentRow[];
  expenses: ExpenseItem[];
  salaries: SalaryItem[];
  vehicles: VehicleStat[];
  workOrders: WorkOrderStat[];
  currentYear: number;
}) {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | "ALL">("ALL");

  // Filter items by year and optional month
  const filterDateMatch = useCallback(
    (dateStr: string) => {
      const d = new Date(dateStr);
      if (d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== "ALL" && d.getMonth() + 1 !== selectedMonth) return false;
      return true;
    },
    [selectedYear, selectedMonth]
  );

  // 1. REVENUE (Produits d'exploitation)
  const periodInvoices = useMemo(() => {
    return invoices.filter((inv) => filterDateMatch(inv.createdAt) && inv.status !== "ANNULEE");
  }, [invoices, filterDateMatch]);

  const periodPayments = useMemo(() => {
    return payments.filter((p) => filterDateMatch(p.paidAt));
  }, [payments, filterDateMatch]);

  const totalInvoicedRevenue = useMemo(() => {
    return periodInvoices.reduce((sum, inv) => sum + inv.totalXof, 0);
  }, [periodInvoices]);

  const totalCashCollected = useMemo(() => {
    return periodPayments.reduce((sum, p) => sum + p.amountXof, 0);
  }, [periodPayments]);

  // Workshop labor & parts revenue in period
  const periodWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => filterDateMatch(wo.closedAt || wo.openedAt));
  }, [workOrders, filterDateMatch]);

  const workshopRevenue = useMemo(() => {
    return periodWorkOrders.reduce((sum, wo) => sum + wo.laborXof + wo.partsXof, 0);
  }, [periodWorkOrders]);

  // 2. COGS (Coûts directs des ventes & pièces)
  // Estimated cost of sold vehicles
  const soldVehiclesInPeriod = useMemo(() => {
    return vehicles.filter(
      (v) => (v.status === "VENDU" || v.status === "LIVRE") && filterDateMatch(v.updatedAt)
    );
  }, [vehicles, filterDateMatch]);

  const vehiclesCost = useMemo(() => {
    return soldVehiclesInPeriod.reduce((sum, v) => sum + (v.costXof || v.priceXof * 0.75), 0);
  }, [soldVehiclesInPeriod]);

  const workshopPartsCost = useMemo(() => {
    return periodWorkOrders.reduce((sum, wo) => sum + wo.partsXof, 0);
  }, [periodWorkOrders]);

  const totalDirectCosts = vehiclesCost + workshopPartsCost;
  const grossProfit = totalInvoicedRevenue - totalDirectCosts;
  const grossMarginPct = totalInvoicedRevenue > 0 ? (grossProfit / totalInvoicedRevenue) * 100 : 0;

  // 3. OPEX (Charges opérationnelles)
  // Salaries
  const periodSalaries = useMemo(() => {
    return salaries.filter((s) => {
      if (s.year !== selectedYear) return false;
      if (selectedMonth !== "ALL" && s.month !== selectedMonth) return false;
      return true;
    });
  }, [salaries, selectedYear, selectedMonth]);

  const totalPayroll = useMemo(() => {
    return periodSalaries.reduce((sum, s) => sum + s.amountXof, 0);
  }, [periodSalaries]);

  // Operating Expenses (SBEE, SONEB, Providers, Rent...)
  const periodExpenses = useMemo(() => {
    return expenses.filter((e) => filterDateMatch(e.serviceDate));
  }, [expenses, filterDateMatch]);

  const totalOperatingExpenses = useMemo(() => {
    return periodExpenses.reduce((sum, e) => sum + e.amountTtcXof, 0);
  }, [periodExpenses]);

  // Breakdown by category
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of periodExpenses) {
      map[exp.category] = (map[exp.category] || 0) + exp.amountTtcXof;
    }
    return map;
  }, [periodExpenses]);

  // Total OPEX
  const totalOpex = totalPayroll + totalOperatingExpenses;

  // 4. NET PROFIT (Bénéfice Net Réel après salaires & charges)
  const netProfit = grossProfit - totalOpex;
  const netProfitMarginPct = totalInvoicedRevenue > 0 ? (netProfit / totalInvoicedRevenue) * 100 : 0;

  // 5. Monthly Breakdown Matrix for full year
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const monthNum = idx + 1;

      // Invoiced in this month
      const invMonth = invoices
        .filter((inv) => {
          const d = new Date(inv.createdAt);
          return d.getFullYear() === selectedYear && d.getMonth() + 1 === monthNum && inv.status !== "ANNULEE";
        })
        .reduce((sum, inv) => sum + inv.totalXof, 0);

      // Cash collected
      const cashMonth = payments
        .filter((p) => {
          const d = new Date(p.paidAt);
          return d.getFullYear() === selectedYear && d.getMonth() + 1 === monthNum;
        })
        .reduce((sum, p) => sum + p.amountXof, 0);

      // Salaries paid
      const salMonth = salaries
        .filter((s) => s.year === selectedYear && s.month === monthNum)
        .reduce((sum, s) => sum + s.amountXof, 0);

      // Operating expenses
      const expMonth = expenses
        .filter((e) => {
          const d = new Date(e.serviceDate);
          return d.getFullYear() === selectedYear && d.getMonth() + 1 === monthNum;
        })
        .reduce((sum, e) => sum + e.amountTtcXof, 0);

      // Estimated Direct Cost (COGS ~ 55% or proportional)
      const cogsMonth = Math.round(invMonth * 0.55);
      const grossMonth = invMonth - cogsMonth;
      const netMonth = grossMonth - salMonth - expMonth;

      return {
        monthNum,
        monthName: MONTH_NAMES[idx],
        invoiced: invMonth,
        collected: cashMonth,
        salaries: salMonth,
        expenses: expMonth,
        cogs: cogsMonth,
        gross: grossMonth,
        net: netMonth,
      };
    });
  }, [invoices, payments, salaries, expenses, selectedYear]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Control Bar */}
      <div
        className="ox-card"
        style={{
          padding: "1rem 1.2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={18} style={{ color: "var(--brand)" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Période d&apos;analyse :</span>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="ox-select"
            style={{ fontWeight: 600 }}
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>
                Année {y}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="ox-select"
            style={{ minWidth: 160 }}
          >
            <option value="ALL">Toute l&apos;année ({selectedYear})</option>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name} {selectedYear}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => window.print()}
          className="ox-btn ox-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Printer size={16} /> Imprimer le Bilan Financier
        </button>
      </div>

      {/* 4 Macro KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Revenue */}
        <div className="ox-card" style={{ padding: "1.3rem", borderLeft: "4px solid var(--brand)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Chiffre d&apos;Affaires Facturé</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--brand)", marginTop: 4 }}>
                {formatXof(totalInvoicedRevenue)}
              </div>
            </div>
            <div
              style={{
                background: "rgba(0, 120, 212, 0.15)",
                color: "var(--brand)",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 8 }}>
            Encaissé réel : <strong style={{ color: "#10b981" }}>{formatXof(totalCashCollected)}</strong>
          </div>
        </div>

        {/* COGS & Gross Profit */}
        <div className="ox-card" style={{ padding: "1.3rem", borderLeft: "4px solid #38bdf8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Marge Brute Dégagée</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#38bdf8", marginTop: 4 }}>
                {formatXof(grossProfit)}
              </div>
            </div>
            <div
              style={{
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 8 }}>
            Taux de marge brute : <strong>{grossMarginPct.toFixed(1)}%</strong> (Coûts d&apos;achat déduits)
          </div>
        </div>

        {/* Total OPEX (Salaries + Expenses) */}
        <div className="ox-card" style={{ padding: "1.3rem", borderLeft: "4px solid var(--warn)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Charges d&apos;Exploitation (OPEX)</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--warn)", marginTop: 4 }}>
                {formatXof(totalOpex)}
              </div>
            </div>
            <div
              style={{
                background: "rgba(210, 160, 40, 0.15)",
                color: "var(--warn)",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 8 }}>
            Salaires : <strong>{formatXof(totalPayroll)}</strong> | Prestataires &amp; frais : <strong>{formatXof(totalOperatingExpenses)}</strong>
          </div>
        </div>

        {/* Net Profit */}
        <div
          className="ox-card"
          style={{
            padding: "1.3rem",
            borderLeft: `4px solid ${netProfit >= 0 ? "#10b981" : "var(--bad)"}`,
            background: netProfit >= 0 ? "rgba(16, 185, 129, 0.05)" : "rgba(212, 90, 90, 0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                Bénéfice Net Réel (Résultat Net)
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: netProfit >= 0 ? "#10b981" : "var(--bad)",
                  marginTop: 4,
                }}
              >
                {formatXof(netProfit)}
              </div>
            </div>
            <div
              style={{
                background: netProfit >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(212, 90, 90, 0.15)",
                color: netProfit >= 0 ? "#10b981" : "var(--bad)",
                padding: 8,
                borderRadius: 8,
              }}
            >
              {netProfit >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 8 }}>
            Rentabilité nette : <strong>{netProfitMarginPct.toFixed(1)}%</strong> du chiffre d&apos;affaires
          </div>
        </div>
      </div>

      {/* Cascading P&L Decomposition */}
      <div className="ox-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 1rem" }}>
          Décomposition Analytique du Bilan (Compte de Résultat P&amp;L)
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {/* Revenue row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.8rem 1rem",
              background: "rgba(0, 120, 212, 0.08)",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--brand)", fontWeight: 800 }}>[ + ]</span>
              <div>
                <span>Chiffre d&apos;Affaires Global Facturé (Ventes, Atelier, Énergie)</span>
                {workshopRevenue > 0 && (
                  <div style={{ fontSize: "0.75rem", opacity: 0.7, fontWeight: 400, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <Wrench size={12} /> dont Prestations Atelier SAV : {formatXof(workshopRevenue)}
                  </div>
                )}
              </div>
            </div>
            <span style={{ color: "var(--brand)", fontSize: "1rem" }}>
              {formatXof(totalInvoicedRevenue)}
            </span>
          </div>

          {/* COGS row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.8rem 1rem",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "1.5rem" }}>
              <span style={{ color: "var(--bad)", fontWeight: 700 }}>[ − ]</span>
              <span>Coûts d&apos;achat des matériels vendus &amp; pièces atelier</span>
            </div>
            <span style={{ color: "var(--bad)" }}>− {formatXof(totalDirectCosts)}</span>
          </div>

          {/* Gross Margin Subtotal */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.8rem 1rem",
              background: "rgba(56, 189, 248, 0.08)",
              borderRadius: 8,
              fontWeight: 700,
              borderLeft: "3px solid #38bdf8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#38bdf8" }}>[ = ]</span>
              <span>MARGE BRUTE OPÉRATIONNELLE ({grossMarginPct.toFixed(1)}%)</span>
            </div>
            <span style={{ color: "#38bdf8", fontSize: "1.05rem" }}>
              {formatXof(grossProfit)}
            </span>
          </div>

          {/* Salaries row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.8rem 1rem",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "1.5rem" }}>
              <span style={{ color: "var(--bad)", fontWeight: 700 }}>[ − ]</span>
              <span>Masse salariale &amp; Rémunérations du personnel (RH)</span>
            </div>
            <span style={{ color: "var(--bad)" }}>− {formatXof(totalPayroll)}</span>
          </div>

          {/* Operating expenses row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.8rem 1rem",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "1.5rem" }}>
              <span style={{ color: "var(--bad)", fontWeight: 700 }}>[ − ]</span>
              <div>
                <span>
                  Charges externes &amp; prestataires (Climatisation, SBEE, SONEB, Télécoms, Loyer...)
                </span>
                {Object.keys(expensesByCategory).length > 0 && (
                  <div style={{ fontSize: "0.75rem", opacity: 0.7, fontWeight: 400, marginTop: 2 }}>
                    dont Prestataires extérieurs : {formatXof(expensesByCategory["PRESTATAIRE_SERVICE"] || 0)}
                  </div>
                )}
              </div>
            </div>
            <span style={{ color: "var(--bad)" }}>− {formatXof(totalOperatingExpenses)}</span>
          </div>

          {/* NET RESULT FINAL */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "1rem",
              background: netProfit >= 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(212, 90, 90, 0.12)",
              borderRadius: 10,
              fontWeight: 800,
              border: `1px solid ${netProfit >= 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(212, 90, 90, 0.4)"}`,
              marginTop: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: netProfit >= 0 ? "#10b981" : "var(--bad)", fontSize: "1.2rem" }}>
                [ = ]
              </span>
              <span style={{ fontSize: "1.05rem" }}>
                RÉSULTAT NET D&apos;EXPLOITATION / BÉNÉFICE NET APRÈS CHARGES &amp; SALAIRES
              </span>
            </div>
            <span
              style={{
                color: netProfit >= 0 ? "#10b981" : "var(--bad)",
                fontSize: "1.3rem",
              }}
            >
              {formatXof(netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Evolution Matrix */}
      <div className="ox-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 1rem" }}>
          Tableau de Bord Mensuel Récapitulatif ({selectedYear})
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table className="ox-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: "0.8rem", opacity: 0.7 }}>
                <th style={{ padding: "0.8rem 1rem" }}>Mois</th>
                <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>CA Facturé</th>
                <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>Encaissé Réel</th>
                <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>Salaires Décaissés</th>
                <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>Dépenses Prestataires</th>
                <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>Résultat Net Estimé</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row) => (
                <tr key={row.monthNum} style={{ borderTop: "1px solid var(--ice-border)" }}>
                  <td style={{ padding: "0.8rem 1rem", fontWeight: 600 }}>{row.monthName}</td>
                  <td style={{ padding: "0.8rem 1rem", textAlign: "right", color: "var(--brand)" }}>
                    {formatXof(row.invoiced)}
                  </td>
                  <td style={{ padding: "0.8rem 1rem", textAlign: "right", color: "#10b981" }}>
                    {formatXof(row.collected)}
                  </td>
                  <td style={{ padding: "0.8rem 1rem", textAlign: "right", color: "var(--warn)" }}>
                    {formatXof(row.salaries)}
                  </td>
                  <td style={{ padding: "0.8rem 1rem", textAlign: "right", color: "#8b5cf6" }}>
                    {formatXof(row.expenses)}
                  </td>
                  <td
                    style={{
                      padding: "0.8rem 1rem",
                      textAlign: "right",
                      fontWeight: 700,
                      color: row.net >= 0 ? "#10b981" : "var(--bad)",
                    }}
                  >
                    {formatXof(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr
                style={{
                  borderTop: "2px solid var(--brand)",
                  fontWeight: 800,
                  background: "rgba(0, 120, 212, 0.05)",
                }}
              >
                <td style={{ padding: "1rem" }}>TOTAL CUMULÉ ({selectedYear})</td>
                <td style={{ padding: "1rem", textAlign: "right", color: "var(--brand)" }}>
                  {formatXof(monthlyData.reduce((s, r) => s + r.invoiced, 0))}
                </td>
                <td style={{ padding: "1rem", textAlign: "right", color: "#10b981" }}>
                  {formatXof(monthlyData.reduce((s, r) => s + r.collected, 0))}
                </td>
                <td style={{ padding: "1rem", textAlign: "right", color: "var(--warn)" }}>
                  {formatXof(monthlyData.reduce((s, r) => s + r.salaries, 0))}
                </td>
                <td style={{ padding: "1rem", textAlign: "right", color: "#8b5cf6" }}>
                  {formatXof(monthlyData.reduce((s, r) => s + r.expenses, 0))}
                </td>
                <td
                  style={{
                    padding: "1rem",
                    textAlign: "right",
                    color:
                      monthlyData.reduce((s, r) => s + r.net, 0) >= 0 ? "#10b981" : "var(--bad)",
                    fontSize: "1.05rem",
                  }}
                >
                  {formatXof(monthlyData.reduce((s, r) => s + r.net, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
