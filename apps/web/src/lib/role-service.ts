import type { Role } from "./roles";

export type RoleUser = {
  id: string;
  role: Role;
  email?: string;
  fullName?: string;
  customPermissions?: string[];
};

export type Permission =
  | "admin:all"
  | "financial_report:export"
  | "roles:manage"
  | "users:manage"
  | "services:manage"
  | "quotes:delete"
  | "invoices:read"
  | "invoices:write"
  | "quotes:read"
  | "quotes:write"
  | "vehicles:read"
  | "vehicles:write"
  | "workshop:read"
  | "workshop:write"
  | "clients:read"
  | "clients:write"
  | "charging:read"
  | "charging:write"
  | "installers:read"
  | "installers:write"
  | "fleet:read"
  | "fleet:write"
  | "mailbox:read"
  | "mailbox:write"
  | "hr:read"
  | "hr:write"
  | "expenses:read"
  | "expenses:write";

/**
 * Matrice complète des autorisations de service par rôle (RBAC & RLS applicatif)
 */
const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  // 1. PDG : Aucune restriction
  PDG: [
    "admin:all",
    "financial_report:export",
    "roles:manage",
    "users:manage",
    "services:manage",
    "quotes:delete",
    "invoices:read", "invoices:write",
    "quotes:read", "quotes:write",
    "vehicles:read", "vehicles:write",
    "workshop:read", "workshop:write",
    "clients:read", "clients:write",
    "charging:read", "charging:write",
    "installers:read", "installers:write",
    "fleet:read", "fleet:write",
    "mailbox:read", "mailbox:write",
    "hr:read", "hr:write",
    "expenses:read", "expenses:write",
  ],

  // 2. SG : Aucune restriction
  SG: [
    "admin:all",
    "financial_report:export",
    "roles:manage",
    "users:manage",
    "services:manage",
    "quotes:delete",
    "invoices:read", "invoices:write",
    "quotes:read", "quotes:write",
    "vehicles:read", "vehicles:write",
    "workshop:read", "workshop:write",
    "clients:read", "clients:write",
    "charging:read", "charging:write",
    "installers:read", "installers:write",
    "fleet:read", "fleet:write",
    "mailbox:read", "mailbox:write",
    "hr:read", "hr:write",
    "expenses:read", "expenses:write",
  ],

  // 3. ADV : Aucune restriction, extraction du bilan financier, possibilité de modifier les rôles
  ADV: [
    "admin:all",
    "financial_report:export",
    "roles:manage",
    "users:manage",
    "services:manage",
    "quotes:delete",
    "invoices:read", "invoices:write",
    "quotes:read", "quotes:write",
    "vehicles:read", "vehicles:write",
    "workshop:read", "workshop:write",
    "clients:read", "clients:write",
    "charging:read", "charging:write",
    "installers:read", "installers:write",
    "fleet:read", "fleet:write",
    "mailbox:read", "mailbox:write",
    "hr:read", "hr:write",
    "expenses:read", "expenses:write",
  ],

  // 4. RF : Aucune restriction, extraction du bilan financier
  RF: [
    "admin:all",
    "financial_report:export",
    "services:manage",
    "quotes:delete",
    "invoices:read", "invoices:write",
    "quotes:read", "quotes:write",
    "vehicles:read", "vehicles:write",
    "workshop:read", "workshop:write",
    "clients:read", "clients:write",
    "charging:read", "charging:write",
    "installers:read", "installers:write",
    "fleet:read", "fleet:write",
    "mailbox:read", "mailbox:write",
    "hr:read", "hr:write",
    "expenses:read", "expenses:write",
  ],

  // 5. RTA : Pas d'extraction bilans financiers ; voir/modifier stock ; mouvements atelier ; ajouter/supprimer utilisateur ; ajouter services ; supprimer/modifier devis ; modifier rôles
  RTA: [
    "roles:manage",
    "users:manage",
    "services:manage",
    "quotes:read", "quotes:write", "quotes:delete",
    "vehicles:read", "vehicles:write",
    "workshop:read", "workshop:write",
    "clients:read", "clients:write",
    "mailbox:read", "mailbox:write",
  ],

  // 6. DC : Pas d'extraction bilans financiers ; consulter/modifier stock ; mouvements atelier ; ajouter/supprimer utilisateur ; ajouter services ; supprimer/modifier devis ; modifier rôles
  DC: [
    "roles:manage",
    "users:manage",
    "services:manage",
    "quotes:read", "quotes:write", "quotes:delete",
    "vehicles:read", "vehicles:write",
    "workshop:read",
    "clients:read", "clients:write",
    "mailbox:read", "mailbox:write",
  ],

  // 7. Commercial : Enregistrer clients, devis, factures, mails, stock, documents clients, services
  COMMERCIAL: [
    "services:manage",
    "quotes:read", "quotes:write",
    "invoices:read", "invoices:write",
    "vehicles:read",
    "clients:read", "clients:write",
    "mailbox:read", "mailbox:write",
  ],

  // 8. Hôtesse d'accueil : Enregistrer clients, devis, factures, mails, stock, documents clients, services
  HOTESSE: [
    "services:manage",
    "quotes:read", "quotes:write",
    "invoices:read", "invoices:write",
    "vehicles:read",
    "clients:read", "clients:write",
    "mailbox:read", "mailbox:write",
  ],

  // 9. Chef Atelier : Mouvements atelier, devis, facturation, entrée/sortie véhicules entretien, relance recouvrement, stock, documents
  CHEF_ATELIER: [
    "workshop:read", "workshop:write",
    "quotes:read", "quotes:write",
    "invoices:read", "invoices:write",
    "vehicles:read",
    "clients:read", "clients:write",
    "mailbox:read", "mailbox:write",
  ],

  // 10. Assistante Comptable : Mouvements atelier, devis, facturation, entrée/sortie véhicules entretien, relance recouvrement, stock, documents, clients, services, mails
  ASSISTANTE_COMPTABLE: [
    "services:manage",
    "workshop:read", "workshop:write",
    "quotes:read", "quotes:write",
    "invoices:read", "invoices:write",
    "vehicles:read",
    "clients:read", "clients:write",
    "mailbox:read", "mailbox:write",
    "hr:read", "hr:write",
    "expenses:read", "expenses:write",
  ],

  // 11. RH : Responsable Ressources Humaines (Personnel, Congés, Structure RH)
  RH: [
    "users:manage",
    "mailbox:read", "mailbox:write",
    "clients:read",
    "hr:read", "hr:write",
    "expenses:read", "expenses:write",
  ],

  // Compatibilité historique
  DG: [
    "admin:all",
    "financial_report:export",
    "roles:manage",
    "users:manage",
    "services:manage",
    "quotes:delete",
    "invoices:read", "invoices:write",
    "quotes:read", "quotes:write",
    "vehicles:read", "vehicles:write",
    "workshop:read", "workshop:write",
    "clients:read", "clients:write",
    "charging:read", "charging:write",
    "installers:read", "installers:write",
    "fleet:read", "fleet:write",
    "mailbox:read", "mailbox:write",
    "hr:read", "hr:write",
    "expenses:read", "expenses:write",
  ],
  ADMIN: [
    "roles:manage",
    "users:manage",
    "services:manage",
    "vehicles:read", "vehicles:write",
    "fleet:read", "fleet:write",
    "mailbox:read", "mailbox:write",
    "workshop:read", "workshop:write",
    "clients:read", "clients:write",
    "quotes:read", "quotes:write",
    "hr:read", "hr:write",
    "expenses:read", "expenses:write",
  ],
  COMPTA: [
    "financial_report:export",
    "invoices:read", "invoices:write",
    "quotes:read", "quotes:write",
    "workshop:read",
    "charging:read",
    "mailbox:read",
    "clients:read",
    "hr:read", "hr:write",
    "expenses:read", "expenses:write",
  ],
  STOCK: [
    "vehicles:read", "vehicles:write",
    "fleet:read",
  ],
  ATELIER: [
    "workshop:read", "workshop:write",
    "vehicles:read",
  ],
  BORNES_OPS: [
    "charging:read", "charging:write",
    "installers:read", "installers:write",
  ],
  INSTALLATEUR: [
    "installers:read",
  ],
};

