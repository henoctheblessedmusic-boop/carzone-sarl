import type { Locale } from "@/lib/prefs";

/**
 * Copy du module Clients (liste, modales, fiche 360°).
 * Les codes techniques stockés en base (Entreprise, Particulier, PROFORMA,
 * TRANSMIS_ANATT, CIP_CNI...) ne bougent pas : seuls les libellés affichés
 * sont traduits, via les petits helpers en bas de fichier.
 */

export type ClientCategoryCopy = {
  company: string;
  individual: string;
  ngo: string;
  fleet: string;
  other: string;
};

export type ClientsCopy = {
  /** Dates localisées (fr-BJ, en-GB, zh-CN). */
  formatDate: (date: Date | string | null | undefined) => string;
  category: ClientCategoryCopy;
  /** Libellé d'une catégorie stockée ; renvoie la valeur brute si inconnue. */
  categoryLabel: (value: string | null) => string;
  status: {
    active: string;
    inactive: string;
  };
  /** Libellés des statuts métier (factures, devis, locations, bornes). */
  statusLabel: (code: string) => string;
  /** Type de facture : NORMALISEE / PROFORMA. */
  invoiceKindLabel: (code: string) => string;
  /** Type de location : LCD / LLD / LOA. */
  rentalTypeLabel: (code: string) => string;
  /** Type de pièce du dossier client. */
  docTypeLabel: (code: string) => string;
  documentStatus: {
    validated: string;
    transmitted: string;
  };
  stats: {
    totalTitle: string;
    totalHint: string;
    activeTitle: string;
    activeShare: (pct: number) => string;
    companiesTitle: string;
    companiesHint: string;
    individualsTitle: string;
    individualsHint: string;
  };
  search: {
    placeholder: string;
  };
  filters: {
    statusAll: string;
    statusActiveOnly: string;
    statusInactive: string;
    categoryAll: string;
    categoryCompanies: string;
    categoryIndividuals: string;
    categoryNgos: string;
    categoryFleets: string;
    categoryOther: string;
  };
  toolbar: {
    exportCsv: string;
    exportCsvTitle: string;
    newCustomer: string;
  };
  table: {
    index: string;
    contact: string;
    company: string;
    contactInfo: string;
    location: string;
    category: string;
    activity: string;
    status: string;
    actions: string;
    empty: string;
    ifuPrefix: string;
    missingIfu: string;
    addedOn: (date: string) => string;
    showroomVisit: string;
    quotesTooltip: (count: number) => string;
    invoicesTooltip: (count: number) => string;
    subscriptionsTooltip: (count: number) => string;
    noActivity: string;
    toggleTitle: string;
    viewTitle: string;
    documentsTitle: string;
    editTitle: string;
    deleteTitle: string;
  };
  createModal: {
    title: string;
    subtitle: string;
    contactLabel: string;
    contactPlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    ifuLabel: string;
    ifuHint: string;
    ifuPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    addressLabel: string;
    addressPlaceholder: string;
    cityLabel: string;
    categoryLabel: string;
    showroomNotesLabel: string;
    showroomNotesPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    cancel: string;
    submit: string;
  };
  editModal: {
    title: string;
    subtitle: string;
    contactLabel: string;
    companyLabel: string;
    ifuLabel: string;
    ifuHint: string;
    ifuPlaceholder: string;
    emailLabel: string;
    phoneLabel: string;
    addressLabel: string;
    addressPlaceholder: string;
    cityLabel: string;
    categoryLabel: string;
    showroomNotesLabel: string;
    showroomNotesPlaceholder: string;
    notesLabel: string;
    activeLabel: string;
    cancel: string;
    submit: string;
  };
  docsModal: {
    title: string;
    clientPrefix: string;
    ifuLabel: string;
    ifuMissing: string;
    phoneLabel: string;
    emailLabel: string;
    addressLabel: string;
    piecesTitle: (count: number) => string;
    piecesHint: string;
    empty: string;
    filePrefix: string;
    typePrefix: string;
    addedOn: (date: string) => string;
    notePrefix: string;
    downloadTitle: string;
    download: string;
    deleteTitle: string;
    uploadTitle: string;
    docTypeLabel: string;
    docTypeIdentity: string;
    docTypeIfu: string;
    docTypeResidence: string;
    docTypeLicense: string;
    docTypeCustoms: string;
    docTypeInvoice: string;
    docTypeOther: string;
    docTitleLabel: string;
    docTitlePlaceholder: string;
    fileLabel: string;
    uploading: string;
    upload: string;
    footerNote: string;
    close: string;
    transmitTitle: string;
    transmit: string;
    defaultTitle: string;
  };
  confirmations: {
    deleteDocument: string;
    uploadFirst: string;
    transferSuccess: string;
    deleteWithHistory: string;
    deletePermanent: (name: string) => string;
  };
  csv: {
    headers: string[];
  };
  detail: {
    pageTitle: (name: string) => string;
    backToList: string;
    accountActive: string;
    accountInactive: string;
    ifuPrefix: string;
    clientSince: (date: string) => string;
    quickNewQuote: string;
    quickDocuments: string;
    quickChargeRequest: string;
    showroomNotesTitle: string;
    kpi: {
      totalInvoiced: string;
      invoicesIssued: (count: number) => string;
      totalCollected: string;
      paymentsReceived: string;
      remainingDue: string;
      remainingDueHint: (hasDue: boolean) => string;
      chargingPlan: string;
      noPlan: string;
    };
    invoices: {
      title: (count: number) => string;
      viewAll: string;
      empty: string;
      headers: string[];
      payments: (count: number) => string;
    };
    quotes: {
      title: (count: number) => string;
      manage: string;
      empty: string;
      headers: string[];
      print: string;
    };
    documents: {
      title: (count: number) => string;
      add: string;
      empty: string;
      addedOn: (date: string) => string;
      download: string;
    };
    charging: {
      title: string;
      installTitle: (count: number) => string;
      installEmpty: string;
      powerLabel: string;
      vehicleLabel: string;
      installerQuotes: (count: number) => string;
      historyTitle: (count: number) => string;
      historyEmpty: string;
      kwhLine: (kwh: number, price: number) => string;
    };
    vehicles: {
      title: string;
      contract: (type: string) => string;
      noVin: string;
      rent: (amount: string | null) => string;
      period: (start: string, end: string) => string;
      fleet: (name: string) => string;
      fleetVehicle: string;
      plateLabel: string;
      driverLabel: string;
    };
    notAvailable: string;
  };
};

