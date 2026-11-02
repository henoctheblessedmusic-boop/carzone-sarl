import type { CSSProperties } from "react";
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
import { ACTIVITY } from "@/lib/permissions";
import { RoleDashboard } from "./RoleDashboard";

const DIRECTION_ROLES: Role[] = ["DEVELOPER", "PDG", "SG", "DG"];

// CSS custom properties (ex. --kpi-accent) ne font pas partie du type CSSProperties ;
// ce helper évite de répéter l'assertion de type à chaque usage.
function cssVars(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const { locale, messages } = await getServerMessages();
  const copy = dashboardPageCopy[locale];

  // Chaque rôle non-direction dispose d'un tableau de bord dédié à son périmètre.
  // La vue consolidée complète reste réservée à la direction.
  if (!DIRECTION_ROLES.includes(user.role as Role)) {
    return <RoleDashboard user={user} />;
  }

  // La Comptable Garage ne doit voir que le périmètre GARAGE (comptabilité séparée).
  const garageOnly = user.role === "COMPTA_GARAGE";
  const invoiceScope = garageOnly ? { activity: ACTIVITY.GARAGE } : undefined;
  const quoteScope = garageOnly ? { activity: ACTIVITY.GARAGE } : undefined;

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
      where: quoteScope,
      select: {
        id: true,
        status: true,
        totalXof: true,
        createdAt: true,
      },
    }),
    prisma.invoice.findMany({
      where: { isDemo: false, ...invoiceScope },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: invoiceScope ? { invoice: invoiceScope } : undefined,
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
      where: invoiceScope ? { invoice: invoiceScope } : undefined,
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
          <div className="ox-quick-actions">
            {user.role === "ADMIN" ? (
              <>
                <Link href="/vehicles" className="ox-btn ox-btn-gold ox-quick-btn">
                  <Car size={16} />
                  {copy.shortcuts.adminVehiclesInOut}
                </Link>

                <Link href="/mailbox" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <Mail size={16} color="var(--brand)" />
                  {copy.shortcuts.adminClientMessages}
                </Link>

                <Link href="/clients" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <Users size={16} color="#10b981" />
                  {copy.shortcuts.adminClientDirectory}
                </Link>

                <Link href="/fleet" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <Car size={16} color="#38bdf8" />
                  {copy.shortcuts.adminFleet}
                </Link>
              </>
            ) : user.role === "DEVELOPER" ? (
              <>
                <Link href="/vehicles" className="ox-btn ox-btn-gold ox-quick-btn">
                  <Car size={16} />
                  {copy.shortcuts.devVehicleStock}
                </Link>

                <Link href="/users" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <Users size={16} color="var(--brand)" />
                  {copy.shortcuts.devUsersRoles}
                </Link>

                <Link href="/invoices" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <CreditCard size={16} color="#10b981" />
                  {copy.shortcuts.devBillingFinance}
                </Link>

                <Link href="/workshop" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <Wrench size={16} color="#f59e0b" />
                  {copy.shortcuts.devWorkshop}
                </Link>

                <Link href="/mailbox" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <Mail size={16} color="var(--brand)" />
                  {copy.shortcuts.devMailbox}
                </Link>
              </>
            ) : (
              <>
                <Link href="/quotes" className="ox-btn ox-btn-gold ox-quick-btn">
                  <Plus size={16} />
                  {copy.shortcuts.salesNewQuote}
                </Link>

                <Link href="/invoices" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <CreditCard size={16} color="#10b981" />
                  {copy.shortcuts.salesPaymentsInvoices}
                </Link>

                <Link href="/terminal" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <Zap size={16} color="#38bdf8" />
                  {copy.shortcuts.salesTerminal}
                </Link>

                <Link href="/mailbox" className="ox-btn ox-btn-ghost ox-quick-btn">
                  <Mail size={16} color="var(--brand)" />
                  {copy.shortcuts.salesMailbox}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 4 Indicateurs Financiers Clés */}
        <div className="ox-kpi-grid">
          <div className="ox-glass ox-kpi-card" style={cssVars({ "--kpi-accent": "#38bdf8" })}>
            <div className="ox-kpi-label">{copy.kpi.totalInvoiced}</div>
            <div className="ox-kpi-value">{formatXof(totalInvoicedTtc)}</div>
            <div className="ox-kpi-hint">{copy.kpi.invoicedHint(activeInvoices.length)}</div>
          </div>

          <div
            className="ox-glass ox-kpi-card"
            style={cssVars({
              "--kpi-accent": "#10b981",
              "--kpi-value-color": "#10b981",
              "--kpi-hint-color": "#10b981",
            })}
          >
            <div className="ox-kpi-label">{copy.kpi.totalCollected}</div>
            <div className="ox-kpi-value">{formatXof(totalCollected)}</div>
            <div className="ox-kpi-hint" style={{ fontWeight: 600 }}>
              {copy.kpi.collectedHint}
            </div>
          </div>

          <div
            className="ox-glass ox-kpi-card"
            style={cssVars({
              "--kpi-accent": "var(--gold)",
              "--kpi-value-color": totalOutstanding > 0 ? "var(--gold)" : "#10b981",
            })}
          >
            <div className="ox-kpi-label">{copy.kpi.outstanding}</div>
            <div className="ox-kpi-value">{formatXof(totalOutstanding)}</div>
            <div className="ox-kpi-hint">{copy.kpi.outstandingHint(overdueCount)}</div>
          </div>

          <div
            className="ox-glass ox-kpi-card"
            style={cssVars({
              "--kpi-accent": "#a855f7",
              "--kpi-value-color": "#a855f7",
              "--kpi-hint-color": "var(--gold)",
            })}
          >
            <div className="ox-kpi-label">{copy.kpi.quotesPipeline}</div>
            <div className="ox-kpi-value">{formatXof(potentialRevenue)}</div>
            <div className="ox-kpi-hint" style={{ fontWeight: 600 }}>
              {copy.kpi.confirmedRevenue(formatXof(confirmedRevenue))}
            </div>
          </div>
        </div>

        {/* Stock Général CARZONE — Pipeline Logistique & Magasin */}
        <div className="ox-glass ox-stock-card">
          <div className="ox-stock-header">
            <div className="ox-stock-header-left">
              <span className="ox-stock-icon">
                <Layers size={18} />
              </span>
              <div className="ox-stock-title-block">
                <h3 className="ox-stock-title">{copy.stock.title}</h3>
                <div className="ox-stock-meta">
                  {copy.stock.inventoryLabel}{" "}
                  <strong style={{ color: "#fff" }}>{copy.stock.vehicleCount(totalStockCount)}</strong>
                  {" · "}
                  {copy.stock.marketValueLabel}{" "}
                  <strong style={{ color: "var(--gold)" }}>{formatXof(totalStockValue)}</strong>
                </div>
              </div>
            </div>

            <Link href="/vehicles" className="ox-btn ox-btn-ghost ox-stock-view-btn">
              {copy.stock.viewInventory}
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 5 Stages Grid */}
          <div className="ox-stock-stages-grid">
            {STOCK_PIPELINE_STAGES.map((stg) => {
              const Icon = stg.icon;
              const stats = stockStageStats[stg.key] || { count: 0, totalXof: 0 };
              const percent = totalStockCount > 0 ? Math.round((stats.count / totalStockCount) * 100) : 0;

              return (
                <Link
                  key={stg.key}
                  href={`/vehicles?stage=${stg.key}`}
                  className="ox-stock-stage"
                  style={cssVars({
                    "--stage-bg": stg.bg,
                    "--stage-border": stg.border,
                    "--stage-color": stg.color,
                  })}
                >
                  <div className="ox-stock-stage-top">
                    <div className="ox-stock-stage-label">
                      <Icon size={15} />
                      <span>{stg.label}</span>
                    </div>
                    <span className="ox-stock-stage-badge">{percent}%</span>
                  </div>

                  <div className="ox-stock-stage-count-row">
                    <div className="ox-stock-stage-count">{stats.count}</div>
                    <span className="ox-stock-stage-unit">{copy.stock.vehicleUnit(stats.count)}</span>
                  </div>

                  <div className="ox-stock-stage-value">{formatXof(stats.totalXof)}</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 4 Graphes Exécutifs Réels (Ventes, Dépenses, Activités, Bénéfice Net après charges et salaires) */}
        <ExecutiveDashboardCharts analytics={analytics} />

        {/* 5 Indicateurs Opérationnels (Stock, Clients, Bornes, SAV, Chantiers) */}
        <div className="ox-ops-grid">
          <div className="ox-glass ox-ops-card">
            <div className="ox-ops-label">
              <Car size={16} color="var(--brand)" />
              <span>{copy.ops.evInStock}</span>
            </div>
            <div className="ox-metric-val ox-ops-value">
              {vehiclesInStock}{" "}
              <span className="ox-ops-value-hint">{copy.ops.atSea(vehiclesInTransit)}</span>
            </div>
          </div>

          <div className="ox-glass ox-ops-card">
            <div className="ox-ops-label">
              <Users size={16} color="var(--gold)" />
              <span>{copy.ops.clientsLeads}</span>
            </div>
            <div className="ox-metric-val ox-ops-value">
              {customersCount}{" "}
              <span className="ox-ops-value-hint">{copy.ops.leadsHint(leadsCount)}</span>
            </div>
          </div>

          <div className="ox-glass ox-ops-card">
            <div className="ox-ops-label">
              <Zap size={16} color="#10b981" />
              <span>{copy.ops.publicCharging}</span>
            </div>
            <div className="ox-metric-val ox-ops-value">
              {chargingStats._count.id}{" "}
              <span className="ox-ops-value-hint">
                ({Math.round(chargingStats._sum.kwhDelivered || 0)} kWh)
              </span>
            </div>
          </div>

          <div className="ox-glass ox-ops-card">
            <div className="ox-ops-label">
              <ShieldCheck size={16} color="#38bdf8" />
              <span>{copy.ops.chargerSites}</span>
            </div>
            <div className="ox-metric-val ox-ops-value">
              {chargeRequestsCount}{" "}
              <span className="ox-ops-value-hint">{copy.ops.inProgress}</span>
            </div>
          </div>

          <div className="ox-glass ox-ops-card">
            <div className="ox-ops-label">
              <Wrench size={16} color="#f59e0b" />
              <span>{copy.ops.workshop}</span>
            </div>
            <div className="ox-metric-val ox-ops-value">
              {openTasksCount}{" "}
              <span className="ox-ops-value-hint">{copy.ops.openOrders}</span>
            </div>
          </div>
        </div>

        {/* 2 Colonnes Compactes : Derniers Règlements Encaissés & Factures Récentes */}
        <div className="ox-two-col-grid">
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                <CreditCard size={16} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                  {copy.payments.title}
                </h3>
              </div>
              <Link href="/invoices" style={{ fontSize: "0.78rem", color: "var(--brand)", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
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
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 650, fontSize: "0.84rem", color: "var(--ice-text-strong)", overflowWrap: "anywhere" }}>
                        {p.invoice.customer.contactName}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)", marginTop: 1, overflowWrap: "anywhere" }}>
                        {copy.formatDate(p.paidAt)} · {copy.invoices.invoiceWord} {p.invoice.number} · {p.method}
                      </div>
                    </div>
                    <div className="ox-card-row-amount">
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                <FileCheck size={16} color="var(--brand)" />
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                  {copy.invoices.title}
                </h3>
              </div>
              <Link href="/invoices" style={{ fontSize: "0.78rem", color: "var(--brand)", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
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
                      <div style={{ minWidth: 0 }}>
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
                        <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)", marginTop: 1, overflowWrap: "anywhere" }}>
                          {copy.formatDate(inv.createdAt)} · {copy.invoices.dueLabel} {copy.formatDate(inv.dueDate)}
                        </div>
                      </div>
                      <div className="ox-card-row-amount">
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
