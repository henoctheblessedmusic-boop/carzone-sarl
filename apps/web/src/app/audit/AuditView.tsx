export type AuditLogItem = {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  activity: string | null;
  details: string | null;
  createdAt: string;
};

type Filters = {
  entityType: string;
  action: string;
  actorRole: string;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Africa/Porto-Novo",
  });
}

export function AuditView({
  logs,
  entityTypes,
  actions,
  actorRoles,
  filters,
  isGarageScoped,
  pageSize,
}: {
  logs: AuditLogItem[];
  entityTypes: string[];
  actions: string[];
  actorRoles: string[];
  filters: Filters;
  isGarageScoped: boolean;
  pageSize: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
          Journal consolidé des activités. Le rapport journalier regroupe les actions par journée.
        </p>
        <a href="/audit/journalier" style={{ fontWeight: 700 }}>
          Ouvrir le rapport journalier
        </a>
      </div>

      {isGarageScoped && (
        <p style={{ fontSize: 13, color: "#9ca3af" }}>
          Périmètre garage : seules les actions liées à l'atelier (GARAGE) sont affichées.
        </p>
      )}

      <form
        method="get"
        style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          Type d'entité
          <select name="entityType" defaultValue={filters.entityType}>
            <option value="">Tous</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          Action
          <select name="action" defaultValue={filters.action}>
            <option value="">Toutes</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          Rôle de l'acteur
          <select name="actorRole" defaultValue={filters.actorRole}>
            <option value="">Tous</option>
            {actorRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Filtrer</button>
        {(filters.entityType || filters.action || filters.actorRole) && (
          <a href="/audit">Réinitialiser</a>
        )}
      </form>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #374151" }}>
              <th style={{ padding: "8px 12px" }}>Date</th>
              <th style={{ padding: "8px 12px" }}>Acteur</th>
              <th style={{ padding: "8px 12px" }}>Action</th>
              <th style={{ padding: "8px 12px" }}>Entité</th>
              <th style={{ padding: "8px 12px" }}>Périmètre</th>
              <th style={{ padding: "8px 12px" }}>Détails</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #1f2937" }}>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                  {formatDateTime(log.createdAt)}
                </td>
                <td style={{ padding: "8px 12px" }}>
                  {log.actorName} <span style={{ color: "#9ca3af" }}>({log.actorRole})</span>
                </td>
                <td style={{ padding: "8px 12px" }}>{log.action}</td>
                <td style={{ padding: "8px 12px" }}>
                  {log.entityType}
                  {log.entityLabel ? ` · ${log.entityLabel}` : ""}
                </td>
                <td style={{ padding: "8px 12px" }}>{log.activity || "-"}</td>
                <td style={{ padding: "8px 12px", color: "#9ca3af" }}>{log.details || "-"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "16px 12px", textAlign: "center", color: "#9ca3af" }}>
                  Aucune entrée de journal pour ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {logs.length === pageSize && (
        <p style={{ fontSize: 12, color: "#9ca3af" }}>
          Affichage limité aux {pageSize} entrées les plus récentes. Affinez les filtres pour voir
          un sous-ensemble précis.
        </p>
      )}
    </div>
  );
}
