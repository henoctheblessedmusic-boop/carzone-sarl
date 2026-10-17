import type { Role } from "@/lib/roles";

export type OnboardingStep = {
  id: string;
  label: string;
  href: string;
  hint: string;
};

export const ONBOARDING_STEPS: Record<Role, OnboardingStep[]> = {
  DEVELOPER: [
    { id: "dash", label: "Tableau de Bord & Rentabilité nette réelle", href: "/dashboard", hint: "Vision consolidée 100% réelle BDD avec sélecteurs DG (1M, 6M, 1A, 2A, 3A)" },
    { id: "vehicles", label: "Fiches Techniques Automobiles IA & Stock", href: "/vehicles", hint: "Génération OpenAI unitaire et confirmation définitive en BDD" },
    { id: "workshop", label: "Supervision Atelier SAV & Matrice Excel", href: "/workshop", hint: "Mouvements OR, export officiel XLSX et modèle de données" },
    { id: "chat", label: "Conférences Audio WebRTC & Téléphonie VoIP", href: "/chat", hint: "Salons audio virtuels chiffrés et appels internes en direct" },
    { id: "security", label: "Sécurité Bcrypt & Contrôle des accès", href: "/users", hint: "Gestion de la flotte d'utilisateurs et réinitialisation sécurisée" },
    { id: "invoices", label: "Supervision Facturation & Bilan financier", href: "/invoices", hint: "Factures normalisées et grand livre comptable" },
  ],
  PDG: [
    { id: "dash", label: "Rentabilité générale & flux de trésorerie", href: "/dashboard", hint: "Bénéfice net après dépenses & salaires sur 1M à 3 Ans" },
    { id: "stock", label: "Supervision du stock & arrivages maritimes", href: "/vehicles", hint: "Disponibilité immédiate showroom et fiches techniques homologuées" },
    { id: "workshop", label: "Activité de l'Atelier SAV & Réparations", href: "/workshop", hint: "Suivi des ordres de réparation et export Excel officiel" },
    { id: "invoices", label: "Bilan financier consolidé & encaissements", href: "/invoices", hint: "Contrôle des créances et extraction financière" },
    { id: "expenses", label: "Dépenses d'exploitation & Bons de commande", href: "/expenses", hint: "Validation des charges fournisseurs et ordres d'achat" },
    { id: "chat", label: "Conférences audio de Direction & Ligne directe", href: "/chat", hint: "Salons virtuels de réunion avec les chefs de service" },
    { id: "users", label: "Gouvernance des accès & Sécurité", href: "/users", hint: "Supervision des profils et conformité des accès" },
  ],
  SG: [
    { id: "dash", label: "Indicateurs d'activité & trésorerie générale", href: "/dashboard", hint: "Vue consolidée des opérations de l'entreprise" },
    { id: "workshop", label: "Mouvements Atelier & Passages SAV", href: "/workshop", hint: "Suivi des entrées/sorties et matrice Excel" },
    { id: "invoices", label: "Suivi des factures clients & recouvrement", href: "/invoices", hint: "Factures normalisées et journal des règlements" },
    { id: "hr", label: "Gestion du personnel & validation des congés", href: "/hr", hint: "Dossiers agents, absences et normes du travail" },
    { id: "team", label: "Gestion de la flotte des utilisateurs", href: "/users", hint: "Attribution des accès et profils métiers" },
  ],
  DG: [
    { id: "dash", label: "Tableau de Bord Financier & Rentabilité Réelle", href: "/dashboard", hint: "4 graphes consolidés : Ventes, Dépenses, Activité et Bénéfice net (1M à 3 Ans)" },
    { id: "stock", label: "Parc Automobile & Fiches Techniques Homologuées", href: "/vehicles", hint: "Validation définitive des fiches IA sans régénération répétée" },
    { id: "workshop", label: "Atelier SAV & Matrice Excel Carzone", href: "/workshop", hint: "Supervision des ordres de réparation et export XLSX officiel" },
    { id: "invoices", label: "Encaissements, Factures & Grand Livre", href: "/invoices", hint: "Suivi des règlements et extraction Excel du bilan financier" },
    { id: "expenses", label: "Dépenses, Prestataires & Bons de Commande", href: "/expenses", hint: "Charges d'entreprise, bons de commande BC et salaires" },
    { id: "chat", label: "Téléphonie VoIP & Salons de Conférence Audio", href: "/chat", hint: "Appels directs chiffrés et réunions virtuelles avec l'équipe" },
    { id: "pipeline", label: "Pipeline Commercial & Négociations", href: "/opportunities", hint: "Suivi des opportunités et conversion des ventes" },
  ],
  ADV: [
    { id: "quotes", label: "Émission & Validation des devis / proformas", href: "/quotes", hint: "Offres commerciales fermes avec calcul automatique de TVA" },
    { id: "invoices", label: "Conversion en factures de vente & règlements", href: "/invoices", hint: "Factures normalisées et suivi des acomptes clients" },
    { id: "stock", label: "Disponibilité du stock & Fiches techniques", href: "/vehicles", hint: "Spécifications officielles et fiches homologuées" },
    { id: "clients", label: "Dossiers clients & pièces justificatives", href: "/clients", hint: "Répertoire clients, IFU et historique commercial" },
    { id: "chat", label: "Coordination avec l'atelier et la comptabilité", href: "/chat", hint: "Messagerie instantanée interne" },
  ],
  RF: [
    { id: "invoices", label: "Bilan financier consolidé & encaissements", href: "/invoices", hint: "Extraction Excel du grand livre des factures et paiements" },
    { id: "expenses", label: "Contrôle des dépenses & charges fournisseurs", href: "/expenses", hint: "Suivi des bons de commande et échéances de paiement" },
    { id: "quotes", label: "Audit des devis & marges commerciales", href: "/quotes", hint: "Vérification des montants HT/TTC et rentabilité" },
    { id: "dash", label: "Indicateurs de trésorerie & bénéfice net", href: "/dashboard", hint: "Courbes de ventes vs dépenses en temps réel" },
    { id: "hr", label: "Masse salariale & virements du personnel", href: "/hr", hint: "Paiement des salaires et cotisations" },
  ],
  RH: [
    { id: "hr_staff", label: "Gestion du Personnel & Salariés", href: "/hr", hint: "Contrats de travail, fiches d'embauche et matricules" },
    { id: "hr_leaves", label: "Validation des congés & absences", href: "/hr", hint: "Suivi des soldes légaux (24 jours ouvrables / an, OHADA)" },
    { id: "hr_pay", label: "Paie & Virements de salaires", href: "/hr", hint: "Historique des salaires et régularisations" },
    { id: "team", label: "Gestion des utilisateurs & rôles d'accès", href: "/users", hint: "Attribution sécurisée des profils collaborateurs" },
    { id: "chat", label: "Communications d'entreprise & diffusions", href: "/chat", hint: "Canal général et annonces RH" },
  ],
  RTA: [
    { id: "workshop", label: "Flux Atelier SAV & Ordres de Réparation", href: "/workshop", hint: "Suivi des entrées, diagnostics et interventions" },
    { id: "excel", label: "Matrice Excel SAV officielle Carzone", href: "/workshop", hint: "Téléchargement modèle et export XLSX d'historique" },
    { id: "quotes", label: "Devis réparations, main-d'œuvre & pièces", href: "/quotes", hint: "Tarification précise des prestations garage" },
    { id: "parts", label: "Stock de pièces de rechange & outillage", href: "/parts", hint: "Disponibilité magasin et références compatibles" },
    { id: "stock", label: "Fiches techniques des véhicules clients", href: "/vehicles", hint: "Spécifications constructeur et motorisations" },
  ],
  DC: [
    { id: "pipeline", label: "Pilotage du pipeline commercial", href: "/opportunities", hint: "Affaires en cours, étapes de vente et closing" },
    { id: "stock", label: "Stock showroom & Fiches techniques clients", href: "/vehicles", hint: "Véhicules disponibles immédiatement et impression" },
    { id: "quotes", label: "Validation des offres & proformas", href: "/quotes", hint: "Remises commerciales et propositions VIP" },
    { id: "clients", label: "Répertoire clients & Grands comptes", href: "/clients", hint: "Fiches entreprises et particuliers" },
    { id: "chat", label: "Coordination de l'équipe commerciale", href: "/chat", hint: "Liaison directe avec le Showroom et l'Atelier" },
  ],
  CHEF_ATELIER: [
    { id: "workshop", label: "Réception & Sortie véhicules atelier SAV", href: "/workshop", hint: "Création des OR, affectation techniciens et suivi de l'avancement" },
    { id: "excel", label: "Fichier Excel SAV officiel Carzone", href: "/workshop", hint: "Export et import des fiches de suivi d'atelier" },
    { id: "quotes", label: "Émission de devis d'entretien & réparation", href: "/quotes", hint: "Chiffrage main-d'œuvre et pièces de rechange" },
    { id: "parts", label: "Gestion du magasin de pièces détachées", href: "/parts", hint: "Consommation pièces et commandes réassort" },
    { id: "clients", label: "Historique d'entretien par véhicule client", href: "/clients", hint: "Suivi des garanties et carnets d'entretien" },
  ],
  COMMERCIAL: [
    { id: "clients", label: "Enregistrer des clients & prospects", href: "/clients", hint: "Fiches coordonnées, IFU et préférences d'achat" },
    { id: "stock", label: "Consulter le stock & imprimer les fiches techniques", href: "/vehicles", hint: "Fiches techniques homologuées sans débordement pour les clients" },
    { id: "quotes", label: "Créer des factures proformas & devis", href: "/quotes", hint: "Calcul automatique TVA et options véhicules" },
    { id: "invoices", label: "Suivre la facturation et les règlements", href: "/invoices", hint: "Vérification des acomptes avant livraison" },
    { id: "mailbox", label: "Envoyer des devis et relancer par mail", href: "/mailbox", hint: "Boîte d'envoi et notifications clients" },
    { id: "chat", label: "Contacter l'atelier SAV ou la direction", href: "/chat", hint: "Messagerie instantanée interne" },
  ],
  HOTESSE: [
    { id: "clients", label: "Accueil Showroom & Création fiches clients", href: "/clients", hint: "Enregistrement rapide des visiteurs et coordonnées" },
    { id: "stock", label: "Renseigner les clients sur le stock disponible", href: "/vehicles", hint: "Modèles, couleurs et autonomie électrique" },
    { id: "quotes", label: "Préparer des devis d'accueil", href: "/quotes", hint: "Propositions de prix pour les visiteurs" },
    { id: "invoices", label: "Délivrer des factures & reçus comptoir", href: "/invoices", hint: "Encaissement immédiat et impression" },
    { id: "chat", label: "Alerter les commerciaux de l'arrivée d'un visiteur", href: "/chat", hint: "Notification directe au showroom" },
  ],
  ASSISTANTE_COMPTABLE: [
    { id: "workshop", label: "Mouvements atelier SAV & facturation OR", href: "/workshop", hint: "Suivi des travaux terminés à facturer" },
    { id: "invoices", label: "Factures normalisées & enregistrement règlements", href: "/invoices", hint: "Paiements par chèque, virement ou espèces" },
    { id: "quotes", label: "Émission et contrôle des proformas", href: "/quotes", hint: "Bons de commande et devis validés" },
    { id: "expenses", label: "Saisie des dépenses & factures fournisseurs", href: "/expenses", hint: "Enregistrement des bons de commande BC" },
    { id: "clients", label: "Comptes clients & relances d'impayés", href: "/clients", hint: "Solde des créances et justificatifs" },
  ],
  ADMIN: [
    { id: "stock", label: "Référencer entrées / sorties de véhicules", href: "/vehicles", hint: "Gestion du parc, numéros de châssis VIN et fiches" },
    { id: "mailbox", label: "Gestion des messages & boîtes de réception", href: "/mailbox", hint: "Courriers entrants et réponses aux demandes" },
    { id: "clients", label: "Répertoire global des clients CARZONE", href: "/clients", hint: "Entreprises, particuliers et institutions" },
    { id: "fleet", label: "Suivi de la flotte & véhicules en circulation", href: "/fleet", hint: "Parc roulant et contrats de location" },
    { id: "users", label: "Administration des comptes collaborateurs", href: "/users", hint: "Sécurité Bcrypt et réinitialisation de mots de passe" },
  ],
  COMPTA: [
    { id: "invoices", label: "Facturation normalisée DGI & conformité TVA", href: "/invoices", hint: "Certification et archivage des écritures de vente" },
    { id: "payments", label: "Journal des encaissements & rapprochement bancaire", href: "/invoices", hint: "Affectation des règlements par facture" },
    { id: "reports", label: "Extraction Excel du bilan financier", href: "/reports", hint: "Grand livre consolidé des ventes et encaissements" },
    { id: "expenses", label: "Dépenses d'entreprise, bons de commande & prestataires", href: "/expenses", hint: "Pointage des charges d'exploitation" },
    { id: "workshop", label: "Ordres de réparation atelier facturables", href: "/workshop", hint: "Main-d'œuvre et pièces détachées facturées" },
    { id: "hr", label: "Contrôle de la masse salariale", href: "/hr", hint: "Paiements des salaires et régularisations" },
  ],
  STOCK: [
    { id: "catalog", label: "Catalogue officiel & marques chinoises partenaires", href: "/catalog", hint: "BYD, ChangAn, Jetour, Geely, Voyah, Tank, etc." },
    { id: "stock", label: "Ajouter un véhicule en stock avec fiches IA", href: "/vehicles", hint: "Fiches techniques avec confirmation définitive BDD" },
    { id: "imports", label: "Suivi des imports maritimes & transit", href: "/imports", hint: "Ports de départ, ETA Cotonou et dédouanement" },
    { id: "parts", label: "Inventaire des pièces de rechange", href: "/parts", hint: "Stock physique et alertes de seuil minimal" },
  ],
  ATELIER: [
    { id: "wo", label: "Ouvrir & exécuter un Ordre de Réparation (OR)", href: "/workshop", hint: "Diagnostic technique haute tension & réparations" },
    { id: "excel", label: "Matrice Excel SAV officielle Carzone", href: "/workshop", hint: "Export et consultation de l'historique atelier" },
    { id: "parts", label: "Consommation pièces de rechange", href: "/parts", hint: "Sortie de stock atelier pour chaque réparation" },
    { id: "stock", label: "Fiche technique du véhicule en réparation", href: "/vehicles", hint: "Spécifications de couple, batterie et fluides" },
  ],
  BORNES_OPS: [
    { id: "charging", label: "Supervision du réseau de bornes de recharge", href: "/charging", hint: "Bornes rapides Cotonou, puissances et disponibilité" },
    { id: "terminal", label: "Terminal Express de paiement recharge", href: "/terminal", hint: "Simulation et facturation immédiate au comptoir" },
    { id: "charge_req", label: "Demandes d'installation de bornes résidentielles", href: "/charge-requests", hint: "Affectation aux installateurs agréés" },
  ],
  INSTALLATEUR: [
    { id: "charge_req", label: "Répondre aux demandes d'installation de bornes", href: "/charge-requests", hint: "Soumettre montant, devis et délai d'intervention" },
    { id: "profile", label: "Consulter la fiche profil électricien agréé", href: "/installers", hint: "Coordonnées d'entreprise et certifications" },
  ],
};

export const ONBOARDING_STORAGE_KEY = "carzone_onboarding_dismissed";
