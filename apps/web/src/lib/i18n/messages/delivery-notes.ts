import type { Locale } from "@/lib/prefs";

/**
 * Dictionnaire du module BONS DE LIVRAISON INTERNES (BL).
 * Documents internes NON FISCAUX de déstockage — jamais une facture.
 */
export type DeliveryNotesCopy = {
  title: string;
  subtitle: string;
  nonFiscalBanner: string;
  tabs: { all: string; showroom: string; garage: string };
  statusFilters: { all: string; issued: string; cancelled: string };
  table: {
    number: string;
    activity: string;
    customer: string;
    lines: string;
    status: string;
    createdAt: string;
    actions: string;
    empty: string;
  };
  status: { EMIS: string; ANNULE: string };
  actions: {
    create: string;
    print: string;
    cancel: string;
    cancelConfirmTitle: string;
    cancelReasonPlaceholder: string;
    cancelSubmit: string;
    cancelTooShort: string;
  };
  createModal: {
    title: string;
    activity: string;
    customer: string;
    customerPlaceholder: string;
    notes: string;
    lineVehicle: string;
    linePart: string;
    addVehicleLine: string;
    addPartLine: string;
    description: string;
    quantity: string;
    unitPrice: string;
    submit: string;
    cancel: string;
    atLeastOneLine: string;
  };
  print: {
    docTitle: string;
    legalNotice: string;
    number: string;
    activityLabel: string;
    customer: string;
    date: string;
    columns: { designation: string; quantity: string; unitPrice: string };
    signatures: { issuedBy: string; receivedBy: string };
    back: string;
  };
};

const fr: DeliveryNotesCopy = {
  title: "Bons de livraison internes",
  subtitle: "Documents internes de déstockage — ne peuvent jamais servir de facture.",
  nonFiscalBanner: "DOCUMENT INTERNE NON FISCAL — NE PEUT SERVIR DE FACTURE",
  tabs: { all: "Toutes", showroom: "Showroom", garage: "Garage" },
  statusFilters: { all: "Tous", issued: "Émis", cancelled: "Annulés" },
  table: {
    number: "N° BL",
    activity: "Périmètre",
    customer: "Client",
    lines: "Lignes",
    status: "Statut",
    createdAt: "Date",
    actions: "Actions",
    empty: "Aucun bon de livraison interne enregistré.",
  },
  status: { EMIS: "Émis", ANNULE: "Annulé" },
  actions: {
    create: "Nouveau BL",
    print: "Imprimer",
    cancel: "Annuler",
    cancelConfirmTitle: "Annulation du bon de livraison",
    cancelReasonPlaceholder: "Motif de l'annulation (8 caractères minimum)",
    cancelSubmit: "Confirmer l'annulation",
    cancelTooShort: "Le motif doit contenir au moins 8 caractères.",
  },
  createModal: {
    title: "Nouveau bon de livraison interne",
    activity: "Périmètre",
    customer: "Client (optionnel)",
    customerPlaceholder: "Sélectionner un client",
    notes: "Notes internes",
    lineVehicle: "Véhicule",
    linePart: "Pièce détachée",
    addVehicleLine: "+ Ligne véhicule",
    addPartLine: "+ Ligne pièce",
    description: "Désignation",
    quantity: "Qté",
    unitPrice: "Prix unitaire (FCFA)",
    submit: "Créer et déstocker",
    cancel: "Annuler",
    atLeastOneLine: "Ajoutez au moins une ligne (véhicule ou pièce).",
  },
  print: {
    docTitle: "BON DE LIVRAISON INTERNE",
    legalNotice:
      "Document interne de déstockage — aucune TVA, aucune valeur fiscale. Ne peut en aucun cas servir de facture ni être présenté à l'administration fiscale.",
    number: "N°",
    activityLabel: "Périmètre",
    customer: "Client",
    date: "Date d'émission",
    columns: { designation: "Désignation", quantity: "Qté", unitPrice: "Prix unitaire" },
    signatures: { issuedBy: "Émis par", receivedBy: "Reçu par" },
    back: "Retour",
  },
};

