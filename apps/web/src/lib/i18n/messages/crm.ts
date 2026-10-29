import type { Locale } from "@/lib/prefs";

/**
 * Copy des modules CRM et parc : prospects, opportunités, flotte, location.
 * Les codes techniques (NEW, MATCHING, LCD, ACTIF...) restent des données :
 * seuls les libellés affichés sont traduits, via les helpers en bas de fichier.
 */

export type LeadStatusKey =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "MATCHED"
  | "TEST_DRIVE"
  | "QUOTE_SENT"
  | "WON"
  | "LOST";

export type LeadSourceKey =
  | "showroom_maro_militaire"
  | "showroom"
  | "site_web"
  | "whatsapp"
  | "prospection"
  | "recommandation"
  | "referral"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "tiktok";

export type LeadEnergyKey = "ELECTRIQUE" | "HYBRIDE" | "PHEV" | "ESSENCE" | "DIESEL";

export type OpportunityStageKey =
  | "LEAD"
  | "MATCHING"
  | "ESSAI"
  | "DEVIS"
  | "NEGOCIATION"
  | "CLOSING"
  | "LIVRE"
  | "PERDU";

export type RentalTypeKey = "LCD" | "LLD" | "LOA";

export type RentalStatusKey = "ACTIF" | "BROUILLON" | "TERMINE" | "ANNULE";

export const LEAD_STATUS_KEYS: LeadStatusKey[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "MATCHED",
  "TEST_DRIVE",
  "QUOTE_SENT",
  "WON",
  "LOST",
];

export const LEAD_SOURCE_KEYS: LeadSourceKey[] = [
  "showroom_maro_militaire",
  "showroom",
  "site_web",
  "whatsapp",
  "prospection",
  "recommandation",
  "referral",
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
];

export const LEAD_ENERGY_KEYS: LeadEnergyKey[] = [
  "ELECTRIQUE",
  "HYBRIDE",
  "PHEV",
  "ESSENCE",
  "DIESEL",
];

export const OPPORTUNITY_STAGE_KEYS: OpportunityStageKey[] = [
  "LEAD",
  "MATCHING",
  "ESSAI",
  "DEVIS",
  "NEGOCIATION",
  "CLOSING",
  "LIVRE",
  "PERDU",
];

export const RENTAL_TYPE_KEYS: RentalTypeKey[] = ["LCD", "LLD", "LOA"];

export const RENTAL_STATUS_KEYS: RentalStatusKey[] = [
  "ACTIF",
  "BROUILLON",
  "TERMINE",
  "ANNULE",
];

export type CrmCopy = {
  /** Format de date utilisé par formatDate (fr-BJ, en-GB, zh-CN). */
  dateLocale: string;
  /** Dates de contrat localisées. */
  formatDate: (date: Date | string | null | undefined) => string;
  leads: {
    form: {
      contactPlaceholder: string;
      emailPlaceholder: string;
      phonePlaceholder: string;
      interestPlaceholder: string;
      energyPlaceholder: string;
      submit: string;
    };
    energy: Record<LeadEnergyKey, string>;
    energyNone: string;
    search: {
      placeholder: string;
      allSources: string;
    };
    table: {
      contact: string;
      source: string;
      interest: string;
      energy: string;
      assignee: string;
      status: string;
      actions: string;
      empty: string;
    };
    source: Record<LeadSourceKey, string>;
    status: Record<LeadStatusKey, string>;
    actions: {
      edit: string;
      editTitle: string;
      apply: string;
    };
    hint: string;
    modal: {
      title: string;
      nameLabel: string;
      emailLabel: string;
      phoneLabel: string;
      sourceLabel: string;
      statusLabel: string;
      interestLabel: string;
      energyLabel: string;
      cancel: string;
      save: string;
    };
  };
  opportunities: {
    form: {
      titlePlaceholder: string;
      customer: string;
      vehicle: string;
      amountPlaceholder: string;
      submit: string;
    };
    table: {
      title: string;
      customer: string;
      vehicle: string;
      amount: string;
      stage: string;
      advance: string;
      apply: string;
      empty: string;
    };
    stages: Record<OpportunityStageKey, string>;
  };
  fleet: {
    form: {
      namePlaceholder: string;
      companyPlaceholder: string;
      create: string;
      accountSelect: string;
      vehicleSelect: string;
      customerSelect: string;
      platePlaceholder: string;
      driverPlaceholder: string;
      addVehicle: string;
    };
    table: {
      plate: string;
      vehicle: string;
      driver: string;
      customer: string;
      active: string;
      empty: string;
    };
    yes: string;
    no: string;
    empty: string;
  };
  rentals: {
    form: {
      customer: string;
      vehicle: string;
      monthlyPlaceholder: string;
      depositPlaceholder: string;
      submit: string;
    };
    table: {
      type: string;
      customer: string;
      vehicle: string;
      start: string;
      end: string;
      monthly: string;
      status: string;
      empty: string;
    };
    types: Record<RentalTypeKey, string>;
    status: Record<RentalStatusKey, string>;
    empty: string;
  };
};

