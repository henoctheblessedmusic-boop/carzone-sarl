import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { formatXof } from "@/lib/format";
import { recordDriverPayment } from "../actions";
import { RentalSectionNav } from "../_shared/RentalSectionNav";
import { findDriverPayments, findRentalDrivers } from "../_shared/data";

export default async function RentalDriversPage() {
  const user = await requireUser(["GESTIONNAIRE_LOCATION"]);
  const [drivers, payments] = await Promise.all([findRentalDrivers(), findDriverPayments()]);
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const paidThisMonth = payments
    .filter((payment) => payment.period === currentPeriod)
    .reduce((sum, payment) => sum + payment.amountXof, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amountXof, 0);
  const paidDriverIds = new Set(payments.filter((payment) => payment.period === currentPeriod).map((payment) => payment.employeeId));

  return (
    <AppShell user={user} title="Location - Chauffeurs">
      <div style={{ display: "grid", gap: "1.2rem" }}>
        <div className="ox-hero-card">
          <div>
            <div className="ox-hero-card-title">Chauffeurs de la location</div>
            <div className="ox-hero-card-sub">
              Sélectionnez un chauffeur salarié, enregistrez son paiement et partagez automatiquement l&apos;information avec les RH et la comptabilité.
            </div>
          </div>
          <span style={{ alignSelf: "center", padding: "3px 10px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "var(--surface-soft)", fontSize: "0.78rem" }}>
            Partage avec les RH
          </span>
        </div>

        <RentalSectionNav current="drivers" showDrivers />

        <div className="ox-kpi-grid">
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--info)" }}>
            <div className="ox-kpi-label">Chauffeurs déclarés</div>
            <div className="ox-kpi-value">{drivers.length}</div>
            <div className="ox-kpi-hint">Salariés déclarés chauffeurs par les RH</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--success)" }}>
            <div className="ox-kpi-label">Payé ce mois</div>
            <div className="ox-kpi-value">{formatXof(paidThisMonth)}</div>
            <div className="ox-kpi-hint">{currentPeriod}</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--purple)" }}>
            <div className="ox-kpi-label">Total payé</div>
            <div className="ox-kpi-value">{formatXof(totalPaid)}</div>
            <div className="ox-kpi-hint">Historique des paiements chauffeurs</div>
          </div>
        </div>

        {drivers.length === 0 ? (
          <div className="ox-glass" style={{ padding: "1.2rem", display: "grid", gap: 6 }}>
            <strong>Aucun chauffeur déclaré</strong>
            <p style={{ margin: 0, opacity: 0.75, fontSize: "0.86rem" }}>
              Les RH doivent créer le salarié avec le poste « Chauffeur » ou cocher la qualité de chauffeur. Le chauffeur apparaîtra ensuite ici.
            </p>
          </div>
        ) : (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
            <div>
              <strong>Enregistrer un paiement chauffeur</strong>
              <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
                Un seul paiement par chauffeur et par mois. Le paiement crée aussi la dépense générale et prévient les RH.
              </p>
            </div>
            <form action={recordDriverPayment} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8, alignItems: "end" }}>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Chauffeur
                <select name="employeeId" className="ox-select" required defaultValue="">
                  <option value="" disabled>Sélectionner</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName} ({driver.employeeNumber})
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Période
                <input name="period" type="month" className="ox-input" defaultValue={currentPeriod} required />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Montant (FCFA)
                <input name="amountXof" type="number" min="1" className="ox-input" required placeholder="Ex. 150000" />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Moyen
                <select name="method" className="ox-select" defaultValue="ESPECES">
                  <option value="ESPECES">Espèces</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="VIREMENT">Virement</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Référence
                <input name="reference" className="ox-input" placeholder="Optionnel" />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Note
                <input name="notes" className="ox-input" placeholder="Optionnel" />
              </label>
              <button type="submit" className="ox-btn ox-btn-primary">Payer le chauffeur</button>
            </form>
            <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>
              Déjà payés ce mois : {paidDriverIds.size} / {drivers.length}
            </div>
          </div>
        )}

        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
          <div>
            <strong>Historique des paiements chauffeurs</strong>
            <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
              Chaque paiement est rapproché d&apos;une dépense générale et signalé aux RH.
            </p>
          </div>
          {payments.length === 0 ? (
            <div style={{ padding: "1rem", textAlign: "center", opacity: 0.65, fontSize: "0.86rem" }}>Aucun paiement chauffeur enregistré.</div>
          ) : (
            <div className="ox-table-wrap">
              <table className="ox-table" style={{ fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    <th>Période</th>
                    <th>Chauffeur</th>
                    <th>Montant</th>
                    <th>Moyen</th>
                    <th>Source</th>
                    <th>Dépense générale</th>
                    <th>Payé par</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.period}</td>
                      <td>{payment.employee.firstName} {payment.employee.lastName} ({payment.employee.employeeNumber})</td>
                      <td>{formatXof(payment.amountXof)}</td>
                      <td>{payment.method}</td>
                      <td>{payment.source === "RH" ? "RH" : "Location"}</td>
                      <td>{payment.expense?.expenseNumber || "-"}</td>
                      <td>{payment.createdByName || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
