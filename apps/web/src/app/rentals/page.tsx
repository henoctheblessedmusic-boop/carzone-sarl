import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import {
  createRental,
  createRentalVehicle,
  createRentalMaintenance,
  recordRentalPayment,
  returnRental,
  transferVehicleToRental,
  transferVehicleToShowroom,
  updateRentalMaintenanceStatus,
} from "./actions";

const RENTAL_ROLES = ["GESTIONNAIRE_LOCATION", "COMPTA", "DG", "PDG", "SG"] as const;
const MANAGE_ROLES = ["GESTIONNAIRE_LOCATION", "DG", "PDG", "SG"] as const;
const FINANCE_ROLES = ["GESTIONNAIRE_LOCATION", "COMPTA", "DG", "PDG", "SG"] as const;

const STATUS_LABEL: Record<string, string> = {
  DISPONIBLE: "Disponible",
  LOUE: "Loué",
  MAINTENANCE: "Maintenance",
  HORS_SERVICE: "Hors service",
  ACTIF: "Actif",
  TERMINE: "Terminé",
  BROUILLON: "Brouillon",
  PLANIFIE: "Planifié",
  EN_COURS: "En cours",
  ANNULE: "Annulé",
};

const FIELD_STYLE = {
  height: 38,
  fontSize: "0.88rem",
} as const;

