import type { Locale } from "@/lib/prefs";
import type { PeriodKey } from "@/lib/dashboard-analytics";

/**
 * Dictionnaire des composants PARTAGÉS (bouton d'impression, panneau de politique
 * bon de commande) et des GRAPHES EXÉCUTIFS du dashboard.
 *
 * Règles de rédaction :
 * - FR = langue source, ton PME locale, aucun tiret cadratin.
 * - EN = anglais international, contractions naturelles.
 * - ZH = chinois simplifié, phrases courtes, marques en latin.
 * - Fidélité : montants FCFA, pourcentages, noms de sociétés et de lieux ne sont
 *   jamais réécrits. Les mois passent par Intl selon la locale active.
 * - Aucune clé technique n'est traduite : seul le texte affiché l'est.
 */

/** Onglets de graphes du tableau de bord exécutif. */
export type ExecChartMode = "profit" | "sales" | "expenses" | "activity" | "all";

/** Puce du panneau de politique : intitulé en gras puis explication. */
export type PolicyBullet = {
  lead: string;
  text: string;
};

export type SharedCopy = {
  print: {
    /** Libellé du bouton. */
    label: string;
    /** Info-bulle du bouton. */
    title: string;
  };
  policy: {
    ariaLabel: string;
    title: string;
    /** Phrase d'introduction découpée pour garder les mots en gras. */
    intro: {
      before: string;
      order: string;
      between: string;
      proforma: string;
      after: string;
      cannot: string;
      end: string;
    };
    bullets: PolicyBullet[];
  };
  exec: {
    header: {
      title: string;
      subtitle: string;
    };
    period: {
      label: string;
      options: Record<PeriodKey, string>;
    };
    tabs: Record<ExecChartMode, { label: string; desc: string }>;
    summary: {
      salesLabel: string;
      /** Début de la ligne « encaissé », le montant suit. */
      collectedInline: string;
      expensesLabel: string;
      expensesHint: string;
      salariesLabel: string;
      salariesHint: string;
      netLabel: string;
      marginInline: string;
      costsInline: string;
    };
    charts: {
      profit: {
        title: string;
        desc: string;
        legendProfit: string;
        legendLoss: string;
        zeroAxis: string;
      };
      sales: {
        title: string;
        desc: string;
        legendInvoiced: string;
        legendCollected: string;
      };
      expenses: {
        title: string;
        desc: string;
        legendTotal: string;
      };
      activity: {
        title: string;
        desc: string;
        legendScore: string;
        /** Suffixe de l'axe Y (score d'activité). */
        axisSuffix: string;
      };
    };
    hover: {
      heading: string;
      invoiced: string;
      collected: string;
      expenses: string;
      salaries: string;
      net: string;
    };
    /** Noms de mois localisés, construits avec Intl. */
    months: {
      long: (year: number, monthIndex: number) => string;
      short: (year: number, monthIndex: number) => string;
    };
  };
};

/** Construit les formats de mois d'une locale (libellé long et libellé d'axe). */
function monthLabels(tag: string) {
  const long = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric" });
  const short = new Intl.DateTimeFormat(tag, { month: "short", year: "2-digit" });
  const upperFirst = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  return {
    long: (year: number, monthIndex: number) => upperFirst(long.format(new Date(year, monthIndex, 1))),
    short: (year: number, monthIndex: number) => short.format(new Date(year, monthIndex, 1)),
  };
}

