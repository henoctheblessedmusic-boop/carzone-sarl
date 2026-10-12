import type { Role } from "./roles";

export type Capability = {
  id: string;
  label: string;
  description?: string;
};

export type FeatureGroup = {
  id: string;
  name: string; // ex: "Customers", "Invoices", "Estimates", "Workshop"
  nameFr: string;
  description: string;
  capabilities: Capability[];
};

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "customers",
    name: "Customers",
    nameFr: "Clients & Répertoire",
    description: "Gestion du carnet d'adresses clients, coordonnées, IFU et pièces justificatives.",
    capabilities: [
      { id: "customers:view_own", label: "View Own", description: "Consulter uniquement ses clients assignés" },
      { id: "customers:view_global", label: "View (Global)", description: "Consulter l'ensemble des clients de l'entreprise" },
      { id: "customers:create", label: "Create", description: "Créer et enregistrer de nouveaux clients" },
      { id: "customers:edit", label: "Edit", description: "Modifier les coordonnées, IFU et contacts" },
      { id: "customers:delete", label: "Delete", description: "Supprimer ou archiver un client" },
      { id: "customers:documents", label: "Documents", description: "Téléverser et consulter les documents (CIP, IFU, etc.)" },
    ],
  },
  {
    id: "invoices",
    name: "Invoices",
    nameFr: "Factures & Bilan Financier",
    description: "Facturation normalisée, suivi des encaissements et extractions financières.",
    capabilities: [
      { id: "invoices:view_own", label: "View Own (Based On Assignee)", description: "Consulter uniquement ses factures" },
      { id: "invoices:view_global", label: "View (Global)", description: "Consulter toutes les factures de l'entreprise" },
      { id: "invoices:create", label: "Create", description: "Générer et émettre des factures" },
      { id: "invoices:edit", label: "Edit", description: "Modifier les factures non clôturées" },
      { id: "invoices:delete", label: "Delete", description: "Annuler des factures (motif obligatoire)" },
      { id: "invoices:financial_export", label: "Extraire le Bilan Financier (Excel)", description: "Télécharger l'état financier et grand livre au format Excel" },
    ],
  },
  {
    id: "estimates",
    name: "Estimates",
    nameFr: "Devis & Proformas",
    description: "Offres commerciales, factures proforma et estimations chiffrées.",
    capabilities: [
      { id: "estimates:view_own", label: "View Own (Based On Assignee)", description: "Consulter ses propres devis" },
      { id: "estimates:view_global", label: "View (Global)", description: "Consulter l'ensemble des devis" },
      { id: "estimates:create", label: "Create", description: "Créer un devis ou une facture proforma" },
      { id: "estimates:edit", label: "Edit", description: "Modifier les devis existants" },
      { id: "estimates:delete", label: "Delete", description: "Supprimer ou annuler des devis" },
    ],
  },
  {
    id: "purchase_orders",
    name: "Purchase Orders",
    nameFr: "Bons de Commande (BDC)",
    description: "Bons de commande fermes après acceptation des proformas.",
    capabilities: [
      { id: "orders:view_own", label: "View Own (Based On Assignee)", description: "Consulter ses bons de commande" },
      { id: "orders:view_global", label: "View (Global)", description: "Consulter tous les bons de commande" },
      { id: "orders:create", label: "Create", description: "Établir un bon de commande" },
      { id: "orders:edit", label: "Edit", description: "Valider ou modifier les bons de commande" },
      { id: "orders:delete", label: "Delete", description: "Supprimer / Annuler un bon de commande" },
    ],
  },
  {
    id: "workshop",
    name: "Workshop (SAV)",
    nameFr: "Atelier Garage & SAV",
    description: "Historique des passages, ordres de réparation, flux d'entrées/sorties et fichiers Excel programmés.",
    capabilities: [
      { id: "workshop:view_own", label: "View Own", description: "Consulter ses véhicules assignés" },
      { id: "workshop:view_global", label: "View (Global)", description: "Consulter tout l'historique SAV et mouvements d'atelier" },
      { id: "workshop:create", label: "Create (Entrée Atelier)", description: "Enregistrer une entrée de véhicule au garage (OR)" },
      { id: "workshop:edit", label: "Edit (Travaux & Sortie)", description: "Modifier l'état, travaux effectués, date de sortie" },
      { id: "workshop:delete", label: "Delete", description: "Supprimer un enregistrement de passage SAV" },
      { id: "workshop:excel", label: "Téléverser / Exporter Excel SAV", description: "Importer des classeurs Excel programmés et exporter en .xlsx" },
    ],
  },
  {
    id: "stock",
    name: "Stock & Flotte",
    nameFr: "Stock Véhicules & Parc",
    description: "Disponibilité du showroom, gestion des véhicules neufs, occasions et flotte.",
    capabilities: [
      { id: "stock:view", label: "View (Global)", description: "Consulter l'état du stock de véhicules" },
      { id: "stock:create", label: "Create", description: "Ajouter un véhicule au stock" },
      { id: "stock:edit", label: "Edit", description: "Modifier les prix, options et caractéristiques" },
      { id: "stock:delete", label: "Delete", description: "Retirer ou supprimer un véhicule du stock" },
    ],
  },
  {
    id: "services",
    name: "Services & Tarifs",
    nameFr: "Prestations & Forfaits Atelier",
    description: "Catalogue des forfaits d'entretien, pièces détachées et main d'œuvre.",
    capabilities: [
      { id: "services:view", label: "View", description: "Consulter la grille tarifaire des prestations" },
      { id: "services:create", label: "Create", description: "Ajouter de nouveaux services et forfaits" },
      { id: "services:edit", label: "Edit", description: "Modifier les tarifs et descriptions" },
      { id: "services:delete", label: "Delete", description: "Supprimer un service ou un forfait" },
    ],
  },
  {
    id: "users_management",
    name: "User & Role Management",
    nameFr: "Flotte des Utilisateurs & Rôles",
    description: "Administration des comptes, attribution des rôles et contrôle en temps réel des accès.",
    capabilities: [
      { id: "users:view", label: "View Users", description: "Consulter la liste de tous les utilisateurs de l'entreprise" },
      { id: "users:create", label: "Create User", description: "Créer un nouveau compte utilisateur" },
      { id: "users:assign_role", label: "Assign Roles", description: "Modifier et assigner les rôles de l'équipe" },
      { id: "users:custom_permissions", label: "Custom Permissions", description: "Cocher et personnaliser les capacités individuelles" },
      { id: "users:delete", label: "Delete / Toggle User", description: "Désactiver ou supprimer un compte utilisateur" },
    ],
  },
  {
    id: "hr",
    name: "Human Resources",
    nameFr: "Ressources Humaines (RH)",
    description: "Gestion du personnel, contrats, congés, absences et configuration RH.",
    capabilities: [
      { id: "hr:view", label: "View HR (Personnel & Congés)", description: "Consulter la liste des salariés et les demandes de congés" },
      { id: "hr:manage_employees", label: "Manage Employees", description: "Créer, modifier et archiver les fiches du personnel" },
      { id: "hr:manage_leaves", label: "Manage Leaves", description: "Valider, refuser et administrer les congés et soldes" },
      { id: "hr:setup", label: "HR Setup & Configuration", description: "Gérer les départements, types de congés et référentiels RH" },
    ],
  },
];

