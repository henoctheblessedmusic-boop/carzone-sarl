import type { Locale } from "@/lib/prefs";

/**
 * Copy des modules énergie CARZONE : terminal borne, bornes & recharge,
 * installateurs, devis bornes, articles & services, imports, catalogue &
 * fournisseurs.
 *
 * Les codes techniques (COMMANDE, DEVIS_RECUS, SERVICE, MTN_MOMO...) restent des
 * données : seuls les libellés affichés sont traduits, via les helpers en bas de
 * fichier. Les prix restent en FCFA, les puissances en kW, les volumes en kWh.
 */

export type ChargeRequestStatusKey =
  | "NOUVELLE"
  | "ENVOYEE_INSTALLATEURS"
  | "DEVIS_RECUS"
  | "CHOISI";

export type ImportStatusKey = "COMMANDE" | "EN_TRANSIT" | "DOUANE" | "ARRIVE" | "ANNULE";

export type ChargingInvoiceStatusKey = "OUVERTE" | "PAYEE" | "ANNULEE";

export type ArticleCategoryKey = "SERVICE" | "ACCESSOIRE" | "VEHICULE" | "PIECE";

export type SupplierTypeKey = "IMPORT_PORT" | "DEALER" | "OTHER";

export type EnergyVehicleTypeKey = "SUV" | "PICKUP" | "BERLINE" | "VAN";

export type EnergyKindKey = "ELECTRIQUE" | "HYBRIDE" | "PHEV" | "ESSENCE" | "DIESEL";

export type PaymentMethodKey = "MTN_MOMO" | "MOOV_MONEY" | "CARTE";

export type EnergyKpiCopy = { label: string; hint: string };

export type EnergyCopy = {
  /** Format de date local (fr-BJ, en-GB, zh-CN). */
  dateLocale: string;
  /** Dates localisées (arrivées, dépôts de devis, ouvertures d'abonnement). */
  formatDate: (date: Date | string | null | undefined) => string;
  common: {
    yes: string;
    no: string;
    active: string;
    inactive: string;
    actions: string;
    status: string;
    notProvided: string;
  };
  terminal: {
    brandKicker: string;
    title: string;
    backLink: string;
    networkOn: string;
    powerFallback: string;
    stationLabel: string;
    customerLabel: string;
    visitorOption: string;
    subscriberTag: string;
    visitorTag: string;
    activePlan: (plan: string) => string;
    memberRate: string;
    energyLabel: string;
    rangeHint: (km: number) => string;
    presets: { value: number; label: string; hint: string }[];
    paymentLabel: string;
    method: Record<PaymentMethodKey, string>;
    ussdPin: Record<PaymentMethodKey, string>;
    phonePlaceholder: string;
    rateApplied: string;
    memberSaving: string;
    saved: (amount: string) => string;
    totalLabel: string;
    paying: string;
    payButton: string;
    successTitle: string;
    successInvoiceLabel: string;
    injected: string;
    unitPrice: string;
    amountPaid: string;
    savings: string;
    newSession: string;
    pushTitle: string;
    pinTitle: string;
    pushBody: (amount: string, phone: string) => string;
    waitingPin: (pin: string) => string;
    errors: {
      loadNetwork: string;
      pickStation: string;
      pickKwh: string;
      payment: string;
      validation: string;
      stationNotFound: string;
    };
  };
  charging: {
    kpi: {
      plans: string;
      subscribers: string;
      stations: string;
      invoices: string;
    };
    plansTitle: string;
    planHeaders: string[];
    subscribeTitle: string;
    customerSelect: string;
    planSelect: string;
    subscribeSubmit: string;
    subscribersTitle: string;
    subscriberHeaders: string[];
    stationsTitle: string;
    stationHeaders: string[];
    invoicesTitle: string;
    invoiceHeaders: string[];
    anonymous: string;
    powerFallback: string;
    openTerminal: string;
    invoiceStatus: Record<ChargingInvoiceStatusKey, string>;
  };
  installers: {
    intro: string;
    form: {
      company: string;
      contact: string;
      email: string;
      phone: string;
      specialties: string;
      submit: string;
    };
    table: {
      company: string;
      contact: string;
      phone: string;
      specialties: string;
      quotes: string;
      active: string;
    };
  };
  chargeRequests: {
    kpi: {
      total: EnergyKpiCopy;
      pending: EnergyKpiCopy;
      received: EnergyKpiCopy;
      awarded: EnergyKpiCopy;
    };
    form: {
      title: string;
      customer: string;
      address: string;
      city: string;
      notes: string;
      submit: string;
      powerOptions: Record<string, string>;
    };
    request: {
      power: string;
      vehicle: string;
      created: string;
      note: string;
      quotesTitle: (count: number) => string;
    };
    status: Record<ChargeRequestStatusKey, string>;
    quote: {
      amount: string;
      pendingAmount: string;
      leadTime: string;
      leadDays: (days: number) => string;
      amountPlaceholder: string;
      leadPlaceholder: string;
      notesPlaceholder: string;
      submit: string;
      choose: string;
      awarded: string;
      won: string;
      rejected: string;
      drafting: string;
      defaultCity: string;
    };
    empty: string;
  };
  services: {
    kpi: {
      total: EnergyKpiCopy;
      vehicles: EnergyKpiCopy;
      accessories: EnergyKpiCopy;
      workshop: EnergyKpiCopy;
    };
    searchPlaceholder: string;
    categories: { all: string } & Record<ArticleCategoryKey, string>;
    categoryOption: Record<ArticleCategoryKey, string>;
    categoryBadge: Record<ArticleCategoryKey, string>;
    addButton: string;
    table: {
      index: string;
      name: string;
      details: string;
      price: string;
      tax: string;
      unit: string;
      category: string;
      status: string;
      actions: string;
    };
    empty: string;
    taxFree: string;
    taxRated: (rate: number) => string;
    toggleTitle: string;
    editTitle: string;
    deleteTitle: string;
    deleteConfirm: (name: string) => string;
    create: { title: string; subtitle: string };
    edit: { title: string; subtitle: string };
    form: {
      nameLabel: string;
      namePlaceholder: string;
      detailsLabel: string;
      detailsPlaceholder: string;
      priceLabel: string;
      pricePlaceholder: string;
      categoryLabel: string;
      taxLabel: string;
      taxOption: { zero: string; eighteen: string };
      unitLabel: string;
      unitPlaceholder: string;
      activeLabel: string;
      createSubmit: string;
      editSubmit: string;
      cancel: string;
      close: string;
    };
  };
  imports: {
    intro: string;
    form: {
      portTitle: string;
      supplierTitle: string;
      supplierOptional: string;
      etaTitle: string;
      costPlaceholder: string;
      notesPlaceholder: string;
      catalogHint: string;
      submit: string;
      submitTitle: string;
    };
    table: {
      reference: string;
      port: string;
      supplier: string;
      expected: string;
      eta: string;
      cost: string;
      vehicles: string;
      status: string;
      action: string;
    };
    status: Record<ImportStatusKey, string>;
    statusOption: Record<ImportStatusKey, string>;
    /** Libellés d'affichage des ports (la valeur stockée reste celle du formulaire). */
    ports: Record<string, string>;
    confirm: string;
    empty: string;
  };
  catalog: {
    intro: string;
    brand: {
      title: string;
      placeholder: string;
      titleAttr: string;
      add: string;
      addTitle: string;
      table: { brand: string; models: string; status: string; action: string };
    };
    model: {
      title: string;
      brandPlaceholder: string;
      brandTitle: string;
      modelPlaceholder: string;
      modelTitle: string;
      typeTitle: string;
      energyTitle: string;
      energyOptional: string;
      add: string;
      addTitle: string;
      table: {
        brand: string;
        model: string;
        type: string;
        energy: string;
        status: string;
        action: string;
      };
    };
    supplier: {
      title: string;
      namePlaceholder: string;
      nameTitle: string;
      typeTitle: string;
      countryPlaceholder: string;
      cityPlaceholder: string;
      contactPlaceholder: string;
      emailPlaceholder: string;
      phonePlaceholder: string;
      notesPlaceholder: string;
      add: string;
      addTitle: string;
      table: {
        name: string;
        type: string;
        location: string;
        contact: string;
        phone: string;
        status: string;
        action: string;
      };
    };
    vehicleType: Record<EnergyVehicleTypeKey, string>;
    energyKind: Record<EnergyKindKey, string>;
    supplierType: Record<SupplierTypeKey, string>;
    toggle: { deactivate: string; reactivate: string };
  };
};

