import Link from "next/link";
import {
  Car,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Gauge,
  Landmark,
  Layers,
  Mail,
  Package,
  Receipt,
  Ship,
  Store,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import type { SessionUser } from "@/lib/auth";

type Metric = {
  label: string;
  value: string;
  hint?: string;
  accent: string;
};

type QuickAction = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const QUICK_ACTIONS: Partial<Record<Role, QuickAction[]>> = {
  COMPTA: [
    { href: "/invoices", label: "Factures & règlements", icon: Receipt },
    { href: "/quotes", label: "Devis & proformas", icon: FileText },
    { href: "/expenses", label: "Dépenses", icon: Wallet },
    { href: "/hr", label: "Ressources humaines", icon: Users },
    { href: "/delivery-notes", label: "Bons de livraison", icon: ClipboardList },
  ],
  RF: [
    { href: "/invoices", label: "Bilan & encaissements", icon: Landmark },
    { href: "/quotes", label: "Devis & marges", icon: FileText },
    { href: "/expenses", label: "Dépenses", icon: Wallet },
    { href: "/hr", label: "Masse salariale", icon: Users },
  ],
  COMPTA_GARAGE: [
    { href: "/invoices", label: "Factures garage", icon: Receipt },
    { href: "/quotes", label: "Devis garage", icon: FileText },
    { href: "/delivery-notes", label: "BL internes garage", icon: ClipboardList },
    { href: "/workshop", label: "Atelier SAV", icon: Wrench },
    { href: "/parts", label: "Pièces détachées", icon: Package },
  ],
  ASSISTANTE_COMPTABLE: [
    { href: "/invoices", label: "Factures & règlements", icon: Receipt },
    { href: "/quotes", label: "Devis & proformas", icon: FileText },
    { href: "/expenses", label: "Dépenses", icon: Wallet },
    { href: "/workshop", label: "Atelier facturable", icon: Wrench },
    { href: "/clients", label: "Clients", icon: Users },
  ],
  COMMERCIAL: [
    { href: "/clients", label: "Clients & prospects", icon: Users },
    { href: "/quotes", label: "Devis & proformas", icon: FileText },
    { href: "/invoices", label: "Factures", icon: Receipt },
    { href: "/vehicles", label: "Stock véhicules", icon: Car },
    { href: "/opportunities", label: "Pipeline", icon: Gauge },
  ],
  ADV: [
    { href: "/quotes", label: "Devis & proformas", icon: FileText },
    { href: "/invoices", label: "Factures", icon: Receipt },
    { href: "/vehicles", label: "Stock véhicules", icon: Car },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/delivery-notes", label: "Bons de livraison", icon: ClipboardList },
  ],
  DC: [
    { href: "/opportunities", label: "Pipeline commercial", icon: Gauge },
    { href: "/vehicles", label: "Stock showroom", icon: Car },
    { href: "/quotes", label: "Offres & proformas", icon: FileText },
    { href: "/clients", label: "Clients & grands comptes", icon: Users },
  ],
  HOTESSE: [
    { href: "/clients", label: "Accueil & fiches clients", icon: Users },
    { href: "/vehicles", label: "Stock véhicules", icon: Car },
    { href: "/quotes", label: "Devis d'accueil", icon: FileText },
    { href: "/invoices", label: "Factures & reçus", icon: Receipt },
  ],
  RH: [
    { href: "/hr", label: "Personnel & paie", icon: Users },
    { href: "/users", label: "Comptes & accès", icon: CreditCard },
    { href: "/chat", label: "Communication interne", icon: Mail },
  ],
  STOCK: [
    { href: "/vehicles", label: "Stock véhicules", icon: Car },
    { href: "/catalog", label: "Catalogue & marques", icon: Store },
    { href: "/imports", label: "Imports maritimes", icon: Ship },
  ],
  STOCK_GARAGE: [
    { href: "/workshop", label: "Atelier SAV", icon: Wrench },
    { href: "/parts", label: "Stock pièces garage", icon: Package },
  ],
  ATELIER: [
    { href: "/workshop", label: "Atelier SAV", icon: Wrench },
    { href: "/parts", label: "Pièces détachées", icon: Package },
    { href: "/vehicles", label: "Fiches véhicules", icon: Car },
  ],
  CHEF_ATELIER: [
    { href: "/workshop", label: "Ordres de réparation", icon: Wrench },
    { href: "/parts", label: "Stock pièces", icon: Package },
    { href: "/quotes", label: "Devis atelier", icon: FileText },
    { href: "/clients", label: "Clients atelier", icon: Users },
  ],
  RTA: [
    { href: "/workshop", label: "Atelier SAV", icon: Wrench },
    { href: "/quotes", label: "Devis réparations", icon: FileText },
    { href: "/parts", label: "Pièces de rechange", icon: Package },
    { href: "/vehicles", label: "Fiches véhicules", icon: Car },
  ],
  BORNES_OPS: [
    { href: "/charging", label: "Réseau de bornes", icon: Zap },
    { href: "/terminal", label: "Terminal de paiement", icon: CreditCard },
    { href: "/charge-requests", label: "Demandes d'installation", icon: ClipboardList },
    { href: "/installers", label: "Installateurs agréés", icon: Wrench },
    { href: "/mailbox", label: "Boîte mail", icon: Mail },
  ],
  ADMIN: [
    { href: "/vehicles", label: "Stock véhicules", icon: Car },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/mailbox", label: "Boîte mail", icon: Mail },
    { href: "/fleet", label: "Flotte", icon: Car },
    { href: "/users", label: "Comptes collaborateurs", icon: CreditCard },
  ],
  INSTALLATEUR: [
    { href: "/charge-requests", label: "Demandes d'installation", icon: Wrench },
    { href: "/installers", label: "Mon profil installateur", icon: Users },
  ],
  GESTIONNAIRE_LOCATION: [
    { href: "/rentals", label: "Parc de location & contrats", icon: Car },
    { href: "/clients", label: "Clients location", icon: Users },
  ],
};

const DEFAULT_ACTIONS: QuickAction[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: Layers },
  { href: "/clients", label: "Clients", icon: Users },
];