const fr: SharedCopy = {
  print: {
    label: "Imprimer",
    title: "Ouvrir la fenêtre d'impression",
  },
  policy: {
    ariaLabel: "Politique bon de commande",
    title: "Bon de commande et proforma acceptée : la règle",
    intro: {
      before: "Dès qu'un ",
      order: "bon de commande",
      between: " ou une ",
      proforma: "proforma acceptée ou confirmée",
      after: " entre dans CARZONE, le client ",
      cannot: "ne peut pas l'annuler de lui-même",
      end: ".",
    },
    bullets: [
      {
        lead: "Pourquoi :",
        text: "le stock est réservé, l'import est lancé, et les engagements fournisseur comme les flux bancaires sont déjà pris.",
      },
      {
        lead: "Avant confirmation :",
        text: "le client garde un temps de réflexion. Une demande d'avenant reste possible tant que le document n'est pas envoyé ni confirmé.",
      },
      {
        lead: "Après confirmation :",
        text: "seule une note de crédit commerciale ou un avenant visé par la DG et la Comptabilité peut débloquer le dossier. Jamais une suppression silencieuse.",
      },
      {
        lead: "Délai conseillé :",
        text: "rétractation possible avant l'envoi ou la confirmation, pas après. Une fois le document parti, l'engagement est ferme.",
      },
    ],
  },
  exec: {
    header: {
      title: "Tableau de bord financier et performance",
      subtitle: "Rentabilité, trésorerie et activité de CARZONE SARL, mois après mois.",
    },
    period: {
      label: "Période :",
      options: {
        "1M": "1 mois",
        "6M": "6 mois",
        "1Y": "1 an",
        "2Y": "2 ans",
        "3Y": "3 ans",
      },
    },
    tabs: {
      profit: { label: "💎 1. Bénéfice général réel", desc: "Une fois dépenses et salaires payés" },
      sales: { label: "💰 2. Évolution des ventes", desc: "Facturé face à encaissé" },
      expenses: { label: "💸 3. Dépenses de l'entreprise", desc: "Charges et fournisseurs" },
      activity: { label: "⚡ 4. Activités et opérations", desc: "Stocks, devis, atelier" },
      all: { label: "📊 Vue consolidée (4 graphes)", desc: "Vue d'ensemble pour la DG" },
    },
    summary: {
      salesLabel: "Ventes de la période",
      collectedInline: "Encaissé réel :",
      expensesLabel: "Dépenses d'exploitation",
      expensesHint: "Charges et fournisseurs déjà enregistrés en base",
      salariesLabel: "Masse salariale",
      salariesHint: "Salaires et rémunérations effectivement payés",
      netLabel: "Bénéfice net réel",
      marginInline: "Marge nette :",
      costsInline: "Coûts totaux :",
    },
    charts: {
      profit: {
        title: "Évolution du bénéfice général réel",
        desc: "Bénéfice net du mois, une fois toutes les dépenses et tous les salaires déduits.",
        legendProfit: "Bénéfice",
        legendLoss: "Perte / charges",
        zeroAxis: "0 FCFA",
      },
      sales: {
        title: "Évolution des ventes et du chiffre d'affaires",
        desc: "Les factures commerciales émises d'un côté, les paiements réellement encaissés de l'autre.",
        legendInvoiced: "Facturé",
        legendCollected: "Encaissé réel",
      },
      expenses: {
        title: "Évolution des dépenses d'exploitation",
        desc: "Charges directes, loyers, électricité SBEE, prestataires et frais de fonctionnement.",
        legendTotal: "Dépenses totales",
      },
      activity: {
        title: "Performance et activités opérationnelles",
        desc: "Score composite des opérations réelles : entrées en stock, devis émis, passages atelier, nouveaux clients.",
        legendScore: "Score opérations",
        axisSuffix: " ops",
      },
    },
    hover: {
      heading: "Détail en base pour le mois de :",
      invoiced: "Facturé",
      collected: "Encaissé",
      expenses: "Dépenses",
      salaries: "Salaires",
      net: "Bénéfice net",
    },
    months: monthLabels("fr-FR"),
  },
};

const en: SharedCopy = {
  print: {
    label: "Print",
    title: "Open the print window",
  },
  policy: {
    ariaLabel: "Purchase order policy",
    title: "Purchase order and approved proforma: the rule",
    intro: {
      before: "Once a ",
      order: "purchase order",
      between: " or an approved ",
      proforma: "proforma invoice",
      after: " is logged in CARZONE, the customer ",
      cannot: "can't cancel it on their own",
      end: ".",
    },
    bullets: [
      {
        lead: "Why:",
        text: "stock gets reserved, the import is already running, and supplier commitments plus bank flows are already in motion.",
      },
      {
        lead: "Before confirmation:",
        text: "the customer still has time to think it over. They can ask for an amendment as long as the document hasn't been sent or confirmed.",
      },
      {
        lead: "After confirmation:",
        text: "only a commercial credit note or an amendment signed off by the GM and Accounting can settle the file. Never a silent deletion.",
      },
      {
        lead: "Suggested window:",
        text: "cooling-off applies before sending or confirming, not after. Once the document has gone out, the deal is firm.",
      },
    ],
  },
  exec: {
    header: {
      title: "Financial dashboard and performance",
      subtitle: "Profitability, cash flow and day-to-day activity at CARZONE SARL, month by month.",
    },
    period: {
      label: "Period:",
      options: {
        "1M": "1 month",
        "6M": "6 months",
        "1Y": "1 year",
        "2Y": "2 years",
        "3Y": "3 years",
      },
    },
    tabs: {
      profit: { label: "💎 1. Real overall profit", desc: "After expenses and payroll" },
      sales: { label: "💰 2. Sales trend", desc: "Invoiced vs collected" },
      expenses: { label: "💸 3. Company spending", desc: "Costs and suppliers" },
      activity: { label: "⚡ 4. Activity and operations", desc: "Stock, quotes, workshop" },
      all: { label: "📊 Combined view (4 charts)", desc: "The big picture for the GM" },
    },
    summary: {
      salesLabel: "Sales for the period",
      collectedInline: "Collected:",
      expensesLabel: "Operating expenses",
      expensesHint: "Costs and suppliers already logged in the database",
      salariesLabel: "Payroll",
      salariesHint: "Salaries and pay actually disbursed",
      netLabel: "Real net profit",
      marginInline: "Net margin:",
      costsInline: "Total costs:",
    },
    charts: {
      profit: {
        title: "Real overall profit over time",
        desc: "Monthly net profit once every expense and every salary is deducted.",
        legendProfit: "Profit",
        legendLoss: "Loss / costs",
        zeroAxis: "0 FCFA",
      },
      sales: {
        title: "Sales and revenue over time",
        desc: "Commercial invoices issued on one side, payments actually collected on the other.",
        legendInvoiced: "Invoiced",
        legendCollected: "Collected",
      },
      expenses: {
        title: "Operating expenses over time",
        desc: "Direct costs, rent, SBEE electricity, contractors and running costs.",
        legendTotal: "Total expenses",
      },
      activity: {
        title: "Operational performance and activity",
        desc: "A composite score of real operations: stock intake, quotes issued, workshop visits, new customers.",
        legendScore: "Operations score",
        axisSuffix: " ops",
      },
    },
    hover: {
      heading: "Database detail for:",
      invoiced: "Invoiced",
      collected: "Collected",
      expenses: "Expenses",
      salaries: "Payroll",
      net: "Net profit",
    },
    months: monthLabels("en-GB"),
  },
};

