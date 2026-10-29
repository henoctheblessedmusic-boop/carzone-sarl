import type { Locale } from "@/lib/prefs";

/** Onglets de la pipeline logistique (5 étapes officielles CARZONE). */
export type StockStageKey =
  | "COMMANDE"
  | "EN_PRODUCTION"
  | "EN_TRANSIT"
  | "AU_PORT"
  | "EN_MAGASIN";

/** Codes de statut rencontrés en base, y compris les statuts hors pipeline. */
export type StockStatusKey = StockStageKey | "EN_STOCK" | "RESERVE" | "VENDU";

export type StockEnergyKey = "ELECTRIQUE" | "HYBRIDE" | "PHEV" | "ESSENCE" | "DIESEL";

export type StockVehicleTypeKey = "SUV" | "PICKUP" | "BERLINE" | "VAN";

export type StockStageCopy = {
  /** Libellé court affiché sur les cartes KPI et les colonnes du pipeline. */
  label: string;
  /** Libellé compact (usage interne, résumés). */
  short: string;
  /** Phrase de contexte affichée sous l'étape. */
  desc: string;
};

export type StockCopy = {
  /** Format de date local utilisé pour les ETA (fr-FR, en-GB, zh-CN). */
  dateLocale: string;
  pipeline: {
    title: string;
    subtitle: string;
    entryTitle: string;
    entryButton: string;
    viewPipeline: string;
    viewTable: (count: number) => string;
    unitShort: string;
  };
  stages: Record<StockStageKey, StockStageCopy>;
  /** Libellés courts de statut (badges, tableaux). */
  status: Record<StockStatusKey, string>;
  /** Libellés détaillés des listes déroulantes de statut. */
  statusOption: Record<StockStatusKey, string>;
  energy: Record<StockEnergyKey, string>;
  energyOption: Record<StockEnergyKey, string>;
  vehicleType: Record<StockVehicleTypeKey, string>;
  filters: {
    searchPlaceholder: string;
    allShowrooms: string;
    allEnergies: string;
    allTypes: string;
    submit: string;
  };
  createModal: {
    title: string;
    subtitle: string;
    close: string;
    section1: string;
    variantPlaceholder: string;
    variantTitle: string;
    yearPlaceholder: string;
    energyTitle: string;
    section2: string;
    statusTitle: string;
    siteTitle: string;
    supplierTitle: string;
    supplierOptional: string;
    section3: string;
    portPlaceholder: string;
    etaTitle: string;
    containerPlaceholder: string;
    vinPlaceholder: string;
    vinTitle: string;
    section4: string;
    pricePlaceholder: string;
    priceTitle: string;
    cancel: string;
    submit: string;
  };
  card: {
    emptyStage: string;
    vin: string;
    port: string;
    eta: string;
    container: string;
    editTitle: string;
    sheetConfirmedTitle: string;
    sheetPendingTitle: string;
    nextTitle: (status: string) => string;
    nextButton: string;
  };
  table: {
    colVin: string;
    colVehicle: string;
    colRange: string;
    colEnergy: string;
    colSupplier: string;
    colShowroom: string;
    colPrice: string;
    colStatus: string;
    colAction: string;
    sheetConfirmed: string;
    sheetPending: string;
    sheetConfirmedTitle: string;
    sheetPendingTitle: string;
    edit: string;
    editTitle: string;
    delete: string;
    deleteTitle: string;
  };
  editModal: {
    title: string;
    priceLabel: string;
    statusLabel: string;
    originPortLabel: string;
    originPortPlaceholder: string;
    etaLabel: string;
    containerLabel: string;
    containerPlaceholder: string;
    orderRefLabel: string;
    orderRefPlaceholder: string;
    vinLabel: string;
    variantLabel: string;
    yearLabel: string;
    energyLabel: string;
    rangeLabel: string;
    siteLabel: string;
    supplierLabel: string;
    supplierNone: string;
    deleteTitle: string;
    deleteButton: string;
    cancel: string;
    save: string;
  };
  deleteModal: {
    title: string;
    warning: string;
    vehicleLabel: string;
    vinLabel: string;
    siteLabel: string;
    siteUnassigned: string;
    priceLabel: string;
    cancel: string;
    deleting: string;
    confirm: string;
  };
  errors: {
    deleteFailed: string;
  };
};

