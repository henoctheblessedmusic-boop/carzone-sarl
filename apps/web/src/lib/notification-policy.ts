import type { Role } from "@/lib/roles";

/** Rôles qui reçoivent les notifications de toute l'application. */
export const FULL_ACTIVITY_NOTIFICATION_ROLES: readonly Role[] = [
  "DEVELOPER",
  "PDG",
  "SG",
  "DG",
  "COMPTA",
  "ASSISTANTE_COMPTABLE",
  "ADMIN",
];

/** Rôles qui reçoivent uniquement les notifications du périmètre atelier/GARAGE. */
export const GARAGE_ACTIVITY_NOTIFICATION_ROLES: readonly Role[] = [
  "COMPTA_GARAGE",
  "STOCK",
];

export function canReceiveActivityNotifications(role: string): boolean {
  return (
    (FULL_ACTIVITY_NOTIFICATION_ROLES as readonly string[]).includes(role) ||
    (GARAGE_ACTIVITY_NOTIFICATION_ROLES as readonly string[]).includes(role)
  );
}

export function isFullActivityNotificationRole(role: string): boolean {
  return (FULL_ACTIVITY_NOTIFICATION_ROLES as readonly string[]).includes(role);
}

export function isGarageActivityNotificationRole(role: string): boolean {
  return (GARAGE_ACTIVITY_NOTIFICATION_ROLES as readonly string[]).includes(role);
}

export function isGarageScopedRole(role: string): boolean {
  return (GARAGE_ACTIVITY_NOTIFICATION_ROLES as readonly string[]).includes(role);
}