/** Table « code technique → libellé ». Une clé absente retombe sur le code brut. */
type LabelMap = Record<string, string | undefined>;

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

/** Clés stockées en base pour la catégorie client. */
const CATEGORY_KEYS: Record<string, keyof ClientCategoryCopy | undefined> = {
  Entreprise: "company",
  Particulier: "individual",
  "ONG / Diplomate": "ngo",
  Flotte: "fleet",
  Autre: "other",
};

function buildCategoryLabel(labels: ClientCategoryCopy): (value: string | null) => string {
  return (value) => {
    if (!value) return "";
    const key = CATEGORY_KEYS[value];
    return key ? labels[key] : value;
  };
}

function buildLabelMap(labels: LabelMap): (code: string) => string {
  return (code) => labels[code] ?? code;
}

const frStatusLabels: LabelMap = {
  BROUILLON: "Brouillon",
  EMISE: "Émise",
  PAYEE: "Payée",
  REGLEE: "Réglée",
  PAYEE_PARTIEL: "Payée en partie",
  EN_RETARD: "En retard",
  ANNULEE: "Annulée",
  ANNULE: "Annulé",
  ACTIF: "En cours",
  TERMINE: "Terminé",
  PROFORMA_ENVOYEE: "Proforma envoyée",
  COMMANDE_CONFIRMEE: "Commande confirmée",
  FACTURE_NORMALISEE: "Facture normalisée",
  ANNULEE_INTERNE: "Annulée (interne)",
  ENVOYE: "Envoyé",
  ACCEPTE: "Accepté",
  REJETE: "Rejeté",
  NOUVELLE: "Nouvelle",
  ENVOYEE_INSTALLATEURS: "Envoyée aux installateurs",
  DEVIS_RECUS: "Devis reçus",
  CHOISI: "Installateur choisi",
  REFUSE: "Refusé",
  SOUMIS: "Soumis",
  EN_ATTENTE: "En attente",
  OUVERTE: "Ouverte",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  VALIDE: "Validé",
  TRANSMIS_ANATT: "Transmis ANaTT",
};

const enStatusLabels: LabelMap = {
  BROUILLON: "Draft",
  EMISE: "Issued",
  PAYEE: "Paid",
  REGLEE: "Settled",
  PAYEE_PARTIEL: "Part-paid",
  EN_RETARD: "Overdue",
  ANNULEE: "Cancelled",
  ANNULE: "Cancelled",
  ACTIF: "Ongoing",
  TERMINE: "Ended",
  PROFORMA_ENVOYEE: "Proforma sent",
  COMMANDE_CONFIRMEE: "Order confirmed",
  FACTURE_NORMALISEE: "Invoiced",
  ANNULEE_INTERNE: "Cancelled (internal)",
  ENVOYE: "Sent",
  ACCEPTE: "Accepted",
  REJETE: "Rejected",
  NOUVELLE: "New",
  ENVOYEE_INSTALLATEURS: "Sent to installers",
  DEVIS_RECUS: "Quotes received",
  CHOISI: "Installer selected",
  REFUSE: "Declined",
  SOUMIS: "Submitted",
  EN_ATTENTE: "Pending",
  OUVERTE: "Open",
  EN_COURS: "In progress",
  TERMINEE: "Completed",
  VALIDE: "Validated",
  TRANSMIS_ANATT: "Sent to ANaTT",
};

const zhStatusLabels: LabelMap = {
  BROUILLON: "草稿",
  EMISE: "已开具",
  PAYEE: "已付款",
  REGLEE: "已结清",
  PAYEE_PARTIEL: "部分付款",
  EN_RETARD: "逾期",
  ANNULEE: "已取消",
  ANNULE: "已取消",
  ACTIF: "进行中",
  TERMINE: "已结束",
  PROFORMA_ENVOYEE: "形式发票已发出",
  COMMANDE_CONFIRMEE: "订单已确认",
  FACTURE_NORMALISEE: "已开正式发票",
  ANNULEE_INTERNE: "已取消(内部)",
  ENVOYE: "已发送",
  ACCEPTE: "已接受",
  REJETE: "已拒绝",
  NOUVELLE: "新申请",
  ENVOYEE_INSTALLATEURS: "已发给安装商",
  DEVIS_RECUS: "已收到报价",
  CHOISI: "已选定安装商",
  REFUSE: "已拒绝",
  SOUMIS: "已提交",
  EN_ATTENTE: "待处理",
  OUVERTE: "未结",
  EN_COURS: "进行中",
  TERMINEE: "已完成",
  VALIDE: "已通过",
  TRANSMIS_ANATT: "已提交 ANaTT",
};

const frDocTypeLabels: LabelMap = {
  CIP_CNI: "CIP ou CNI (identité)",
  ATTESTATION_IFU: "Attestation IFU (fiscal)",
  JUSTIFICATIF_DOMICILE: "Justificatif de domicile",
  PERMIS_CONDUIRE: "Permis de conduire",
  CERTIFICAT_CONFORMITE: "Conformité ou dédouanement port",
  FACTURE_OU_DEVIS: "Facture de vente ou proforma",
  AUTRE: "Autre pièce",
};