export const CHARGE_REQUEST_STATUS_KEYS: ChargeRequestStatusKey[] = [
  "NOUVELLE",
  "ENVOYEE_INSTALLATEURS",
  "DEVIS_RECUS",
  "CHOISI",
];

export const IMPORT_STATUS_KEYS: ImportStatusKey[] = [
  "COMMANDE",
  "EN_TRANSIT",
  "DOUANE",
  "ARRIVE",
  "ANNULE",
];

export const CHARGING_INVOICE_STATUS_KEYS: ChargingInvoiceStatusKey[] = [
  "OUVERTE",
  "PAYEE",
  "ANNULEE",
];

export const ARTICLE_CATEGORY_KEYS: ArticleCategoryKey[] = [
  "SERVICE",
  "ACCESSOIRE",
  "VEHICULE",
  "PIECE",
];

export const SUPPLIER_TYPE_KEYS: SupplierTypeKey[] = ["IMPORT_PORT", "DEALER", "OTHER"];

export const ENERGY_VEHICLE_TYPE_KEYS: EnergyVehicleTypeKey[] = [
  "SUV",
  "PICKUP",
  "BERLINE",
  "VAN",
];

export const ENERGY_KIND_KEYS: EnergyKindKey[] = [
  "ELECTRIQUE",
  "HYBRIDE",
  "PHEV",
  "ESSENCE",
  "DIESEL",
];

function isChargeRequestStatus(value: string): value is ChargeRequestStatusKey {
  return CHARGE_REQUEST_STATUS_KEYS.some((key) => key === value);
}

function isImportStatus(value: string): value is ImportStatusKey {
  return IMPORT_STATUS_KEYS.some((key) => key === value);
}

function isChargingInvoiceStatus(value: string): value is ChargingInvoiceStatusKey {
  return CHARGING_INVOICE_STATUS_KEYS.some((key) => key === value);
}

function isArticleCategory(value: string): value is ArticleCategoryKey {
  return ARTICLE_CATEGORY_KEYS.some((key) => key === value);
}

function isSupplierType(value: string): value is SupplierTypeKey {
  return SUPPLIER_TYPE_KEYS.some((key) => key === value);
}

function isEnergyVehicleType(value: string): value is EnergyVehicleTypeKey {
  return ENERGY_VEHICLE_TYPE_KEYS.some((key) => key === value);
}

function isEnergyKind(value: string): value is EnergyKindKey {
  return ENERGY_KIND_KEYS.some((key) => key === value);
}

/** Libellé de demande de borne, sinon la valeur brute venue de la base. */
export function chargeRequestStatusLabel(copy: EnergyCopy, value: string): string {
  return isChargeRequestStatus(value) ? copy.chargeRequests.status[value] : value;
}

/** Libellé de statut d'import, sinon la valeur brute. */
export function importStatusLabel(copy: EnergyCopy, value: string): string {
  return isImportStatus(value) ? copy.imports.status[value] : value;
}

/** Libellé d'affichage d'un port d'origine, sinon la valeur brute. */
export function importPortLabel(copy: EnergyCopy, value: string): string {
  return copy.imports.ports[value] ?? value;
}

/** Libellé de statut de facture de recharge, sinon la valeur brute. */
export function chargingInvoiceStatusLabel(copy: EnergyCopy, value: string): string {
  return isChargingInvoiceStatus(value) ? copy.charging.invoiceStatus[value] : value;
}

/** Libellé court de catégorie d'article, sinon la valeur brute. */
export function articleCategoryLabel(copy: EnergyCopy, value: string): string {
  return isArticleCategory(value) ? copy.services.categoryBadge[value] : value;
}

/** Libellé long de catégorie d'article (listes déroulantes). */
export function articleCategoryOptionLabel(copy: EnergyCopy, value: string): string {
  return isArticleCategory(value) ? copy.services.categoryOption[value] : value;
}

/** Libellé de type de fournisseur, sinon la valeur brute. */
export function supplierTypeLabel(copy: EnergyCopy, value: string): string {
  return isSupplierType(value) ? copy.catalog.supplierType[value] : value;
}

/** Libellé de gamme véhicule, sinon la valeur brute. */
export function energyVehicleTypeLabel(copy: EnergyCopy, value: string): string {
  return isEnergyVehicleType(value) ? copy.catalog.vehicleType[value] : value;
}

/** Libellé d'énergie, sinon la valeur brute. */
export function energyKindLabel(copy: EnergyCopy, value: string): string {
  return isEnergyKind(value) ? copy.catalog.energyKind[value] : value;
}

