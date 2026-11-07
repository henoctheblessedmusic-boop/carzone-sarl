import { ROLE_LABELS, type Role } from "@/lib/roles";
import { DEFAULT_ROLE_CAPABILITIES } from "@/lib/permissions-config";

/** Rôles qui disposent du bypass total de l'application. */
export const SUPER_ADMIN_ROLES: readonly Role[] = ["DEVELOPER", "PDG", "DG", "SG"];

/** Rôles financiers dont la création et la gestion restent réservées aux super-admins. */
export const FINANCE_USER_ROLES: readonly Role[] = [
  "RF",
  "COMPTA",
  "ASSISTANTE_COMPTABLE",
  "COMPTA_GARAGE",
];

/** Rôles sensibles dont l'attribution ou la gestion doit rester réservée. */
export const PROTECTED_USER_ROLES: readonly Role[] = [
  "DEVELOPER",
  "PDG",
  "DG",
  "SG",
  "ADMIN",
  "ADV",
  ...FINANCE_USER_ROLES,
];

export function isSuperAdminRole(role: string): boolean {
  return SUPER_ADMIN_ROLES.includes(role as Role);
}

export function isProtectedUserRole(role: string): boolean {
  return PROTECTED_USER_ROLES.includes(role as Role);
}

export function assertKnownRole(role: string): asserts role is Role {
  if (!Object.prototype.hasOwnProperty.call(ROLE_LABELS, role)) {
    throw new Error("Rôle invalide.");
  }
}

/**
 * Vérifie qu'un acteur peut attribuer un rôle.
 * Seuls les super-admins peuvent attribuer les rôles protégés.
 * Le rôle DEVELOPER reste réservé au DEVELOPER.
 */
export function assertCanAssignRole(actorRole: string, targetRole: string): void {
  assertKnownRole(targetRole);

  if (targetRole === "DEVELOPER" && actorRole !== "DEVELOPER") {
    throw new Error("Seul le DEVELOPER peut attribuer le rôle DEVELOPER.");
  }

  if (isProtectedUserRole(targetRole) && !isSuperAdminRole(actorRole)) {
    throw new Error("Vous ne pouvez pas attribuer ce rôle.");
  }
}

/**
 * Vérifie qu'un acteur peut modifier, désactiver ou supprimer un compte cible.
 * Un rôle intermédiaire ne peut pas toucher à un compte protégé.
 */
export function assertCanManageTargetUser(actorRole: string, targetRole: string): void {
  if (targetRole === "DEVELOPER" && actorRole !== "DEVELOPER") {
    throw new Error("Seul le DEVELOPER peut gérer un compte DEVELOPER.");
  }

  if (isProtectedUserRole(targetRole) && !isSuperAdminRole(actorRole)) {
    throw new Error("Vous ne pouvez pas gérer ce compte.");
  }
}

export function assertCanAssignPermissions(
  actorRole: string,
  targetRole: string,
  requestedPermissions: string[]
): void {
  if (isSuperAdminRole(actorRole)) return;
  if (requestedPermissions.length === 0) return;

  const allowed = new Set(DEFAULT_ROLE_CAPABILITIES[targetRole as Role] || []);
  const unauthorized = requestedPermissions.filter((permission) => !allowed.has(permission));
  if (unauthorized.length > 0) {
    throw new Error(
      "Les permissions personnalisées doivent rester dans le périmètre du rôle attribué."
    );
  }
}
