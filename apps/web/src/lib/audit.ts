import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/roles";
import type { Activity } from "@/lib/permissions";

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

/**
 * Enregistre une ligne de journal d'audit. Le compte DEVELOPER est furtif par exigence
 * métier : aucune de ses actions n'est jamais journalisée, quel que soit l'appelant.
 * N'échoue jamais l'action métier appelante : une erreur d'écriture du journal est
 * seulement loguée côté serveur, jamais relancée (le journal est un effet secondaire,
 * pas une condition de succès de l'opération qu'il décrit).
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  if (input.user.role === "DEVELOPER") return;

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
        activity: input.activity || null,
        details: input.details || null,
      },
    });
  } catch (error) {
    console.error("Erreur écriture journal d'audit :", error);
  }
}