const fr: EnergyCopy = {
  dateLocale: "fr-BJ",
  formatDate: (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-BJ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(typeof date === "string" ? new Date(date) : date);
  },
  common: {
    yes: "Oui",
    no: "Non",
    active: "Actif",
    inactive: "Inactif",
    actions: "Actions",
    status: "Statut",
    notProvided: "-",
  },
  terminal: {
    brandKicker: "CARZONE Fast Charging",
    title: "Borne publique haute puissance",
    backLink: "Revenir à la plateforme",
    networkOn: "Terminal connecté au réseau",
    powerFallback: "Charge rapide",
    stationLabel: "Borne utilisée",
    customerLabel: "Client ou badge abonné",
    visitorOption: "👤 Visiteur, tarif public 125 FCFA le kWh",
    subscriberTag: "⭐ Abonné · ",
    visitorTag: "👤 ",
    activePlan: (plan) => `Abonnement actif : ${plan}`,
    memberRate: "90 FCFA / kWh (-28 %)",
    energyLabel: "Énergie à délivrer",
    rangeHint: (km) => `environ ${km} km`,
    presets: [
      { value: 15, label: "15 kWh", hint: "environ 100 km" },
      { value: 30, label: "30 kWh", hint: "environ 200 km" },
      { value: 45, label: "45 kWh", hint: "environ 300 km" },
      { value: 60, label: "60 kWh", hint: "le plein à 100 %" },
    ],
    paymentLabel: "Paiement immédiat",
    method: {
      MTN_MOMO: "MTN MoMo",
      MOOV_MONEY: "Moov Money",
      CARTE: "Carte TPE",
    },
    ussdPin: {
      MTN_MOMO: "MTN (*880#)",
      MOOV_MONEY: "Moov (*855#)",
      CARTE: "",
    },
    phonePlaceholder: "Numéro Mobile Money (ex. 97 00 00 00)",
    rateApplied: "Tarif appliqué au kWh",
    memberSaving: "Avantage abonné",
    saved: (amount) => `${amount} d'économie`,
    totalLabel: "Total à payer",
    paying: "Paiement en cours...",
    payButton: "Payer et lancer la charge",
    successTitle: "Paiement validé, la charge peut démarrer",
    successInvoiceLabel: "Facture de recharge n°",
    injected: "Énergie délivrée",
    unitPrice: "Prix du kWh",
    amountPaid: "Montant réglé",
    savings: "Économie abonné",
    newSession: "Nouvelle session",
    pushTitle: "Notification USSD envoyée",
    pinTitle: "Vérification du code secret",
    pushBody: (amount, phone) =>
      `Confirmez le paiement de ${amount} sur votre téléphone (${phone}).`,
    waitingPin: (pin) => `En attente du code ${pin}`,
    errors: {
      loadNetwork: "Impossible de joindre le réseau des bornes CARZONE.",
      pickStation: "Choisissez d'abord une borne.",
      pickKwh: "Indiquez une quantité de kWh supérieure à zéro.",
      payment: "Le paiement n'est pas passé. Réessayez.",
      validation: "Le réseau a coupé pendant la validation. Réessayez.",
      stationNotFound: "Borne introuvable ou inactive.",
    },
  },
  charging: {
    kpi: {
      plans: "Formules",
      subscribers: "Abonnés actifs",
      stations: "Bornes",
      invoices: "Factures de recharge",
    },
    plansTitle: "Formules au kWh",
    planHeaders: ["Formule", "Abonnement mensuel", "Prix du kWh", "Tarif public", "Ouverte"],
    subscribeTitle: "Rattacher un client à une formule",
    customerSelect: "Client",
    planSelect: "Formule",
    subscribeSubmit: "Activer l'abonnement",
    subscribersTitle: "Abonnés",
    subscriberHeaders: ["Client", "Formule", "Prix kWh", "Depuis"],
    stationsTitle: "Bornes",
    stationHeaders: ["Code", "Nom", "Site", "Puissance", "Terminal"],
    invoicesTitle: "Factures de recharge",
    invoiceHeaders: ["N°", "Client", "kWh", "Tarif", "Total", "Statut", "Date"],
    anonymous: "Client de passage",
    powerFallback: "Charge rapide",
    openTerminal: "Ouvrir le terminal de la borne",
    invoiceStatus: {
      OUVERTE: "Ouverte",
      PAYEE: "Payée",
      ANNULEE: "Annulée",
    },
  },
  installers: {
    intro:
      "Des électriciens partenaires installent les bornes chez les clients. Les devis passent par CARZONE.",
    form: {
      company: "Société *",
      contact: "Contact *",
      email: "Email",
      phone: "Téléphone",
      specialties: "Spécialités",
      submit: "Ajouter au panel",
    },
    table: {
      company: "Société",
      contact: "Contact",
      phone: "Téléphone",
      specialties: "Spécialités",
      quotes: "Devis",
      active: "Actif",
    },
  },
  chargeRequests: {
    kpi: {
      total: { label: "Demandes de borne", hint: "Showroom, particuliers et pros" },
      pending: {
        label: "Appel d'offres en cours",
        hint: "Les chiffrages électriciens sont attendus",
      },
      received: { label: "Devis à arbitrer", hint: "La mise en concurrence est ouverte" },
      awarded: { label: "Chantiers attribués", hint: "Installateur retenu, travaux lancés" },
    },
    form: {
      title: "Lancer un appel d'offres pour une borne",
      customer: "Choisir le client *",
      address: "Adresse du chantier (ex. Cité Houéyiho, lot 14) *",
      city: "Ville",
      notes: "Précisions chantier (distance du disjoncteur, câble en goulotte...)",
      submit: "Diffuser la demande au panel",
      powerOptions: {
        "7.4": "Borne 7.4 kW (monophasé 32 A)",
        "11": "Borne 11 kW (triphasé 16 A)",
        "22": "Borne 22 kW (triphasé 32 A)",
        "50": "Borne rapide DC 50 kW",
      },
    },
    request: {
      power: "Puissance demandée",
      vehicle: "Véhicule",
      created: "Demande créée le",
      note: "Note",
      quotesTitle: (count) => `Installateurs consultés (${count})`,
    },
    status: {
      NOUVELLE: "Nouvelle demande",
      ENVOYEE_INSTALLATEURS: "En attente de devis",
      DEVIS_RECUS: "Devis à comparer",
      CHOISI: "Installateur retenu",
    },
    quote: {
      amount: "Montant chiffré",
      pendingAmount: "Chiffrage attendu",
      leadTime: "Délai d'exécution",
      leadDays: (days) => `${days} jours ouvrés`,
      amountPlaceholder: "Montant XOF *",
      leadPlaceholder: "Délai (j)",
      notesPlaceholder: "Matériel compris, points particuliers",
      submit: "Envoyer mon chiffrage",
      choose: "Retenir cet installateur",
      awarded: "OFFRE RETENUE",
      won: "Chantier attribué",
      rejected: "Offre écartée",
      drafting: "Devis en cours de rédaction",
      defaultCity: "Cotonou",
    },
    empty: "Aucune demande pour l'instant. Le formulaire du haut lance la première.",
  },
  services: {
    kpi: {
      total: { label: "Articles au catalogue", hint: "Articles et prestations référencés" },
      vehicles: { label: "Modèles et véhicules", hint: "Tarifs du catalogue véhicules" },
      accessories: { label: "Accessoires et bornes", hint: "Wallbox, câbles, bâches, additifs" },
      workshop: { label: "Forfaits atelier et SAV", hint: "Main-d'œuvre et révisions" },
    },
    searchPlaceholder: "Chercher un article, un service, un véhicule...",
    categories: {
      all: "Toutes catégories",
      VEHICULE: "Véhicules",
      ACCESSOIRE: "Accessoires et bornes",
      SERVICE: "Services et atelier",
      PIECE: "Pièces détachées",
    },
    categoryOption: {
      SERVICE: "Service / forfait atelier",
      ACCESSOIRE: "Accessoire et borne",
      VEHICULE: "Véhicule du catalogue",
      PIECE: "Pièce détachée",
    },
    categoryBadge: {
      SERVICE: "Service",
      ACCESSOIRE: "Accessoire",
      VEHICULE: "Véhicule",
      PIECE: "Pièce",
    },
    addButton: "Ajouter un article",
    table: {
      index: "N°",
      name: "Description",
      details: "Détails et spécifications",
      price: "Prix unitaire",
      tax: "TVA",
      unit: "Unité",
      category: "Catégorie",
      status: "Statut",
      actions: "Actions",
    },
    empty: "Aucun article ne correspond à cette recherche.",
    taxFree: "0 % (exonéré)",
    taxRated: (rate) => `${rate} % TVA`,
    toggleTitle: "Changer le statut",
    editTitle: "Modifier",
    deleteTitle: "Supprimer",
    deleteConfirm: (name) => `Supprimer l'article « ${name} » ?`,
    create: {
      title: "Nouvel article ou prestation",
      subtitle: "Un produit, un forfait ou un accessoire à ajouter au catalogue",
    },
    edit: {
      title: "Modifier l'article",
      subtitle: "Mettre à jour le prix et les caractéristiques",
    },
    form: {
      nameLabel: "Nom de l'article",
      namePlaceholder: "Ex. Câble Type 2, forfait révision, additif lave-glace",
      detailsLabel: "Détails et spécifications",
      detailsPlaceholder: "Technique, finition, compatibilité...",
      priceLabel: "Prix unitaire (XOF)",
      pricePlaceholder: "Ex. 45000",
      categoryLabel: "Catégorie",
      taxLabel: "Taux de TVA",
      taxOption: {
        zero: "0 % (exonéré)",
        eighteen: "18 % (TVA Bénin)",
      },
      unitLabel: "Unité",
      unitPlaceholder: "1, U, forfait, litre...",
      activeLabel: "Article actif, disponible dans les devis et les factures",
      createSubmit: "Enregistrer l'article",
      editSubmit: "Enregistrer les modifications",
      cancel: "Annuler",
      close: "Fermer",
    },
  },
  imports: {
    intro:
      "Les arrivages d'Anvers, Dubaï et Livourne. Chaque commande relie le stock, le fournisseur et le catalogue.",
    form: {
      portTitle: "Port d'origine",
      supplierTitle: "Fournisseur",
      supplierOptional: "Fournisseur (facultatif)",
      etaTitle: "Arrivée prévue",
      costPlaceholder: "Coût XOF",
      notesPlaceholder: "Notes",
      catalogHint: "Marque et modèle attendus (catalogue, facultatif)",
      submit: "Nouvelle commande import",
      submitTitle: "Créer la commande d'import",
    },
    table: {
      reference: "Réf.",
      port: "Port",
      supplier: "Fournisseur",
      expected: "Attendu",
      eta: "Arrivée prévue",
      cost: "Coût",
      vehicles: "Véhicules",
      status: "Statut",
      action: "Action",
    },
    status: {
      COMMANDE: "Commandée",
      EN_TRANSIT: "En transit",
      DOUANE: "En douane",
      ARRIVE: "Arrivée",
      ANNULE: "Annulée",
    },
    statusOption: {
      COMMANDE: "1. Commande passée",
      EN_TRANSIT: "2. En transit",
      DOUANE: "3. En douane",
      ARRIVE: "4. Arrivée au port",
      ANNULE: "Annulée",
    },
    ports: {
      Anvers: "Anvers",
      Dubaï: "Dubaï",
      Livourne: "Livourne",
    },
    confirm: "OK",
    empty: "Aucune commande d'import pour le moment.",
  },
  catalog: {
    intro:
      "Les marques et modèles CARZONE, plus le portefeuille de fournisseurs. Tout ce qui sert au stock et aux imports.",
    brand: {
      title: "Marques",
      placeholder: "Nouvelle marque *",
      titleAttr: "Nom de marque (ex. BYD, VOYAH)",
      add: "Ajouter la marque",
      addTitle: "Ajouter une marque au catalogue",
      table: { brand: "Marque", models: "Modèles", status: "Statut", action: "Action" },
    },
    model: {
      title: "Modèles",
      brandPlaceholder: "Marque *",
      brandTitle: "Marque parente",
      modelPlaceholder: "Modèle *",
      modelTitle: "Nom du modèle",
      typeTitle: "Type de carrosserie",
      energyTitle: "Énergie par défaut",
      energyOptional: "Énergie (facultatif)",
      add: "Ajouter le modèle",
      addTitle: "Ajouter un modèle",
      table: {
        brand: "Marque",
        model: "Modèle",
        type: "Gamme",
        energy: "Énergie",
        status: "Statut",
        action: "Action",
      },
    },
    supplier: {
      title: "Fournisseurs",
      namePlaceholder: "Nom fournisseur *",
      nameTitle: "Nom",
      typeTitle: "Type",
      countryPlaceholder: "Pays",
      cityPlaceholder: "Ville / port",
      contactPlaceholder: "Contact",
      emailPlaceholder: "Email",
      phonePlaceholder: "Téléphone",
      notesPlaceholder: "Notes",
      add: "Ajouter fournisseur",
      addTitle: "Ajouter un fournisseur",
      table: {
        name: "Nom",
        type: "Type",
        location: "Pays / ville",
        contact: "Contact",
        phone: "Tél.",
        status: "Statut",
        action: "Action",
      },
    },
    vehicleType: {
      SUV: "SUV",
      PICKUP: "Pick-up",
      BERLINE: "Berline",
      VAN: "Van / Minibus",
    },
    energyKind: {
      ELECTRIQUE: "Électrique",
      HYBRIDE: "Hybride",
      PHEV: "Hybride rechargeable",
      ESSENCE: "Essence",
      DIESEL: "Diesel",
    },
    supplierType: {
      IMPORT_PORT: "Port d'import",
      DEALER: "Dealer",
      OTHER: "Autre",
    },
    toggle: { deactivate: "Désactiver", reactivate: "Réactiver" },
  },
};