/**
 * Service de contrôle d'accès aux données (Service Role / RLS)
 */
export class RoleService {
  /**
   * Vérifie si un rôle possède une permission donnée
   */
  static hasPermission(role: Role, permission: Permission): boolean {
    if (role === "DG" || role === "PDG" || role === "SG") return true;
    const perms = ROLE_PERMISSIONS[role];
    return perms ? perms.includes(permission) : false;
  }

  /**
   * Vérifie si un utilisateur possède une permission donnée (en tenant compte de son rôle et de ses capacités cochées)
   */
  static userHasPermission(user: RoleUser, permission: Permission): boolean {
    if (user.role === "DG" || user.role === "PDG" || user.role === "SG") return true;

    // Si des capacités personnalisées sont configurées sur l'utilisateur
    if (user.customPermissions && user.customPermissions.length > 0) {
      if (user.customPermissions.includes(permission)) return true;
      if (permission === "financial_report:export" && user.customPermissions.includes("invoices:financial_export")) return true;
      if (permission === "quotes:delete" && user.customPermissions.includes("estimates:delete")) return true;
      if (permission === "roles:manage" && user.customPermissions.includes("users:assign_role")) return true;
      if (permission === "users:manage" && (user.customPermissions.includes("users:create") || user.customPermissions.includes("users:view"))) return true;
      if (permission === "services:manage" && (user.customPermissions.includes("services:create") || user.customPermissions.includes("services:edit"))) return true;
      if (permission === "workshop:read" && (user.customPermissions.includes("workshop:view_global") || user.customPermissions.includes("workshop:view_own"))) return true;
      if (permission === "workshop:write" && (user.customPermissions.includes("workshop:create") || user.customPermissions.includes("workshop:edit"))) return true;
      if (permission === "invoices:read" && (user.customPermissions.includes("invoices:view_global") || user.customPermissions.includes("invoices:view_own"))) return true;
      if (permission === "invoices:write" && (user.customPermissions.includes("invoices:create") || user.customPermissions.includes("invoices:edit"))) return true;
      if (permission === "quotes:read" && (user.customPermissions.includes("estimates:view_global") || user.customPermissions.includes("estimates:view_own"))) return true;
      if (permission === "quotes:write" && (user.customPermissions.includes("estimates:create") || user.customPermissions.includes("estimates:edit"))) return true;
      if (permission === "vehicles:read" && user.customPermissions.includes("stock:view")) return true;
      if (permission === "vehicles:write" && (user.customPermissions.includes("stock:create") || user.customPermissions.includes("stock:edit"))) return true;
      if (permission === "clients:read" && (user.customPermissions.includes("customers:view_global") || user.customPermissions.includes("customers:view_own"))) return true;
      if (permission === "clients:write" && (user.customPermissions.includes("customers:create") || user.customPermissions.includes("customers:edit"))) return true;
      if (permission === "hr:read" && (user.customPermissions.includes("hr:view") || user.customPermissions.includes("hr:manage_employees") || user.customPermissions.includes("hr:manage_leaves"))) return true;
      if (permission === "hr:write" && (user.customPermissions.includes("hr:manage_employees") || user.customPermissions.includes("hr:manage_leaves") || user.customPermissions.includes("hr:setup"))) return true;
    }

    return this.hasPermission(user.role, permission);
  }