export const STOCK_STATUS_KEYS: StockStatusKey[] = [
  "COMMANDE",
  "EN_PRODUCTION",
  "EN_TRANSIT",
  "AU_PORT",
  "EN_MAGASIN",
  "EN_STOCK",
  "RESERVE",
  "VENDU",
];

export const STOCK_ENERGY_KEYS: StockEnergyKey[] = [
  "ELECTRIQUE",
  "HYBRIDE",
  "PHEV",
  "ESSENCE",
  "DIESEL",
];

export const STOCK_VEHICLE_TYPE_KEYS: StockVehicleTypeKey[] = [
  "SUV",
  "PICKUP",
  "BERLINE",
  "VAN",
];

export function isStockStatus(value: string): value is StockStatusKey {
  return STOCK_STATUS_KEYS.some((key) => key === value);
}

export function isStockEnergy(value: string): value is StockEnergyKey {
  return STOCK_ENERGY_KEYS.some((key) => key === value);
}

export function isStockVehicleType(value: string): value is StockVehicleTypeKey {
  return STOCK_VEHICLE_TYPE_KEYS.some((key) => key === value);
}

/** Libellé de statut traduit, sinon la valeur brute venue de la base. */
export function statusLabel(copy: StockCopy, value: string): string {
  return isStockStatus(value) ? copy.status[value] : value;
}

/** Libellé d'énergie traduit, sinon la valeur brute venue de la base. */
export function energyLabel(copy: StockCopy, value: string): string {
  return isStockEnergy(value) ? copy.energy[value] : value;
}

/** Libellé de gamme traduit, sinon la valeur brute venue de la base. */
export function vehicleTypeLabel(copy: StockCopy, value: string): string {
  return isStockVehicleType(value) ? copy.vehicleType[value] : value;
}

