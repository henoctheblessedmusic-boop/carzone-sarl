import type { Locale } from "@/lib/prefs";

/** Codes de statut atelier rencontrés en base (colonne "Statut" du SAV). */
export type WorkshopStatusCode =
  | "L"
  | "C"
  | "AT"
  | "AC"
  | "F"
  | "D"
  | "ATD"
  | "AF"
  | "HSAV"
  | "ANN";

/** Modes de règlement du SAV (valeur brute stockée en base). */
export type PaymentModeKey = "BC" | "MOBILE_MONEY" | "CASH" | "PROFORMA" | "INTERNAL";

export type PartCategoryKey =
  | "FREINAGE"
  | "FILTRATION"
  | "SUSPENSION"
  | "MOTEUR"
  | "ELECTRICITE"
  | "ECLAIRAGE"
  | "CARROSSERIE"
  | "FLUIDES"
  | "AUTRE";

export type PartUnitKey = "JEU" | "PIECE" | "PAIRE" | "LITRE" | "KIT";

export type PartMovementTypeKey =
  | "ENTREE_ACHAT"
  | "SORTIE_ATELIER"
  | "RETOUR_STOCK"
  | "AJUSTEMENT_INVENTAIRE";

/** Catégories de tâches de la checklist d'entretien systématique (fiche 2, 22 points). */
export type ChecklistCategoryKey =
  | "MOTEUR"
  | "FILTRATION"
  | "ELECTRICITE"
  | "FLUIDES"
  | "FREINAGE"
  | "SUSPENSION"
  | "ECLAIRAGE"
  | "SCANNER";

/**
 * Libellés FR exacts des 22 tâches de `WORKSHOP_CHECKLIST_TEMPLATE` (lib/workshop-checklist-data.ts).
 * Ces chaînes sont persistées en base comme `taskLabel` : ne jamais les modifier,
 * seule leur traduction affichée passe par `checklistTasks`.
 */
export type ChecklistTaskLabelKey =
  | "Vidange huile moteur"
  | "Remplacer filtre à huile"
  | "Nettoyer et contrôler le filtre à air"
  | "Nettoyage et contrôler les batteries"
  | "Contrôle du niveau de liquide refroidissement"
  | "Contrôle du niveau d'huile à frein/embrayage"
  | "Contrôle du niveau d'huile boîte et pont"
  | "Contrôle/remplacer les garnitures de frein"
  | "Contrôle état des courroies"
  | "Contrôle de suspension et pneus"
  | "Contrôle éclairage et signalisation"
  | "Graissage générale"
  | "Pose du scanner"
  | "Ajout de nettoyant injecteur"
  | "Remplacer filtre à gasoil"
  | "Échange de filtre à air"
  | "Échange de filtre habitacle"
  | "Échange des bougies d'allumage"
  | "Entretien du système de freinage"
  | "Vidange de liquide de frein"
  | "Vidange de liquide de refroidissement"
  | "Échange de filtre carburant essence";

export type WorkshopCopy = {
  /** Format de date local utilisé dans les listes (fr-BJ, en-GB, zh-CN). */
  dateLocale: string;
  status: Record<WorkshopStatusCode, string>;
  paymentMode: Record<PaymentModeKey, string>;
  clientType: { client: string; internal: string };
  checklistCategories: Record<ChecklistCategoryKey, string>;
  checklistTasks: Record<ChecklistTaskLabelKey, string>;
  list: {
    title: string;
    subtitle: string;
    importExcel: string;
    exportExcel: string;
    template: string;
    templateTitle: string;
    partsLink: string;
    newEntry: string;
    kpiTotal: string;
    kpiTotalHint: string;
    kpiOngoing: string;
    kpiOngoingHint: string;
    kpiPart: string;
    kpiPartHint: string;
    kpiApproval: string;
    kpiApprovalHint: string;
    kpiDelivered: string;
    kpiDeliveredHint: string;
    legendTitle: string;
    heroBadge: string;
    heroBadgeHint: string;
    heroTitle: string;
    heroSubtitle: string;
    heroChip1: string;
    heroChip2: string;
    heroChip3: string;
    heroEmpty: string;
    heroVehicleFallback: string;
    heroClient: string;
    heroMileage: string;
    heroOngoing: string;
    heroWorks: string;
    heroTablet: string;
    heroTabletTitle: string;
    heroFiche1: string;
    heroFiche1Title: string;
    heroFiche2: string;
    heroFiche2Title: string;
    searchPlaceholder: string;
    filterAllClientTypes: string;
    filterClient: string;
    filterInternal: string;
    filterAllStatuses: string;
    colDate: string;
    colOr: string;
    colImmat: string;
    colVehicle: string;
    colSheets: string;
    colChassis: string;
    colMileage: string;
    colClient: string;
    colType: string;
    colPhone: string;
    colReceptionist: string;
    colStatus: string;
    colWorks: string;
    colEndWorks: string;
    colExit: string;
    colDeliverer: string;
    colPayment: string;
    colActions: string;
    emptyRow: string;
    rowTablet: string;
    rowTabletTitle: string;
    rowFiche1: string;
    rowFiche1Title: string;
    rowFiche2: string;
    rowFiche2Title: string;
    rowEditTitle: string;
    rowDeleteTitle: string;
    deleteConfirm: (immat: string) => string;
    errors: {
      deleteFailed: string;
      createFailed: string;
      updateFailed: string;
      importFailed: string;
    };
    importModal: {
      title: string;
      description: string;
      choose: string;
      formats: string;
      running: string;
      success: (count: number, sheet: string) => string;
      cancel: string;
      submit: string;
      submitting: string;
    };
    createModal: {
      title: string;
      subtitle: (orderNumber: string) => string;
      clientLabel: string;
      autofillBadge: string;
      clientPlaceholder: (count: number) => string;
      newClientOption: string;
      telInline: string;
      autofillHint: (phone: string, brand: string, model: string) => string;
      immatLabel: string;
      immatPlaceholder: string;
      clientNameLabel: string;
      clientNamePlaceholder: string;
      brandLabel: string;
      brandPlaceholder: string;
      modelLabel: string;
      modelPlaceholder: string;
      mileageLabel: string;
      mileagePlaceholder: string;
      orLabel: string;
      orTag: string;
      orTitle: string;
      orAuto: string;
      entryDateLabel: string;
      entryTimeLabel: string;
      phoneLabel: string;
      phonePlaceholder: string;
      receptionistLabel: string;
      receptionistPlaceholder: string;
      statusLabel: string;
      worksLabel: string;
      worksPlaceholder: string;
      exitDateLabel: string;
      exitTimeLabel: string;
      paymentLabel: string;
      cancel: string;
      submit: string;
      submitting: string;
    };
    editModal: {
      title: (immat: string) => string;
      subtitle: (orderNumber: string) => string;
      immatLabel: string;
      clientLabel: string;
      brandLabel: string;
      modelLabel: string;
      mileageLabel: string;
      orLabel: string;
      orLocked: string;
      entryDateLabel: string;
      entryTimeLabel: string;
      phoneLabel: string;
      receptionistLabel: string;
      receptionistPlaceholder: string;
      statusLabel: string;
      worksLabel: string;
      endWorksLabel: string;
      endWorksPlaceholder: string;
      durationLabel: string;
      durationPlaceholder: string;
      exitDateLabel: string;
      exitTimeLabel: string;
      paymentLabel: string;
      cancel: string;
      submit: string;
      submitting: string;
    };
  };
  tablet: {
    title: (orNumber: string) => string;
    client: string;
    mileage: string;
    fiche1: string;
    fiche1Title: string;
    fiche2: string;
    fiche2Title: string;
    tabChecklist: (tier: string) => string;
    tabIntervention: string;
    tabSignatures: string;
    tierTitle: string;
    checkAll: string;
    reset: string;
    tierStandard: string;
    tierFilters: string;
    tierMajor: string;
    matrixTitle: (count: number) => string;
    activeTier: (tier: string) => string;
    observationPlaceholder: string;
    done: string;
    notDone: string;
    notApplicable: string;
    clearSignature: string;
    clearConfirm: string;
    signHint: string;
    faultLabel: string;
    faultPlaceholder: string;
    pole1Title: string;
    pole1Tag: string;
    pole1Placeholder: string;
    pole2Title: string;
    pole2Tag: string;
    pole2Placeholder: string;
    pole3Title: string;
    pole3Tag: string;
    pole3Placeholder: string;
    pole4Title: string;
    pole4Tag: string;
    pole4Placeholder: string;
    worksLabel: string;
    worksPlaceholder: string;
    partsLabel: string;
    partsPlaceholder: string;
    startLabel: string;
    endLabel: string;
    technicianLabel: string;
    technicianPlaceholder: string;
    managerLabel: string;
    managerPlaceholder: string;
    signatureNote: string;
    padClient: string;
    padTechnician: string;
    padManager: string;
    closeNoSave: string;
    save: string;
    saveRunning: string;
    saveError: string;
  };
  print: {
    intervention: {
      back: string;
      badge: string;
      print: string;
      companyActivity: string;
      afterSales: string;
      telLabel: string;
      address: string;
      country: string;
      docTitle: string;
      orLabel: string;
      entryDate: string;
      brand: string;
      model: string;
      immat: string;
      date: string;
      chassis: string;
      orNumber: string;
      clientPhone: string;
      phoneInline: string;
      mileageLabel: string;
      sectionFault: string;
      faultDefault: string;
      sectionTier: string;
      sectionPoles: string;
      poleMotor: string;
      poleMotorDefault: string;
      poleSuspension: string;
      poleSuspensionDefault: string;
      poleElectricity: string;
      poleElectricityDefault: string;
      poleOthers: string;
      poleOthersDefault: string;
      sectionWorks: string;
      worksDefault: string;
      observationsTitle: string;
      observationsDefault: string;
      partsTitle: string;
      partsDefault: string;
      startLabel: string;
      endLabel: string;
      technicianLabel: string;
      technicianTeamDefault: string;
      signaturesTitle: string;
      colClient: string;
      colTechnicians: string;
      colManager: string;
      clientAgreement: string;
      clientSignature: string;
      clientSignatureAlt: string;
      technicianVisa: string;
      technicianDefault: string;
      technicianSignature: string;
      technicianSignatureAlt: string;
      managerControl: string;
      managerDefault: string;
      managerSignature: string;
      managerSignatureAlt: string;
      footer: string;
    };
    maintenance: {
      back: string;
      badge: string;
      print: string;
      companyActivity: string;
      afterSales: string;
      telLabel: string;
      docTitle: string;
      sheetNumber: string;
      dateLabel: string;
      brand: string;
      model: string;
      immat: string;
      date: string;
      chassis: string;
      clientName: string;
      mileageLabel: string;
      oilLabel: string;
      oilDefault: string;
      hoursLabel: string;
      start: string;
      end: string;
      pvLabel: string;
      pvDefault: string;
      colTier: string;
      colNumber: string;
      colTask: string;
      colDone: string;
      colNotDone: string;
      colObservation: string;
      observationsTitle: string;
      observationsDefault: string;
      signaturesTitle: string;
      colClient: string;
      colTechnicians: string;
      colManager: string;
      clientAgreement: string;
      clientSignature: string;
      clientSignatureAlt: string;
      technicianVisa: string;
      technicianDefault: string;
      technicianSignature: string;
      technicianSignatureAlt: string;
      managerVisa: string;
      managerDefault: string;
      managerSignature: string;
      managerSignatureAlt: string;
      footer: string;
    };
    fallbacks: {
      immatPending: string;
      immatInProgress: string;
      clientName: string;
      faultDefault: string;
    };
  };
  parts: {
    title: string;
    subtitle: string;
    newPart: string;
    kpiRefs: string;
    kpiRefsHint: (units: number) => string;
    kpiCrossRefs: string;
    kpiCrossRefsHint: string;
    kpiValue: string;
    kpiValueHint: string;
    kpiAlerts: string;
    kpiAlertsOut: string;
    kpiAlertsLow: string;
    kpiAlertsHint: string;
    guideTitle: string;
    guideFindTitle: string;
    guideFind: string;
    guideCheckTitle: string;
    guideCheck: string;
    guideActTitle: string;
    guideAct: string;
    tabInventory: (count: number) => string;
    tabCrossRefs: string;
    tabMovements: string;
    crossBadge: string;
    crossTitle: string;
    crossIntro: string;
    crossPlaceholder: string;
    quickSearches: string;
    resultCount: (count: number) => string;
    resultsHint: string;
    emptyTitle: string;
    emptyBody: string;
    emptyAction: string;
    oemBadge: string;
    manufacturerBadge: string;
    salePrice: string;
    purchasePrice: (price: string) => string;
    stockOut: string;
    stockLow: string;
    stockIn: string;
    locationLabel: string;
    locationNone: string;
    crossBlockTitle: string;
    crossCount: (count: number) => string;
    crossEmpty: string;
    crossDeleteTitle: string;
    compatBlockTitle: string;
    compatCount: (count: number) => string;
    compatEmpty: string;
    compatDeleteTitle: string;
    actionAddCrossRef: string;
    actionMovement: string;
    actionPickForWorkshop: string;
    filterSearchPlaceholder: string;
    filterAllCategories: string;
    filterAllStock: string;
    filterInStock: string;
    filterLowStock: string;
    filterOutStock: string;
    filterQuick: string;
    filterClear: string;
    colPartCode: string;
    colOem: string;
    colName: string;
    colCategory: string;
    colLocation: string;
    colCrossRefs: string;
    colCompatible: string;
    colStock: string;
    colSalePrice: string;
    colActions: string;
    locationUndefined: string;
    rowStockButton: string;
    rowStockTitle: string;
    rowVehicles: (count: number) => string;
    rowVehiclesTitle: string;
    rowEditTitle: string;
    auditTitle: string;
    auditSubtitle: string;
    colDate: string;
    colPart: string;
    colMovementType: string;
    colQuantity: string;
    colTotal: string;
    colDocument: string;
    colReason: string;
    colOperator: string;
    operatorSystem: string;
    createTitle: string;
    createCodeLabel: string;
    createCodePlaceholder: string;
    createOemLabel: string;
    createOemPlaceholder: string;
    createNameLabel: string;
    createNamePlaceholder: string;
    createCategoryLabel: string;
    createManufacturerLabel: string;
    createManufacturerPlaceholder: string;
    createUnitLabel: string;
    createStockLabel: string;
    createAlertLabel: string;
    createLocationLabel: string;
    createLocationPlaceholder: string;
    createPurchaseLabel: string;
    createSaleLabel: string;
    createCrossRefTitle: string;
    createCrossRefBrandPlaceholder: string;
    createCrossRefCodePlaceholder: string;
    createCompatTitle: string;
    createCompatBrandPlaceholder: string;
    createCompatModelPlaceholder: string;
    createSubmit: string;
    detailsTitle: (partNumber: string) => string;
    detailsSubtitle: (name: string, qty: number, unit: string) => string;
    detailsAddCrossRefTitle: string;
    detailsBrandLabel: string;
    detailsBrandPlaceholder: string;
    detailsCodeLabel: string;
    detailsCodePlaceholder: string;
    detailsNotesPlaceholder: string;
    detailsAddCrossRefSubmit: string;
    detailsAddCompatTitle: string;
    detailsVehicleBrandLabel: string;
    detailsVehicleBrandPlaceholder: string;
    detailsVehicleModelLabel: string;
    detailsVehicleModelPlaceholder: string;
    detailsYearsPlaceholder: string;
    detailsEnginePlaceholder: string;
    detailsPositionPlaceholder: string;
    detailsAddCompatSubmit: string;
    movementTitle: (partNumber: string) => string;
    movementCurrentStock: string;
    movementTypeLabel: string;
    movementQuantityLabel: string;
    movementDocumentLabel: string;
    movementDocumentPlaceholder: string;
    movementReasonLabel: string;
    movementReasonPlaceholder: string;
    movementSubmit: string;
    assignTitle: string;
    assignPartLabel: string;
    assignAvailableLabel: string;
    assignPriceLabel: string;
    assignEntryLabel: string;
    assignEntryPlaceholder: string;
    assignQuantityLabel: string;
    assignNotesLabel: string;
    assignNotesPlaceholder: string;
    assignSubmit: string;
    cancel: string;
    close: string;
    category: Record<PartCategoryKey, string>;
    unit: Record<PartUnitKey, string>;
    movementType: Record<PartMovementTypeKey, string>;
  };
};

