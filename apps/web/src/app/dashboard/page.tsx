import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import type { Role } from "@/lib/roles";
import { getServerMessages } from "@/lib/i18n/server";
import { dashboardPageCopy } from "@/lib/i18n/messages/dashboard-page";
import {
  CreditCard,
  Zap,
  Car,
  Users,
  FileCheck,
  Plus,
  Mail,
  ShieldCheck,
  Wrench,
  Layers,
  ShoppingCart,
  Factory,
  Ship,
  Anchor,
  Store,
  ArrowRight,
} from "lucide-react";
import { ExecutiveDashboardCharts } from "@/components/ExecutiveDashboardCharts";
import { buildRealDashboardAnalytics } from "@/lib/dashboard-analytics";

export default async function DashboardPage() {
  const user = await requireUser();
  const { locale, messages } = await getServerMessages();
  const copy = dashboardPageCopy[locale];

  const [
    customersCount,
    leadsCount,
    vehiclesInStock,
    vehiclesInTransit,
    quotes,
    invoices,
    recentPayments,
    chargingStats,
    openTasksCount,
    chargeRequestsCount,
    allVehicles,
    allExpenses,
    allSalaryPayments,
    allPayments,
    allWorkshopEntries,
    allCustomers,
  ] = await Promise.all([
    prisma.customer.count({ where: { active: true } }),
    prisma.lead.count(),
    prisma.vehicle.count({ where: { status: { in: ["EN_STOCK", "EN_MAGASIN"] } } }),
    prisma.vehicle.count({ where: { status: { in: ["COMMANDE", "EN_COMMANDE", "EN_PRODUCTION", "EN_TRANSIT", "AU_PORT"] } } }),
    prisma.quote.findMany({
      select: {
        id: true,
        status: true,
        totalXof: true,
        createdAt: true,
      },
    }),
    prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      take: 6,
      orderBy: { paidAt: "desc" },
      include: {
        invoice: {
          include: { customer: true },
        },
      },
    }),
    prisma.chargingSession.aggregate({
      where: { status: "TERMINEE" },
      _count: { id: true },
      _sum: { kwhDelivered: true, totalXof: true },
    }),
    prisma.task.count({ where: { done: false } }),
    prisma.chargeInstallRequest.count({ where: { status: { not: "TERMINEE" } } }),
    prisma.vehicle.findMany({
      select: {
        id: true,
        brand: true,
        model: true,
        status: true,
        priceXof: true,
        createdAt: true,
      },
    }),
    prisma.expense.findMany({
      select: {
        amountTtcXof: true,
        category: true,
        status: true,
        serviceDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.salaryPayment.findMany({
      select: {
        amountXof: true,
        month: true,
        year: true,
        status: true,
        paymentDate: true,
      },
      orderBy: { paymentDate: "asc" },
    }),
    prisma.payment.findMany({
      select: {
        amountXof: true,
        paidAt: true,
      },
      orderBy: { paidAt: "asc" },
    }),
    prisma.workshopEntry.findMany({
      select: {
        statusCode: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.customer.findMany({
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Financial aggregates
  const activeInvoices = invoices.filter((i) => i.status !== "ANNULEE");
  const totalInvoicedTtc = activeInvoices.reduce((s, i) => s + i.totalXof, 0);
  const totalCollected = activeInvoices.reduce((s, i) => s + i.paidXof, 0);
  const totalOutstanding = Math.max(0, totalInvoicedTtc - totalCollected);

  // Overdue count
  const overdueCount = activeInvoices.filter((i) => i.status === "EN_RETARD").length;

  // Commercial pipeline
  const pendingQuotes = quotes.filter((q) =>
    ["BROUILLON", "PROFORMA_ENVOYEE", "ENVOYE"].includes(q.status)
  );
  const confirmedQuotes = quotes.filter((q) =>
    ["COMMANDE_CONFIRMEE", "ACCEPTE"].includes(q.status)
  );

  const potentialRevenue = pendingQuotes.reduce((s, q) => s + q.totalXof, 0);
  const confirmedRevenue = confirmedQuotes.reduce((s, q) => s + q.totalXof, 0);

  const recentInvoices = invoices.slice(0, 6);

  // Stock Général Pipeline (5 Étapes officielles demandées)
  const normalizedVehicles = allVehicles.map((v) => ({
    ...v,
    stageKey:
      v.status === "EN_STOCK" || v.status === "EN_MAGASIN"
        ? "EN_MAGASIN"
        : v.status === "COMMANDE"
        ? "COMMANDE"
        : v.status === "EN_PRODUCTION"
        ? "EN_PRODUCTION"
        : v.status === "EN_TRANSIT"
        ? "EN_TRANSIT"
        : v.status === "AU_PORT"
        ? "AU_PORT"
        : v.status,
  }));

  const stockStageStats: Record<string, { count: number; totalXof: number }> = {
    COMMANDE: { count: 0, totalXof: 0 },
    EN_PRODUCTION: { count: 0, totalXof: 0 },
    EN_TRANSIT: { count: 0, totalXof: 0 },
    AU_PORT: { count: 0, totalXof: 0 },
    EN_MAGASIN: { count: 0, totalXof: 0 },
  };

  normalizedVehicles.forEach((v) => {
    if (stockStageStats[v.stageKey]) {
      stockStageStats[v.stageKey].count += 1;
      stockStageStats[v.stageKey].totalXof += v.priceXof || 0;
    }
  });

  const totalStockCount = allVehicles.length;
  const totalStockValue = allVehicles.reduce((acc, v) => acc + (v.priceXof || 0), 0);

  const STOCK_PIPELINE_STAGES = [
    {
      key: "COMMANDE",
      label: copy.stock.stageOrders,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.35)",
      icon: ShoppingCart,
    },
    {
      key: "EN_PRODUCTION",
      label: copy.stock.stageProduction,
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.12)",
      border: "rgba(6, 182, 212, 0.35)",
      icon: Factory,
    },
    {
      key: "EN_TRANSIT",
      label: copy.stock.stageTransit,
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.12)",
      border: "rgba(139, 92, 246, 0.35)",
      icon: Ship,
    },
    {
      key: "AU_PORT",
      label: copy.stock.stagePort,
      color: "#ec4899",
      bg: "rgba(236, 72, 153, 0.12)",
      border: "rgba(236, 72, 153, 0.35)",
      icon: Anchor,
    },
    {
      key: "EN_MAGASIN",
      label: copy.stock.stageShowroom,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.35)",
      icon: Store,
    },
  ] as const;

  // Données 100% réelles agrégées par mois sans aucune valeur fictive
  const analytics = buildRealDashboardAnalytics({
    invoices,
    payments: allPayments,
    expenses: allExpenses,
    salaryPayments: allSalaryPayments,
    quotes,
    vehicles: allVehicles,
    workshopEntries: allWorkshopEntries,
    customers: allCustomers,
  });

  return (
    <AppShell user={user} titleKey="dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Welcome & Quick Action Bar */}
        <div className="ox-hero-card">
          <div>
            <div className="ox-hero-card-title">
              {copy.welcome(user.fullName)}
            </div>
            <div className="ox-hero-card-sub">
              {copy.rolePrefix}{" "}
              <strong style={{ color: "var(--gold)" }}>{messages.roles[user.role as Role] || user.role}</strong>
              {" · "}
              {copy.hqLine}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {user.role === "ADMIN" ? (
              <>
                <Link
                  href="/vehicles"
                  className="ox-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "linear-gradient(135deg, var(--gold) 0%, #b89130 100%)",
                    color: "#0a1622",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Car size={16} />
                  {copy.shortcuts.adminVehiclesInOut}
                </Link>

                <Link
                  href="/mailbox"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Mail size={16} color="var(--brand)" />
                  {copy.shortcuts.adminClientMessages}
                </Link>

                <Link
                  href="/clients"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Users size={16} color="#10b981" />
                  {copy.shortcuts.adminClientDirectory}
                </Link>

                <Link
                  href="/fleet"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Car size={16} color="#38bdf8" />
                  {copy.shortcuts.adminFleet}
                </Link>
              </>
            ) : user.role === "DEVELOPER" ? (
              <>
                <Link
                  href="/vehicles"
                  className="ox-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "linear-gradient(135deg, var(--gold) 0%, #b89130 100%)",
                    color: "#0a1622",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Car size={16} />
                  {copy.shortcuts.devVehicleStock}
                </Link>

                <Link
                  href="/users"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Users size={16} color="var(--brand)" />
                  {copy.shortcuts.devUsersRoles}
                </Link>

                <Link
                  href="/invoices"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <CreditCard size={16} color="#10b981" />
                  {copy.shortcuts.devBillingFinance}
                </Link>

                <Link
                  href="/workshop"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Wrench size={16} color="#f59e0b" />
                  {copy.shortcuts.devWorkshop}
                </Link>

                <Link
                  href="/mailbox"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Mail size={16} color="var(--brand)" />
                  {copy.shortcuts.devMailbox}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/quotes"
                  className="ox-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "linear-gradient(135deg, var(--gold) 0%, #b89130 100%)",
                    color: "#0a1622",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Plus size={16} />
                  {copy.shortcuts.salesNewQuote}
                </Link>

                <Link
                  href="/invoices"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <CreditCard size={16} color="#10b981" />
                  {copy.shortcuts.salesPaymentsInvoices}
                </Link>

                <Link
                  href="/terminal"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Zap size={16} color="#38bdf8" />
                  {copy.shortcuts.salesTerminal}
                </Link>

                <Link
                  href="/mailbox"
                  className="ox-btn ox-btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    padding: "0.55rem 1rem",
                    borderRadius: 8,
                  }}
                >
                  <Mail size={16} color="var(--brand)" />
                  {copy.shortcuts.salesMailbox}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 4 Indicateurs Financiers Clés */}
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
              padding: "1.2rem 1.35rem",
              borderRadius: 12,
              borderLeft: "4px solid #38bdf8",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              {copy.kpi.totalInvoiced}
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.7rem" }}>
              {formatXof(totalInvoicedTtc)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
              {copy.kpi.invoicedHint(activeInvoices.length)}
            </div>
          </div>

          <div
            className="ox-glass"
            style={{
              padding: "1.2rem 1.35rem",
              borderRadius: 12,
              borderLeft: "4px solid #10b981",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              {copy.kpi.totalCollected}
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#10b981" }}>
              {formatXof(totalCollected)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>
              {copy.kpi.collectedHint}
            </div>
          </div>

          <div
            className="ox-glass"
            style={{
              padding: "1.2rem 1.35rem",
              borderRadius: 12,
              borderLeft: "4px solid var(--gold)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              {copy.kpi.outstanding}
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: totalOutstanding > 0 ? "var(--gold)" : "#10b981" }}>
              {formatXof(totalOutstanding)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
              {copy.kpi.outstandingHint(overdueCount)}
            </div>
          </div>

          <div
            className="ox-glass"
            style={{
              padding: "1.2rem 1.35rem",
              borderRadius: 12,
              borderLeft: "4px solid #a855f7",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              {copy.kpi.quotesPipeline}
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#a855f7" }}>
              {formatXof(potentialRevenue)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 600 }}>
              {copy.kpi.confirmedRevenue(formatXof(confirmedRevenue))}
            </div>
          </div>
        </div>

        {/* Stock Général CARZONE — Pipeline Logistique & Magasin */}
        <div
          className="ox-glass"
          style={{
            padding: "1.1rem 1.35rem",
            borderRadius: 14,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0.05) 100%)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  color: "#38bdf8",
                }}
              >
                <Layers size={18} />
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 750, color: "var(--ice-text-strong)" }}>
                  {copy.stock.title}
                </h3>
                <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
                  {copy.stock.inventoryLabel}{" "}
                  <strong style={{ color: "#fff" }}>{copy.stock.vehicleCount(totalStockCount)}</strong>
                  {" · "}
                  {copy.stock.marketValueLabel}{" "}
                  <strong style={{ color: "var(--gold)" }}>{formatXof(totalStockValue)}</strong>
                </div>
              </div>
            </div>

            <Link
              href="/vehicles"
              className="ox-btn ox-btn-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.8rem",
                padding: "0.45rem 0.85rem",
                borderRadius: 8,
                color: "var(--brand)",
              }}
            >
              {copy.stock.viewInventory}
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 5 Stages Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
              gap: "0.75rem",
            }}
          >
            {STOCK_PIPELINE_STAGES.map((stg) => {
              const Icon = stg.icon;
              const stats = stockStageStats[stg.key] || { count: 0, totalXof: 0 };
              const percent = totalStockCount > 0 ? Math.round((stats.count / totalStockCount) * 100) : 0;

              return (
                <Link
                  key={stg.key}
                  href={`/vehicles?stage=${stg.key}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    background: stg.bg,
                    border: `1px solid ${stg.border}`,
                    borderRadius: 10,
                    padding: "0.85rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "transform 0.15s ease, border-color 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 650, color: stg.color }}>
                      <Icon size={15} />
                      <span>{stg.label}</span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 999,
                        background: "rgba(0,0,0,0.3)",
                        color: stg.color,
                      }}
                    >
                      {percent}%
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>
                      {stats.count}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
                      {copy.stock.vehicleUnit(stats.count)}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.76rem", fontWeight: 650, color: "var(--gold)" }}>
                    {formatXof(stats.totalXof)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 4 Graphes Exécutifs Réels (Ventes, Dépenses, Activités, Bénéfice Net après charges et salaires) */}
        <ExecutiveDashboardCharts analytics={analytics} />

        {/* 5 Indicateurs Opérationnels (Stock, Clients, Bornes, SAV, Chantiers) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
            gap: "0.85rem",
          }}
        >
          <div className="ox-glass" style={{ padding: "0.9rem 1.1rem", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 550 }}>
              <Car size={16} color="var(--brand)" />
              <span>{copy.ops.evInStock}</span>
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.35rem", marginTop: 4 }}>
              {vehiclesInStock}{" "}
              <span style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", fontWeight: 400 }}>
                {copy.ops.atSea(vehiclesInTransit)}
              </span>
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "0.9rem 1.1rem", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 550 }}>
              <Users size={16} color="var(--gold)" />
              <span>{copy.ops.clientsLeads}</span>
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.35rem", marginTop: 4 }}>
              {customersCount}{" "}
              <span style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", fontWeight: 400 }}>
                {copy.ops.leadsHint(leadsCount)}
              </span>
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "0.9rem 1.1rem", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 550 }}>
              <Zap size={16} color="#10b981" />
              <span>{copy.ops.publicCharging}</span>
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.35rem", marginTop: 4 }}>
              {chargingStats._count.id}{" "}
              <span style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", fontWeight: 400 }}>
                ({Math.round(chargingStats._sum.kwhDelivered || 0)} kWh)
              </span>
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "0.9rem 1.1rem", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 550 }}>
              <ShieldCheck size={16} color="#38bdf8" />
              <span>{copy.ops.chargerSites}</span>
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.35rem", marginTop: 4 }}>
              {chargeRequestsCount}{" "}
              <span style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", fontWeight: 400 }}>
                {copy.ops.inProgress}
              </span>
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "0.9rem 1.1rem", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 550 }}>
              <Wrench size={16} color="#f59e0b" />
              <span>{copy.ops.workshop}</span>
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.35rem", marginTop: 4 }}>
              {openTasksCount}{" "}
              <span style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", fontWeight: 400 }}>
                {copy.ops.openOrders}
              </span>
            </div>
          </div>
        </div>

        {/* 2 Colonnes Compactes : Derniers Règlements Encaissés & Factures Récentes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "1rem" }}>
          {/* Colonne 1 : Derniers Règlements Encaissés (Taille Réduite) */}
          <div
            className="ox-glass"
            style={{
              padding: "0.85rem 1.15rem",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <CreditCard size={16} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                  {copy.payments.title}
                </h3>
              </div>
              <Link href="/invoices" style={{ fontSize: "0.78rem", color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                {copy.payments.viewAll} →
              </Link>
            </div>

            {recentPayments.length === 0 ? (
              <div style={{ padding: "0.85rem 0.5rem", textAlign: "center", color: "var(--ice-text-muted)", fontSize: "0.8rem" }}>
                {copy.payments.empty}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {recentPayments.map((p) => (
                  <div key={p.id} className="ox-card-row" style={{ padding: "0.45rem 0.65rem" }}>
                    <div>
                      <div style={{ fontWeight: 650, fontSize: "0.84rem", color: "var(--ice-text-strong)" }}>
                        {p.invoice.customer.contactName}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)", marginTop: 1 }}>
                        {copy.formatDate(p.paidAt)} · {copy.invoices.invoiceWord} {p.invoice.number} · {p.method}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, color: "#10b981", fontSize: "0.88rem" }}>
                        +{formatXof(p.amountXof)}
                      </div>
                      <Link
                        href={`/invoices/payments/${p.id}/receipt`}
                        target="_blank"
                        style={{ fontSize: "0.7rem", color: "var(--gold)", textDecoration: "underline" }}
                      >
                        {copy.payments.receipt}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne 2 : Dernières Factures Émises (Taille Réduite) */}
          <div
            className="ox-glass"
            style={{
              padding: "0.85rem 1.15rem",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <FileCheck size={16} color="var(--brand)" />
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                  {copy.invoices.title}
                </h3>
              </div>
              <Link href="/invoices" style={{ fontSize: "0.78rem", color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                {copy.invoices.manage} →
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div style={{ padding: "0.85rem 0.5rem", textAlign: "center", color: "var(--ice-text-muted)", fontSize: "0.8rem" }}>
                {copy.invoices.empty}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {recentInvoices.map((inv) => {
                  const balanceDue = Math.max(0, inv.totalXof - inv.paidXof);

                  return (
                    <div key={inv.id} className="ox-card-row" style={{ padding: "0.45rem 0.65rem" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.84rem", color: "var(--ice-text-strong)" }}>
                            {inv.number}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "var(--ice-text)" }}>
                            {inv.customer.contactName}
                          </span>
                          <Badge
                            tone={
                              inv.status === "REGLEE"
                                ? "ok"
                                : inv.status === "EN_RETARD"
                                ? "bad"
                                : "warn"
                            }
                          >
                            {copy.invoiceStatus(inv.status)}
                          </Badge>
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)", marginTop: 1 }}>
                          {copy.formatDate(inv.createdAt)} · {copy.invoices.dueLabel} {copy.formatDate(inv.dueDate)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 750, fontSize: "0.88rem", color: "var(--ice-text-strong)" }}>
                          {formatXof(inv.totalXof)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: balanceDue === 0 ? "#10b981" : "var(--gold)",
                          }}
                        >
                          {balanceDue === 0 ? copy.invoices.settled : copy.invoices.balanceDue(formatXof(balanceDue))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
