import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { ACTIVITY } from "@/lib/permissions";
import { AuditView, type AuditLogItem } from "./AuditView";

const AUDIT_ALLOWED_ROLES = [
  "DEVELOPER",
  "PDG",
  "SG",
  "DG",
  "COMPTA",
  "COMPTA_GARAGE",
  "ADMIN",
] as const;

const AUDIT_PAGE_SIZE = 200;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; action?: string; actorRole?: string }>;
}) {
  const user = await requireUser([...AUDIT_ALLOWED_ROLES]);
  const params = await searchParams;

  // La Comptable Garage ne voit jamais le périmètre showroom. Ce filtre d'activité
  // est forcé côté serveur, jamais dérivé des paramètres d'URL envoyés par le client.
  const scopeFilter = user.role === "COMPTA_GARAGE" ? { activity: ACTIVITY.GARAGE } : {};

  const rawLogs = await prisma.auditLog.findMany({
    where: {
      ...scopeFilter,
      // Garde défensive : aucune ligne DEVELOPER ne doit jamais apparaître, même si
      // l'exigence "compte invisible" venait un jour à être contournée côté écriture.
      actorRole: { not: "DEVELOPER" },
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.action ? { action: params.action } : {}),
      ...(params.actorRole ? { actorRole: params.actorRole } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: AUDIT_PAGE_SIZE,
  });

  const [entityTypes, actions, actorRoles] = await Promise.all([
    prisma.auditLog
      .findMany({ where: scopeFilter, select: { entityType: true }, distinct: ["entityType"] })
      .then((rows) => rows.map((r) => r.entityType).sort()),
    prisma.auditLog
      .findMany({ where: scopeFilter, select: { action: true }, distinct: ["action"] })
      .then((rows) => rows.map((r) => r.action).sort()),
    prisma.auditLog
      .findMany({
        where: { ...scopeFilter, actorRole: { not: "DEVELOPER" } },
        select: { actorRole: true },
        distinct: ["actorRole"],
      })
      .then((rows) => rows.map((r) => r.actorRole).sort()),
  ]);

  const logs: AuditLogItem[] = rawLogs.map((l) => ({
    id: l.id,
    actorName: l.actorName,
    actorRole: l.actorRole,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    entityLabel: l.entityLabel,
    activity: l.activity,
    details: l.details,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <AppShell user={user} titleKey="audit">
      <AuditView
        logs={logs}
        entityTypes={entityTypes}
        actions={actions}
        actorRoles={actorRoles}
        filters={{
          entityType: params.entityType || "",
          action: params.action || "",
          actorRole: params.actorRole || "",
        }}
        isGarageScoped={user.role === "COMPTA_GARAGE"}
        pageSize={AUDIT_PAGE_SIZE}
      />
    </AppShell>
  );
}