export type PartCopy = WorkshopCopy["parts"];

export const PART_CATEGORY_KEYS: PartCategoryKey[] = [
  "FREINAGE",
  "FILTRATION",
  "SUSPENSION",
  "MOTEUR",
  "ELECTRICITE",
  "ECLAIRAGE",
  "CARROSSERIE",
  "FLUIDES",
  "AUTRE",
];

export const PART_UNIT_KEYS: PartUnitKey[] = ["JEU", "PIECE", "PAIRE", "LITRE", "KIT"];

export const PART_MOVEMENT_TYPE_KEYS: PartMovementTypeKey[] = [
  "ENTREE_ACHAT",
  "SORTIE_ATELIER",
  "RETOUR_STOCK",
  "AJUSTEMENT_INVENTAIRE",
];

/** Couples valeur stockée / clé de libellé pour le mode de règlement. */
export const WORKSHOP_PAYMENT_MODES: { value: string; key: PaymentModeKey }[] = [
  { value: "BC", key: "BC" },
  { value: "Mobile Money", key: "MOBILE_MONEY" },
  { value: "En espèces", key: "CASH" },
  { value: "Proforma", key: "PROFORMA" },
  { value: "Interne", key: "INTERNAL" },
];

const workshopStatusKeys: Record<WorkshopStatusCode, true> = {
  L: true,
  C: true,
  AT: true,
  AC: true,
  F: true,
  D: true,
  ATD: true,
  AF: true,
  HSAV: true,
  ANN: true,
};

/** Libellé de statut atelier traduit, sinon le code brut venu de la base. */
export function workshopStatusLabel(copy: WorkshopCopy, value: string): string {
  return value in workshopStatusKeys ? copy.status[value as WorkshopStatusCode] : value;
}

/** Mode de règlement traduit à partir de la valeur brute stockée en base. */
export function paymentModeLabel(copy: WorkshopCopy, value: string): string {
  const found = WORKSHOP_PAYMENT_MODES.find((mode) => mode.value === value);
  return found ? copy.paymentMode[found.key] : value;
}

/** Catégorie de pièce traduite, sinon la valeur brute. */
export function partCategoryLabel(copy: PartCopy, value: string): string {
  return PART_CATEGORY_KEYS.some((key) => key === value)
    ? copy.category[value as PartCategoryKey]
    : value;
}

/** Unité de pièce traduite, sinon la valeur brute. */
export function partUnitLabel(copy: PartCopy, value: string): string {
  return PART_UNIT_KEYS.some((key) => key === value) ? copy.unit[value as PartUnitKey] : value;
}

/** Type de mouvement de stock traduit, sinon la valeur brute. */
export function movementTypeLabel(copy: PartCopy, value: string): string {
  return PART_MOVEMENT_TYPE_KEYS.some((key) => key === value)
    ? copy.movementType[value as PartMovementTypeKey]
    : value;
}

const CHECKLIST_CATEGORY_KEYS: ChecklistCategoryKey[] = [
  "MOTEUR",
  "FILTRATION",
  "ELECTRICITE",
  "FLUIDES",
  "FREINAGE",
  "SUSPENSION",
  "ECLAIRAGE",
  "SCANNER",
];

/** Catégorie de tâche de checklist traduite, sinon le code brut venu de la base. */
export function checklistCategoryLabel(
  copy: WorkshopCopy,
  value?: string | null
): string {
  if (!value) return "";
  return CHECKLIST_CATEGORY_KEYS.some((key) => key === value)
    ? copy.checklistCategories[value as ChecklistCategoryKey]
    : value;
}

/** Libellé de tâche de checklist traduit, sinon le `taskLabel` brut persisté en base. */
export function checklistTaskLabel(copy: WorkshopCopy, value: string): string {
  return copy.checklistTasks[value as ChecklistTaskLabelKey] ?? value;
}