const enDocTypeLabels: LabelMap = {
  CIP_CNI: "CIP or national ID (identity)",
  ATTESTATION_IFU: "IFU certificate (tax)",
  JUSTIFICATIF_DOMICILE: "Proof of address",
  PERMIS_CONDUIRE: "Driving licence",
  CERTIFICAT_CONFORMITE: "Compliance or port clearance",
  FACTURE_OU_DEVIS: "Sales invoice or proforma",
  AUTRE: "Other document",
};

const zhDocTypeLabels: LabelMap = {
  CIP_CNI: "CIP 或身份证(身份)",
  ATTESTATION_IFU: "IFU 证明(税务)",
  JUSTIFICATIF_DOMICILE: "住址证明",
  PERMIS_CONDUIRE: "驾驶证",
  CERTIFICAT_CONFORMITE: "合规或港口清关文件",
  FACTURE_OU_DEVIS: "销售发票或形式发票",
  AUTRE: "其他资料",
};

const frInvoiceKindLabels: LabelMap = {
  NORMALISEE: "Facture normalisée",
  PROFORMA: "Proforma",
};

const enInvoiceKindLabels: LabelMap = {
  NORMALISEE: "Normalised invoice",
  PROFORMA: "Proforma",
};

const zhInvoiceKindLabels: LabelMap = {
  NORMALISEE: "正式发票",
  PROFORMA: "形式发票",
};

const frRentalTypeLabels: LabelMap = {
  LCD: "LCD · courte durée",
  LLD: "LLD · longue durée",
  LOA: "LOA · option d'achat",
};

const enRentalTypeLabels: LabelMap = {
  LCD: "LCD · short term",
  LLD: "LLD · long term",
  LOA: "LOA · lease with purchase option",
};

const zhRentalTypeLabels: LabelMap = {
  LCD: "LCD · 短租",
  LLD: "LLD · 长租",
  LOA: "LOA · 含购买权",
};

const frCategory: ClientCategoryCopy = {
  company: "Entreprise",
  individual: "Particulier",
  ngo: "ONG / Diplomate",
  fleet: "Flotte",
  other: "Autre",
};

const enCategory: ClientCategoryCopy = {
  company: "Company",
  individual: "Individual",
  ngo: "NGO / Diplomat",
  fleet: "Fleet",
  other: "Other",
};

const zhCategory: ClientCategoryCopy = {
  company: "企业",
  individual: "个人",
  ngo: "非政府组织 / 外交机构",
  fleet: "车队",
  other: "其他",
};