const en: EnergyCopy = {
  dateLocale: "en-GB",
  formatDate: (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(typeof date === "string" ? new Date(date) : date);
  },
  common: {
    yes: "Yes",
    no: "No",
    active: "Active",
    inactive: "Inactive",
    actions: "Actions",
    status: "Status",
    notProvided: "-",
  },
  terminal: {
    brandKicker: "CARZONE Fast Charging",
    title: "High-power public charging station",
    backLink: "Back to the platform",
    networkOn: "Terminal online",
    powerFallback: "Fast charging",
    stationLabel: "Charging station",
    customerLabel: "Customer or member badge",
    visitorOption: "👤 Walk-in visitor, public rate 125 FCFA per kWh",
    subscriberTag: "⭐ Member · ",
    visitorTag: "👤 ",
    activePlan: (plan) => `Active plan: ${plan}`,
    memberRate: "90 FCFA / kWh (-28%)",
    energyLabel: "Energy to deliver",
    rangeHint: (km) => `about ${km} km`,
    presets: [
      { value: 15, label: "15 kWh", hint: "about 100 km" },
      { value: 30, label: "30 kWh", hint: "about 200 km" },
      { value: 45, label: "45 kWh", hint: "about 300 km" },
      { value: 60, label: "60 kWh", hint: "a 100% full charge" },
    ],
    paymentLabel: "Pay on the spot",
    method: {
      MTN_MOMO: "MTN MoMo",
      MOOV_MONEY: "Moov Money",
      CARTE: "Card terminal",
    },
    ussdPin: {
      MTN_MOMO: "MTN (*880#)",
      MOOV_MONEY: "Moov (*855#)",
      CARTE: "",
    },
    phonePlaceholder: "Mobile Money number (e.g. 97 00 00 00)",
    rateApplied: "Rate per kWh",
    memberSaving: "Member saving",
    saved: (amount) => `${amount} saved`,
    totalLabel: "Total due",
    paying: "Taking the payment...",
    payButton: "Pay and start charging",
    successTitle: "Payment approved, charging can start",
    successInvoiceLabel: "Charging invoice no.",
    injected: "Energy delivered",
    unitPrice: "Price per kWh",
    amountPaid: "Amount paid",
    savings: "You saved",
    newSession: "New session",
    pushTitle: "USSD notification sent",
    pinTitle: "Checking your PIN",
    pushBody: (amount, phone) =>
      `Approve the ${amount} payment on your phone (${phone}).`,
    waitingPin: (pin) => `Waiting for the ${pin} PIN`,
    errors: {
      loadNetwork: "Can't reach the CARZONE charging network.",
      pickStation: "Pick a charging station first.",
      pickKwh: "Enter a kWh amount above zero.",
      payment: "The payment didn't go through. Please try again.",
      validation: "The network dropped during validation. Please try again.",
      stationNotFound: "Station not found or inactive.",
    },
  },
  charging: {
    kpi: {
      plans: "Plans",
      subscribers: "Active subscribers",
      stations: "Stations",
      invoices: "Charging invoices",
    },
    plansTitle: "Plans billed per kWh",
    planHeaders: ["Plan", "Monthly fee", "Price per kWh", "Public rate", "Open"],
    subscribeTitle: "Assign a plan to a customer",
    customerSelect: "Customer",
    planSelect: "Plan",
    subscribeSubmit: "Activate the subscription",
    subscribersTitle: "Subscribers",
    subscriberHeaders: ["Customer", "Plan", "Price per kWh", "Member since"],
    stationsTitle: "Stations",
    stationHeaders: ["Code", "Name", "Site", "Power", "Terminal"],
    invoicesTitle: "Charging invoices",
    invoiceHeaders: ["No.", "Customer", "kWh", "Rate", "Total", "Status", "Date"],
    anonymous: "Walk-in customer",
    powerFallback: "Fast charging",
    openTerminal: "Open the station terminal",
    invoiceStatus: {
      OUVERTE: "Open",
      PAYEE: "Paid",
      ANNULEE: "Voided",
    },
  },
  installers: {
    intro:
      "Partner electricians fit the charging points at customer premises. Quotes run through CARZONE.",
    form: {
      company: "Company *",
      contact: "Contact *",
      email: "Email",
      phone: "Phone",
      specialties: "Specialties",
      submit: "Add to the panel",
    },
    table: {
      company: "Company",
      contact: "Contact",
      phone: "Phone",
      specialties: "Specialties",
      quotes: "Quotes",
      active: "Active",
    },
  },
  chargeRequests: {
    kpi: {
      total: {
        label: "Charging station requests",
        hint: "Showroom, private owners and businesses",
      },
      pending: {
        label: "Tenders in progress",
        hint: "Waiting for the electricians' figures",
      },
      received: {
        label: "Quotes to compare",
        hint: "Competitive bidding is open",
      },
      awarded: {
        label: "Jobs awarded",
        hint: "Installer picked, work under way",
      },
    },
    form: {
      title: "Open a tender for a charging station",
      customer: "Choose the customer *",
      address: "Site address (e.g. Cité Houéyiho, lot 14) *",
      city: "City",
      notes: "Site details (breaker distance, trunking for the cable...)",
      submit: "Send the request to the panel",
      powerOptions: {
        "7.4": "7.4 kW station (single phase 32 A)",
        "11": "11 kW station (three phase 16 A)",
        "22": "22 kW station (three phase 32 A)",
        "50": "50 kW DC fast charger",
      },
    },
    request: {
      power: "Requested power",
      vehicle: "Vehicle",
      created: "Request opened on",
      note: "Note",
      quotesTitle: (count) => `Installers consulted (${count})`,
    },
    status: {
      NOUVELLE: "New request",
      ENVOYEE_INSTALLATEURS: "Waiting for quotes",
      DEVIS_RECUS: "Quotes to compare",
      CHOISI: "Installer selected",
    },
    quote: {
      amount: "Quoted amount",
      pendingAmount: "Quote pending",
      leadTime: "Lead time",
      leadDays: (days) => `${days} working days`,
      amountPlaceholder: "Amount in XOF *",
      leadPlaceholder: "Days",
      notesPlaceholder: "Materials included, special points",
      submit: "Send my quote",
      choose: "Pick this installer",
      awarded: "OFFER SELECTED",
      won: "Job awarded",
      rejected: "Offer declined",
      drafting: "Quote being drafted",
      defaultCity: "Cotonou",
    },
    empty: "No request yet. The form above opens the first one.",
  },
  services: {
    kpi: {
      total: { label: "Catalogue items", hint: "Products and services on file" },
      vehicles: { label: "Models and vehicles", hint: "Vehicle catalogue pricing" },
      accessories: {
        label: "Accessories and chargers",
        hint: "Wallboxes, cables, covers, additives",
      },
      workshop: { label: "Workshop and service packages", hint: "Labour and servicing" },
    },
    searchPlaceholder: "Search an item, a service, a vehicle...",
    categories: {
      all: "All categories",
      VEHICULE: "Vehicles",
      ACCESSOIRE: "Accessories and chargers",
      SERVICE: "Services and workshop",
      PIECE: "Spare parts",
    },
    categoryOption: {
      SERVICE: "Service / workshop package",
      ACCESSOIRE: "Accessory and charger",
      VEHICULE: "Catalogue vehicle",
      PIECE: "Spare part",
    },
    categoryBadge: {
      SERVICE: "Service",
      ACCESSOIRE: "Accessory",
      VEHICULE: "Vehicle",
      PIECE: "Part",
    },
    addButton: "Add an item",
    table: {
      index: "No.",
      name: "Description",
      details: "Details and specs",
      price: "Unit price",
      tax: "VAT",
      unit: "Unit",
      category: "Category",
      status: "Status",
      actions: "Actions",
    },
    empty: "No item matches this search.",
    taxFree: "0% (exempt)",
    taxRated: (rate) => `${rate}% VAT`,
    toggleTitle: "Switch the status",
    editTitle: "Edit",
    deleteTitle: "Delete",
    deleteConfirm: (name) => `Delete the item "${name}"?`,
    create: {
      title: "New item or service",
      subtitle: "A product, a package or an accessory for the catalogue",
    },
    edit: {
      title: "Edit the item",
      subtitle: "Update the price and the details",
    },
    form: {
      nameLabel: "Item name",
      namePlaceholder: "e.g. Type 2 cable, service package, washer fluid",
      detailsLabel: "Details and specs",
      detailsPlaceholder: "Technical notes, finish, compatibility...",
      priceLabel: "Unit price (XOF)",
      pricePlaceholder: "e.g. 45000",
      categoryLabel: "Category",
      taxLabel: "VAT rate",
      taxOption: {
        zero: "0% (exempt)",
        eighteen: "18% (Benin VAT)",
      },
      unitLabel: "Unit",
      unitPlaceholder: "1, U, package, litre...",
      activeLabel: "Item active and available for quotes and invoices",
      createSubmit: "Save the item",
      editSubmit: "Save changes",
      cancel: "Cancel",
      close: "Close",
    },
  },
  imports: {
    intro:
      "Shipments out of Antwerp, Dubai and Livorno. Each order ties stock, supplier and catalogue together.",
    form: {
      portTitle: "Origin port",
      supplierTitle: "Supplier",
      supplierOptional: "Supplier (optional)",
      etaTitle: "Expected arrival",
      costPlaceholder: "Cost in XOF",
      notesPlaceholder: "Notes",
      catalogHint: "Expected brand and model (catalogue, optional)",
      submit: "New import order",
      submitTitle: "Create the import order",
    },
    table: {
      reference: "Ref.",
      port: "Port",
      supplier: "Supplier",
      expected: "Expected",
      eta: "Arrival",
      cost: "Cost",
      vehicles: "Vehicles",
      status: "Status",
      action: "Action",
    },
    status: {
      COMMANDE: "Ordered",
      EN_TRANSIT: "In transit",
      DOUANE: "In customs",
      ARRIVE: "Arrived",
      ANNULE: "Cancelled",
    },
    statusOption: {
      COMMANDE: "1. Order placed",
      EN_TRANSIT: "2. In transit",
      DOUANE: "3. In customs",
      ARRIVE: "4. Arrived at port",
      ANNULE: "Cancelled",
    },
    ports: {
      Anvers: "Antwerp",
      Dubaï: "Dubai",
      Livourne: "Livorno",
    },
    confirm: "OK",
    empty: "No import order yet.",
  },
  catalog: {
    intro:
      "CARZONE brands and models, plus the supplier list. Everything stock and imports rely on.",
    brand: {
      title: "Brands",
      placeholder: "New brand *",
      titleAttr: "Brand name (e.g. BYD, VOYAH)",
      add: "Add the brand",
      addTitle: "Add a brand to the catalogue",
      table: { brand: "Brand", models: "Models", status: "Status", action: "Action" },
    },
    model: {
      title: "Models",
      brandPlaceholder: "Brand *",
      brandTitle: "Parent brand",
      modelPlaceholder: "Model *",
      modelTitle: "Model name",
      typeTitle: "Body type",
      energyTitle: "Default fuel",
      energyOptional: "Fuel type (optional)",
      add: "Add the model",
      addTitle: "Add a model",
      table: {
        brand: "Brand",
        model: "Model",
        type: "Body type",
        energy: "Fuel",
        status: "Status",
        action: "Action",
      },
    },
    supplier: {
      title: "Suppliers",
      namePlaceholder: "Supplier name *",
      nameTitle: "Name",
      typeTitle: "Type",
      countryPlaceholder: "Country",
      cityPlaceholder: "City / port",
      contactPlaceholder: "Contact",
      emailPlaceholder: "Email",
      phonePlaceholder: "Phone",
      notesPlaceholder: "Notes",
      add: "Add the supplier",
      addTitle: "Add a supplier",
      table: {
        name: "Name",
        type: "Type",
        location: "Country / city",
        contact: "Contact",
        phone: "Phone",
        status: "Status",
        action: "Action",
      },
    },
    vehicleType: {
      SUV: "SUV",
      PICKUP: "Pickup",
      BERLINE: "Sedan",
      VAN: "Van / Minibus",
    },
    energyKind: {
      ELECTRIQUE: "Electric",
      HYBRIDE: "Hybrid",
      PHEV: "Plug-in hybrid",
      ESSENCE: "Petrol",
      DIESEL: "Diesel",
    },
    supplierType: {
      IMPORT_PORT: "Import port",
      DEALER: "Dealer",
      OTHER: "Other",
    },
    toggle: { deactivate: "Deactivate", reactivate: "Reactivate" },
  },
};