const fr: WorkshopCopy = {
  dateLocale: "fr-BJ",
  status: {
    L: "Livré",
    C: "En cours",
    AT: "Attente pièce",
    AC: "Attente accord client",
    F: "Fini (prêt)",
    D: "Diagnostic",
    ATD: "Attente décaissement",
    AF: "À faire",
    HSAV: "Hors SAV",
    ANN: "Annulé",
  },
  paymentMode: {
    BC: "BC (bon de commande)",
    MOBILE_MONEY: "Mobile Money",
    CASH: "Espèces",
    PROFORMA: "Proforma",
    INTERNAL: "Interne",
  },
  clientType: { client: "Client", internal: "Interne" },
  checklistCategories: {
    MOTEUR: "Moteur",
    FILTRATION: "Filtration",
    ELECTRICITE: "Électricité",
    FLUIDES: "Fluides",
    FREINAGE: "Freinage",
    SUSPENSION: "Suspension",
    ECLAIRAGE: "Éclairage",
    SCANNER: "Scanner",
  },
  checklistTasks: {
    "Vidange huile moteur": "Vidange huile moteur",
    "Remplacer filtre à huile": "Remplacer filtre à huile",
    "Nettoyer et contrôler le filtre à air": "Nettoyer et contrôler le filtre à air",
    "Nettoyage et contrôler les batteries": "Nettoyage et contrôler les batteries",
    "Contrôle du niveau de liquide refroidissement":
      "Contrôle du niveau de liquide refroidissement",
    "Contrôle du niveau d'huile à frein/embrayage":
      "Contrôle du niveau d'huile à frein/embrayage",
    "Contrôle du niveau d'huile boîte et pont": "Contrôle du niveau d'huile boîte et pont",
    "Contrôle/remplacer les garnitures de frein":
      "Contrôle/remplacer les garnitures de frein",
    "Contrôle état des courroies": "Contrôle état des courroies",
    "Contrôle de suspension et pneus": "Contrôle de suspension et pneus",
    "Contrôle éclairage et signalisation": "Contrôle éclairage et signalisation",
    "Graissage générale": "Graissage générale",
    "Pose du scanner": "Pose du scanner",
    "Ajout de nettoyant injecteur": "Ajout de nettoyant injecteur",
    "Remplacer filtre à gasoil": "Remplacer filtre à gasoil",
    "Échange de filtre à air": "Échange de filtre à air",
    "Échange de filtre habitacle": "Échange de filtre habitacle",
    "Échange des bougies d'allumage": "Échange des bougies d'allumage",
    "Entretien du système de freinage": "Entretien du système de freinage",
    "Vidange de liquide de frein": "Vidange de liquide de frein",
    "Vidange de liquide de refroidissement": "Vidange de liquide de refroidissement",
    "Échange de filtre carburant essence": "Échange de filtre carburant essence",
  },
  list: {
    title: "Historique des passages à l'atelier SAV",
    subtitle:
      "Tout l'atelier au même endroit. Vos anciens classeurs Excel se téléversent tels quels et viennent alimenter la base de l'entreprise.",
    importExcel: "Téléverser un fichier Excel",
    exportExcel: "Exporter en Excel (.xlsx)",
    template: "Gabarit",
    templateTitle: "Télécharger le modèle Excel officiel",
    partsLink: "Pièces et références croisées",
    newEntry: "Nouvelle entrée",
    kpiTotal: "Passages enregistrés",
    kpiTotalHint: "Dans la base",
    kpiOngoing: "En cours (C)",
    kpiOngoingHint: "Véhicules à l'atelier",
    kpiPart: "Attente pièce (AT)",
    kpiPartHint: "Pièces en commande",
    kpiApproval: "Attente accord (AC)",
    kpiApprovalHint: "Devis chez le client",
    kpiDelivered: "Livrés (L)",
    kpiDeliveredHint: "Sorties validées",
    legendTitle: "Légende des statuts",
    heroBadge: "Fiches techniques et mode tablette",
    heroBadgeHint: "Calqué sur les deux fiches papier de l'atelier",
    heroTitle: "Vos véhicules en cours, fiche par fiche",
    heroSubtitle:
      "Plus besoin de fouiller les colonnes du tableau. Les véhicules en travaux sont ici : ouvrez la saisie tactile pour le mécanicien, ou imprimez la fiche A4.",
    heroChip1: "Fiche 1 : l'OR en 4 pôles",
    heroChip2: "Fiche 2 : 22 tâches, de 5 000 à 100 000 km",
    heroChip3: "Tablette : saisie et signatures",
    heroEmpty: "Aucun véhicule à l'atelier pour le moment.",
    heroVehicleFallback: "Véhicule",
    heroClient: "Client :",
    heroMileage: "Compteur :",
    heroOngoing: "en cours",
    heroWorks: "Diagnostic et travaux :",
    heroTablet: "Mode tablette",
    heroTabletTitle: "Ouvrir la checklist tactile et signer au doigt",
    heroFiche1: "Fiche 1 (A4)",
    heroFiche1Title: "Imprimer la fiche 1 (ordre de réparation, 4 pôles)",
    heroFiche2: "Fiche 2 (A4)",
    heroFiche2Title: "Imprimer la fiche 2 (entretien systématique, 22 points)",
    searchPlaceholder: "Rechercher une immat, un client, un châssis, un n° d'ordre",
    filterAllClientTypes: "Tous les types de clients",
    filterClient: "Clients",
    filterInternal: "Interne",
    filterAllStatuses: "Tous les statuts",
    colDate: "Date et heure",
    colOr: "N° d'ordre",
    colImmat: "Immatriculation",
    colVehicle: "Marque et modèle",
    colSheets: "Fiches et tablette",
    colChassis: "Châssis (VIN)",
    colMileage: "Kilométrage",
    colClient: "Client",
    colType: "Type",
    colPhone: "Téléphone",
    colReceptionist: "Réceptionnaire",
    colStatus: "Statut",
    colWorks: "Travaux effectués",
    colEndWorks: "Fin des travaux",
    colExit: "Sortie (date et heure)",
    colDeliverer: "Livreur",
    colPayment: "Règlement",
    colActions: "Actions",
    emptyRow: "Aucun passage ne correspond à ces critères.",
    rowTablet: "Tablette",
    rowTabletTitle: "Ouvrir sur tablette (checklist et signatures)",
    rowFiche1: "Fiche 1",
    rowFiche1Title: "Imprimer la fiche d'intervention (A4)",
    rowFiche2: "Fiche 2",
    rowFiche2Title: "Imprimer la fiche d'entretien systématique (A4)",
    rowEditTitle: "Modifier cette entrée",
    rowDeleteTitle: "Supprimer",
    deleteConfirm: (immat) => `Supprimer le passage du véhicule ${immat} ?`,
    errors: {
      deleteFailed: "La suppression a échoué. Réessayez.",
      createFailed: "La création a échoué. Vérifiez les champs puis réessayez.",
      updateFailed: "La mise à jour a échoué. Réessayez.",
      importFailed: "L'import a échoué.",
    },
    importModal: {
      title: "Importer un fichier Excel d'atelier",
      description:
        "Choisissez le classeur (.xlsx, .xls ou .csv) qui contient l'historique des passages. L'application lit les colonnes officielles (OR, immatriculation, châssis, client, statut, travaux, date de sortie, règlement) et remplit la base.",
      choose: "Choisissez votre fichier Excel SAV",
      formats: "Formats acceptés : .xlsx, .xls ou .csv, 15 Mo maximum",
      running: "Import en cours, la base se structure...",
      success: (count, sheet) => `Import terminé : ${count} lignes lues dans la feuille « ${sheet} ».`,
      cancel: "Annuler",
      submit: "Lancer l'import",
      submitting: "Traitement en cours...",
    },
    createModal: {
      title: "Enregistrer un passage au SAV",
      subtitle: (orderNumber) => `N° d'ordre #${orderNumber}, attribué automatiquement`,
      clientLabel: "Client : base existante ou saisie libre",
      autofillBadge: "Données client reprises",
      clientPlaceholder: (count) =>
        `Choisir un client existant (${count} en base) ou en saisir un nouveau`,
      newClientOption: "Nouveau client (saisie manuelle)",
      telInline: "Tél. :",
      autofillHint: (phone, brand, model) =>
        `Téléphone (${phone}) et véhicule (${brand} ${model}) repris automatiquement.`,
      immatLabel: "Immatriculation *",
      immatPlaceholder: "ex. CJ 0290 RB",
      clientNameLabel: "Nom du client *",
      clientNamePlaceholder: "ex. Palais Présidentiel",
      brandLabel: "Marque",
      brandPlaceholder: "ex. MITSUBISHI",
      modelLabel: "Modèle",
      modelPlaceholder: "ex. OUTLANDER",
      mileageLabel: "Kilométrage (km)",
      mileagePlaceholder: "ex. 37445",
      orLabel: "N° d'ordre",
      orTag: "(clé primaire)",
      orTitle: "Numéro d'ordre attribué automatiquement, non modifiable",
      orAuto: "Auto",
      entryDateLabel: "Date d'entrée *",
      entryTimeLabel: "Heure d'entrée *",
      phoneLabel: "Téléphone du client",
      phonePlaceholder: "ex. 0167434244",
      receptionistLabel: "Réceptionnaire *",
      receptionistPlaceholder: "Choisir le réceptionnaire",
      statusLabel: "Statut *",
      worksLabel: "Travaux effectués ou diagnostic",
      worksPlaceholder: "ex. révision des 20 000 km",
      exitDateLabel: "Date de sortie",
      exitTimeLabel: "Heure de sortie",
      paymentLabel: "Mode de règlement",
      cancel: "Annuler",
      submit: "Valider l'entrée",
      submitting: "Enregistrement...",
    },
    editModal: {
      title: (immat) => `Modifier le passage : ${immat}`,
      subtitle: (orderNumber) => `N° d'ordre #${orderNumber} (clé primaire)`,
      immatLabel: "Immatriculation *",
      clientLabel: "Client *",
      brandLabel: "Marque",
      modelLabel: "Modèle",
      mileageLabel: "Kilométrage",
      orLabel: "N° d'ordre",
      orLocked: "Non modifiable",
      entryDateLabel: "Date d'entrée",
      entryTimeLabel: "Heure d'entrée",
      phoneLabel: "Téléphone",
      receptionistLabel: "Réceptionnaire",
      receptionistPlaceholder: "Choisir le réceptionnaire",
      statusLabel: "Statut *",
      worksLabel: "Travaux effectués",
      endWorksLabel: "Date et heure de fin des travaux",
      endWorksPlaceholder: "ex. 16/07/2026 17:00",
      durationLabel: "Durée d'exécution",
      durationPlaceholder: "ex. 6 jours",
      exitDateLabel: "Date de sortie",
      exitTimeLabel: "Heure de sortie",
      paymentLabel: "Mode de règlement",
      cancel: "Annuler",
      submit: "Enregistrer les modifications",
      submitting: "Mise à jour...",
    },
  },
  tablet: {
    title: (orNumber) => `Fiche atelier · OR #${orNumber}`,
    client: "Client :",
    mileage: "Compteur :",
    fiche1: "Fiche 1",
    fiche1Title: "Aperçu et impression de la fiche 1 (A4)",
    fiche2: "Fiche 2",
    fiche2Title: "Aperçu et impression de la fiche 2 (A4)",
    tabChecklist: (tier) => `Checklist par palier (${tier} KM)`,
    tabIntervention: "Fiche intervention (4 pôles)",
    tabSignatures: "Signatures tactiles",
    tierTitle: "Palier d'entretien réalisé",
    checkAll: "Tout cocher",
    reset: "Réinitialiser",
    tierStandard: "Vidange standard",
    tierFilters: "Filtres et vidange",
    tierMajor: "Grand entretien",
    matrixTitle: (count) => `Checklist (${count} points de contrôle)`,
    activeTier: (tier) => `Palier actif : ${tier} KM`,
    observationPlaceholder: "Observation ou mesure (ex. 2,3 bars, plaquettes usées à 80 %)",
    done: "Effectué",
    notDone: "Non fait",
    notApplicable: "N/A",
    clearSignature: "Effacer",
    clearConfirm: "Effacer cette signature déjà apposée ?",
    signHint: "Signez au doigt ou au stylet, juste au-dessus",
    faultLabel: "Panne signalée à la réception",
    faultPlaceholder: "Bruits suspects, symptômes, pannes annoncées par le client...",
    pole1Title: "Moteur et transmission",
    pole1Tag: "Pôle moteur",
    pole1Placeholder: "Vidange moteur, filtres, courroie, boîte de vitesses, pont...",
    pole2Title: "Suspension et train roulant",
    pole2Tag: "Pôle châssis",
    pole2Placeholder: "Amortisseurs, rotules, triangles, silentblocs, pneus, freinage...",
    pole3Title: "Électricité et scanner",
    pole3Tag: "Diagnostic OBD",
    pole3Placeholder: "Scanner diagnostic, batterie, alternateur, capteurs, feux...",
    pole4Title: "Autres (clim, tôlerie...)",
    pole4Tag: "Accessoires",
    pole4Placeholder: "Recharge climatisation, carrosserie, serrures, lavage...",
    worksLabel: "Travaux effectués",
    worksPlaceholder: "Le détail des réparations faites par le technicien...",
    partsLabel: "Pièces consommées et à commander",
    partsPlaceholder: "Les références demandées au magasinier...",
    startLabel: "Heure de début",
    endLabel: "Heure de fin",
    technicianLabel: "Technicien assigné",
    technicianPlaceholder: "Nom du mécanicien",
    managerLabel: "Responsable atelier",
    managerPlaceholder: "Nom du chef d'atelier",
    signatureNote:
      "Ces signatures reprennent les cadres de validation Carzone. Elles s'incrustent automatiquement sur les fiches A4 imprimées et dans l'archive PDF du véhicule.",
    padClient: "1. Accord client",
    padTechnician: "2. Technicien exécutant",
    padManager: "3. Responsable atelier",
    closeNoSave: "Fermer sans enregistrer",
    save: "Valider et enregistrer",
    saveRunning: "Enregistrement...",
    saveError: "L'enregistrement a échoué. Vérifiez les données saisies.",
  },
  print: {
    intervention: {
      back: "Retour à l'atelier",
      badge: "Fiche d'intervention officielle A4",
      print: "Imprimer / Exporter en PDF",
      companyActivity: "Concession de véhicules multi-marques",
      afterSales: "Service après-vente et atelier agréé",
      telLabel: "Tél :",
      address: "Maro-Militaire, Gbèdomidji, Cotonou",
      country: "République du Bénin",
      docTitle: "Fiche d'intervention",
      orLabel: "Ordre de réparation : #",
      entryDate: "Date d'entrée :",
      brand: "Marque :",
      model: "Modèle :",
      immat: "Immatriculation :",
      date: "Date :",
      chassis: "S/N (châssis) :",
      orNumber: "N° fiche / OR :",
      clientPhone: "Client et tél. :",
      phoneInline: "Tél. :",
      mileageLabel: "Compteur (KM) :",
      sectionFault: "1. Panne signalée par le client (constat à la réception)",
      faultDefault: "Entretien périodique et révision générale.",
      sectionTier: "2. Type d'entretien kilométrique (paliers recommandés)",
      sectionPoles: "3. Travaux par secteur technique (diagnostic et inspection)",
      poleMotor: "Moteur transmission",
      poleMotorDefault: "Moteur et transmission contrôlés, niveaux et étanchéité conformes.",
      poleSuspension: "Suspension",
      poleSuspensionDefault: "Amortisseurs, rotules, pneus et freinage contrôlés.",
      poleElectricity: "Électricité",
      poleElectricityDefault: "Calculateur scanné. Batterie, alternateur et éclairage contrôlés.",
      poleOthers: "Autres",
      poleOthersDefault: "Climatisation, carrosserie et accessoires conformes.",
      sectionWorks: "4. Travaux effectués par l'atelier",
      worksDefault: "Entretien réalisé selon les préconisations de l'atelier.",
      observationsTitle: "Observations techniques",
      observationsDefault: "Véhicule rendu propre, en bon état général.",
      partsTitle: "Pièces à commander / magasin",
      partsDefault: "Pièces et fournitures d'origine Carzone prélevées au magasin.",
      startLabel: "Heure de début :",
      endLabel: "Heure de fin :",
      technicianLabel: "Technicien assigné :",
      technicianTeamDefault: "Équipe SAV Carzone",
      signaturesTitle: "Validations et signatures (ordre de réparation et restitution)",
      colClient: "Client",
      colTechnicians: "Techniciens",
      colManager: "Responsable atelier",
      clientAgreement: "Bon pour accord et réception",
      clientSignature: "Signature client",
      clientSignatureAlt: "Signature du client",
      technicianVisa: "Visa de réalisation",
      technicianDefault: "Technicien Carzone",
      technicianSignature: "Visa mécanicien",
      technicianSignatureAlt: "Signature du technicien",
      managerControl: "Contrôle qualité et sortie",
      managerDefault: "Chef d'atelier SAV",
      managerSignature: "Cachet et visa atelier",
      managerSignatureAlt: "Signature du chef d'atelier",
      footer:
        "CARZONE SARL · Société à responsabilité limitée · Concessionnaire automobile officiel · Gestion SAV Carzone Ops",
    },
    maintenance: {
      back: "Retour à l'atelier",
      badge: "Fiche matrice d'entretien systématique (22 points)",
      print: "Imprimer / Exporter en PDF",
      companyActivity: "Concession de véhicules multi-marques",
      afterSales: "Service après-vente et maintenance agréée",
      telLabel: "Tél :",
      docTitle: "Fiche d'entretien systématique",
      sheetNumber: "N° fiche : #",
      dateLabel: "Date :",
      brand: "Marque :",
      model: "Modèle :",
      immat: "Immatriculation :",
      date: "Date :",
      chassis: "S/N (châssis) :",
      clientName: "Nom et n° client :",
      mileageLabel: "Compteur :",
      oilLabel: "Type de vidange :",
      oilDefault: "Huile de synthèse 5W-30, norme constructeur",
      hoursLabel: "Heures travaux :",
      start: "Début :",
      end: "Fin :",
      pvLabel: "PV contrôle :",
      pvDefault: "PV-CONFORME",
      colTier: "Palier KM",
      colNumber: "N°",
      colTask: "Tâche à effectuer",
      colDone: "Effectué",
      colNotDone: "Non fait",
      colObservation: "Observation / mesure",
      observationsTitle: "Observations du chef d'atelier et rapport scanner diagnostic OBD-II",
      observationsDefault:
        "Calculateurs conformes. Pression des pneus ajustée, niveaux au repère MAX. Véhicule prêt à être livré.",
      signaturesTitle: "Validations officielles (restitution et sortie d'atelier)",
      colClient: "Client",
      colTechnicians: "Techniciens",
      colManager: "Responsable atelier",
      clientAgreement: "Bon pour accord et réception",
      clientSignature: "Signature client",
      clientSignatureAlt: "Signature du client",
      technicianVisa: "Visa de conformité des travaux",
      technicianDefault: "Technicien référent",
      technicianSignature: "Visa technicien",
      technicianSignatureAlt: "Signature du technicien",
      managerVisa: "Visa sortie atelier et garantie",
      managerDefault: "Chef d'atelier SAV",
      managerSignature: "Cachet et visa atelier",
      managerSignatureAlt: "Signature du chef d'atelier",
      footer:
        "CARZONE SARL · Fiche d'entretien systématique constructeur certifiée conforme · ERP Carzone Ops",
    },
    fallbacks: {
      immatPending: "EN ATTENTE",
      immatInProgress: "EN COURS",
      clientName: "Client Carzone",
      faultDefault: "Entretien périodique programmé.",
    },
  },
  parts: {
    title: "Pièces détachées et références croisées",
    subtitle:
      "Atelier SAV et magasin central CARZONE · Croisement multi-modèles (Changan, Jetour, Chery, BAIC, Forthing, BYD, Toyota)",
    newPart: "Nouvelle pièce",
    kpiRefs: "Références pièces",
    kpiRefsHint: (units) => `${units} unités physiques en stock`,
    kpiCrossRefs: "Références croisées",
    kpiCrossRefsHint: "Équivalences multi-marques actives",
    kpiValue: "Valeur du stock magasin",
    kpiValueHint: "Coût d'achat immobilisé en magasin",
    kpiAlerts: "Alertes réapprovisionnement",
    kpiAlertsOut: "ruptures",
    kpiAlertsLow: "faibles",
    kpiAlertsHint: "Commandes de réapprovisionnement à lancer",
    guideTitle: "Guide opérationnel :",
    guideFindTitle: "1. Chercher :",
    guideFind: "tapez un modèle (Jetour Dashing) ou un type de pièce (patin de frein).",
    guideCheckTitle: "2. Vérifier :",
    guideCheck: "les badges bleus indiquent sur quels autres véhicules la pièce se monte.",
    guideActTitle: "3. Agir :",
    guideAct: "passez par Entrée / Sortie pour mettre le stock à jour tout de suite.",
    tabInventory: (count) => `Magasin et stock pièces (${count})`,
    tabCrossRefs: "Fiches d'interchangeabilité",
    tabMovements: "Historique des entrées et sorties",
    crossBadge: "Moteur d'interchangeabilité pièces multi-marques CARZONE",
    crossTitle: "Chercher une référence croisée ou un véhicule compatible",
    crossIntro:
      "Tapez une référence OEM constructeur, une référence équipementier (Bosch, Brembo, Valeo...) ou le nom d'un véhicule (Jetour Dashing, Changan CS35, patin, filtre 1.5T).",
    crossPlaceholder: "Ex. 3501110-M01, T15-3501080, Changan CS35, Jetour Dashing...",
    quickSearches: "Recherches rapides :",
    resultCount: (count) => `${count} résultat(s)`,
    resultsHint: "Les correspondances croisées et multi-modèles se recalculent tout de suite",
    emptyTitle: "Aucune pièce trouvée pour cette recherche",
    emptyBody:
      "Essayez une autre référence, un nom de modèle (Changan, Jetour, Chery, BAIC) ou ajoutez la pièce au catalogue.",
    emptyAction: "Ajouter cette référence au stock",
    oemBadge: "OEM :",
    manufacturerBadge: "Fabricant :",
    salePrice: "Prix de vente atelier",
    purchasePrice: (price) => `Achat : ${price}`,
    stockOut: "RUPTURE",
    stockLow: "STOCK FAIBLE",
    stockIn: "EN MAGASIN",
    locationLabel: "Emplacement :",
    locationNone: "Non assigné",
    crossBlockTitle: "Références croisées (équivalences OEM et équipementiers)",
    crossCount: (count) => `${count} réf.`,
    crossEmpty: "Aucune référence croisée enregistrée pour l'instant.",
    crossDeleteTitle: "Supprimer cette référence croisée",
    compatBlockTitle: "Véhicules compatibles (interchangeabilité directe)",
    compatCount: (count) => `${count} modèle(s)`,
    compatEmpty: "Aucun véhicule associé pour l'instant.",
    compatDeleteTitle: "Supprimer cette compatibilité",
    actionAddCrossRef: "Ajouter réf. croisée ou véhicule",
    actionMovement: "Entrée / sortie de stock",
    actionPickForWorkshop: "Prélever pour l'atelier",
    filterSearchPlaceholder: "Tapez un modèle (Jetour Dashing), un nom (patin) ou une référence...",
    filterAllCategories: "Toutes les catégories",
    filterAllStock: "Tous les statuts de stock",
    filterInStock: "En stock uniquement",
    filterLowStock: "Stock faible",
    filterOutStock: "Rupture de stock",
    filterQuick: "Filtres rapides :",
    filterClear: "Effacer le filtre",
    colPartCode: "Code CARZONE",
    colOem: "Réf. OEM",
    colName: "Désignation",
    colCategory: "Catégorie",
    colLocation: "Emplacement",
    colCrossRefs: "Réf. croisées",
    colCompatible: "Véhicules compatibles",
    colStock: "Stock magasin",
    colSalePrice: "Prix de vente",
    colActions: "Actions",
    locationUndefined: "Non défini",
    rowStockButton: "± Stock",
    rowStockTitle: "Entrée ou sortie de stock",
    rowVehicles: (count) => `Voitures (${count})`,
    rowVehiclesTitle: "Voir et associer des voitures compatibles ou des références croisées",
    rowEditTitle: "Modifier la fiche pièce",
    auditTitle: "Journal des mouvements de stock",
    auditSubtitle:
      "Tout l'historique : entrées d'achat, sorties vers l'atelier pour les réparations, ajustements après comptage.",
    colDate: "Date et heure",
    colPart: "Pièce / réf.",
    colMovementType: "Type de mouvement",
    colQuantity: "Quantité",
    colTotal: "Montant total",
    colDocument: "Document / véhicule",
    colReason: "Motif / commentaire",
    colOperator: "Opérateur",
    operatorSystem: "Système",
    createTitle: "Nouvelle pièce détachée",
    createCodeLabel: "Code CARZONE (interne) *",
    createCodePlaceholder: "Ex. CZ-BRK-35011",
    createOemLabel: "Référence OEM constructeur",
    createOemPlaceholder: "Ex. 3501110-M01",
    createNameLabel: "Désignation de la pièce *",
    createNamePlaceholder: "Ex. jeu de plaquettes de frein avant",
    createCategoryLabel: "Catégorie",
    createManufacturerLabel: "Fabricant / marque",
    createManufacturerPlaceholder: "Ex. OEM Changan, Bosch",
    createUnitLabel: "Unité",
    createStockLabel: "Quantité en stock",
    createAlertLabel: "Seuil d'alerte",
    createLocationLabel: "Emplacement magasin",
    createLocationPlaceholder: "Ex. rayon B, casier 04",
    createPurchaseLabel: "Prix d'achat (FCFA)",
    createSaleLabel: "Prix de vente atelier (FCFA)",
    createCrossRefTitle: "Première référence croisée (équivalence)",
    createCrossRefBrandPlaceholder: "Marque équivalente (ex. JETOUR, BOSCH)",
    createCrossRefCodePlaceholder: "Code équivalent (ex. T15-3501080)",
    createCompatTitle: "Premier véhicule compatible certifié",
    createCompatBrandPlaceholder: "Marque voiture (ex. CHANGAN)",
    createCompatModelPlaceholder: "Modèle voiture (ex. CS35 PLUS)",
    createSubmit: "Créer et enregistrer",
    detailsTitle: (partNumber) => `Croisements · ${partNumber}`,
    detailsSubtitle: (name, qty, unit) => `${name} (stock : ${qty} ${unit})`,
    detailsAddCrossRefTitle: "Ajouter une référence croisée",
    detailsBrandLabel: "Marque / équipementier",
    detailsBrandPlaceholder: "Ex. JETOUR, BOSCH, CHERY, BREMBO",
    detailsCodeLabel: "Référence équivalente *",
    detailsCodePlaceholder: "Ex. T15-3501080 ou 0 986 494 567",
    detailsNotesPlaceholder: "Remarque technique (ex. même étrier, dimensions identiques)",
    detailsAddCrossRefSubmit: "Enregistrer la référence",
    detailsAddCompatTitle: "Associer un véhicule compatible",
    detailsVehicleBrandLabel: "Marque du véhicule",
    detailsVehicleBrandPlaceholder: "Ex. JETOUR, CHANGAN, BAIC",
    detailsVehicleModelLabel: "Modèle du véhicule *",
    detailsVehicleModelPlaceholder: "Ex. DASHING, CS55 PLUS, T5 EVO",
    detailsYearsPlaceholder: "Années (ex. 2022-2026)",
    detailsEnginePlaceholder: "Moteur (ex. 1.5T Turbo)",
    detailsPositionPlaceholder: "Position (ex. avant, arrière)",
    detailsAddCompatSubmit: "Associer ce véhicule",
    movementTitle: (partNumber) => `Mouvement de stock · ${partNumber}`,
    movementCurrentStock: "Stock actuel :",
    movementTypeLabel: "Type d'opération",
    movementQuantityLabel: "Quantité",
    movementDocumentLabel: "N° de document / référence",
    movementDocumentPlaceholder: "Ex. BC-2026-089, OR-042...",
    movementReasonLabel: "Motif",
    movementReasonPlaceholder: "Ex. arrivage conteneur Shanghai, entretien rapide...",
    movementSubmit: "Valider le mouvement",
    assignTitle: "Imputer la pièce à un ordre de réparation",
    assignPartLabel: "Pièce :",
    assignAvailableLabel: "Disponible en stock :",
    assignPriceLabel: "Prix de facturation :",
    assignEntryLabel: "Véhicule / OR de l'atelier *",
    assignEntryPlaceholder: "Choisir un dossier en cours à l'atelier",
    assignQuantityLabel: "Quantité à prélever",
    assignNotesLabel: "Observation du technicien",
    assignNotesPlaceholder: "Ex. remplacement plaquettes avant sous garantie, révision 20 000 km",
    assignSubmit: "Confirmer le prélèvement",
    cancel: "Annuler",
    close: "Fermer",
    category: {
      FREINAGE: "Freinage",
      FILTRATION: "Filtration",
      SUSPENSION: "Suspension",
      MOTEUR: "Moteur",
      ELECTRICITE: "Électricité",
      ECLAIRAGE: "Éclairage",
      CARROSSERIE: "Carrosserie",
      FLUIDES: "Fluides et huiles",
      AUTRE: "Autre",
    },
    unit: {
      JEU: "jeu",
      PIECE: "pièce",
      PAIRE: "paire",
      LITRE: "litre",
      KIT: "kit",
    },
    movementType: {
      ENTREE_ACHAT: "Entrée achat",
      SORTIE_ATELIER: "Sortie atelier",
      RETOUR_STOCK: "Retour en stock",
      AJUSTEMENT_INVENTAIRE: "Ajustement d'inventaire",
    },
  },
};

