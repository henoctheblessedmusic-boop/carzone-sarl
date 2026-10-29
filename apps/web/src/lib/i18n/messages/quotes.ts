import type { Locale } from "@/lib/prefs";

/**
 * Dictionnaire du module DEVIS / PROFORMAS (liste, créateur, éditeur, impression).
 *
 * Règles de rédaction :
 * - FR = langue source, ton PME locale, pas de tiret cadratin.
 * - EN = anglais international, contractions naturelles.
 * - ZH = chinois simplifié, phrases courtes, marques en latin.
 * - Fidélité : montants FCFA, taux de TVA, numéros de devis, VIN, noms de clients
 *   et clauses contractuelles ne sont jamais modifiés par la traduction.
 * - Les valeurs techniques (statuts, docKind, mode fiscal HT/TTC, catégories client)
 *   restent inchangées en base ; seuls les libellés affichés changent.
 */

/** Libellés courts d'une ligne en cours de personnalisation (créateur et éditeur). */
type StagedCopy = {
  vehicleBadge: string;
  articleBadge: string;
  lineCalc: string;
};

export type QuotesCopy = {
  /** Locale utilisée pour formater les dates affichées (formatXof reste en XOF). */
  dateLocale: string;
  common: {
    cancel: string;
    close: string;
  };
  list: {
    kpi: {
      totalLabel: string;
      totalHint: string;
      pendingLabel: string;
      pendingHint: (amount: string) => string;
      confirmedLabel: string;
      confirmedHint: (amount: string) => string;
      invoicedLabel: string;
      invoicedHint: string;
    };
    searchPlaceholder: string;
    filters: {
      all: string;
      pending: string;
      confirmed: string;
      invoiced: string;
      voided: string;
    };
    table: {
      proforma: string;
      client: string;
      items: string;
      total: string;
      validity: string;
      status: string;
      actions: string;
    };
    empty: string;
    moreLines: (count: number) => string;
    discountPercent: (value: number) => string;
    discountAmount: (value: string) => string;
    sent: string;
    /** Suffixe de base fiscale affiché sous le montant ("HT", "excl. tax", "未税"). */
    amountBase: string;
    /** Suffixe TVA affiché sous le montant. */
    amountVat: (rate: number) => string;
    invoiceRef: (number: string) => string;
    actions: {
      pdfTitle: string;
      ficheLabel: string;
      ficheTitle: string;
      editLabel: string;
      editTitle: string;
      lockedLabel: string;
      lockedConfirmedTitle: string;
      lockedInvoicedTitle: string;
      lockedCancelledTitle: string;
      sendLabel: string;
      resendLabel: string;
      sendTitle: string;
      confirmLabel: string;
      confirmTitle: string;
      invoiceLabel: string;
      invoiceTitle: string;
      voidTitle: string;
      deleteTitle: string;
      clientCancelLocked: string;
      deleteConfirm: (number: string) => string;
      deleteError: string;
    };
    voidModal: {
      title: string;
      bodyLead: string;
      roleDirection: string;
      bodyMiddle: string;
      roleAccounting: string;
      bodyTail: string;
      reasonPlaceholder: string;
      confirm: string;
    };
    emailModal: {
      title: string;
      subtitleLead: string;
      taxIncluded: string;
      cgvTitle: string;
      cgvBody: (isCompany: boolean) => string;
      toLabel: string;
      toPlaceholder: string;
      subjectLabel: string;
      bodyLabel: string;
      sending: string;
      send: string;
      defaultSubject: (number: string) => string;
      defaultBody: (params: {
        contactName: string;
        number: string;
        total: string;
        taxMode: string;
        linesSummary: string;
        validUntil: string;
      }) => string;
    };
  };
  /** Statuts techniques (QuoteStatus de lib/billing.ts) vers libellés affichés. */
  statuses: Record<string, string>;
  /** Types de document (docKind) vers libellés affichés. */
  docKinds: Record<string, string>;
  creator: {
    openButton: string;
    title: string;
    subtitle: string;
    errors: {
      clientRequired: string;
      lineRequired: string;
      createFailed: string;
    };
    client: {
      label: string;
      newClient: string;
      selectPlaceholder: string;
      opportunityLabel: string;
      noOpportunity: string;
      ifuPrefix: string;
    };
    tax: {
      baseLabel: string;
      htOption: string;
      ttcOption: string;
      vatRateLabel: string;
      vatStandard: string;
      vatExempt: string;
      validityLabel: string;
      days: (count: number) => string;
    };
    quickAdd: {
      title: string;
      freeLine: string;
      articleOption: string;
      vehicleOption: string;
      vehicleStatus: {
        showroom: string;
        port: string;
        transit: string;
        production: string;
        order: string;
      };
    };
    staged: StagedCopy & {
      quantityLabel: string;
      unitPriceLabel: string;
      catalogBase: (price: string) => string;
      insert: string;
    };
    feedback: {
      emptyLineAdded: string;
      quantityIncreased: (title: string, quantity: number) => string;
      articleAdded: (title: string, quantity: number, price: string) => string;
    };
    lines: {
      header: (count: number, quantity: number) => string;
      tip: string;
      colDescription: string;
      colQuantity: string;
      colUnitPrice: string;
      colTotal: string;
      placeholder: (index: number) => string;
      decrease: string;
      increase: string;
      remove: string;
    };
    cgv: {
      title: string;
      vehicle: string;
      workshop: string;
      hideText: string;
      editText: string;
      applicable: (kind: string) => string;
      kindVehicle: string;
      kindWorkshop: string;
      reset: string;
    };
    discount: {
      title: string;
      none: string;
      percent: string;
      fixed: string;
      tiers: string;
      customRate: string;
      percentOff: (value: number) => string;
      granted: (amount: string) => string;
      amountLabel: string;
      deducted: (amount: string, percent: string) => string;
    };
    totals: {
      notesLabel: string;
      notesPlaceholder: string;
      gross: string;
      commercialDiscount: (percent: string | null) => string;
      netHt: string;
      vat: (rate: number) => string;
      totalTtc: (taxMode: string) => string;
    };
    submit: {
      creating: string;
      create: string;
    };
    newClient: {
      title: string;
      subtitle: string;
      nameLabel: string;
      namePlaceholder: string;
      companyLabel: string;
      companyPlaceholder: string;
      ifuLabel: string;
      ifuPlaceholder: string;
      ifuHint: string;
      categoryLabel: string;
      categories: {
        particulier: string;
        entreprise: string;
        ong: string;
        flotte: string;
      };
      phoneLabel: string;
      phonePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      addressLabel: string;
      addressPlaceholder: string;
      nameRequired: string;
      createFailed: string;
      creating: string;
      submit: string;
    };
  };
  editor: {
    title: (number: string) => string;
    subtitle: (status: string) => string;
    errors: {
      clientRequired: string;
      designationRequired: string;
      updateFailed: string;
      minLines: string;
    };
    clientLabel: string;
    taxModeLabel: string;
    taxHtOption: string;
    taxTtcOption: string;
    vatRateLabel: string;
    vatNormal: string;
    vatExempt: string;
    pickStock: string;
    vehicleOption: string;
    articleOption: string;
    staged: StagedCopy & {
      quantityLabel: string;
      unitPriceLabel: string;
      insert: string;
    };
    feedback: {
      emptyLineAdded: string;
      quantityIncreased: (title: string, quantity: number) => string;
      articleAdded: (title: string, quantity: number, price: string) => string;
    };
    lines: {
      header: (count: number, quantity: number) => string;
      add: string;
      placeholder: string;
      quantityTitle: string;
      unitPriceTitle: string;
      removeTitle: string;
    };
    discount: {
      title: string;
      none: string;
      percent: string;
      fixed: string;
      granted: (amount: string) => string;
      deduction: (amount: string) => string;
    };
    totals: {
      gross: string;
      commercialDiscount: string;
      netHt: string;
      vat: (rate: number) => string;
      totalTtc: (taxMode: string) => string;
    };
    notesLabel: string;
    notesPlaceholder: string;
    validityLabel: string;
    submit: {
      saving: string;
      save: string;
    };
  };
  print: {
    back: string;
    techSheetLink: (brand: string, model: string) => string;
    mailtoTitle: string;
    mailtoLabel: string;
    mailStub: string;
    companyLine: string;
    docTitle: string;
    clientBlockTitle: string;
    ifu: (value: string) => string;
    date: (value: string) => string;
    validUntil: (value: string) => string;
    taxBase: (taxMode: string, rate: number) => string;
    cgvRef: (kind: string) => string;
    cgvKindVehicle: string;
    cgvKindWorkshop: string;
    columns: {
      designation: string;
      quantity: string;
      unitPrice: string;
      amount: string;
    };
    totals: {
      gross: string;
      discount: (percent: string | null) => string;
      netHt: string;
      subtotalHt: string;
      vat: (rate: number) => string;
      totalTtc: string;
    };
    legalHeading: string;
    notes: (text: string) => string;
    footer: string;
    cgvPage: {
      title: string;
      subtitle: (number: string, kind: string) => string;
      kindVehicle: string;
      kindWorkshop: string;
      company: string;
      address: string;
      signCompanyLabel: string;
      signCompanyRole: string;
      signClientLabel: string;
      signClientAccepted: string;
      signClientStamp: string;
      annex: (title: string) => string;
      openSheet: string;
    };
    mailto: {
      subject: (number: string) => string;
      body: (number: string, total: string) => string;
    };
  };
  server: {
    deleteNormalized: string;
    missingId: string;
    customerRequired: string;
    lineRequired: string;
    quoteNotFound: string;
    quoteLocked: string;
  };
};

