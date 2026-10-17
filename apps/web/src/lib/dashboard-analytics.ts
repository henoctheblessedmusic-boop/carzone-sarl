export type MonthlyAnalyticsPoint = {
  key: string; // "2026-10"
  label: string; // "Octobre 2026"
  shortLabel: string; // "Oct 26"
  year: number;
  monthIndex: number; // 0 à 11

  // 1. VENTES (Invoiced vs Collected)
  salesInvoicedXof: number; // Facturation totale du mois
  salesCollectedXof: number; // Encaissements réels reçus
  invoicesCount: number; // Nombre de factures émises

  // 2. DÉPENSES D'EXPLOITATION
  expensesTotalXof: number; // Total des dépenses
  expensesPaidXof: number; // Dépenses déjà payées
  expensesPendingXof: number; // Dépenses en attente
  expensesCount: number; // Nombre de dépenses enregistrées
  expensesByCategory: Record<string, number>; // Détail par catégorie

  // 3. SALAIRES & CHARGES RH
  salariesTotalXof: number; // Masse salariale payée
  salariesCount: number; // Nombre de fiches de paie

  // 4. BÉNÉFICE GÉNÉRAL RÉEL
  // Bénéfice = Ventes Encaissées - (Dépenses d'exploitation + Masse salariale)
  totalCostXof: number; // Total dépenses + salaires
  netProfitXof: number; // Résultat net réel (peut être positif ou négatif)
  netMarginPct: number; // Marge nette en %

  // 5. ACTIVITÉS OPÉRATIONNELLES
  vehiclesAdded: number; // Entrées de véhicules en stock / commandes
  quotesCount: number; // Devis et proformas émis
  workshopCount: number; // Entrées atelier SAV
  newCustomersCount: number; // Nouveaux clients enregistrés
  totalActivityScore: number; // Volume cumulé d'activités
};

export type PeriodKey = "1M" | "6M" | "1Y" | "2Y" | "3Y";

export type PeriodSummary = {
  totalSalesInvoiced: number;
  totalSalesCollected: number;
  totalExpenses: number;
  totalSalaries: number;
  totalCosts: number;
  netProfit: number;
  netMarginPct: number;
  totalActivities: number;
  profitableMonthsCount: number;
  lossMonthsCount: number;
  collectionRatePct: number;
};

export type AnalyticsDataset = {
  periods: Record<PeriodKey, {
    points: MonthlyAnalyticsPoint[];
    summary: PeriodSummary;
  }>;
};

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const MONTH_SHORT_FR = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sept", "Oct", "Nov", "Déc"
];

/**
 * Construit les agrégations mensuelles réelles à partir des données brutes de la base de données.
 * Zéro donnée fictive : chaque chiffre provient strictement d'une facture, d'un paiement,
 * d'une dépense, d'un salaire ou d'un véhicule enregistré en BDD.
 */
