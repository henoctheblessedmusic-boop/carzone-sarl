import type { Role } from "@/lib/roles";

/** Les deux périmètres comptables distincts de CARZONE SARL. */
export const ACTIVITY = {
  SHOWROOM: "SHOWROOM",
  GARAGE: "GARAGE",
} as const;

export type Activity = (typeof ACTIVITY)[keyof typeof ACTIVITY];

const SUPER_ADMIN_ROLES: readonly Role[] = ["DEVELOPER", "DG", "PDG", "SG"];

/** Rôles direction / comptabilité principale ayant accès aux deux périmètres. */
const FULL_SCOPE_ROLES: readonly Role[] = [
  "DEVELOPER",
  "DG",
  "PDG",
  "SG",
  "ADV",
  "RF",
  "COMPTA",
  "ADMIN",
];

/** True si le rôle est un super-administrateur système (bypass total des gardes). */
export function estSuperAdmin(role: Role): boolean {
  return SUPER_ADMIN_ROLES.includes(role);
}

/**
 * Périmètre(s) d'activité accessibles pour un rôle donné.
 * - COMPTA_GARAGE : uniquement GARAGE (comptabilité atelier).
 * - Direction / COMPTA / ADMIN : les deux périmètres (consolidé).
 * - Autres rôles existants : comportement historique, pas de restriction d'activité.
 */
export function activityScopeForRole(role: Role): Activity[] | "ALL" {
  if (role === "COMPTA_GARAGE") return [ACTIVITY.GARAGE];
  if (FULL_SCOPE_ROLES.includes(role)) return "ALL";
  return "ALL";
}

/** Un rôle voit-il les documents d'une activité donnée ? */
export function peutVoirDocuments(role: Role, activity: Activity): boolean {
  const scope = activityScopeForRole(role);
  if (scope === "ALL") return true;
  return scope.includes(activity);
}

/**
 * Un rôle peut-il créer/annuler un BL interne pour une activité donnée ?
 * - BL GARAGE : COMPTA_GARAGE, COMPTA, ou super-admin.
 * - BL SHOWROOM : COMPTA ou super-admin uniquement (COMPTA_GARAGE exclu).
 */
export function peutGererBL(role: Role, activity: Activity): boolean {
  if (estSuperAdmin(role)) return true;
  if (activity === ACTIVITY.GARAGE) {
    return role === "COMPTA_GARAGE" || role === "COMPTA";
  }
  return role === "COMPTA";
}

/**
 * Périmètre d'activité du formulaire de devis proforma selon le rôle connecté.
 * COMPTA_GARAGE est le seul rôle à opérer en GARAGE ; tous les autres (y compris
 * la direction) restent sur le périmètre SHOWROOM historique, comme pour
 * `createProformaWithLines`.
 */
export function quoteScopeForRole(role: Role): Activity {
  return role === "COMPTA_GARAGE" ? ACTIVITY.GARAGE : ACTIVITY.SHOWROOM;
}

/**
 * Filtre Prisma à appliquer sur `Customer` pour la liste de clients proposée dans
 * un contexte SHOWROOM/GARAGE (ex : sélecteur client du formulaire de devis) :
 * - COMPTA_GARAGE : uniquement les clients du périmètre garage.
 * - Direction (super-admin) : aucun filtre, comportement historique inchangé.
 * - Tous les autres rôles : uniquement les clients du périmètre showroom.
 */
export function customerScopeFilterForRole(
  role: Role
): { scopeGarage: true } | { scopeShowroom: true } | undefined {
  if (role === "COMPTA_GARAGE") return { scopeGarage: true };
  if (estSuperAdmin(role)) return undefined;
  return { scopeShowroom: true };
}
