import type { Role } from "@/lib/roles";

export type OnboardingStep = {
  id: string;
  label: string;
  href: string;
  hint: string;
};

export const ONBOARDING_STEPS: Record<Role, OnboardingStep[]> = {
  PDG: [
    { id: "dash", label: "Superviser les indicateurs globaux", href: "/dashboard", hint: "KPIs d'activité" },
    { id: "workshop", label: "Superviser les flux SAV / Atelier", href: "/workshop", hint: "Véhicules en cours & livrés" },
    { id: "proforma", label: "Superviser devis & commandes", href: "/quotes", hint: "Bons de commande & proformas" },
    { id: "invoices", label: "Bilan financier & encaissements", href: "/invoices", hint: "Extraction bilan financier" },
    { id: "team", label: "Gestion des utilisateurs & rôles", href: "/users", hint: "Gouvernance" },
  ],
  SG: [
    { id: "dash", label: "Vue d’ensemble administrative", href: "/dashboard", hint: "KPIs et alertes" },
    { id: "workshop", label: "Mouvements Atelier & SAV", href: "/workshop", hint: "Suivi des entrées/sorties" },
    { id: "invoices", label: "Bilan financier & factures", href: "/invoices", hint: "Extraction rapports" },
    { id: "team", label: "Gestion de l'équipe", href: "/users", hint: "Attribution des rôles" },
  ],
  DG: [
    { id: "dash", label: "Parcourir le tableau de bord", href: "/dashboard", hint: "Vue d’ensemble KPI" },
    { id: "stock", label: "Contrôler le stock véhicules", href: "/vehicles", hint: "Disponibilités & matching" },
    { id: "catalog", label: "Catalogue & fournisseurs", href: "/catalog", hint: "Marques CARZONE site" },
    { id: "pipeline", label: "Suivre le pipeline commercial", href: "/opportunities", hint: "Opportunités en cours" },
    { id: "proforma", label: "Valider une proforma / BDC", href: "/quotes", hint: "Politique d’annulation" },
    { id: "invoices", label: "Surveiller encaissements", href: "/invoices", hint: "Factures & retards" },
    { id: "bornes", label: "Bornes & abonnements", href: "/charging", hint: "Énergie & plans" },
  ],
  ADV: [
    { id: "dash", label: "Suivi des opérations de vente", href: "/dashboard", hint: "Commandes & livraisons" },
    { id: "quotes", label: "Gestion devis & proformas", href: "/quotes", hint: "Validation & annulation" },
    { id: "invoices", label: "Bilan financier & factures", href: "/invoices", hint: "Extraction bilan financier" },
    { id: "team", label: "Gestion des rôles & accès", href: "/users", hint: "Gestion des rôles autorisée" },
  ],
  RF: [
    { id: "invoices", label: "Bilan financier & encaissements", href: "/invoices", hint: "Extraction bilan financier autorisée" },
    { id: "quotes", label: "Audit des devis & marges", href: "/quotes", hint: "Contrôle budgétaire" },
    { id: "dash", label: "Indicateurs financiers", href: "/dashboard", hint: "Chiffre d'affaires & créances" },
  ],
  RH: [
    { id: "hr_staff", label: "Gestion du Personnel & Salariés", href: "/hr", hint: "Contrats, dossiers & matricules" },
    { id: "hr_leaves", label: "Valider les congés & absences", href: "/hr", hint: "Approbation & soldes 24 jours" },
    { id: "hr_setup", label: "Référentiel RH (Départements & Congés)", href: "/hr", hint: "Normes Bénin / OHADA" },
    { id: "team", label: "Gestion des utilisateurs & rôles", href: "/users", hint: "Flotte des accès système" },
  ],
  RTA: [
    { id: "workshop", label: "Mouvements Atelier & SAV", href: "/workshop", hint: "Historique & Ordres de réparation" },
    { id: "stock", label: "Consulter & modifier le stock", href: "/vehicles", hint: "Disponibilité pièces/véhicules" },
    { id: "quotes", label: "Devis réparations (créer / modifier / supprimer)", href: "/quotes", hint: "Gestion complète des devis" },
    { id: "services", label: "Ajouter des services & forfaits", href: "/services", hint: "Catalogue prestations" },
    { id: "team", label: "Gestion des utilisateurs & rôles", href: "/users", hint: "Attribution des accès" },
  ],
  DC: [
    { id: "pipeline", label: "Piloter le pipeline commercial", href: "/opportunities", hint: "Affaires en cours" },
    { id: "stock", label: "Consulter & ajuster le stock", href: "/vehicles", hint: "Disponibilités showroom" },
    { id: "workshop", label: "Consulter les mouvements atelier", href: "/workshop", hint: "Préparation véhicules" },
    { id: "quotes", label: "Devis (créer / modifier / supprimer)", href: "/quotes", hint: "Offres commerciales" },
    { id: "services", label: "Ajouter des services & packs", href: "/services", hint: "Catalogue" },
    { id: "team", label: "Gérer l'équipe commerciale", href: "/users", hint: "Gestion rôles autorisée" },
  ],
  CHEF_ATELIER: [
    { id: "workshop", label: "Entrée / Sortie véhicules atelier", href: "/workshop", hint: "Fichier SAV & mouvements" },
    { id: "quotes", label: "Émettre des devis d'entretien", href: "/quotes", hint: "Travaux & pièces" },
    { id: "invoices", label: "Facturation & relance recouvrement", href: "/invoices", hint: "Suivi des impayés garage" },
    { id: "stock", label: "Consulter le stock", href: "/vehicles", hint: "Disponibilités" },
    { id: "clients", label: "Fiches clients & documents", href: "/clients", hint: "Historique véhicules" },
  ],
  COMMERCIAL: [
    { id: "clients", label: "Enregistrer des clients", href: "/clients", hint: "Fiches & documents clients" },
    { id: "quotes", label: "Faire des devis & proformas", href: "/quotes", hint: "Offres personnalisées" },
    { id: "invoices", label: "Faire des factures", href: "/invoices", hint: "Conversion après accord" },
    { id: "mailbox", label: "Envoyer des mails", href: "/mailbox", hint: "Messagerie & relances" },
    { id: "stock", label: "Consulter le stock véhicules", href: "/vehicles", hint: "Disponibilités showroom" },
    { id: "services", label: "Ajouter des prestations / services", href: "/services", hint: "Options & forfaits" },
  ],
  HOTESSE: [
    { id: "clients", label: "Accueil & enregistrement clients", href: "/clients", hint: "Ajout documents & coordonnées" },
    { id: "quotes", label: "Faire des devis", href: "/quotes", hint: "Préparation devis" },
    { id: "invoices", label: "Factures & reçus", href: "/invoices", hint: "Paiements comptoir" },
    { id: "mailbox", label: "Envoyer des mails clients", href: "/mailbox", hint: "Notifications" },
    { id: "stock", label: "Consulter le stock", href: "/vehicles", hint: "Renseignements" },
    { id: "services", label: "Ajout de services", href: "/services", hint: "Tarifs & prestations" },
  ],
  ASSISTANTE_COMPTABLE: [
    { id: "workshop", label: "Mouvements atelier & entrées/sorties", href: "/workshop", hint: "Passages SAV garage" },
    { id: "invoices", label: "Facturation & relance recouvrement", href: "/invoices", hint: "Suivi des encaissements" },
    { id: "quotes", label: "Faire des devis", href: "/quotes", hint: "Devis & bons de commande" },
    { id: "clients", label: "Enregistrer clients & documents", href: "/clients", hint: "Pièces justificatives" },
    { id: "stock", label: "Consulter le stock", href: "/vehicles", hint: "Inventaire" },
    { id: "services", label: "Ajouter des services", href: "/services", hint: "Facturables" },
  ],
  ADMIN: [
    { id: "stock", label: "Référencer entrées / sorties véhicules", href: "/vehicles", hint: "Gestion du stock & mouvements" },
    { id: "mailbox", label: "Consulter les messages clients", href: "/mailbox", hint: "Boîte de réception & réponses" },
    { id: "clients", label: "Répertoire clients", href: "/clients", hint: "Coordonnées & contacts" },
    { id: "fleet", label: "Suivi de la flotte & parc", href: "/fleet", hint: "Véhicules en circulation" },
  ],
  COMPTA: [
    { id: "quotes", label: "Contrôler proformas envoyées", href: "/quotes", hint: "Statuts & TVA" },
    { id: "normalize", label: "Factures normalisées", href: "/invoices", hint: "Encaissements" },
    { id: "void", label: "Annulation interne (motif obligatoire)", href: "/quotes", hint: "Jamais silencieuse" },
    { id: "workshop", label: "OR atelier facturables", href: "/workshop", hint: "Main-d’œuvre / pièces" },
  ],
  STOCK: [
    { id: "catalog", label: "Gérer catalogue & fournisseurs", href: "/catalog", hint: "Marques, modèles, ports" },
    { id: "stock", label: "Ajouter un véhicule (marque → modèle)", href: "/vehicles", hint: "Catalogue CARZONE" },
    { id: "imports", label: "Suivre un import", href: "/imports", hint: "ETA, fournisseur & transit" },
    { id: "match", label: "Aider le matching commercial", href: "/vehicles", hint: "Filtres stock / gamme" },
  ],
  ATELIER: [
    { id: "wo", label: "Ouvrir / suivre un OR", href: "/workshop", hint: "Diagnostic & coûts" },
    { id: "stock", label: "Vérifier véhicule concerné", href: "/vehicles", hint: "Fiche stock" },
  ],
  BORNES_OPS: [
    { id: "req", label: "Demande installation borne", href: "/charge-requests", hint: "Panel installateurs" },
    { id: "plans", label: "Plans & abonnements", href: "/charging", hint: "Tarifs kWh" },
    { id: "term", label: "Terminal de paiement", href: "/terminal", hint: "Simulation paiement" },
  ],
  INSTALLATEUR: [
    { id: "quotes", label: "Répondre aux devis bornes", href: "/charge-requests", hint: "Soumettre montant & délai" },
    { id: "profile", label: "Voir le panel installateurs", href: "/installers", hint: "Coordonnées & spécialités" },
  ],
};

export const ONBOARDING_STORAGE_KEY = "carzone-onboarding-dismissed";