export function buildRealDashboardAnalytics({
  invoices,
  payments,
  expenses,
  salaryPayments,
  quotes,
  vehicles,
  workshopEntries,
  customers,
  referenceDate = new Date(),
}: {
  invoices: Array<{ totalXof: number; paidXof: number; status: string; createdAt: Date | string }>;
  payments: Array<{ amountXof: number; paidAt: Date | string }>;
  expenses: Array<{ amountTtcXof: number; category: string; status: string; serviceDate?: Date | string | null; createdAt: Date | string }>;
  salaryPayments: Array<{ amountXof: number; month: number; year: number; status: string; paymentDate: Date | string }>;
  quotes: Array<{ totalXof: number; status: string; createdAt: Date | string }>;
  vehicles: Array<{ priceXof: number; status: string; createdAt: Date | string }>;
  workshopEntries: Array<{ statusCode?: string | null; createdAt: Date | string }>;
  customers: Array<{ createdAt: Date | string }>;
  referenceDate?: Date;
}): AnalyticsDataset {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();

  // Génère un dictionnaire pour les 36 derniers mois
  const maxMonths = 36;
  const allMonthsMap = new Map<string, MonthlyAnalyticsPoint>();

  for (let i = maxMonths - 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;

    allMonthsMap.set(key, {
      key,
      label: `${MONTH_NAMES_FR[m]} ${y}`,
      shortLabel: `${MONTH_SHORT_FR[m]} ${String(y).slice(-2)}`,
      year: y,
      monthIndex: m,
      salesInvoicedXof: 0,
      salesCollectedXof: 0,
      invoicesCount: 0,
      expensesTotalXof: 0,
      expensesPaidXof: 0,
      expensesPendingXof: 0,
      expensesCount: 0,
      expensesByCategory: {},
      salariesTotalXof: 0,
      salariesCount: 0,
      totalCostXof: 0,
      netProfitXof: 0,
      netMarginPct: 0,
      vehiclesAdded: 0,
      quotesCount: 0,
      workshopCount: 0,
      newCustomersCount: 0,
      totalActivityScore: 0,
    });
  }

  // 1. Ventiler les factures (Ventes facturées)
  for (const inv of invoices) {
    if (inv.status === "ANNULEE") continue;
    const d = new Date(inv.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = allMonthsMap.get(key);
    if (point) {
      point.salesInvoicedXof += inv.totalXof || 0;
      point.invoicesCount += 1;
    }
  }

  // 2. Ventiler les paiements reçus (Ventes réellement encaissées)
  for (const pay of payments) {
    const d = new Date(pay.paidAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = allMonthsMap.get(key);
    if (point) {
      point.salesCollectedXof += pay.amountXof || 0;
    }
  }

  // Si pas de table payment pour une facture mais que paidXof > 0 est renseigné sur l'invoice
  if (payments.length === 0) {
    for (const inv of invoices) {
      if (inv.status === "ANNULEE") continue;
      const d = new Date(inv.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const point = allMonthsMap.get(key);
      if (point) {
        point.salesCollectedXof += inv.paidXof || 0;
      }
    }
  }

  // 3. Ventiler les dépenses
  for (const exp of expenses) {
    if (exp.status === "ANNULE") continue;
    const d = new Date(exp.serviceDate || exp.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = allMonthsMap.get(key);
    if (point) {
      const amount = exp.amountTtcXof || 0;
      point.expensesTotalXof += amount;
      point.expensesCount += 1;
      if (exp.status === "PAYE") {
        point.expensesPaidXof += amount;
      } else {
        point.expensesPendingXof += amount;
      }
      const cat = exp.category || "AUTRE";
      point.expensesByCategory[cat] = (point.expensesByCategory[cat] || 0) + amount;
    }
  }

  // 4. Ventiler les salaires
  for (const sal of salaryPayments) {
    const key = `${sal.year}-${String(sal.month).padStart(2, "0")}`;
    const point = allMonthsMap.get(key);
    if (point) {
      const amount = sal.amountXof || 0;
      point.salariesTotalXof += amount;
      point.salariesCount += 1;
    }
  }

  // 5. Ventiler les devis
  for (const q of quotes) {
    const d = new Date(q.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = allMonthsMap.get(key);
    if (point) {
      point.quotesCount += 1;
    }
  }

  // 6. Ventiler les véhicules entrés
  for (const v of vehicles) {
    const d = new Date(v.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = allMonthsMap.get(key);
    if (point) {
      point.vehiclesAdded += 1;
    }
  }

  // 7. Ventiler les passages atelier
  for (const w of workshopEntries) {
    const d = new Date(w.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = allMonthsMap.get(key);
    if (point) {
      point.workshopCount += 1;
    }
  }

  // 8. Ventiler les nouveaux clients
  for (const c of customers) {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = allMonthsMap.get(key);
    if (point) {
      point.newCustomersCount += 1;
    }
  }

  // 9. Calculer pour chaque mois le bénéfice réel et le score d'activité
  allMonthsMap.forEach((point) => {
    point.totalCostXof = point.expensesTotalXof + point.salariesTotalXof;
    // Bénéfice basé sur l'activité encaissée (ou facturée si 0 encaissements)
    const effectiveRevenue = point.salesCollectedXof > 0 ? point.salesCollectedXof : point.salesInvoicedXof;
    point.netProfitXof = effectiveRevenue - point.totalCostXof;
    point.netMarginPct =
      effectiveRevenue > 0
        ? Math.round((point.netProfitXof / effectiveRevenue) * 100)
        : point.totalCostXof > 0
        ? -100
        : 0;

    point.totalActivityScore =
      point.vehiclesAdded * 2 +
      point.invoicesCount * 2 +
      point.quotesCount +
      point.workshopCount +
      point.newCustomersCount;
  });

  const fullSeries = Array.from(allMonthsMap.values());

  // Génère les sous-séries pour chaque période demandée par l'utilisateur
  const periodsConfig: Record<PeriodKey, number> = {
    "1M": 1,
    "6M": 6,
    "1Y": 12,
    "2Y": 24,
    "3Y": 36,
  };

  const computeSummary = (pts: MonthlyAnalyticsPoint[]): PeriodSummary => {
    const totalSalesInvoiced = pts.reduce((s, p) => s + p.salesInvoicedXof, 0);
    const totalSalesCollected = pts.reduce((s, p) => s + p.salesCollectedXof, 0);
    const totalExpenses = pts.reduce((s, p) => s + p.expensesTotalXof, 0);
    const totalSalaries = pts.reduce((s, p) => s + p.salariesTotalXof, 0);
    const totalCosts = totalExpenses + totalSalaries;
    const effectiveRevenue = totalSalesCollected > 0 ? totalSalesCollected : totalSalesInvoiced;
    const netProfit = effectiveRevenue - totalCosts;
    const netMarginPct = effectiveRevenue > 0 ? Math.round((netProfit / effectiveRevenue) * 100) : 0;
    const totalActivities = pts.reduce((s, p) => s + p.totalActivityScore, 0);
    const profitableMonthsCount = pts.filter((p) => p.netProfitXof > 0).length;
    const lossMonthsCount = pts.filter((p) => p.netProfitXof < 0).length;
    const collectionRatePct =
      totalSalesInvoiced > 0 ? Math.round((totalSalesCollected / totalSalesInvoiced) * 100) : 100;

    return {
      totalSalesInvoiced,
      totalSalesCollected,
      totalExpenses,
      totalSalaries,
      totalCosts,
      netProfit,
      netMarginPct,
      totalActivities,
      profitableMonthsCount,
      lossMonthsCount,
      collectionRatePct,
    };
  };

  const periods: AnalyticsDataset["periods"] = {
    "1M": {
      points: fullSeries.slice(-1),
      summary: computeSummary(fullSeries.slice(-1)),
    },
    "6M": {
      points: fullSeries.slice(-6),
      summary: computeSummary(fullSeries.slice(-6)),
    },
    "1Y": {
      points: fullSeries.slice(-12),
      summary: computeSummary(fullSeries.slice(-12)),
    },
    "2Y": {
      points: fullSeries.slice(-24),
      summary: computeSummary(fullSeries.slice(-24)),
    },
    "3Y": {
      points: fullSeries.slice(-36),
      summary: computeSummary(fullSeries.slice(-36)),
    },
  };

  return { periods };
}