function kpi(label: string, value: string, accent: string, hint?: string): Metric {
  return { label, value, accent, hint };
}

async function buildMetrics(role: Role): Promise<Metric[]> {
  const garage = role === "COMPTA_GARAGE";
  const invoiceWhere = { isDemo: false, ...(garage ? { activity: "GARAGE" } : {}) };
  const quoteWhere = {
    status: { notIn: ["FACTURE_NORMALISEE", "ANNULE"] },
    ...(garage ? { activity: "GARAGE" } : {}),
  };

  if (role === "COMPTA" || role === "RF" || role === "COMPTA_GARAGE" || role === "ASSISTANTE_COMPTABLE") {
    const [invoiceAgg, paymentAgg, quoteAgg, expenseAgg] = await Promise.all([
      prisma.invoice.aggregate({ where: invoiceWhere, _count: true, _sum: { totalXof: true } }),
      prisma.payment.aggregate({
        where: garage ? { invoice: { activity: "GARAGE" } } : undefined,
        _sum: { amountXof: true },
      }),
      prisma.quote.aggregate({ where: quoteWhere, _count: true, _sum: { totalXof: true } }),
      role === "COMPTA_GARAGE"
        ? Promise.resolve(null)
        : prisma.expense.aggregate({
            where: { status: { not: "ANNULE" } },
            _sum: { amountTtcXof: true },
          }),
    ]);
    const invoiced = invoiceAgg._sum.totalXof ?? 0;
    const paid = paymentAgg._sum.amountXof ?? 0;
    const metrics = [
      kpi("Facturé TTC", formatXof(invoiced), "#38bdf8", `${invoiceAgg._count} facture(s)`),
      kpi("Encaissé", formatXof(paid), "#34d399", garage ? "Périmètre garage" : "Showroom & garage"),
      kpi(
        "Créances à recouvrer",
        formatXof(Math.max(0, invoiced - paid)),
        "#fbbf24",
        "Solde des factures"
      ),
      kpi(
        "Devis en attente",
        formatXof(quoteAgg._sum.totalXof ?? 0),
        "#a78bfa",
        `${quoteAgg._count} devis`
      ),
    ];
    if (expenseAgg) {
      metrics.push(
        kpi("Dépenses d'exploitation", formatXof(expenseAgg._sum.amountTtcXof ?? 0), "#fb7185", "Hors salaires")
      );
    }
    return metrics;
  }

  if (role === "COMMERCIAL" || role === "ADV" || role === "DC" || role === "HOTESSE") {
    const [customers, leads, opps, quotes, vehicles] = await Promise.all([
      prisma.customer.count({ where: { active: true } }),
      prisma.lead.count(),
      prisma.opportunity.aggregate({ _count: true, _sum: { amountXof: true } }),
      prisma.quote.aggregate({ where: quoteWhere, _count: true, _sum: { totalXof: true } }),
      prisma.vehicle.count({ where: { status: { in: ["EN_STOCK", "EN_MAGASIN"] } } }),
    ]);
    return [
      kpi("Clients actifs", String(customers), "#38bdf8", "Base clients"),
      kpi("Prospects", String(leads), "#a78bfa", "Leads entrants"),
      kpi(
        "Pipeline",
        formatXof(opps._sum.amountXof ?? 0),
        "#fbbf24",
        `${opps._count} opportunité(s)`
      ),
      kpi("Devis en cours", String(quotes._count), "#34d399", formatXof(quotes._sum.totalXof ?? 0)),
      kpi("Véhicules disponibles", String(vehicles), "#f472b6", "Stock showroom"),
    ];
  }

  if (role === "RH") {
    const [employees, pendingLeaves, salaries, departments] = await Promise.all([
      prisma.employee.count(),
      prisma.leaveRequest.count({ where: { status: "EN_ATTENTE" } }),
      prisma.salaryPayment.aggregate({ _sum: { amountXof: true } }),
      prisma.department.count(),
    ]);
    return [
      kpi("Effectif", String(employees), "#38bdf8", "Salariés enregistrés"),
      kpi("Congés à valider", String(pendingLeaves), "#fbbf24", "Demandes en attente"),
      kpi("Masse salariale payée", formatXof(salaries._sum.amountXof ?? 0), "#34d399", "Cumul enregistré"),
      kpi("Départements", String(departments), "#a78bfa", "Structure RH"),
    ];
  }

  if (role === "STOCK") {
    const [stock, transit, imports] = await Promise.all([
      prisma.vehicle.count({ where: { status: { in: ["EN_STOCK", "EN_MAGASIN"] } } }),
      prisma.vehicle.count({ where: { status: { in: ["COMMANDE", "EN_COMMANDE", "EN_PRODUCTION", "EN_TRANSIT", "AU_PORT"] } } }),
      prisma.importOrder.count({ where: { status: { not: "CLOTURE" } } }).catch(() => 0),
    ]);
    return [
      kpi("Véhicules en stock", String(stock), "#38bdf8", "Disponibles showroom"),
      kpi("En commande / transit", String(transit), "#fbbf24", "Arrivages à venir"),
      kpi("Imports en cours", String(imports), "#a78bfa", "Dossiers maritimes"),
    ];
  }

  if (role === "STOCK_GARAGE") {
    const [workshopTotal, openWorkshop, lowStockParts] = await Promise.all([
      prisma.workshopEntry.count(),
      prisma.workshopEntry.count({ where: { exitDate: null } }).catch(() => 0),
      prisma.partItem.findMany({ where: { active: true }, select: { stockQuantity: true, minStockAlert: true } }),
    ]);
    const lowStock = lowStockParts.filter((p) => p.stockQuantity <= p.minStockAlert).length;
    return [
      kpi("Passages atelier", String(workshopTotal), "#38bdf8", "Historique SAV"),
      kpi("Véhicules en atelier", String(openWorkshop), "#fbbf24", "Sans sortie enregistrée"),
      kpi("Pièces sous seuil", String(lowStock), "#fb7185", "Stock magasin garage"),
    ];
  }

  if (role === "ATELIER" || role === "CHEF_ATELIER" || role === "RTA") {
    const [workshopTotal, openWorkshop, lowStockParts] = await Promise.all([
      prisma.workshopEntry.count(),
      prisma.workshopEntry.count({ where: { exitDate: null } }).catch(() => 0),
      prisma.partItem.findMany({ where: { active: true }, select: { stockQuantity: true, minStockAlert: true } }),
    ]);
    const lowStock = lowStockParts.filter((p) => p.stockQuantity <= p.minStockAlert).length;
    return [
      kpi("Passages atelier", String(workshopTotal), "#38bdf8", "Historique SAV"),
      kpi("Véhicules en atelier", String(openWorkshop), "#fbbf24", "Sans sortie enregistrée"),
      kpi("Pièces sous seuil", String(lowStock), "#fb7185", "Stock magasin"),
    ];
  }

  if (role === "BORNES_OPS") {
    const [stations, requests, invoices] = await Promise.all([
      prisma.chargingStation.count({ where: { active: true } }),
      prisma.chargeInstallRequest.count(),
      prisma.chargingInvoice.aggregate({ _sum: { totalXof: true } }).catch(() => ({ _sum: { totalXof: 0 } })),
    ]);
    return [
      kpi("Bornes actives", String(stations), "#38bdf8", "Réseau de recharge"),
      kpi("Demandes d'installation", String(requests), "#fbbf24", "À traiter"),
      kpi("Facturé recharge", formatXof(invoices._sum?.totalXof ?? 0), "#34d399", "Cumul"),
    ];
  }

  if (role === "ADMIN") {
    const [users, customers, vehicles, imports] = await Promise.all([
      prisma.user.count({ where: { active: true } }),
      prisma.customer.count({ where: { active: true } }),
      prisma.vehicle.count({ where: { status: { in: ["EN_STOCK", "EN_MAGASIN"] } } }),
      prisma.importOrder.count({ where: { status: { not: "CLOTURE" } } }).catch(() => 0),
    ]);
    return [
      kpi("Comptes actifs", String(users), "#38bdf8", "Collaborateurs"),
      kpi("Clients actifs", String(customers), "#34d399", "Base clients"),
      kpi("Véhicules en stock", String(vehicles), "#a78bfa", "Parc showroom"),
      kpi("Imports en cours", String(imports), "#fbbf24", "Dossiers maritimes"),
    ];
  }

  if (role === "INSTALLATEUR") {
    const requests = await prisma.chargeInstallRequest.count().catch(() => 0);
    return [kpi("Demandes d'installation", String(requests), "#38bdf8", "À consulter")];
  }

  if (role === "GESTIONNAIRE_LOCATION") {
    const [fleet, available, activeRentals, customers] = await Promise.all([
      prisma.vehicle.count({ where: { fleetType: "RENTAL" } }),
      prisma.vehicle.count({ where: { fleetType: "RENTAL", rentalStatus: "DISPONIBLE" } }),
      prisma.rental.count({ where: { status: "ACTIF" } }),
      prisma.customer.count({ where: { active: true } }),
    ]);
    return [
      kpi("Parc de location", String(fleet), "#38bdf8", "Véhicules à louer"),
      kpi("Disponibles", String(available), "#34d399", "Prêts à louer"),
      kpi("Locations actives", String(activeRentals), "#fbbf24", "Contrats en cours"),
      kpi("Clients", String(customers), "#a78bfa", "Base clients location"),
    ];
  }

  const customers = await prisma.customer.count({ where: { active: true } });
  return [kpi("Clients actifs", String(customers), "#38bdf8", "Base clients")];
}

