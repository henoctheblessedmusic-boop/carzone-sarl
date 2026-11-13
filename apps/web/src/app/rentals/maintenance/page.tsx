import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { formatXof } from "@/lib/format";
import { deleteRentalExpense, recordRentalExpense, updateRentalMaintenanceStatus } from "../actions";
import { RentalActionModals } from "../RentalActionModals";
import { RentalSectionNav } from "../_shared/RentalSectionNav";
import { STATUS_LABEL } from "../_shared/labels";
import {
  RENTAL_ROLES,
  findGarageUsers,
  findMaintenances,
  findRentalCustomers,
  findRentalExpenses,
  findRentalVehicles,
  findRentals,
  findVehicleBrands,
  rentalAccess,
} from "../_shared/data";

export default async function RentalMaintenancePage() {
  const user = await requireUser([...RENTAL_ROLES]);
  const { canManage } = rentalAccess(user.role);

  const [rentals, rentalVehicles, customers, maintenances, rentalExpenses, vehicleBrands, garageUsers] = await Promise.all([
    findRentals(),
    findRentalVehicles(),
    findRentalCustomers(user.role),
    findMaintenances(),
    findRentalExpenses(),
    findVehicleBrands(),
    findGarageUsers(),
  ]);

  const activeRentals = rentals.filter((rental) => rental.status === "ACTIF");
  const availableVehicles = rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "DISPONIBLE");
  const maintenanceCost = maintenances.reduce((sum, item) => sum + item.costXof, 0);
  const expenseCost = rentalExpenses.reduce((sum, item) => sum + item.amountXof, 0);
  const totalExpenseCost = maintenanceCost + expenseCost;
  const ongoingCount = maintenances.filter((item) => item.status === "EN_COURS").length;
  const plannedCount = maintenances.filter((item) => item.status === "PLANIFIE").length;
  const immobilizedCount = rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "MAINTENANCE").length;

  return (
    <AppShell user={user} title="Location - Entretiens">
      <div style={{ display: "grid", gap: "1.2rem" }}>
        <div className="ox-hero-card">
          <div>
            <div className="ox-hero-card-title">Entretien, réparations et passage au garage</div>
            <div className="ox-hero-card-sub">
              Dépenses d&apos;entretien du parc locatif, interventions planifiées et suivi des coûts par véhicule.
            </div>
          </div>
          {!canManage && (
            <span
              style={{
                alignSelf: "center",
                padding: "3px 10px",
                borderRadius: 999,
                border: "1px solid var(--border-strong)",
                background: "var(--surface-soft)",
                fontSize: "0.78rem",
              }}
            >
              Consultation / supervision
            </span>
          )}
        </div>

        <RentalSectionNav current="maintenance" showDrivers={user.role === "GESTIONNAIRE_LOCATION"} />

        {canManage && (
          <RentalActionModals
            rentalVehicles={rentalVehicles}
            availableVehicles={availableVehicles}
            customers={customers}
            brands={vehicleBrands}
            garageUsers={garageUsers}
            activeRentals={activeRentals.map((rental) => ({
              id: rental.id,
              type: rental.type,
              customerName: rental.customer.contactName,
            }))}
            allowed={["maintenance"]}
            title="Enregistrer un entretien"
            description="Planifiez ou enregistrez une intervention, son garage et son coût."
          />
        )}

        <div className="ox-kpi-grid">
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--warning)" }}>
            <div className="ox-kpi-label">Dépenses du parc</div>
            <div className="ox-kpi-value">{formatXof(totalExpenseCost)}</div>
            <div className="ox-kpi-hint">Entretien, carburant et frais simples</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--info)" }}>
            <div className="ox-kpi-label">Interventions</div>
            <div className="ox-kpi-value">{maintenances.length}</div>
            <div className="ox-kpi-hint">Historique complet</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--success)" }}>
            <div className="ox-kpi-label">En cours / planifiées</div>
            <div className="ox-kpi-value">{ongoingCount + plannedCount}</div>
            <div className="ox-kpi-hint">{ongoingCount} en cours · {plannedCount} planifiée(s)</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--purple)" }}>
            <div className="ox-kpi-label">Véhicules immobilisés</div>
            <div className="ox-kpi-value">{immobilizedCount}</div>
            <div className="ox-kpi-hint">Retirés de la location</div>
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
          <div>
            <strong>Suivi des interventions</strong>
            <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
              Planifiez et suivez l&apos;entretien des véhicules de location. Un véhicule planifié ou en cours passe en
              maintenance et n&apos;est plus proposé à la location.
            </p>
          </div>
          {maintenances.length === 0 ? (
            <div style={{ padding: "1.5rem", textAlign: "center", opacity: 0.65, fontSize: "0.86rem" }}>
              Aucune intervention enregistrée pour le parc de location.
            </div>
          ) : (
            <div className="ox-table-wrap">
              <table className="ox-table" style={{ fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    <th>Véhicule</th>
                    <th>Intervention</th>
                    <th>Garage / date</th>
                    <th>Coût</th>
                    <th>Statut</th>
                    <th>Mise à jour</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenances.map((maintenance) => (
                    <tr key={maintenance.id}>
                      <td>{maintenance.vehicle.brand} {maintenance.vehicle.model}{maintenance.vehicle.registrationNumber ? ` (${maintenance.vehicle.registrationNumber})` : ""}</td>
                      <td>{maintenance.type} - {maintenance.description}</td>
                      <td>{maintenance.garageName || "-"}{maintenance.scheduledAt ? ` / ${maintenance.scheduledAt.toISOString().slice(0, 10)}` : ""}</td>
                      <td>{formatXof(maintenance.costXof)}</td>
                      <td>{STATUS_LABEL[maintenance.status] || maintenance.status}</td>
                      <td>
                        {canManage ? (
                          <form action={updateRentalMaintenanceStatus} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input type="hidden" name="id" value={maintenance.id} />
                            <select name="status" className="ox-select" style={{ height: 30, fontSize: "0.78rem" }} defaultValue={maintenance.status}>
                              <option value="PLANIFIE">Planifié</option>
                              <option value="EN_COURS">En cours</option>
                              <option value="TERMINE">Terminé</option>
                              <option value="ANNULE">Annulé</option>
                            </select>
                            <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm">Mettre à jour</button>
                          </form>
                        ) : (
                          <span style={{ opacity: 0.65, fontSize: "0.78rem" }}>Consultation comptable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
          <div>
            <strong>Dépenses simples du parc</strong>
            <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
              Carburant, petits frais et justificatifs. Ces dépenses entrent dans la comptabilité location et dans les dépenses générales.
            </p>
          </div>
          {canManage && (
            <form action={recordRentalExpense} encType="multipart/form-data" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8, alignItems: "end" }}>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Véhicule
                <select name="vehicleId" className="ox-select" required defaultValue="">
                  <option value="" disabled>Sélectionner</option>
                  {rentalVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model}{vehicle.registrationNumber ? ` (${vehicle.registrationNumber})` : ""}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Type
                <select name="type" className="ox-select" defaultValue="CARBURANT">
                  <option value="CARBURANT">Carburant</option>
                  <option value="AUTRE">Autre dépense</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Montant (FCFA)
                <input name="amountXof" type="number" min="1" className="ox-input" required placeholder="Ex. 25000" />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Date
                <input name="expenseDate" type="date" className="ox-input" defaultValue={new Date().toISOString().slice(0, 10)} required />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Description
                <input name="description" className="ox-input" placeholder="Ex. Plein du véhicule" />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
                Reçu (image ou PDF)
                <input name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="ox-input" />
              </label>
              <button type="submit" className="ox-btn ox-btn-primary">Enregistrer la dépense</button>
            </form>
          )}
          {rentalExpenses.length === 0 ? (
            <div style={{ padding: "1rem", textAlign: "center", opacity: 0.65, fontSize: "0.86rem" }}>
              Aucune dépense simple enregistrée.
            </div>
          ) : (
            <div className="ox-table-wrap">
              <table className="ox-table" style={{ fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Véhicule</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Reçu</th>
                    <th>Montant</th>
                    {canManage ? <th /> : null}
                  </tr>
                </thead>
                <tbody>
                  {rentalExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.expenseDate.toLocaleDateString("fr-BJ")}</td>
                      <td>{expense.vehicle.brand} {expense.vehicle.model}{expense.vehicle.registrationNumber ? ` (${expense.vehicle.registrationNumber})` : ""}</td>
                      <td>{expense.type === "CARBURANT" ? "Carburant" : "Autre"}</td>
                      <td>{expense.description || "-"}</td>
                      <td>
                        {expense.receiptFileName ? (
                          <a href={`/api/rental-expenses/${expense.id}/receipt`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--info-fg)", textDecoration: "underline" }}>
                            Voir le reçu
                          </a>
                        ) : "-"}
                      </td>
                      <td>{formatXof(expense.amountXof)}</td>
                      {canManage ? (
                        <td>
                          <form action={deleteRentalExpense}>
                            <input type="hidden" name="id" value={expense.id} />
                            <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm">Supprimer</button>
                          </form>
                        </td>
                      ) : null}
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
