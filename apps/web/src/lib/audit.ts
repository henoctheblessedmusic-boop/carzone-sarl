import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/roles";
import { ACTIVITY, type Activity } from "@/lib/permissions";

type AuditActor = {
  id: string;
  role: Role;
  email: string;
  fullName: string;
};

export type LogAuditInput = {
  user: AuditActor;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  activity?: Activity | null;
  details?: string | null;
};

const GARAGE_ACTION_PREFIXES = ["workshop.", "part.", "garage.", "WORKSHOP_", "GARAGE_"];
const GARAGE_ENTITY_TYPES = new Set([
  "WorkshopEntry",
  "WorkOrder",
  "PartItem",
  "GarageCost",
  "GarageSupervision",
  "RentalMaintenance",
]);
const GARAGE_ACTOR_ROLES = new Set(["COMPTA_GARAGE", "CHEF_ATELIER", "ATELIER", "RTA"]);

/**
 * Détermine le périmètre d'une action pour l'audit et les notifications.
 * Une activité explicitement fournie est prioritaire. Les actions atelier qui ne
 * la précisent pas encore sont reconnues par leur préfixe, leur entité ou le rôle
 * de l'acteur (technicien, chef d'atelier, comptable garage).
 */
export function inferAuditActivity(input: {
  action: string;
  entityType: string;
  actorRole: string;
  activity?: Activity | null;
}): Activity | null {
  if (input.activity) return input.activity;
  const action = input.action.trim();
  if (GARAGE_ACTION_PREFIXES.some((prefix) => action.startsWith(prefix))) return ACTIVITY.GARAGE;
  if (GARAGE_ENTITY_TYPES.has(input.entityType)) return ACTIVITY.GARAGE;
  if (GARAGE_ACTOR_ROLES.has(input.actorRole)) return ACTIVITY.GARAGE;
  return null;
}

/**
 * Enregistre une ligne de journal d'audit et publie une notification d'activité.
 * Le compte DEVELOPER est furtif : aucune action n'est journalisée ni notifiée.
 * Une erreur d'écriture ne doit jamais faire échouer l'action métier appelante.
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  if (input.user.role === "DEVELOPER") return;

  const activity = inferAuditActivity({ ...input, actorRole: input.user.role });

  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.user.id,
        actorName: input.user.fullName,
        actorEmail: input.user.email,
        actorRole: input.user.role,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        entityLabel: input.entityLabel || null,
        activity,
        details: input.details || null,
      },
    });

    const isGarage = activity === ACTIVITY.GARAGE;
    const roleLabel = ROLE_LABELS[input.user.role] || input.user.role;
    const entity = [input.entityType, input.entityLabel].filter(Boolean).join(" · ");
    await prisma.adminNotification.create({
      data: {
        type: isGarage ? "ACTIVITY_GARAGE" : "ACTIVITY",
        title: isGarage ? "Nouvelle activité atelier" : "Nouvelle activité application",
        message: `${input.user.fullName} (${roleLabel}) - ${input.action} - ${entity}${input.details ? ` - ${input.details}` : ""}`,
        userId: input.user.id,
        userName: input.user.fullName,
      },
    });
  } catch (error) {
    console.error("Erreur écriture journal/notification d'audit :", error);
  }
}