export default async function RentalsPage() {
  const user = await requireUser([...RENTAL_ROLES]);
  const canManage = (MANAGE_ROLES as readonly string[]).includes(user.role);
  const canFinance = (FINANCE_ROLES as readonly string[]).includes(user.role);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [rentals, rentalVehicles, showroomVehicles, customers, maintenances] = await Promise.all([
    prisma.rental.findMany({
      include: {
        customer: true,
        vehicle: true,
        payments: { orderBy: { paidAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.findMany({
      where: { fleetType: "RENTAL" },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    }),
    prisma.vehicle.findMany({
      where: { fleetType: "SHOWROOM", status: { in: ["EN_STOCK", "EN_MAGASIN"] } },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      select: { id: true, brand: true, model: true, vin: true },
    }),
    prisma.customer.findMany({
      where: { active: true },
      orderBy: { contactName: "asc" },
      select: { id: true, contactName: true, companyName: true },
    }),
    prisma.rentalMaintenance.findMany({
      include: { vehicle: { select: { id: true, brand: true, model: true, registrationNumber: true } } },
      orderBy: [{ status: "asc" }, { scheduledAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const availableVehicles = rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "DISPONIBLE");
  const activeRentals = rentals.filter((rental) => rental.status === "ACTIF");
  const paidByRental = new Map(
    rentals.map((rental) => [rental.id, rental.payments.reduce((sum, payment) => sum + payment.amountXof, 0)])
  );
  const totalReceived = rentals.reduce((sum, rental) => sum + (paidByRental.get(rental.id) || 0), 0);
  const receivedThisMonth = rentals.reduce(
    (sum, rental) =>
      sum +
      rental.payments
        .filter((payment) => payment.paidAt >= monthStart)
        .reduce((paymentSum, payment) => paymentSum + payment.amountXof, 0),
    0
  );
  const maintenanceCost = maintenances.reduce((sum, item) => sum + item.costXof, 0);
  const expectedContractValue = (rental: (typeof rentals)[number]): number => {
    if (!rental.monthlyXof) return 0;
    const end = rental.returnedAt || rental.endDate || now;
    const months = Math.max(1, Math.ceil((end.getTime() - rental.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    return rental.monthlyXof * months;
  };
  const totalBalance = rentals.reduce(
    (sum, rental) => sum + Math.max(0, expectedContractValue(rental) - (paidByRental.get(rental.id) || 0)),
    0
  );
  const netRentalRevenue = totalReceived - maintenanceCost;

  return (
    <AppShell user={user} title="Location de véhicules">
      <div style={{ display: "grid", gap: "1.2rem" }}>
        <div className="ox-hero-card">
          <div>
            <div className="ox-hero-card-title">Parc de location de véhicules</div>
            <div className="ox-hero-card-sub">
              Parc distinct du stock de vente - contrats, disponibilité, retours et états du véhicule.
            </div>
          </div>
          {!canManage && (
            <span
              style={{
                alignSelf: "center",
                padding: "3px 10px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.4)",
                background: "rgba(148,163,184,0.12)",
                fontSize: "0.78rem",
              }}
            >
              Consultation / supervision
            </span>
          )}
        </div>

        <div className="ox-kpi-grid">
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid #38bdf8" }}>
            <div className="ox-kpi-label">Parc de location</div>
            <div className="ox-kpi-value">{rentalVehicles.length}</div>
            <div className="ox-kpi-hint">Véhicules dédiés à la location</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid #34d399" }}>
            <div className="ox-kpi-label">Disponibles</div>
            <div className="ox-kpi-value">{availableVehicles.length}</div>
            <div className="ox-kpi-hint">Prêts à être loués</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid #fbbf24" }}>
            <div className="ox-kpi-label">Locations actives</div>
            <div className="ox-kpi-value">{activeRentals.length}</div>
            <div className="ox-kpi-hint">Contrats en cours</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid #a78bfa" }}>
            <div className="ox-kpi-label">Contrats total</div>
            <div className="ox-kpi-value">{rentals.length}</div>
            <div className="ox-kpi-hint">Historique</div>
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div>
              <strong>Comptabilité de la location en temps réel</strong>
              <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
                Recettes réellement encaissées, reste à recouvrer et coût d'entretien du parc de location.
              </p>
            </div>
            <span style={{ fontSize: "0.75rem", opacity: 0.65 }}>Hors cautions - données à jour à chaque encaissement</span>
          </div>
          <div className="ox-kpi-grid">
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid #10b981" }}>
              <div className="ox-kpi-label">Recettes encaissées</div>
              <div className="ox-kpi-value">{formatXof(totalReceived)}</div>
              <div className="ox-kpi-hint">Total réel des loyers encaissés</div>
            </div>
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid #38bdf8" }}>
              <div className="ox-kpi-label">Encaissé ce mois</div>
              <div className="ox-kpi-value">{formatXof(receivedThisMonth)}</div>
              <div className="ox-kpi-hint">Mois en cours</div>
            </div>
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid #fbbf24" }}>
              <div className="ox-kpi-label">Reste à encaisser</div>
              <div className="ox-kpi-value">{formatXof(totalBalance)}</div>
              <div className="ox-kpi-hint">Sur les contrats en cours</div>
            </div>
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid #f97316" }}>
              <div className="ox-kpi-label">Entretien & garage</div>
              <div className="ox-kpi-value">{formatXof(maintenanceCost)}</div>
              <div className="ox-kpi-hint">Charges d'entretien du parc</div>
            </div>
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid #a78bfa" }}>
              <div className="ox-kpi-label">Bénéfice net location</div>
              <div className="ox-kpi-value">{formatXof(netRentalRevenue)}</div>
              <div className="ox-kpi-hint">Recettes moins entretien</div>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
            <div>
              <strong>Ajouter un véhicule au parc de location</strong>
              <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
                Enregistrez un nouveau véhicule directement dans la base du parc de location : marque, modèle, nom/version,
                prix, châssis et plaque d'immatriculation.
              </p>
            </div>
            <form
              action={createRentalVehicle}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))",
                gap: 10,
              }}
            >
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-brand">Marque *</label>
                <input id="rental-brand" name="brand" className="ox-input" style={FIELD_STYLE} required placeholder="Ex. Toyota" />
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-model">Modèle *</label>
                <input id="rental-model" name="model" className="ox-input" style={FIELD_STYLE} required placeholder="Ex. Corolla" />
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-variant">Nom / version</label>
                <input id="rental-variant" name="variant" className="ox-input" style={FIELD_STYLE} placeholder="Ex. 1.8 Hybride" />
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-year">Année</label>
                <input id="rental-year" name="year" type="number" min="1900" max="2100" className="ox-input" style={FIELD_STYLE} placeholder="Ex. 2026" />
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-energy">Énergie *</label>
                <select id="rental-energy" name="energy" className="ox-select" style={FIELD_STYLE} required defaultValue="ESSENCE">
                  <option value="ESSENCE">Essence</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRIDE">Hybride</option>
                  <option value="HYBRIDE_RECHARGEABLE">Hybride rechargeable</option>
                  <option value="ELECTRIQUE">Électrique</option>
                </select>
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-price">Prix du véhicule (FCFA) *</label>
                <input id="rental-price" name="priceXof" type="number" min="1" className="ox-input" style={FIELD_STYLE} required placeholder="Ex. 12000000" />
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-vin">Numéro de châssis (VIN) *</label>
                <input id="rental-vin" name="vin" className="ox-input" style={FIELD_STYLE} required placeholder="Ex. JTDBR32E720123456" autoComplete="off" />
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-plate">Plaque d'immatriculation *</label>
                <input id="rental-plate" name="registrationNumber" className="ox-input" style={FIELD_STYLE} required placeholder="Ex. AB 1234 RB" autoComplete="off" />
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-mileage">Kilométrage</label>
                <input id="rental-mileage" name="mileage" type="number" min="0" className="ox-input" style={FIELD_STYLE} placeholder="0" />
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-type">Type</label>
                <select id="rental-type" name="vehicleType" className="ox-select" style={FIELD_STYLE} defaultValue="">
                  <option value="">Non précisé</option>
                  <option value="BERLINE">Berline</option>
                  <option value="SUV">SUV</option>
                  <option value="PICKUP">Pick-up</option>
                  <option value="VAN">Van</option>
                </select>
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-color">Couleur</label>
                <input id="rental-color" name="color" className="ox-input" style={FIELD_STYLE} placeholder="Ex. Blanc" />
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <label className="ox-label" htmlFor="rental-transmission">Transmission</label>
                <input id="rental-transmission" name="transmission" className="ox-input" style={FIELD_STYLE} placeholder="Ex. Automatique" />
              </div>
              <div style={{ display: "grid", gap: 4, gridColumn: "1 / -1" }}>
                <label className="ox-label" htmlFor="rental-description">Notes / description</label>
                <input id="rental-description" name="description" className="ox-input" style={FIELD_STYLE} placeholder="Informations complémentaires sur le véhicule" />
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="ox-btn" style={FIELD_STYLE}>
                  Enregistrer le véhicule
                </button>
              </div>
            </form>
          </div>
        )}

        {canManage && (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
            <strong>Nouveau contrat de location</strong>
            <form
              action={createRental}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,170px),1fr))",
                gap: 10,
              }}
            >
              <select name="type" className="ox-select" style={FIELD_STYLE} defaultValue="LCD">
                <option value="LCD">Location courte durée</option>
                <option value="LLD">Location longue durée</option>
                <option value="LOA">Location avec option d'achat</option>
              </select>
              <select name="customerId" className="ox-select" style={FIELD_STYLE} required defaultValue="">
                <option value="" disabled>Client</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.contactName}{customer.companyName ? ` (${customer.companyName})` : ""}
                  </option>
                ))}
              </select>
              <select name="vehicleId" className="ox-select" style={FIELD_STYLE} required defaultValue="">
                <option value="" disabled>Véhicule disponible</option>
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} {vehicle.registrationNumber ? `- ${vehicle.registrationNumber}` : vehicle.vin ? `- ${vehicle.vin}` : ""}
                  </option>
                ))}
              </select>
              <input name="startDate" type="date" className="ox-input" style={FIELD_STYLE} required />
              <input name="endDate" type="date" className="ox-input" style={FIELD_STYLE} />
              <input name="monthlyXof" type="number" min={0} placeholder="Tarif mensuel (FCFA)" className="ox-input" style={FIELD_STYLE} />
              <input name="depositXof" type="number" min={0} placeholder="Caution (FCFA)" className="ox-input" style={FIELD_STYLE} />
              <input name="departureCondition" placeholder="État au départ" className="ox-input" style={FIELD_STYLE} />
              <button type="submit" className="ox-btn" style={FIELD_STYLE}>Créer le contrat</button>
            </form>
          </div>
        )}

        {canManage && (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
            <strong>Gestion du parc de location</strong>
            <p style={{ margin: 0, opacity: 0.7, fontSize: "0.84rem" }}>
              Les véhicules du stock showroom peuvent être transférés vers le parc de location, et inversement
              lorsqu'aucun contrat n'est actif.
            </p>
            <form action={transferVehicleToRental} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select name="vehicleId" className="ox-select" style={{ ...FIELD_STYLE, flex: "1 1 260px" }} required defaultValue="">
                <option value="" disabled>Ajouter un véhicule showroom au parc de location</option>
                {showroomVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} {vehicle.vin ? `- ${vehicle.vin}` : ""}
                  </option>
                ))}
              </select>
              <button type="submit" className="ox-btn ox-btn-ghost" style={FIELD_STYLE}>Ajouter au parc location</button>
            </form>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {rentalVehicles.map((vehicle) => {
                const hasActive = activeRentals.some((rental) => rental.vehicleId === vehicle.id);
                return (
                  <form
                    key={vehicle.id}
                    action={transferVehicleToShowroom}
                    style={{
                      display: "inline-flex",
                      gap: 6,
                      alignItems: "center",
                      border: "1px solid var(--ice-border)",
                      borderRadius: 8,
                      padding: "4px 8px",
                    }}
                  >
                    <input type="hidden" name="vehicleId" value={vehicle.id} />
                    <span style={{ fontSize: "0.82rem" }}>
                      {vehicle.brand} {vehicle.model}
                      {vehicle.registrationNumber ? ` - ${vehicle.registrationNumber}` : ""} - {STATUS_LABEL[vehicle.rentalStatus || "DISPONIBLE"] || vehicle.rentalStatus}
                    </span>
                    <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm" disabled={hasActive}>
                      Retirer du parc
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        )}

        {(canManage || maintenances.length > 0) && (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
            <div>
              <strong>Entretien, réparations et passage au garage</strong>
              <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
                Planifiez et suivez l'entretien des véhicules de location. Un véhicule planifié ou en cours passe en
                maintenance et n'est plus proposé à la location.
              </p>
            </div>
            {canManage && (
            <form
              action={createRentalMaintenance}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))",
                gap: 10,
              }}
            >
              <select name="vehicleId" className="ox-select" style={FIELD_STYLE} required defaultValue="">
                <option value="" disabled>Véhicule du parc</option>
                {rentalVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model}{vehicle.registrationNumber ? ` - ${vehicle.registrationNumber}` : ""}
                  </option>
                ))}
              </select>
              <select name="type" className="ox-select" style={FIELD_STYLE} defaultValue="ENTRETIEN">
                <option value="ENTRETIEN">Entretien</option>
                <option value="VIDANGE">Vidange</option>
                <option value="REPARATION">Réparation</option>
                <option value="PNEUMATIQUES">Pneumatiques</option>
                <option value="CONTROLE_TECHNIQUE">Contrôle technique</option>
                <option value="AUTRE">Autre</option>
              </select>
              <select name="status" className="ox-select" style={FIELD_STYLE} defaultValue="PLANIFIE">
                <option value="PLANIFIE">Planifié</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINE">Terminé</option>
              </select>
              <input name="description" className="ox-input" style={FIELD_STYLE} required placeholder="Description de l'intervention" />
              <input name="costXof" type="number" min="0" className="ox-input" style={FIELD_STYLE} placeholder="Coût (FCFA)" />
              <input name="garageName" className="ox-input" style={FIELD_STYLE} placeholder="Garage / prestataire" />
              <input name="scheduledAt" type="date" className="ox-input" style={FIELD_STYLE} />
              <input name="mileage" type="number" min="0" className="ox-input" style={FIELD_STYLE} placeholder="Kilométrage" />
              <select name="rentalId" className="ox-select" style={FIELD_STYLE} defaultValue="">
                <option value="">Sans contrat lié</option>
                {activeRentals.map((rental) => (
                  <option key={rental.id} value={rental.id}>
                    Contrat {rental.type} - {rental.customer.contactName}
                  </option>
                ))}
              </select>
              <button type="submit" className="ox-btn" style={FIELD_STYLE}>Enregistrer l'entretien</button>
            </form>
            )}

            {maintenances.length > 0 && (
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
                <th>Tarif</th>
                <th>Caution</th>
                <th>Encaissé</th>
                <th>Solde</th>
                <th>Statut</th>
                {(canManage || canFinance) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={canManage || canFinance ? 11 : 10} style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                    Aucun contrat de location enregistré.
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => {
                  const paid = paidByRental.get(rental.id) || 0;
                  const balance = Math.max(0, expectedContractValue(rental) - paid);
                  return (
                  <tr key={rental.id}>
                    <td>{rental.type}</td>
                    <td>{rental.customer.contactName}</td>
                    <td>{rental.vehicle.brand} {rental.vehicle.model}{rental.vehicle.registrationNumber ? ` (${rental.vehicle.registrationNumber})` : ""}</td>
                    <td>{rental.startDate.toISOString().slice(0, 10)}</td>
                    <td>
                      {rental.returnedAt
                        ? rental.returnedAt.toISOString().slice(0, 10)
                        : rental.endDate
                          ? rental.endDate.toISOString().slice(0, 10)
                          : "-"}
                    </td>
                    <td>{rental.monthlyXof ? formatXof(rental.monthlyXof) : "-"}</td>
                    <td>{rental.depositXof ? formatXof(rental.depositXof) : "-"}</td>
                    <td>{formatXof(paid)}</td>
                    <td style={{ color: balance > 0 ? "var(--warn)" : "inherit", fontWeight: balance > 0 ? 700 : 400 }}>{formatXof(balance)}</td>
                    <td>{STATUS_LABEL[rental.status] || rental.status}</td>
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
