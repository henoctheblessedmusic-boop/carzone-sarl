import type { Locale } from "@/lib/prefs";

/**
 * Copy for the /dashboard surface (server component).
 * Technical codes (COMMANDE, EN_TRANSIT, REGLEE...) stay as data: only the
 * interface labels built from them are translated here.
 */
export type DashboardPageCopy = {
  welcome: (name: string) => string;
  rolePrefix: string;
  hqLine: string;
  formatDate: (date: Date | string | null | undefined) => string;
  shortcuts: {
    adminVehiclesInOut: string;
    adminClientMessages: string;
    adminClientDirectory: string;
    adminFleet: string;
    devVehicleStock: string;
    devUsersRoles: string;
    devBillingFinance: string;
    devWorkshop: string;
    devMailbox: string;
    salesNewQuote: string;
    salesPaymentsInvoices: string;
    salesTerminal: string;
    salesMailbox: string;
  };
  kpi: {
    totalInvoiced: string;
    invoicedHint: (count: number) => string;
    totalCollected: string;
    collectedHint: string;
    outstanding: string;
    outstandingHint: (overdue: number) => string;
    quotesPipeline: string;
    confirmedRevenue: (amount: string) => string;
  };
  stock: {
    title: string;
    inventoryLabel: string;
    marketValueLabel: string;
    vehicleCount: (count: number) => string;
    viewInventory: string;
    stageOrders: string;
    stageProduction: string;
    stageTransit: string;
    stagePort: string;
    stageShowroom: string;
    vehicleUnit: (count: number) => string;
  };
  ops: {
    evInStock: string;
    atSea: (count: number) => string;
    clientsLeads: string;
    leadsHint: (count: number) => string;
    publicCharging: string;
    chargerSites: string;
    inProgress: string;
    workshop: string;
    openOrders: string;
  };
  payments: {
    title: string;
    viewAll: string;
    empty: string;
    receipt: string;
  };
  invoices: {
    title: string;
    manage: string;
    empty: string;
    invoiceWord: string;
    dueLabel: string;
    settled: string;
    balanceDue: (amount: string) => string;
  };
  invoiceStatus: (status: string) => string;
};