const fr: ClientsCopy = {
  formatDate: dateFormatter("fr-BJ"),
  category: frCategory,
  categoryLabel: buildCategoryLabel(frCategory),
  status: {
    active: "Actif",
    inactive: "Inactif",
  },
  statusLabel: buildLabelMap(frStatusLabels),
  invoiceKindLabel: buildLabelMap(frInvoiceKindLabels),
  rentalTypeLabel: buildLabelMap(frRentalTypeLabels),
  docTypeLabel: buildLabelMap(frDocTypeLabels),
  documentStatus: {
    validated: "Validé",
    transmitted: "Transmis ANaTT",
  },
  stats: {
    totalTitle: "Total clients",
    totalHint: "Base clients CARZONE Motors",
    activeTitle: "Clients actifs",
    activeShare: (pct) => `${pct}% du portefeuille`,
    companiesTitle: "Entreprises et flottes",
    companiesHint: "Comptes professionnels",
    individualsTitle: "Particuliers",
    individualsHint: "Acheteurs individuels",
  },
  search: {
    placeholder: "Nom, société, e-mail ou téléphone...",
  },
  filters: {
    statusAll: "Tous les statuts",
    statusActiveOnly: "Actifs seulement",
    statusInactive: "Inactifs",
    categoryAll: "Toutes les catégories",
    categoryCompanies: "Entreprises",
    categoryIndividuals: "Particuliers",
    categoryNgos: "ONG et diplomates",
    categoryFleets: "Flottes",
    categoryOther: "Autre",
  },
  toolbar: {
    exportCsv: "Exporter en CSV",
    exportCsvTitle: "Télécharger la liste au format CSV",
    newCustomer: "Nouveau client",
  },
  table: {
    index: "N°",
    contact: "Contact principal",
    company: "Entreprise",
    contactInfo: "Coordonnées",
    location: "Localisation",
    category: "Catégorie",
    activity: "Activité liée",
    status: "Statut",
    actions: "Actions",
    empty: "Aucun client ne correspond à ces critères. Élargissez la recherche.",
    ifuPrefix: "IFU : ",
    missingIfu: "⚠️ Sans IFU",
    addedOn: (date) => `Ajouté le ${date}`,
    showroomVisit: "🏷️ Visite showroom",
    quotesTooltip: (count) => (count === 1 ? "1 devis" : `${count} devis`),
    invoicesTooltip: (count) => (count === 1 ? "1 facture" : `${count} factures`),
    subscriptionsTooltip: (count) =>
      count === 1 ? "1 abonnement borne" : `${count} abonnements borne`,
    noActivity: "Nouveau",
    toggleTitle: "Cliquer pour changer le statut",
    viewTitle: "Fiche 360°",
    documentsTitle: "Pièces du dossier et immatriculation (CIP, IFU...)",
    editTitle: "Modifier la fiche",
    deleteTitle: "Supprimer ou désactiver",
  },
  createModal: {
    title: "Nouveau client",
    subtitle: "Un particulier ou une société, tout se saisit ici.",
    contactLabel: "Contact principal",
    contactPlaceholder: "Ex : Augustin JOHNSON, Dr Nadine HOUVI",
    companyLabel: "Entreprise / Raison sociale (facultatif)",
    companyPlaceholder: "Ex : Impact Plus Consulting, DHL Bénin, J-J Telecom",
    ifuLabel: "N° IFU Bénin",
    ifuHint: "(fiscalité MECEF et immatriculation ANaTT)",
    ifuPlaceholder: "Ex : 0201910815523 (13 chiffres)",
    emailLabel: "E-mail",
    emailPlaceholder: "contact@domaine.bj",
    phoneLabel: "Téléphone",
    phonePlaceholder: "+229 01 48 65 50 40",
    addressLabel: "Adresse et quartier (showroom ou domicile)",
    addressPlaceholder: "Ex : Haie Vive, Rue 340, Cotonou",
    cityLabel: "Ville",
    categoryLabel: "Catégorie",
    showroomNotesLabel: "Visite showroom et projet",
    showroomNotesPlaceholder:
      "Passé au showroom le 08/10, hésite entre BYD Dolphin et Song Plus, devis demandé avec borne...",
    notesLabel: "Notes et préférences",
    notesPlaceholder: "Intérêt pour l'électrique, besoin d'une borne à la maison...",
    cancel: "Annuler",
    submit: "Enregistrer le client",
  },
  editModal: {
    title: "Modifier le client",
    subtitle: "Coordonnées et statut du compte",
    contactLabel: "Contact principal",
    companyLabel: "Entreprise / Raison sociale",
    ifuLabel: "N° IFU Bénin",
    ifuHint: "(fiscalité MECEF et immatriculation ANaTT)",
    ifuPlaceholder: "Ex : 0201910815523 (13 chiffres)",
    emailLabel: "E-mail",
    phoneLabel: "Téléphone",
    addressLabel: "Adresse et quartier",
    addressPlaceholder: "Ex : Haie Vive, Rue 340, Cotonou",
    cityLabel: "Ville",
    categoryLabel: "Catégorie",
    showroomNotesLabel: "Visite showroom et échanges",
    showroomNotesPlaceholder:
      "Passé au showroom le 08/10, intéressé par BYD Song Plus ou Dolphin, essai routier souhaité...",
    notesLabel: "Notes et préférences",
    activeLabel: "Client actif (nouvelles opportunités, devis et commandes autorisés)",
    cancel: "Annuler",
    submit: "Enregistrer les modifications",
  },
  docsModal: {
    title: "Documents client et immatriculation (ANaTT)",
    clientPrefix: "Client : ",
    ifuLabel: "N° IFU Bénin : ",
    ifuMissing: "⚠️ Non renseigné",
    phoneLabel: "Téléphone : ",
    emailLabel: "E-mail : ",
    addressLabel: "Adresse : ",
    piecesTitle: (count) => `Pièces du dossier (${count})`,
    piecesHint: "CIP, IFU, domicile, permis, conformité",
    empty: "Aucune pièce au dossier pour l'instant.",
    filePrefix: "Fichier : ",
    typePrefix: "Type : ",
    addedOn: (date) => `Ajouté le ${date}`,
    notePrefix: "Note : ",
    downloadTitle: "Ouvrir ou télécharger la pièce",
    download: "Télécharger",
    deleteTitle: "Supprimer la pièce",
    uploadTitle: "Ajouter une pièce au dossier",
    docTypeLabel: "Type de document *",
    docTypeIdentity: "🆔 CIP ou CNI (identité)",
    docTypeIfu: "📄 Attestation IFU (fiscal)",
    docTypeResidence: "🏠 Justificatif de domicile",
    docTypeLicense: "🚗 Permis de conduire",
    docTypeCustoms: "🚢 Conformité ou dédouanement port",
    docTypeInvoice: "📑 Facture de vente ou proforma",
    docTypeOther: "📎 Autre pièce",
    docTitleLabel: "Intitulé du document",
    docTitlePlaceholder: "Ex : CIP M. Dossou, IFU 020...",
    fileLabel: "Fichier (PDF, JPG ou PNG) *",
    uploading: "Envoi en cours...",
    upload: "Téléverser le document",
    footerNote: "Dossier vérifié par CARZONE Motors Showroom",
    close: "Fermer",
    transmitTitle: "Marquer le dossier complet et l'envoyer pour immatriculation",
    transmit: "Transmettre au service Immatriculation (ANaTT)",
    defaultTitle: "Document client",
  },
  confirmations: {
    deleteDocument: "Supprimer cette pièce ?",
    uploadFirst: "Ajoutez d'abord une pièce au dossier (CIP, IFU...).",
    transferSuccess: "Dossier et pièces KYC transmis au service Immatriculation (ANaTT).",
    deleteWithHistory:
      "Ce client a des devis ou des factures. On le désactive pour garder l'historique comptable. On confirme ?",
    deletePermanent: (name) => `Supprimer définitivement le client « ${name} » ?`,
  },
  csv: {
    headers: [
      "ID",
      "Contact",
      "Entreprise",
      "N° IFU",
      "E-mail",
      "Téléphone",
      "Adresse",
      "Ville",
      "Catégorie",
      "Notes showroom",
      "Documents",
      "Statut",
      "Devis",
      "Factures",
      "Date de création",
    ],
  },
  detail: {
    pageTitle: (name) => `Fiche client : ${name}`,
    backToList: "Retour à la liste clients",
    accountActive: "Compte actif",
    accountInactive: "Compte inactif",
    ifuPrefix: "IFU : ",
    clientSince: (date) => `Client depuis le ${date}`,
    quickNewQuote: "Nouveau devis",
    quickDocuments: "Pièces du dossier",
    quickChargeRequest: "Demande de borne",
    showroomNotesTitle: "Visite showroom et échanges commerciaux",
    kpi: {
      totalInvoiced: "Total facturé",
      invoicesIssued: (count) =>
        count === 1 ? "1 facture émise" : `${count} factures émises`,
      totalCollected: "Total encaissé",
      paymentsReceived: "Règlements reçus",
      remainingDue: "Reste à payer",
      remainingDueHint: (hasDue) =>
        hasDue ? "Factures en attente ou en retard" : "Compte à jour",
      chargingPlan: "Abonnement borne",
      noPlan: "Aucun abonnement (tarif public)",
    },
    invoices: {
      title: (count) => `Factures et règlements (${count})`,
      viewAll: "Voir toutes les factures",
      empty: "Pas encore de facture pour ce client.",
      headers: [
        "Numéro",
        "Type",
        "Échéance",
        "Total facturé",
        "Déjà payé",
        "Solde restant",
        "Statut",
        "Règlements",
      ],
      payments: (count) => (count === 1 ? "1 paiement" : `${count} paiements`),
    },
    quotes: {
      title: (count) => `Devis et proformas (${count})`,
      manage: "Gérer les devis",
      empty: "Aucun devis ni proforma pour ce client.",
      headers: [
        "N° proforma",
        "Date d'émission",
        "Lignes / véhicules",
        "Total XOF",
        "Validité",
        "Statut",
        "Action",
      ],
      print: "Imprimer",
    },
    documents: {
      title: (count) => `Pièces et immatriculation ANaTT (${count})`,
      add: "Ajouter des pièces",
      empty:
        "Aucune pièce au dossier (CIP, attestation IFU, justificatif de domicile). On peut en ajouter depuis la liste des clients.",
      addedOn: (date) => `Ajouté le ${date}`,
      download: "Télécharger",
    },
    charging: {
      title: "Bornes et recharge",
      installTitle: (count) => `Installations demandées, domicile et entreprise (${count})`,
      installEmpty: "Aucune demande d'installation pour l'instant.",
      powerLabel: "Puissance : ",
      vehicleLabel: "Véhicule : ",
      installerQuotes: (count) =>
        count === 1
          ? "1 devis reçu d'un installateur partenaire"
          : `${count} devis reçus d'installateurs partenaires`,
      historyTitle: (count) => `Recharges aux bornes CARZONE (${count})`,
      historyEmpty: "Aucune recharge enregistrée.",
      kwhLine: (kwh, price) => `${kwh} kWh délivrés à ${price} XOF/kWh`,
    },
    vehicles: {
      title: "Véhicules, flotte et locations",
      contract: (type) => `Contrat ${type}`,
      noVin: "VIN non renseigné",
      rent: (amount) => (amount ? `Loyer : ${amount}/mois` : "Loyer : N/A"),
      period: (start, end) => `Du ${start} au ${end}`,
      fleet: (name) => `Flotte : ${name}`,
      fleetVehicle: "Véhicule de flotte",
      plateLabel: "Immatriculation : ",
      driverLabel: "Chauffeur : ",
    },
    notAvailable: "N/A",
  },
};

