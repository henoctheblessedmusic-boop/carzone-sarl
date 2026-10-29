import type { Locale } from "@/lib/prefs";

/**
 * Dictionnaire du module FACTURES / RÈGLEMENTS / BILAN.
 *
 * Périmètre : liste des factures, onglet règlements, formulaire d'encaissement,
 * bilan mensuel (P&L), facture normalisée imprimable, quittance d'encaissement.
 *
 * Règles de rédaction :
 * - FR = langue source, ton PME locale, pas de tiret cadratin.
 * - EN = anglais international (en-GB), contractions naturelles.
 * - ZH = chinois simplifié, phrases courtes, marques en latin.
 * - Fidélité : montants FCFA, TVA, numéros de facture (FAC-, REG-), IFU, RCCM,
 *   NIM e-MECeF, dates et coordonnées bancaires ne sont jamais réécrits.
 * - Les valeurs techniques (status, method, taxMode) restent en base ; seuls les
 *   libellés affichés passent par les maps ci-dessous.
 */

export type InvoicesCopy = {
  /** Locale de formatage des dates (les montants restent en XOF via formatXof). */
  dateLocale: string;
  common: {
    cancel: string;
    close: string;
  };
  tabs: {
    invoices: (count: number) => string;
    payments: (count: number) => string;
    bilan: string;
  };
  kpi: {
    invoicedLabel: string;
    invoicedHint: (count: number) => string;
    collectedLabel: string;
    collectedHint: (count: number) => string;
    outstandingLabel: string;
    outstandingHint: string;
    overdueLabel: string;
    overdueHint: string;
  };
  search: {
    invoices: string;
    payments: string;
  };
  filters: {
    all: string;
    unpaid: string;
    paid: string;
    overdue: string;
    voided: string;
    methodAll: string;
    /** Libellés courts des puces de filtre par mode de règlement. */
    methodChips: Record<string, string>;
  };
  toolbar: {
    exportExcel: string;
    exportExcelTitle: string;
    recordPayment: string;
  };
  invoiceTable: {
    headers: {
      number: string;
      client: string;
      dates: string;
      totalTtc: string;
      collected: string;
      balance: string;
      status: string;
      actions: string;
    };
    empty: string;
    quoteRef: (number: string) => string;
    issued: (date: string) => string;
    due: (date: string) => string;
    /** Base hors taxes sous le montant TTC, avec taux de TVA quand il s'applique. */
    htAndVat: (amount: string, rate: number) => string;
    paymentsCount: (count: number) => string;
    settled: string;
    remaining: string;
    rowActions: {
      printLabel: string;
      printTitle: string;
      certifiedTitle: (code: string) => string;
      dgiLabel: string;
      dgiTitle: string;
      collectLabel: string;
      collectTitle: string;
      voidTitle: string;
    };
  };
  paymentsTable: {
    headers: {
      reference: string;
      date: string;
      invoice: string;
      client: string;
      method: string;
      transaction: string;
      amount: string;
      receipt: string;
    };
    empty: string;
    invoiceTotal: (amount: string) => string;
    receiptLabel: string;
    receiptTitle: string;
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
  paymentModal: {
    title: string;
    subtitle: string;
    invoiceLabel: string;
    invoiceOption: (
      number: string,
      client: string,
      total: string,
      remaining: string,
    ) => string;
    totalInvoice: string;
    alreadyCollected: string;
    balanceRemaining: string;
    amountLabel: string;
    payFull: (amount: string) => string;
    methodLabel: string;
    referenceLabel: string;
    referencePlaceholder: string;
    paidAtLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    submit: string;
    saving: string;
    errors: {
      selectInvoice: string;
      amountPositive: string;
      exceeds: (amount: string, remaining: string) => string;
      generic: string;
    };
  };
  bilan: {
    periodLabel: string;
    yearOption: (year: number) => string;
    allYear: (year: number) => string;
    monthNames: string[];
    print: string;
    kpi: {
      revenueLabel: string;
      collectedPrefix: string;
      grossLabel: string;
      marginPrefix: string;
      marginSuffix: string;
      opexLabel: string;
      payrollPrefix: string;
      providersPrefix: string;
      netLabel: string;
      netMarginPrefix: string;
      netMarginSuffix: string;
    };
    pl: {
      title: string;
      revenue: string;
      revenueWorkshop: (amount: string) => string;
      cogs: string;
      gross: string;
      grossBadge: (pct: string) => string;
      payroll: string;
      opex: string;
      opexProviders: (amount: string) => string;
      net: string;
      netBadge: string;
    };
    monthly: {
      title: (year: number) => string;
      headers: {
        month: string;
        invoiced: string;
        collected: string;
        salaries: string;
        expenses: string;
        net: string;
      };
      total: (year: number) => string;
    };
  };
  print: {
    back: string;
    actionHint: string;
    companyTagline: string;
    companyAddress: string;
    companyPhone: string;
    companyMailWeb: string;
    companyFiscal: string;
    docTitle: string;
    quoteRef: (number: string) => string;
    badgeSettled: string;
    badgePending: string;
    billedTo: string;
    ifu: (value: string) => string;
    address: string;
    city: string;
    phone: string;
    email: string;
    dateIssued: string;
    dateDue: string;
    taxRegime: string;
    vatRate: (rate: number) => string;
    exempt: string;
    status: string;
    columns: {
      designation: string;
      quantity: string;
      unitHt: string;
      totalHt: string;
    };
    vin: (value: string) => string;
    vinUnassigned: string;
    defaultLineTitle: string;
    defaultLineSub: string;
    paymentsTitle: string;
    noPayments: string;
    subtotalHt: string;
    vat: (rate: number) => string;
    totalTtc: string;
    totalCollected: string;
    netToPay: string;
    legalHeading: string;
    dgiHeading: string;
    mecefCode: string;
    nim: string;
    counters: string;
    certifiedNote: string;
    qrAlt: string;
    paymentHeading: string;
    bankTransfer: string;
    ecobank: string;
    boa: string;
    mobileMoney: string;
    mtnMerchant: string;
    moovMerchant: string;
    cashDesk: string;
    footerRegime: string;
    footerCourt: string;
    forCompany: string;
    stampCompta: string;
    cgv: {
      title: string;
      subtitle: (number: string, kind: string) => string;
      kindVehicle: string;
      kindWorkshop: string;
      company: string;
      companyAddress: string;
      forCompany: string;
      salesDirection: string;
      forClient: string;
      readApproved: string;
      signStamp: string;
    };
  };
  receipt: {
    back: string;
    actionHint: (regNumber: string) => string;
    companyAddress: string;
    companyFiscal: string;
    docTitle: string;
    date: (value: string) => string;
    receivedFrom: string;
    phone: string;
    amountCollected: string;
    method: string;
    reference: string;
    noReference: string;
    invoice: string;
    notes: string;
    defaultNote: string;
    accountTitle: (number: string) => string;
    totalInvoice: string;
    totalCollected: string;
    balanceDue: string;
    settledTag: string;
    footerLegal: string;
    footerCertified: string;
    forCashier: string;
    stamp: string;
  };
  /** Statuts de facture (InvoiceStatus en base) vers libellés affichés. */
  statuses: Record<string, string>;
  /** Modes de règlement (Payment.method en base) vers libellés affichés. */
  paymentMethods: Record<string, string>;
  /** Messages d'erreur serveur qui remontent dans le formulaire d'encaissement. */
  server: {
    invoiceRequired: string;
    invalidAmount: string;
  };
};

const fr: InvoicesCopy = {
  dateLocale: "fr-BJ",
  common: {
    cancel: "Annuler",
    close: "Fermer",
  },
  tabs: {
    invoices: (count) => `Factures commerciales (${count})`,
    payments: (count) => `Règlements et quittances (${count})`,
    bilan: "Bilan mensuel et rentabilité (P&L)",
  },
  kpi: {
    invoicedLabel: "Total facturé TTC",
    invoicedHint: (count) => `${count} facture(s) émises à ce jour`,
    collectedLabel: "Total encaissé",
    collectedHint: (count) =>
      count === 1
        ? "1 facture soldée, rien à relancer"
        : `${count} factures soldées, rien à relancer`,
    outstandingLabel: "Créances, reste à encaisser",
    outstandingHint: "Le solde que les clients nous doivent encore.",
    overdueLabel: "Factures en retard",
    overdueHint: "Échéance dépassée, à relancer sans traîner.",
  },
  search: {
    invoices: "N° de facture, proforma, client...",
    payments: "Réf. de paiement, client, N° de facture...",
  },
  filters: {
    all: "Toutes",
    unpaid: "Non soldées",
    paid: "Soldées",
    overdue: "En retard",
    voided: "Annulées",
    methodAll: "Tous les modes",
    methodChips: {
      MTN_MOMO: "MTN MoMo",
      MOOV_MONEY: "Moov Money",
      VIREMENT_ECOBANK: "Ecobank",
      VIREMENT_BOA: "BOA",
      CHEQUE: "Chèques",
      ESPECES: "Espèces",
    },
  },
  toolbar: {
    exportExcel: "Extraire le bilan financier (Excel)",
    exportExcelTitle:
      "Sortir le bilan financier de l'entreprise en fichier Excel (.xlsx)",
    recordPayment: "Enregistrer un règlement",
  },
  invoiceTable: {
    headers: {
      number: "Facture",
      client: "Client",
      dates: "Dates",
      totalTtc: "Total TTC",
      collected: "Encaissé",
      balance: "Solde dû",
      status: "Statut",
      actions: "Actions",
    },
    empty: "Aucune facture pour ces filtres. Élargissez la recherche.",
    quoteRef: (number) => `Devis ${number}`,
    issued: (date) => `Émise le ${date}`,
    due: (date) => `Échéance ${date}`,
    htAndVat: (amount, rate) =>
      rate > 0 ? `${amount} HT · TVA ${rate} %` : `${amount} HT`,
    paymentsCount: (count) =>
      count === 1 ? "1 règlement reçu" : `${count} règlements reçus`,
    settled: "Soldé",
    remaining: "Reste à payer",
    rowActions: {
      printLabel: "Facture",
      printTitle: "Imprimer la facture normalisée",
      certifiedTitle: (code) => `Certifiée DGI Bénin (code ${code})`,
      dgiLabel: "DGI",
      dgiTitle: "Certifier cette facture auprès de la DGI Bénin (e-MECeF)",
      collectLabel: "Encaisser",
      collectTitle: "Noter un acompte ou solder la facture",
      voidTitle: "Annulation interne par la direction, motif obligatoire",
    },
  },
  paymentsTable: {
    headers: {
      reference: "Réf. règlement",
      date: "Date",
      invoice: "Facture liée",
      client: "Client",
      method: "Mode d'encaissement",
      transaction: "Réf. transaction",
      amount: "Montant encaissé",
      receipt: "Quittance",
    },
    empty: "Aucun encaissement enregistré pour l'instant.",
    invoiceTotal: (amount) => `Total ${amount}`,
    receiptLabel: "Quittance",
    receiptTitle: "Imprimer la quittance d'encaissement",
  },
  voidModal: {
    title: "Annulation interne d'une facture",
    bodyLead: "Cette action est réservée à la ",
    roleDirection: "Direction générale",
    bodyMiddle: " et à la ",
    roleAccounting: "Comptabilité",
    bodyTail:
      ". Il faut un motif écrit, 8 caractères minimum, et il reste audité.",
    reasonPlaceholder:
      "Exemple : erreur de saisie / commande annulée par la DG / facture remplacée par FAC-...",
    confirm: "Confirmer l'annulation",
  },
  paymentModal: {
    title: "Enregistrer un règlement",
    subtitle: "La quittance part dans la foulée · Caisse et banque CARZONE SARL",
    invoiceLabel: "Facture concernée *",
    invoiceOption: (number, client, total, remaining) =>
      `${number} · ${client} (${total}) · reste ${remaining}`,
    totalInvoice: "Total facture",
    alreadyCollected: "Déjà encaissé",
    balanceRemaining: "Solde restant dû",
    amountLabel: "Montant à encaisser (FCFA) *",
    payFull: (amount) => `Solder d'un coup (${amount})`,
    methodLabel: "Mode d'encaissement *",
    referenceLabel: "Réf. transaction / chèque / bordereau",
    referencePlaceholder: "Ex : MTN-849202, CHQ-BOA-7491...",
    paidAtLabel: "Date de paiement",
    notesLabel: "Remarques, mémo interne",
    notesPlaceholder: "Ex : acompte 50 % sur commande BYD Dolphin",
    submit: "Valider l'encaissement",
    saving: "Enregistrement...",
    errors: {
      selectInvoice: "Choisissez d'abord la facture.",
      amountPositive: "Le montant doit être supérieur à zéro.",
      exceeds: (amount, remaining) =>
        `${amount}, c'est plus que le solde restant (${remaining}).`,
      generic: "L'enregistrement du règlement n'a pas abouti.",
    },
  },
  bilan: {
    periodLabel: "Période analysée :",
    yearOption: (year) => `Année ${year}`,
    allYear: (year) => `Toute l'année ${year}`,
    monthNames: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ],
    print: "Imprimer le bilan financier",
    kpi: {
      revenueLabel: "Chiffre d'affaires facturé",
      collectedPrefix: "Encaissé réel : ",
      grossLabel: "Marge brute dégagée",
      marginPrefix: "Taux de marge brute : ",
      marginSuffix: " (coûts d'achat déduits)",
      opexLabel: "Charges d'exploitation (OPEX)",
      payrollPrefix: "Salaires : ",
      providersPrefix: "Prestataires et frais : ",
      netLabel: "Bénéfice net réel",
      netMarginPrefix: "Rentabilité nette : ",
      netMarginSuffix: " du chiffre d'affaires",
    },
    pl: {
      title: "Décomposition du bilan (compte de résultat P&L)",
      revenue: "Chiffre d'affaires total facturé (ventes, atelier, énergie)",
      revenueWorkshop: (amount) => `dont atelier SAV : ${amount}`,
      cogs: "Coût d'achat des matériels vendus et des pièces atelier",
      gross: "MARGE BRUTE OPÉRATIONNELLE",
      grossBadge: (pct) => `${pct} % du CA`,
      payroll: "Masse salariale et rémunérations du personnel (RH)",
      opex:
        "Charges externes et prestataires (climatisation, SBEE, SONEB, télécoms, loyer...)",
      opexProviders: (amount) => `dont prestataires extérieurs : ${amount}`,
      net: "RÉSULTAT NET D'EXPLOITATION",
      netBadge: "BÉNÉFICE NET APRÈS CHARGES ET SALAIRES",
    },
    monthly: {
      title: (year) => `Tableau de bord mensuel récapitulatif (${year})`,
      headers: {
        month: "Mois",
        invoiced: "CA facturé",
        collected: "Encaissé réel",
        salaries: "Salaires décaissés",
        expenses: "Dépenses prestataires",
        net: "Résultat net estimé",
      },
      total: (year) => `TOTAL CUMULÉ (${year})`,
    },
  },
  print: {
    back: "← Retour factures et règlements",
    actionHint: "Facture commerciale normalisée · CARZONE SARL Bénin",
    companyTagline: "SARL · Showroom et mobilité",
    companyAddress: "Zone Maro-Militaire, quartier Gbèdomidji · Cotonou",
    companyPhone: "Tél : +229 21 33 00 00 / 97 00 00 00",
    companyMailWeb: "Email : contact@topcarzone.com · Web : www.topcarzone.com",
    companyFiscal: "IFU : 0202314589201 · RCCM : RB/COT/23 B 34567",
    docTitle: "FACTURE NORMALISÉE",
    quoteRef: (number) => `Réf. devis ${number}`,
    badgeSettled: "FACTURE SOLDÉE",
    badgePending: "PAIEMENT EN ATTENTE",
    billedTo: "Facturé à",
    ifu: (value) => `N° IFU : ${value}`,
    address: "Adresse :",
    city: "Ville :",
    phone: "Téléphone :",
    email: "Email :",
    dateIssued: "Date d'émission :",
    dateDue: "Date d'échéance :",
    taxRegime: "Régime fiscal :",
    vatRate: (rate) => `TVA ${rate} %`,
    exempt: "Exonéré",
    status: "Statut :",
    columns: {
      designation: "Désignation des prestations, véhicules et équipements",
      quantity: "Qté",
      unitHt: "P.U. HT",
      totalHt: "Total HT",
    },
    vin: (value) => `VIN ${value}`,
    vinUnassigned: "non attribué",
    defaultLineTitle: "Prestations commerciales CARZONE SARL",
    defaultLineSub: "Conformément à la commande du client",
    paymentsTitle: "Règlements reçus",
    noPayments: "Aucun règlement sur cette facture pour l'instant.",
    subtotalHt: "Sous-total HT :",
    vat: (rate) => `TVA (${rate} %) :`,
    totalTtc: "Total TTC :",
    totalCollected: "Total encaissé :",
    netToPay: "Net à payer (solde) :",
    legalHeading: "Mention légale et fiscale obligatoire",
    dgiHeading: "RÉPUBLIQUE DU BÉNIN · DIRECTION GÉNÉRALE DES IMPÔTS (DGI)",
    mecefCode: "Code sécurité MECeF / DGI :",
    nim: "NIM (machine e-MCF) :",
    counters: "Compteurs fiscaux :",
    certifiedNote:
      "Facture certifiée et télétransmise au serveur central e-MECeF de la DGI.",
    qrAlt: "QR code e-MECeF",
    paymentHeading: "Comment nous régler (CARZONE SARL Bénin) :",
    bankTransfer: "Virement bancaire :",
    ecobank: "Ecobank Bénin :",
    boa: "BOA Bénin :",
    mobileMoney: "Mobile money et caisse :",
    mtnMerchant: "MTN MoMo marchand :",
    moovMerchant: "Moov Money marchand :",
    cashDesk: "Caisse showroom Maro-Militaire (chèque ou espèces)",
    footerRegime:
      "Facture établie sous le régime fiscal de la République du Bénin.",
    footerCourt:
      "En cas de litige, seuls les tribunaux de Cotonou sont compétents.",
    forCompany: "Pour CARZONE SARL",
    stampCompta: "Cachet et visa comptabilité",
    cgv: {
      title: "CONDITIONS GÉNÉRALES DE VENTE ET DE GARANTIE",
      subtitle: (number, kind) =>
        `Adossées à la facture normalisée n° ${number} · ${kind}`,
      kindVehicle: "Vente de véhicules (showroom et import)",
      kindWorkshop: "Prestations atelier SAV et réparations",
      company: "CARZONE SARL (showroom et mobilité)",
      companyAddress: "Zone Maro-Militaire, quartier Gbèdomidji · Cotonou",
      forCompany: "Pour CARZONE SARL Bénin :",
      salesDirection: "Direction commerciale / signature et cachet",
      forClient: "Pour le client :",
      readApproved: "« Lu et approuvé, bon pour accord »",
      signStamp: "Signature et cachet du client",
    },
  },
  receipt: {
    back: "← Retour factures et règlements",
    actionHint: (regNumber) => `Quittance d'encaissement officielle · ${regNumber}`,
    companyAddress: "Zone Maro-Militaire, Gbèdomidji · Cotonou",
    companyFiscal: "IFU : 0202314589201 · Tél : +229 21 33 00 00",
    docTitle: "QUITTANCE DE PAIEMENT",
    date: (value) => `Date : ${value}`,
    receivedFrom: "Reçu de :",
    phone: "Téléphone :",
    amountCollected: "Montant encaissé",
    method: "Mode de règlement :",
    reference: "Réf. transaction / pièce :",
    noReference: "Aucune référence indiquée",
    invoice: "Facture concernée :",
    notes: "Motif / notes :",
    defaultNote: "Règlement acompte / solde",
    accountTitle: (number) =>
      `Situation du compte client sur la facture ${number} :`,
    totalInvoice: "Montant total de la facture TTC :",
    totalCollected: "Total cumulé des encaissements :",
    balanceDue: "Solde restant dû :",
    settledTag: "facture soldée",
    footerLegal:
      "Quittance établie en bonne et due forme, pour valoir ce que de droit.",
    footerCertified: "Document certifié émis par CARZONE SARL, Cotonou.",
    forCashier: "Pour acquit / la caisse",
    stamp: "Cachet et signature",
  },
  statuses: {
    PAYEE: "Soldée",
    PAYEE_PARTIEL: "Acompte reçu",
    EN_RETARD: "En retard",
    ANNULEE: "Annulée",
    EMISE: "Émise",
    BROUILLON: "Brouillon",
  },
  paymentMethods: {
    MTN_MOMO: "MTN Mobile Money Bénin",
    MOOV_MONEY: "Moov Money Bénin",
    MOBILE_MONEY: "Mobile Money Bénin",
    VIREMENT_ECOBANK: "Virement Ecobank Bénin",
    VIREMENT_BOA: "Virement BOA Bénin",
    VIREMENT: "Autre virement bancaire",
    CHEQUE: "Chèque bancaire",
    ESPECES: "Espèces (caisse showroom)",
    CARTE: "Carte bancaire (TPE)",
  },
  server: {
    invoiceRequired: "Il manque la facture à encaisser.",
    invalidAmount: "Le montant saisi n'est pas valable.",
  },
};