const en: WorkshopCopy = {
  dateLocale: "en-GB",
  status: {
    L: "Delivered",
    C: "In progress",
    AT: "Waiting for part",
    AC: "Waiting for customer approval",
    F: "Finished (ready)",
    D: "Diagnosis",
    ATD: "Waiting for payment",
    AF: "To do",
    HSAV: "Outside after-sales",
    ANN: "Cancelled",
  },
  paymentMode: {
    BC: "BC (purchase order)",
    MOBILE_MONEY: "Mobile Money",
    CASH: "Cash",
    PROFORMA: "Proforma",
    INTERNAL: "Internal",
  },
  clientType: { client: "Client", internal: "Internal" },
  checklistCategories: {
    MOTEUR: "Engine",
    FILTRATION: "Filtration",
    ELECTRICITE: "Electrical",
    FLUIDES: "Fluids",
    FREINAGE: "Braking",
    SUSPENSION: "Suspension",
    ECLAIRAGE: "Lighting",
    SCANNER: "Diagnostics",
  },
  checklistTasks: {
    "Vidange huile moteur": "Engine oil change",
    "Remplacer filtre à huile": "Replace oil filter",
    "Nettoyer et contrôler le filtre à air": "Clean and check the air filter",
    "Nettoyage et contrôler les batteries": "Clean and check the batteries",
    "Contrôle du niveau de liquide refroidissement": "Check the coolant level",
    "Contrôle du niveau d'huile à frein/embrayage": "Check the brake/clutch fluid level",
    "Contrôle du niveau d'huile boîte et pont": "Check the gearbox and axle oil level",
    "Contrôle/remplacer les garnitures de frein": "Check/replace the brake pads",
    "Contrôle état des courroies": "Check belt condition",
    "Contrôle de suspension et pneus": "Check suspension and tyres",
    "Contrôle éclairage et signalisation": "Check lights and signals",
    "Graissage générale": "General lubrication",
    "Pose du scanner": "Diagnostic scan",
    "Ajout de nettoyant injecteur": "Add injector cleaner",
    "Remplacer filtre à gasoil": "Replace the diesel filter",
    "Échange de filtre à air": "Replace the air filter",
    "Échange de filtre habitacle": "Replace the cabin filter",
    "Échange des bougies d'allumage": "Replace the spark plugs",
    "Entretien du système de freinage": "Service the braking system",
    "Vidange de liquide de frein": "Brake fluid flush",
    "Vidange de liquide de refroidissement": "Coolant flush",
    "Échange de filtre carburant essence": "Replace the petrol fuel filter",
  },
  list: {
    title: "Workshop visit history",
    subtitle:
      "The whole workshop in one place. Upload your old Excel workbooks as they are and they feed the company database.",
    importExcel: "Upload an Excel file",
    exportExcel: "Export to Excel (.xlsx)",
    template: "Template",
    templateTitle: "Download the official Excel template",
    partsLink: "Parts and cross-references",
    newEntry: "New entry",
    kpiTotal: "Recorded visits",
    kpiTotalHint: "In the database",
    kpiOngoing: "In progress (C)",
    kpiOngoingHint: "Vehicles in the workshop",
    kpiPart: "Waiting for part (AT)",
    kpiPartHint: "Parts on order",
    kpiApproval: "Waiting approval (AC)",
    kpiApprovalHint: "Quotes with the customer",
    kpiDelivered: "Delivered (L)",
    kpiDeliveredHint: "Validated exits",
    legendTitle: "Status key",
    heroBadge: "Spec sheets and tablet mode",
    heroBadgeHint: "Modelled on the two paper sheets used in the workshop",
    heroTitle: "Your vehicles in progress, sheet by sheet",
    heroSubtitle:
      "No more digging through table columns. Vehicles under repair are right here: open the touch form for the mechanic, or print the A4 sheet.",
    heroChip1: "Sheet 1: the repair order across 4 areas",
    heroChip2: "Sheet 2: 22 tasks, from 5,000 to 100,000 km",
    heroChip3: "Tablet: data entry and signatures",
    heroEmpty: "No vehicle in the workshop right now.",
    heroVehicleFallback: "Vehicle",
    heroClient: "Client:",
    heroMileage: "Odometer:",
    heroOngoing: "in progress",
    heroWorks: "Diagnosis and work:",
    heroTablet: "Tablet mode",
    heroTabletTitle: "Open the touch checklist and sign with a finger",
    heroFiche1: "Sheet 1 (A4)",
    heroFiche1Title: "Print sheet 1 (repair order, 4 areas)",
    heroFiche2: "Sheet 2 (A4)",
    heroFiche2Title: "Print sheet 2 (systematic maintenance, 22 points)",
    searchPlaceholder: "Search a plate, a client, a chassis or an order number",
    filterAllClientTypes: "All client types",
    filterClient: "Clients",
    filterInternal: "Internal",
    filterAllStatuses: "All statuses",
    colDate: "Date and time",
    colOr: "Order no.",
    colImmat: "Plate",
    colVehicle: "Make and model",
    colSheets: "Sheets and tablet",
    colChassis: "Chassis (VIN)",
    colMileage: "Mileage",
    colClient: "Client",
    colType: "Type",
    colPhone: "Phone",
    colReceptionist: "Receptionist",
    colStatus: "Status",
    colWorks: "Work done",
    colEndWorks: "Work finished",
    colExit: "Exit (date and time)",
    colDeliverer: "Delivered by",
    colPayment: "Payment",
    colActions: "Actions",
    emptyRow: "No visit matches these filters.",
    rowTablet: "Tablet",
    rowTabletTitle: "Open on tablet (checklist and signatures)",
    rowFiche1: "Sheet 1",
    rowFiche1Title: "Print the repair sheet (A4)",
    rowFiche2: "Sheet 2",
    rowFiche2Title: "Print the systematic maintenance sheet (A4)",
    rowEditTitle: "Edit this entry",
    rowDeleteTitle: "Delete",
    deleteConfirm: (immat) => `Delete the visit for vehicle ${immat}?`,
    errors: {
      deleteFailed: "The deletion failed. Please try again.",
      createFailed: "The entry could not be created. Check the fields and try again.",
      updateFailed: "The update failed. Please try again.",
      importFailed: "The import failed.",
    },
    importModal: {
      title: "Import a workshop Excel file",
      description:
        "Pick the workbook (.xlsx, .xls or .csv) holding the visit history. The app reads the official columns (order no., plate, chassis, client, status, work, exit date, payment) and fills the database.",
      choose: "Choose your after-sales Excel file",
      formats: "Accepted formats: .xlsx, .xls or .csv, 15 MB max",
      running: "Import running, the database is being built...",
      success: (count, sheet) => `Import complete: ${count} rows read from sheet "${sheet}".`,
      cancel: "Cancel",
      submit: "Start the import",
      submitting: "Working...",
    },
    createModal: {
      title: "Log a workshop visit",
      subtitle: (orderNumber) => `Order no. #${orderNumber}, assigned automatically`,
      clientLabel: "Client: existing record or new entry",
      autofillBadge: "Client data filled in",
      clientPlaceholder: (count) => `Pick an existing client (${count} on file) or type a new one`,
      newClientOption: "New client (manual entry)",
      telInline: "Tel:",
      autofillHint: (phone, brand, model) =>
        `Phone (${phone}) and vehicle (${brand} ${model}) filled in automatically.`,
      immatLabel: "Plate *",
      immatPlaceholder: "e.g. CJ 0290 RB",
      clientNameLabel: "Client name *",
      clientNamePlaceholder: "e.g. Presidential Palace",
      brandLabel: "Make",
      brandPlaceholder: "e.g. MITSUBISHI",
      modelLabel: "Model",
      modelPlaceholder: "e.g. OUTLANDER",
      mileageLabel: "Mileage (km)",
      mileagePlaceholder: "e.g. 37445",
      orLabel: "Order no.",
      orTag: "(primary key)",
      orTitle: "Order number assigned automatically, cannot be changed",
      orAuto: "Auto",
      entryDateLabel: "Entry date *",
      entryTimeLabel: "Entry time *",
      phoneLabel: "Client phone",
      phonePlaceholder: "e.g. 0167434244",
      receptionistLabel: "Receptionist *",
      receptionistPlaceholder: "Pick the receptionist",
      statusLabel: "Status *",
      worksLabel: "Work done or diagnosis",
      worksPlaceholder: "e.g. 20,000 km service",
      exitDateLabel: "Exit date",
      exitTimeLabel: "Exit time",
      paymentLabel: "Payment method",
      cancel: "Cancel",
      submit: "Save the entry",
      submitting: "Saving...",
    },
    editModal: {
      title: (immat) => `Edit the visit: ${immat}`,
      subtitle: (orderNumber) => `Order no. #${orderNumber} (primary key)`,
      immatLabel: "Plate *",
      clientLabel: "Client *",
      brandLabel: "Make",
      modelLabel: "Model",
      mileageLabel: "Mileage",
      orLabel: "Order no.",
      orLocked: "Read only",
      entryDateLabel: "Entry date",
      entryTimeLabel: "Entry time",
      phoneLabel: "Phone",
      receptionistLabel: "Receptionist",
      receptionistPlaceholder: "Pick the receptionist",
      statusLabel: "Status *",
      worksLabel: "Work done",
      endWorksLabel: "Work end date and time",
      endWorksPlaceholder: "e.g. 16/07/2026 17:00",
      durationLabel: "Execution time",
      durationPlaceholder: "e.g. 6 days",
      exitDateLabel: "Exit date",
      exitTimeLabel: "Exit time",
      paymentLabel: "Payment method",
      cancel: "Cancel",
      submit: "Save changes",
      submitting: "Updating...",
    },
  },
  tablet: {
    title: (orNumber) => `Workshop sheet · OR #${orNumber}`,
    client: "Client:",
    mileage: "Odometer:",
    fiche1: "Sheet 1",
    fiche1Title: "Preview and print sheet 1 (A4)",
    fiche2: "Sheet 2",
    fiche2Title: "Preview and print sheet 2 (A4)",
    tabChecklist: (tier) => `Checklist by tier (${tier} KM)`,
    tabIntervention: "Repair sheet (4 areas)",
    tabSignatures: "Touch signatures",
    tierTitle: "Service tier carried out",
    checkAll: "Check all",
    reset: "Reset",
    tierStandard: "Standard oil change",
    tierFilters: "Filters and oil",
    tierMajor: "Major service",
    matrixTitle: (count) => `Checklist (${count} check points)`,
    activeTier: (tier) => `Active tier: ${tier} KM`,
    observationPlaceholder: "Observation or measurement (e.g. 2.3 bar, pads 80% worn)",
    done: "Done",
    notDone: "Not done",
    notApplicable: "N/A",
    clearSignature: "Clear",
    clearConfirm: "Clear this signature that is already in place?",
    signHint: "Sign with a finger or a stylus, just above",
    faultLabel: "Fault reported at reception",
    faultPlaceholder: "Odd noises, symptoms, faults reported by the client...",
    pole1Title: "Engine and transmission",
    pole1Tag: "Engine area",
    pole1Placeholder: "Engine oil, filters, belt, gearbox, differential...",
    pole2Title: "Suspension and running gear",
    pole2Tag: "Chassis area",
    pole2Placeholder: "Shock absorbers, ball joints, arms, bushings, tyres, brakes...",
    pole3Title: "Electrical and scanner",
    pole3Tag: "OBD diagnosis",
    pole3Placeholder: "Diagnostic scan, battery, alternator, sensors, lights...",
    pole4Title: "Other (aircon, bodywork...)",
    pole4Tag: "Accessories",
    pole4Placeholder: "Aircon recharge, bodywork, locks, washing...",
    worksLabel: "Work done",
    worksPlaceholder: "The repairs the technician carried out...",
    partsLabel: "Parts used and to order",
    partsPlaceholder: "References requested from the storekeeper...",
    startLabel: "Start time",
    endLabel: "End time",
    technicianLabel: "Assigned technician",
    technicianPlaceholder: "Mechanic name",
    managerLabel: "Workshop manager",
    managerPlaceholder: "Workshop manager name",
    signatureNote:
      "These signatures follow the Carzone validation boxes. They are placed automatically on the printed A4 sheets and in the vehicle PDF archive.",
    padClient: "1. Client approval",
    padTechnician: "2. Technician",
    padManager: "3. Workshop manager",
    closeNoSave: "Close without saving",
    save: "Save the sheet",
    saveRunning: "Saving...",
    saveError: "The save failed. Check the data you entered.",
  },
  print: {
    intervention: {
      back: "Back to the workshop",
      badge: "Official A4 repair sheet",
      print: "Print / Export to PDF",
      companyActivity: "Multi-brand vehicle dealership",
      afterSales: "After-sales service and approved workshop",
      telLabel: "Tel:",
      address: "Maro-Militaire, Gbèdomidji, Cotonou",
      country: "Republic of Benin",
      docTitle: "Repair sheet",
      orLabel: "Repair order: #",
      entryDate: "Entry date:",
      brand: "Make:",
      model: "Model:",
      immat: "Plate:",
      date: "Date:",
      chassis: "S/N (chassis):",
      orNumber: "Sheet / OR no.:",
      clientPhone: "Client and phone:",
      phoneInline: "Tel:",
      mileageLabel: "Odometer (KM):",
      sectionFault: "1. Fault reported by the client (condition on arrival)",
      faultDefault: "Scheduled service and full inspection.",
      sectionTier: "2. Kilometre service type (recommended tiers)",
      sectionPoles: "3. Work by technical area (diagnosis and inspection)",
      poleMotor: "Engine transmission",
      poleMotorDefault: "Engine and transmission checked, levels and sealing within spec.",
      poleSuspension: "Suspension",
      poleSuspensionDefault: "Shock absorbers, ball joints, tyres and brakes checked.",
      poleElectricity: "Electrical",
      poleElectricityDefault: "Control unit scanned. Battery, alternator and lighting checked.",
      poleOthers: "Other",
      poleOthersDefault: "Air conditioning, bodywork and accessories within spec.",
      sectionWorks: "4. Work carried out by the workshop",
      worksDefault: "Service carried out to the workshop recommendations.",
      observationsTitle: "Technical observations",
      observationsDefault: "Vehicle returned clean and in good general condition.",
      partsTitle: "Parts to order / stores",
      partsDefault: "Genuine Carzone parts and consumables taken from the stores.",
      startLabel: "Start time:",
      endLabel: "End time:",
      technicianLabel: "Assigned technician:",
      technicianTeamDefault: "Carzone after-sales team",
      signaturesTitle: "Approvals and signatures (repair order and handover)",
      colClient: "Client",
      colTechnicians: "Technicians",
      colManager: "Workshop manager",
      clientAgreement: "Approved and received",
      clientSignature: "Client signature",
      clientSignatureAlt: "Client signature",
      technicianVisa: "Completion sign-off",
      technicianDefault: "Carzone technician",
      technicianSignature: "Mechanic sign-off",
      technicianSignatureAlt: "Technician signature",
      managerControl: "Quality check and release",
      managerDefault: "After-sales workshop manager",
      managerSignature: "Workshop stamp and sign-off",
      managerSignatureAlt: "Workshop manager signature",
      footer:
        "CARZONE SARL · Limited liability company · Official vehicle dealership · Carzone Ops after-sales system",
    },
    maintenance: {
      back: "Back to the workshop",
      badge: "Systematic maintenance matrix sheet (22 points)",
      print: "Print / Export to PDF",
      companyActivity: "Multi-brand vehicle dealership",
      afterSales: "After-sales service and approved maintenance",
      telLabel: "Tel:",
      docTitle: "Systematic maintenance sheet",
      sheetNumber: "Sheet no.: #",
      dateLabel: "Date:",
      brand: "Make:",
      model: "Model:",
      immat: "Plate:",
      date: "Date:",
      chassis: "S/N (chassis):",
      clientName: "Client name and phone:",
      mileageLabel: "Odometer:",
      oilLabel: "Oil type:",
      oilDefault: "5W-30 synthetic oil, manufacturer standard",
      hoursLabel: "Work hours:",
      start: "Start:",
      end: "End:",
      pvLabel: "Check report:",
      pvDefault: "PV-PASSED",
      colTier: "KM tier",
      colNumber: "No.",
      colTask: "Task to carry out",
      colDone: "Done",
      colNotDone: "Not done",
      colObservation: "Observation / measurement",
      observationsTitle: "Workshop manager notes and OBD-II diagnostic scan report",
      observationsDefault:
        "Control units within spec. Tyre pressure adjusted, fluid levels at MAX. Vehicle ready for delivery.",
      signaturesTitle: "Official approvals (handover and workshop release)",
      colClient: "Client",
      colTechnicians: "Technicians",
      colManager: "Workshop manager",
      clientAgreement: "Approved and received",
      clientSignature: "Client signature",
      clientSignatureAlt: "Client signature",
      technicianVisa: "Work conformity sign-off",
      technicianDefault: "Lead technician",
      technicianSignature: "Technician sign-off",
      technicianSignatureAlt: "Technician signature",
      managerVisa: "Workshop release and warranty sign-off",
      managerDefault: "After-sales workshop manager",
      managerSignature: "Workshop stamp and sign-off",
      managerSignatureAlt: "Workshop manager signature",
      footer:
        "CARZONE SARL · Manufacturer systematic maintenance sheet, certified compliant · Carzone Ops ERP",
    },
    fallbacks: {
      immatPending: "PENDING",
      immatInProgress: "IN PROGRESS",
      clientName: "Carzone client",
      faultDefault: "Scheduled maintenance.",
    },
  },
  parts: {
    title: "Spare parts and cross-references",
    subtitle:
      "CARZONE after-sales workshop and central stores · Multi-model matching (Changan, Jetour, Chery, BAIC, Forthing, BYD, Toyota)",
    newPart: "New part",
    kpiRefs: "Part references",
    kpiRefsHint: (units) => `${units} physical units in stock`,
    kpiCrossRefs: "Cross-references",
    kpiCrossRefsHint: "Active multi-brand equivalents",
    kpiValue: "Stores stock value",
    kpiValueHint: "Purchase cost tied up in the stores",
    kpiAlerts: "Restocking alerts",
    kpiAlertsOut: "out of stock",
    kpiAlertsLow: "running low",
    kpiAlertsHint: "Restock orders to place",
    guideTitle: "How it works:",
    guideFindTitle: "1. Search:",
    guideFind: "type a model (Jetour Dashing) or a part type (brake pad).",
    guideCheckTitle: "2. Check:",
    guideCheck: "the blue badges show which other vehicles the part fits.",
    guideActTitle: "3. Act:",
    guideAct: "use Stock in / out to update the count straight away.",
    tabInventory: (count) => `Stores and part stock (${count})`,
    tabCrossRefs: "Interchangeability sheets",
    tabMovements: "Stock in and out history",
    crossBadge: "CARZONE multi-brand parts interchangeability engine",
    crossTitle: "Find a cross-reference or a compatible vehicle",
    crossIntro:
      "Type a manufacturer OEM reference, an aftermarket reference (Bosch, Brembo, Valeo...) or a vehicle name (Jetour Dashing, Changan CS35, brake pad, 1.5T filter).",
    crossPlaceholder: "e.g. 3501110-M01, T15-3501080, Changan CS35, Jetour Dashing...",
    quickSearches: "Quick searches:",
    resultCount: (count) => `${count} result(s)`,
    resultsHint: "Cross and multi-model matches are recalculated instantly",
    emptyTitle: "No part found for this search",
    emptyBody:
      "Try another reference, a model name (Changan, Jetour, Chery, BAIC) or add the part to the catalogue.",
    emptyAction: "Add this reference to stock",
    oemBadge: "OEM:",
    manufacturerBadge: "Manufacturer:",
    salePrice: "Workshop sale price",
    purchasePrice: (price) => `Cost: ${price}`,
    stockOut: "OUT OF STOCK",
    stockLow: "LOW STOCK",
    stockIn: "IN STORES",
    locationLabel: "Location:",
    locationNone: "Not assigned",
    crossBlockTitle: "Cross-references (OEM and aftermarket equivalents)",
    crossCount: (count) => `${count} ref.`,
    crossEmpty: "No cross-reference saved yet.",
    crossDeleteTitle: "Delete this cross-reference",
    compatBlockTitle: "Compatible vehicles (direct interchangeability)",
    compatCount: (count) => `${count} model(s)`,
    compatEmpty: "No vehicle linked yet.",
    compatDeleteTitle: "Delete this compatibility",
    actionAddCrossRef: "Add cross-reference or vehicle",
    actionMovement: "Stock in / out",
    actionPickForWorkshop: "Draw for the workshop",
    filterSearchPlaceholder: "Type a model (Jetour Dashing), a name (brake pad) or a reference...",
    filterAllCategories: "All categories",
    filterAllStock: "All stock statuses",
    filterInStock: "In stock only",
    filterLowStock: "Low stock",
    filterOutStock: "Out of stock",
    filterQuick: "Quick filters:",
    filterClear: "Clear filter",
    colPartCode: "CARZONE code",
    colOem: "OEM ref.",
    colName: "Description",
    colCategory: "Category",
    colLocation: "Location",
    colCrossRefs: "Cross-refs",
    colCompatible: "Compatible vehicles",
    colStock: "Stores stock",
    colSalePrice: "Sale price",
    colActions: "Actions",
    locationUndefined: "Not set",
    rowStockButton: "± Stock",
    rowStockTitle: "Stock in or out",
    rowVehicles: (count) => `Vehicles (${count})`,
    rowVehiclesTitle: "View and link compatible vehicles or cross-references",
    rowEditTitle: "Edit the part record",
    auditTitle: "Stock movement log",
    auditSubtitle:
      "The full history: purchase intakes, issues to the workshop for repairs, adjustments after a count.",
    colDate: "Date and time",
    colPart: "Part / ref.",
    colMovementType: "Movement type",
    colQuantity: "Quantity",
    colTotal: "Total amount",
    colDocument: "Document / vehicle",
    colReason: "Reason / note",
    colOperator: "Operator",
    operatorSystem: "System",
    createTitle: "New spare part",
    createCodeLabel: "CARZONE code (internal) *",
    createCodePlaceholder: "e.g. CZ-BRK-35011",
    createOemLabel: "Manufacturer OEM reference",
    createOemPlaceholder: "e.g. 3501110-M01",
    createNameLabel: "Part description *",
    createNamePlaceholder: "e.g. front brake pad set",
    createCategoryLabel: "Category",
    createManufacturerLabel: "Manufacturer / brand",
    createManufacturerPlaceholder: "e.g. OEM Changan, Bosch",
    createUnitLabel: "Unit",
    createStockLabel: "Opening stock",
    createAlertLabel: "Restock alert level",
    createLocationLabel: "Stores location",
    createLocationPlaceholder: "e.g. aisle B, bin 04",
    createPurchaseLabel: "Purchase price (XOF)",
    createSaleLabel: "Workshop sale price (XOF)",
    createCrossRefTitle: "First cross-reference (equivalent)",
    createCrossRefBrandPlaceholder: "Equivalent brand (e.g. JETOUR, BOSCH)",
    createCrossRefCodePlaceholder: "Equivalent code (e.g. T15-3501080)",
    createCompatTitle: "First certified compatible vehicle",
    createCompatBrandPlaceholder: "Vehicle make (e.g. CHANGAN)",
    createCompatModelPlaceholder: "Vehicle model (e.g. CS35 PLUS)",
    createSubmit: "Create and save",
    detailsTitle: (partNumber) => `Cross-references · ${partNumber}`,
    detailsSubtitle: (name, qty, unit) => `${name} (stock: ${qty} ${unit})`,
    detailsAddCrossRefTitle: "Add a cross-reference",
    detailsBrandLabel: "Brand / aftermarket maker",
    detailsBrandPlaceholder: "e.g. JETOUR, BOSCH, CHERY, BREMBO",
    detailsCodeLabel: "Equivalent reference *",
    detailsCodePlaceholder: "e.g. T15-3501080 or 0 986 494 567",
    detailsNotesPlaceholder: "Technical note (e.g. same caliper, identical dimensions)",
    detailsAddCrossRefSubmit: "Save the cross-reference",
    detailsAddCompatTitle: "Link a compatible vehicle",
    detailsVehicleBrandLabel: "Vehicle make",
    detailsVehicleBrandPlaceholder: "e.g. JETOUR, CHANGAN, BAIC",
    detailsVehicleModelLabel: "Vehicle model *",
    detailsVehicleModelPlaceholder: "e.g. DASHING, CS55 PLUS, T5 EVO",
    detailsYearsPlaceholder: "Years (e.g. 2022-2026)",
    detailsEnginePlaceholder: "Engine (e.g. 1.5T Turbo)",
    detailsPositionPlaceholder: "Position (e.g. front, rear)",
    detailsAddCompatSubmit: "Link this vehicle",
    movementTitle: (partNumber) => `Stock movement · ${partNumber}`,
    movementCurrentStock: "Current stock:",
    movementTypeLabel: "Operation type",
    movementQuantityLabel: "Quantity",
    movementDocumentLabel: "Document no. / reference",
    movementDocumentPlaceholder: "e.g. BC-2026-089, OR-042...",
    movementReasonLabel: "Reason",
    movementReasonPlaceholder: "e.g. Shanghai container arrival, quick service...",
    movementSubmit: "Save the movement",
    assignTitle: "Charge the part to a repair order",
    assignPartLabel: "Part:",
    assignAvailableLabel: "Available in stock:",
    assignPriceLabel: "Billing price:",
    assignEntryLabel: "Workshop vehicle / OR *",
    assignEntryPlaceholder: "Pick an open workshop job",
    assignQuantityLabel: "Quantity to draw",
    assignNotesLabel: "Technician note",
    assignNotesPlaceholder: "e.g. front pads replaced under warranty, 20,000 km service",
    assignSubmit: "Confirm the draw",
    cancel: "Cancel",
    close: "Close",
    category: {
      FREINAGE: "Braking",
      FILTRATION: "Filtration",
      SUSPENSION: "Suspension",
      MOTEUR: "Engine",
      ELECTRICITE: "Electrical",
      ECLAIRAGE: "Lighting",
      CARROSSERIE: "Bodywork",
      FLUIDES: "Fluids and oils",
      AUTRE: "Other",
    },
    unit: {
      JEU: "set",
      PIECE: "piece",
      PAIRE: "pair",
      LITRE: "litre",
      KIT: "kit",
    },
    movementType: {
      ENTREE_ACHAT: "Purchase intake",
      SORTIE_ATELIER: "Workshop issue",
      RETOUR_STOCK: "Returned to stock",
      AJUSTEMENT_INVENTAIRE: "Stock count adjustment",
    },
  },
};

