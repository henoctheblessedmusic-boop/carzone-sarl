import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof, formatDate } from "@/lib/format";
import { ROLE_LABELS, type Role } from "@/lib/roles";
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
} from "lucide-react";

export default async function DashboardPage() {
  const user = await requireUser();

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
  ] = await Promise.all([
    prisma.customer.count({ where: { active: true } }),
    prisma.lead.count(),
    prisma.vehicle.count({ where: { status: "EN_STOCK" } }),
    prisma.vehicle.count({ where: { status: { in: ["EN_COMMANDE", "EN_TRANSIT"] } } }),
    prisma.quote.findMany({
      select: {
        id: true,
        status: true,
        totalXof: true,
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

  return (
    <AppShell user={user} titleKey="dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Welcome & Quick Action Bar */}
        <div className="ox-hero-card">
          <div>
            <div className="ox-hero-card-title">
              Bienvenue sur CARZONE Ops, {user.fullName}
            </div>
            <div className="ox-hero-card-sub">
              Poste : <strong style={{ color: "var(--gold)" }}>{ROLE_LABELS[user.role as Role] || user.role}</strong> · Showrooms Akpakpa &amp; Étoile Rouge · Atelier SAV PK3 · Cotonou, Bénin
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
                  Entrées &amp; Sorties Véhicules
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
                  Messages Clients
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
                  Répertoire Clients
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
                  Parc &amp; Flotte
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
                  Nouveau Devis Proforma
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
                  Règlements &amp; Factures
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
                  Borne Tactile
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
                  Boîte Mail
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
              Total Facturé TTC
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.7rem" }}>
              {formatXof(totalInvoicedTtc)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
              {activeInvoices.length} factures commerciales émises
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
              Total Encaissé
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#10b981" }}>
              {formatXof(totalCollected)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>
              Caisse Showroom &amp; Banques (Ecobank / BOA / MoMo)
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
              Solde Restant Dû (Créances)
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: totalOutstanding > 0 ? "var(--gold)" : "#10b981" }}>
              {formatXof(totalOutstanding)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
              {overdueCount > 0 ? `${overdueCount} facture(s) en retard` : "Créances courantes"}
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
              Pipeline Devis Proformas
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#a855f7" }}>
              {formatXof(potentialRevenue)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 600 }}>
              + {formatXof(confirmedRevenue)} en commandes fermes
            </div>
          </div>
        </div>

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
              <span>VE en Stock Showroom</span>
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.35rem", marginTop: 4 }}>
              {vehiclesInStock}{" "}
              <span style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", fontWeight: 400 }}>
                ({vehiclesInTransit} en mer)
              </span>
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "0.9rem 1.1rem", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 550 }}>
              <Users size={16} color="var(--gold)" />
              <span>Portefeuille Clients &amp; Leads</span>
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.35rem", marginTop: 4 }}>
              {customersCount}{" "}
              <span style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", fontWeight: 400 }}>
                ({leadsCount} prospects)
              </span>
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "0.9rem 1.1rem", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 550 }}>
              <Zap size={16} color="#10b981" />
              <span>Recharges Publiques</span>
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
              <span>Chantiers Bornes Ouverts</span>
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.35rem", marginTop: 4 }}>
              {chargeRequestsCount}{" "}
              <span style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", fontWeight: 400 }}>
                en cours
              </span>
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "0.9rem 1.1rem", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 550 }}>
              <Wrench size={16} color="#f59e0b" />
              <span>Atelier SAV &amp; Entretien</span>
            </div>
            <div className="ox-metric-val" style={{ fontSize: "1.35rem", marginTop: 4 }}>
              {openTasksCount}{" "}
              <span style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", fontWeight: 400 }}>
                ordres ouverts
              </span>
            </div>
          </div>
        </div>

        {/* 2 Colonnes : Derniers Règlements Encaissés & Dernières Factures Émises */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "1.5rem" }}>
          {/* Colonne 1 : Derniers Règlements Encaissés */}
          <div
            className="ox-glass"
            style={{
              padding: "1.25rem 1.5rem",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CreditCard size={18} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                  Derniers Règlements Encaissés
                </h3>
              </div>
              <Link href="/invoices" style={{ fontSize: "0.82rem", color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                Voir tous →
              </Link>
            </div>

            {recentPayments.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--ice-text-muted)", fontSize: "0.88rem" }}>
                Aucun règlement récent enregistré.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentPayments.map((p) => (
                  <div key={p.id} className="ox-card-row">
                    <div>
                      <div style={{ fontWeight: 650, fontSize: "0.9rem", color: "var(--ice-text-strong)" }}>
                        {p.invoice.customer.contactName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
                        {formatDate(p.paidAt)} · Facture {p.invoice.number} · {p.method}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, color: "#10b981", fontSize: "0.98rem" }}>
                        +{formatXof(p.amountXof)}
                      </div>
                      <Link
                        href={`/invoices/payments/${p.id}/receipt`}
                        target="_blank"
                        style={{ fontSize: "0.72rem", color: "var(--gold)", textDecoration: "underline" }}
                      >
                        Quittance
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne 2 : Dernières Factures Émises */}
          <div
            className="ox-glass"
            style={{
              padding: "1.25rem 1.5rem",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileCheck size={18} color="var(--brand)" />
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                  Dernières Factures Normalisées
                </h3>
              </div>
              <Link href="/invoices" style={{ fontSize: "0.82rem", color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                Gérer →
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--ice-text-muted)", fontSize: "0.88rem" }}>
                Aucune facture enregistrée pour le moment.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentInvoices.map((inv) => {
                  const balanceDue = Math.max(0, inv.totalXof - inv.paidXof);

                  return (
                    <div key={inv.id} className="ox-card-row">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ice-text-strong)" }}>
                            {inv.number}
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "var(--ice-text)" }}>
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
                            {inv.status}
                          </Badge>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
                          {formatDate(inv.createdAt)} · Échéance {formatDate(inv.dueDate)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 750, fontSize: "0.95rem", color: "var(--ice-text-strong)" }}>
                          {formatXof(inv.totalXof)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: balanceDue === 0 ? "#10b981" : "var(--gold)",
                          }}
                        >
                          {balanceDue === 0 ? "Soldée" : `Solde: ${formatXof(balanceDue)}`}
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