const en: InvoicesCopy = {
  dateLocale: "en-GB",
  common: {
    cancel: "Cancel",
    close: "Close",
  },
  tabs: {
    invoices: (count) => `Sales invoices (${count})`,
    payments: (count) => `Payments and receipts (${count})`,
    bilan: "Monthly P&L and profitability",
  },
  kpi: {
    invoicedLabel: "Invoiced incl. tax",
    invoicedHint: (count) =>
      count === 1 ? "1 invoice issued so far" : `${count} invoices issued so far`,
    collectedLabel: "Collected",
    collectedHint: (count) =>
      count === 1
        ? "1 invoice fully paid, nothing to chase"
        : `${count} invoices fully paid, nothing to chase`,
    outstandingLabel: "Receivables, still to collect",
    outstandingHint: "What clients still owe us.",
    overdueLabel: "Overdue invoices",
    overdueHint: "Past due date, worth a call today.",
  },
  search: {
    invoices: "Invoice no., proforma, client...",
    payments: "Payment ref., client, invoice no...",
  },
  filters: {
    all: "All",
    unpaid: "Not settled",
    paid: "Settled",
    overdue: "Overdue",
    voided: "Voided",
    methodAll: "All methods",
    methodChips: {
      MTN_MOMO: "MTN MoMo",
      MOOV_MONEY: "Moov Money",
      VIREMENT_ECOBANK: "Ecobank",
      VIREMENT_BOA: "BOA",
      CHEQUE: "Cheques",
      ESPECES: "Cash",
    },
  },
  toolbar: {
    exportExcel: "Export the financial statement (Excel)",
    exportExcelTitle: "Download the company financial statement as an .xlsx file",
    recordPayment: "Record a payment",
  },
  invoiceTable: {
    headers: {
      number: "Invoice",
      client: "Client",
      dates: "Dates",
      totalTtc: "Total incl. tax",
      collected: "Collected",
      balance: "Balance due",
      status: "Status",
      actions: "Actions",
    },
    empty: "No invoice matches these filters. Try widening the search.",
    quoteRef: (number) => `Quote ${number}`,
    issued: (date) => `Issued ${date}`,
    due: (date) => `Due ${date}`,
    htAndVat: (amount, rate) =>
      rate > 0 ? `${amount} excl. tax · VAT ${rate}%` : `${amount} excl. tax`,
    paymentsCount: (count) =>
      count === 1 ? "1 payment received" : `${count} payments received`,
    settled: "Settled",
    remaining: "Still to pay",
    rowActions: {
      printLabel: "Invoice",
      printTitle: "Print the normalised invoice",
      certifiedTitle: (code) => `Certified by Benin DGI (code ${code})`,
      dgiLabel: "DGI",
      dgiTitle: "Certify this invoice with the Benin DGI (e-MECeF)",
      collectLabel: "Collect",
      collectTitle: "Log a deposit or settle the invoice",
      voidTitle: "Internal void by management, reason required",
    },
  },
  paymentsTable: {
    headers: {
      reference: "Payment ref.",
      date: "Date",
      invoice: "Linked invoice",
      client: "Client",
      method: "Payment method",
      transaction: "Transaction ref.",
      amount: "Amount collected",
      receipt: "Receipt",
    },
    empty: "No payment recorded yet.",
    invoiceTotal: (amount) => `Total ${amount}`,
    receiptLabel: "Receipt",
    receiptTitle: "Print the payment receipt",
  },
  voidModal: {
    title: "Internal void of an invoice",
    bodyLead: "This is limited to ",
    roleDirection: "General Management",
    bodyMiddle: " and ",
    roleAccounting: "Accounting",
    bodyTail: ". A written reason is required, 8 characters minimum, and it stays audited.",
    reasonPlaceholder:
      "Example: data entry mistake / order cancelled by management / invoice replaced by FAC-...",
    confirm: "Confirm the void",
  },
  paymentModal: {
    title: "Record a payment",
    subtitle: "The receipt is issued right after · CARZONE SARL cash desk and bank",
    invoiceLabel: "Invoice concerned *",
    invoiceOption: (number, client, total, remaining) =>
      `${number} · ${client} (${total}) · ${remaining} left`,
    totalInvoice: "Invoice total",
    alreadyCollected: "Already collected",
    balanceRemaining: "Balance still due",
    amountLabel: "Amount to collect (FCFA) *",
    payFull: (amount) => `Settle it in one go (${amount})`,
    methodLabel: "Payment method *",
    referenceLabel: "Transaction / cheque / slip ref.",
    referencePlaceholder: "E.g. MTN-849202, CHQ-BOA-7491...",
    paidAtLabel: "Payment date",
    notesLabel: "Remarks, internal note",
    notesPlaceholder: "E.g. 50% deposit on a BYD Dolphin order",
    submit: "Confirm the payment",
    saving: "Saving...",
    errors: {
      selectInvoice: "Pick the invoice first.",
      amountPositive: "The amount must be above zero.",
      exceeds: (amount, remaining) =>
        `${amount} is more than the balance left (${remaining}).`,
      generic: "The payment could not be saved.",
    },
  },
  bilan: {
    periodLabel: "Period:",
    yearOption: (year) => `Year ${year}`,
    allYear: (year) => `Full year ${year}`,
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    print: "Print the financial statement",
    kpi: {
      revenueLabel: "Invoiced revenue",
      collectedPrefix: "Cash actually in: ",
      grossLabel: "Gross margin",
      marginPrefix: "Gross margin rate: ",
      marginSuffix: " (purchase costs deducted)",
      opexLabel: "Operating expenses (OPEX)",
      payrollPrefix: "Salaries: ",
      providersPrefix: "Suppliers and costs: ",
      netLabel: "Net profit",
      netMarginPrefix: "Net margin: ",
      netMarginSuffix: " of revenue",
    },
    pl: {
      title: "Statement breakdown (profit and loss)",
      revenue: "Total invoiced revenue (sales, workshop, energy)",
      revenueWorkshop: (amount) => `of which aftersales workshop: ${amount}`,
      cogs: "Purchase cost of goods sold and workshop parts",
      gross: "GROSS OPERATING MARGIN",
      grossBadge: (pct) => `${pct}% of revenue`,
      payroll: "Payroll and staff compensation (HR)",
      opex:
        "External charges and suppliers (air conditioning, SBEE, SONEB, telecoms, rent...)",
      opexProviders: (amount) => `of which outside suppliers: ${amount}`,
      net: "NET OPERATING RESULT",
      netBadge: "NET PROFIT AFTER COSTS AND PAYROLL",
    },
    monthly: {
      title: (year) => `Monthly summary board (${year})`,
      headers: {
        month: "Month",
        invoiced: "Invoiced revenue",
        collected: "Cash collected",
        salaries: "Salaries paid",
        expenses: "Supplier costs",
        net: "Estimated net",
      },
      total: (year) => `YEAR TO DATE (${year})`,
    },
  },
  print: {
    back: "← Back to invoices and payments",
    actionHint: "Normalised sales invoice · CARZONE SARL Benin",
    companyTagline: "SARL · Showroom and mobility",
    companyAddress: "Zone Maro-Militaire, Gbèdomidji district · Cotonou",
    companyPhone: "Tel: +229 21 33 00 00 / 97 00 00 00",
    companyMailWeb: "Email: contact@topcarzone.com · Web: www.topcarzone.com",
    companyFiscal: "Tax ID: 0202314589201 · RCCM: RB/COT/23 B 34567",
    docTitle: "NORMALISED INVOICE",
    quoteRef: (number) => `Quote ref. ${number}`,
    badgeSettled: "INVOICE PAID IN FULL",
    badgePending: "PAYMENT PENDING",
    billedTo: "Billed to",
    ifu: (value) => `Tax ID: ${value}`,
    address: "Address:",
    city: "City:",
    phone: "Phone:",
    email: "Email:",
    dateIssued: "Issue date:",
    dateDue: "Due date:",
    taxRegime: "Tax regime:",
    vatRate: (rate) => `VAT ${rate}%`,
    exempt: "Exempt",
    status: "Status:",
    columns: {
      designation: "Description of services, vehicles and equipment",
      quantity: "Qty",
      unitHt: "Unit excl. tax",
      totalHt: "Total excl. tax",
    },
    vin: (value) => `VIN ${value}`,
    vinUnassigned: "not assigned",
    defaultLineTitle: "CARZONE SARL sales services",
    defaultLineSub: "As per the client order",
    paymentsTitle: "Payments received",
    noPayments: "No payment on this invoice yet.",
    subtotalHt: "Subtotal excl. tax:",
    vat: (rate) => `VAT (${rate}%):`,
    totalTtc: "Total incl. tax:",
    totalCollected: "Total collected:",
    netToPay: "Net to pay (balance):",
    legalHeading: "Mandatory legal and tax statement",
    dgiHeading: "REPUBLIC OF BENIN · DIRECTORATE GENERAL OF TAXES (DGI)",
    mecefCode: "MECeF / DGI security code:",
    nim: "NIM (e-MCF machine):",
    counters: "Tax counters:",
    certifiedNote:
      "Invoice certified and transmitted to the DGI central e-MECeF server.",
    qrAlt: "e-MECeF QR code",
    paymentHeading: "How to pay us (CARZONE SARL Benin):",
    bankTransfer: "Bank transfer:",
    ecobank: "Ecobank Benin:",
    boa: "BOA Benin:",
    mobileMoney: "Mobile money and cash desk:",
    mtnMerchant: "MTN MoMo merchant:",
    moovMerchant: "Moov Money merchant:",
    cashDesk: "Maro-Militaire showroom cash desk (cheque or cash)",
    footerRegime: "Invoice issued under the tax regime of the Republic of Benin.",
    footerCourt: "Any dispute falls to the courts of Cotonou only.",
    forCompany: "For CARZONE SARL",
    stampCompta: "Stamp and accounting visa",
    cgv: {
      title: "GENERAL TERMS OF SALE AND WARRANTY",
      subtitle: (number, kind) => `Attached to normalised invoice no. ${number} · ${kind}`,
      kindVehicle: "Vehicle sales (showroom and import)",
      kindWorkshop: "Aftersales workshop work and repairs",
      company: "CARZONE SARL (showroom and mobility)",
      companyAddress: "Zone Maro-Militaire, Gbèdomidji district · Cotonou",
      forCompany: "For CARZONE SARL Benin:",
      salesDirection: "Sales management / signature and stamp",
      forClient: "For the client:",
      readApproved: "“Read and approved, good for agreement”",
      signStamp: "Client signature and stamp",
    },
  },
  receipt: {
    back: "← Back to invoices and payments",
    actionHint: (regNumber) => `Official payment receipt · ${regNumber}`,
    companyAddress: "Zone Maro-Militaire, Gbèdomidji · Cotonou",
    companyFiscal: "Tax ID: 0202314589201 · Tel: +229 21 33 00 00",
    docTitle: "PAYMENT RECEIPT",
    date: (value) => `Date: ${value}`,
    receivedFrom: "Received from:",
    phone: "Phone:",
    amountCollected: "Amount collected",
    method: "Payment method:",
    reference: "Transaction / document ref.:",
    noReference: "No reference given",
    invoice: "Invoice concerned:",
    notes: "Reason / notes:",
    defaultNote: "Payment of deposit / balance",
    accountTitle: (number) => `Client account position on invoice ${number}:`,
    totalInvoice: "Total invoice amount incl. tax:",
    totalCollected: "Total collected so far:",
    balanceDue: "Balance still due:",
    settledTag: "invoice paid in full",
    footerLegal: "Receipt drawn up in due form, to serve as evidence where needed.",
    footerCertified: "Certified document issued by CARZONE SARL, Cotonou.",
    forCashier: "Received in full / cash desk",
    stamp: "Stamp and signature",
  },
  statuses: {
    PAYEE: "Paid",
    PAYEE_PARTIEL: "Deposit received",
    EN_RETARD: "Overdue",
    ANNULEE: "Voided",
    EMISE: "Issued",
    BROUILLON: "Draft",
  },
  paymentMethods: {
    MTN_MOMO: "MTN Mobile Money Benin",
    MOOV_MONEY: "Moov Money Benin",
    MOBILE_MONEY: "Mobile Money Benin",
    VIREMENT_ECOBANK: "Ecobank Benin transfer",
    VIREMENT_BOA: "BOA Benin transfer",
    VIREMENT: "Other bank transfer",
    CHEQUE: "Bank cheque",
    ESPECES: "Cash (showroom cash desk)",
    CARTE: "Bank card (card terminal)",
  },
  server: {
    invoiceRequired: "The invoice to pay against is missing.",
    invalidAmount: "That amount is not valid.",
  },
};

