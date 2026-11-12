import { formatXof } from "@/lib/format";
import { DashboardAutoRefresh } from "@/components/DashboardAutoRefresh";

export type RentalAccountingValues = {
  totalReceived: number;
  receivedThisMonth: number;
  totalBalance: number;
  maintenanceCost: number;
  netRentalRevenue: number;
};

/**
 * Carte partagée par le tableau de bord location, la supervision direction
 * et la page Contrats. Les valeurs sont calculées côté serveur.
 */
export function RentalAccountingCard({
  values,
  title = "Comptabilité de la location en temps réel",
}: {
  values: RentalAccountingValues;
  title?: string;
}) {
  return (
    <section className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }} aria-label={title}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div>
          <strong>{title}</strong>
          <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
            Recettes réellement encaissées, reste à recouvrer et coût d&apos;entretien du parc de location.
          </p>
        </div>
        <span style={{ fontSize: "0.75rem", opacity: 0.65 }}>Hors cautions - données à jour à chaque encaissement</span>
        <DashboardAutoRefresh />
      </div>
      <div className="ox-kpi-grid">
        <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--success)" }}>
          <div className="ox-kpi-label">Recettes encaissées</div>
          <div className="ox-kpi-value">{formatXof(values.totalReceived)}</div>
          <div className="ox-kpi-hint">Total réel des loyers encaissés</div>
        </div>
        <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--info)" }}>
          <div className="ox-kpi-label">Encaissé ce mois</div>
          <div className="ox-kpi-value">{formatXof(values.receivedThisMonth)}</div>
          <div className="ox-kpi-hint">Mois en cours</div>
        </div>
        <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--warning)" }}>
          <div className="ox-kpi-label">Reste à encaisser</div>
          <div className="ox-kpi-value">{formatXof(values.totalBalance)}</div>
          <div className="ox-kpi-hint">Sur les contrats en cours</div>
        </div>
        <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--warning)" }}>
          <div className="ox-kpi-label">Entretien &amp; garage</div>
          <div className="ox-kpi-value">{formatXof(values.maintenanceCost)}</div>
          <div className="ox-kpi-hint">Charges d&apos;entretien du parc</div>
        </div>
        <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--purple)" }}>
          <div className="ox-kpi-label">Bénéfice net location</div>
          <div className="ox-kpi-value">{formatXof(values.netRentalRevenue)}</div>
          <div className="ox-kpi-hint">Recettes moins entretien</div>
        </div>
      </div>
    </section>
  );
}