function dateFormatter(tag: string): (date: Date | string | null | undefined) => string {
  const formatter = new Intl.DateTimeFormat(tag, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (date) => {
    if (date === null || date === undefined || date === "") return "-";
    return formatter.format(typeof date === "string" ? new Date(date) : date);
  };
}

const invoiceStatusLabels: Record<Locale, Record<string, string>> = {
  fr: {
    EMISE: "Émise",
    BROUILLON: "Brouillon",
    PAYEE: "Payée",
    REGLEE: "Réglée",
    PAYEE_PARTIEL: "Payée en partie",
    EN_RETARD: "En retard",
    ANNULEE: "Annulée",
  },
  en: {
    EMISE: "Issued",
    BROUILLON: "Draft",
    PAYEE: "Paid",
    REGLEE: "Paid",
    PAYEE_PARTIEL: "Partly paid",
    EN_RETARD: "Overdue",
    ANNULEE: "Cancelled",
  },
  zh: {
    EMISE: "已开具",
    BROUILLON: "草稿",
    PAYEE: "已付",
    REGLEE: "已付",
    PAYEE_PARTIEL: "部分已付",
    EN_RETARD: "逾期",
    ANNULEE: "已取消",
  },
};

function buildInvoiceStatus(locale: Locale) {
  const labels = invoiceStatusLabels[locale];
  return (status: string) => labels[status] ?? status;
}

const fr: DashboardPageCopy = {
  welcome: (name) => `Bonjour ${name}, bienvenue sur CARZONE Ops`,
  rolePrefix: "Poste :",
  hqLine: "Siège & Showroom Zone Maro-Militaire, Gbèdomidji · Cotonou, Bénin",
  formatDate: dateFormatter("fr-BJ"),
  shortcuts: {
    adminVehiclesInOut: "Entrées & Sorties Véhicules",
    adminClientMessages: "Messages Clients",
    adminClientDirectory: "Répertoire Clients",
    adminFleet: "Parc & Flotte",
    devVehicleStock: "Stock Véhicules",
    devUsersRoles: "Utilisateurs & Rôles",
    devBillingFinance: "Facturation & Finance",
    devWorkshop: "Atelier SAV",
    devMailbox: "Boîte Mail",
    salesNewQuote: "Nouveau Devis Proforma",
    salesPaymentsInvoices: "Règlements & Factures",
    salesTerminal: "Borne Tactile",
    salesMailbox: "Boîte Mail",
  },
  kpi: {
    totalInvoiced: "Total Facturé TTC",
    invoicedHint: (count) => {
      if (count === 0) return "Aucune facture commerciale émise";
      if (count === 1) return "1 facture commerciale émise";
      return `${count} factures commerciales émises`;
    },
    totalCollected: "Total Encaissé",
    collectedHint: "Caisse Showroom & Banques (Ecobank / BOA / MoMo)",
    outstanding: "Reste à encaisser (créances)",
    outstandingHint: (overdue) => {
      if (overdue === 0) return "Créances courantes";
      if (overdue === 1) return "1 facture en retard";
      return `${overdue} factures en retard`;
    },
    quotesPipeline: "Devis proformas en attente",
    confirmedRevenue: (amount) => `+ ${amount} en commandes fermes`,
  },
  stock: {
    title: "Stock Général CARZONE · Pipeline Logistique & Showroom",
    inventoryLabel: "Inventaire total :",
    marketValueLabel: "Valeur marchande :",
    vehicleCount: (count) => `${count} véhicules`,
    viewInventory: "Voir tout le stock",
    stageOrders: "Commandes",
    stageProduction: "En Production",
    stageTransit: "En Transit",
    stagePort: "Au Port",
    stageShowroom: "En Stock au Showroom",
    vehicleUnit: (count) => (count > 1 ? "véhicules" : "véhicule"),
  },
  ops: {
    evInStock: "VE au showroom",
    atSea: (count) => `(${count} en mer)`,
    clientsLeads: "Clients actifs",
    leadsHint: (count) => `(${count} prospects)`,
    publicCharging: "Recharges publiques",
    chargerSites: "Chantiers bornes en cours",
    inProgress: "en cours",
    workshop: "Atelier SAV & Entretien",
    openOrders: "ordres ouverts",
  },
  payments: {
    title: "Derniers règlements reçus",
    viewAll: "Voir tous",
    empty: "Pas encore de règlement encaissé.",
    receipt: "Quittance",
  },
  invoices: {
    title: "Dernières factures émises",
    manage: "Gérer",
    empty: "Aucune facture pour le moment.",
    invoiceWord: "Facture",
    dueLabel: "Échéance",
    settled: "Soldée",
    balanceDue: (amount) => `Solde: ${amount}`,
  },
  invoiceStatus: buildInvoiceStatus("fr"),
};

const en: DashboardPageCopy = {
  welcome: (name) => `Hi ${name}, welcome to CARZONE Ops`,
  rolePrefix: "Role:",
  hqLine: "Head office & showroom, Zone Maro-Militaire, Gbèdomidji · Cotonou, Benin",
  formatDate: dateFormatter("en-GB"),
  shortcuts: {
    adminVehiclesInOut: "Vehicle In & Out",
    adminClientMessages: "Customer Messages",
    adminClientDirectory: "Customer Directory",
    adminFleet: "Fleet & Pool",
    devVehicleStock: "Vehicle Stock",
    devUsersRoles: "Users & Roles",
    devBillingFinance: "Billing & Finance",
    devWorkshop: "Service Workshop",
    devMailbox: "Mailbox",
    salesNewQuote: "New Proforma Quote",
    salesPaymentsInvoices: "Payments & Invoices",
    salesTerminal: "Touch Kiosk",
    salesMailbox: "Mailbox",
  },
  kpi: {
    totalInvoiced: "Total Invoiced (tax included)",
    invoicedHint: (count) => {
      if (count === 0) return "No commercial invoice issued yet";
      if (count === 1) return "1 commercial invoice issued";
      return `${count} commercial invoices issued`;
    },
    totalCollected: "Total Collected",
    collectedHint: "Showroom cash desk & banks (Ecobank / BOA / MoMo)",
    outstanding: "Outstanding Balance (Receivables)",
    outstandingHint: (overdue) => {
      if (overdue === 0) return "Receivables up to date";
      if (overdue === 1) return "1 invoice overdue";
      return `${overdue} invoices overdue`;
    },
    quotesPipeline: "Proforma quotes pending",
    confirmedRevenue: (amount) => `+ ${amount} in firm orders`,
  },
  stock: {
    title: "CARZONE General Stock · Logistics Pipeline & Showroom",
    inventoryLabel: "Total inventory:",
    marketValueLabel: "Market value:",
    vehicleCount: (count) => (count === 1 ? "1 vehicle" : `${count} vehicles`),
    viewInventory: "Open the Stock Inventory",
    stageOrders: "Orders",
    stageProduction: "In Production",
    stageTransit: "In Transit",
    stagePort: "At Port",
    stageShowroom: "In Showroom Stock",
    vehicleUnit: (count) => (count === 1 ? "vehicle" : "vehicles"),
  },
  ops: {
    evInStock: "EVs in Showroom Stock",
    atSea: (count) => `(${count} at sea)`,
    clientsLeads: "Active customers",
    leadsHint: (count) => `(${count} prospects)`,
    publicCharging: "Public Charging Sessions",
    chargerSites: "Open Charger Projects",
    inProgress: "in progress",
    workshop: "Service Workshop & Maintenance",
    openOrders: "open orders",
  },
  payments: {
    title: "Latest Payments Received",
    viewAll: "See all",
    empty: "No payment recorded yet.",
    receipt: "Receipt",
  },
  invoices: {
    title: "Latest invoices issued",
    manage: "Manage",
    empty: "No invoice yet.",
    invoiceWord: "Invoice",
    dueLabel: "Due",
    settled: "Settled",
    balanceDue: (amount) => `Balance: ${amount}`,
  },
  invoiceStatus: buildInvoiceStatus("en"),
};

const zh: DashboardPageCopy = {
  welcome: (name) => `${name},欢迎回到 CARZONE Ops`,
  rolePrefix: "职位:",
  hqLine: "总部与展厅:Maro-Militaire 区,Gbèdomidji,贝宁科托努",
  formatDate: dateFormatter("zh-CN"),
  shortcuts: {
    adminVehiclesInOut: "车辆进出登记",
    adminClientMessages: "客户消息",
    adminClientDirectory: "客户名录",
    adminFleet: "车队与车辆",
    devVehicleStock: "车辆库存",
    devUsersRoles: "用户与角色",
    devBillingFinance: "开票与财务",
    devWorkshop: "售后车间",
    devMailbox: "信箱",
    salesNewQuote: "新建形式发票报价",
    salesPaymentsInvoices: "收款与发票",
    salesTerminal: "触屏终端",
    salesMailbox: "信箱",
  },
  kpi: {
    totalInvoiced: "开票总额(含税)",
    invoicedHint: (count) => {
      if (count === 0) return "还没有开具商业发票";
      return `${count} 张商业发票已开具`;
    },
    totalCollected: "已收款总额",
    collectedHint: "展厅收银与银行账户(Ecobank / BOA / MoMo)",
    outstanding: "未收余额(应收)",
    outstandingHint: (overdue) => {
      if (overdue === 0) return "账款都在正常期内";
      return `${overdue} 张发票已逾期`;
    },
    quotesPipeline: "待确认的形式发票",
    confirmedRevenue: (amount) => `另有 ${amount} 已确认订单`,
  },
  stock: {
    title: "CARZONE 总库存 · 物流管道与展厅",
    inventoryLabel: "库存总量:",
    marketValueLabel: "市值:",
    vehicleCount: (count) => `${count} 辆车`,
    viewInventory: "打开库存清单",
    stageOrders: "已下单",
    stageProduction: "生产中",
    stageTransit: "海运中",
    stagePort: "在港",
    stageShowroom: "展厅现车",
    vehicleUnit: () => "辆",
  },
  ops: {
    evInStock: "展厅新能源现车",
    atSea: (count) => `(海运中 ${count} 辆)`,
    clientsLeads: "活跃客户",
    leadsHint: (count) => `(潜在客户 ${count} 位)`,
    publicCharging: "公共充电次数",
    chargerSites: "在建充电桩项目",
    inProgress: "进行中",
    workshop: "售后车间与保养",
    openOrders: "未结工单",
  },
  payments: {
    title: "最近收款记录",
    viewAll: "查看全部",
    empty: "暂时还没有收款记录。",
    receipt: "收据",
  },
  invoices: {
    title: "最近开具的发票",
    manage: "管理",
    empty: "暂时还没有发票。",
    invoiceWord: "发票",
    dueLabel: "到期日",
    settled: "已结清",
    balanceDue: (amount) => `余额:${amount}`,
  },
  invoiceStatus: buildInvoiceStatus("zh"),
};

export const dashboardPageCopy: Record<Locale, DashboardPageCopy> = { fr, en, zh };