const en: ClientsCopy = {
  formatDate: dateFormatter("en-GB"),
  category: enCategory,
  categoryLabel: buildCategoryLabel(enCategory),
  status: {
    active: "Active",
    inactive: "Inactive",
  },
  statusLabel: buildLabelMap(enStatusLabels),
  invoiceKindLabel: buildLabelMap(enInvoiceKindLabels),
  rentalTypeLabel: buildLabelMap(enRentalTypeLabels),
  docTypeLabel: buildLabelMap(enDocTypeLabels),
  documentStatus: {
    validated: "Validated",
    transmitted: "Sent to ANaTT",
  },
  stats: {
    totalTitle: "Total customers",
    totalHint: "CARZONE Motors customer base",
    activeTitle: "Active customers",
    activeShare: (pct) => `${pct}% of the portfolio`,
    companiesTitle: "Companies & fleets",
    companiesHint: "Business accounts",
    individualsTitle: "Individuals",
    individualsHint: "Walk-in buyers",
  },
  search: {
    placeholder: "Name, company, email or phone...",
  },
  filters: {
    statusAll: "All statuses",
    statusActiveOnly: "Active only",
    statusInactive: "Inactive",
    categoryAll: "All categories",
    categoryCompanies: "Companies",
    categoryIndividuals: "Individuals",
    categoryNgos: "NGOs & diplomats",
    categoryFleets: "Fleets",
    categoryOther: "Other",
  },
  toolbar: {
    exportCsv: "Export CSV",
    exportCsvTitle: "Download the list as a CSV file",
    newCustomer: "New customer",
  },
  table: {
    index: "No.",
    contact: "Main contact",
    company: "Company",
    contactInfo: "Contact details",
    location: "Location",
    category: "Category",
    activity: "Linked activity",
    status: "Status",
    actions: "Actions",
    empty: "No customer matches these filters. Try widening the search.",
    ifuPrefix: "IFU: ",
    missingIfu: "⚠️ No IFU",
    addedOn: (date) => `Added ${date}`,
    showroomVisit: "🏷️ Showroom visit",
    quotesTooltip: (count) => (count === 1 ? "1 quote" : `${count} quotes`),
    invoicesTooltip: (count) => (count === 1 ? "1 invoice" : `${count} invoices`),
    subscriptionsTooltip: (count) =>
      count === 1 ? "1 charging plan" : `${count} charging plans`,
    noActivity: "New",
    toggleTitle: "Click to switch the status",
    viewTitle: "360° record",
    documentsTitle: "Documents & registration file (CIP, IFU...)",
    editTitle: "Edit",
    deleteTitle: "Delete or deactivate",
  },
  createModal: {
    title: "New customer",
    subtitle: "An individual or a company, it all starts here.",
    contactLabel: "Main contact",
    contactPlaceholder: "e.g. Augustin JOHNSON, Dr Nadine HOUVI",
    companyLabel: "Company / registered name (optional)",
    companyPlaceholder: "e.g. Impact Plus Consulting, DHL Benin, J-J Telecom",
    ifuLabel: "Benin IFU number",
    ifuHint: "(MECEF tax and ANaTT registration)",
    ifuPlaceholder: "e.g. 0201910815523 (13 digits)",
    emailLabel: "Email",
    emailPlaceholder: "contact@domain.bj",
    phoneLabel: "Phone",
    phonePlaceholder: "+229 01 48 65 50 40",
    addressLabel: "Street address & district (showroom or home)",
    addressPlaceholder: "e.g. Haie Vive, Rue 340, Cotonou",
    cityLabel: "City",
    categoryLabel: "Category",
    showroomNotesLabel: "Showroom visit & project",
    showroomNotesPlaceholder:
      "Came in on 08/10, torn between a BYD Dolphin and a Song Plus, asked for a quote with a charger...",
    notesLabel: "Notes & preferences",
    notesPlaceholder: "Interested in electric, needs a home charger...",
    cancel: "Cancel",
    submit: "Save customer",
  },
  editModal: {
    title: "Edit customer",
    subtitle: "Contact details and account status",
    contactLabel: "Main contact",
    companyLabel: "Company / registered name",
    ifuLabel: "Benin IFU number",
    ifuHint: "(MECEF tax and ANaTT registration)",
    ifuPlaceholder: "e.g. 0201910815523 (13 digits)",
    emailLabel: "Email",
    phoneLabel: "Phone",
    addressLabel: "Street address & district",
    addressPlaceholder: "e.g. Haie Vive, Rue 340, Cotonou",
    cityLabel: "City",
    categoryLabel: "Category",
    showroomNotesLabel: "Showroom visit & notes",
    showroomNotesPlaceholder:
      "Came in on 08/10, looking at a BYD Song Plus or Dolphin, test drive requested...",
    notesLabel: "Notes & preferences",
    activeLabel: "Active customer (new opportunities, quotes and orders allowed)",
    cancel: "Cancel",
    submit: "Save changes",
  },
  docsModal: {
    title: "Customer documents & registration (ANaTT)",
    clientPrefix: "Customer: ",
    ifuLabel: "IFU number: ",
    ifuMissing: "⚠️ Not provided",
    phoneLabel: "Phone: ",
    emailLabel: "Email: ",
    addressLabel: "Address: ",
    piecesTitle: (count) => `File documents (${count})`,
    piecesHint: "CIP, IFU, proof of address, licence, compliance",
    empty: "No document on file for this customer yet.",
    filePrefix: "File: ",
    typePrefix: "Type: ",
    addedOn: (date) => `Added ${date}`,
    notePrefix: "Note: ",
    downloadTitle: "Open or download the document",
    download: "Download",
    deleteTitle: "Delete document",
    uploadTitle: "Add a document to the file",
    docTypeLabel: "Document type *",
    docTypeIdentity: "🆔 CIP or national ID (identity)",
    docTypeIfu: "📄 IFU certificate (tax)",
    docTypeResidence: "🏠 Proof of address",
    docTypeLicense: "🚗 Driving licence",
    docTypeCustoms: "🚢 Compliance or port clearance",
    docTypeInvoice: "📑 Sales invoice or proforma",
    docTypeOther: "📎 Other document",
    docTitleLabel: "Document title",
    docTitlePlaceholder: "e.g. CIP Mr Dossou, IFU 020...",
    fileLabel: "File (PDF, JPG or PNG) *",
    uploading: "Uploading...",
    upload: "Upload document",
    footerNote: "File checked by CARZONE Motors Showroom",
    close: "Close",
    transmitTitle: "Mark the file complete and send it for registration",
    transmit: "Send to Registration (ANaTT)",
    defaultTitle: "Customer document",
  },
  confirmations: {
    deleteDocument: "Delete this document?",
    uploadFirst: "Upload at least one document for this customer first (CIP, IFU...).",
    transferSuccess: "Customer file and KYC documents sent to Registration (ANaTT).",
    deleteWithHistory:
      "This customer has quotes or invoices. We'll deactivate the account to keep the accounting history. Confirm?",
    deletePermanent: (name) => `Permanently delete customer "${name}"?`,
  },
  csv: {
    headers: [
      "ID",
      "Contact",
      "Company",
      "IFU no.",
      "Email",
      "Phone",
      "Address",
      "City",
      "Category",
      "Showroom notes",
      "Documents",
      "Status",
      "Quotes",
      "Invoices",
      "Created",
    ],
  },
  detail: {
    pageTitle: (name) => `Customer record: ${name}`,
    backToList: "Back to customers",
    accountActive: "Active account",
    accountInactive: "Inactive account",
    ifuPrefix: "IFU: ",
    clientSince: (date) => `Customer since ${date}`,
    quickNewQuote: "New quote",
    quickDocuments: "Documents file",
    quickChargeRequest: "Charger request",
    showroomNotesTitle: "Showroom visit & sales notes",
    kpi: {
      totalInvoiced: "Total invoiced",
      invoicesIssued: (count) =>
        count === 1 ? "1 invoice issued" : `${count} invoices issued`,
      totalCollected: "Total collected",
      paymentsReceived: "Payments received",
      remainingDue: "Still to pay",
      remainingDueHint: (hasDue) =>
        hasDue ? "Invoices due or overdue" : "Account up to date",
      chargingPlan: "Charging plan",
      noPlan: "None (public rate)",
    },
    invoices: {
      title: (count) => `Invoices & payments (${count})`,
      viewAll: "View all invoices",
      empty: "No invoice for this customer yet.",
      headers: [
        "Number",
        "Type",
        "Due date",
        "Total invoiced",
        "Already paid",
        "Balance",
        "Status",
        "Payments",
      ],
      payments: (count) => (count === 1 ? "1 payment" : `${count} payments`),
    },
    quotes: {
      title: (count) => `Quotes & proformas (${count})`,
      manage: "Manage quotes",
      empty: "No quote or proforma for this customer yet.",
      headers: [
        "Proforma no.",
        "Issued on",
        "Lines / vehicles",
        "Total XOF",
        "Valid until",
        "Status",
        "Action",
      ],
      print: "Print",
    },
    documents: {
      title: (count) => `Documents & ANaTT registration (${count})`,
      add: "Add documents",
      empty:
        "No document on file (CIP, IFU certificate, proof of address). You can add some from the customer list.",
      addedOn: (date) => `Added ${date}`,
      download: "Download",
    },
    charging: {
      title: "Chargers & charging",
      installTitle: (count) => `Home and business installations requested (${count})`,
      installEmpty: "No installation request yet.",
      powerLabel: "Power: ",
      vehicleLabel: "Vehicle: ",
      installerQuotes: (count) =>
        count === 1
          ? "1 quote from a partner installer"
          : `${count} quotes from partner installers`,
      historyTitle: (count) => `CARZONE charger sessions (${count})`,
      historyEmpty: "No charging session recorded.",
      kwhLine: (kwh, price) => `${kwh} kWh delivered at ${price} XOF/kWh`,
    },
    vehicles: {
      title: "Vehicles, fleet & rentals",
      contract: (type) => `${type} contract`,
      noVin: "No VIN",
      rent: (amount) => (amount ? `Rent: ${amount}/month` : "Rent: N/A"),
      period: (start, end) => `From ${start} to ${end}`,
      fleet: (name) => `Fleet: ${name}`,
      fleetVehicle: "Fleet vehicle",
      plateLabel: "Plate: ",
      driverLabel: "Driver: ",
    },
    notAvailable: "N/A",
  },
};