  /**
   * Exige une permission spécifique pour un utilisateur ou lance une exception
   */
  static enforcePermission(user: RoleUser, permission: Permission): void {
    if (!this.userHasPermission(user, permission)) {
      throw new Error(`FORBIDDEN: L'utilisateur n'a pas la permission requise [${permission}]`);
    }
  }

  /**
   * Filtre RLS (Row Level Security) pour les installateurs de bornes
   */
  static getInstallerScope(user: RoleUser) {
    if (user.role === "DG" || user.role === "PDG" || user.role === "SG" || user.role === "BORNES_OPS") {
      return {}; // Accès complet
    }
    if (user.role === "INSTALLATEUR") {
      return { installerId: user.id };
    }
    return { id: "__NO_ACCESS__" };
  }

  /**
   * Filtre RLS pour les techniciens atelier
   */
  static getWorkshopScope(user: RoleUser) {
    if (
      user.role === "DG" ||
      user.role === "PDG" ||
      user.role === "SG" ||
      user.role === "ADV" ||
      user.role === "RF" ||
      user.role === "RTA" ||
      user.role === "DC" ||
      user.role === "CHEF_ATELIER" ||
      user.role === "ASSISTANTE_COMPTABLE" ||
      user.role === "ATELIER"
    ) {
      return {};
    }
    return { id: "__NO_ACCESS__" };
  }

  /**
   * Vérifie si un chemin d'URL est autorisé pour un rôle
   */
  static isRouteAllowed(role: Role, pathname: string): boolean {
    if (role === "DG" || role === "PDG" || role === "SG" || role === "ADV" || role === "RF") return true;

    if (pathname.startsWith("/users")) {
      return this.hasPermission(role, "roles:manage") || this.hasPermission(role, "users:manage");
    }
    if (pathname.startsWith("/invoices")) {
      return this.hasPermission(role, "invoices:read");
    }
    if (pathname.startsWith("/quotes")) {
      return this.hasPermission(role, "quotes:read");
    }
    if (pathname.startsWith("/vehicles") || pathname.startsWith("/catalog") || pathname.startsWith("/imports")) {
      return this.hasPermission(role, "vehicles:read");
    }
    if (pathname.startsWith("/workshop")) {
      return this.hasPermission(role, "workshop:read");
    }
    if (pathname.startsWith("/services")) {
      return this.hasPermission(role, "services:manage");
    }
    if (pathname.startsWith("/clients")) {
      return true; // Tous les rôles connectés ont accès aux clients
    }
    if (pathname.startsWith("/charging") || pathname.startsWith("/terminal")) {
      return this.hasPermission(role, "charging:read");
    }
    if (pathname.startsWith("/installers") || pathname.startsWith("/charge-requests")) {
      return this.hasPermission(role, "installers:read");
    }
    if (pathname.startsWith("/fleet") || pathname.startsWith("/rentals")) {
      return this.hasPermission(role, "fleet:read");
    }
    if (pathname.startsWith("/mailbox")) {
      return this.hasPermission(role, "mailbox:read");
    }
    if (pathname.startsWith("/hr")) {
      return role === "RH" || role === "ADMIN" || role === "COMPTA" || role === "ASSISTANTE_COMPTABLE" || this.hasPermission(role, "hr:read");
    }
    if (pathname.startsWith("/expenses")) {
      return role === "COMPTA" || role === "ASSISTANTE_COMPTABLE" || role === "RH" || role === "ADMIN" || this.hasPermission(role, "expenses:read");
    }
    return true;
  }
}