export async function RoleDashboard({ user }: { user: SessionUser }) {
  const role = user.role as Role;
  const [metrics, actions] = await Promise.all([
    buildMetrics(role),
    Promise.resolve(QUICK_ACTIONS[role] ?? DEFAULT_ACTIONS),
  ]);
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <AppShell user={user} titleKey="dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="ox-hero-card">
          <div>
            <div className="ox-hero-card-title">Bonjour {user.fullName}, bienvenue sur CARZONE Ops</div>
            <div className="ox-hero-card-sub">
              Votre espace : <strong style={{ color: "var(--gold)" }}>{roleLabel}</strong> · Zone Maro-Militaire,
              Gbèdomidji · Cotonou
            </div>
          </div>
          <div className="ox-quick-actions">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="ox-btn ox-btn-ghost ox-quick-btn">
                  <Icon size={16} color="var(--gold)" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="ox-kpi-grid">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="ox-kpi-card"
              style={{ borderLeft: `4px solid ${metric.accent}` }}
            >
              <div className="ox-kpi-label">{metric.label}</div>
              <div className="ox-kpi-value" style={{ color: metric.accent }}>
                {metric.value}
              </div>
              {metric.hint && <div className="ox-kpi-hint">{metric.hint}</div>}
            </div>
          ))}
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <CheckCircle2 size={18} color="#34d399" />
            <strong>Votre espace est limité à votre périmètre</strong>
          </div>
          <p style={{ margin: 0, opacity: 0.75, fontSize: "0.88rem" }}>
            Ce tableau de bord et les raccourcis affichés correspondent à votre rôle et à vos
            permissions. Les modules qui ne relèvent pas de votre fonction ne sont pas affichés.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