const fr: CrmCopy = {
  dateLocale: "fr-BJ",
  formatDate: (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-BJ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(typeof date === "string" ? new Date(date) : date);
  },
  leads: {
    form: {
      contactPlaceholder: "Nom du contact *",
      emailPlaceholder: "Email",
      phonePlaceholder: "Téléphone",
      interestPlaceholder: "Ce qu'il cherche (SUV, berline…)",
      energyPlaceholder: "Énergie visée (facultatif)",
      submit: "+ Ajouter un prospect",
    },
    energy: {
      ELECTRIQUE: "Électrique",
      HYBRIDE: "Hybride",
      PHEV: "Hybride rechargeable",
      ESSENCE: "Essence",
      DIESEL: "Diesel",
    },
    energyNone: "Pas de préférence",
    search: {
      placeholder: "Un nom, un email, un téléphone, un besoin…",
      allSources: "Toutes les origines",
    },
    table: {
      contact: "Contact",
      source: "Origine",
      interest: "Ce qu'il cherche",
      energy: "Énergie",
      assignee: "Assigné",
      status: "Statut",
      actions: "Actions",
      empty: "Aucun prospect pour le moment. Le formulaire du haut suffit pour démarrer.",
    },
    source: {
      showroom_maro_militaire: "Showroom Maro-Militaire (Gbèdomidji)",
      showroom: "Showroom",
      site_web: "Site web",
      whatsapp: "WhatsApp",
      prospection: "Prospection",
      recommandation: "Recommandation d'un client",
      referral: "Parrainage",
      facebook: "Facebook",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      tiktok: "TikTok",
    },
    status: {
      NEW: "Nouveau",
      CONTACTED: "Contacté",
      QUALIFIED: "Qualifié",
      MATCHED: "Véhicule identifié",
      TEST_DRIVE: "Essai réalisé",
      QUOTE_SENT: "Devis envoyé",
      WON: "Gagné",
      LOST: "Perdu",
    },
    actions: {
      edit: "Modifier",
      editTitle: "Corriger la fiche de ce prospect",
      apply: "OK",
    },
    hint:
      "Notre façon de faire : on qualifie le contact, puis on le rattache à un véhicule du stock dès qu'on en a un qui colle. L'essai vient après, puis le devis.",
    modal: {
      title: "✏️ Modifier la fiche prospect",
      nameLabel: "Nom et contact *",
      emailLabel: "Email",
      phoneLabel: "Téléphone",
      sourceLabel: "Origine du contact",
      statusLabel: "Statut actuel",
      interestLabel: "Ce qu'il cherche (modèle ou catégorie)",
      energyLabel: "Énergie souhaitée",
      cancel: "Annuler",
      save: "Enregistrer la fiche",
    },
  },
  opportunities: {
    form: {
      titlePlaceholder: "Objet de l'affaire *",
      customer: "Client",
      vehicle: "Véhicule concerné",
      amountPlaceholder: "Montant (FCFA)",
      submit: "Créer",
    },
    table: {
      title: "Objet",
      customer: "Client",
      vehicle: "Véhicule",
      amount: "Montant",
      stage: "Étape",
      advance: "Changer d'étape",
      apply: "OK",
      empty: "Aucune affaire en cours. La première se crée avec le formulaire du haut.",
    },
    stages: {
      LEAD: "Piste",
      MATCHING: "Véhicule identifié",
      ESSAI: "Essai",
      DEVIS: "Devis",
      NEGOCIATION: "Négociation",
      CLOSING: "Finalisation",
      LIVRE: "Livré",
      PERDU: "Perdu",
    },
  },
  fleet: {
    form: {
      namePlaceholder: "Nom de la flotte *",
      companyPlaceholder: "Entreprise",
      create: "Créer le compte flotte",
      accountSelect: "Flotte *",
      vehicleSelect: "Véhicule CARZONE",
      customerSelect: "Client",
      platePlaceholder: "Immatriculation",
      driverPlaceholder: "Conducteur",
      addVehicle: "Ajouter ce véhicule",
    },
    table: {
      plate: "Immat.",
      vehicle: "Véhicule",
      driver: "Conducteur",
      customer: "Client",
      active: "Actif",
      empty: "Aucun véhicule dans cette flotte pour le moment.",
    },
    yes: "Oui",
    no: "Non",
    empty: "Aucune flotte enregistrée. On commence par le compte flotte.",
  },
  rentals: {
    form: {
      customer: "Client *",
      vehicle: "Véhicule du stock *",
      monthlyPlaceholder: "Mensualité (FCFA)",
      depositPlaceholder: "Caution (FCFA)",
      submit: "Créer le contrat",
    },
    table: {
      type: "Type",
      customer: "Client",
      vehicle: "Véhicule",
      start: "Début",
      end: "Fin",
      monthly: "Mensualité",
      status: "Statut",
      empty: "Aucun contrat de location en cours.",
    },
    types: {
      LCD: "LCD · courte durée",
      LLD: "LLD · longue durée",
      LOA: "LOA · option d'achat",
    },
    status: {
      ACTIF: "En cours",
      BROUILLON: "Brouillon",
      TERMINE: "Terminé",
      ANNULE: "Annulé",
    },
    empty: "Aucun contrat de location en cours.",
  },
};