const fr: StockCopy = {
  dateLocale: "fr-FR",
  pipeline: {
    title: "Stock Général CARZONE : pipeline logistique et showroom",
    subtitle:
      "Cinq étapes suivies au quotidien : commandes usine, production, transit maritime, port, showroom.",
    entryTitle: "Ouvrir le formulaire pour enregistrer un nouveau véhicule en stock",
    entryButton: "+ Entrée stock (nouveau véhicule)",
    viewPipeline: "Pipeline (5 étapes)",
    viewTable: (count) => `Vue tableau (${count})`,
    unitShort: "véh.",
  },
  stages: {
    COMMANDE: {
      label: "Commandes",
      short: "Commandes",
      desc: "Commandes passées aux constructeurs et aux usines",
    },
    EN_PRODUCTION: {
      label: "En production",
      short: "Production",
      desc: "Véhicules en cours d'assemblage chez le constructeur",
    },
    EN_TRANSIT: {
      label: "En transit",
      short: "Transit maritime",
      desc: "En mer, le navire fait route vers le port de Cotonou",
    },
    AU_PORT: {
      label: "Au port",
      short: "Port de Cotonou",
      desc: "Arrivé au port de Cotonou, dédouanement et inspection en cours",
    },
    EN_MAGASIN: {
      label: "En stock au showroom",
      short: "Showroom Cotonou",
      desc: "Prêt à être livré au showroom CARZONE",
    },
  },
  status: {
    COMMANDE: "Commande usine",
    EN_PRODUCTION: "En production",
    EN_TRANSIT: "En transit",
    AU_PORT: "Au port",
    EN_MAGASIN: "En stock showroom",
    EN_STOCK: "En stock",
    RESERVE: "Réservé",
    VENDU: "Vendu",
  },
  statusOption: {
    COMMANDE: "1. Commande usine (usine / bon de commande)",
    EN_PRODUCTION: "2. En production (Chine)",
    EN_TRANSIT: "3. En transit (maritime)",
    AU_PORT: "4. Au port (port de Cotonou)",
    EN_MAGASIN: "5. Stock showroom (disponible à Cotonou)",
    EN_STOCK: "En stock showroom",
    RESERVE: "Réservé (client)",
    VENDU: "Vendu (facturé)",
  },
  energy: {
    ELECTRIQUE: "Électrique",
    HYBRIDE: "Hybride",
    PHEV: "Hybride rechargeable",
    ESSENCE: "Essence",
    DIESEL: "Diesel",
  },
  energyOption: {
    ELECTRIQUE: "Électrique (EV)",
    HYBRIDE: "Hybride (HEV)",
    PHEV: "Hybride rechargeable (PHEV)",
    ESSENCE: "Essence",
    DIESEL: "Diesel",
  },
  vehicleType: {
    SUV: "SUV",
    PICKUP: "Pick-up",
    BERLINE: "Berline",
    VAN: "Van / Minibus",
  },
  filters: {
    searchPlaceholder: "Chercher une marque, un modèle, un VIN",
    allShowrooms: "Tous les showrooms",
    allEnergies: "Toutes les énergies",
    allTypes: "Toutes les gammes",
    submit: "Filtrer",
  },
  createModal: {
    title: "Nouvelle entrée en stock : véhicule neuf",
    subtitle:
      "Renseignez les caractéristiques officielles, l'étape logistique de départ et le showroom de destination.",
    close: "Fermer",
    section1: "1. Marque, modèle et finition constructeur",
    variantPlaceholder: "Finition / pack (ex. 1.5T DCT Premium)",
    variantTitle: "Finition / variante",
    yearPlaceholder: "Année",
    energyTitle: "Énergie",
    section2: "2. Affectation logistique (5 étapes) et emplacement",
    statusTitle: "Statut logistique de départ",
    siteTitle: "Showroom d'affectation",
    supplierTitle: "Fournisseur",
    supplierOptional: "Fournisseur (facultatif)",
    section3: "3. Suivi maritime et châssis (VIN)",
    portPlaceholder: "Port d'origine (ex. Shanghai, Ningbo, Anvers)",
    etaTitle: "Date d'arrivée estimée (ETA)",
    containerPlaceholder: "N° de conteneur / BL maritime",
    vinPlaceholder: "Numéro VIN (17 caractères)",
    vinTitle: "Numéro VIN",
    section4: "4. Tarification en francs CFA",
    pricePlaceholder: "Prix de vente en FCFA *",
    priceTitle: "Prix de vente en francs CFA",
    cancel: "Annuler",
    submit: "Valider et ajouter au stock",
  },
  card: {
    emptyStage: "Aucun véhicule à cette étape",
    vin: "VIN :",
    port: "Port :",
    eta: "ETA :",
    container: "Conteneur :",
    editTitle: "Modifier",
    sheetConfirmedTitle: "Fiche technique validée en base (enregistrée définitivement)",
    sheetPendingTitle: "Fiche technique à valider",
    nextTitle: (status) => `Faire passer en statut : ${status}`,
    nextButton: "Suivant",
  },
  table: {
    colVin: "VIN",
    colVehicle: "Véhicule",
    colRange: "Gamme",
    colEnergy: "Énergie",
    colSupplier: "Fournisseur",
    colShowroom: "Showroom",
    colPrice: "Prix",
    colStatus: "Statut logistique",
    colAction: "Action",
    sheetConfirmed: "Fiche base ✓",
    sheetPending: "Fiche à valider",
    sheetConfirmedTitle:
      "Fiche technique validée et scellée en base (aucun appel OpenAI)",
    sheetPendingTitle: "Fiche technique non validée (cliquez pour la consulter et la valider)",
    edit: "Modifier",
    editTitle: "Modifier ce véhicule en stock",
    delete: "Supprimer",
    deleteTitle: "Supprimer définitivement cet article du stock (Direction et Admin)",
  },
  editModal: {
    title: "✏️ Modifier le véhicule en stock et son étape logistique",
    priceLabel: "Prix de vente en FCFA *",
    statusLabel: "Étape du stock général (5 statuts) *",
    originPortLabel: "Port de provenance",
    originPortPlaceholder: "ex. Shanghai, Ningbo, Anvers",
    etaLabel: "Date d'arrivée prévue (ETA)",
    containerLabel: "N° de conteneur / BL",
    containerPlaceholder: "ex. COSU12345678",
    orderRefLabel: "Réf. du bon de commande usine",
    orderRefPlaceholder: "ex. PO-CHANGAN-2026-01",
    vinLabel: "Numéro VIN (châssis)",
    variantLabel: "Finition / variante",
    yearLabel: "Année",
    energyLabel: "Énergie",
    rangeLabel: "Gamme",
    siteLabel: "Showroom d'affectation",
    supplierLabel: "Fournisseur",
    supplierNone: "Aucun",
    deleteTitle: "Supprimer définitivement cet article du stock",
    deleteButton: "Supprimer du stock",
    cancel: "Annuler",
    save: "Enregistrer les modifications",
  },
  deleteModal: {
    title: "Supprimer cet article du stock ?",
    warning: "Action réservée aux rôles Direction (PDG, DG, DC, SG) et à l'Administration.",
    vehicleLabel: "Véhicule :",
    vinLabel: "VIN :",
    siteLabel: "Showroom :",
    siteUnassigned: "Non affecté",
    priceLabel: "Prix :",
    cancel: "Annuler",
    deleting: "Suppression en cours...",
    confirm: "Confirmer la suppression",
  },
  errors: {
    deleteFailed: "La suppression a échoué. Réessayez.",
  },
};