const en: DeliveryNotesCopy = {
  title: "Internal delivery notes",
  subtitle: "Internal stock-out documents — can never be used as an invoice.",
  nonFiscalBanner: "INTERNAL NON-FISCAL DOCUMENT — CANNOT BE USED AS AN INVOICE",
  tabs: { all: "All", showroom: "Showroom", garage: "Workshop" },
  statusFilters: { all: "All", issued: "Issued", cancelled: "Cancelled" },
  table: {
    number: "Note #",
    activity: "Scope",
    customer: "Customer",
    lines: "Lines",
    status: "Status",
    createdAt: "Date",
    actions: "Actions",
    empty: "No internal delivery note recorded yet.",
  },
  status: { EMIS: "Issued", ANNULE: "Cancelled" },
  actions: {
    create: "New delivery note",
    print: "Print",
    cancel: "Cancel",
    cancelConfirmTitle: "Cancel delivery note",
    cancelReasonPlaceholder: "Cancellation reason (minimum 8 characters)",
    cancelSubmit: "Confirm cancellation",
    cancelTooShort: "The reason must be at least 8 characters long.",
  },
  createModal: {
    title: "New internal delivery note",
    activity: "Scope",
    customer: "Customer (optional)",
    customerPlaceholder: "Select a customer",
    notes: "Internal notes",
    lineVehicle: "Vehicle",
    linePart: "Spare part",
    addVehicleLine: "+ Vehicle line",
    addPartLine: "+ Part line",
    description: "Description",
    quantity: "Qty",
    unitPrice: "Unit price (FCFA)",
    submit: "Create and dispatch",
    cancel: "Cancel",
    atLeastOneLine: "Add at least one line (vehicle or part).",
  },
  print: {
    docTitle: "INTERNAL DELIVERY NOTE",
    legalNotice:
      "Internal stock-out document — no VAT, no fiscal value. Cannot be used as an invoice or submitted to tax authorities.",
    number: "No.",
    activityLabel: "Scope",
    customer: "Customer",
    date: "Issue date",
    columns: { designation: "Description", quantity: "Qty", unitPrice: "Unit price" },
    signatures: { issuedBy: "Issued by", receivedBy: "Received by" },
    back: "Back",
  },
};

const zh: DeliveryNotesCopy = {
  title: "内部出库单",
  subtitle: "内部出库文件 — 不得用作发票。",
  nonFiscalBanner: "内部非税务文件 — 不得用作发票",
  tabs: { all: "全部", showroom: "展厅", garage: "车间" },
  statusFilters: { all: "全部", issued: "已出库", cancelled: "已取消" },
  table: {
    number: "单号",
    activity: "范围",
    customer: "客户",
    lines: "明细",
    status: "状态",
    createdAt: "日期",
    actions: "操作",
    empty: "暂无内部出库单记录。",
  },
  status: { EMIS: "已出库", ANNULE: "已取消" },
  actions: {
    create: "新建出库单",
    print: "打印",
    cancel: "取消",
    cancelConfirmTitle: "取消出库单",
    cancelReasonPlaceholder: "取消原因（至少8个字符）",
    cancelSubmit: "确认取消",
    cancelTooShort: "原因必须至少包含8个字符。",
  },
  createModal: {
    title: "新建内部出库单",
    activity: "范围",
    customer: "客户（可选）",
    customerPlaceholder: "选择客户",
    notes: "内部备注",
    lineVehicle: "车辆",
    linePart: "配件",
    addVehicleLine: "+ 车辆明细",
    addPartLine: "+ 配件明细",
    description: "描述",
    quantity: "数量",
    unitPrice: "单价（西非法郎）",
    submit: "创建并出库",
    cancel: "取消",
    atLeastOneLine: "请至少添加一条明细（车辆或配件）。",
  },
  print: {
    docTitle: "内部出库单",
    legalNotice: "内部出库文件 — 无增值税，无税务价值。不得用作发票或提交给税务机关。",
    number: "编号",
    activityLabel: "范围",
    customer: "客户",
    date: "开立日期",
    columns: { designation: "描述", quantity: "数量", unitPrice: "单价" },
    signatures: { issuedBy: "开立人", receivedBy: "签收人" },
    back: "返回",
  },
};

export const deliveryNotesCopy: Record<Locale, DeliveryNotesCopy> = { fr, en, zh };
