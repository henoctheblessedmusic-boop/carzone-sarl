import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { ACTIVITY } from "@/lib/permissions";
import { isGarageScopedRole } from "@/lib/notification-policy";
import { AuditView, type AuditLogItem } from "./AuditView";

const AUDIT_ALLOWED_ROLES = [
  "DEVELOPER",
  "PDG",
  "SG",
  "DG",
  "COMPTA",
  "ASSISTANTE_COMPTABLE",
  "COMPTA_GARAGE",
  "STOCK_GARAGE",
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
  const garageScoped = isGarageScopedRole(user.role);

  // La Comptable Garage et le gestionnaire de stock garage ne voient jamais le showroom.
  // Le filtre est forcé côté serveur, jamais dérivé des paramètres d'URL.
  const scopeFilter = garageScoped ? { activity: ACTIVITY.GARAGE } : {};

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
        isGarageScoped={garageScoped}
        pageSize={AUDIT_PAGE_SIZE}
      />
    </AppShell>
  );
}