const zh: EnergyCopy = {
  dateLocale: "zh-CN",
  formatDate: (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("zh-CN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(typeof date === "string" ? new Date(date) : date);
  },
  common: {
    yes: "是",
    no: "否",
    active: "启用",
    inactive: "停用",
    actions: "操作",
    status: "状态",
    notProvided: "-",
  },
  terminal: {
    brandKicker: "CARZONE Fast Charging",
    title: "高功率公共充电桩",
    backLink: "返回管理平台",
    networkOn: "终端已联网",
    powerFallback: "快充",
    stationLabel: "本次使用的充电桩",
    customerLabel: "客户或会员卡",
    visitorOption: "👤 临时用户,公共价 125 FCFA/千瓦时",
    subscriberTag: "⭐ 会员 · ",
    visitorTag: "👤 ",
    activePlan: (plan) => `当前套餐:${plan}`,
    memberRate: "90 FCFA / kWh(-28%)",
    energyLabel: "本次充多少电",
    rangeHint: (km) => `约 ${km} 公里`,
    presets: [
      { value: 15, label: "15 kWh", hint: "约 100 公里" },
      { value: 30, label: "30 kWh", hint: "约 200 公里" },
      { value: 45, label: "45 kWh", hint: "约 300 公里" },
      { value: 60, label: "60 kWh", hint: "一次充满" },
    ],
    paymentLabel: "当场付款",
    method: {
      MTN_MOMO: "MTN MoMo",
      MOOV_MONEY: "Moov Money",
      CARTE: "刷卡 TPE",
    },
    ussdPin: {
      MTN_MOMO: "MTN (*880#)",
      MOOV_MONEY: "Moov (*855#)",
      CARTE: "",
    },
    phonePlaceholder: "手机钱包号码(例:97 00 00 00)",
    rateApplied: "本次每千瓦时电价",
    memberSaving: "会员优惠",
    saved: (amount) => `省下 ${amount}`,
    totalLabel: "应付合计",
    paying: "正在收款...",
    payButton: "付款并开始充电",
    successTitle: "付款成功,可以开始充电",
    successInvoiceLabel: "充电发票号",
    injected: "已充入电量",
    unitPrice: "每千瓦时电价",
    amountPaid: "实付金额",
    savings: "会员已省",
    newSession: "开始新一笔",
    pushTitle: "USSD 通知已发送",
    pinTitle: "正在核对支付密码",
    pushBody: (amount, phone) => `请在手机(${phone})上确认 ${amount} 的付款。`,
    waitingPin: (pin) => `等待输入 ${pin} 密码`,
    errors: {
      loadNetwork: "连不上 CARZONE 的充电网络。",
      pickStation: "请先选一台充电桩。",
      pickKwh: "充电量要大于零。",
      payment: "这笔付款没成功,请重试。",
      validation: "确认时网络断了,请重试。",
      stationNotFound: "充电桩不存在或已停用。",
    },
  },
  charging: {
    kpi: {
      plans: "套餐",
      subscribers: "有效会员",
      stations: "充电桩",
      invoices: "充电发票",
    },
    plansTitle: "按千瓦时计价的套餐",
    planHeaders: ["套餐", "月租", "每千瓦时价格", "公开价", "启用"],
    subscribeTitle: "给客户开通套餐",
    customerSelect: "客户",
    planSelect: "套餐",
    subscribeSubmit: "开通订阅",
    subscribersTitle: "会员",
    subscriberHeaders: ["客户", "套餐", "电价", "开通时间"],
    stationsTitle: "充电桩",
    stationHeaders: ["编号", "名称", "站点", "功率", "终端"],
    invoicesTitle: "充电发票",
    invoiceHeaders: ["编号", "客户", "千瓦时", "单价", "合计", "状态", "日期"],
    anonymous: "临时用户",
    powerFallback: "快充",
    openTerminal: "打开充电桩终端",
    invoiceStatus: {
      OUVERTE: "未支付",
      PAYEE: "已支付",
      ANNULEE: "已作废",
    },
  },
  installers: {
    intro: "合作电工上门安装充电桩,报价统一走 CARZONE。",
    form: {
      company: "公司 *",
      contact: "联系人 *",
      email: "邮箱",
      phone: "电话",
      specialties: "专长",
      submit: "加入合作名单",
    },
    table: {
      company: "公司",
      contact: "联系人",
      phone: "电话",
      specialties: "专长",
      quotes: "报价单",
      active: "启用",
    },
  },
  chargeRequests: {
    kpi: {
      total: { label: "充电桩需求", hint: "展厅、私人客户和企业" },
      pending: { label: "招标中", hint: "还在等电工报价" },
      received: { label: "待选报价", hint: "可以比价挑人" },
      awarded: { label: "已派工", hint: "已定安装商,工程已启动" },
    },
    form: {
      title: "就一台充电桩发起招标",
      customer: "选择客户 *",
      address: "施工地址(例:Cité Houéyiho,14 号地块)*",
      city: "城市",
      notes: "现场说明(断路器距离、线槽走向...)",
      submit: "把需求发给合作方",
      powerOptions: {
        "7.4": "7.4 kW 充电桩(单相 32 A)",
        "11": "11 kW 充电桩(三相 16 A)",
        "22": "22 kW 充电桩(三相 32 A)",
        "50": "50 kW 直流快充",
      },
    },
    request: {
      power: "需求功率",
      vehicle: "车辆",
      created: "创建时间",
      note: "备注",
      quotesTitle: (count) => `已询价安装商(${count} 家)`,
    },
    status: {
      NOUVELLE: "新需求",
      ENVOYEE_INSTALLATEURS: "等待报价",
      DEVIS_RECUS: "报价待比较",
      CHOISI: "已定安装商",
    },
    quote: {
      amount: "报价金额",
      pendingAmount: "等待报价",
      leadTime: "工期",
      leadDays: (days) => `${days} 个工作日`,
      amountPlaceholder: "金额(XOF)*",
      leadPlaceholder: "工期(天)",
      notesPlaceholder: "含材料、特殊说明",
      submit: "提交我的报价",
      choose: "选这家安装",
      awarded: "已中标",
      won: "已派工",
      rejected: "未选中",
      drafting: "报价单起草中",
      defaultCity: "科托努",
    },
    empty: "还没有需求。上面的表单就能开第一单。",
  },
  services: {
    kpi: {
      total: { label: "目录条目", hint: "在册商品与服务" },
      vehicles: { label: "车型与整车", hint: "整车目录价" },
      accessories: { label: "配件与充电桩", hint: "壁挂桩、线缆、车衣、添加剂" },
      workshop: { label: "车间与售后套餐", hint: "工时与保养" },
    },
    searchPlaceholder: "搜条目、服务或车型...",
    categories: {
      all: "全部类别",
      VEHICULE: "整车",
      ACCESSOIRE: "配件与充电桩",
      SERVICE: "服务与车间",
      PIECE: "备件",
    },
    categoryOption: {
      SERVICE: "服务 / 车间套餐",
      ACCESSOIRE: "配件与充电桩",
      VEHICULE: "目录整车",
      PIECE: "备件",
    },
    categoryBadge: {
      SERVICE: "服务",
      ACCESSOIRE: "配件",
      VEHICULE: "整车",
      PIECE: "备件",
    },
    addButton: "新增条目",
    table: {
      index: "序号",
      name: "名称",
      details: "规格说明",
      price: "单价",
      tax: "增值税",
      unit: "单位",
      category: "类别",
      status: "状态",
      actions: "操作",
    },
    empty: "没有符合这个搜索的条目。",
    taxFree: "0%(免税)",
    taxRated: (rate) => `${rate}% 增值税`,
    toggleTitle: "点击切换状态",
    editTitle: "编辑",
    deleteTitle: "删除",
    deleteConfirm: (name) => `确定删除条目“${name}”?`,
    create: {
      title: "新条目或服务",
      subtitle: "把商品、套餐或配件加进目录",
    },
    edit: {
      title: "编辑条目",
      subtitle: "更新价格与参数",
    },
    form: {
      nameLabel: "条目名称",
      namePlaceholder: "例:Type 2 线缆、保养套餐、玻璃水添加剂",
      detailsLabel: "规格说明",
      detailsPlaceholder: "技术细节、材质、适配...",
      priceLabel: "单价(XOF)",
      pricePlaceholder: "例:45000",
      categoryLabel: "类别",
      taxLabel: "增值税率",
      taxOption: {
        zero: "0%(免税)",
        eighteen: "18%(贝宁增值税)",
      },
      unitLabel: "单位",
      unitPlaceholder: "1、U、套餐、升...",
      activeLabel: "条目启用,可用于报价和发票",
      createSubmit: "保存条目",
      editSubmit: "保存修改",
      cancel: "取消",
      close: "关闭",
    },
  },
  imports: {
    intro: "安特卫普、迪拜、里窝那的到货。每张单据把库存、供应商和目录串起来。",
    form: {
      portTitle: "起运港",
      supplierTitle: "供应商",
      supplierOptional: "供应商(可选)",
      etaTitle: "预计到港",
      costPlaceholder: "成本(XOF)",
      notesPlaceholder: "备注",
      catalogHint: "预计品牌与车型(目录,可选)",
      submit: "新建进口订单",
      submitTitle: "创建进口订单",
    },
    table: {
      reference: "单号",
      port: "港口",
      supplier: "供应商",
      expected: "预计车型",
      eta: "到港",
      cost: "成本",
      vehicles: "车辆",
      status: "状态",
      action: "操作",
    },
    status: {
      COMMANDE: "已下单",
      EN_TRANSIT: "在途",
      DOUANE: "清关中",
      ARRIVE: "已到港",
      ANNULE: "已取消",
    },
    statusOption: {
      COMMANDE: "1. 已下订单",
      EN_TRANSIT: "2. 在途",
      DOUANE: "3. 清关中",
      ARRIVE: "4. 已到港",
      ANNULE: "已取消",
    },
    ports: {
      Anvers: "安特卫普",
      Dubaï: "迪拜",
      Livourne: "里窝那",
    },
    confirm: "确定",
    empty: "还没有进口订单。",
  },
  catalog: {
    intro: "CARZONE 的品牌、车型和供应商名单。库存与进口都靠它。",
    brand: {
      title: "品牌",
      placeholder: "新品牌 *",
      titleAttr: "品牌名(例:BYD、VOYAH)",
      add: "添加品牌",
      addTitle: "把品牌加进目录",
      table: { brand: "品牌", models: "车型数", status: "状态", action: "操作" },
    },
    model: {
      title: "车型",
      brandPlaceholder: "品牌 *",
      brandTitle: "所属品牌",
      modelPlaceholder: "车型名称 *",
      modelTitle: "车型名称",
      typeTitle: "车身类别",
      energyTitle: "默认能源",
      energyOptional: "能源(可选)",
      add: "添加车型",
      addTitle: "新增车型",
      table: {
        brand: "品牌",
        model: "车型",
        type: "类别",
        energy: "能源",
        status: "状态",
        action: "操作",
      },
    },
    supplier: {
      title: "供应商",
      namePlaceholder: "供应商名称 *",
      nameTitle: "名称",
      typeTitle: "类型",
      countryPlaceholder: "国家",
      cityPlaceholder: "城市 / 港口",
      contactPlaceholder: "联系人",
      emailPlaceholder: "邮箱",
      phonePlaceholder: "电话",
      notesPlaceholder: "备注",
      add: "添加供应商",
      addTitle: "新增供应商",
      table: {
        name: "名称",
        type: "类型",
        location: "国家 / 城市",
        contact: "联系人",
        phone: "电话",
        status: "状态",
        action: "操作",
      },
    },
    vehicleType: {
      SUV: "SUV",
      PICKUP: "皮卡",
      BERLINE: "轿车",
      VAN: "面包车 / 小巴",
    },
    energyKind: {
      ELECTRIQUE: "纯电",
      HYBRIDE: "混动",
      PHEV: "插电混动",
      ESSENCE: "汽油",
      DIESEL: "柴油",
    },
    supplierType: {
      IMPORT_PORT: "进口口岸",
      DEALER: "经销",
      OTHER: "其他",
    },
    toggle: { deactivate: "停用", reactivate: "重新启用" },
  },
};

export const energyCopy: Record<Locale, EnergyCopy> = { fr, en, zh };