const zh: SharedCopy = {
  print: {
    label: "打印",
    title: "打开打印窗口",
  },
  policy: {
    ariaLabel: "采购订单规则",
    title: "采购订单与已确认形式发票:我们的规则",
    intro: {
      before: "在 CARZONE 录入",
      order: "采购订单",
      between: "或经确认的",
      proforma: "形式发票",
      after: "之后,客户",
      cannot: "不能单方面取消",
      end: "。",
    },
    bullets: [
      {
        lead: "为什么要这样做:",
        text: "库存已经预留,进口已经启动,供应商承诺和银行款项也已安排。",
      },
      {
        lead: "确认之前:",
        text: "还有考虑时间。文件尚未发送或确认前,客户可以申请变更。",
      },
      {
        lead: "确认之后:",
        text: "只能通过销售红字发票,或经总经理与财务审批的变更来处理,不会静默删除。",
      },
      {
        lead: "建议时限:",
        text: "仅在发送或确认前可以撤回,之后不再适用。文件一旦发出,即为正式承诺。",
      },
    ],
  },
  exec: {
    header: {
      title: "财务与经营看板",
      subtitle: "CARZONE SARL 各月盈利、现金流与业务情况。",
    },
    period: {
      label: "周期:",
      options: {
        "1M": "1 个月",
        "6M": "6 个月",
        "1Y": "1 年",
        "2Y": "2 年",
        "3Y": "3 年",
      },
    },
    tabs: {
      profit: { label: "💎 1. 实际总利润", desc: "已扣除费用与工资" },
      sales: { label: "💰 2. 销售走势", desc: "开票与实收对比" },
      expenses: { label: "💸 3. 公司支出", desc: "费用与供应商" },
      activity: { label: "⚡ 4. 业务与运营", desc: "库存、报价、售后" },
      all: { label: "📊 汇总视图(4 张图)", desc: "总经理全景" },
    },
    summary: {
      salesLabel: "本周期销售",
      collectedInline: "实际收款:",
      expensesLabel: "经营费用",
      expensesHint: "已录入数据库的费用与供应商支出",
      salariesLabel: "工资总额",
      salariesHint: "实际发放的工资与薪酬",
      netLabel: "实际净利润",
      marginInline: "净利率:",
      costsInline: "总成本:",
    },
    charts: {
      profit: {
        title: "实际总利润走势",
        desc: "每月扣除全部费用与工资后的净利润。",
        legendProfit: "利润",
        legendLoss: "亏损 / 费用",
        zeroAxis: "0 FCFA",
      },
      sales: {
        title: "销售与营业收入走势",
        desc: "一边是开具的商业发票,一边是实际到账的款项。",
        legendInvoiced: "开票",
        legendCollected: "实收",
      },
      expenses: {
        title: "经营费用走势",
        desc: "直接费用、租金、SBEE 电费、外包与日常开支。",
        legendTotal: "费用合计",
      },
      activity: {
        title: "运营与业务表现",
        desc: "真实业务的综合评分:车辆入库、报价、售后进场、新客户。",
        legendScore: "业务评分",
        axisSuffix: " 项",
      },
    },
    hover: {
      heading: "当月明细:",
      invoiced: "开票",
      collected: "实收",
      expenses: "费用",
      salaries: "工资",
      net: "净利润",
    },
    months: monthLabels("zh-CN"),
  },
};

export const sharedCopy: Record<Locale, SharedCopy> = { fr, en, zh };