const en: StockCopy = {
  dateLocale: "en-GB",
  pipeline: {
    title: "CARZONE General Stock: logistics pipeline and showroom",
    subtitle:
      "Five stages we track every day: factory orders, production, sea transit, port, showroom.",
    entryTitle: "Open the form to log a new vehicle into stock",
    entryButton: "+ New vehicle intake",
    viewPipeline: "Pipeline (5 stages)",
    viewTable: (count) => `Table view (${count})`,
    unitShort: "veh.",
  },
  stages: {
    COMMANDE: {
      label: "Orders",
      short: "Orders",
      desc: "Orders placed with manufacturers and factories",
    },
    EN_PRODUCTION: {
      label: "In production",
      short: "Production",
      desc: "Vehicles being assembled at the plant",
    },
    EN_TRANSIT: {
      label: "In transit",
      short: "Sea transit",
      desc: "At sea, the vessel is heading for the Port of Cotonou",
    },
    AU_PORT: {
      label: "At port",
      short: "Port of Cotonou",
      desc: "Arrived at the Port of Cotonou, clearing customs and inspection",
    },
    EN_MAGASIN: {
      label: "In showroom stock",
      short: "Cotonou showroom",
      desc: "Ready for delivery at the CARZONE showroom",
    },
  },
  status: {
    COMMANDE: "Factory order",
    EN_PRODUCTION: "In production",
    EN_TRANSIT: "In transit",
    AU_PORT: "At port",
    EN_MAGASIN: "In showroom stock",
    EN_STOCK: "In stock",
    RESERVE: "Reserved",
    VENDU: "Sold",
  },
  statusOption: {
    COMMANDE: "1. Factory order (plant / purchase order)",
    EN_PRODUCTION: "2. In production (China)",
    EN_TRANSIT: "3. In transit (sea freight)",
    AU_PORT: "4. At port (Port of Cotonou)",
    EN_MAGASIN: "5. Showroom stock (available in Cotonou)",
    EN_STOCK: "Showroom stock",
    RESERVE: "Reserved (customer)",
    VENDU: "Sold (invoiced)",
  },
  energy: {
    ELECTRIQUE: "Electric",
    HYBRIDE: "Hybrid",
    PHEV: "Plug-in hybrid",
    ESSENCE: "Petrol",
    DIESEL: "Diesel",
  },
  energyOption: {
    ELECTRIQUE: "Electric (EV)",
    HYBRIDE: "Hybrid (HEV)",
    PHEV: "Plug-in hybrid (PHEV)",
    ESSENCE: "Petrol",
    DIESEL: "Diesel",
  },
  vehicleType: {
    SUV: "SUV",
    PICKUP: "Pickup",
    BERLINE: "Sedan",
    VAN: "Van / Minibus",
  },
  filters: {
    searchPlaceholder: "Search brand, model or VIN",
    allShowrooms: "All showrooms",
    allEnergies: "All fuel types",
    allTypes: "All body types",
    submit: "Filter",
  },
  createModal: {
    title: "New stock intake: brand new vehicle",
    subtitle:
      "Fill in the official specs, the starting logistics stage and the destination showroom.",
    close: "Close",
    section1: "1. Brand, model and manufacturer trim",
    variantPlaceholder: "Trim / pack (e.g. 1.5T DCT Premium)",
    variantTitle: "Trim / variant",
    yearPlaceholder: "Year",
    energyTitle: "Fuel type",
    section2: "2. Logistics assignment (5 stages) and location",
    statusTitle: "Starting logistics stage",
    siteTitle: "Assigned showroom",
    supplierTitle: "Supplier",
    supplierOptional: "Supplier (optional)",
    section3: "3. Sea freight and chassis (VIN)",
    portPlaceholder: "Origin port (e.g. Shanghai, Ningbo, Antwerp)",
    etaTitle: "Estimated arrival date (ETA)",
    containerPlaceholder: "Container no. / sea B/L",
    vinPlaceholder: "VIN (17 characters)",
    vinTitle: "VIN",
    section4: "4. Pricing in CFA francs",
    pricePlaceholder: "Sale price in XOF *",
    priceTitle: "Sale price in CFA francs",
    cancel: "Cancel",
    submit: "Save and add to stock",
  },
  card: {
    emptyStage: "No vehicle at this stage",
    vin: "VIN:",
    port: "Port:",
    eta: "ETA:",
    container: "Container:",
    editTitle: "Edit",
    sheetConfirmedTitle: "Spec sheet confirmed in the database (permanently saved)",
    sheetPendingTitle: "Spec sheet awaiting confirmation",
    nextTitle: (status) => `Move to status: ${status}`,
    nextButton: "Next",
  },
  table: {
    colVin: "VIN",
    colVehicle: "Vehicle",
    colRange: "Body type",
    colEnergy: "Fuel type",
    colSupplier: "Supplier",
    colShowroom: "Showroom",
    colPrice: "Price",
    colStatus: "Logistics status",
    colAction: "Action",
    sheetConfirmed: "Spec sheet ✓",
    sheetPending: "To validate",
    sheetConfirmedTitle: "Spec sheet confirmed and locked in the database (no OpenAI call)",
    sheetPendingTitle: "Spec sheet not confirmed yet (click to review and confirm)",
    edit: "Edit",
    editTitle: "Edit this vehicle in stock",
    delete: "Delete",
    deleteTitle: "Permanently remove this stock item (Management and Admin)",
  },
  editModal: {
    title: "✏️ Edit the vehicle in stock and its logistics stage",
    priceLabel: "Sale price in XOF *",
    statusLabel: "General stock stage (5 statuses) *",
    originPortLabel: "Origin port",
    originPortPlaceholder: "e.g. Shanghai, Ningbo, Antwerp",
    etaLabel: "Expected arrival date (ETA)",
    containerLabel: "Container no. / B/L",
    containerPlaceholder: "e.g. COSU12345678",
    orderRefLabel: "Factory purchase order ref.",
    orderRefPlaceholder: "e.g. PO-CHANGAN-2026-01",
    vinLabel: "VIN (chassis)",
    variantLabel: "Trim / variant",
    yearLabel: "Year",
    energyLabel: "Fuel type",
    rangeLabel: "Body type",
    siteLabel: "Assigned showroom",
    supplierLabel: "Supplier",
    supplierNone: "None",
    deleteTitle: "Permanently remove this stock item",
    deleteButton: "Remove from stock",
    cancel: "Cancel",
    save: "Save changes",
  },
  deleteModal: {
    title: "Delete this stock item?",
    warning: "Reserved for Management roles (PDG, DG, DC, SG) and Admin.",
    vehicleLabel: "Vehicle:",
    vinLabel: "VIN:",
    siteLabel: "Showroom:",
    siteUnassigned: "Not assigned",
    priceLabel: "Price:",
    cancel: "Cancel",
    deleting: "Deleting...",
    confirm: "Confirm deletion",
  },
  errors: {
    deleteFailed: "Deletion failed. Please try again.",
  },
};

