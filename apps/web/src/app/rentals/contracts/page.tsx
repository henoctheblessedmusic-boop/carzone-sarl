import { AppShell } from "@/components/AppShell";
import { DashboardAutoRefresh } from "@/components/DashboardAutoRefresh";
import { requireUser } from "@/lib/require-user";
import { formatXof } from "@/lib/format";
import { rentalContractReference, rentalDaysBetween } from "@/lib/rental-contract";
import { recordRentalPayment, returnRental, updateRentalRequestStatus } from "../actions";
import { RentalActionModals } from "../RentalActionModals";
import { RentalContractActions } from "../RentalContractActions";
import { RentalSectionNav } from "../_shared/RentalSectionNav";
import { STATUS_LABEL } from "../_shared/labels";
import {
  RENTAL_ROLES,
  computeRentalFinancials,
  expectedContractValue,
  findGarageUsers,
  findMaintenances,
  findRentalCustomers,
  findRentalRequests,
  findRentalVehicles,
  findRentals,
  findVehicleBrands,
  rentalAccess,
} from "../_shared/data";

export default async function RentalContractsPage() {
  const user = await requireUser([...RENTAL_ROLES]);
  const { canManage, canFinance } = rentalAccess(user.role);
  const now = new Date();

  const [rentals, rentalVehicles, customers, maintenances, rentalRequests, vehicleBrands, garageUsers] =
    await Promise.all([
      findRentals(),
      findRentalVehicles(),
      findRentalCustomers(user.role),
      findMaintenances(),
      findRentalRequests(),
      findVehicleBrands(),
      findGarageUsers(),
    ]);

  const activeRentals = rentals.filter((rental) => rental.status === "ACTIF");
  const availableVehicles = rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "DISPONIBLE");
  const {
    paidByRental,
    totalReceived,
    receivedThisMonth,
    totalBalance,
    maintenanceCost,
    netRentalRevenue,
  } = computeRentalFinancials(rentals, maintenances, now);

  return (
    <AppShell user={user} title="Location - Contrats & proformas">
      <div style={{ display: "grid", gap: "1.2rem" }}>
        <div className="ox-hero-card">
          <div>
            <div className="ox-hero-card-title">Contrats de location et proformas</div>
            <div className="ox-hero-card-sub">
              Création, suivi, encaissements, retours et signatures des contrats LCD, LLD et LOA.
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

        <RentalSectionNav current="contracts" />

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
            allowed={["contract"]}
            title="Nouveau contrat"
            description="Démarrez une location client : véhicule, dates, tarifs et caution."
          />
        )}

        <div className="ox-kpi-grid">
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--warning)" }}>
            <div className="ox-kpi-label">Locations actives</div>
            <div className="ox-kpi-value">{activeRentals.length}</div>
            <div className="ox-kpi-hint">Contrats en cours</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--purple)" }}>
            <div className="ox-kpi-label">Contrats total</div>
            <div className="ox-kpi-value">{rentals.length}</div>
            <div className="ox-kpi-hint">Historique</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--info)" }}>
            <div className="ox-kpi-label">Véhicules disponibles</div>
            <div className="ox-kpi-value">{availableVehicles.length}</div>
            <div className="ox-kpi-hint">Prêts à être contractualisés</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--success)" }}>
            <div className="ox-kpi-label">Demandes vitrine</div>
            <div className="ox-kpi-value">{rentalRequests.length}</div>
            <div className="ox-kpi-hint">Dernières demandes reçues</div>
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div>
              <strong>Comptabilité de la location en temps réel</strong>
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
              <div className="ox-kpi-value">{formatXof(totalReceived)}</div>
              <div className="ox-kpi-hint">Total réel des loyers encaissés</div>
            </div>
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--info)" }}>
              <div className="ox-kpi-label">Encaissé ce mois</div>
              <div className="ox-kpi-value">{formatXof(receivedThisMonth)}</div>
              <div className="ox-kpi-hint">Mois en cours</div>
            </div>
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--warning)" }}>
              <div className="ox-kpi-label">Reste à encaisser</div>
              <div className="ox-kpi-value">{formatXof(totalBalance)}</div>
              <div className="ox-kpi-hint">Sur les contrats en cours</div>
            </div>
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--warning)" }}>
              <div className="ox-kpi-label">Entretien & garage</div>
              <div className="ox-kpi-value">{formatXof(maintenanceCost)}</div>
              <div className="ox-kpi-hint">Charges d&apos;entretien du parc</div>
            </div>
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--purple)" }}>
              <div className="ox-kpi-label">Bénéfice net location</div>
              <div className="ox-kpi-value">{formatXof(netRentalRevenue)}</div>
              <div className="ox-kpi-hint">Recettes moins entretien</div>
            </div>
          </div>
        </div>

        {(canManage || canFinance) && rentalRequests.length > 0 && (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
            <div>
              <strong>Demandes de location reçues depuis la vitrine</strong>
              <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
                Demandes de visite showroom ou de contrat à distance. L&apos;acompte de réservation correspond à 50 % du montant estimé.
              </p>
            </div>
            <div className="ox-table-wrap">
              <table className="ox-table" style={{ fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Client</th>
                    <th>Véhicule</th>
                    <th>Période</th>
                    <th>Formule</th>
                    <th>Estimation / Acompte</th>
                    <th>Statut</th>
                    <th>Suivi</th>
                  </tr>
                </thead>
                <tbody>
                  {rentalRequests.map((request) => (
                    <tr key={request.id}>
                      <td style={{ fontFamily: "monospace" }}>LOC-{request.id.slice(-8).toUpperCase()}</td>
                      <td>{request.customerName}<br /><span style={{ opacity: 0.65 }}>{request.phone}</span></td>
                      <td>{request.vehicle.brand} {request.vehicle.model}{request.vehicle.registrationNumber ? ` (${request.vehicle.registrationNumber})` : ""}</td>
                      <td>{request.startDate.toISOString().slice(0, 10)}<br /><span style={{ opacity: 0.65 }}>{request.days} jour(s)</span></td>
                      <td>{request.mode === "CONTRAT_A_DISTANCE" ? "Contrat à distance" : "Visite showroom"}</td>
                      <td>{request.estimatedTotalXof ? formatXof(request.estimatedTotalXof) : "Sur devis"}<br /><span style={{ opacity: 0.65 }}>Acompte : {request.depositRequiredXof ? formatXof(request.depositRequiredXof) : "-"}</span></td>
                      <td>{STATUS_LABEL[request.status] || request.status}</td>
                      <td>
                        {canManage ? (
                          <form action={updateRentalRequestStatus} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <input type="hidden" name="id" value={request.id} />
                            <select name="status" className="ox-select" style={{ height: 30, fontSize: "0.76rem" }} defaultValue={request.status}>
                              <option value="NOUVELLE">Nouvelle</option>
                              <option value="CONTACTEE">Contactée</option>
                              <option value="CONFIRMEE">Confirmée</option>
                              <option value="ANNULEE">Annulée</option>
                            </select>
                            <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm">Mettre à jour</button>
                          </form>
                        ) : (
                          <span style={{ opacity: 0.6 }}>Lecture</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="ox-table-wrap">
          <table className="ox-table" style={{ fontSize: "0.84rem" }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Client</th>
                <th>Véhicule</th>
                <th>Début</th>
                <th>Fin / Retour</th>
                <th>Durée</th>
                <th>Tarif / jour</th>
                <th>Total contrat</th>
                <th>Caution</th>
                <th>Encaissé</th>
                <th>Solde</th>
                <th>Statut</th>
                <th>Contrat</th>
                {(canManage || canFinance) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={canManage || canFinance ? 14 : 13} style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                    Aucun contrat de location enregistré.
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => {
                  const paid = paidByRental.get(rental.id) || 0;
                  const expectedTotal = expectedContractValue(rental);
                  const balance = Math.max(0, expectedTotal - paid);
                  const days = rental.days || rentalDaysBetween(rental.startDate, rental.returnedAt || rental.endDate);
                  const dailyRate = rental.dailyXof || rental.vehicle.rentalDailyXof;
                  return (
                  <tr key={rental.id}>
                    <td>{rental.type}</td>
                    <td>{rental.customer.contactName}</td>
                    <td>
                      <a href={`/rentals/${rental.vehicle.id}/fiche-technique`} style={{ color: "var(--accent-fg)", textDecoration: "underline" }}>
                        {rental.vehicle.brand} {rental.vehicle.model}{rental.vehicle.registrationNumber ? ` (${rental.vehicle.registrationNumber})` : ""}
                      </a>
                    </td>
                    <td>{rental.startDate.toISOString().slice(0, 10)}</td>
                    <td>
                      {rental.returnedAt
                        ? rental.returnedAt.toISOString().slice(0, 10)
                        : rental.endDate
                          ? rental.endDate.toISOString().slice(0, 10)
                          : "-"}
                    </td>
                    <td>{days ? `${days} j` : "-"}</td>
                    <td>{dailyRate ? formatXof(dailyRate) : "-"}</td>
                    <td>{expectedTotal ? formatXof(expectedTotal) : "-"}</td>
                    <td>{rental.depositXof ? formatXof(rental.depositXof) : "-"}</td>
                    <td>{formatXof(paid)}</td>
                    <td style={{ color: balance > 0 ? "var(--warn)" : "inherit", fontWeight: balance > 0 ? 700 : 400 }}>{formatXof(balance)}</td>
                    <td>{STATUS_LABEL[rental.status] || rental.status}</td>
                    <td>
                      <a className="ox-btn ox-btn-ghost ox-btn-sm" href={`/rentals/${rental.id}/contrat`} title={rentalContractReference(rental.id)}>
                        Voir / imprimer
                      </a>
                    </td>
                    {(canManage || canFinance) && (
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {canManage && rental.status === "ACTIF" && (
                            <form action={returnRental} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <input type="hidden" name="id" value={rental.id} />
                              <input
                                name="returnCondition"
                                placeholder="État au retour"
                                className="ox-input"
                                style={{ height: 30, fontSize: "0.78rem", minWidth: 120 }}
                              />
                              <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm">Retour</button>
                            </form>
                          )}
                          {canFinance && (
                            <form action={recordRentalPayment} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                              <input type="hidden" name="rentalId" value={rental.id} />
                              <input name="amountXof" type="number" min="1" placeholder="Montant" className="ox-input" style={{ height: 30, width: 95, fontSize: "0.78rem" }} required />
                              <select name="method" className="ox-select" style={{ height: 30, width: 100, fontSize: "0.78rem" }} defaultValue="VIREMENT">
                                <option value="VIREMENT">Virement</option>
                                <option value="CHEQUE">Chèque</option>
                                <option value="ESPECES">Espèces</option>
                                <option value="MOBILE_MONEY">Mobile Money</option>
                              </select>
                              <input name="reference" placeholder="Réf." className="ox-input" style={{ height: 30, width: 80, fontSize: "0.78rem" }} />
                              <input name="paidAt" type="date" className="ox-input" style={{ height: 30, width: 120, fontSize: "0.78rem" }} defaultValue={now.toISOString().slice(0, 10)} />
                              <button type="submit" className="ox-btn ox-btn-primary ox-btn-sm">Encaisser</button>
                            </form>
                          )}
                          {canFinance && paid > 0 && (
                            <span style={{ fontSize: "0.72rem", opacity: 0.65 }}>
                              {rental.payments.length} encaissement(s) enregistré(s)
                            </span>
                          )}
                          {canManage && (
                            <RentalContractActions
                              rental={{
                                id: rental.id,
                                type: rental.type,
                                status: rental.status,
                                startDate: rental.startDate.toISOString().slice(0, 10),
                                endDate: rental.endDate ? rental.endDate.toISOString().slice(0, 10) : null,
                                dailyXof: rental.dailyXof,
                                monthlyXof: rental.monthlyXof,
                                depositXof: rental.depositXof,
                                departureCondition: rental.departureCondition,
                                notes: rental.notes,
                                paymentCount: rental.payments.length,
                              }}
                            />
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
