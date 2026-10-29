import type { Locale } from "@/lib/prefs";

/**
 * Dictionnaire des modules RH, ÉQUIPE / RÔLES et DÉPENSES.
 *
 * Règles de rédaction :
 * - FR = langue source, ton PME locale, pas de tiret cadratin.
 * - EN = anglais international, contractions naturelles.
 * - ZH = chinois simplifié, phrases courtes, marques en latin.
 * - Les codes techniques (ACTIF, CDI, A_PAYER, PRESTATAIRE_SERVICE...) restent
 *   les valeurs de la base : seuls les libellés affichés sont traduits.
 * - Les libellés de rôles métier (PDG, DG, RF...) passent par `messages.roles`
 *   et les libellés de capacités par `lib/permissions-config` : on n'y touche pas.
 * - Montants FCFA, numéros (matricule, BC, proforma), noms de personnes,
 *   d'entreprises et de banques ne sont jamais traduits.
 */

export type EmployeeStatusKey = "ACTIF" | "CONGE" | "SUSPENDU" | "QUITTE";

export type ContractTypeKey = "CDI" | "CDD" | "STAGE" | "PRESTATION" | "ESSAI";

export type LeaveStatusKey = "EN_ATTENTE" | "APPROUVE" | "REFUSE" | "ANNULE";

export type ExpenseStatusKey = "A_PAYER" | "PAYE";

export type ExpenseCategoryKey =
  | "PRESTATAIRE_SERVICE"
  | "ELECTRICITE_SBEE"
  | "EAU_SONEB"
  | "INTERNET_TELECOM"
  | "LOYER"
  | "CARBURANT"
  | "FOURNITURES_BUREAU"
  | "OUTILLAGE_ATELIER"
  | "AUTRE_CHARGE";

export type PaymentMethodKey =
  | "VIREMENT_ECOBANK"
  | "VIREMENT_BOA"
  | "VIREMENT"
  | "CHEQUE"
  | "ESPECES"
  | "MOBILE_MONEY";

export type ContractCopy = {
  /** Libellé court : tableaux et filtres. */
  short: string;
  /** Libellé long : listes déroulantes des formulaires. */
  long: string;
};

export type AdminCopy = {
  /** Locale des dates affichées (formatXof reste en XOF). */
  dateLocale: string;
  common: {
    cancel: string;
    close: string;
    save: string;
    loading: string;
    actions: string;
    status: string;
  };
  hr: {
    title: string;
    subtitle: string;
    actions: {
      newEmployee: string;
      newLeave: string;
      seedBase: string;
    };
    kpi: {
      headcount: string;
      headcountValue: (count: number) => string;
      active: string;
      activeValue: (active: number, onLeave: number) => string;
      pending: string;
      pendingValue: (count: number) => string;
      departments: string;
      departmentsValue: (count: number) => string;
    };
    tabs: {
      personnel: (count: number) => string;
      leaves: string;
      payroll: string;
      config: string;
    };
    personnel: {
      searchPlaceholder: string;
      allDepartments: string;
      allContracts: string;
      allStatuses: string;
      table: {
        employeeNumber: string;
        employee: string;
        jobTitle: string;
        department: string;
        contract: string;
        contact: string;
      };
      empty: string;
      unassigned: string;
      account: string;
      viewTitle: string;
      editTitle: string;
      deleteTitle: string;
    };
    contracts: Record<ContractTypeKey, ContractCopy>;
    employeeStatus: Record<EmployeeStatusKey, string>;
    leaveStatus: Record<LeaveStatusKey, string>;
    leaves: {
      requestsTitle: string;
      table: {
        employee: string;
        leaveType: string;
        period: string;
        duration: string;
        reason: string;
      };
      empty: string;
      period: (from: string, to: string) => string;
      days: (count: number) => string;
      rejectionReason: (reason: string) => string;
      approve: string;
      approveTitle: string;
      reject: string;
      rejectTitle: string;
      cancelLeave: string;
      confirmCancelLeave: string;
      balancesTitle: (year: number) => string;
      balanceTable: {
        employeeNumber: string;
        employee: string;
        department: string;
        allocated: string;
        used: string;
        remaining: string;
      };
    };
    config: {
      departmentsTitle: string;
      addDepartment: string;
      employeesAttached: (count: number) => string;
      confirmDeleteDepartment: (name: string) => string;
      leaveTypesTitle: string;
      addLeaveType: string;
      paid: string;
      unpaid: string;
      quotaLabel: string;
      daysPerYear: (days: number) => string;
      confirmDeleteLeaveType: (name: string) => string;
    };
    employeeModal: {
      titleNew: string;
      titleEdit: (employeeNumber: string) => string;
      firstName: string;
      lastName: string;
      employeeNumber: string;
      employeeNumberPlaceholder: string;
      jobTitle: string;
      jobTitlePlaceholder: string;
      department: string;
      selectDepartment: string;
      contractType: string;
      hireDate: string;
      contractEnd: string;
      baseSalary: string;
      salaryPlaceholder: string;
      status: string;
      phone: string;
      phonePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      cnss: string;
      cnssPlaceholder: string;
      ifu: string;
      ifuPlaceholder: string;
      bank: string;
      bankPlaceholder: string;
      bankAccount: string;
      bankAccountPlaceholder: string;
      emergency: string;
      emergencyPlaceholder: string;
      userAccount: string;
      noUserAccount: string;
      create: string;
      update: string;
      saving: string;
    };
    detail: {
      contractCard: string;
      contractTypeLabel: string;
      statusLabel: string;
      hireLabel: string;
      endLabel: string;
      salaryLabel: string;
      complianceCard: string;
      cnssLabel: string;
      ifuLabel: string;
      bankLabel: string;
      accountLabel: string;
      missing: string;
      contactCard: string;
      phoneLabel: string;
      emailLabel: string;
      emergencyLabel: string;
      leavesTitle: (year: number) => string;
      leaveLine: (code: string) => string;
      taken: string;
      allocated: string;
      remaining: string;
      emptyBalances: string;
      editFile: string;
      daysShort: (days: number) => string;
    };
    leaveModal: {
      title: string;
      employeeLabel: string;
      noEmployee: string;
      selectEmployee: string;
      typeLabel: string;
      noLeaveType: string;
      loadLegal: string;
      selectType: string;
      typeOption: (name: string, paid: string, days: number) => string;
      startDate: string;
      endDate: string;
      daysCount: string;
      reason: string;
      reasonPlaceholder: string;
      submit: string;
      submitting: string;
    };
    rejectModal: {
      title: string;
      hint: string;
      placeholder: string;
      confirm: string;
    };
    deptModal: {
      titleNew: string;
      titleEdit: string;
      name: string;
      namePlaceholder: string;
      code: string;
      codePlaceholder: string;
      description: string;
    };
    leaveTypeModal: {
      titleNew: string;
      titleEdit: string;
      name: string;
      namePlaceholder: string;
      code: string;
      codePlaceholder: string;
      days: string;
      paid: string;
      paidYes: string;
      paidNo: string;
    };
    alerts: {
      errSaveEmployee: string;
      errSave: string;
      errDelete: string;
      selectEmployeeAndType: string;
      errLeaveCreate: string;
      errLeaveApprove: string;
      errLeaveReject: string;
      confirmDeleteEmployee: (name: string) => string;
      confirmSeed: string;
      seedDone: string;
      errSeed: string;
    };
  };
  payroll: {
    months: string[];
    methods: Record<PaymentMethodKey, string>;
    periodLabel: string;
    bulkButton: (month: string, year: string) => string;
    kpi: {
      payrollLabel: string;
      payrollHint: (count: number) => string;
      paidLabel: string;
      paidHint: (paid: number, total: number, percent: number) => string;
      remainingLabel: (month: string) => string;
      allClear: string;
      awaitingTransfer: string;
    };
    registerTitle: (month: string, year: string) => string;
    registerHint: string;
    searchPlaceholder: string;
    filterAll: string;
    filterPaid: string;
    filterPending: string;
    table: {
      employee: string;
      jobAndDepartment: string;
      bankAccount: string;
      baseSalary: string;
      payStatus: string;
      settlement: string;
    };
    empty: string;
    noDepartment: string;
    noAccount: string;
    cashDesk: string;
    paidBadge: string;
    pendingBadge: string;
    referencePrefix: string;
    receiptButton: string;
    viewPayslipTitle: string;
    cancelPayment: string;
    cancelPaymentTitle: string;
    payButton: string;
    payModal: {
      title: string;
      periodLabel: string;
      accountLine: (bank: string, account: string) => string;
      amountLabel: string;
      methodLabel: string;
      referenceLabel: string;
      referencePlaceholder: string;
      notesLabel: string;
      notesPlaceholder: string;
      validate: string;
      validating: string;
    };
    bulkModal: {
      title: string;
      intro: string;
      total: (amount: string) => string;
      methodLabel: string;
      referenceLabel: string;
      confirm: string;
      running: string;
    };
    receipt: {
      title: string;
      employeeLabel: string;
      staffIdLabel: string;
      jobLabel: string;
      periodLabel: string;
      paymentDateLabel: string;
      methodLabel: string;
      gross: string;
      referenceLabel: string;
      net: string;
      print: string;
    };
    alerts: {
      errSave: string;
      errCancel: string;
      errBulk: string;
    };
  };
  team: {
    title: string;
    subtitle: string;
    newUser: string;
    kpi: {
      total: string;
      active: string;
      roles: string;
      customized: string;
    };
    searchPlaceholder: string;
    roleLabel: string;
    allRoles: string;
    statusLabel: string;
    allStatuses: string;
    activeAccounts: string;
    inactiveAccounts: string;
    results: (count: number) => string;
    table: {
      userAndEmail: string;
      role: string;
      capabilities: string;
      password: string;
    };
    you: string;
    capabilitiesCount: (count: number, total: number) => string;
    customized: string;
    roleDefault: string;
    bcryptTitle: string;
    changePassword: string;
    changePasswordTitle: string;
    modifiedOn: (date: string) => string;
    active: string;
    inactive: string;
    toggleSelfTitle: string;
    toggleOffTitle: string;
    toggleOnTitle: string;
    manageButton: string;
    deleteTitle: string;
    empty: string;
    addModal: {
      title: string;
      subtitle: string;
      fullName: string;
      fullNamePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      role: string;
      password: string;
      gridTitle: string;
      checkedCount: (count: number, total: number) => string;
      resetToRole: (role: string) => string;
      create: string;
      creating: string;
    };
    editModal: {
      title: (name: string) => string;
      subtitle: string;
      fullName: string;
      email: string;
      role: string;
      gridTitle: string;
      allowedCount: (count: number, total: number) => string;
      resetToRole: (role: string) => string;
      noteTitle: string;
      save: string;
      saving: string;
      confirmResetRole: (role: string) => string;
    };
    passwordModal: {
      title: string;
      forUser: (name: string, email: string) => string;
      newPassword: string;
      placeholder: string;
      tooShort: string;
      hint: string;
      success: (name: string) => string;
      errUpdate: string;
      validate: string;
      validating: string;
    };
    capabilitiesTable: {
      feature: string;
      capabilities: string;
      checkAll: string;
      uncheckAll: string;
    };
    alerts: {
      missingFields: string;
      errCreate: string;
      errEdit: string;
      errStatus: string;
      errDelete: string;
      confirmDelete: (name: string) => string;
    };
  };
  expenses: {
    title: string;
    subtitle: string;
    printRegister: string;
    newExpense: string;
    kpi: {
      total: (count: number) => string;
      totalHint: string;
      paid: string;
      paidHint: string;
      pending: string;
      pendingHint: string;
      providers: string;
      providersHint: string;
      payroll: (year: number) => string;
      payrollHint: string;
    };
    searchPlaceholder: string;
    allCategories: string;
    allStatuses: string;
    statusPendingOption: string;
    statusPaidOption: string;
    totalShown: string;
    lines: (count: number) => string;
    table: {
      reference: string;
      dateAndCategory: string;
      designation: string;
      supplier: string;
      amountTtc: string;
      paymentStatus: string;
    };
    empty: string;
    categories: Record<ExpenseCategoryKey, string>;
    proforma: (reference: string) => string;
    phone: (phone: string) => string;
    ht: (amount: string) => string;
    paidBadge: string;
    paidOn: (date: string, method: string) => string;
    pendingBadge: string;
    dueDate: (date: string) => string;
    defaultMethod: string;
    viewPurchaseOrderTitle: string;
    purchaseOrderShort: string;
    payButton: string;
    deleteTitle: string;
    createModal: {
      title: string;
      subtitle: string;
      category: string;
      serviceDate: string;
      supplierSection: string;
      supplierName: string;
      supplierNamePlaceholder: string;
      proforma: string;
      proformaPlaceholder: string;
      supplierPhone: string;
      supplierEmail: string;
      withPurchaseOrder: string;
      designation: string;
      designationPlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      amountHt: string;
      amountHtPlaceholder: string;
      tax: string;
      taxPlaceholder: string;
      amountTtc: string;
      amountTtcPlaceholder: string;
      initialStatus: string;
      statusPendingOption: string;
      statusPaidOption: string;
      dueDate: string;
      create: string;
      creating: string;
    };
    payModal: {
      title: string;
      expenseLabel: string;
      amountLabel: string;
      methodLabel: string;
      dateLabel: string;
      referenceLabel: string;
      referencePlaceholder: string;
      validate: string;
      validating: string;
    };
    purchaseOrder: {
      preview: string;
      print: string;
      tagline: string;
      address: string;
      title: string;
      dateLabel: string;
      recipient: string;
      references: string;
      proformaRef: string;
      internalRef: string;
      dueDate: string;
      designationColumn: string;
      amountHtColumn: string;
      taxColumn: string;
      amountTtcColumn: string;
      netToPay: string;
      supplierSignature: string;
      signatureStamp: string;
      companySignature: string;
      authorizedSignature: string;
    };
    alerts: {
      errCreate: string;
      errPayment: string;
      errDelete: string;
      confirmDelete: (name: string) => string;
    };
  };
};