const en: CrmCopy = {
  dateLocale: "en-GB",
  formatDate: (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(typeof date === "string" ? new Date(date) : date);
  },
  leads: {
    form: {
      contactPlaceholder: "Contact name *",
      emailPlaceholder: "Email",
      phonePlaceholder: "Phone",
      interestPlaceholder: "What they're after (SUV, sedan…)",
      energyPlaceholder: "Preferred powertrain (optional)",
      submit: "+ Add a lead",
    },
    energy: {
      ELECTRIQUE: "Electric",
      HYBRIDE: "Hybrid",
      PHEV: "Plug-in hybrid",
      ESSENCE: "Petrol",
      DIESEL: "Diesel",
    },
    energyNone: "No preference",
    search: {
      placeholder: "Name, email, phone, or need…",
      allSources: "All sources",
    },
    table: {
      contact: "Contact",
      source: "Source",
      interest: "Looking for",
      energy: "Powertrain",
      assignee: "Owner",
      status: "Status",
      actions: "Actions",
      empty: "No leads yet. The form above is all you need to start.",
    },
    source: {
      showroom_maro_militaire: "Maro-Militaire showroom (Gbèdomidji)",
      showroom: "Showroom",
      site_web: "Website",
      whatsapp: "WhatsApp",
      prospection: "Field prospecting",
      recommandation: "Customer recommendation",
      referral: "Partner referral",
      facebook: "Facebook",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      tiktok: "TikTok",
    },
    status: {
      NEW: "New",
      CONTACTED: "Contacted",
      QUALIFIED: "Qualified",
      MATCHED: "Vehicle matched",
      TEST_DRIVE: "Test drive done",
      QUOTE_SENT: "Quote sent",
      WON: "Won",
      LOST: "Lost",
    },
    actions: {
      edit: "Edit",
      editTitle: "Fix this lead's details",
      apply: "OK",
    },
    hint:
      "How we work it: qualify the contact, then match them to a stock vehicle. Test drive comes next, and the quote goes out right after.",
    modal: {
      title: "✏️ Edit lead",
      nameLabel: "Full name and contact *",
      emailLabel: "Email",
      phoneLabel: "Phone",
      sourceLabel: "Where they came from",
      statusLabel: "Current status",
      interestLabel: "What they're after (model or category)",
      energyLabel: "Preferred powertrain",
      cancel: "Cancel",
      save: "Save lead",
    },
  },
  opportunities: {
    form: {
      titlePlaceholder: "Deal title *",
      customer: "Customer",
      vehicle: "Vehicle to match",
      amountPlaceholder: "Amount (XOF)",
      submit: "Create",
    },
    table: {
      title: "Deal",
      customer: "Customer",
      vehicle: "Vehicle",
      amount: "Amount",
      stage: "Stage",
      advance: "Move stage",
      apply: "OK",
      empty: "No deals yet. Create the first one with the form above.",
    },
    stages: {
      LEAD: "Lead",
      MATCHING: "Vehicle match",
      ESSAI: "Test drive",
      DEVIS: "Quote",
      NEGOCIATION: "Negotiation",
      CLOSING: "Closing",
      LIVRE: "Delivered",
      PERDU: "Lost",
    },
  },
  fleet: {
    form: {
      namePlaceholder: "Fleet name *",
      companyPlaceholder: "Company",
      create: "Create fleet account",
      accountSelect: "Fleet *",
      vehicleSelect: "CARZONE vehicle",
      customerSelect: "Customer",
      platePlaceholder: "Plate number",
      driverPlaceholder: "Driver",
      addVehicle: "Add this vehicle",
    },
    table: {
      plate: "Plate",
      vehicle: "Vehicle",
      driver: "Driver",
      customer: "Customer",
      active: "Active",
      empty: "No vehicles in this fleet yet.",
    },
    yes: "Yes",
    no: "No",
    empty: "No fleet accounts yet. Start with the fleet account form.",
  },
  rentals: {
    form: {
      customer: "Customer *",
      vehicle: "Stock vehicle *",
      monthlyPlaceholder: "Monthly (XOF)",
      depositPlaceholder: "Deposit (XOF)",
      submit: "Create contract",
    },
    table: {
      type: "Type",
      customer: "Customer",
      vehicle: "Vehicle",
      start: "Start",
      end: "End",
      monthly: "Monthly",
      status: "Status",
      empty: "No rental contracts yet.",
    },
    types: {
      LCD: "LCD · short term",
      LLD: "LLD · long term",
      LOA: "LOA · lease with purchase option",
    },
    status: {
      ACTIF: "Active",
      BROUILLON: "Draft",
      TERMINE: "Ended",
      ANNULE: "Cancelled",
    },
    empty: "No rental contracts yet.",
  },
};