const fr: QuotesCopy = {
  dateLocale: "fr-BJ",
  common: {
    cancel: "Annuler",
    close: "Fermer",
  },
  list: {
    kpi: {
      totalLabel: "Proformas au total",
      totalHint: "Toutes périodes confondues.",
      pendingLabel: "En attente ou envoyées",
      pendingHint: (amount) => `${amount} encore en jeu`,
      confirmedLabel: "Commandes confirmées",
      confirmedHint: (amount) => `${amount} engagés ferme`,
      invoicedLabel: "Factures normalisées",
      invoicedHint: "Transférées en comptabilité.",
    },
    searchPlaceholder: "Chercher un N°, un client, un article...",
    filters: {
      all: "Toutes",
      pending: "En cours",
      confirmed: "Confirmées",
      invoiced: "Normalisées",
      voided: "Annulées",
    },
    table: {
      proforma: "Proforma",
      client: "Client",
      items: "Prestations",
      total: "Montant total",
      validity: "Validité",
      status: "Statut",
      actions: "Actions",
    },
    empty: "Aucune proforma ne correspond à ces filtres.",
    moreLines: (count) => `+ ${count} autre(s) ligne(s)`,
    discountPercent: (value) => `Remise -${value}%`,
    discountAmount: (value) => `Remise -${value}`,
    sent: "Envoyé",
    amountBase: "HT",
    amountVat: (rate) => `· TVA ${rate}%`,
    invoiceRef: (number) => `Facture ${number}`,
    actions: {
      pdfTitle: "Imprimer ou télécharger le PDF (proforma, CGV, fiche technique)",
      ficheLabel: "Fiche",
      ficheTitle: "Voir la fiche technique officielle (FR)",
      editLabel: "Modifier",
      editTitle: "Modifier ce devis / cette proforma",
      lockedLabel: "Figé",
      lockedConfirmedTitle: "Commande ferme : le document ne se modifie plus.",
      lockedInvoicedTitle: "Facture normalisée : document fiscal figé.",
      lockedCancelledTitle: "Document annulé en interne.",
      sendLabel: "Envoyer",
      resendLabel: "Renvoyer",
      sendTitle: "Préparer l'e-mail et ajuster le texte",
      confirmLabel: "Confirmer",
      confirmTitle: "Valider la commande ferme du client",
      invoiceLabel: "Facturer",
      invoiceTitle: "Passer en facture normalisée",
      voidTitle: "Annulation interne par la direction, motif obligatoire",
      deleteTitle: "Supprimer définitivement cette proforma",
      clientCancelLocked: "Annulation client verrouillée",
      deleteConfirm: (number) =>
        `Supprimer la proforma ${number} ? Cette action est définitive.`,
      deleteError: "La suppression n'a pas abouti.",
    },
    voidModal: {
      title: "Annulation interne d'un devis",
      bodyLead: "Réservé à la ",
      roleDirection: "Direction Générale",
      bodyMiddle: " et à la ",
      roleAccounting: "Comptabilité",
      bodyTail:
        ". Le motif écrit est obligatoire : 8 caractères minimum, et il reste audité.",
      reasonPlaceholder:
        "Exemple : le client a décliné après essai / projet reporté / remplacé par PRO-...",
      confirm: "Confirmer l'annulation",
    },
    emailModal: {
      title: "Envoyer la proforma par e-mail",
      subtitleLead: "Proforma",
      taxIncluded: "TTC",
      cgvTitle: "CGV jointes automatiquement (page 2)",
      cgvBody: (isCompany) =>
        `Le document officiel reprend les clauses (${isCompany ? "Professionnel" : "Particulier"}), les garanties batterie et véhicule, et la livraison au showroom Zone Maro-Militaire, Gbèdomidji.`,
      toLabel: "Destinataire (e-mail du client) *",
      toPlaceholder: "contact@client.bj",
      subjectLabel: "Objet de l'e-mail *",
      bodyLabel: "Message (ajustable selon l'échange au showroom) *",
      sending: "Envoi en cours...",
      send: "Envoyer au client",
      defaultSubject: (number) => `Facture proforma ${number} · CARZONE SARL`,
      defaultBody: (params) => `Bonjour ${params.contactName},

Vous trouverez ci-joint votre devis proforma ${params.number}, d'un montant total de ${params.total} (${params.taxMode}).

Le détail :
${params.linesSummary}

Ce devis reste valable jusqu'au ${params.validUntil}.

Nos conditions générales de vente sont jointes en page 2 du document officiel : garanties batterie 8 ans et véhicule 5 ans, SAV, livraison au showroom, conditions de paiement.

On reste à votre disposition pour valider la commande. Un essai au showroom est possible quand vous voulez.

Bien cordialement,
L'équipe commerciale CARZONE SARL
Showroom Zone Maro-Militaire, Gbèdomidji · Cotonou, Bénin
Tél : +229 21 33 00 00 / 97 00 00 00
Web : www.topcarzone.com`,
    },
  },
  statuses: {
    BROUILLON: "Brouillon",
    PROFORMA_ENVOYEE: "Proforma envoyée",
    COMMANDE_CONFIRMEE: "Commande confirmée (ferme)",
    FACTURE_NORMALISEE: "Facture normalisée",
    ANNULEE_INTERNE: "Annulée (interne)",
    ENVOYE: "Envoyé (ancien)",
    ACCEPTE: "Accepté (ancien)",
    REJETE: "Rejeté",
  },
  docKinds: {
    PROFORMA: "Proforma",
  },
  creator: {
    openButton: "Nouvelle proforma multi-lignes",
    title: "Créer un devis proforma",
    subtitle:
      "CARZONE SARL · Showroom Zone Maro-Militaire, Gbèdomidji, Cotonou · Catalogue et véhicules",
    errors: {
      clientRequired: "Sélectionnez d'abord le client.",
      lineRequired: "Ajoutez au moins une ligne avec une désignation.",
      createFailed: "La proforma n'a pas pu être créée.",
    },
    client: {
      label: "Client destinataire *",
      newClient: "+ Nouveau client",
      selectPlaceholder: "-- Choisir un client --",
      opportunityLabel: "Opportunité commerciale (facultatif)",
      noOpportunity: "-- Aucune opportunité liée --",
      ifuPrefix: "IFU : ",
    },
    tax: {
      baseLabel: "Base fiscale",
      htOption: "Montants HT",
      ttcOption: "Montants TTC",
      vatRateLabel: "Taux TVA",
      vatStandard: "18 % (normal)",
      vatExempt: "0 % (exonéré)",
      validityLabel: "Validité",
      days: (count) => `${count} jours`,
    },
    quickAdd: {
      title: "⚡ Ajout rapide, catalogue et stock",
      freeLine: "+ Ligne libre",
      articleOption: "⚡ + Article / Borne / Service...",
      vehicleOption: "🚗 + Véhicule en stock ou en arrivage...",
      vehicleStatus: {
        showroom: "🟢 Showroom",
        port: "⚓ Au port",
        transit: "🚢 En transit",
        production: "🏭 Production",
        order: "📋 Commande",
      },
    },
    staged: {
      vehicleBadge: "🚗 VÉHICULE EN STOCK",
      articleBadge: "⚡ ARTICLE / SERVICE",
      quantityLabel: "Quantité à ajouter",
      unitPriceLabel: "Prix unitaire (négociable)",
      catalogBase: (price) => `Base catalogue : ${price}`,
      lineCalc: "Ligne calculée",
      insert: "Insérer dans le devis",
    },
    feedback: {
      emptyLineAdded: "Nouvelle ligne vide ajoutée.",
      quantityIncreased: (title, quantity) =>
        `${title} passe à ${quantity} unité(s).`,
      articleAdded: (title, quantity, price) =>
        `${title} ajouté (${quantity}x ${price}).`,
    },
    lines: {
      header: (count, quantity) =>
        `Lignes du devis (${count}) · ${quantity} article(s)`,
      tip: "💡 Désignation, quantité et prix se modifient directement sur chaque ligne.",
      colDescription: "Désignation",
      colQuantity: "Qté",
      colUnitPrice: "P.U. (XOF)",
      colTotal: "Total",
      placeholder: (index) =>
        `Ligne ${index} · ex. TOYOTA COROLLA CROSS, borne Wallbox...`,
      decrease: "Diminuer la quantité",
      increase: "Augmenter la quantité",
      remove: "Supprimer cette ligne",
    },
    cgv: {
      title: "📜 CGV jointes en page 2",
      vehicle: "🚗 Véhicules",
      workshop: "🔧 Atelier SAV",
      hideText: "Masquer le texte",
      editText: "Ajuster le texte",
      applicable: (kind) => `Texte applicable (${kind}) :`,
      kindVehicle: "Vente véhicules",
      kindWorkshop: "Atelier SAV",
      reset: "↺ Revenir au texte officiel",
    },
    discount: {
      title: "Stratégie commerciale et remise",
      none: "Sans remise",
      percent: "% Pourcentage",
      fixed: "Montant fixe",
      tiers: "Paliers rapides",
      customRate: "Taux libre",
      percentOff: (value) => `-${value} %`,
      granted: (amount) => `Remise accordée : -${amount}, déduite du brut`,
      amountLabel: "Montant de la remise",
      deducted: (amount, percent) =>
        `Remise déduite : -${amount} (${percent} % du brut)`,
    },
    totals: {
      notesLabel: "Notes et conditions particulières (imprimées sur le devis)",
      notesPlaceholder:
        "Ex. Livraison sous 48h au showroom (Zone Maro-Militaire, Gbèdomidji). Câble de recharge Type 2 et première révision offerts. Garantie batterie 8 ans / 150 000 km.",
      gross: "Sous-total brut HT",
      commercialDiscount: (percent) =>
        percent ? `Remise commerciale (-${percent} %)` : "Remise commerciale",
      netHt: "Net commercial HT",
      vat: (rate) => `TVA Bénin (${rate} %)`,
      totalTtc: (taxMode) => `Total TTC net (${taxMode})`,
    },
    submit: {
      creating: "Génération...",
      create: "Créer la proforma",
    },
    newClient: {
      title: "Nouveau client (ajout express)",
      subtitle: "Coordonnées et identifiant fiscal IFU pour le devis",
      nameLabel: "Nom et prénom du contact *",
      namePlaceholder: "Ex. Dr Nadine HOUVI, M. Michel DOSSOU",
      companyLabel: "Entreprise / société (facultatif)",
      companyPlaceholder: "Ex. Benin Logistics SA, Cabinet Alpha...",
      ifuLabel: "N° IFU Bénin (fiscal)",
      ifuPlaceholder: "Ex. 0201910815523",
      ifuHint: "Requis pour la facture et l'ANaTT",
      categoryLabel: "Catégorie",
      categories: {
        particulier: "Particulier",
        entreprise: "Entreprise",
        ong: "ONG / Diplomate",
        flotte: "Flotte",
      },
      phoneLabel: "Téléphone",
      phonePlaceholder: "+229 01 97 00 00 00",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "client@domaine.bj",
      addressLabel: "Adresse physique (showroom / livraison)",
      addressPlaceholder: "Ex. Haie Vive, rue 340, Cotonou",
      nameRequired: "Le nom du client est obligatoire.",
      createFailed: "Le client n'a pas pu être créé.",
      creating: "Création...",
      submit: "Enregistrer et sélectionner",
    },
  },
  editor: {
    title: (number) => `✏️ Modifier la proforma ${number}`,
    subtitle: (status) =>
      `Statut : ${status}. Modifiable jusqu'à la validation en commande ferme.`,
    errors: {
      clientRequired: "Sélectionnez un client.",
      designationRequired: "Chaque ligne doit avoir une désignation.",
      updateFailed: "La mise à jour de la proforma a échoué.",
      minLines: "Une proforma doit garder au moins une ligne.",
    },
    clientLabel: "Client destinataire *",
    taxModeLabel: "Mode fiscal",
    taxHtOption: "Hors taxes (HT)",
    taxTtcOption: "Toutes taxes (TTC)",
    vatRateLabel: "Taux TVA",
    vatNormal: "18 % (taux normal)",
    vatExempt: "0 % (exonéré / export)",
    pickStock: "+ Piocher dans le stock ou le catalogue :",
    vehicleOption: "🚗 + Sélectionner un véhicule en stock...",
    articleOption: "⚡ + Sélectionner un article / service...",
    staged: {
      vehicleBadge: "🚗 VÉHICULE EN STOCK",
      articleBadge: "⚡ ARTICLE / SERVICE",
      quantityLabel: "Quantité",
      unitPriceLabel: "Prix unitaire (modifiable)",
      lineCalc: "Ligne calculée",
      insert: "Insérer",
    },
    feedback: {
      emptyLineAdded: "Nouvelle ligne vide ajoutée.",
      quantityIncreased: (title, quantity) =>
        `${title} passe à ${quantity} unité(s).`,
      articleAdded: (title, quantity, price) =>
        `${title} ajouté (${quantity}x à ${price}).`,
    },
    lines: {
      header: (count, quantity) =>
        `Lignes de la proforma (${count}) · ${quantity} article(s)`,
      add: "Ajouter une ligne vide",
      placeholder: "Désignation de la prestation ou du véhicule *",
      quantityTitle: "Quantité",
      unitPriceTitle: "Prix unitaire XOF",
      removeTitle: "Supprimer cette ligne",
    },
    discount: {
      title: "Stratégie commerciale et remise",
      none: "Sans remise",
      percent: "% Pourcentage",
      fixed: "Montant fixe",
      granted: (amount) => `Remise accordée : -${amount}`,
      deduction: (amount) => `Déduction de -${amount}`,
    },
    totals: {
      gross: "Sous-total brut HT",
      commercialDiscount: "Remise commerciale",
      netHt: "Net commercial HT",
      vat: (rate) => `TVA (${rate} %)`,
      totalTtc: (taxMode) => `Montant total TTC net (${taxMode})`,
    },
    notesLabel: "Notes et observations (facultatif)",
    notesPlaceholder: "Conditions particulières, délai de livraison, remise...",
    validityLabel: "Validité (jours)",
    submit: {
      saving: "Enregistrement...",
      save: "Enregistrer les modifications",
    },
  },
  print: {
    back: "← Retour aux devis",
    techSheetLink: (brand, model) => `Fiche technique (${brand} ${model})`,
    mailtoTitle: "Ouvre votre logiciel de messagerie",
    mailtoLabel: "Ouvrir l'e-mail (mailto)",
    mailStub: "E-mail serveur : bouchon vers le journal console, SMTP pas encore branché",
    companyLine: "SARL · Zone Maro-Militaire, Gbèdomidji · Cotonou",
    docTitle: "FACTURE PROFORMA",
    clientBlockTitle: "Client",
    ifu: (value) => `N° IFU : ${value}`,
    date: (value) => `Date : ${value}`,
    validUntil: (value) => `Validité : ${value}`,
    taxBase: (taxMode, rate) => `Base : ${taxMode} · TVA ${rate} %`,
    cgvRef: (kind) => `Réf. CGV : ${kind}`,
    cgvKindVehicle: "Vente véhicules showroom",
    cgvKindWorkshop: "Atelier SAV Carzone Cotonou",
    columns: {
      designation: "Désignation",
      quantity: "Qté",
      unitPrice: "P.U.",
      amount: "Montant",
    },
    totals: {
      gross: "Sous-total brut HT",
      discount: (percent) =>
        percent ? `Remise commerciale (-${percent} %)` : "Remise commerciale accordée",
      netHt: "Net commercial HT",
      subtotalHt: "Sous-total HT",
      vat: (rate) => `TVA (${rate} %)`,
      totalTtc: "Total TTC",
    },
    legalHeading: "Mention légale et comptable",
    notes: (text) => `Notes : ${text}`,
    footer:
      "Document proforma. Il ne devient fiscal qu'après conversion en facture normalisée. Une commande confirmée dans CARZONE ne s'annule pas unilatéralement côté client (stock, import, engagements bancaires déjà pris). L'annulation interne passe par la DG et la comptabilité, avec un motif écrit.",
    cgvPage: {
      title: "CONDITIONS GÉNÉRALES DE VENTE ET DE GARANTIE",
      subtitle: (number, kind) =>
        `Adossées à la facture proforma n° ${number} · ${kind}`,
      kindVehicle: "Vente de véhicules (showroom et import)",
      kindWorkshop: "Prestations atelier SAV et réparations",
      company: "CARZONE SARL (showroom et mobilité)",
      address: "Zone Maro-Militaire, quartier Gbèdomidji · Cotonou",
      signCompanyLabel: "Pour CARZONE SARL Bénin :",
      signCompanyRole: "Direction commerciale / signature et cachet",
      signClientLabel: "Pour le client :",
      signClientAccepted: "« Lu et approuvé, bon pour accord »",
      signClientStamp: "Signature et cachet du client",
      annex: (title) => `📄 Dossier annexe : fiche technique · ${title}`,
      openSheet: "Ouvrir la fiche seule ↗",
    },
    mailto: {
      subject: (number) => `Proforma ${number} · CARZONE`,
      body: (number, total) =>
        `Bonjour,\n\nVoici la facture proforma ${number}, pour un total de ${total}.\n\nBien cordialement,\nCARZONE`,
    },
  },
  server: {
    deleteNormalized:
      "Suppression impossible : cette proforma est déjà passée en facture normalisée.",
    missingId: "Identifiant du devis manquant.",
    customerRequired: "Le client est obligatoire.",
    lineRequired: "Il faut au moins une ligne.",
    quoteNotFound: "Devis introuvable.",
    quoteLocked:
      "Ce document est validé en commande ferme ou en facture normalisée. Il ne se modifie plus.",
  },
};