const zh: WorkshopCopy = {
  dateLocale: "zh-CN",
  status: {
    L: "已交车",
    C: "进行中",
    AT: "待配件",
    AC: "待客户确认",
    F: "完工(可取车)",
    D: "诊断中",
    ATD: "待付款",
    AF: "待处理",
    HSAV: "非售后",
    ANN: "已取消",
  },
  paymentMode: {
    BC: "BC(采购单)",
    MOBILE_MONEY: "Mobile Money",
    CASH: "现金",
    PROFORMA: "形式发票",
    INTERNAL: "内部",
  },
  clientType: { client: "客户", internal: "内部" },
  checklistCategories: {
    MOTEUR: "发动机",
    FILTRATION: "滤清",
    ELECTRICITE: "电气",
    FLUIDES: "油液",
    FREINAGE: "制动",
    SUSPENSION: "悬挂",
    ECLAIRAGE: "灯光",
    SCANNER: "诊断",
  },
  checklistTasks: {
    "Vidange huile moteur": "更换机油",
    "Remplacer filtre à huile": "更换机油滤清器",
    "Nettoyer et contrôler le filtre à air": "清洁并检查空气滤清器",
    "Nettoyage et contrôler les batteries": "清洁并检查电瓶",
    "Contrôle du niveau de liquide refroidissement": "检查冷却液液位",
    "Contrôle du niveau d'huile à frein/embrayage": "检查制动/离合器油液位",
    "Contrôle du niveau d'huile boîte et pont": "检查变速箱和差速器油液位",
    "Contrôle/remplacer les garnitures de frein": "检查/更换制动片",
    "Contrôle état des courroies": "检查传动带状态",
    "Contrôle de suspension et pneus": "检查悬挂与轮胎",
    "Contrôle éclairage et signalisation": "检查灯光与信号",
    "Graissage générale": "整车加注润滑油",
    "Pose du scanner": "接诊断仪检测",
    "Ajout de nettoyant injecteur": "添加喷油嘴清洁剂",
    "Remplacer filtre à gasoil": "更换柴油滤清器",
    "Échange de filtre à air": "更换空气滤清器",
    "Échange de filtre habitacle": "更换空调滤芯",
    "Échange des bougies d'allumage": "更换火花塞",
    "Entretien du système de freinage": "保养制动系统",
    "Vidange de liquide de frein": "更换制动液",
    "Vidange de liquide de refroidissement": "更换冷却液",
    "Échange de filtre carburant essence": "更换汽油滤清器",
  },
  list: {
    title: "售后车间进厂记录",
    subtitle: "车间事务都在这一个页面。旧 Excel 台账原样上传,直接写入公司数据库。",
    importExcel: "上传 Excel 文件",
    exportExcel: "导出 Excel(.xlsx)",
    template: "模板",
    templateTitle: "下载官方 Excel 模板",
    partsLink: "配件与交叉参考",
    newEntry: "新建进厂单",
    kpiTotal: "累计进厂",
    kpiTotalHint: "已入库记录",
    kpiOngoing: "进行中 (C)",
    kpiOngoingHint: "在车间车辆",
    kpiPart: "待配件 (AT)",
    kpiPartHint: "配件已下单",
    kpiApproval: "待确认 (AC)",
    kpiApprovalHint: "报价在客户手上",
    kpiDelivered: "已交车 (L)",
    kpiDeliveredHint: "放行已确认",
    legendTitle: "状态说明",
    heroBadge: "技术单据与平板模式",
    heroBadgeHint: "按车间两张纸质单据制作",
    heroTitle: "在修车辆,逐单跟进",
    heroSubtitle:
      "不用再翻表格找车。在修车辆都在这里:给技师开平板录入,或直接打印 A4 单据。",
    heroChip1: "单据 1:维修工单四大块",
    heroChip2: "单据 2:22 项作业,5000 至 10 万公里",
    heroChip3: "平板:录入与签名",
    heroEmpty: "车间目前没有车辆。",
    heroVehicleFallback: "车辆",
    heroClient: "客户:",
    heroMileage: "里程:",
    heroOngoing: "进行中",
    heroWorks: "诊断与作业:",
    heroTablet: "平板模式",
    heroTabletTitle: "打开触屏清单并在屏幕上签名",
    heroFiche1: "单据 1 (A4)",
    heroFiche1Title: "打印单据 1(维修工单,四大块)",
    heroFiche2: "单据 2 (A4)",
    heroFiche2Title: "打印单据 2(系统保养,22 项)",
    searchPlaceholder: "搜索车牌、客户、车架号或工单号",
    filterAllClientTypes: "全部客户类型",
    filterClient: "客户",
    filterInternal: "内部",
    filterAllStatuses: "全部状态",
    colDate: "日期与时间",
    colOr: "工单号",
    colImmat: "车牌",
    colVehicle: "品牌与车型",
    colSheets: "单据与平板",
    colChassis: "车架号 (VIN)",
    colMileage: "里程",
    colClient: "客户",
    colType: "类型",
    colPhone: "电话",
    colReceptionist: "接待员",
    colStatus: "状态",
    colWorks: "作业内容",
    colEndWorks: "完工时间",
    colExit: "出场(日期与时间)",
    colDeliverer: "交车人",
    colPayment: "结算方式",
    colActions: "操作",
    emptyRow: "没有符合这些条件的进厂记录。",
    rowTablet: "平板",
    rowTabletTitle: "在平板上打开(清单与签名)",
    rowFiche1: "单据 1",
    rowFiche1Title: "打印维修单 (A4)",
    rowFiche2: "单据 2",
    rowFiche2Title: "打印系统保养单 (A4)",
    rowEditTitle: "修改这条记录",
    rowDeleteTitle: "删除",
    deleteConfirm: (immat) => `删除车辆 ${immat} 的进厂记录？`,
    errors: {
      deleteFailed: "删除失败,请重试。",
      createFailed: "新建失败,请检查填写内容后重试。",
      updateFailed: "更新失败,请重试。",
      importFailed: "导入失败。",
    },
    importModal: {
      title: "导入车间 Excel 文件",
      description:
        "选择含进厂记录的表格文件(.xlsx、.xls 或 .csv)。系统会读取标准列(工单号、车牌、车架号、客户、状态、作业、出场日期、结算方式)并写入数据库。",
      choose: "选择售后 Excel 文件",
      formats: "支持格式:.xlsx、.xls、.csv,最大 15 MB",
      running: "正在导入,数据库正在整理...",
      success: (count, sheet) => `导入完成:工作表「${sheet}」共读取 ${count} 行。`,
      cancel: "取消",
      submit: "开始导入",
      submitting: "处理中...",
    },
    createModal: {
      title: "登记一次售后进厂",
      subtitle: (orderNumber) => `工单号 #${orderNumber},系统自动分配`,
      clientLabel: "客户:选已有档案或直接输入",
      autofillBadge: "已带出客户资料",
      clientPlaceholder: (count) => `选择已有客户(库中 ${count} 位)或新建`,
      newClientOption: "新客户(手动输入)",
      telInline: "电话:",
      autofillHint: (phone, brand, model) => `电话(${phone})与车辆(${brand} ${model})已自动填入。`,
      immatLabel: "车牌 *",
      immatPlaceholder: "例:CJ 0290 RB",
      clientNameLabel: "客户名称 *",
      clientNamePlaceholder: "例:总统府",
      brandLabel: "品牌",
      brandPlaceholder: "例:MITSUBISHI",
      modelLabel: "车型",
      modelPlaceholder: "例:OUTLANDER",
      mileageLabel: "里程(公里)",
      mileagePlaceholder: "例:37445",
      orLabel: "工单号",
      orTag: "(主键)",
      orTitle: "工单号由系统自动生成,不可修改",
      orAuto: "自动",
      entryDateLabel: "进厂日期 *",
      entryTimeLabel: "进厂时间 *",
      phoneLabel: "客户电话",
      phonePlaceholder: "例:0167434244",
      receptionistLabel: "接待员 *",
      receptionistPlaceholder: "选择接待员",
      statusLabel: "状态 *",
      worksLabel: "作业内容或诊断",
      worksPlaceholder: "例:2 万公里保养",
      exitDateLabel: "出场日期",
      exitTimeLabel: "出场时间",
      paymentLabel: "结算方式",
      cancel: "取消",
      submit: "保存进厂单",
      submitting: "保存中...",
    },
    editModal: {
      title: (immat) => `修改进厂记录:${immat}`,
      subtitle: (orderNumber) => `工单号 #${orderNumber}(主键)`,
      immatLabel: "车牌 *",
      clientLabel: "客户 *",
      brandLabel: "品牌",
      modelLabel: "车型",
      mileageLabel: "里程",
      orLabel: "工单号",
      orLocked: "不可修改",
      entryDateLabel: "进厂日期",
      entryTimeLabel: "进厂时间",
      phoneLabel: "电话",
      receptionistLabel: "接待员",
      receptionistPlaceholder: "选择接待员",
      statusLabel: "状态 *",
      worksLabel: "作业内容",
      endWorksLabel: "完工日期与时间",
      endWorksPlaceholder: "例:16/07/2026 17:00",
      durationLabel: "作业时长",
      durationPlaceholder: "例:6 天",
      exitDateLabel: "出场日期",
      exitTimeLabel: "出场时间",
      paymentLabel: "结算方式",
      cancel: "取消",
      submit: "保存修改",
      submitting: "更新中...",
    },
  },
  tablet: {
    title: (orNumber) => `车间工单 · 工单号 #${orNumber}`,
    client: "客户:",
    mileage: "里程:",
    fiche1: "单据 1",
    fiche1Title: "预览并打印单据 1 (A4)",
    fiche2: "单据 2",
    fiche2Title: "预览并打印单据 2 (A4)",
    tabChecklist: (tier) => `按里程清单(${tier} 公里)`,
    tabIntervention: "维修单(四大块)",
    tabSignatures: "触屏签名",
    tierTitle: "本次保养里程段",
    checkAll: "全部勾选",
    reset: "重置",
    tierStandard: "标准换油",
    tierFilters: "滤芯 + 换油",
    tierMajor: "大保养",
    matrixTitle: (count) => `检查清单(${count} 项)`,
    activeTier: (tier) => `当前里程段:${tier} 公里`,
    observationPlaceholder: "观察或测量值(例:2.3 bar,刹车片磨损 80%)",
    done: "已完成",
    notDone: "未完成",
    notApplicable: "不适用",
    clearSignature: "清除",
    clearConfirm: "确定清除已签好的签名？",
    signHint: "请在上方用手指或触控笔签名",
    faultLabel: "接车时客户反映的故障",
    faultPlaceholder: "客户提到的异响、症状或故障...",
    pole1Title: "发动机与变速箱",
    pole1Tag: "发动机块",
    pole1Placeholder: "换机油、滤芯、皮带、变速箱、差速器...",
    pole2Title: "悬挂与行走系统",
    pole2Tag: "底盘块",
    pole2Placeholder: "减震器、球头、摆臂、衬套、轮胎、制动...",
    pole3Title: "电气与诊断仪",
    pole3Tag: "OBD 诊断",
    pole3Placeholder: "电脑检测、电瓶、发电机、传感器、灯光...",
    pole4Title: "其他(空调、钣金...)",
    pole4Tag: "附件",
    pole4Placeholder: "空调加氟、车身、门锁、洗车...",
    worksLabel: "已完成作业",
    worksPlaceholder: "技师做的具体维修内容...",
    partsLabel: "已用与待订配件",
    partsPlaceholder: "向库房申请的配件编号...",
    startLabel: "开始时间",
    endLabel: "结束时间",
    technicianLabel: "负责技师",
    technicianPlaceholder: "技师姓名",
    managerLabel: "车间主管",
    managerPlaceholder: "车间主管姓名",
    signatureNote:
      "这些签名对应 Carzone 的确认栏,会自动印在 A4 单据上,也存入车辆 PDF 档案。",
    padClient: "1. 客户确认",
    padTechnician: "2. 施工技师",
    padManager: "3. 车间主管",
    closeNoSave: "不保存并关闭",
    save: "确认并保存",
    saveRunning: "保存中...",
    saveError: "保存失败,请检查填写内容。",
  },
  print: {
    intervention: {
      back: "返回车间",
      badge: "A4 正式维修单",
      print: "打印 / 导出 PDF",
      companyActivity: "多品牌汽车经销商",
      afterSales: "售后服务与授权车间",
      telLabel: "电话:",
      address: "Maro-Militaire, Gbèdomidji, 科托努",
      country: "贝宁共和国",
      docTitle: "维修单",
      orLabel: "维修工单:#",
      entryDate: "进厂日期:",
      brand: "品牌:",
      model: "车型:",
      immat: "车牌:",
      date: "日期:",
      chassis: "车架号:",
      orNumber: "单号 / 工单:",
      clientPhone: "客户与电话:",
      phoneInline: "电话:",
      mileageLabel: "里程(KM):",
      sectionFault: "1. 客户反映的故障(接车时记录)",
      faultDefault: "定期保养与全面检查。",
      sectionTier: "2. 里程保养类型(建议里程段)",
      sectionPoles: "3. 各技术块作业(诊断与检查)",
      poleMotor: "发动机变速箱",
      poleMotorDefault: "发动机与变速箱已检查,油位与密封正常。",
      poleSuspension: "悬挂",
      poleSuspensionDefault: "减震器、球头、轮胎与制动已检查。",
      poleElectricity: "电气",
      poleElectricityDefault: "电脑已检测。电瓶、发电机与灯光正常。",
      poleOthers: "其他",
      poleOthersDefault: "空调、车身与附件正常。",
      sectionWorks: "4. 车间已完成作业",
      worksDefault: "按车间规范完成保养。",
      observationsTitle: "技术说明",
      observationsDefault: "车辆已清洁,整体状况良好。",
      partsTitle: "待订配件 / 库房",
      partsDefault: "已从库房领用 Carzone 原厂配件与耗材。",
      startLabel: "开始时间:",
      endLabel: "结束时间:",
      technicianLabel: "负责技师:",
      technicianTeamDefault: "Carzone 售后团队",
      signaturesTitle: "确认与签名(维修工单与交车)",
      colClient: "客户",
      colTechnicians: "技师",
      colManager: "车间主管",
      clientAgreement: "同意并接车",
      clientSignature: "客户签名",
      clientSignatureAlt: "客户签名",
      technicianVisa: "施工确认",
      technicianDefault: "Carzone 技师",
      technicianSignature: "技师签字",
      technicianSignatureAlt: "技师签名",
      managerControl: "质检与放行",
      managerDefault: "售后车间主管",
      managerSignature: "车间印章与签字",
      managerSignatureAlt: "车间主管签名",
      footer: "CARZONE SARL · 有限责任公司 · 官方汽车经销商 · Carzone Ops 售后管理系统",
    },
    maintenance: {
      back: "返回车间",
      badge: "系统保养矩阵单(22 项)",
      print: "打印 / 导出 PDF",
      companyActivity: "多品牌汽车经销商",
      afterSales: "售后服务与授权保养",
      telLabel: "电话:",
      docTitle: "系统保养单",
      sheetNumber: "单号:#",
      dateLabel: "日期:",
      brand: "品牌:",
      model: "车型:",
      immat: "车牌:",
      date: "日期:",
      chassis: "车架号:",
      clientName: "客户名称与电话:",
      mileageLabel: "里程:",
      oilLabel: "机油类型:",
      oilDefault: "5W-30 合成机油,符合厂商标准",
      hoursLabel: "作业时间:",
      start: "开始:",
      end: "结束:",
      pvLabel: "检验单:",
      pvDefault: "PV-合格",
      colTier: "里程段",
      colNumber: "序号",
      colTask: "作业项目",
      colDone: "已完成",
      colNotDone: "未完成",
      colObservation: "观察 / 测量",
      observationsTitle: "车间主管说明与 OBD-II 诊断报告",
      observationsDefault: "电脑检测正常。胎压已调整,油液到 MAX 位。车辆可以交付。",
      signaturesTitle: "正式确认(交车与放行)",
      colClient: "客户",
      colTechnicians: "技师",
      colManager: "车间主管",
      clientAgreement: "同意并接车",
      clientSignature: "客户签名",
      clientSignatureAlt: "客户签名",
      technicianVisa: "作业合规确认",
      technicianDefault: "责任技师",
      technicianSignature: "技师签字",
      technicianSignatureAlt: "技师签名",
      managerVisa: "放行与保修签字",
      managerDefault: "售后车间主管",
      managerSignature: "车间印章与签字",
      managerSignatureAlt: "车间主管签名",
      footer: "CARZONE SARL · 厂商系统保养单,认证合规 · Carzone Ops ERP",
    },
    fallbacks: {
      immatPending: "待定",
      immatInProgress: "处理中",
      clientName: "Carzone 客户",
      faultDefault: "已安排定期保养。",
    },
  },
  parts: {
    title: "配件与交叉参考",
    subtitle:
      "CARZONE 售后车间与中心库房 · 多车型通用(Changan、Jetour、Chery、BAIC、Forthing、BYD、Toyota)",
    newPart: "新增配件",
    kpiRefs: "配件编号",
    kpiRefsHint: (units) => `库存实物 ${units} 件`,
    kpiCrossRefs: "交叉参考",
    kpiCrossRefsHint: "有效多品牌通用编号",
    kpiValue: "库房库存金额",
    kpiValueHint: "库房占用的采购成本",
    kpiAlerts: "补货提醒",
    kpiAlertsOut: "缺货",
    kpiAlertsLow: "偏低",
    kpiAlertsHint: "需要下的补货订单",
    guideTitle: "操作说明:",
    guideFindTitle: "1. 查找:",
    guideFind: "输入车型(Jetour Dashing)或配件类型(刹车片)。",
    guideCheckTitle: "2. 核对:",
    guideCheck: "蓝色标签显示这个配件还能装在哪些车上。",
    guideActTitle: "3. 操作:",
    guideAct: "点入库 / 出库,库存马上更新。",
    tabInventory: (count) => `库房与配件库存(${count})`,
    tabCrossRefs: "通用性对照单",
    tabMovements: "出入库记录",
    crossBadge: "CARZONE 多品牌配件通用查询",
    crossTitle: "查交叉参考或适配车型",
    crossIntro:
      "输入厂商 OEM 编号、配件商编号(Bosch、Brembo、Valeo...)或车型名称(Jetour Dashing、Changan CS35、刹车片、1.5T 滤芯)。",
    crossPlaceholder: "例:3501110-M01、T15-3501080、Changan CS35、Jetour Dashing...",
    quickSearches: "快速搜索:",
    resultCount: (count) => `${count} 条结果`,
    resultsHint: "交叉与多车型匹配即时重算",
    emptyTitle: "没有找到相关配件",
    emptyBody: "换一个编号、车型名称(Changan、Jetour、Chery、BAIC),或把配件加入目录。",
    emptyAction: "把这个编号加入库存",
    oemBadge: "OEM:",
    manufacturerBadge: "制造商:",
    salePrice: "车间销售价",
    purchasePrice: (price) => `采购价:${price}`,
    stockOut: "缺货",
    stockLow: "库存偏低",
    stockIn: "有货",
    locationLabel: "位置:",
    locationNone: "未分配",
    crossBlockTitle: "交叉参考(OEM 与配件商对照)",
    crossCount: (count) => `${count} 条`,
    crossEmpty: "暂无交叉参考。",
    crossDeleteTitle: "删除这条交叉参考",
    compatBlockTitle: "适配车型(可直接通用)",
    compatCount: (count) => `${count} 个车型`,
    compatEmpty: "暂无关联车型。",
    compatDeleteTitle: "删除这条适配关系",
    actionAddCrossRef: "添加交叉参考或车型",
    actionMovement: "入库 / 出库",
    actionPickForWorkshop: "给车间领用",
    filterSearchPlaceholder: "输入车型(Jetour Dashing)、名称(刹车片)或编号...",
    filterAllCategories: "全部分类",
    filterAllStock: "全部库存状态",
    filterInStock: "仅有货",
    filterLowStock: "库存偏低",
    filterOutStock: "缺货",
    filterQuick: "快速筛选:",
    filterClear: "清除筛选",
    colPartCode: "CARZONE 编码",
    colOem: "OEM 编号",
    colName: "名称",
    colCategory: "分类",
    colLocation: "位置",
    colCrossRefs: "交叉参考",
    colCompatible: "适配车型",
    colStock: "库房库存",
    colSalePrice: "销售价",
    colActions: "操作",
    locationUndefined: "未设置",
    rowStockButton: "± 库存",
    rowStockTitle: "入库或出库",
    rowVehicles: (count) => `车型(${count})`,
    rowVehiclesTitle: "查看并关联适配车型或交叉参考",
    rowEditTitle: "修改配件档案",
    auditTitle: "库存流水",
    auditSubtitle: "全部记录:采购入库、车间维修领用、盘点调整。",
    colDate: "日期与时间",
    colPart: "配件 / 编号",
    colMovementType: "变动类型",
    colQuantity: "数量",
    colTotal: "金额合计",
    colDocument: "单据 / 车辆",
    colReason: "原因 / 备注",
    colOperator: "操作人",
    operatorSystem: "系统",
    createTitle: "新增配件",
    createCodeLabel: "CARZONE 内部编码 *",
    createCodePlaceholder: "例:CZ-BRK-35011",
    createOemLabel: "厂商 OEM 编号",
    createOemPlaceholder: "例:3501110-M01",
    createNameLabel: "配件名称 *",
    createNamePlaceholder: "例:前刹车片套装",
    createCategoryLabel: "分类",
    createManufacturerLabel: "制造商 / 品牌",
    createManufacturerPlaceholder: "例:OEM Changan、Bosch",
    createUnitLabel: "单位",
    createStockLabel: "期初库存数量",
    createAlertLabel: "补货提醒阈值",
    createLocationLabel: "库房位置",
    createLocationPlaceholder: "例:B 排 04 号格",
    createPurchaseLabel: "采购价(中非法郎)",
    createSaleLabel: "车间销售价(中非法郎)",
    createCrossRefTitle: "第一条交叉参考(通用编号)",
    createCrossRefBrandPlaceholder: "对应品牌(例:JETOUR、BOSCH)",
    createCrossRefCodePlaceholder: "对应编号(例:T15-3501080)",
    createCompatTitle: "第一款确认适配车型",
    createCompatBrandPlaceholder: "汽车品牌(例:CHANGAN)",
    createCompatModelPlaceholder: "汽车车型(例:CS35 PLUS)",
    createSubmit: "创建并保存",
    detailsTitle: (partNumber) => `交叉参考 · ${partNumber}`,
    detailsSubtitle: (name, qty, unit) => `${name}(库存:${qty} ${unit})`,
    detailsAddCrossRefTitle: "添加交叉参考",
    detailsBrandLabel: "品牌 / 配件商",
    detailsBrandPlaceholder: "例:JETOUR、BOSCH、CHERY、BREMBO",
    detailsCodeLabel: "对应编号 *",
    detailsCodePlaceholder: "例:T15-3501080 或 0 986 494 567",
    detailsNotesPlaceholder: "技术备注(例:同一卡钳,尺寸一致)",
    detailsAddCrossRefSubmit: "保存交叉参考",
    detailsAddCompatTitle: "关联适配车型",
    detailsVehicleBrandLabel: "车辆品牌",
    detailsVehicleBrandPlaceholder: "例:JETOUR、CHANGAN、BAIC",
    detailsVehicleModelLabel: "车辆车型 *",
    detailsVehicleModelPlaceholder: "例:DASHING、CS55 PLUS、T5 EVO",
    detailsYearsPlaceholder: "年份(例:2022-2026)",
    detailsEnginePlaceholder: "发动机(例:1.5T Turbo)",
    detailsPositionPlaceholder: "位置(例:前、后)",
    detailsAddCompatSubmit: "关联这款车",
    movementTitle: (partNumber) => `库存变动 · ${partNumber}`,
    movementCurrentStock: "当前库存:",
    movementTypeLabel: "操作类型",
    movementQuantityLabel: "数量",
    movementDocumentLabel: "单据号 / 参考号",
    movementDocumentPlaceholder: "例:BC-2026-089、OR-042...",
    movementReasonLabel: "原因",
    movementReasonPlaceholder: "例:上海集装箱到货、快修使用...",
    movementSubmit: "保存变动",
    assignTitle: "把配件计入维修工单",
    assignPartLabel: "配件:",
    assignAvailableLabel: "库存可用:",
    assignPriceLabel: "计费价格:",
    assignEntryLabel: "车间车辆 / 工单 *",
    assignEntryPlaceholder: "选择在修工单",
    assignQuantityLabel: "领用数量",
    assignNotesLabel: "技师备注",
    assignNotesPlaceholder: "例:保修内更换前刹车片、2 万公里保养",
    assignSubmit: "确认领用",
    cancel: "取消",
    close: "关闭",
    category: {
      FREINAGE: "制动",
      FILTRATION: "滤清",
      SUSPENSION: "悬挂",
      MOTEUR: "发动机",
      ELECTRICITE: "电气",
      ECLAIRAGE: "灯光",
      CARROSSERIE: "车身",
      FLUIDES: "油液",
      AUTRE: "其他",
    },
    unit: {
      JEU: "套",
      PIECE: "件",
      PAIRE: "副",
      LITRE: "升",
      KIT: "套件",
    },
    movementType: {
      ENTREE_ACHAT: "采购入库",
      SORTIE_ATELIER: "车间领用",
      RETOUR_STOCK: "退回库存",
      AJUSTEMENT_INVENTAIRE: "盘点调整",
    },
  },
};

export const workshopCopy: Record<Locale, WorkshopCopy> = { fr, en, zh };