const fr: AdminCopy = {
  dateLocale: "fr-BJ",
  common: {
    cancel: "Annuler",
    close: "Fermer",
    save: "Enregistrer",
    loading: "Patientez...",
    actions: "Actions",
    status: "Statut",
  },
  hr: {
    title: "Ressources humaines (RH)",
    subtitle:
      "Le personnel, les contrats, les congés, les soldes et le référentiel de la maison.",
    actions: {
      newEmployee: "Ajouter un salarié",
      newLeave: "Poser un congé",
      seedBase: "Charger les normes Bénin / OHADA",
    },
    kpi: {
      headcount: "Effectif total",
      headcountValue: (count) => (count > 1 ? `${count} salariés` : `${count} salarié`),
      active: "Salariés actifs",
      activeValue: (active, onLeave) => `${active} en poste, ${onLeave} en congé`,
      pending: "Congés en attente",
      pendingValue: (count) => (count > 1 ? `${count} demandes` : `${count} demande`),
      departments: "Départements",
      departmentsValue: (count) => (count > 1 ? `${count} services` : `${count} service`),
    },
    tabs: {
      personnel: (count) => `Personnel et salariés (${count})`,
      leaves: "Congés et absences",
      payroll: "Paie et salaires (comptabilité)",
      config: "Configuration et référentiel",
    },
    personnel: {
      searchPlaceholder: "Un nom, un matricule, un poste, un téléphone...",
      allDepartments: "Tous les départements",
      allContracts: "Tous les contrats",
      allStatuses: "Tous les statuts",
      table: {
        employeeNumber: "Matricule",
        employee: "Salarié",
        jobTitle: "Poste",
        department: "Département",
        contract: "Contrat",
        contact: "Contact",
      },
      empty: "Aucun salarié ne correspond à ces filtres.",
      unassigned: "Non assigné",
      account: "Compte",
      viewTitle: "Voir le dossier",
      editTitle: "Modifier",
      deleteTitle: "Supprimer",
    },
    contracts: {
      CDI: { short: "CDI", long: "CDI (durée indéterminée)" },
      CDD: { short: "CDD", long: "CDD (durée déterminée)" },
      STAGE: { short: "Stage", long: "Stage professionnel" },
      PRESTATION: { short: "Prestation", long: "Prestation / consultant" },
      ESSAI: { short: "Essai", long: "Période d'essai" },
    },
    employeeStatus: {
      ACTIF: "Actif",
      CONGE: "En congé",
      SUSPENDU: "Suspendu",
      QUITTE: "Parti",
    },
    leaveStatus: {
      EN_ATTENTE: "En attente",
      APPROUVE: "Approuvé",
      REFUSE: "Refusé",
      ANNULE: "Annulé",
    },
    leaves: {
      requestsTitle: "Demandes de congé et autorisations d'absence",
      table: {
        employee: "Salarié",
        leaveType: "Type de congé",
        period: "Période",
        duration: "Durée",
        reason: "Motif",
      },
      empty: "Aucune demande pour l'instant.",
      period: (from, to) => `Du ${from} au ${to}`,
      days: (count) => (count > 1 ? `${count} jours` : `${count} jour`),
      rejectionReason: (reason) => `Motif du refus : ${reason}`,
      approve: "Approuver",
      approveTitle: "Valider la demande",
      reject: "Refuser",
      rejectTitle: "Refuser la demande",
      cancelLeave: "Annuler le congé",
      confirmCancelLeave:
        "Vous annulez ce congé validé ? Les jours repartent dans le solde.",
      balancesTitle: (year) =>
        `Soldes de congés annuels ${year} · norme Bénin (24 jours ouvrables par an)`,
      balanceTable: {
        employeeNumber: "Matricule",
        employee: "Salarié",
        department: "Département",
        allocated: "Quota annuel",
        used: "Jours pris",
        remaining: "Solde restant",
      },
    },
    config: {
      departmentsTitle: "Départements et services",
      addDepartment: "Ajouter un département",
      employeesAttached: (count) =>
        count > 1 ? `${count} employés rattachés` : `${count} employé rattaché`,
      confirmDeleteDepartment: (name) => `Supprimer le département ${name} ?`,
      leaveTypesTitle: "Types de congé et rémunération",
      addLeaveType: "Ajouter un type",
      paid: "Rémunéré",
      unpaid: "Sans solde",
      quotaLabel: "Quota",
      daysPerYear: (days) => (days > 1 ? `${days} jours/an` : `${days} jour/an`),
      confirmDeleteLeaveType: (name) => `Supprimer le type de congé ${name} ?`,
    },
    employeeModal: {
      titleNew: "Nouveau salarié",
      titleEdit: (employeeNumber) => `Modifier la fiche ${employeeNumber}`,
      firstName: "Prénom *",
      lastName: "Nom de famille *",
      employeeNumber: "Matricule (laissez vide, on le génère)",
      employeeNumberPlaceholder: "ex. EMP-2026-001",
      jobTitle: "Poste ou intitulé de fonction *",
      jobTitlePlaceholder: "ex. Conseiller commercial senior",
      department: "Département",
      selectDepartment: "Choisir un département",
      contractType: "Type de contrat",
      hireDate: "Date d'embauche *",
      contractEnd: "Date de fin (CDD ou stage)",
      baseSalary: "Salaire de base mensuel (FCFA)",
      salaryPlaceholder: "ex. 250000",
      status: "Statut",
      phone: "Téléphone",
      phonePlaceholder: "ex. +229 97 00 00 00",
      email: "Email professionnel ou personnel",
      emailPlaceholder: "ex. prenom.nom@topcarzone.com",
      cnss: "Numéro CNSS (Bénin)",
      cnssPlaceholder: "ex. 123456789",
      ifu: "Numéro IFU",
      ifuPlaceholder: "ex. 3202300000000",
      bank: "Banque",
      bankPlaceholder: "ex. BOA, Ecobank, UBA...",
      bankAccount: "Compte bancaire / RIB",
      bankAccountPlaceholder: "ex. 01001 00000000000 00",
      emergency: "Contact d'urgence (nom et téléphone)",
      emergencyPlaceholder: "ex. conjoint(e), +229 95 00 00 00",
      userAccount: "Compte système lié",
      noUserAccount: "Aucun compte lié",
      create: "Créer le salarié",
      update: "Mettre à jour",
      saving: "Enregistrement...",
    },
    detail: {
      contractCard: "Contrat et rémunération",
      contractTypeLabel: "Type de contrat",
      statusLabel: "Statut",
      hireLabel: "Embauche",
      endLabel: "Fin de contrat",
      salaryLabel: "Salaire mensuel",
      complianceCard: "Conformité sociale et coordonnées bancaires",
      cnssLabel: "N° CNSS",
      ifuLabel: "N° IFU",
      bankLabel: "Banque",
      accountLabel: "N° de compte",
      missing: "Non renseigné",
      contactCard: "Coordonnées et urgence",
      phoneLabel: "Téléphone",
      emailLabel: "Email",
      emergencyLabel: "Urgence",
      leavesTitle: (year) => `Soldes de congés (${year})`,
      leaveLine: (code) => `Congé ${code}`,
      taken: "Pris",
      allocated: "Alloué",
      remaining: "Restant",
      emptyBalances:
        "Aucun solde initialisé. Passez par l'onglet Configuration.",
      editFile: "Modifier le dossier",
      daysShort: (days) => `${days} j`,
    },
    leaveModal: {
      title: "Demande de congé",
      employeeLabel: "Salarié concerné *",
      noEmployee:
        "Aucun salarié enregistré. Créez-en un dans l'onglet Personnel.",
      selectEmployee: "Choisir un salarié",
      typeLabel: "Type de congé *",
      noLeaveType: "Aucun type de congé dans le référentiel.",
      loadLegal: "Charger les types légaux (Bénin 24 j, maladie, maternité...)",
      selectType: "Choisir le type",
      typeOption: (name, paid, days) => `${name} (${paid}) · ${days} j max`,
      startDate: "Date de début *",
      endDate: "Date de fin *",
      daysCount: "Jours ouvrables *",
      reason: "Motif ou justification",
      reasonPlaceholder:
        "ex. congés annuels, événement familial, rendez-vous médical...",
      submit: "Soumettre la demande",
      submitting: "Envoi...",
    },
    rejectModal: {
      title: "Refus de la demande",
      hint: "Indiquez le motif. Il sera notifié au salarié et archivé.",
      placeholder:
        "ex. forte affluence en atelier, justificatif médical manquant...",
      confirm: "Confirmer le refus",
    },
    deptModal: {
      titleNew: "Nouveau département",
      titleEdit: "Modifier le département",
      name: "Nom du département *",
      namePlaceholder: "ex. Logistique et magasin",
      code: "Code (3 lettres) *",
      codePlaceholder: "ex. LOG",
      description: "Description ou rôle",
    },
    leaveTypeModal: {
      titleNew: "Nouveau type de congé",
      titleEdit: "Modifier le type de congé",
      name: "Nom du congé *",
      namePlaceholder: "ex. Congé annuel payé",
      code: "Code unique *",
      codePlaceholder: "ex. ANNUEL",
      days: "Jours autorisés par an *",
      paid: "Maintien du salaire",
      paidYes: "Oui, rémunéré",
      paidNo: "Non, sans solde",
    },
    alerts: {
      errSaveEmployee: "Impossible d'enregistrer ce salarié.",
      errSave: "L'enregistrement a échoué.",
      errDelete: "La suppression a échoué.",
      selectEmployeeAndType: "Choisissez un salarié et un type de congé.",
      errLeaveCreate: "La demande n'a pas pu être créée.",
      errLeaveApprove: "La validation a échoué.",
      errLeaveReject: "Le refus n'a pas été enregistré.",
      confirmDeleteEmployee: (name) =>
        `Supprimer définitivement le dossier de ${name} ?`,
      confirmSeed:
        "Charger le référentiel RH standard (départements et types de congé d'après le Code du travail béninois et les normes OHADA) ?",
      seedDone: "C'est en place. La page se recharge.",
      errSeed: "L'initialisation a échoué.",
    },
  },
  payroll: {
    months: [
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
    methods: {
      VIREMENT_ECOBANK: "Virement Ecobank",
      VIREMENT_BOA: "Virement BOA",
      VIREMENT: "Virement bancaire",
      CHEQUE: "Chèque bancaire",
      ESPECES: "Espèces (caisse)",
      MOBILE_MONEY: "Mobile Money (Moov / MTN)",
    },
    periodLabel: "Période",
    bulkButton: (month, year) => `Régler tous les salaires (${month} ${year})`,
    kpi: {
      payrollLabel: "Masse salariale mensuelle",
      payrollHint: (count) =>
        count > 1 ? `${count} salariés en poste` : `${count} salarié en poste`,
      paidLabel: "Salaires réglés ce mois",
      paidHint: (paid, total, percent) =>
        `${paid} sur ${total} salariés payés (${percent} %)`,
      remainingLabel: (month) => `Reste à payer (${month})`,
      allClear: "Tout est à jour.",
      awaitingTransfer: "Virement en attente",
    },
    registerTitle: (month, year) => `Livre de paie et virements · ${month} ${year}`,
    registerHint:
      "Vue et validation des rémunérations pour la comptabilité et la direction",
    searchPlaceholder: "Salarié ou matricule...",
    filterAll: "Tous les statuts",
    filterPaid: "Payés seulement",
    filterPending: "En attente de paiement",
    table: {
      employee: "Salarié",
      jobAndDepartment: "Poste et service",
      bankAccount: "Compte bancaire",
      baseSalary: "Salaire de base (FCFA)",
      payStatus: "Paiement",
      settlement: "Règlement et réf.",
    },
    empty: "Aucun salarié ne correspond.",
    noDepartment: "Général",
    noAccount: "N° manquant",
    cashDesk: "Espèces / caisse",
    paidBadge: "Payé",
    pendingBadge: "En attente",
    referencePrefix: "Réf.",
    receiptButton: "Reçu",
    viewPayslipTitle: "Voir le bulletin",
    cancelPayment: "Annuler",
    cancelPaymentTitle: "Revenir sur ce paiement",
    payButton: "Payer",
    payModal: {
      title: "Régler le salaire",
      periodLabel: "Période de rémunération",
      accountLine: (bank, account) => `Compte ${bank} · ${account}`,
      amountLabel: "Montant à verser (FCFA) *",
      methodLabel: "Mode de règlement *",
      referenceLabel: "Référence bancaire, n° de transaction ou chèque",
      referencePlaceholder: "ex. VIR-2026-OCT-042 ou n° de chèque",
      notesLabel: "Observations comptables",
      notesPlaceholder: "ex. prime incluse, acompte déduit...",
      validate: "Valider le paiement",
      validating: "Validation...",
    },
    bulkModal: {
      title: "Règlement groupé des salaires",
      intro:
        "Cette action enregistre le versement des salaires de tout le personnel actif pour le mois de",
      total: (amount) => `(Total estimé : ${amount}).`,
      methodLabel: "Mode de règlement groupé *",
      referenceLabel: "Référence du virement global",
      confirm: "Confirmer le virement groupé",
      running: "Exécution...",
    },
    receipt: {
      title: "Reçu et justificatif de règlement de salaire",
      employeeLabel: "Salarié",
      staffIdLabel: "Matricule",
      jobLabel: "Poste",
      periodLabel: "Période",
      paymentDateLabel: "Date de règlement",
      methodLabel: "Mode",
      gross: "Salaire de base brut",
      referenceLabel: "Référence virement ou chèque",
      net: "Net payé",
      print: "Imprimer le reçu",
    },
    alerts: {
      errSave: "Le paiement n'a pas pu être enregistré.",
      errCancel: "L'annulation a échoué.",
      errBulk: "Le paiement groupé a échoué.",
    },
  },
  team: {
    title: "Comptes et rôles",
    subtitle:
      "Qui accède à quoi, en direct : créez un compte, donnez-lui un rôle, puis cochez ses capacités écran par écran.",
    newUser: "Nouvel utilisateur",
    kpi: {
      total: "Total utilisateurs",
      active: "Comptes actifs",
      roles: "Rôles distincts",
      customized: "Profils personnalisés",
    },
    searchPlaceholder: "Un nom, un email, un rôle...",
    roleLabel: "Rôle",
    allRoles: "Tous les rôles",
    statusLabel: "Statut",
    allStatuses: "Tous les statuts",
    activeAccounts: "Comptes actifs",
    inactiveAccounts: "Comptes inactifs",
    results: (count) => (count > 1 ? `${count} résultats` : `${count} résultat`),
    table: {
      userAndEmail: "Utilisateur et email",
      role: "Rôle attribué",
      capabilities: "Capacités et permissions",
      password: "🔑 Mot de passe (accès DG / admin)",
    },
    you: "(vous)",
    capabilitiesCount: (count, total) => `${count} / ${total} capacités`,
    customized: "Personnalisé",
    roleDefault: "Valeurs du rôle",
    bcryptTitle:
      "Mot de passe haché sans retour possible avec Bcrypt (sécurité maximale)",
    changePassword: "Changer",
    changePasswordTitle: "Définir ou réinitialiser le mot de passe de ce compte",
    modifiedOn: (date) => `Modifié le ${date}`,
    active: "Actif",
    inactive: "Inactif",
    toggleSelfTitle: "Vous ne pouvez pas désactiver votre propre compte",
    toggleOffTitle: "Cliquer pour désactiver",
    toggleOnTitle: "Cliquer pour activer",
    manageButton: "Capacités et rôle",
    deleteTitle: "Supprimer définitivement ce compte",
    empty: "Aucun utilisateur ne correspond à cette recherche.",
    addModal: {
      title: "Créer un utilisateur et régler ses droits",
      subtitle:
        "Renseignez les identifiants, puis cochez les fonctionnalités autorisées.",
      fullName: "Nom et prénom *",
      fullNamePlaceholder: "ex. Jean Dupont",
      email: "Adresse email *",
      emailPlaceholder: "jean.dupont@entreprise.com",
      role: "Rôle de base *",
      password: "Mot de passe initial",
      gridTitle: "Grille des capacités et permissions",
      checkedCount: (count, total) => `${count} / ${total} cochées`,
      resetToRole: (role) => `Revenir aux droits du rôle (${role})`,
      create: "Créer l'utilisateur",
      creating: "Création en cours...",
    },
    editModal: {
      title: (name) => `Capacités et rôle de ${name}`,
      subtitle:
        "Vous voyez ici, en direct, ce que ce compte peut faire sur chaque écran.",
      fullName: "Nom complet",
      email: "Adresse email (identifiant)",
      role: "Rôle de référence",
      gridTitle: "Droits et capacités (cochez ce que ce compte peut faire)",
      allowedCount: (count, total) => `${count} / ${total} capacités autorisées`,
      resetToRole: (role) => `Revenir aux droits du rôle ${role}`,
      noteTitle: "Les changements s'appliquent dès l'enregistrement.",
      save: "Enregistrer les capacités",
      saving: "Enregistrement...",
      confirmResetRole: (role) =>
        `Remettre aussi les capacités aux valeurs par défaut du rôle ${role} ?`,
    },
    passwordModal: {
      title: "Modifier le mot de passe",
      forUser: (name, email) => `Pour ${name} (${email})`,
      newPassword: "Nouveau mot de passe",
      placeholder: "Saisissez le nouveau mot de passe...",
      tooShort: "Le mot de passe doit faire au moins 4 caractères.",
      hint: "Le mot de passe est enregistré tout de suite. La direction peut le lire en clair et une notification part.",
      success: (name) =>
        `Mot de passe de ${name} mis à jour. La notification est partie.`,
      errUpdate: "Le mot de passe n'a pas pu être mis à jour.",
      validate: "Valider le mot de passe",
      validating: "Mise à jour...",
    },
    capabilitiesTable: {
      feature: "Fonctionnalité",
      capabilities: "Capacités",
      checkAll: "Tout cocher",
      uncheckAll: "Tout décocher",
    },
    alerts: {
      missingFields: "Il manque le nom complet ou l'adresse email.",
      errCreate: "La création du compte a échoué.",
      errEdit: "La modification du compte a échoué.",
      errStatus: "Le statut n'a pas pu être changé.",
      errDelete: "La suppression a échoué.",
      confirmDelete: (name) => `Supprimer définitivement le compte ${name} ?`,
    },
  },
  expenses: {
    title: "Charges, dépenses et prestataires",
    subtitle:
      "Bons de commande (BC), proformas de sous-traitance (clim, atelier), charges fixes (SBEE, SONEB) et compta.",
    printRegister: "Imprimer le registre",
    newExpense: "Nouveau bon de commande ou dépense",
    kpi: {
      total: (count) => `Total des dépenses saisies (${count})`,
      totalHint: "Toutes les charges d'exploitation confondues",
      paid: "Charges réglées",
      paidHint: "Justificatifs et règlements effectués",
      pending: "En attente de règlement",
      pendingHint: "Engagements de paiement en cours",
      providers: "Sous-traitance et prestataires",
      providersHint: "Climatisation, plomberie, atelier SAV",
      payroll: (year) => `Masse salariale décaissée (${year})`,
      payrollHint: "Salaires versés aux employés",
    },
    searchPlaceholder: "Prestataire, désignation, n° de BC, proforma...",
    allCategories: "Toutes les catégories",
    allStatuses: "Tous les statuts",
    statusPendingOption: "À payer (en attente)",
    statusPaidOption: "Réglé (payé)",
    totalShown: "Total affiché",
    lines: (count) => (count > 1 ? `${count} lignes` : `${count} ligne`),
    table: {
      reference: "Réf. et bon de commande",
      dateAndCategory: "Date et catégorie",
      designation: "Désignation / prestation",
      supplier: "Prestataire / fournisseur",
      amountTtc: "Montant TTC",
      paymentStatus: "Statut du règlement",
    },
    empty: "Aucune dépense ni prestation avec ces critères.",
    categories: {
      PRESTATAIRE_SERVICE: "Prestataires et services extérieurs",
      ELECTRICITE_SBEE: "Électricité (SBEE)",
      EAU_SONEB: "Eau (SONEB)",
      INTERNET_TELECOM: "Internet et télécoms",
      LOYER: "Loyer et charges locatives",
      CARBURANT: "Carburant et déplacements",
      FOURNITURES_BUREAU: "Fournitures et consommables",
      OUTILLAGE_ATELIER: "Outillage et pièces atelier",
      AUTRE_CHARGE: "Autres charges d'exploitation",
    },
    proforma: (reference) => `Proforma : ${reference}`,
    phone: (phone) => `Tél. : ${phone}`,
    ht: (amount) => `HT : ${amount}`,
    paidBadge: "Réglé",
    paidOn: (date, method) => `Le ${date} (${method})`,
    pendingBadge: "À payer",
    dueDate: (date) => `Échéance : ${date}`,
    defaultMethod: "Virement",
    viewPurchaseOrderTitle: "Voir ou imprimer le bon de commande (BC)",
    purchaseOrderShort: "BC",
    payButton: "Régler",
    deleteTitle: "Supprimer",
    createModal: {
      title: "Nouveau bon de commande ou dépense",
      subtitle:
        "Une prestation de sous-traitance, une charge qui revient chaque mois ou un achat d'exploitation.",
      category: "Catégorie de la charge *",
      serviceDate: "Date de la prestation *",
      supplierSection: "Prestataire et devis proforma",
      supplierName: "Nom du prestataire ou de l'entreprise *",
      supplierNamePlaceholder: "ex. FROID EXPRESS CLIM, ETS PLOMBERIE BÉNIN...",
      proforma: "Réf. du proforma reçu",
      proformaPlaceholder: "ex. PROFORMA-2026-042",
      supplierPhone: "Téléphone du prestataire",
      supplierEmail: "Email de contact",
      withPurchaseOrder:
        "Émettre un bon de commande (BC) numéroté pour ce prestataire",
      designation: "Désignation de la prestation ou de l'achat *",
      designationPlaceholder:
        "ex. révision et installation des 4 climatiseurs du showroom et de l'atelier",
      description: "Détail des travaux ou des pièces",
      descriptionPlaceholder:
        "Détail des prestations, conditions particulières, garantie...",
      amountHt: "Montant HT (FCFA)",
      amountHtPlaceholder: "ex. 150000",
      tax: "TVA (FCFA)",
      taxPlaceholder: "ex. 0",
      amountTtc: "Montant total TTC (FCFA) *",
      amountTtcPlaceholder: "ex. 150000",
      initialStatus: "Statut de départ",
      statusPendingOption: "À payer (facture ou prestation en attente)",
      statusPaidOption: "Déjà payé (règlement effectué)",
      dueDate: "Date limite de paiement",
      create: "Enregistrer la dépense",
      creating: "Enregistrement...",
    },
    payModal: {
      title: "Enregistrer le règlement",
      expenseLabel: "Dépense",
      amountLabel: "Montant",
      methodLabel: "Mode de règlement *",
      dateLabel: "Date du règlement *",
      referenceLabel: "Référence du justificatif, n° de chèque ou transaction",
      referencePlaceholder: "ex. VIR-BOA-89412, CHQ n° 045928...",
      validate: "Valider le paiement",
      validating: "Validation...",
    },
    purchaseOrder: {
      preview: "Aperçu avant impression",
      print: "Imprimer le bon de commande",
      tagline: "Showroom automobile et atelier SAV",
      address: "Cotonou, République du Bénin | Tél. : (+229) 01 00 00 00",
      title: "BON DE COMMANDE",
      dateLabel: "Date",
      recipient: "Destinataire / prestataire",
      references: "Références du dossier",
      proformaRef: "Réf. devis proforma",
      internalRef: "Réf. interne",
      dueDate: "Échéance convenue",
      designationColumn: "Désignation de la prestation ou de la fourniture",
      amountHtColumn: "Montant HT",
      taxColumn: "TVA",
      amountTtcColumn: "Total TTC",
      netToPay: "NET À PAYER (FCFA)",
      supplierSignature: "Pour le prestataire (bon pour accord)",
      signatureStamp: "Date, cachet et signature",
      companySignature: "Pour la direction CARZONE SARL / comptabilité",
      authorizedSignature: "Visa et signature autorisée",
    },
    alerts: {
      errCreate: "La dépense n'a pas pu être créée.",
      errPayment: "Le règlement n'a pas été enregistré.",
      errDelete: "La suppression a échoué.",
      confirmDelete: (name) => `Supprimer la dépense « ${name} » ?`,
    },
  },
};

const en: AdminCopy = {
  dateLocale: "en-GB",
  common: {
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    loading: "One moment...",
    actions: "Actions",
    status: "Status",
  },
  hr: {
    title: "Human resources (HR)",
    subtitle:
      "People, contracts, leave, balances and the company reference data.",
    actions: {
      newEmployee: "Add an employee",
      newLeave: "Request leave",
      seedBase: "Load Benin / OHADA standards",
    },
    kpi: {
      headcount: "Headcount",
      headcountValue: (count) => (count > 1 ? `${count} employees` : `${count} employee`),
      active: "Active employees",
      activeValue: (active, onLeave) => `${active} on the job, ${onLeave} on leave`,
      pending: "Leave awaiting approval",
      pendingValue: (count) => (count > 1 ? `${count} requests` : `${count} request`),
      departments: "Departments",
      departmentsValue: (count) => (count > 1 ? `${count} teams` : `${count} team`),
    },
    tabs: {
      personnel: (count) => `Staff and employees (${count})`,
      leaves: "Leave and absence",
      payroll: "Payroll and salaries (accounting)",
      config: "Setup and reference data",
    },
    personnel: {
      searchPlaceholder: "A name, staff ID, job title, phone...",
      allDepartments: "All departments",
      allContracts: "All contract types",
      allStatuses: "All statuses",
      table: {
        employeeNumber: "Staff ID",
        employee: "Employee",
        jobTitle: "Job title",
        department: "Department",
        contract: "Contract",
        contact: "Contact",
      },
      empty: "No employee matches these filters.",
      unassigned: "Unassigned",
      account: "Account",
      viewTitle: "Open the file",
      editTitle: "Edit",
      deleteTitle: "Delete",
    },
    contracts: {
      CDI: { short: "CDI", long: "Permanent contract (CDI)" },
      CDD: { short: "CDD", long: "Fixed-term contract (CDD)" },
      STAGE: { short: "Internship", long: "Professional internship" },
      PRESTATION: { short: "Service", long: "Service contract / consultant" },
      ESSAI: { short: "Probation", long: "Probation period" },
    },
    employeeStatus: {
      ACTIF: "Active",
      CONGE: "On leave",
      SUSPENDU: "Suspended",
      QUITTE: "Left",
    },
    leaveStatus: {
      EN_ATTENTE: "Pending",
      APPROUVE: "Approved",
      REFUSE: "Rejected",
      ANNULE: "Cancelled",
    },
    leaves: {
      requestsTitle: "Leave requests and time off",
      table: {
        employee: "Employee",
        leaveType: "Leave type",
        period: "Dates",
        duration: "Days",
        reason: "Reason",
      },
      empty: "No request yet.",
      period: (from, to) => `From ${from} to ${to}`,
      days: (count) => (count > 1 ? `${count} days` : `${count} day`),
      rejectionReason: (reason) => `Rejection reason: ${reason}`,
      approve: "Approve",
      approveTitle: "Approve this request",
      reject: "Reject",
      rejectTitle: "Reject this request",
      cancelLeave: "Cancel the leave",
      confirmCancelLeave:
        "Cancel this approved leave? The days go back to the balance.",
      balancesTitle: (year) =>
        `Annual leave balances ${year} · Benin standard (24 working days a year)`,
      balanceTable: {
        employeeNumber: "Staff ID",
        employee: "Employee",
        department: "Department",
        allocated: "Yearly quota",
        used: "Days taken",
        remaining: "Days left",
      },
    },
    config: {
      departmentsTitle: "Departments and teams",
      addDepartment: "Add a department",
      employeesAttached: (count) =>
        count > 1 ? `${count} employees attached` : `${count} employee attached`,
      confirmDeleteDepartment: (name) => `Delete the ${name} department?`,
      leaveTypesTitle: "Leave types and pay",
      addLeaveType: "Add a type",
      paid: "Paid",
      unpaid: "Unpaid",
      quotaLabel: "Quota",
      daysPerYear: (days) => (days > 1 ? `${days} days/year` : `${days} day/year`),
      confirmDeleteLeaveType: (name) => `Delete the ${name} leave type?`,
    },
    employeeModal: {
      titleNew: "New employee",
      titleEdit: (employeeNumber) => `Edit employee ${employeeNumber}`,
      firstName: "First name *",
      lastName: "Last name *",
      employeeNumber: "Staff ID (leave blank and we generate it)",
      employeeNumberPlaceholder: "e.g. EMP-2026-001",
      jobTitle: "Job title *",
      jobTitlePlaceholder: "e.g. Senior sales adviser",
      department: "Department",
      selectDepartment: "Pick a department",
      contractType: "Contract type",
      hireDate: "Hire date *",
      contractEnd: "End date (fixed-term or internship)",
      baseSalary: "Monthly base salary (FCFA)",
      salaryPlaceholder: "e.g. 250000",
      status: "Status",
      phone: "Phone",
      phonePlaceholder: "e.g. +229 97 00 00 00",
      email: "Work or personal email",
      emailPlaceholder: "e.g. first.last@topcarzone.com",
      cnss: "CNSS number (Benin)",
      cnssPlaceholder: "e.g. 123456789",
      ifu: "Tax ID (IFU)",
      ifuPlaceholder: "e.g. 3202300000000",
      bank: "Bank",
      bankPlaceholder: "e.g. BOA, Ecobank, UBA...",
      bankAccount: "Bank account / IBAN",
      bankAccountPlaceholder: "e.g. 01001 00000000000 00",
      emergency: "Emergency contact (name and phone)",
      emergencyPlaceholder: "e.g. spouse, +229 95 00 00 00",
      userAccount: "Linked system account",
      noUserAccount: "No linked account",
      create: "Create employee",
      update: "Save changes",
      saving: "Saving...",
    },
    detail: {
      contractCard: "Contract and pay",
      contractTypeLabel: "Contract type",
      statusLabel: "Status",
      hireLabel: "Hired",
      endLabel: "Contract ends",
      salaryLabel: "Monthly salary",
      complianceCard: "Social compliance and bank details",
      cnssLabel: "CNSS no.",
      ifuLabel: "IFU no.",
      bankLabel: "Bank",
      accountLabel: "Account no.",
      missing: "Not provided",
      contactCard: "Contact and emergency",
      phoneLabel: "Phone",
      emailLabel: "Email",
      emergencyLabel: "Emergency",
      leavesTitle: (year) => `Leave balances (${year})`,
      leaveLine: (code) => `${code} leave`,
      taken: "Taken",
      allocated: "Granted",
      remaining: "Left",
      emptyBalances: "No balance set up yet. Start from the Setup tab.",
      editFile: "Edit the file",
      daysShort: (days) => `${days} d`,
    },
    leaveModal: {
      title: "Leave request",
      employeeLabel: "Employee *",
      noEmployee: "No employee yet. Add one from the Staff tab.",
      selectEmployee: "Pick an employee",
      typeLabel: "Leave type *",
      noLeaveType: "The reference list has no leave type yet.",
      loadLegal: "Load the legal types (Benin 24 days, sick, maternity...)",
      selectType: "Pick a type",
      typeOption: (name, paid, days) => `${name} (${paid}) · up to ${days} d`,
      startDate: "Start date *",
      endDate: "End date *",
      daysCount: "Working days *",
      reason: "Reason or note",
      reasonPlaceholder: "e.g. annual leave, family event, medical appointment...",
      submit: "Send the request",
      submitting: "Sending...",
    },
    rejectModal: {
      title: "Reject the request",
      hint: "Give a reason. The employee sees it and it stays on file.",
      placeholder: "e.g. busy week at the workshop, medical note missing...",
      confirm: "Confirm rejection",
    },
    deptModal: {
      titleNew: "New department",
      titleEdit: "Edit department",
      name: "Department name *",
      namePlaceholder: "e.g. Logistics and stores",
      code: "Code (3 letters) *",
      codePlaceholder: "e.g. LOG",
      description: "Description or role",
    },
    leaveTypeModal: {
      titleNew: "New leave type",
      titleEdit: "Edit leave type",
      name: "Leave type name *",
      namePlaceholder: "e.g. Paid annual leave",
      code: "Unique code *",
      codePlaceholder: "e.g. ANNUAL",
      days: "Days allowed per year *",
      paid: "Keep the salary",
      paidYes: "Yes, paid",
      paidNo: "No, unpaid",
    },
    alerts: {
      errSaveEmployee: "Couldn't save this employee.",
      errSave: "The save didn't go through.",
      errDelete: "The delete didn't go through.",
      selectEmployeeAndType: "Pick an employee and a leave type.",
      errLeaveCreate: "The request couldn't be created.",
      errLeaveApprove: "The approval didn't go through.",
      errLeaveReject: "The rejection wasn't recorded.",
      confirmDeleteEmployee: (name) => `Delete ${name}'s file for good?`,
      confirmSeed:
        "Load the standard HR reference data (departments and leave types based on the Beninese Labour Code and OHADA rules)?",
      seedDone: "All set. Reloading the page.",
      errSeed: "The setup didn't go through.",
    },
  },
  payroll: {
    months: [
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
    methods: {
      VIREMENT_ECOBANK: "Ecobank transfer",
      VIREMENT_BOA: "BOA transfer",
      VIREMENT: "Bank transfer",
      CHEQUE: "Cheque",
      ESPECES: "Cash (till)",
      MOBILE_MONEY: "Mobile Money (Moov / MTN)",
    },
    periodLabel: "Period",
    bulkButton: (month, year) => `Pay all salaries (${month} ${year})`,
    kpi: {
      payrollLabel: "Monthly payroll",
      payrollHint: (count) =>
        count > 1 ? `${count} employees on the job` : `${count} employee on the job`,
      paidLabel: "Salaries paid this month",
      paidHint: (paid, total, percent) =>
        `${paid} of ${total} employees paid (${percent}%)`,
      remainingLabel: (month) => `Still to pay (${month})`,
      allClear: "Everything is up to date.",
      awaitingTransfer: "Waiting for the transfer",
    },
    registerTitle: (month, year) => `Payroll ledger and transfers · ${month} ${year}`,
    registerHint: "Review and approve pay for accounting and management",
    searchPlaceholder: "Employee or staff ID...",
    filterAll: "All statuses",
    filterPaid: "Paid only",
    filterPending: "Not paid yet",
    table: {
      employee: "Employee",
      jobAndDepartment: "Job and team",
      bankAccount: "Bank account",
      baseSalary: "Base salary (FCFA)",
      payStatus: "Payment",
      settlement: "Payment and ref.",
    },
    empty: "No employee matches.",
    noDepartment: "General",
    noAccount: "No account no.",
    cashDesk: "Cash / till",
    paidBadge: "Paid",
    pendingBadge: "Pending",
    referencePrefix: "Ref.",
    receiptButton: "Payslip",
    viewPayslipTitle: "Open the payslip",
    cancelPayment: "Cancel",
    cancelPaymentTitle: "Undo this payment",
    payButton: "Pay",
    payModal: {
      title: "Pay the salary",
      periodLabel: "Pay period",
      accountLine: (bank, account) => `Account ${bank} · ${account}`,
      amountLabel: "Amount to pay (FCFA) *",
      methodLabel: "Payment method *",
      referenceLabel: "Bank reference, transaction or cheque no.",
      referencePlaceholder: "e.g. VIR-2026-OCT-042 or cheque no.",
      notesLabel: "Accounting notes",
      notesPlaceholder: "e.g. bonus included, advance deducted...",
      validate: "Confirm the payment",
      validating: "Saving...",
    },
    bulkModal: {
      title: "Pay all salaries at once",
      intro:
        "This records the salary payment for every active employee for",
      total: (amount) => `(Estimated total: ${amount}).`,
      methodLabel: "Payment method for the batch *",
      referenceLabel: "Reference for the whole transfer",
      confirm: "Confirm the batch transfer",
      running: "Running...",
    },
    receipt: {
      title: "Salary payment receipt",
      employeeLabel: "Employee",
      staffIdLabel: "Staff ID",
      jobLabel: "Job title",
      periodLabel: "Period",
      paymentDateLabel: "Payment date",
      methodLabel: "Method",
      gross: "Gross base salary",
      referenceLabel: "Transfer or cheque reference",
      net: "Net paid",
      print: "Print the receipt",
    },
    alerts: {
      errSave: "The payment couldn't be recorded.",
      errCancel: "The cancellation didn't go through.",
      errBulk: "The batch payment didn't go through.",
    },
  },
  team: {
    title: "Accounts and roles",
    subtitle:
      "Who can reach what, live: create an account, give it a role, then tick its capabilities screen by screen.",
    newUser: "New user",
    kpi: {
      total: "Total users",
      active: "Active accounts",
      roles: "Distinct roles",
      customized: "Custom profiles",
    },
    searchPlaceholder: "A name, an email, a role...",
    roleLabel: "Role",
    allRoles: "All roles",
    statusLabel: "Status",
    allStatuses: "All statuses",
    activeAccounts: "Active accounts",
    inactiveAccounts: "Inactive accounts",
    results: (count) => (count > 1 ? `${count} results` : `${count} result`),
    table: {
      userAndEmail: "User and email",
      role: "Assigned role",
      capabilities: "Capabilities and permissions",
      password: "🔑 Password (DG / admin access)",
    },
    you: "(you)",
    capabilitiesCount: (count, total) => `${count} of ${total} capabilities`,
    customized: "Custom",
    roleDefault: "Role defaults",
    bcryptTitle:
      "Password hashed one way with Bcrypt (maximum security)",
    changePassword: "Change",
    changePasswordTitle: "Set or reset this account's password",
    modifiedOn: (date) => `Changed on ${date}`,
    active: "Active",
    inactive: "Inactive",
    toggleSelfTitle: "You can't deactivate your own account",
    toggleOffTitle: "Click to deactivate",
    toggleOnTitle: "Click to activate",
    manageButton: "Capabilities and role",
    deleteTitle: "Delete this account for good",
    empty: "No user matches this search.",
    addModal: {
      title: "Create a user and set their rights",
      subtitle: "Fill in the credentials, then tick the features they may use.",
      fullName: "Full name *",
      fullNamePlaceholder: "e.g. Jean Dupont",
      email: "Email address *",
      emailPlaceholder: "jean.dupont@company.com",
      role: "Base role *",
      password: "Initial password",
      gridTitle: "Capabilities and permissions grid",
      checkedCount: (count, total) => `${count} of ${total} ticked`,
      resetToRole: (role) => `Back to the role defaults (${role})`,
      create: "Create user",
      creating: "Creating...",
    },
    editModal: {
      title: (name) => `Capabilities and role for ${name}`,
      subtitle:
        "You see here, live, what this account can do on each screen.",
      fullName: "Full name",
      email: "Email address (login)",
      role: "Reference role",
      gridTitle: "Rights and capabilities (tick what this account may do)",
      allowedCount: (count, total) => `${count} of ${total} capabilities allowed`,
      resetToRole: (role) => `Back to the ${role} defaults`,
      noteTitle: "Changes apply as soon as you save.",
      save: "Save capabilities",
      saving: "Saving...",
      confirmResetRole: (role) =>
        `Also reset the capabilities to the ${role} role defaults?`,
    },
    passwordModal: {
      title: "Change the password",
      forUser: (name, email) => `For ${name} (${email})`,
      newPassword: "New password",
      placeholder: "Type the new password...",
      tooShort: "The password needs at least 4 characters.",
      hint: "The password is saved right away. Management can read it in plain text and a notification goes out.",
      success: (name) => `${name}'s password is updated. The notification is on its way.`,
      errUpdate: "The password couldn't be updated.",
      validate: "Confirm the password",
      validating: "Updating...",
    },
    capabilitiesTable: {
      feature: "Feature",
      capabilities: "Capabilities",
      checkAll: "Tick all",
      uncheckAll: "Clear all",
    },
    alerts: {
      missingFields: "The full name or the email address is missing.",
      errCreate: "The account couldn't be created.",
      errEdit: "The account couldn't be updated.",
      errStatus: "The status couldn't be changed.",
      errDelete: "The delete didn't go through.",
      confirmDelete: (name) => `Delete the account ${name} for good?`,
    },
  },
  expenses: {
    title: "Costs, expenses and suppliers",
    subtitle:
      "Purchase orders (PO), subcontractor proformas (aircon, workshop), fixed charges (SBEE, SONEB) and the books.",
    printRegister: "Print the register",
    newExpense: "New purchase order or expense",
    kpi: {
      total: (count) => `Total expenses logged (${count})`,
      totalHint: "All operating costs combined",
      paid: "Costs paid",
      paidHint: "Invoices and payments settled",
      pending: "Waiting to be paid",
      pendingHint: "Payment commitments still open",
      providers: "Subcontracting and suppliers",
      providersHint: "Air conditioning, plumbing, workshop",
      payroll: (year) => `Payroll paid out (${year})`,
      payrollHint: "Salaries paid to employees",
    },
    searchPlaceholder: "Supplier, description, PO no., proforma...",
    allCategories: "All categories",
    allStatuses: "All statuses",
    statusPendingOption: "To pay (pending)",
    statusPaidOption: "Paid",
    totalShown: "Total shown",
    lines: (count) => (count > 1 ? `${count} lines` : `${count} line`),
    table: {
      reference: "Ref. and purchase order",
      dateAndCategory: "Date and category",
      designation: "Description / service",
      supplier: "Supplier",
      amountTtc: "Amount incl. tax",
      paymentStatus: "Payment status",
    },
    empty: "No expense or service matches these filters.",
    categories: {
      PRESTATAIRE_SERVICE: "Contractors and outside services",
      ELECTRICITE_SBEE: "Electricity (SBEE)",
      EAU_SONEB: "Water (SONEB)",
      INTERNET_TELECOM: "Internet and telecoms",
      LOYER: "Rent and service charges",
      CARBURANT: "Fuel and travel",
      FOURNITURES_BUREAU: "Office supplies",
      OUTILLAGE_ATELIER: "Workshop tools and parts",
      AUTRE_CHARGE: "Other operating costs",
    },
    proforma: (reference) => `Proforma: ${reference}`,
    phone: (phone) => `Phone: ${phone}`,
    ht: (amount) => `Excl. tax: ${amount}`,
    paidBadge: "Paid",
    paidOn: (date, method) => `On ${date} (${method})`,
    pendingBadge: "To pay",
    dueDate: (date) => `Due: ${date}`,
    defaultMethod: "Transfer",
    viewPurchaseOrderTitle: "View or print the purchase order (PO)",
    purchaseOrderShort: "PO",
    payButton: "Pay",
    deleteTitle: "Delete",
    createModal: {
      title: "New purchase order or expense",
      subtitle:
        "A subcontractor job, a charge that comes back every month or an operating purchase.",
      category: "Cost category *",
      serviceDate: "Service date *",
      supplierSection: "Supplier and proforma quote",
      supplierName: "Supplier or company name *",
      supplierNamePlaceholder: "e.g. FROID EXPRESS CLIM, ETS PLOMBERIE BENIN...",
      proforma: "Proforma ref. received",
      proformaPlaceholder: "e.g. PROFORMA-2026-042",
      supplierPhone: "Supplier phone",
      supplierEmail: "Contact email",
      withPurchaseOrder: "Issue a numbered purchase order (PO) for this supplier",
      designation: "What was bought or done *",
      designationPlaceholder:
        "e.g. service and install the 4 air conditioners in the showroom and workshop",
      description: "Details of the work or parts",
      descriptionPlaceholder:
        "Service details, special conditions, warranty...",
      amountHt: "Amount excl. tax (FCFA)",
      amountHtPlaceholder: "e.g. 150000",
      tax: "VAT (FCFA)",
      taxPlaceholder: "e.g. 0",
      amountTtc: "Total incl. tax (FCFA) *",
      amountTtcPlaceholder: "e.g. 150000",
      initialStatus: "Starting status",
      statusPendingOption: "To pay (invoice or service still pending)",
      statusPaidOption: "Already paid",
      dueDate: "Payment due date",
      create: "Save the expense",
      creating: "Saving...",
    },
    payModal: {
      title: "Record the payment",
      expenseLabel: "Expense",
      amountLabel: "Amount",
      methodLabel: "Payment method *",
      dateLabel: "Payment date *",
      referenceLabel: "Proof reference, cheque no. or transaction",
      referencePlaceholder: "e.g. VIR-BOA-89412, CHQ no. 045928...",
      validate: "Confirm the payment",
      validating: "Saving...",
    },
    purchaseOrder: {
      preview: "Preview before printing",
      print: "Print the purchase order",
      tagline: "Car showroom and after-sales workshop",
      address: "Cotonou, Republic of Benin | Phone: (+229) 01 00 00 00",
      title: "PURCHASE ORDER",
      dateLabel: "Date",
      recipient: "Recipient / supplier",
      references: "File references",
      proformaRef: "Proforma quote ref.",
      internalRef: "Internal ref.",
      dueDate: "Agreed due date",
      designationColumn: "Description of the service or supply",
      amountHtColumn: "Amount excl. tax",
      taxColumn: "VAT",
      amountTtcColumn: "Total incl. tax",
      netToPay: "NET TO PAY (FCFA)",
      supplierSignature: "For the supplier (approved)",
      signatureStamp: "Date, stamp and signature",
      companySignature: "For CARZONE SARL management / accounting",
      authorizedSignature: "Authorised visa and signature",
    },
    alerts: {
      errCreate: "The expense couldn't be created.",
      errPayment: "The payment wasn't recorded.",
      errDelete: "The delete didn't go through.",
      confirmDelete: (name) => `Delete the expense "${name}"?`,
    },
  },
};

const zh: AdminCopy = {
  dateLocale: "zh-CN",
  common: {
    cancel: "取消",
    close: "关闭",
    save: "保存",
    loading: "请稍候…",
    actions: "操作",
    status: "状态",
  },
  hr: {
    title: "人力资源（HR）",
    subtitle: "人员、合同、休假、余额和公司基础数据，都在这里。",
    actions: {
      newEmployee: "新增员工",
      newLeave: "申请休假",
      seedBase: "载入贝宁 / OHADA 标准",
    },
    kpi: {
      headcount: "在册人数",
      headcountValue: (count) => `${count} 名员工`,
      active: "在职员工",
      activeValue: (active, onLeave) => `在岗 ${active} 人，休假 ${onLeave} 人`,
      pending: "待批休假",
      pendingValue: (count) => `${count} 份申请`,
      departments: "部门",
      departmentsValue: (count) => `${count} 个部门`,
    },
    tabs: {
      personnel: (count) => `员工与人员（${count}）`,
      leaves: "休假与缺勤",
      payroll: "工资与薪酬（财务）",
      config: "配置与基础数据",
    },
    personnel: {
      searchPlaceholder: "按姓名、工号、岗位或电话搜索",
      allDepartments: "全部部门",
      allContracts: "全部合同类型",
      allStatuses: "全部状态",
      table: {
        employeeNumber: "工号",
        employee: "员工",
        jobTitle: "岗位",
        department: "部门",
        contract: "合同",
        contact: "联系方式",
      },
      empty: "没有符合这些条件的员工。",
      unassigned: "未分配",
      account: "账号",
      viewTitle: "查看档案",
      editTitle: "编辑",
      deleteTitle: "删除",
    },
    contracts: {
      CDI: { short: "CDI", long: "无固定期限合同（CDI）" },
      CDD: { short: "CDD", long: "固定期限合同（CDD）" },
      STAGE: { short: "实习", long: "专业实习" },
      PRESTATION: { short: "服务", long: "服务合同 / 顾问" },
      ESSAI: { short: "试用", long: "试用期" },
    },
    employeeStatus: {
      ACTIF: "在职",
      CONGE: "休假中",
      SUSPENDU: "停职",
      QUITTE: "已离职",
    },
    leaveStatus: {
      EN_ATTENTE: "待审批",
      APPROUVE: "已批准",
      REFUSE: "已拒绝",
      ANNULE: "已取消",
    },
    leaves: {
      requestsTitle: "休假申请与缺勤审批",
      table: {
        employee: "员工",
        leaveType: "假别",
        period: "期间",
        duration: "天数",
        reason: "事由",
      },
      empty: "还没有申请。",
      period: (from, to) => `${from} 至 ${to}`,
      days: (count) => `${count} 天`,
      rejectionReason: (reason) => `拒绝原因：${reason}`,
      approve: "批准",
      approveTitle: "批准这份申请",
      reject: "拒绝",
      rejectTitle: "拒绝这份申请",
      cancelLeave: "取消休假",
      confirmCancelLeave: "取消这份已批准的休假？天数会退回余额。",
      balancesTitle: (year) => `${year} 年年假余额 · 贝宁标准（每年 24 个工作日）`,
      balanceTable: {
        employeeNumber: "工号",
        employee: "员工",
        department: "部门",
        allocated: "年度额度",
        used: "已用天数",
        remaining: "剩余天数",
      },
    },
    config: {
      departmentsTitle: "部门与服务",
      addDepartment: "新增部门",
      employeesAttached: (count) => `${count} 名员工`,
      confirmDeleteDepartment: (name) => `删除部门 ${name}？`,
      leaveTypesTitle: "假别与带薪设置",
      addLeaveType: "新增假别",
      paid: "带薪",
      unpaid: "不带薪",
      quotaLabel: "额度",
      daysPerYear: (days) => `每年 ${days} 天`,
      confirmDeleteLeaveType: (name) => `删除假别 ${name}？`,
    },
    employeeModal: {
      titleNew: "新增员工",
      titleEdit: (employeeNumber) => `编辑员工 ${employeeNumber}`,
      firstName: "名 *",
      lastName: "姓 *",
      employeeNumber: "工号（留空自动生成）",
      employeeNumberPlaceholder: "例如 EMP-2026-001",
      jobTitle: "岗位名称 *",
      jobTitlePlaceholder: "例如 高级销售顾问",
      department: "部门",
      selectDepartment: "选择部门",
      contractType: "合同类型",
      hireDate: "入职日期 *",
      contractEnd: "结束日期（固定期限或实习）",
      baseSalary: "月基本工资（FCFA）",
      salaryPlaceholder: "例如 250000",
      status: "状态",
      phone: "电话",
      phonePlaceholder: "例如 +229 97 00 00 00",
      email: "工作或个人邮箱",
      emailPlaceholder: "例如 first.last@topcarzone.com",
      cnss: "CNSS 编号（贝宁）",
      cnssPlaceholder: "例如 123456789",
      ifu: "IFU 税号",
      ifuPlaceholder: "例如 3202300000000",
      bank: "银行",
      bankPlaceholder: "例如 BOA、Ecobank、UBA…",
      bankAccount: "银行账号",
      bankAccountPlaceholder: "例如 01001 00000000000 00",
      emergency: "紧急联系人（姓名与电话）",
      emergencyPlaceholder: "例如 配偶，+229 95 00 00 00",
      userAccount: "关联系统账号",
      noUserAccount: "不关联账号",
      create: "创建员工",
      update: "保存修改",
      saving: "正在保存…",
    },
    detail: {
      contractCard: "合同与薪酬",
      contractTypeLabel: "合同类型",
      statusLabel: "状态",
      hireLabel: "入职",
      endLabel: "合同结束",
      salaryLabel: "月薪",
      complianceCard: "社保与银行信息",
      cnssLabel: "CNSS 编号",
      ifuLabel: "IFU 编号",
      bankLabel: "银行",
      accountLabel: "账号",
      missing: "未填写",
      contactCard: "联系方式与紧急联系人",
      phoneLabel: "电话",
      emailLabel: "邮箱",
      emergencyLabel: "紧急联系人",
      leavesTitle: (year) => `休假余额（${year}）`,
      leaveLine: (code) => `${code} 假`,
      taken: "已用",
      allocated: "额度",
      remaining: "剩余",
      emptyBalances: "还没有余额记录。请到配置页初始化。",
      editFile: "编辑档案",
      daysShort: (days) => `${days} 天`,
    },
    leaveModal: {
      title: "请假申请",
      employeeLabel: "员工 *",
      noEmployee: "还没有员工。请先在人员页添加。",
      selectEmployee: "选择员工",
      typeLabel: "假别 *",
      noLeaveType: "基础数据里还没有假别。",
      loadLegal: "载入法定假别（贝宁 24 天、病假、产假…）",
      selectType: "选择假别",
      typeOption: (name, paid, days) => `${name}（${paid}）· 最多 ${days} 天`,
      startDate: "开始日期 *",
      endDate: "结束日期 *",
      daysCount: "工作日天数 *",
      reason: "事由或说明",
      reasonPlaceholder: "例如 年假、家事、就医…",
      submit: "提交申请",
      submitting: "正在提交…",
    },
    rejectModal: {
      title: "拒绝申请",
      hint: "请填写原因。员工会看到，并且会存档。",
      placeholder: "例如 车间太忙、缺少病假证明…",
      confirm: "确认拒绝",
    },
    deptModal: {
      titleNew: "新增部门",
      titleEdit: "编辑部门",
      name: "部门名称 *",
      namePlaceholder: "例如 物流与仓储",
      code: "代码（3 个字母）*",
      codePlaceholder: "例如 LOG",
      description: "说明或职责",
    },
    leaveTypeModal: {
      titleNew: "新增假别",
      titleEdit: "编辑假别",
      name: "假别名称 *",
      namePlaceholder: "例如 年假（带薪）",
      code: "唯一代码 *",
      codePlaceholder: "例如 ANNUEL",
      days: "每年允许天数 *",
      paid: "是否带薪",
      paidYes: "是，带薪",
      paidNo: "否，不带薪",
    },
    alerts: {
      errSaveEmployee: "保存员工失败。",
      errSave: "保存失败。",
      errDelete: "删除失败。",
      selectEmployeeAndType: "请选择员工和假别。",
      errLeaveCreate: "申请创建失败。",
      errLeaveApprove: "批准失败。",
      errLeaveReject: "拒绝未记录。",
      confirmDeleteEmployee: (name) => `确定永久删除 ${name} 的档案？`,
      confirmSeed:
        "载入标准人力资源基础数据（依据贝宁劳动法和 OHADA 规范的部门与假别）？",
      seedDone: "已载入，页面正在刷新。",
      errSeed: "初始化失败。",
    },
  },
  payroll: {
    months: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
    methods: {
      VIREMENT_ECOBANK: "Ecobank 转账",
      VIREMENT_BOA: "BOA 转账",
      VIREMENT: "银行转账",
      CHEQUE: "支票",
      ESPECES: "现金（出纳）",
      MOBILE_MONEY: "移动支付（Moov / MTN）",
    },
    periodLabel: "期间",
    bulkButton: (month, year) => `发放全部工资（${month} ${year}）`,
    kpi: {
      payrollLabel: "月度工资总额",
      payrollHint: (count) => `${count} 名在职员工`,
      paidLabel: "本月已发工资",
      paidHint: (paid, total, percent) =>
        `${total} 人中已发 ${paid} 人（${percent}%）`,
      remainingLabel: (month) => `待发工资（${month}）`,
      allClear: "全部已结清。",
      awaitingTransfer: "等待转账",
    },
    registerTitle: (month, year) => `工资台账与转账 · ${month} ${year}`,
    registerHint: "供财务和管理层查看、确认薪酬",
    searchPlaceholder: "员工或工号…",
    filterAll: "全部状态",
    filterPaid: "只看已发",
    filterPending: "待发放",
    table: {
      employee: "员工",
      jobAndDepartment: "岗位与部门",
      bankAccount: "银行账户",
      baseSalary: "基本工资（FCFA）",
      payStatus: "发放",
      settlement: "结算与凭证",
    },
    empty: "没有符合条件的员工。",
    noDepartment: "综合",
    noAccount: "缺账号",
    cashDesk: "现金 / 出纳",
    paidBadge: "已发",
    pendingBadge: "待发",
    referencePrefix: "凭证",
    receiptButton: "工资单",
    viewPayslipTitle: "查看工资单",
    cancelPayment: "取消",
    cancelPaymentTitle: "撤销这笔付款",
    payButton: "发放",
    payModal: {
      title: "发放工资",
      periodLabel: "薪酬期间",
      accountLine: (bank, account) => `账户 ${bank} · ${account}`,
      amountLabel: "支付金额（FCFA）*",
      methodLabel: "支付方式 *",
      referenceLabel: "银行凭证、交易号或支票号",
      referencePlaceholder: "例如 VIR-2026-OCT-042 或支票号",
      notesLabel: "财务备注",
      notesPlaceholder: "例如 含奖金、已扣预支…",
      validate: "确认付款",
      validating: "正在确认…",
    },
    bulkModal: {
      title: "批量发放工资",
      intro: "此操作会为全部在职员工登记以下月份的工资发放：",
      total: (amount) => `（预计合计：${amount}）。`,
      methodLabel: "批量支付方式 *",
      referenceLabel: "整批转账凭证号",
      confirm: "确认批量转账",
      running: "正在执行…",
    },
    receipt: {
      title: "工资发放收据",
      employeeLabel: "员工",
      staffIdLabel: "工号",
      jobLabel: "岗位",
      periodLabel: "期间",
      paymentDateLabel: "结算日期",
      methodLabel: "方式",
      gross: "基本工资（税前）",
      referenceLabel: "转账或支票凭证",
      net: "实发金额",
      print: "打印收据",
    },
    alerts: {
      errSave: "工资记录未保存。",
      errCancel: "取消失败。",
      errBulk: "批量发放失败。",
    },
  },
  team: {
    title: "账号与角色",
    subtitle: "谁能进哪里，一眼看清。建账号、定角色，再逐个勾选权限。",
    newUser: "新增用户",
    kpi: {
      total: "用户总数",
      active: "启用账号",
      roles: "角色数量",
      customized: "自定义权限",
    },
    searchPlaceholder: "按姓名、邮箱或角色搜索",
    roleLabel: "角色",
    allRoles: "全部角色",
    statusLabel: "状态",
    allStatuses: "全部状态",
    activeAccounts: "启用账号",
    inactiveAccounts: "停用账号",
    results: (count) => `${count} 条结果`,
    table: {
      userAndEmail: "用户与邮箱",
      role: "所属角色",
      capabilities: "权限与功能",
      password: "🔑 密码（总经理 / 管理员）",
    },
    you: "（你）",
    capabilitiesCount: (count, total) => `${count} / ${total} 项权限`,
    customized: "自定义",
    roleDefault: "角色默认",
    bcryptTitle: "密码用 Bcrypt 单向加密（最高安全等级）",
    changePassword: "修改",
    changePasswordTitle: "设置或重置这个账号的密码",
    modifiedOn: (date) => `修改于 ${date}`,
    active: "启用",
    inactive: "停用",
    toggleSelfTitle: "不能停用自己的账号",
    toggleOffTitle: "点击停用",
    toggleOnTitle: "点击启用",
    manageButton: "权限与角色",
    deleteTitle: "永久删除这个账号",
    empty: "没有符合搜索条件的用户。",
    addModal: {
      title: "新建用户并设置权限",
      subtitle: "先填登录信息，再勾选允许使用的功能。",
      fullName: "姓名 *",
      fullNamePlaceholder: "例如 张伟",
      email: "邮箱 *",
      emailPlaceholder: "name@company.com",
      role: "基础角色 *",
      password: "初始密码",
      gridTitle: "权限设置表",
      checkedCount: (count, total) => `已勾选 ${count} / ${total}`,
      resetToRole: (role) => `恢复该角色默认（${role}）`,
      create: "创建用户",
      creating: "正在创建…",
    },
    editModal: {
      title: (name) => `${name} 的权限与角色`,
      subtitle: "这里实时显示这个账号在每个界面能做什么。",
      fullName: "姓名",
      email: "邮箱（登录名）",
      role: "参考角色",
      gridTitle: "权限明细（勾选这个账号可以做的事）",
      allowedCount: (count, total) => `已允许 ${count} / ${total} 项权限`,
      resetToRole: (role) => `恢复 ${role} 角色默认`,
      noteTitle: "保存后立即生效。",
      save: "保存权限",
      saving: "正在保存…",
      confirmResetRole: (role) => `同时把权限恢复为 ${role} 角色的默认值？`,
    },
    passwordModal: {
      title: "修改密码",
      forUser: (name, email) => `${name}（${email}）`,
      newPassword: "新密码",
      placeholder: "输入新密码…",
      tooShort: "密码至少 4 位。",
      hint: "新密码立即保存，管理层可以明文查看，同时会发一条通知。",
      success: (name) => `${name} 的密码已更新，通知已发出。`,
      errUpdate: "密码更新失败。",
      validate: "确认新密码",
      validating: "正在更新…",
    },
    capabilitiesTable: {
      feature: "功能",
      capabilities: "权限",
      checkAll: "全选",
      uncheckAll: "全不选",
    },
    alerts: {
      missingFields: "姓名或邮箱还没填。",
      errCreate: "账号创建失败。",
      errEdit: "账号修改失败。",
      errStatus: "状态修改失败。",
      errDelete: "删除失败。",
      confirmDelete: (name) => `确定永久删除账号 ${name}？`,
    },
  },
  expenses: {
    title: "成本、支出与供应商",
    subtitle: "采购单（BC）、外包报价（空调、车间）、固定费用（SBEE、SONEB）与账务。",
    printRegister: "打印台账",
    newExpense: "新建采购单或支出",
    kpi: {
      total: (count) => `已录支出合计（${count}）`,
      totalHint: "全部经营费用",
      paid: "已付费用",
      paidHint: "凭证与付款已完成",
      pending: "待付款",
      pendingHint: "尚未结清的付款承诺",
      providers: "外包与供应商",
      providersHint: "空调、管道、售后车间",
      payroll: (year) => `已发工资总额（${year}）`,
      payrollHint: "发给员工的工资",
    },
    searchPlaceholder: "供应商、事由、采购单号、报价单…",
    allCategories: "全部类别",
    allStatuses: "全部状态",
    statusPendingOption: "待付款",
    statusPaidOption: "已付",
    totalShown: "当前合计",
    lines: (count) => `${count} 条`,
    table: {
      reference: "单号与采购单",
      dateAndCategory: "日期与类别",
      designation: "事由 / 服务",
      supplier: "供应商",
      amountTtc: "含税金额",
      paymentStatus: "付款状态",
    },
    empty: "没有符合这些条件的支出或服务。",
    categories: {
      PRESTATAIRE_SERVICE: "外包与外部服务",
      ELECTRICITE_SBEE: "电费（SBEE）",
      EAU_SONEB: "水费（SONEB）",
      INTERNET_TELECOM: "网络与通信",
      LOYER: "租金与物业费",
      CARBURANT: "油费与出行",
      FOURNITURES_BUREAU: "办公用品与耗材",
      OUTILLAGE_ATELIER: "车间工具与配件",
      AUTRE_CHARGE: "其他经营费用",
    },
    proforma: (reference) => `报价单：${reference}`,
    phone: (phone) => `电话：${phone}`,
    ht: (amount) => `不含税：${amount}`,
    paidBadge: "已付",
    paidOn: (date, method) => `${date}（${method}）`,
    pendingBadge: "待付",
    dueDate: (date) => `到期：${date}`,
    defaultMethod: "转账",
    viewPurchaseOrderTitle: "查看或打印采购单（BC）",
    purchaseOrderShort: "采购单",
    payButton: "付款",
    deleteTitle: "删除",
    createModal: {
      title: "新建采购单或支出",
      subtitle: "一笔外包服务、每月固定费用，或一次经营采购。",
      category: "费用类别 *",
      serviceDate: "服务日期 *",
      supplierSection: "供应商与报价单",
      supplierName: "供应商或公司名称 *",
      supplierNamePlaceholder: "例如 FROID EXPRESS CLIM、ETS PLOMBERIE BENIN…",
      proforma: "收到的报价单号",
      proformaPlaceholder: "例如 PROFORMA-2026-042",
      supplierPhone: "供应商电话",
      supplierEmail: "联系邮箱",
      withPurchaseOrder: "为这家供应商开一张带编号的采购单（BC）",
      designation: "采购或服务内容 *",
      designationPlaceholder: "例如 展厅与车间 4 台空调的检修与安装",
      description: "工作或配件明细",
      descriptionPlaceholder: "服务明细、特殊条款、保修…",
      amountHt: "不含税金额（FCFA）",
      amountHtPlaceholder: "例如 150000",
      tax: "增值税（FCFA）",
      taxPlaceholder: "例如 0",
      amountTtc: "含税总额（FCFA）*",
      amountTtcPlaceholder: "例如 150000",
      initialStatus: "初始状态",
      statusPendingOption: "待付款（发票或服务未到）",
      statusPaidOption: "已付款",
      dueDate: "付款截止日",
      create: "保存支出",
      creating: "正在保存…",
    },
    payModal: {
      title: "登记付款",
      expenseLabel: "支出",
      amountLabel: "金额",
      methodLabel: "支付方式 *",
      dateLabel: "付款日期 *",
      referenceLabel: "凭证号、支票号或交易号",
      referencePlaceholder: "例如 VIR-BOA-89412、支票 045928…",
      validate: "确认付款",
      validating: "正在确认…",
    },
    purchaseOrder: {
      preview: "打印前预览",
      print: "打印采购单",
      tagline: "汽车展厅与售后车间",
      address: "贝宁科托努 | 电话：(+229) 01 00 00 00",
      title: "采购单",
      dateLabel: "日期",
      recipient: "收件方 / 供应商",
      references: "档案编号",
      proformaRef: "报价单号",
      internalRef: "内部编号",
      dueDate: "约定到期日",
      designationColumn: "服务或货物名称",
      amountHtColumn: "不含税金额",
      taxColumn: "增值税",
      amountTtcColumn: "含税合计",
      netToPay: "应付净额（FCFA）",
      supplierSignature: "供应商确认（同意执行）",
      signatureStamp: "日期、盖章与签名",
      companySignature: "CARZONE SARL 管理层 / 财务",
      authorizedSignature: "授权签章与签名",
    },
    alerts: {
      errCreate: "支出创建失败。",
      errPayment: "付款未记录。",
      errDelete: "删除失败。",
      confirmDelete: (name) => `删除支出「${name}」？`,
    },
  },
};

export const adminCopy: Record<Locale, AdminCopy> = { fr, en, zh };

const EMPLOYEE_STATUS_KEYS: EmployeeStatusKey[] = [
  "ACTIF",
  "CONGE",
  "SUSPENDU",
  "QUITTE",
];

const CONTRACT_TYPE_KEYS: ContractTypeKey[] = [
  "CDI",
  "CDD",
  "STAGE",
  "PRESTATION",
  "ESSAI",
];

const LEAVE_STATUS_KEYS: LeaveStatusKey[] = [
  "EN_ATTENTE",
  "APPROUVE",
  "REFUSE",
  "ANNULE",
];

export const EXPENSE_CATEGORY_KEYS: ExpenseCategoryKey[] = [
  "PRESTATAIRE_SERVICE",
  "ELECTRICITE_SBEE",
  "EAU_SONEB",
  "INTERNET_TELECOM",
  "LOYER",
  "CARBURANT",
  "FOURNITURES_BUREAU",
  "OUTILLAGE_ATELIER",
  "AUTRE_CHARGE",
];

const PAYMENT_METHOD_KEYS: PaymentMethodKey[] = [
  "VIREMENT_ECOBANK",
  "VIREMENT_BOA",
  "VIREMENT",
  "CHEQUE",
  "ESPECES",
  "MOBILE_MONEY",
];

function isEmployeeStatus(value: string): value is EmployeeStatusKey {
  return EMPLOYEE_STATUS_KEYS.some((key) => key === value);
}

function isContractType(value: string): value is ContractTypeKey {
  return CONTRACT_TYPE_KEYS.some((key) => key === value);
}

function isLeaveStatus(value: string): value is LeaveStatusKey {
  return LEAVE_STATUS_KEYS.some((key) => key === value);
}

/** Vrai si la valeur est une catégorie de dépense connue. */
export function isExpenseCategory(value: string): value is ExpenseCategoryKey {
  return EXPENSE_CATEGORY_KEYS.some((key) => key === value);
}

function isPaymentMethod(value: string): value is PaymentMethodKey {
  return PAYMENT_METHOD_KEYS.some((key) => key === value);
}

/** Libellé court d'un contrat, sinon la valeur brute venue de la base. */
export function contractTypeLabel(copy: AdminCopy, value: string): string {
  return isContractType(value) ? copy.hr.contracts[value].short : value;
}

/** Libellé long d'un contrat, pour les listes déroulantes. */
export function contractTypeLongLabel(copy: AdminCopy, value: string): string {
  return isContractType(value) ? copy.hr.contracts[value].long : value;
}

/** Libellé traduit d'un statut de salarié, sinon la valeur brute. */
export function employeeStatusLabel(copy: AdminCopy, value: string): string {
  return isEmployeeStatus(value) ? copy.hr.employeeStatus[value] : value;
}

/** Libellé traduit d'un statut de congé, sinon la valeur brute. */
export function leaveStatusLabel(copy: AdminCopy, value: string): string {
  return isLeaveStatus(value) ? copy.hr.leaveStatus[value] : value;
}

/** Libellé traduit d'une catégorie de dépense, sinon la valeur brute. */
export function expenseCategoryLabel(copy: AdminCopy, value: string): string {
  return isExpenseCategory(value) ? copy.expenses.categories[value] : value;
}

/** Libellé traduit d'un mode de règlement, sinon la valeur brute lisible. */
export function paymentMethodLabel(copy: AdminCopy, value: string | null): string {
  if (!value) return "";
  return isPaymentMethod(value)
    ? copy.payroll.methods[value]
    : value.replaceAll("_", " ");
}