const en: QuotesCopy = {
  dateLocale: "en-GB",
  common: {
    cancel: "Cancel",
    close: "Close",
  },
  list: {
    kpi: {
      totalLabel: "Proformas overall",
      totalHint: "Every period combined.",
      pendingLabel: "Pending or sent",
      pendingHint: (amount) => `${amount} still in play`,
      confirmedHint: (amount) => `${amount} firmly committed`,
      confirmedLabel: "Confirmed orders",
      invoicedLabel: "Normalised invoices",
      invoicedHint: "Handed over to accounting.",
    },
    searchPlaceholder: "Search a number, a client, an item...",
    filters: {
      all: "All",
      pending: "In progress",
      confirmed: "Confirmed",
      invoiced: "Normalised",
      voided: "Voided",
    },
    table: {
      proforma: "Proforma",
      client: "Client",
      items: "Line items",
      total: "Total amount",
      validity: "Valid until",
      status: "Status",
      actions: "Actions",
    },
    empty: "No proforma matches these filters.",
    moreLines: (count) => `+ ${count} more line(s)`,
    discountPercent: (value) => `Discount -${value}%`,
    discountAmount: (value) => `Discount -${value}`,
    sent: "Sent",
    amountBase: "excl. tax",
    amountVat: (rate) => `· VAT ${rate}%`,
    invoiceRef: (number) => `Invoice ${number}`,
    actions: {
      pdfTitle: "Print or download the PDF (proforma, terms, spec sheet)",
      ficheLabel: "Spec sheet",
      ficheTitle: "Open the official spec sheet (French)",
      editLabel: "Edit",
      editTitle: "Edit this quote / proforma",
      lockedLabel: "Locked",
      lockedConfirmedTitle: "Firm order: the document can no longer be edited.",
      lockedInvoicedTitle: "Normalised invoice: frozen tax document.",
      lockedCancelledTitle: "Document voided internally.",
      sendLabel: "Send",
      resendLabel: "Send again",
      sendTitle: "Prepare the email and adjust the wording",
      confirmLabel: "Confirm",
      confirmTitle: "Confirm the client's firm order",
      invoiceLabel: "Invoice",
      invoiceTitle: "Turn into a normalised invoice",
      voidTitle: "Internal void by management, reason required",
      deleteTitle: "Delete this proforma for good",
      clientCancelLocked: "Client cancellation locked",
      deleteConfirm: (number) =>
        `Delete proforma ${number}? This cannot be undone.`,
      deleteError: "The deletion did not go through.",
    },
    voidModal: {
      title: "Internal void of a quote",
      bodyLead: "Restricted to ",
      roleDirection: "General Management",
      bodyMiddle: " and ",
      roleAccounting: "Accounting",
      bodyTail:
        ". A written reason is mandatory: 8 characters minimum, and it stays audited.",
      reasonPlaceholder:
        "Example: client turned the model down after the test drive / project postponed / replaced by PRO-...",
      confirm: "Confirm the void",
    },
    emailModal: {
      title: "Send the proforma by email",
      subtitleLead: "Proforma",
      taxIncluded: "incl. tax",
      cgvTitle: "Terms attached automatically (page 2)",
      cgvBody: (isCompany) =>
        `The official document carries the contract clauses (${isCompany ? "Business" : "Individual"}), the battery and vehicle warranties, and delivery at the showroom, Zone Maro-Militaire, Gbèdomidji.`,
      toLabel: "Recipient (client email) *",
      toPlaceholder: "contact@client.bj",
      subjectLabel: "Email subject *",
      bodyLabel: "Message (adjust it to the showroom conversation) *",
      sending: "Sending...",
      send: "Send to the client",
      defaultSubject: (number) => `Proforma invoice ${number} · CARZONE SARL`,
      defaultBody: (params) => `Hello ${params.contactName},

Please find your proforma invoice ${params.number} attached, for a total of ${params.total} (${params.taxMode}).

The breakdown:
${params.linesSummary}

This proforma holds until ${params.validUntil}.

Our general terms are attached on page 2 of the official document: 8-year battery warranty, 5-year vehicle warranty, after-sales service, showroom delivery and payment terms.

We're here whenever you want to confirm the order. A test drive at the showroom is easy to arrange.

Best regards,
The CARZONE SARL sales team
Showroom Zone Maro-Militaire, Gbèdomidji · Cotonou, Benin
Tel: +229 21 33 00 00 / 97 00 00 00
Web: www.topcarzone.com`,
    },
  },
  statuses: {
    BROUILLON: "Draft",
    PROFORMA_ENVOYEE: "Proforma sent",
    COMMANDE_CONFIRMEE: "Order confirmed (firm)",
    FACTURE_NORMALISEE: "Normalised invoice",
    ANNULEE_INTERNE: "Voided (internal)",
    ENVOYE: "Sent (legacy)",
    ACCEPTE: "Accepted (legacy)",
    REJETE: "Rejected",
  },
  docKinds: {
    PROFORMA: "Proforma",
  },
  creator: {
    openButton: "New multi-line proforma",
    title: "Create a proforma quote",
    subtitle:
      "CARZONE SARL · Showroom Zone Maro-Militaire, Gbèdomidji, Cotonou · Catalogue and vehicles",
    errors: {
      clientRequired: "Pick the client first.",
      lineRequired: "Add at least one line with a description.",
      createFailed: "The proforma could not be created.",
    },
    client: {
      label: "Client *",
      newClient: "+ New client",
      selectPlaceholder: "-- Choose a client --",
      opportunityLabel: "Sales opportunity (optional)",
      noOpportunity: "-- No linked opportunity --",
      ifuPrefix: "Tax ID: ",
    },
    tax: {
      baseLabel: "Tax basis",
      htOption: "Amounts excl. tax",
      ttcOption: "Amounts incl. tax",
      vatRateLabel: "VAT rate",
      vatStandard: "18% (standard)",
      vatExempt: "0% (exempt)",
      validityLabel: "Valid for",
      days: (count) => `${count} days`,
    },
    quickAdd: {
      title: "⚡ Quick add from the catalogue and stock",
      freeLine: "+ Free line",
      articleOption: "⚡ + Article / charger / service...",
      vehicleOption: "🚗 + Vehicle in stock or inbound...",
      vehicleStatus: {
        showroom: "🟢 Showroom",
        port: "⚓ At port",
        transit: "🚢 In transit",
        production: "🏭 Production",
        order: "📋 Ordered",
      },
    },
    staged: {
      vehicleBadge: "🚗 VEHICLE IN STOCK",
      articleBadge: "⚡ ARTICLE / SERVICE",
      quantityLabel: "Quantity to add",
      unitPriceLabel: "Unit price (negotiable)",
      catalogBase: (price) => `Catalogue price: ${price}`,
      lineCalc: "Line total",
      insert: "Add to the quote",
    },
    feedback: {
      emptyLineAdded: "Empty line added.",
      quantityIncreased: (title, quantity) =>
        `${title} is now ${quantity} unit(s).`,
      articleAdded: (title, quantity, price) =>
        `${title} added (${quantity}x ${price}).`,
    },
    lines: {
      header: (count, quantity) =>
        `Quote lines (${count}) · ${quantity} item(s) in total`,
      tip: "💡 Description, quantity and price are edited straight on each line.",
      colDescription: "Description",
      colQuantity: "Qty",
      colUnitPrice: "Unit (XOF)",
      colTotal: "Total",
      placeholder: (index) =>
        `Line ${index} · e.g. TOYOTA COROLLA CROSS, Wallbox charger...`,
      decrease: "Decrease the quantity",
      increase: "Increase the quantity",
      remove: "Remove this line",
    },
    cgv: {
      title: "📜 Terms attached on page 2",
      vehicle: "🚗 Vehicles",
      workshop: "🔧 Aftersales",
      hideText: "Hide the text",
      editText: "Adjust the text",
      applicable: (kind) => `Applicable wording (${kind}):`,
      kindVehicle: "Vehicle sales",
      kindWorkshop: "Aftersales workshop",
      reset: "↺ Back to the official wording",
    },
    discount: {
      title: "Pricing strategy and discount",
      none: "No discount",
      percent: "% Percentage",
      fixed: "Fixed amount",
      tiers: "Quick tiers",
      customRate: "Custom rate",
      percentOff: (value) => `-${value}%`,
      granted: (amount) => `Discount granted: -${amount}, off the gross total`,
      amountLabel: "Discount amount",
      deducted: (amount, percent) =>
        `Discount taken: -${amount} (${percent}% of the gross)`,
    },
    totals: {
      notesLabel: "Notes and special conditions (printed on the quote)",
      notesPlaceholder:
        "E.g. Delivery within 48h at the showroom (Zone Maro-Militaire, Gbèdomidji). Type 2 charging cable and first service included. 8-year battery warranty / 150,000 km.",
      gross: "Gross subtotal excl. tax",
      commercialDiscount: (percent) =>
        percent ? `Commercial discount (-${percent}%)` : "Commercial discount",
      netHt: "Commercial net excl. tax",
      vat: (rate) => `Benin VAT (${rate}%)`,
      totalTtc: (taxMode) => `Net total incl. tax (${taxMode})`,
    },
    submit: {
      creating: "Generating...",
      create: "Create the proforma",
    },
    newClient: {
      title: "New client (express add)",
      subtitle: "Contact details and tax ID for the quote",
      nameLabel: "Contact full name *",
      namePlaceholder: "E.g. Dr Nadine HOUVI, Mr Michel DOSSOU",
      companyLabel: "Company (optional)",
      companyPlaceholder: "E.g. Benin Logistics SA, Cabinet Alpha...",
      ifuLabel: "Benin tax ID (IFU)",
      ifuPlaceholder: "E.g. 0201910815523",
      ifuHint: "Required for the invoice and ANaTT",
      categoryLabel: "Category",
      categories: {
        particulier: "Individual",
        entreprise: "Company",
        ong: "NGO / Diplomat",
        flotte: "Fleet",
      },
      phoneLabel: "Phone",
      phonePlaceholder: "+229 01 97 00 00 00",
      emailLabel: "Email address",
      emailPlaceholder: "client@domain.bj",
      addressLabel: "Physical address (showroom / delivery)",
      addressPlaceholder: "E.g. Haie Vive, Rue 340, Cotonou",
      nameRequired: "The client name is required.",
      createFailed: "The client could not be created.",
      creating: "Creating...",
      submit: "Save and select",
    },
  },
  editor: {
    title: (number) => `✏️ Edit proforma ${number}`,
    subtitle: (status) =>
      `Current status: ${status}. Editable until it is confirmed as a firm order.`,
    errors: {
      clientRequired: "Select a client.",
      designationRequired: "Every line needs a description.",
      updateFailed: "The proforma update failed.",
      minLines: "A proforma keeps at least one line.",
    },
    clientLabel: "Client *",
    taxModeLabel: "Tax mode",
    taxHtOption: "Excluding tax (HT)",
    taxTtcOption: "All taxes included (TTC)",
    vatRateLabel: "VAT rate",
    vatNormal: "18% (standard rate)",
    vatExempt: "0% (exempt / export)",
    pickStock: "+ Pick from stock or catalogue:",
    vehicleOption: "🚗 + Select a vehicle in stock...",
    articleOption: "⚡ + Select an article / service...",
    staged: {
      vehicleBadge: "🚗 VEHICLE IN STOCK",
      articleBadge: "⚡ ARTICLE / SERVICE",
      quantityLabel: "Quantity",
      unitPriceLabel: "Unit price (editable)",
      lineCalc: "Line total",
      insert: "Insert",
    },
    feedback: {
      emptyLineAdded: "Empty line added.",
      quantityIncreased: (title, quantity) =>
        `${title} is now ${quantity} unit(s).`,
      articleAdded: (title, quantity, price) =>
        `${title} added (${quantity}x at ${price}).`,
    },
    lines: {
      header: (count, quantity) =>
        `Proforma lines (${count}) · ${quantity} item(s) in total`,
      add: "Add an empty line",
      placeholder: "Service or vehicle description *",
      quantityTitle: "Quantity",
      unitPriceTitle: "Unit price XOF",
      removeTitle: "Remove this line",
    },
    discount: {
      title: "Pricing strategy and discount",
      none: "No discount",
      percent: "% Percentage",
      fixed: "Fixed amount",
      granted: (amount) => `Discount granted: -${amount}`,
      deduction: (amount) => `Deduction of -${amount}`,
    },
    totals: {
      gross: "Gross subtotal excl. tax",
      commercialDiscount: "Commercial discount",
      netHt: "Commercial net excl. tax",
      vat: (rate) => `VAT (${rate}%)`,
      totalTtc: (taxMode) => `Net total incl. tax (${taxMode})`,
    },
    notesLabel: "Notes and observations (optional)",
    notesPlaceholder: "Special conditions, delivery lead time, discount...",
    validityLabel: "Valid for (days)",
    submit: {
      saving: "Saving...",
      save: "Save the changes",
    },
  },
  print: {
    back: "← Back to quotes",
    techSheetLink: (brand, model) => `Spec sheet (${brand} ${model})`,
    mailtoTitle: "Opens your mail app",
    mailtoLabel: "Open email (mailto)",
    mailStub: "Server email: stub to the console log, SMTP not wired yet",
    companyLine: "SARL · Zone Maro-Militaire, Gbèdomidji · Cotonou",
    docTitle: "PROFORMA INVOICE",
    clientBlockTitle: "Client",
    ifu: (value) => `Tax ID: ${value}`,
    date: (value) => `Date: ${value}`,
    validUntil: (value) => `Valid until: ${value}`,
    taxBase: (taxMode, rate) => `Basis: ${taxMode} · VAT ${rate}%`,
    cgvRef: (kind) => `Terms ref.: ${kind}`,
    cgvKindVehicle: "Showroom vehicle sales",
    cgvKindWorkshop: "Carzone Cotonou aftersales workshop",
    columns: {
      designation: "Description",
      quantity: "Qty",
      unitPrice: "Unit price",
      amount: "Amount",
    },
    totals: {
      gross: "Gross subtotal excl. tax",
      discount: (percent) =>
        percent ? `Commercial discount (-${percent}%)` : "Commercial discount granted",
      netHt: "Commercial net excl. tax",
      subtotalHt: "Subtotal excl. tax",
      vat: (rate) => `VAT (${rate}%)`,
      totalTtc: "Total incl. tax",
    },
    legalHeading: "Legal and accounting statement",
    notes: (text) => `Notes: ${text}`,
    footer:
      "Proforma document. It only becomes a tax document once converted into a normalised invoice. A confirmed order inside CARZONE cannot be cancelled unilaterally by the client (stock, imports and bank commitments are already engaged). Internal voiding is handled by Management and Accounting, with a written reason.",
    cgvPage: {
      title: "GENERAL TERMS OF SALE AND WARRANTY",
      subtitle: (number, kind) => `Attached to proforma invoice no. ${number} · ${kind}`,
      kindVehicle: "Vehicle sales (showroom and import)",
      kindWorkshop: "Aftersales workshop work and repairs",
      company: "CARZONE SARL (showroom and mobility)",
      address: "Zone Maro-Militaire, Gbèdomidji district · Cotonou",
      signCompanyLabel: "For CARZONE SARL Benin:",
      signCompanyRole: "Sales management / signature and stamp",
      signClientLabel: "For the client:",
      signClientAccepted: "“Read and approved, good for agreement”",
      signClientStamp: "Client signature and stamp",
      annex: (title) => `📄 Annex file: spec sheet · ${title}`,
      openSheet: "Open the sheet alone ↗",
    },
    mailto: {
      subject: (number) => `Proforma ${number} · CARZONE`,
      body: (number, total) =>
        `Hello,\n\nHere is proforma invoice ${number}, for a total of ${total}.\n\nBest regards,\nCARZONE`,
    },
  },
  server: {
    deleteNormalized:
      "Deletion refused: this proforma has already been converted into a normalised invoice.",
    missingId: "The quote identifier is missing.",
    customerRequired: "A client is required.",
    lineRequired: "At least one line is required.",
    quoteNotFound: "Quote not found.",
    quoteLocked:
      "This document is confirmed as a firm order or as a normalised invoice. It can no longer be edited.",
  },
};

