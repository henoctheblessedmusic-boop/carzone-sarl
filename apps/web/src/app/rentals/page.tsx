import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import {
  createRental,
  returnRental,
  transferVehicleToRental,
  transferVehicleToShowroom,
} from "./actions";

const RENTAL_ROLES = ["GESTIONNAIRE_LOCATION", "COMPTA", "DG", "PDG", "SG"] as const;
const MANAGE_ROLES = ["GESTIONNAIRE_LOCATION", "DG", "PDG", "SG"] as const;

const STATUS_LABEL: Record<string, string> = {
  DISPONIBLE: "Disponible",
  LOUE: "Loué",
  MAINTENANCE: "Maintenance",
  HORS_SERVICE: "Hors service",
  ACTIF: "Actif",
  TERMINE: "Terminé",
  BROUILLON: "Brouillon",
};

const FIELD_STYLE = {
  height: 38,
  fontSize: "0.88rem",
} as const;

export default async function RentalsPage() {
  const user = await requireUser([...RENTAL_ROLES]);
  const canManage = (MANAGE_ROLES as readonly string[]).includes(user.role);

  const [rentals, rentalVehicles, showroomVehicles, customers] = await Promise.all([
    prisma.rental.findMany({
      include: { customer: true, vehicle: true },
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
  ]);

  const availableVehicles = rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "DISPONIBLE");
  const activeRentals = rentals.filter((rental) => rental.status === "ACTIF");

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
                    {vehicle.brand} {vehicle.model} {vehicle.vin ? `- ${vehicle.vin}` : ""}
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
                      {vehicle.brand} {vehicle.model} - {STATUS_LABEL[vehicle.rentalStatus || "DISPONIBLE"] || vehicle.rentalStatus}
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
                <th>Statut</th>
                {canManage && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 9 : 8} style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                    Aucun contrat de location enregistré.
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td>{rental.type}</td>
                    <td>{rental.customer.contactName}</td>
                    <td>{rental.vehicle.brand} {rental.vehicle.model}</td>
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
                    <td>{STATUS_LABEL[rental.status] || rental.status}</td>
                    {canManage && (
                      <td>
                        {rental.status === "ACTIF" ? (
                          <form action={returnRental} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input type="hidden" name="id" value={rental.id} />
                            <input
                              name="returnCondition"
                              placeholder="État au retour"
                              className="ox-input"
                              style={{ height: 30, fontSize: "0.78rem", minWidth: 140 }}
                            />
                            <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm">Retour</button>
                          </form>
                        ) : (
                          <span style={{ opacity: 0.55 }}>Clôturé</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