const zh: StockCopy = {
  dateLocale: "zh-CN",
  pipeline: {
    title: "CARZONE 总库存:物流管线与展厅",
    subtitle: "五个环节每天跟进:工厂订单、生产、海运、到港、展厅。",
    entryTitle: "打开表单,登记一台新入库车辆",
    entryButton: "+ 车辆入库(新车辆)",
    viewPipeline: "管线视图(5个环节)",
    viewTable: (count) => `表格视图(${count})`,
    unitShort: "台",
  },
  stages: {
    COMMANDE: {
      label: "订单",
      short: "订单",
      desc: "已向厂商和工厂下达的订单",
    },
    EN_PRODUCTION: {
      label: "在产",
      short: "生产中",
      desc: "车辆正在工厂组装",
    },
    EN_TRANSIT: {
      label: "在途",
      short: "海运在途",
      desc: "海上运输,货船正驶往科托努港",
    },
    AU_PORT: {
      label: "在港",
      short: "科托努港",
      desc: "已抵达科托努港,正在清关和检验",
    },
    EN_MAGASIN: {
      label: "展厅现车",
      short: "科托努展厅",
      desc: "在 CARZONE 展厅可直接交付",
    },
  },
  status: {
    COMMANDE: "工厂订单",
    EN_PRODUCTION: "在产",
    EN_TRANSIT: "在途",
    AU_PORT: "在港",
    EN_MAGASIN: "展厅现车",
    EN_STOCK: "现货",
    RESERVE: "已预订",
    VENDU: "已售出",
  },
  statusOption: {
    COMMANDE: "1. 工厂订单(工厂 / 采购单)",
    EN_PRODUCTION: "2. 在产(中国)",
    EN_TRANSIT: "3. 在途(海运)",
    AU_PORT: "4. 在港(科托努港)",
    EN_MAGASIN: "5. 展厅现车(科托努可提)",
    EN_STOCK: "展厅现车",
    RESERVE: "已预订(客户)",
    VENDU: "已售出(已开票)",
  },
  energy: {
    ELECTRIQUE: "纯电",
    HYBRIDE: "混动",
    PHEV: "插电混动",
    ESSENCE: "汽油",
    DIESEL: "柴油",
  },
  energyOption: {
    ELECTRIQUE: "纯电(EV)",
    HYBRIDE: "混动(HEV)",
    PHEV: "插电混动(PHEV)",
    ESSENCE: "汽油",
    DIESEL: "柴油",
  },
  vehicleType: {
    SUV: "SUV",
    PICKUP: "皮卡",
    BERLINE: "轿车",
    VAN: "面包车 / 小巴",
  },
  filters: {
    searchPlaceholder: "搜索品牌、车型或 VIN",
    allShowrooms: "全部展厅",
    allEnergies: "全部能源类型",
    allTypes: "全部车型类别",
    submit: "筛选",
  },
  createModal: {
    title: "新车辆入库:全新车辆",
    subtitle: "请填写官方参数、起始物流环节和目的展厅。",
    close: "关闭",
    section1: "1. 品牌、车型与厂商配置",
    variantPlaceholder: "配置 / 套件(例:1.5T DCT Premium)",
    variantTitle: "配置 / 版本",
    yearPlaceholder: "年份",
    energyTitle: "能源类型",
    section2: "2. 物流归属(5个环节)与存放地点",
    statusTitle: "起始物流状态",
    siteTitle: "所属展厅",
    supplierTitle: "供应商",
    supplierOptional: "供应商(可选)",
    section3: "3. 海运跟踪与车架号(VIN)",
    portPlaceholder: "起运港(例:上海、宁波、安特卫普)",
    etaTitle: "预计到港日期(ETA)",
    containerPlaceholder: "集装箱号 / 海运提单",
    vinPlaceholder: "VIN 车架号(17位)",
    vinTitle: "VIN 车架号",
    section4: "4. 以中非法郎计价",
    pricePlaceholder: "销售价(XOF)*",
    priceTitle: "销售价(中非法郎)",
    cancel: "取消",
    submit: "确认并加入库存",
  },
  card: {
    emptyStage: "此环节暂无车辆",
    vin: "VIN:",
    port: "港口:",
    eta: "ETA:",
    container: "集装箱:",
    editTitle: "编辑",
    sheetConfirmedTitle: "技术参数已在数据库确认(永久保存)",
    sheetPendingTitle: "技术参数待确认",
    nextTitle: (status) => `移至状态:${status}`,
    nextButton: "下一步",
  },
  table: {
    colVin: "VIN",
    colVehicle: "车辆",
    colRange: "车型类别",
    colEnergy: "能源",
    colSupplier: "供应商",
    colShowroom: "展厅",
    colPrice: "价格",
    colStatus: "物流状态",
    colAction: "操作",
    sheetConfirmed: "参数已入库 ✓",
    sheetPending: "待确认",
    sheetConfirmedTitle: "技术参数已在数据库确认并锁定(不调用 OpenAI)",
    sheetPendingTitle: "技术参数尚未确认(点击查看并确认)",
    edit: "编辑",
    editTitle: "编辑这台在库车辆",
    delete: "删除",
    deleteTitle: "永久删除这条库存记录(管理层与管理员)",
  },
  editModal: {
    title: "✏️ 编辑在库车辆与物流环节",
    priceLabel: "销售价(XOF)*",
    statusLabel: "总库存环节(5种状态)*",
    originPortLabel: "起运港",
    originPortPlaceholder: "例:上海、宁波、安特卫普",
    etaLabel: "预计到港日期(ETA)",
    containerLabel: "集装箱号 / 提单",
    containerPlaceholder: "例:COSU12345678",
    orderRefLabel: "工厂采购单号",
    orderRefPlaceholder: "例:PO-CHANGAN-2026-01",
    vinLabel: "VIN 车架号",
    variantLabel: "配置 / 版本",
    yearLabel: "年份",
    energyLabel: "能源",
    rangeLabel: "车型类别",
    siteLabel: "所属展厅",
    supplierLabel: "供应商",
    supplierNone: "无",
    deleteTitle: "永久删除这条库存记录",
    deleteButton: "从库存删除",
    cancel: "取消",
    save: "保存修改",
  },
  deleteModal: {
    title: "确定删除这条库存？",
    warning: "仅限管理层(PDG、DG、DC、SG)和管理员操作。",
    vehicleLabel: "车辆:",
    vinLabel: "VIN:",
    siteLabel: "展厅:",
    siteUnassigned: "未分配",
    priceLabel: "价格:",
    cancel: "取消",
    deleting: "正在删除...",
    confirm: "确认删除",
  },
  errors: {
    deleteFailed: "删除失败,请重试。",
  },
};

export const stockCopy: Record<Locale, StockCopy> = { fr, en, zh };