const zh: QuotesCopy = {
  dateLocale: "zh-CN",
  common: {
    cancel: "取消",
    close: "关闭",
  },
  list: {
    kpi: {
      totalLabel: "全部形式发票",
      totalHint: "包含所有时间段。",
      pendingLabel: "待处理 / 已发送",
      pendingHint: (amount) => `${amount} 仍在跟进`,
      confirmedLabel: "已确认订单",
      confirmedHint: (amount) => `${amount} 已锁定`,
      invoicedLabel: "已开具正式发票",
      invoicedHint: "已转入财务。",
    },
    searchPlaceholder: "搜索编号、客户或项目...",
    filters: {
      all: "全部",
      pending: "进行中",
      confirmed: "已确认",
      invoiced: "已规范化",
      voided: "已作废",
    },
    table: {
      proforma: "形式发票",
      client: "客户",
      items: "项目",
      total: "金额合计",
      validity: "有效期",
      status: "状态",
      actions: "操作",
    },
    empty: "没有符合筛选条件的形式发票。",
    moreLines: (count) => `另有 ${count} 行`,
    discountPercent: (value) => `折扣 -${value}%`,
    discountAmount: (value) => `折扣 -${value}`,
    sent: "已发送",
    amountBase: "未税",
    amountVat: (rate) => `· 增值税 ${rate}%`,
    invoiceRef: (number) => `发票 ${number}`,
    actions: {
      pdfTitle: "打印或下载 PDF(形式发票、条款、配置单)",
      ficheLabel: "配置单",
      ficheTitle: "查看官方配置单(法语版)",
      editLabel: "修改",
      editTitle: "修改此报价单 / 形式发票",
      lockedLabel: "已锁定",
      lockedConfirmedTitle: "正式订单:文件已不可修改。",
      lockedInvoicedTitle: "正式发票:税务文件已冻结。",
      lockedCancelledTitle: "文件已在内部作废。",
      sendLabel: "发送",
      resendLabel: "重新发送",
      sendTitle: "编辑邮件内容后发送",
      confirmLabel: "确认",
      confirmTitle: "确认客户的正式订单",
      invoiceLabel: "开票",
      invoiceTitle: "转为正式发票",
      voidTitle: "由管理层内部作废,必须填写原因",
      deleteTitle: "永久删除此形式发票",
      clientCancelLocked: "客户已无法取消",
      deleteConfirm: (number) => `确认永久删除形式发票 ${number}?`,
      deleteError: "删除未完成。",
    },
    voidModal: {
      title: "内部作废形式发票",
      bodyLead: "仅限",
      roleDirection: "总经理办公室",
      bodyMiddle: "与",
      roleAccounting: "财务部",
      bodyTail: "操作。必须填写书面原因,至少 8 个字符,并会留档审计。",
      reasonPlaceholder: "例如:客户试驾后放弃 / 项目延期 / 已由 PRO-... 替代",
      confirm: "确认作废",
    },
    emailModal: {
      title: "通过邮件发送形式发票",
      subtitleLead: "形式发票",
      taxIncluded: "含税",
      cgvTitle: "销售条款已自动附在第 2 页",
      cgvBody: (isCompany) =>
        `正式文件包含合同条款(${isCompany ? "企业客户" : "个人客户"})、电池与整车质保,以及 Gbèdomidji 区 Maro-Militaire 展厅交车安排。`,
      toLabel: "收件人(客户邮箱)*",
      toPlaceholder: "contact@client.bj",
      subjectLabel: "邮件主题 *",
      bodyLabel: "邮件正文(可按展厅沟通情况调整)*",
      sending: "发送中...",
      send: "发送给客户",
      defaultSubject: (number) => `形式发票 ${number} · CARZONE SARL`,
      defaultBody: (params) => `${params.contactName} 您好:

随信附上编号 ${params.number} 的形式发票,总金额 ${params.total}(${params.taxMode})。

明细如下:
${params.linesSummary}

本报价有效期至 ${params.validUntil}。

销售条款附在正式文件第 2 页:电池质保 8 年、整车质保 5 年、售后维修、展厅交车与付款方式。

需要确认订单时随时联系我们。想试驾,来展厅随时安排。

顺祝商祺,
CARZONE SARL 销售团队
展厅:Zone Maro-Militaire, Gbèdomidji · 科托努,贝宁
电话:+229 21 33 00 00 / 97 00 00 00
网址:www.topcarzone.com`,
    },
  },
  statuses: {
    BROUILLON: "草稿",
    PROFORMA_ENVOYEE: "已发送形式发票",
    COMMANDE_CONFIRMEE: "订单已确认(正式)",
    FACTURE_NORMALISEE: "正式发票",
    ANNULEE_INTERNE: "已作废(内部)",
    ENVOYE: "已发送(旧)",
    ACCEPTE: "已接受(旧)",
    REJETE: "已拒绝",
  },
  docKinds: {
    PROFORMA: "形式发票",
  },
  creator: {
    openButton: "新建多行形式发票",
    title: "创建形式发票",
    subtitle:
      "CARZONE SARL · 展厅 Zone Maro-Militaire, Gbèdomidji, 科托努 · 产品目录与车辆",
    errors: {
      clientRequired: "请先选择客户。",
      lineRequired: "请至少添加一行并填写名称。",
      createFailed: "形式发票创建失败。",
    },
    client: {
      label: "客户 *",
      newClient: "+ 新客户",
      selectPlaceholder: "-- 选择客户 --",
      opportunityLabel: "销售机会(可选)",
      noOpportunity: "-- 无关联机会 --",
      ifuPrefix: "税号:",
    },
    tax: {
      baseLabel: "计税基础",
      htOption: "未税金额",
      ttcOption: "含税金额",
      vatRateLabel: "增值税率",
      vatStandard: "18 %(标准)",
      vatExempt: "0 %(免税)",
      validityLabel: "有效期",
      days: (count) => `${count} 天`,
    },
    quickAdd: {
      title: "⚡ 从目录与库存快速添加",
      freeLine: "+ 空白行",
      articleOption: "⚡ + 商品 / 充电桩 / 服务...",
      vehicleOption: "🚗 + 库存或在途车辆...",
      vehicleStatus: {
        showroom: "🟢 展厅",
        port: "⚓ 港口",
        transit: "🚢 海运中",
        production: "🏭 生产中",
        order: "📋 已订",
      },
    },
    staged: {
      vehicleBadge: "🚗 库存车辆",
      articleBadge: "⚡ 商品 / 服务",
      quantityLabel: "添加数量",
      unitPriceLabel: "单价(可议价)",
      catalogBase: (price) => `目录价:${price}`,
      lineCalc: "行金额",
      insert: "插入报价单",
    },
    feedback: {
      emptyLineAdded: "已添加空白行。",
      quantityIncreased: (title, quantity) => `${title} 已增至 ${quantity} 件。`,
      articleAdded: (title, quantity, price) =>
        `已添加 ${title}(${quantity}x ${price})。`,
    },
    lines: {
      header: (count, quantity) => `报价单行(${count})· 共 ${quantity} 件`,
      tip: "💡 名称、数量和单价可在每一行直接修改。",
      colDescription: "名称",
      colQuantity: "数量",
      colUnitPrice: "单价(XOF)",
      colTotal: "小计",
      placeholder: (index) =>
        `第 ${index} 行 · 例如 TOYOTA COROLLA CROSS、Wallbox 充电桩...`,
      decrease: "减少数量",
      increase: "增加数量",
      remove: "删除此行",
    },
    cgv: {
      title: "📜 销售条款附在第 2 页",
      vehicle: "🚗 车辆",
      workshop: "🔧 售后维修",
      hideText: "隐藏文本",
      editText: "调整文本",
      applicable: (kind) => `适用条款(${kind}):`,
      kindVehicle: "车辆销售",
      kindWorkshop: "售后维修",
      reset: "↺ 恢复官方文本",
    },
    discount: {
      title: "销售策略与折扣",
      none: "无折扣",
      percent: "% 百分比",
      fixed: "固定金额",
      tiers: "常用档位",
      customRate: "自定义比例",
      percentOff: (value) => `-${value}%`,
      granted: (amount) => `已给折扣:-${amount},从未税总额中扣除`,
      amountLabel: "折扣金额",
      deducted: (amount, percent) => `已扣折扣:-${amount}(占未税 ${percent}%)`,
    },
    totals: {
      notesLabel: "备注与特别条件(会打印在报价单上)",
      notesPlaceholder:
        "例如:48 小时内在展厅交车(Zone Maro-Militaire, Gbèdomidji)。赠送 Type 2 充电线与首次保养。电池质保 8 年 / 150 000 km。",
      gross: "未税小计(总额)",
      commercialDiscount: (percent) =>
        percent ? `商业折扣(-${percent}%)` : "商业折扣",
      netHt: "商业净额(未税)",
      vat: (rate) => `贝宁增值税(${rate}%)`,
      totalTtc: (taxMode) => `含税净额(${taxMode})`,
    },
    submit: {
      creating: "生成中...",
      create: "创建形式发票",
    },
    newClient: {
      title: "新客户(快速添加)",
      subtitle: "报价单所需的客户联系方式与税号",
      nameLabel: "联系人姓名 *",
      namePlaceholder: "例如:Dr Nadine HOUVI、Michel DOSSOU 先生",
      companyLabel: "公司(可选)",
      companyPlaceholder: "例如:Benin Logistics SA、Cabinet Alpha...",
      ifuLabel: "贝宁税号(IFU)",
      ifuPlaceholder: "例如:0201910815523",
      ifuHint: "开票与 ANaTT 申报必需",
      categoryLabel: "客户类别",
      categories: {
        particulier: "个人",
        entreprise: "企业",
        ong: "非政府组织 / 外交机构",
        flotte: "车队",
      },
      phoneLabel: "电话",
      phonePlaceholder: "+229 01 97 00 00 00",
      emailLabel: "电子邮箱",
      emailPlaceholder: "client@domain.bj",
      addressLabel: "实际地址(展厅 / 交车)",
      addressPlaceholder: "例如:Haie Vive, Rue 340, 科托努",
      nameRequired: "客户姓名为必填项。",
      createFailed: "客户创建失败。",
      creating: "创建中...",
      submit: "保存并选择",
    },
  },
  editor: {
    title: (number) => `✏️ 修改形式发票 ${number}`,
    subtitle: (status) => `当前状态:${status}。在确认为正式订单之前均可修改。`,
    errors: {
      clientRequired: "请选择客户。",
      designationRequired: "每一行都必须填写名称。",
      updateFailed: "形式发票更新失败。",
      minLines: "形式发票至少保留一行。",
    },
    clientLabel: "客户 *",
    taxModeLabel: "计税方式",
    taxHtOption: "未税(HT)",
    taxTtcOption: "含税(TTC)",
    vatRateLabel: "增值税率",
    vatNormal: "18 %(标准税率)",
    vatExempt: "0 %(免税 / 出口)",
    pickStock: "+ 从库存或目录中选择:",
    vehicleOption: "🚗 + 选择库存车辆...",
    articleOption: "⚡ + 选择商品 / 服务...",
    staged: {
      vehicleBadge: "🚗 库存车辆",
      articleBadge: "⚡ 商品 / 服务",
      quantityLabel: "数量",
      unitPriceLabel: "单价(可修改)",
      lineCalc: "行金额",
      insert: "插入",
    },
    feedback: {
      emptyLineAdded: "已添加空白行。",
      quantityIncreased: (title, quantity) => `${title} 已增至 ${quantity} 件。`,
      articleAdded: (title, quantity, price) =>
        `已添加 ${title}(${quantity}x,单价 ${price})。`,
    },
    lines: {
      header: (count, quantity) => `形式发票行(${count})· 共 ${quantity} 件`,
      add: "添加空白行",
      placeholder: "服务或车辆名称 *",
      quantityTitle: "数量",
      unitPriceTitle: "单价 XOF",
      removeTitle: "删除此行",
    },
    discount: {
      title: "销售策略与折扣",
      none: "无折扣",
      percent: "% 百分比",
      fixed: "固定金额",
      granted: (amount) => `已给折扣:-${amount}`,
      deduction: (amount) => `扣除 -${amount}`,
    },
    totals: {
      gross: "未税小计(总额)",
      commercialDiscount: "商业折扣",
      netHt: "商业净额(未税)",
      vat: (rate) => `增值税(${rate}%)`,
      totalTtc: (taxMode) => `含税净额合计(${taxMode})`,
    },
    notesLabel: "备注与说明(可选)",
    notesPlaceholder: "特别条件、交货期、折扣...",
    validityLabel: "有效期(天)",
    submit: {
      saving: "保存中...",
      save: "保存修改",
    },
  },
  print: {
    back: "← 返回报价单",
    techSheetLink: (brand, model) => `配置单(${brand} ${model})`,
    mailtoTitle: "打开本机邮件客户端",
    mailtoLabel: "打开邮件(mailto)",
    mailStub: "服务器邮件:暂为控制台日志占位,SMTP 尚未接入",
    companyLine: "SARL · Zone Maro-Militaire, Gbèdomidji · 科托努",
    docTitle: "形式发票",
    clientBlockTitle: "客户",
    ifu: (value) => `税号:${value}`,
    date: (value) => `日期:${value}`,
    validUntil: (value) => `有效期:${value}`,
    taxBase: (taxMode, rate) => `计税:${taxMode} · 增值税 ${rate}%`,
    cgvRef: (kind) => `条款依据:${kind}`,
    cgvKindVehicle: "展厅车辆销售",
    cgvKindWorkshop: "Carzone 科托努售后维修",
    columns: {
      designation: "名称",
      quantity: "数量",
      unitPrice: "单价",
      amount: "金额",
    },
    totals: {
      gross: "未税小计(总额)",
      discount: (percent) =>
        percent ? `商业折扣(-${percent}%)` : "已给商业折扣",
      netHt: "商业净额(未税)",
      subtotalHt: "未税小计",
      vat: (rate) => `增值税(${rate}%)`,
      totalTtc: "含税合计",
    },
    legalHeading: "法律与会计声明",
    notes: (text) => `备注:${text}`,
    footer:
      "形式发票文件。只有转为正式发票后才具备税务效力。CARZONE 内已确认的订单,客户不能单方面取消(库存、进口与银行承诺已经启动)。内部作废由管理层与财务部办理,并需书面原因。",
    cgvPage: {
      title: "销售与保修通用条款",
      subtitle: (number, kind) => `附于形式发票第 ${number} 号 · ${kind}`,
      kindVehicle: "车辆销售(展厅与进口)",
      kindWorkshop: "售后维修与保养作业",
      company: "CARZONE SARL(展厅与出行)",
      address: "Zone Maro-Militaire,Gbèdomidji 区 · 科托努",
      signCompanyLabel: "CARZONE SARL 贝宁:",
      signCompanyRole: "销售负责人 / 签字与盖章",
      signClientLabel: "客户:",
      signClientAccepted: "「已阅并同意,确认成交」",
      signClientStamp: "客户签字与盖章",
      annex: (title) => `📄 附件:配置单 · ${title}`,
      openSheet: "单独打开配置单 ↗",
    },
    mailto: {
      subject: (number) => `形式发票 ${number} · CARZONE`,
      body: (number, total) =>
        `您好:\n\n随信附上编号 ${number} 的形式发票,总金额 ${total}。\n\n顺祝商祺,\nCARZONE`,
    },
  },
  server: {
    deleteNormalized: "无法删除:此形式发票已转为正式发票。",
    missingId: "缺少报价单编号。",
    customerRequired: "必须选择客户。",
    lineRequired: "至少需要一行。",
    quoteNotFound: "报价单不存在。",
    quoteLocked: "此文件已确认为正式订单或正式发票,不能再修改。",
  },
};

export const quotesCopy: Record<Locale, QuotesCopy> = { fr, en, zh };

/**
 * Formate une date de devis selon la locale active.
 * Les montants restent en FCFA (formatXof), seule l'écriture de la date change.
 */
export function formatQuoteDate(
  copy: QuotesCopy,
  value: string | Date | null | undefined,
): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(copy.dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
