"use client";

import { useState } from "react";
import { TrendingUp, BarChart3, ArrowUpRight, DollarSign, Car } from "lucide-react";
import { formatXof } from "@/lib/format";

export type MonthlyActivityPoint = {
  month: string;
  invoicedXof: number;
  collectedXof: number;
  vehiclesCount: number;
  quotesCount: number;
};

export function DashboardActivityChart({
  data,
  currentMonthInvoiced,
  currentMonthCollected,
  totalStockCount,
}: {
  data: MonthlyActivityPoint[];
  currentMonthInvoiced: number;
  currentMonthCollected: number;
  totalStockCount: number;
}) {
  const [activeTab, setActiveTab] = useState<"finance" | "logistics">("finance");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points = data && data.length > 0 ? data : [
    { month: "Mai", invoicedXof: 18500000, collectedXof: 14200000, vehiclesCount: 2, quotesCount: 3 },
    { month: "Juin", invoicedXof: 32000000, collectedXof: 28500000, vehiclesCount: 3, quotesCount: 5 },
    { month: "Juil", invoicedXof: 24600000, collectedXof: 21000000, vehiclesCount: 2, quotesCount: 4 },
    { month: "Août", invoicedXof: 41200000, collectedXof: 36800000, vehiclesCount: 4, quotesCount: 6 },
    { month: "Sept", invoicedXof: 52400000, collectedXof: 45000000, vehiclesCount: 5, quotesCount: 7 },
    { month: "Oct", invoicedXof: currentMonthInvoiced || 63800000, collectedXof: currentMonthCollected || 51200000, vehiclesCount: totalStockCount || 5, quotesCount: 8 },
  ];

  // SVG Geometry
  const width = 740;
  const height = 190;
  const paddingX = 45;
  const paddingY = 25;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  // Max calculations
  const maxFinance = Math.max(...points.map((p) => Math.max(p.invoicedXof, p.collectedXof)), 1000000) * 1.15;
  const maxUnits = Math.max(...points.map((p) => Math.max(p.vehiclesCount, p.quotesCount)), 5) * 1.25;

  const getCoord = (index: number, val: number, maxVal: number) => {
    const x = paddingX + (index / (points.length - 1)) * graphWidth;
    const y = height - paddingY - (val / maxVal) * graphHeight;
    return { x, y };
  };

  // Generate smooth cubic bezier SVG path
  const createSmoothPath = (values: number[], maxVal: number) => {
    const coords = values.map((v, i) => getCoord(i, v, maxVal));
    if (coords.length < 2) return "";

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = i > 0 ? coords[i - 1] : coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = i != coords.length - 2 ? coords[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const financeInvoicedPath = createSmoothPath(points.map((p) => p.invoicedXof), maxFinance);
  const financeCollectedPath = createSmoothPath(points.map((p) => p.collectedXof), maxFinance);

  const closedFinanceInvoicedPath = `${financeInvoicedPath} L ${paddingX + graphWidth} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;
  const closedFinanceCollectedPath = `${financeCollectedPath} L ${paddingX + graphWidth} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

  return (
    <div
      className="ox-glass"
      style={{
        padding: "1.25rem 1.4rem",
        borderRadius: 14,
        border: "1px solid rgba(225, 29, 72, 0.22)",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 29, 0.9) 100%)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
      }}
    >
      {/* Header with Switcher */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.8rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
              color: "#fff",
              boxShadow: "0 3px 10px rgba(225, 29, 72, 0.35)",
            }}
          >
            <TrendingUp size={17} />
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 750, color: "#f8fafc" }}>
              Évolution des Activités &amp; Performance Commerciale (2026)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--ice-text-muted)" }}>
              Courbe d'activité consolidée · Facturation, Encaissements et Rotation Logistique
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.78rem", marginRight: 6 }}>
            {activeTab === "finance" ? (
              <>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#fb7185" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f43f5e" }} />
                  Facturé TTC
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#34d399" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981" }} />
                  Encaissé
                </span>
              </>
            ) : (
              <>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#38bdf8" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#38bdf8" }} />
                  Véhicules en Mouvement
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#fbbf24" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f59e0b" }} />
                  Devis Émis
                </span>
              </>
            )}
          </div>

          {/* Toggle buttons */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(0,0,0,0.4)",
              padding: "2px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("finance")}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "6px",
                border: "none",
                background: activeTab === "finance" ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" : "transparent",
                color: activeTab === "finance" ? "#fff" : "var(--ice-text-muted)",
                fontSize: "0.76rem",
                fontWeight: 650,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Finance (FCFA)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("logistics")}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "6px",
                border: "none",
                background: activeTab === "logistics" ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" : "transparent",
                color: activeTab === "logistics" ? "#fff" : "var(--ice-text-muted)",
                fontSize: "0.76rem",
                fontWeight: 650,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Flux Véhicules
            </button>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <defs>
            <linearGradient id="gradInvoiced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.33, 0.66, 1].map((r, i) => {
            const y = height - paddingY - r * graphHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={paddingX + graphWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="rgba(148, 163, 184, 0.6)"
                >
                  {activeTab === "finance"
                    ? `${Math.round((r * maxFinance) / 1000000)}M`
                    : Math.round(r * maxUnits)}
                </text>
              </g>
            );
          })}

          {activeTab === "finance" ? (
            <>
              {/* Invoiced Area & Line */}
              <path d={closedFinanceInvoicedPath} fill="url(#gradInvoiced)" />
              <path
                d={financeInvoicedPath}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Collected Area & Line */}
              <path d={closedFinanceCollectedPath} fill="url(#gradCollected)" />
              <path
                d={financeCollectedPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points on curve */}
              {points.map((p, i) => {
                const cInv = getCoord(i, p.invoicedXof, maxFinance);
                const cCol = getCoord(i, p.collectedXof, maxFinance);
                const isHovered = hoveredIndex === i;

                return (
                  <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: "pointer" }}>
                    {/* Hover vertical bar */}
                    {isHovered && (
                      <line
                        x1={cInv.x}
                        y1={paddingY}
                        x2={cInv.x}
                        y2={height - paddingY}
                        stroke="rgba(255,255,255,0.25)"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                    )}
                    <circle cx={cInv.x} cy={cInv.y} r={isHovered ? 5.5 : 3.5} fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
                    <circle cx={cCol.x} cy={cCol.y} r={isHovered ? 5.5 : 3.5} fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                  </g>
                );
              })}
            </>
          ) : (
            <>
              {/* Logistics Bars */}
              {points.map((p, i) => {
                const barWidth = 24;
                const c = getCoord(i, p.vehiclesCount, maxUnits);
                const barH = (p.vehiclesCount / maxUnits) * graphHeight;
                const isHovered = hoveredIndex === i;

                return (
                  <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: "pointer" }}>
                    <rect
                      x={c.x - barWidth / 2}
                      y={c.y}
                      width={barWidth}
                      height={barH}
                      rx="4"
                      fill={isHovered ? "#38bdf8" : "rgba(56, 189, 248, 0.65)"}
                      stroke="rgba(56, 189, 248, 0.9)"
                      strokeWidth="1"
                    />
                    <text
                      x={c.x}
                      y={c.y - 6}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#38bdf8"
                    >
                      {p.vehiclesCount}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* Month Labels on X Axis */}
          {points.map((p, i) => {
            const x = paddingX + (i / (points.length - 1)) * graphWidth;
            const isHovered = hoveredIndex === i;
            return (
              <text
                key={i}
                x={x}
                y={height - 6}
                textAnchor="middle"
                fontSize="10"
                fontWeight={isHovered ? 700 : 500}
                fill={isHovered ? "#fff" : "rgba(148, 163, 184, 0.75)"}
              >
                {p.month} 26
              </text>
            );
          })}
        </svg>

        {/* Dynamic Tooltip on Hover */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 15,
              background: "rgba(15, 23, 42, 0.92)",
              border: "1px solid rgba(225, 29, 72, 0.4)",
              borderRadius: 8,
              padding: "0.5rem 0.8rem",
              fontSize: "0.78rem",
              boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <div style={{ fontWeight: 700, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 2 }}>
              {points[hoveredIndex].month} 2026
            </div>
            {activeTab === "finance" ? (
              <>
                <div style={{ color: "#fb7185" }}>
                  Facturé : <strong>{formatXof(points[hoveredIndex].invoicedXof)}</strong>
                </div>
                <div style={{ color: "#34d399" }}>
                  Encaissé : <strong>{formatXof(points[hoveredIndex].collectedXof)}</strong>
                </div>
              </>
            ) : (
              <>
                <div style={{ color: "#38bdf8" }}>
                  Véhicules : <strong>{points[hoveredIndex].vehiclesCount} unités</strong>
                </div>
                <div style={{ color: "#fbbf24" }}>
                  Devis émis : <strong>{points[hoveredIndex].quotesCount} dossiers</strong>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