const zh: InvoicesCopy = {
  dateLocale: "zh-CN",
  common: {
    cancel: "取消",
    close: "关闭",
  },
  tabs: {
    invoices: (count) => `销售发票(${count})`,
    payments: (count) => `收款与收据(${count})`,
    bilan: "月度损益与盈利分析",
  },
  kpi: {
    invoicedLabel: "开票总额(含税)",
    invoicedHint: (count) => `累计已开 ${count} 张发票`,
    collectedLabel: "已收款总额",
    collectedHint: (count) =>
      count === 1 ? "1 张发票已结清,无需催款" : `${count} 张发票已结清,无需催款`,
    outstandingLabel: "应收未收",
    outstandingHint: "客户还欠我们的余额。",
    overdueLabel: "逾期发票",
    overdueHint: "已过期,今天就该打电话。",
  },
  search: {
    invoices: "发票号、形式发票或客户...",
    payments: "收款编号、客户或发票号...",
  },
  filters: {
    all: "全部",
    unpaid: "未结清",
    paid: "已结清",
    overdue: "逾期",
    voided: "已作废",
    methodAll: "全部方式",
    methodChips: {
      MTN_MOMO: "MTN MoMo",
      MOOV_MONEY: "Moov Money",
      VIREMENT_ECOBANK: "Ecobank",
      VIREMENT_BOA: "BOA",
      CHEQUE: "支票",
      ESPECES: "现金",
    },
  },
  toolbar: {
    exportExcel: "导出财务报表(Excel)",
    exportExcelTitle: "把公司财务报表下载为 .xlsx 文件",
    recordPayment: "登记一笔收款",
  },
  invoiceTable: {
    headers: {
      number: "发票",
      client: "客户",
      dates: "日期",
      totalTtc: "含税合计",
      collected: "已收款",
      balance: "应收余额",
      status: "状态",
      actions: "操作",
    },
    empty: "没有符合条件的发票。把搜索范围放宽试试。",
    quoteRef: (number) => `报价单 ${number}`,
    issued: (date) => `${date} 开具`,
    due: (date) => `到期 ${date}`,
    htAndVat: (amount, rate) =>
      rate > 0 ? `${amount} 未税 · 增值税 ${rate}%` : `${amount} 未税`,
    paymentsCount: (count) => `已收 ${count} 笔`,
    settled: "已结清",
    remaining: "还欠",
    rowActions: {
      printLabel: "发票",
      printTitle: "打印正式发票",
      certifiedTitle: (code) => `贝宁税务局已认证(代码 ${code})`,
      dgiLabel: "税务局",
      dgiTitle: "向贝宁税务局(e-MECeF)认证这张发票",
      collectLabel: "收款",
      collectTitle: "记录一笔定金或结清发票",
      voidTitle: "由管理层内部作废,必须填写原因",
    },
  },
  paymentsTable: {
    headers: {
      reference: "收款编号",
      date: "日期",
      invoice: "对应发票",
      client: "客户",
      method: "收款方式",
      transaction: "交易流水号",
      amount: "收款金额",
      receipt: "收据",
    },
    empty: "还没有任何收款记录。",
    invoiceTotal: (amount) => `合计 ${amount}`,
    receiptLabel: "收据",
    receiptTitle: "打印收款收据",
  },
  voidModal: {
    title: "内部作废发票",
    bodyLead: "此项操作仅限",
    roleDirection: "总经理办公室",
    bodyMiddle: "与",
    roleAccounting: "财务部",
    bodyTail: "。必须填写书面原因,至少 8 个字符,并且会留档审计。",
    reasonPlaceholder: "例如:录入错误 / 管理层批准取消订单 / 已由 FAC-... 替代",
    confirm: "确认作废",
  },
  paymentModal: {
    title: "登记一笔收款",
    subtitle: "收据随后自动生成 · CARZONE SARL 收银台与银行账户",
    invoiceLabel: "对应发票 *",
    invoiceOption: (number, client, total, remaining) =>
      `${number} · ${client}(${total})· 还欠 ${remaining}`,
    totalInvoice: "发票总额",
    alreadyCollected: "已收款",
    balanceRemaining: "待收余额",
    amountLabel: "本次收款金额(FCFA)*",
    payFull: (amount) => `一次结清(${amount})`,
    methodLabel: "收款方式 *",
    referenceLabel: "流水号 / 支票号 / 凭证号",
    referencePlaceholder: "例如:MTN-849202、CHQ-BOA-7491...",
    paidAtLabel: "付款日期",
    notesLabel: "备注、内部备忘",
    notesPlaceholder: "例如:BYD Dolphin 订单 50% 定金",
    submit: "确认收款",
    saving: "正在保存...",
    errors: {
      selectInvoice: "请先选择发票。",
      amountPositive: "金额必须大于零。",
      exceeds: (amount, remaining) => `${amount} 超过剩余余额(${remaining})。`,
      generic: "收款没有保存成功。",
    },
  },
  bilan: {
    periodLabel: "分析区间:",
    yearOption: (year) => `${year} 年`,
    allYear: (year) => `${year} 全年`,
    monthNames: [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ],
    print: "打印财务报表",
    kpi: {
      revenueLabel: "开票收入",
      collectedPrefix: "实际到账:",
      grossLabel: "毛利",
      marginPrefix: "毛利率:",
      marginSuffix: "(已扣除采购成本)",
      opexLabel: "经营费用(OPEX)",
      payrollPrefix: "工资:",
      providersPrefix: "供应商与杂费:",
      netLabel: "实际净利润",
      netMarginPrefix: "净利率:",
      netMarginSuffix: "占收入",
    },
    pl: {
      title: "报表结构(利润表)",
      revenue: "开票收入合计(销售、维修、充电)",
      revenueWorkshop: (amount) => `其中售后维修:${amount}`,
      cogs: "已售商品与维修配件的采购成本",
      gross: "经营毛利",
      grossBadge: (pct) => `占收入 ${pct}%`,
      payroll: "工资总额与员工薪酬(人事)",
      opex: "外部费用与供应商(空调、SBEE、SONEB、电信、租金...)",
      opexProviders: (amount) => `其中外部供应商:${amount}`,
      net: "经营净利润",
      netBadge: "扣除费用与工资后的净利润",
    },
    monthly: {
      title: (year) => `月度汇总看板(${year})`,
      headers: {
        month: "月份",
        invoiced: "开票收入",
        collected: "实际到账",
        salaries: "已发工资",
        expenses: "供应商支出",
        net: "预估净利",
      },
      total: (year) => `累计合计(${year})`,
    },
  },
  print: {
    back: "← 返回发票与收款",
    actionHint: "商业正式发票 · CARZONE SARL 贝宁",
    companyTagline: "SARL · 展厅与出行服务",
    companyAddress: "Zone Maro-Militaire,Gbèdomidji 区 · 科托努",
    companyPhone: "电话:+229 21 33 00 00 / 97 00 00 00",
    companyMailWeb: "邮箱:contact@topcarzone.com · 网址:www.topcarzone.com",
    companyFiscal: "IFU:0202314589201 · RCCM:RB/COT/23 B 34567",
    docTitle: "正式发票",
    quoteRef: (number) => `报价单号 ${number}`,
    badgeSettled: "发票已结清",
    badgePending: "待付款",
    billedTo: "开票给",
    ifu: (value) => `IFU 税号:${value}`,
    address: "地址:",
    city: "城市:",
    phone: "电话:",
    email: "邮箱:",
    dateIssued: "开票日期:",
    dateDue: "到期日:",
    taxRegime: "税制:",
    vatRate: (rate) => `增值税 ${rate}%`,
    exempt: "免税",
    status: "状态:",
    columns: {
      designation: "服务、车辆与设备名称",
      quantity: "数量",
      unitHt: "未税单价",
      totalHt: "未税合计",
    },
    vin: (value) => `VIN ${value}`,
    vinUnassigned: "未分配",
    defaultLineTitle: "CARZONE SARL 商业服务",
    defaultLineSub: "按客户订单一并提供",
    paymentsTitle: "已收款项",
    noPayments: "这张发票暂时还没有收款记录。",
    subtotalHt: "未税小计:",
    vat: (rate) => `增值税(${rate}%):`,
    totalTtc: "含税合计:",
    totalCollected: "已收合计:",
    netToPay: "应付净额(余额):",
    legalHeading: "法定与税务声明",
    dgiHeading: "贝宁共和国 · 税务总局(DGI)",
    mecefCode: "MECeF / DGI 安全码:",
    nim: "NIM(开票机编号):",
    counters: "税务计数器:",
    certifiedNote: "发票已认证,并已上传至税务局 e-MECeF 中央服务器。",
    qrAlt: "e-MECeF 二维码",
    paymentHeading: "付款方式(CARZONE SARL 贝宁):",
    bankTransfer: "银行转账:",
    ecobank: "Ecobank 贝宁:",
    boa: "BOA 贝宁:",
    mobileMoney: "移动支付与收银台:",
    mtnMerchant: "MTN MoMo 商户:",
    moovMerchant: "Moov Money 商户:",
    cashDesk: "Maro-Militaire 展厅收银台(支票或现金)",
    footerRegime: "本发票依贝宁共和国税制开具。",
    footerCourt: "如有争议,仅科托努法院有管辖权。",
    forCompany: "CARZONE SARL",
    stampCompta: "财务章与签章",
    cgv: {
      title: "销售与质保通用条款",
      subtitle: (number, kind) => `附于正式发票 ${number} · ${kind}`,
      kindVehicle: "车辆销售(展厅与进口)",
      kindWorkshop: "售后维修与服务",
      company: "CARZONE SARL(展厅与出行)",
      companyAddress: "Zone Maro-Militaire,Gbèdomidji 区 · 科托努",
      forCompany: "CARZONE SARL 贝宁:",
      salesDirection: "销售部 / 签字与盖章",
      forClient: "客户方:",
      readApproved: "「已阅读并同意,确认成交」",
      signStamp: "客户签字与盖章",
    },
  },
  receipt: {
    back: "← 返回发票与收款",
    actionHint: (regNumber) => `正式收款收据 · ${regNumber}`,
    companyAddress: "Zone Maro-Militaire,Gbèdomidji · 科托努",
    companyFiscal: "IFU:0202314589201 · 电话:+229 21 33 00 00",
    docTitle: "付款收据",
    date: (value) => `日期:${value}`,
    receivedFrom: "付款人:",
    phone: "电话:",
    amountCollected: "收款金额",
    method: "结算方式:",
    reference: "流水号 / 凭证号:",
    noReference: "未填写参考号",
    invoice: "对应发票:",
    notes: "事由 / 备注:",
    defaultNote: "定金或尾款结算",
    accountTitle: (number) => `发票 ${number} 的客户账户情况:`,
    totalInvoice: "发票含税总额:",
    totalCollected: "累计收款:",
    balanceDue: "剩余应收:",
    settledTag: "发票已结清",
    footerLegal: "本收据依规开具,可作为有效凭证。",
    footerCertified: "本文件由 CARZONE SARL(科托努)认证出具。",
    forCashier: "收讫 / 收银台",
    stamp: "盖章与签字",
  },
  statuses: {
    PAYEE: "已结清",
    PAYEE_PARTIEL: "已收定金",
    EN_RETARD: "逾期",
    ANNULEE: "已作废",
    EMISE: "已开具",
    BROUILLON: "草稿",
  },
  paymentMethods: {
    MTN_MOMO: "MTN Mobile Money 贝宁",
    MOOV_MONEY: "Moov Money 贝宁",
    MOBILE_MONEY: "Mobile Money 贝宁",
    VIREMENT_ECOBANK: "Ecobank 贝宁转账",
    VIREMENT_BOA: "BOA 贝宁转账",
    VIREMENT: "其他银行转账",
    CHEQUE: "银行支票",
    ESPECES: "现金(展厅收银台)",
    CARTE: "银行卡(刷卡机)",
  },
  server: {
    invoiceRequired: "缺少要收款的发票。",
    invalidAmount: "填写的金额无效。",
  },
};

export const invoicesCopy: Record<Locale, InvoicesCopy> = { fr, en, zh };

/** Libellé d'un statut de facture ; renvoie le code brut s'il est inconnu. */
export function invoiceStatusLabel(copy: InvoicesCopy, code: string): string {
  return copy.statuses[code] ?? code;
}

/** Libellé d'un mode de règlement ; renvoie le code brut s'il est inconnu. */
export function paymentMethodLabel(copy: InvoicesCopy, code: string): string {
  return copy.paymentMethods[code] ?? code;
}

/**
 * Formate une date de facture ou de règlement selon la locale active.
 * Les montants restent en FCFA (formatXof), seule l'écriture de la date change.
 */
export function formatInvoiceDate(
  copy: InvoicesCopy,
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