/**
 * Liste plate de tous les IDs de permissions possibles
 */
export const ALL_CAPABILITY_IDS: string[] = FEATURE_GROUPS.flatMap((g) =>
  g.capabilities.map((c) => c.id)
);

/**
 * Profils de permissions par défaut pour chaque rôle
 */
export const DEFAULT_ROLE_CAPABILITIES: Record<Role, string[]> = {
  PDG: [...ALL_CAPABILITY_IDS],
  SG: [...ALL_CAPABILITY_IDS],
  DG: [...ALL_CAPABILITY_IDS],

  // RH : Gestion intégrale du domaine des ressources humaines, personnel, congés, départements et rôles
  RH: [
    "hr:view", "hr:manage_employees", "hr:manage_leaves", "hr:setup",
    "users:view", "users:create", "users:assign_role", "users:custom_permissions",
  ],

  // ADV : Tout sauf suppression irréversible de stock, bilan financier autorisé, modification des rôles autorisée
  ADV: [
    "customers:view_own", "customers:view_global", "customers:create", "customers:edit", "customers:documents",
    "invoices:view_own", "invoices:view_global", "invoices:create", "invoices:edit", "invoices:delete", "invoices:financial_export",
    "estimates:view_own", "estimates:view_global", "estimates:create", "estimates:edit", "estimates:delete",
    "orders:view_own", "orders:view_global", "orders:create", "orders:edit", "orders:delete",
    "workshop:view_global", "workshop:excel",
    "stock:view", "stock:create", "stock:edit",
    "services:view", "services:create", "services:edit",
    "users:view", "users:create", "users:assign_role", "users:custom_permissions", "users:delete",
  ],

  // RF : Toutes opérations financières et devis, bilan financier autorisé, consultation générale, pas de gestion des rôles
  RF: [
    "customers:view_own", "customers:view_global", "customers:create", "customers:edit", "customers:documents",
    "invoices:view_own", "invoices:view_global", "invoices:create", "invoices:edit", "invoices:delete", "invoices:financial_export",
    "estimates:view_own", "estimates:view_global", "estimates:create", "estimates:edit", "estimates:delete",
    "orders:view_own", "orders:view_global", "orders:create", "orders:edit", "orders:delete",
    "workshop:view_global",
    "stock:view",
    "services:view", "services:create", "services:edit",
    "users:view",
  ],

  // RTA : Pas d'extraction financière ; voir/modifier stock ; mouvements atelier complets ; utilisateurs & rôles complets ; devis complets ; services
  RTA: [
    "customers:view_global", "customers:create", "customers:edit", "customers:documents",
    "invoices:view_global",
    "estimates:view_global", "estimates:create", "estimates:edit", "estimates:delete",
    "orders:view_global", "orders:create", "orders:edit",
    "workshop:view_global", "workshop:create", "workshop:edit", "workshop:delete", "workshop:excel",
    "stock:view", "stock:create", "stock:edit",
    "services:view", "services:create", "services:edit", "services:delete",
    "users:view", "users:create", "users:assign_role", "users:custom_permissions", "users:delete",
  ],

  // DC : Pas d'extraction financière ; stock voir/modifier ; mouvements atelier ; utilisateurs & rôles complets ; devis complets ; services
  DC: [
    "customers:view_global", "customers:create", "customers:edit", "customers:documents",
    "invoices:view_global",
    "estimates:view_global", "estimates:create", "estimates:edit", "estimates:delete",
    "orders:view_global", "orders:create", "orders:edit",
    "workshop:view_global",
    "stock:view", "stock:create", "stock:edit",
    "services:view", "services:create", "services:edit", "services:delete",
    "users:view", "users:create", "users:assign_role", "users:custom_permissions", "users:delete",
  ],

  // Commercial : clients, devis, factures, stock consultation, documents, services
  COMMERCIAL: [
    "customers:view_own", "customers:view_global", "customers:create", "customers:edit", "customers:documents",
    "invoices:view_own", "invoices:view_global", "invoices:create", "invoices:edit",
    "estimates:view_own", "estimates:view_global", "estimates:create", "estimates:edit",
    "orders:view_own", "orders:view_global", "orders:create",
    "stock:view",
    "services:view", "services:create",
  ],

  // Hôtesse : clients, devis, factures, stock consultation, documents, services
  HOTESSE: [
    "customers:view_own", "customers:view_global", "customers:create", "customers:edit", "customers:documents",
    "invoices:view_own", "invoices:view_global", "invoices:create", "invoices:edit",
    "estimates:view_own", "estimates:view_global", "estimates:create", "estimates:edit",
    "orders:view_own", "orders:view_global", "orders:create",
    "stock:view",
    "services:view", "services:create",
  ],

  // Chef Atelier : mouvements atelier complets, devis, facturation, entrées/sorties garage, relance, stock, documents
  CHEF_ATELIER: [
    "customers:view_global", "customers:create", "customers:edit", "customers:documents",
    "invoices:view_global", "invoices:create", "invoices:edit",
    "estimates:view_global", "estimates:create", "estimates:edit",
    "orders:view_global", "orders:create", "orders:edit",
    "workshop:view_global", "workshop:create", "workshop:edit", "workshop:excel",
    "stock:view",
    "services:view", "services:create",
  ],

  // Assistante Comptable : mouvements atelier, devis, facturation, entrées/sorties garage, relance, stock, documents, clients, services
  ASSISTANTE_COMPTABLE: [
    "customers:view_global", "customers:create", "customers:edit", "customers:documents",
    "invoices:view_global", "invoices:create", "invoices:edit",
    "estimates:view_global", "estimates:create", "estimates:edit",
    "orders:view_global", "orders:create", "orders:edit",
    "workshop:view_global", "workshop:create", "workshop:edit", "workshop:excel",
    "stock:view",
    "services:view", "services:create", "services:edit",
  ],

  ADMIN: [
    "customers:view_global", "customers:create", "customers:edit", "customers:delete", "customers:documents",
    "invoices:view_global", "invoices:create", "invoices:edit",
    "estimates:view_global", "estimates:create", "estimates:edit", "estimates:delete",
    "orders:view_global", "orders:create", "orders:edit",
    "workshop:view_global", "workshop:create", "workshop:edit", "workshop:delete", "workshop:excel",
    "stock:view", "stock:create", "stock:edit", "stock:delete",
    "services:view", "services:create", "services:edit", "services:delete",
    "users:view", "users:create", "users:assign_role", "users:custom_permissions", "users:delete",
    "hr:view", "hr:manage_employees", "hr:manage_leaves", "hr:setup",
  ],

  COMPTA: [
    "customers:view_global", "customers:create", "customers:edit", "customers:documents",
    "invoices:view_global", "invoices:create", "invoices:edit", "invoices:financial_export",
    "estimates:view_global", "estimates:create", "estimates:edit",
    "orders:view_global", "orders:create", "orders:edit",
    "workshop:view_global",
    "stock:view",
    "services:view",
  ],

  STOCK: [
    "stock:view", "stock:create", "stock:edit", "stock:delete",
    "workshop:view_global",
    "services:view",
  ],

  ATELIER: [
    "workshop:view_global", "workshop:create", "workshop:edit",
    "stock:view",
    "services:view",
  ],

  BORNES_OPS: [
    "customers:view_global",
    "invoices:view_global",
    "services:view",
  ],

  INSTALLATEUR: [
    "estimates:view_own",
  ],
};

/**
 * Retourne les capacités actives effectives pour un utilisateur donné
 * Si l'utilisateur possède des customPermissions non vides, elles sont retournées.
 * Sinon, les capacités par défaut de son rôle sont utilisées.
 */
export function getEffectiveCapabilities(role: Role, customPermissions?: string[] | null): string[] {
  if (role === "PDG" || role === "SG" || role === "DG") {
    return [...ALL_CAPABILITY_IDS];
  }
  if (customPermissions && customPermissions.length > 0) {
    return customPermissions;
  }
  return DEFAULT_ROLE_CAPABILITIES[role] || [];
}

/**
 * Vérifie si une capacité spécifique est active pour un utilisateur
 */
export function userHasCapability(
  role: Role,
  capabilityId: string,
  customPermissions?: string[] | null
): boolean {
  if (role === "PDG" || role === "SG" || role === "DG") {
    return true;
  }
  const effective = getEffectiveCapabilities(role, customPermissions);
  return effective.includes(capabilityId);
}
