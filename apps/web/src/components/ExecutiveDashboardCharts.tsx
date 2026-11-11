"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Receipt,
  PieChart,
  Activity,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Layers,
  ChevronRight,
} from "lucide-react";
import { formatXof } from "@/lib/format";
import { usePrefs } from "@/components/PrefsProvider";
import { sharedCopy } from "@/lib/i18n/messages/shared";
import type {
  AnalyticsDataset,
  PeriodKey,
  MonthlyAnalyticsPoint,
  PeriodSummary,
} from "@/lib/dashboard-analytics";

type ChartMode = "sales" | "expenses" | "activity" | "profit" | "all";

/** Ordre d'affichage des onglets de graphes. */
const CHART_TAB_KEYS: ChartMode[] = ["all", "profit", "sales", "expenses", "activity"];

export function ExecutiveDashboardCharts({
  analytics,
}: {
  analytics: AnalyticsDataset;
}) {
  const { locale } = usePrefs();
  const exec = sharedCopy[locale].exec;
  const [period, setPeriod] = useState<PeriodKey>("1Y");
  const [activeTab, setActiveTab] = useState<ChartMode>("all");
  const [hoveredMonthKey, setHoveredMonthKey] = useState<string | null>(null);

  const currentPeriodData = analytics.periods[period] || analytics.periods["1Y"];
  const points = currentPeriodData.points;
  const summary = currentPeriodData.summary;

  const hoveredPoint = points.find((p) => p.key === hoveredMonthKey) || points[points.length - 1];

  // Helper pour formater les pourcentages
  const formatPct = (pct: number) => `${pct >= 0 ? "+" : ""}${pct}%`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      {/* 1. BARRE DE COMMANDE SUPÉRIEURE (Sélecteur de Période & Onglets de Graphes) */}
      <div
        className="ox-glass"
        style={{
          padding: "1.2rem 1.4rem",
          borderRadius: 16,
          background: "var(--surface)",
          border: "1px solid var(--accent)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--text-strong)",
                letterSpacing: "-0.02em",
              }}
            >
              {exec.header.title}
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.83rem",
                color: "var(--text-muted)",
              }}
            >
              {exec.header.subtitle}
            </p>
          </div>

          {/* SÉLECTEUR DE PÉRIODE TEMPORELLE (1M, 6M, 1A, 2A, 3A au goût du DG) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface)",
              padding: "4px 6px",
              borderRadius: 12,
              border: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-subtle)",
                padding: "0 6px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Calendar size={13} /> {exec.period.label}
            </span>

            {(["1M", "6M", "1Y", "2Y", "3Y"] as PeriodKey[]).map((pKey) => {
              const isActive = period === pKey;
              return (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => setPeriod(pKey)}
                  style={{
                    background: isActive ? "var(--accent)" : "transparent",
                    color: isActive ? "var(--text-strong)" : "var(--text-muted)",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    fontWeight: isActive ? 800 : 600,
                    cursor: "pointer",
                    boxShadow: isActive ? "0 2px 8px rgba(225, 29, 72, 0.4)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {exec.period.options[pKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ONGLETS DES 4 GRAPHES + VUE COMPLÈTE */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            borderTop: "1px solid var(--border)",
            paddingTop: "0.85rem",
          }}
        >
          {CHART_TAB_KEYS.map((tabKey) => {
            const tab = exec.tabs[tabKey];
            const isTabActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                style={{
                  flex: "1 1 auto",
                  minWidth: "150px",
                  background: isTabActive
                    ? "var(--accent-soft)"
                    : "var(--surface-sunken)",
                  color: isTabActive ? "var(--danger-fg)" : "var(--text-muted)",
                  border: isTabActive
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: "0.84rem", color: isTabActive ? "var(--text-strong)" : "var(--text-muted)" }}>
                  {tab.label}
                </div>
                <div style={{ fontSize: "0.72rem", color: isTabActive ? "var(--danger-fg)" : "var(--text-subtle)", marginTop: 2 }}>
                  {tab.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SYNTHÈSE CHIFFRÉE DE LA PÉRIODE SÉLECTIONNÉE (KPI CARDS) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* VENTES */}
        <div
          className="ox-glass"
          style={{
            padding: "1rem 1.2rem",
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--surface-sunken) 0%, var(--surface) 100%)",
            border: "1px solid var(--info)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--info-fg)", textTransform: "uppercase" }}>
              {exec.summary.salesLabel}
            </span>
            <DollarSign size={16} color="var(--info-fg)" />
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-strong)", marginTop: 6 }}>
            {formatXof(summary.totalSalesInvoiced)}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 4, display: "flex", gap: 6 }}>
            <span>{exec.summary.collectedInline} <strong style={{ color: "var(--success-fg)" }}>{formatXof(summary.totalSalesCollected)}</strong></span>
          </div>
        </div>

        {/* DÉPENSES */}
        <div
          className="ox-glass"
          style={{
            padding: "1rem 1.2rem",
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--surface-sunken) 0%, var(--surface) 100%)",
            border: "1px solid var(--warning)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--warning-fg)", textTransform: "uppercase" }}>
              {exec.summary.expensesLabel}
            </span>
            <Receipt size={16} color="var(--warning-fg)" />
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-strong)", marginTop: 6 }}>
            {formatXof(summary.totalExpenses)}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 4 }}>
            {exec.summary.expensesHint}
          </div>
        </div>

        {/* SALAIRES & CHARGES */}
        <div
          className="ox-glass"
          style={{
            padding: "1rem 1.2rem",
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--surface-sunken) 0%, var(--surface) 100%)",
            border: "1px solid var(--purple)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--purple-fg)", textTransform: "uppercase" }}>
              {exec.summary.salariesLabel}
            </span>
            <PieChart size={16} color="var(--purple-fg)" />
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-strong)", marginTop: 6 }}>
            {formatXof(summary.totalSalaries)}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 4 }}>
            {exec.summary.salariesHint}
          </div>
        </div>

        {/* BÉNÉFICE GÉNÉRAL RÉEL (NET PROFIT) */}
        <div
          className="ox-glass"
          style={{
            padding: "1rem 1.2rem",
            borderRadius: 14,
            background:
              summary.netProfit >= 0
                ? "linear-gradient(135deg, var(--success-soft) 0%, var(--surface) 100%)"
                : "linear-gradient(135deg, var(--danger-soft) 0%, var(--surface) 100%)",
            border:
              summary.netProfit >= 0
                ? "1px solid var(--success)"
                : "1px solid var(--danger)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: summary.netProfit >= 0 ? "var(--success-fg)" : "var(--danger-fg)",
                textTransform: "uppercase",
              }}
            >
              {exec.summary.netLabel}
            </span>
            {summary.netProfit >= 0 ? (
              <ArrowUpRight size={18} color="var(--success-fg)" />
            ) : (
              <ArrowDownRight size={18} color="var(--danger-fg)" />
            )}
          </div>
          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 900,
              color: summary.netProfit >= 0 ? "var(--success-fg)" : "var(--danger-fg)",
              marginTop: 6,
            }}
          >
            {formatXof(summary.netProfit)}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 4, display: "flex", gap: 6 }}>
            <span>{exec.summary.marginInline} <strong>{formatPct(summary.netMarginPct)}</strong></span>
            <span>· {exec.summary.costsInline} {formatXof(summary.totalCosts)}</span>
          </div>
        </div>
      </div>

      {/* 3. AFFICHAGE DU / DES GRAPHES SÉLECTIONNÉS */}
      {activeTab === "all" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <ProfitChartCard points={points} onHover={setHoveredMonthKey} hoveredKey={hoveredMonthKey} />
          <SalesChartCard points={points} onHover={setHoveredMonthKey} hoveredKey={hoveredMonthKey} />
          <ExpensesChartCard points={points} onHover={setHoveredMonthKey} hoveredKey={hoveredMonthKey} />
          <ActivityChartCard points={points} onHover={setHoveredMonthKey} hoveredKey={hoveredMonthKey} />
        </div>
      ) : activeTab === "profit" ? (
        <ProfitChartCard points={points} onHover={setHoveredMonthKey} hoveredKey={hoveredMonthKey} isMainView />
      ) : activeTab === "sales" ? (
        <SalesChartCard points={points} onHover={setHoveredMonthKey} hoveredKey={hoveredMonthKey} isMainView />
      ) : activeTab === "expenses" ? (
        <ExpensesChartCard points={points} onHover={setHoveredMonthKey} hoveredKey={hoveredMonthKey} isMainView />
      ) : (
        <ActivityChartCard points={points} onHover={setHoveredMonthKey} hoveredKey={hoveredMonthKey} isMainView />
      )}

      {/* 4. DÉTAIL MENSUEL INTERACTIF DU MOIS SÉLECTIONNÉ AU SURVOL */}
      {hoveredPoint && (
        <div
          className="ox-glass"
          style={{
            padding: "1rem 1.4rem",
            borderRadius: 14,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.85rem",
          }}
        >
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>
              {exec.hover.heading}
            </div>
            <div style={{ color: "var(--text-on-accent)", fontSize: "1.1rem", fontWeight: 800 }}>
              {exec.months.long(hoveredPoint.year, hoveredPoint.monthIndex)}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ color: "var(--info-fg)", fontSize: "0.74rem", fontWeight: 700 }}>{exec.hover.invoiced}</div>
              <div style={{ color: "var(--text-strong)", fontWeight: 700 }}>{formatXof(hoveredPoint.salesInvoicedXof)}</div>
            </div>
            <div>
              <div style={{ color: "var(--success-fg)", fontSize: "0.74rem", fontWeight: 700 }}>{exec.hover.collected}</div>
              <div style={{ color: "var(--text-strong)", fontWeight: 700 }}>{formatXof(hoveredPoint.salesCollectedXof)}</div>
            </div>
            <div>
              <div style={{ color: "var(--warning-fg)", fontSize: "0.74rem", fontWeight: 700 }}>{exec.hover.expenses}</div>
              <div style={{ color: "var(--text-strong)", fontWeight: 700 }}>{formatXof(hoveredPoint.expensesTotalXof)}</div>
            </div>
            <div>
              <div style={{ color: "var(--purple-fg)", fontSize: "0.74rem", fontWeight: 700 }}>{exec.hover.salaries}</div>
              <div style={{ color: "var(--text-strong)", fontWeight: 700 }}>{formatXof(hoveredPoint.salariesTotalXof)}</div>
            </div>
            <div
              style={{
                paddingLeft: "1rem",
                borderLeft: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  color: hoveredPoint.netProfitXof >= 0 ? "var(--success-fg)" : "var(--danger-fg)",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {exec.hover.net}
              </div>
              <div
                style={{
                  color: hoveredPoint.netProfitXof >= 0 ? "var(--success-fg)" : "var(--danger-fg)",
                  fontSize: "1.05rem",
                  fontWeight: 900,
                }}
              >
                {formatXof(hoveredPoint.netProfitXof)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// COMPOSANT GRAPHE 1 : BÉNÉFICE GÉNÉRAL RÉEL (Net Profit Chart)
// -------------------------------------------------------------------------------------------------
function ProfitChartCard({
  points,
  onHover,
  hoveredKey,
  isMainView = false,
}: {
  points: MonthlyAnalyticsPoint[];
  onHover: (key: string | null) => void;
  hoveredKey: string | null;
  isMainView?: boolean;
}) {
  const { locale } = usePrefs();
  const copy = sharedCopy[locale].exec;
  const width = 800;
  const height = isMainView ? 280 : 210;
  const paddingX = 50;
  const paddingY = 35;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  // Calcul du min et max (peut être négatif)
  const profits = points.map((p) => p.netProfitXof);
  const rawMax = Math.max(...profits, 1000000);
  const rawMin = Math.min(...profits, 0);

  // Échelle symétrique ou adaptée autour de 0
  const maxAbs = Math.max(Math.abs(rawMax), Math.abs(rawMin), 1000000) * 1.15;
  const yZero = height / 2; // Ligne 0 au milieu si min négatif, ou calculée

  const getY = (val: number) => {
    // Échelle allant de -maxAbs à +maxAbs
    const normalized = (val - (-maxAbs)) / (maxAbs * 2);
    return height - paddingY - normalized * graphHeight;
  };

  const getX = (index: number) => {
    if (points.length <= 1) return paddingX + graphWidth / 2;
    return paddingX + (index / (points.length - 1)) * graphWidth;
  };

  const zeroY = getY(0);

  return (
    <div
      className="ox-glass"
      style={{
        padding: "1.4rem",
        borderRadius: 16,
        background: "var(--surface)",
        border: "1px solid var(--success)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.1rem" }}>💎</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-on-accent)" }}>
              {copy.charts.profit.title}
            </h3>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {copy.charts.profit.desc}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", fontSize: "0.75rem", fontWeight: 700 }}>
          <span style={{ color: "var(--success-fg)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--success-solid)" }} /> {copy.charts.profit.legendProfit}
          </span>
          <span style={{ color: "var(--danger-fg)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--danger-solid)" }} /> {copy.charts.profit.legendLoss}
          </span>
        </div>
      </div>

      {/* SVG Canvas Responsive */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Ligne médiane ZÉRO */}
          <line
            x1={paddingX}
            y1={zeroY}
            x2={width - paddingX}
            y2={zeroY}
            stroke="var(--border)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <text
            x={paddingX - 10}
            y={zeroY + 4}
            fill="var(--text-muted)"
            fontSize={10}
            fontWeight={700}
            textAnchor="end"
          >
            {copy.charts.profit.zeroAxis}
          </text>

          {/* Barres et colonnes par mois */}
          {points.map((p, i) => {
            const x = getX(i);
            const val = p.netProfitXof;
            const y = getY(val);
            const isProfit = val >= 0;
            const barWidth = Math.max(8, Math.min(28, (graphWidth / points.length) * 0.6));
            const barHeight = Math.abs(y - zeroY);
            const barY = isProfit ? y : zeroY;
            const isHovered = hoveredKey === p.key;

            return (
              <g
                key={p.key}
                onMouseEnter={() => onHover(p.key)}
                onMouseLeave={() => onHover(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Ligne verticale de repère au survol */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke="var(--border)"
                    strokeWidth={1}
                  />
                )}

                {/* Barre du bénéfice / perte */}
                <rect
                  x={x - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx={3}
                  fill={isProfit ? (isHovered ? "var(--success-fg)" : "var(--success-fg)") : (isHovered ? "var(--danger-fg)" : "var(--danger-fg)")}
                  fillOpacity={isHovered ? 1 : 0.85}
                  style={{ transition: "all 0.15s ease" }}
                />

                {/* Étiquette du mois sur l'axe X */}
                <text
                  x={x}
                  y={height - paddingY + 18}
                  fill={isHovered ? "var(--text-strong)" : "var(--text-muted)"}
                  fontSize={10}
                  fontWeight={isHovered ? 800 : 600}
                  textAnchor="middle"
                >
                  {copy.months.short(p.year, p.monthIndex)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// COMPOSANT GRAPHE 2 : ÉVOLUTION DES VENTES (Facturé vs Encaissé)
// -------------------------------------------------------------------------------------------------
function SalesChartCard({
  points,
  onHover,
  hoveredKey,
  isMainView = false,
}: {
  points: MonthlyAnalyticsPoint[];
  onHover: (key: string | null) => void;
  hoveredKey: string | null;
  isMainView?: boolean;
}) {
  const { locale } = usePrefs();
  const copy = sharedCopy[locale].exec;
  const width = 800;
  const height = isMainView ? 280 : 210;
  const paddingX = 50;
  const paddingY = 30;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const maxSales = Math.max(...points.map((p) => Math.max(p.salesInvoicedXof, p.salesCollectedXof)), 1000000) * 1.15;

  const getY = (val: number) => height - paddingY - (val / maxSales) * graphHeight;
  const getX = (index: number) => {
    if (points.length <= 1) return paddingX + graphWidth / 2;
    return paddingX + (index / (points.length - 1)) * graphWidth;
  };

  const createPath = (values: number[]) => {
    if (values.length < 2) return "";
    return values
      .map((val, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(val)}`)
      .join(" ");
  };

  const invoicedPath = createPath(points.map((p) => p.salesInvoicedXof));
  const collectedPath = createPath(points.map((p) => p.salesCollectedXof));

  return (
    <div
      className="ox-glass"
      style={{
        padding: "1.4rem",
        borderRadius: 16,
        background: "var(--surface)",
        border: "1px solid var(--accent)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.1rem" }}>💰</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-on-accent)" }}>
              {copy.charts.sales.title}
            </h3>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {copy.charts.sales.desc}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", fontSize: "0.75rem", fontWeight: 700 }}>
          <span style={{ color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 3, background: "var(--accent)" }} /> {copy.charts.sales.legendInvoiced}
          </span>
          <span style={{ color: "var(--success-fg)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 3, background: "var(--success-solid)" }} /> {copy.charts.sales.legendCollected}
          </span>
        </div>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Lignes de niveau */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = height - paddingY - pct * graphHeight;
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border)" strokeDasharray="3 3" />
                <text x={paddingX - 10} y={y + 3} fill="var(--text-subtle)" fontSize={9} textAnchor="end">
                  {formatXof(maxSales * pct)}
                </text>
              </g>
            );
          })}

          {/* Courbes */}
          {invoicedPath && <path d={invoicedPath} fill="none" stroke="var(--accent-fg)" strokeWidth={2.5} />}
          {collectedPath && <path d={collectedPath} fill="none" stroke="var(--success-fg)" strokeWidth={2.5} />}

          {/* Points interactifs */}
          {points.map((p, i) => {
            const x = getX(i);
            const yInv = getY(p.salesInvoicedXof);
            const yCol = getY(p.salesCollectedXof);
            const isHovered = hoveredKey === p.key;

            return (
              <g key={p.key} onMouseEnter={() => onHover(p.key)} onMouseLeave={() => onHover(null)} style={{ cursor: "pointer" }}>
                {isHovered && <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="var(--border)" strokeWidth={1} />}
                <circle cx={x} cy={yInv} r={isHovered ? 5 : 3.5} fill="var(--accent-fg)" stroke="var(--text-strong)" strokeWidth={1.5} />
                <circle cx={x} cy={yCol} r={isHovered ? 5 : 3.5} fill="var(--success-fg)" stroke="var(--text-strong)" strokeWidth={1.5} />
                <text x={x} y={height - paddingY + 16} fill={isHovered ? "var(--text-strong)" : "var(--text-muted)"} fontSize={10} fontWeight={isHovered ? 800 : 600} textAnchor="middle">
                  {copy.months.short(p.year, p.monthIndex)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// COMPOSANT GRAPHE 3 : ÉVOLUTION DES DÉPENSES DE L'ENTREPRISE
// -------------------------------------------------------------------------------------------------
function ExpensesChartCard({
  points,
  onHover,
  hoveredKey,
  isMainView = false,
}: {
  points: MonthlyAnalyticsPoint[];
  onHover: (key: string | null) => void;
  hoveredKey: string | null;
  isMainView?: boolean;
}) {
  const { locale } = usePrefs();
  const copy = sharedCopy[locale].exec;
  const width = 800;
  const height = isMainView ? 280 : 210;
  const paddingX = 50;
  const paddingY = 30;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const maxExpense = Math.max(...points.map((p) => p.expensesTotalXof), 1000000) * 1.15;

  const getY = (val: number) => height - paddingY - (val / maxExpense) * graphHeight;
  const getX = (index: number) => {
    if (points.length <= 1) return paddingX + graphWidth / 2;
    return paddingX + (index / (points.length - 1)) * graphWidth;
  };

  const createPath = (values: number[]) => {
    if (values.length < 2) return "";
    return values.map((val, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(val)}`).join(" ");
  };

  const expPath = createPath(points.map((p) => p.expensesTotalXof));
  const closedExpPath = expPath ? `${expPath} L ${paddingX + graphWidth} ${height - paddingY} L ${paddingX} ${height - paddingY} Z` : "";

  return (
    <div
      className="ox-glass"
      style={{
        padding: "1.4rem",
        borderRadius: 16,
        background: "var(--surface)",
        border: "1px solid var(--warning)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.1rem" }}>💸</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-on-accent)" }}>
              {copy.charts.expenses.title}
            </h3>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {copy.charts.expenses.desc}
          </p>
        </div>
        <div style={{ color: "var(--warning-fg)", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 3, background: "var(--warning-solid)" }} /> {copy.charts.expenses.legendTotal}
        </div>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Lignes repères */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = height - paddingY - pct * graphHeight;
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border)" strokeDasharray="3 3" />
                <text x={paddingX - 10} y={y + 3} fill="var(--text-subtle)" fontSize={9} textAnchor="end">
                  {formatXof(maxExpense * pct)}
                </text>
              </g>
            );
          })}

          {closedExpPath && (
            <path
              d={closedExpPath}
              fill="var(--warning-fg)"
            />
          )}
          {expPath && <path d={expPath} fill="none" stroke="var(--warning-fg)" strokeWidth={2.5} />}

          {points.map((p, i) => {
            const x = getX(i);
            const y = getY(p.expensesTotalXof);
            const isHovered = hoveredKey === p.key;
            return (
              <g key={p.key} onMouseEnter={() => onHover(p.key)} onMouseLeave={() => onHover(null)} style={{ cursor: "pointer" }}>
                {isHovered && <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="var(--border)" strokeWidth={1} />}
                <circle cx={x} cy={y} r={isHovered ? 5 : 3.5} fill="var(--warning-fg)" stroke="var(--text-strong)" strokeWidth={1.5} />
                <text x={x} y={height - paddingY + 16} fill={isHovered ? "var(--text-strong)" : "var(--text-muted)"} fontSize={10} fontWeight={isHovered ? 800 : 600} textAnchor="middle">
                  {copy.months.short(p.year, p.monthIndex)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// COMPOSANT GRAPHE 4 : PERFORMANCE DES ACTIVITÉS DE L'ENTREPRISE
// -------------------------------------------------------------------------------------------------
function ActivityChartCard({
  points,
  onHover,
  hoveredKey,
  isMainView = false,
}: {
  points: MonthlyAnalyticsPoint[];
  onHover: (key: string | null) => void;
  hoveredKey: string | null;
  isMainView?: boolean;
}) {
  const { locale } = usePrefs();
  const copy = sharedCopy[locale].exec;
  const width = 800;
  const height = isMainView ? 280 : 210;
  const paddingX = 50;
  const paddingY = 30;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const maxAct = Math.max(...points.map((p) => p.totalActivityScore), 5) * 1.25;

  const getY = (val: number) => height - paddingY - (val / maxAct) * graphHeight;
  const getX = (index: number) => {
    if (points.length <= 1) return paddingX + graphWidth / 2;
    return paddingX + (index / (points.length - 1)) * graphWidth;
  };

  const createPath = (values: number[]) => {
    if (values.length < 2) return "";
    return values.map((val, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(val)}`).join(" ");
  };

  const actPath = createPath(points.map((p) => p.totalActivityScore));

  return (
    <div
      className="ox-glass"
      style={{
        padding: "1.4rem",
        borderRadius: 16,
        background: "var(--surface)",
        border: "1px solid var(--purple)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.1rem" }}>⚡</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-on-accent)" }}>
              {copy.charts.activity.title}
            </h3>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {copy.charts.activity.desc}
          </p>
        </div>
        <div style={{ color: "var(--purple-fg)", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 3, background: "var(--purple-solid)" }} /> {copy.charts.activity.legendScore}
        </div>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {[0, 0.5, 1].map((pct, idx) => {
            const y = height - paddingY - pct * graphHeight;
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border)" strokeDasharray="3 3" />
                <text x={paddingX - 10} y={y + 3} fill="var(--text-subtle)" fontSize={9} textAnchor="end">
                  {`${Math.round(maxAct * pct)}${copy.charts.activity.axisSuffix}`}
                </text>
              </g>
            );
          })}

          {actPath && <path d={actPath} fill="none" stroke="var(--purple-fg)" strokeWidth={2.5} />}

          {points.map((p, i) => {
            const x = getX(i);
            const y = getY(p.totalActivityScore);
            const isHovered = hoveredKey === p.key;
            return (
              <g key={p.key} onMouseEnter={() => onHover(p.key)} onMouseLeave={() => onHover(null)} style={{ cursor: "pointer" }}>
                {isHovered && <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="var(--border)" strokeWidth={1} />}
                <circle cx={x} cy={y} r={isHovered ? 5 : 3.5} fill="var(--purple-fg)" stroke="var(--text-strong)" strokeWidth={1.5} />
                <text x={x} y={height - paddingY + 16} fill={isHovered ? "var(--text-strong)" : "var(--text-muted)"} fontSize={10} fontWeight={isHovered ? 800 : 600} textAnchor="middle">
                  {copy.months.short(p.year, p.monthIndex)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
