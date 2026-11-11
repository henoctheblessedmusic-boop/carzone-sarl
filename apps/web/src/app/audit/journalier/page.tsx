import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { ACTIVITY } from "@/lib/permissions";
import { isGarageScopedRole } from "@/lib/notification-policy";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { DailyAuditPrintButton } from "./DailyAuditPrintButton";

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

function todayInCotonou(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Porto-Novo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeStyle: "medium",
    timeZone: "Africa/Porto-Novo",
  }).format(date);
}

function formatLongDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeZone: "Africa/Porto-Novo",
  }).format(new Date(`${date}T12:00:00+01:00`));
}

export default async function DailyAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireUser([...AUDIT_ALLOWED_ROLES]);
  const params = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date || "") ? params.date! : todayInCotonou();
  const garageScoped = isGarageScopedRole(user.role);

  const start = new Date(`${date}T00:00:00+01:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const scopeFilter = garageScoped ? { activity: ACTIVITY.GARAGE } : {};

  const logs = await prisma.auditLog.findMany({
    where: {
      ...scopeFilter,
      actorRole: { not: "DEVELOPER" },
      createdAt: { gte: start, lt: end },
    },
    orderBy: { createdAt: "asc" },
  });

  const actorCounts = new Map<string, number>();
  const actionCounts = new Map<string, number>();
  for (const log of logs) {
    actorCounts.set(log.actorName, (actorCounts.get(log.actorName) || 0) + 1);
    actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
  }
  const garageCount = logs.filter((log) => log.activity === ACTIVITY.GARAGE).length;

  const previousDate = new Date(start.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const nextDate = new Date(end.getTime()).toISOString().slice(0, 10);

  return (
    <AppShell user={user} title="Rapport journalier d'audit">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          html, body { background: var(--surface) !important; color: var(--surface) !important; }
          .ox-aside, .ox-topbar, .ox-drawer-backdrop, .audit-print-hidden { display: none !important; }
          .ox-main { padding: 0 !important; }
          .audit-daily-sheet { box-shadow: none !important; border: none !important; background: var(--border) !important; color: var(--border) !important; }
          .audit-daily-sheet table { color: var(--text-on-accent) !important; }
          .audit-daily-sheet th, .audit-daily-sheet td { border-color: var(--text-muted) !important; }
        }
      `}</style>

      <div style={{ display: "grid", gap: "1rem" }} className="audit-daily-sheet">
        <div className="ox-glass audit-print-hidden" style={{ padding: "1rem 1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 800 }}>Rapport journalier d&apos;audit</div>
            <div style={{ opacity: 0.68, fontSize: "0.82rem", marginTop: 2 }}>
              Toutes les activités enregistrées pour la journée sélectionnée.
              {garageScoped ? " Périmètre limité au garage et à l'atelier." : " Périmètre consolidé application et garage."}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <a href="/audit" className="ox-btn ox-btn-ghost ox-btn-sm">Journal complet</a>
            <DailyAuditPrintButton />
          </div>
        </div>

        <form method="get" className="ox-glass audit-print-hidden" style={{ padding: "0.9rem 1.2rem", display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
          <label style={{ display: "grid", gap: 4, fontSize: "0.8rem" }}>
            Journée
            <input type="date" name="date" defaultValue={date} className="ox-input" style={{ height: 36 }} />
          </label>
          <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm">Afficher</button>
          <a href={`/audit/journalier?date=${previousDate}`} className="ox-btn ox-btn-ghost ox-btn-sm">Jour précédent</a>
          <a href={`/audit/journalier?date=${nextDate}`} className="ox-btn ox-btn-ghost ox-btn-sm">Jour suivant</a>
        </form>

        <div className="ox-glass" style={{ padding: "1.2rem", display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Journal d&apos;audit du {formatLongDate(date)}</h1>
              <div style={{ opacity: 0.65, fontSize: "0.8rem", marginTop: 3 }}>
                CARZONE SARL · Document interne · Généré par {user.fullName}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "0.8rem" }}>
              <div><strong>{logs.length}</strong> action(s)</div>
              <div><strong>{actorCounts.size}</strong> acteur(s)</div>
              <div><strong>{garageCount}</strong> action(s) garage</div>
            </div>
          </div>

          {logs.length === 0 ? (
            <p style={{ margin: "1rem 0", opacity: 0.65, textAlign: "center" }}>Aucune activité enregistrée pour cette journée.</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 8, fontSize: "0.8rem" }}>
                <div style={{ border: "1px solid var(--ice-border)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ opacity: 0.65 }}>Actions par acteur</div>
                  {Array.from(actorCounts.entries()).sort((a, b) => b[1] - a[1]).map(([actor, count]) => (
                    <div key={actor} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 3 }}>
                      <span>{actor}</span><strong>{count}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ border: "1px solid var(--ice-border)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ opacity: 0.65 }}>Actions les plus fréquentes</div>
                  {Array.from(actionCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([action, count]) => (
                    <div key={action} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 3 }}>
                      <span>{action}</span><strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ox-table-wrap">
                <table className="ox-table" style={{ fontSize: "0.78rem" }}>
                  <thead>
                    <tr>
                      <th>Heure</th>
                      <th>Acteur</th>
                      <th>Rôle</th>
                      <th>Action</th>
                      <th>Entité</th>
                      <th>Périmètre</th>
                      <th>Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ whiteSpace: "nowrap" }}>{formatTime(log.createdAt)}</td>
                        <td>{log.actorName}</td>
                        <td>{ROLE_LABELS[log.actorRole as Role] || log.actorRole}</td>
                        <td>{log.action}</td>
                        <td>{log.entityType}{log.entityLabel ? ` · ${log.entityLabel}` : ""}</td>
                        <td>{log.activity || "Application"}</td>
                        <td style={{ opacity: 0.75 }}>{log.details || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