const zh: ClientsCopy = {
  formatDate: dateFormatter("zh-CN"),
  category: zhCategory,
  categoryLabel: buildCategoryLabel(zhCategory),
  status: {
    active: "正常",
    inactive: "停用",
  },
  statusLabel: buildLabelMap(zhStatusLabels),
  invoiceKindLabel: buildLabelMap(zhInvoiceKindLabels),
  rentalTypeLabel: buildLabelMap(zhRentalTypeLabels),
  docTypeLabel: buildLabelMap(zhDocTypeLabels),
  documentStatus: {
    validated: "已通过",
    transmitted: "已提交 ANaTT",
  },
  stats: {
    totalTitle: "客户总数",
    totalHint: "CARZONE Motors 客户档案",
    activeTitle: "活跃客户",
    activeShare: (pct) => `占客户档案 ${pct}%`,
    companiesTitle: "企业与车队",
    companiesHint: "对公账户",
    individualsTitle: "个人客户",
    individualsHint: "零售买家",
  },
  search: {
    placeholder: "姓名、公司、邮箱或电话...",
  },
  filters: {
    statusAll: "全部状态",
    statusActiveOnly: "仅活跃客户",
    statusInactive: "已停用",
    categoryAll: "全部类别",
    categoryCompanies: "企业",
    categoryIndividuals: "个人",
    categoryNgos: "非政府组织与外交机构",
    categoryFleets: "车队",
    categoryOther: "其他",
  },
  toolbar: {
    exportCsv: "导出 CSV",
    exportCsvTitle: "把这份客户名单下载为 CSV 文件",
    newCustomer: "新建客户",
  },
  table: {
    index: "序号",
    contact: "主要联系人",
    company: "企业",
    contactInfo: "联系方式",
    location: "所在地",
    category: "类别",
    activity: "关联业务",
    status: "状态",
    actions: "操作",
    empty: "没有符合条件的客户。放宽一下筛选再试试。",
    ifuPrefix: "IFU:",
    missingIfu: "⚠️ 缺少 IFU",
    addedOn: (date) => `${date} 添加`,
    showroomVisit: "🏷️ 展厅到访",
    quotesTooltip: (count) => `${count} 份报价`,
    invoicesTooltip: (count) => `${count} 张发票`,
    subscriptionsTooltip: (count) => `${count} 个充电套餐`,
    noActivity: "新客户",
    toggleTitle: "点击切换状态",
    viewTitle: "360° 档案",
    documentsTitle: "资料与上牌档案(CIP、IFU...)",
    editTitle: "修改资料",
    deleteTitle: "删除或停用",
  },
  createModal: {
    title: "新建客户",
    subtitle: "个人或公司,都在这里录入。",
    contactLabel: "主要联系人",
    contactPlaceholder: "如:Augustin JOHNSON、Nadine HOUVI 医生",
    companyLabel: "企业 / 公司名称(可选)",
    companyPlaceholder: "如:Impact Plus Consulting、DHL Bénin、J-J Telecom",
    ifuLabel: "贝宁 IFU 号",
    ifuHint: "(MECEF 税务与 ANaTT 上牌)",
    ifuPlaceholder: "如:0201910815523(13 位)",
    emailLabel: "邮箱",
    emailPlaceholder: "contact@domaine.bj",
    phoneLabel: "电话",
    phonePlaceholder: "+229 01 48 65 50 40",
    addressLabel: "地址与街区(展厅或住址)",
    addressPlaceholder: "如:Haie Vive, Rue 340, Cotonou",
    cityLabel: "城市",
    categoryLabel: "类别",
    showroomNotesLabel: "展厅到访与意向",
    showroomNotesPlaceholder:
      "10 月 8 日到店,在 BYD Dolphin 和 Song Plus 之间犹豫,要带充电桩的报价...",
    notesLabel: "备注与偏好",
    notesPlaceholder: "对电动车感兴趣,想装家用充电桩...",
    cancel: "取消",
    submit: "保存客户",
  },
  editModal: {
    title: "修改客户资料",
    subtitle: "联系方式与账户状态",
    contactLabel: "主要联系人",
    companyLabel: "企业 / 公司名称",
    ifuLabel: "贝宁 IFU 号",
    ifuHint: "(MECEF 税务与 ANaTT 上牌)",
    ifuPlaceholder: "如:0201910815523(13 位)",
    emailLabel: "邮箱",
    phoneLabel: "电话",
    addressLabel: "地址与街区",
    addressPlaceholder: "如:Haie Vive, Rue 340, Cotonou",
    cityLabel: "城市",
    categoryLabel: "类别",
    showroomNotesLabel: "展厅到访与沟通记录",
    showroomNotesPlaceholder:
      "10 月 8 日到店,关注 BYD Song Plus 或 Dolphin,希望安排试驾...",
    notesLabel: "备注与偏好",
    activeLabel: "活跃客户(可继续新建机会、报价和订单)",
    cancel: "取消",
    submit: "保存修改",
  },
  docsModal: {
    title: "客户资料与上牌(ANaTT)",
    clientPrefix: "客户:",
    ifuLabel: "IFU 号:",
    ifuMissing: "⚠️ 未填写",
    phoneLabel: "电话:",
    emailLabel: "邮箱:",
    addressLabel: "地址:",
    piecesTitle: (count) => `档案资料(${count})`,
    piecesHint: "CIP、IFU、住址证明、驾驶证、合规文件",
    empty: "这位客户还没有上传资料。",
    filePrefix: "文件:",
    typePrefix: "类型:",
    addedOn: (date) => `${date} 添加`,
    notePrefix: "备注:",
    downloadTitle: "打开或下载这份资料",
    download: "下载",
    deleteTitle: "删除这份资料",
    uploadTitle: "给档案再加一份资料",
    docTypeLabel: "资料类型 *",
    docTypeIdentity: "🆔 CIP 或身份证(身份)",
    docTypeIfu: "📄 IFU 证明(税务)",
    docTypeResidence: "🏠 住址证明",
    docTypeLicense: "🚗 驾驶证",
    docTypeCustoms: "🚢 合规或港口清关文件",
    docTypeInvoice: "📑 销售发票或形式发票",
    docTypeOther: "📎 其他资料",
    docTitleLabel: "资料名称",
    docTitlePlaceholder: "如:CIP Dossou 先生、IFU 020...",
    fileLabel: "文件(PDF、JPG 或 PNG)*",
    uploading: "正在上传...",
    upload: "上传资料",
    footerNote: "由 CARZONE Motors 展厅核对",
    close: "关闭",
    transmitTitle: "标记档案齐全并送去上牌",
    transmit: "提交上牌服务(ANaTT)",
    defaultTitle: "客户资料",
  },
  confirmations: {
    deleteDocument: "要删除这份资料吗?",
    uploadFirst: "请先给这位客户上传一份资料(CIP、IFU...)。",
    transferSuccess: "客户档案与 KYC 资料已提交给上牌服务(ANaTT)。",
    deleteWithHistory: "这位客户名下有报价或发票。为了保留账务记录,我们将把它停用。确认吗?",
    deletePermanent: (name) => `确定永久删除客户“${name}”吗?`,
  },
  csv: {
    headers: [
      "ID",
      "联系人",
      "企业",
      "IFU 号",
      "邮箱",
      "电话",
      "地址",
      "城市",
      "类别",
      "展厅备注",
      "资料数",
      "状态",
      "报价",
      "发票",
      "创建日期",
    ],
  },
  detail: {
    pageTitle: (name) => `客户档案:${name}`,
    backToList: "返回客户列表",
    accountActive: "账户正常",
    accountInactive: "账户停用",
    ifuPrefix: "IFU:",
    clientSince: (date) => `${date} 起成为我们的客户`,
    quickNewQuote: "新建报价",
    quickDocuments: "资料档案",
    quickChargeRequest: "充电桩申请",
    showroomNotesTitle: "展厅到访与商务沟通",
    kpi: {
      totalInvoiced: "开票总额",
      invoicesIssued: (count) => `已开具 ${count} 张发票`,
      totalCollected: "已收款总额",
      paymentsReceived: "收到的付款",
      remainingDue: "待收余额",
      remainingDueHint: (hasDue) => (hasDue ? "有发票待付或逾期" : "款项已结清"),
      chargingPlan: "充电套餐",
      noPlan: "无套餐(按公开价)",
    },
    invoices: {
      title: (count) => `发票与收款(${count})`,
      viewAll: "查看全部发票",
      empty: "这位客户还没有发票。",
      headers: [
        "编号",
        "类型",
        "到期日",
        "开票金额",
        "已付金额",
        "剩余",
        "状态",
        "收款",
      ],
      payments: (count) => `${count} 笔收款`,
    },
    quotes: {
      title: (count) => `报价与形式发票(${count})`,
      manage: "管理报价",
      empty: "这位客户还没有报价单或形式发票。",
      headers: [
        "形式发票号",
        "开具日期",
        "明细 / 车辆",
        "合计(XOF)",
        "有效期",
        "状态",
        "操作",
      ],
      print: "打印",
    },
    documents: {
      title: (count) => `资料与 ANaTT 上牌(${count})`,
      add: "添加或上传资料",
      empty: "档案里暂无资料(CIP、IFU 证明、住址证明)。可以在客户列表里上传。",
      addedOn: (date) => `${date} 添加`,
      download: "下载",
    },
    charging: {
      title: "充电桩与充电",
      installTitle: (count) => `家用及企业安装申请(${count})`,
      installEmpty: "暂无安装申请。",
      powerLabel: "功率:",
      vehicleLabel: "车辆:",
      installerQuotes: (count) => `收到 ${count} 份合作安装商报价`,
      historyTitle: (count) => `CARZONE 充电桩使用记录(${count})`,
      historyEmpty: "暂无充电记录。",
      kwhLine: (kwh, price) => `${kwh} kWh,单价 ${price} XOF/kWh`,
    },
    vehicles: {
      title: "车辆、车队与租赁",
      contract: (type) => `${type} 合同`,
      noVin: "未填 VIN",
      rent: (amount) => (amount ? `月租:${amount}` : "月租:N/A"),
      period: (start, end) => `${start} 至 ${end}`,
      fleet: (name) => `车队:${name}`,
      fleetVehicle: "车队车辆",
      plateLabel: "车牌:",
      driverLabel: "司机:",
    },
    notAvailable: "N/A",
  },
};

export const clientsCopy: Record<Locale, ClientsCopy> = { fr, en, zh };