const zh: CrmCopy = {
  dateLocale: "zh-CN",
  formatDate: (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("zh-CN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(typeof date === "string" ? new Date(date) : date);
  },
  leads: {
    form: {
      contactPlaceholder: "联系人姓名 *",
      emailPlaceholder: "邮箱",
      phonePlaceholder: "电话",
      interestPlaceholder: "想找什么车(SUV、轿车…)",
      energyPlaceholder: "意向能源(可选)",
      submit: "+ 新增潜在客户",
    },
    energy: {
      ELECTRIQUE: "纯电",
      HYBRIDE: "混动",
      PHEV: "插电混动",
      ESSENCE: "汽油",
      DIESEL: "柴油",
    },
    energyNone: "不限",
    search: {
      placeholder: "姓名、邮箱、电话或需求…",
      allSources: "全部来源",
    },
    table: {
      contact: "联系人",
      source: "来源",
      interest: "需求",
      energy: "能源",
      assignee: "负责人",
      status: "状态",
      actions: "操作",
      empty: "还没有潜在客户。用上方表单录入第一个。",
    },
    source: {
      showroom_maro_militaire: "马罗军事区展厅(格贝多米吉)",
      showroom: "展厅",
      site_web: "官网",
      whatsapp: "WhatsApp",
      prospection: "线下拓展",
      recommandation: "客户推荐",
      referral: "合作推荐",
      facebook: "Facebook",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      tiktok: "TikTok",
    },
    status: {
      NEW: "新线索",
      CONTACTED: "已联系",
      QUALIFIED: "已确认意向",
      MATCHED: "已匹配车辆",
      TEST_DRIVE: "已试驾",
      QUOTE_SENT: "已报价",
      WON: "成交",
      LOST: "已流失",
    },
    actions: {
      edit: "编辑",
      editTitle: "修改这条线索的资料",
      apply: "确定",
    },
    hint: "我们的做法:先确认需求,再匹配库存车辆。之后安排试驾,最后出报价。",
    modal: {
      title: "✏️ 编辑线索",
      nameLabel: "姓名与联系方式 *",
      emailLabel: "邮箱",
      phoneLabel: "电话",
      sourceLabel: "来源渠道",
      statusLabel: "当前状态",
      interestLabel: "想找的车型或类别",
      energyLabel: "意向能源",
      cancel: "取消",
      save: "保存",
    },
  },
  opportunities: {
    form: {
      titlePlaceholder: "商机名称 *",
      customer: "客户",
      vehicle: "匹配车辆",
      amountPlaceholder: "金额(XOF)",
      submit: "创建",
    },
    table: {
      title: "商机",
      customer: "客户",
      vehicle: "车辆",
      amount: "金额",
      stage: "阶段",
      advance: "推进阶段",
      apply: "确定",
      empty: "还没有商机。用上方表单新建第一个。",
    },
    stages: {
      LEAD: "线索",
      MATCHING: "匹配车辆",
      ESSAI: "试驾",
      DEVIS: "报价",
      NEGOCIATION: "谈判",
      CLOSING: "签约中",
      LIVRE: "已交付",
      PERDU: "已丢单",
    },
  },
  fleet: {
    form: {
      namePlaceholder: "车队名称 *",
      companyPlaceholder: "公司",
      create: "创建车队账户",
      accountSelect: "车队 *",
      vehicleSelect: "CARZONE 车辆",
      customerSelect: "客户",
      platePlaceholder: "车牌号",
      driverPlaceholder: "司机",
      addVehicle: "添加这台车",
    },
    table: {
      plate: "车牌",
      vehicle: "车辆",
      driver: "司机",
      customer: "客户",
      active: "在册",
      empty: "这个车队还没有车辆。",
    },
    yes: "是",
    no: "否",
    empty: "还没有车队账户。先建一个车队账户。",
  },
  rentals: {
    form: {
      customer: "客户 *",
      vehicle: "库存车辆 *",
      monthlyPlaceholder: "月租(XOF)",
      depositPlaceholder: "押金(XOF)",
      submit: "创建合同",
    },
    table: {
      type: "类型",
      customer: "客户",
      vehicle: "车辆",
      start: "开始",
      end: "结束",
      monthly: "月租",
      status: "状态",
      empty: "还没有租赁合同。",
    },
    types: {
      LCD: "LCD · 短租",
      LLD: "LLD · 长租",
      LOA: "LOA · 含购买选择权",
    },
    status: {
      ACTIF: "进行中",
      BROUILLON: "草稿",
      TERMINE: "已结束",
      ANNULE: "已取消",
    },
    empty: "还没有租赁合同。",
  },
};

export const crmCopy: Record<Locale, CrmCopy> = { fr, en, zh };

function isLeadStatus(value: string): value is LeadStatusKey {
  return LEAD_STATUS_KEYS.some((key) => key === value);
}

function isLeadSource(value: string): value is LeadSourceKey {
  return LEAD_SOURCE_KEYS.some((key) => key === value);
}

function isLeadEnergy(value: string): value is LeadEnergyKey {
  return LEAD_ENERGY_KEYS.some((key) => key === value);
}

function isOpportunityStage(value: string): value is OpportunityStageKey {
  return OPPORTUNITY_STAGE_KEYS.some((key) => key === value);
}

function isRentalType(value: string): value is RentalTypeKey {
  return RENTAL_TYPE_KEYS.some((key) => key === value);
}

function isRentalStatus(value: string): value is RentalStatusKey {
  return RENTAL_STATUS_KEYS.some((key) => key === value);
}

/** Libellé traduit d'un statut prospect, sinon la valeur brute venue de la base. */
export function leadStatusLabel(copy: CrmCopy, value: string): string {
  return isLeadStatus(value) ? copy.leads.status[value] : value;
}

/** Libellé traduit d'une origine de prospect, sinon la valeur brute. */
export function leadSourceLabel(copy: CrmCopy, value: string): string {
  return isLeadSource(value) ? copy.leads.source[value] : value;
}

/** Libellé traduit d'une énergie de prospect, sinon la valeur brute. */
export function leadEnergyLabel(copy: CrmCopy, value: string): string {
  return isLeadEnergy(value) ? copy.leads.energy[value] : value;
}

/** Libellé traduit d'une étape d'opportunité, sinon la valeur brute. */
export function opportunityStageLabel(copy: CrmCopy, value: string): string {
  return isOpportunityStage(value) ? copy.opportunities.stages[value] : value;
}

/** Libellé traduit d'un type de location, sinon la valeur brute. */
export function rentalTypeLabel(copy: CrmCopy, value: string): string {
  return isRentalType(value) ? copy.rentals.types[value] : value;
}

/** Libellé traduit d'un statut de location, sinon la valeur brute. */
export function rentalStatusLabel(copy: CrmCopy, value: string): string {
  return isRentalStatus(value) ? copy.rentals.status[value] : value;
}
