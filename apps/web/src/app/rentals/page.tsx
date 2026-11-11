import { AppShell } from "@/components/AppShell";
import { DashboardAutoRefresh } from "@/components/DashboardAutoRefresh";
import { Badge, DataTable } from "@/components/ui";
import { BrandLogoSvg } from "@/lib/brand-logos";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import { computeRentalTotal, rentalDaysBetween, rentalContractReference } from "@/lib/rental-contract";
import {
  recordRentalPayment,
  returnRental,
  transferVehicleToRental,
  transferVehicleToShowroom,
  updateRentalMaintenanceStatus,
  updateRentalRequestStatus,
} from "./actions";
import { RentalActionModals } from "./RentalActionModals";

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
  NOUVELLE: "Nouvelle",
  CONTACTEE: "Contactée",
  CONFIRMEE: "Confirmée",
  ANNULEE: "Annulée",
};

const FIELD_STYLE = {
  height: 38,
  fontSize: "0.88rem",
} as const;

const ENERGY_LABELS: Record<string, string> = {
  ESSENCE: "Essence",
  DIESEL: "Diesel",
  HYBRIDE: "Hybride",
  HYBRIDE_RECHARGEABLE: "Hybride rechargeable",
  PHEV: "Hybride rechargeable",
  ELECTRIQUE: "Électrique",
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  BERLINE: "Berline",
  SUV: "SUV",
  PICKUP: "Pick-up",
  VAN: "Van",
};

const RENTAL_STATUS_TONES: Record<string, "ok" | "warn" | "bad" | "ice" | "neutral"> = {
  DISPONIBLE: "ok",
  LOUE: "ice",
  MAINTENANCE: "warn",
  HORS_SERVICE: "bad",
};

export default async function RentalsPage() {
  const user = await requireUser([...RENTAL_ROLES]);
  const canManage = (MANAGE_ROLES as readonly string[]).includes(user.role);
  const canFinance = (FINANCE_ROLES as readonly string[]).includes(user.role);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [rentals, rentalVehicles, showroomVehicles, customers, maintenances, rentalRequests, vehicleBrands, garageUsers] = await Promise.all([
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
      include: { supplier: true, site: true },
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
    prisma.rentalRequest.findMany({
      include: { vehicle: { select: { id: true, brand: true, model: true, registrationNumber: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.vehicleBrand.findMany({
      where: { active: true },
      include: {
        models: {
          where: { active: true },
          orderBy: { name: "asc" },
          select: { name: true, vehicleType: true, energy: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.user.findMany({
      where: { active: true, role: { in: ["CHEF_ATELIER", "ATELIER", "RTA"] } },
      select: { id: true, fullName: true, role: true },
      orderBy: { fullName: "asc" },
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
    if (rental.totalXof) return rental.totalXof;
    const end = rental.returnedAt || rental.endDate;
    const days = rental.days || rentalDaysBetween(rental.startDate, end);
    return (
      computeRentalTotal({
        dailyXof: rental.dailyXof || rental.vehicle.rentalDailyXof,
        monthlyXof: rental.monthlyXof,
        days,
      }) || 0
    );
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
                border: "1px solid var(--border-strong)",
                background: "var(--surface-soft)",
                fontSize: "0.78rem",
              }}
            >
              Consultation / supervision
            </span>
          )}
        </div>

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
          />
        )}

        <div className="ox-kpi-grid">
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--info)" }}>
            <div className="ox-kpi-label">Parc de location</div>
            <div className="ox-kpi-value">{rentalVehicles.length}</div>
            <div className="ox-kpi-hint">Véhicules dédiés à la location</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--success)" }}>
            <div className="ox-kpi-label">Disponibles</div>
            <div className="ox-kpi-value">{availableVehicles.length}</div>
            <div className="ox-kpi-hint">Prêts à être loués</div>
          </div>
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
              <div className="ox-kpi-hint">Charges d'entretien du parc</div>
            </div>
            <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--purple)" }}>
              <div className="ox-kpi-label">Bénéfice net location</div>
              <div className="ox-kpi-value">{formatXof(netRentalRevenue)}</div>
              <div className="ox-kpi-hint">Recettes moins entretien</div>
            </div>
          </div>
        </div>

        {(canManage || canFinance) && (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
            <div>
              <strong>Gestion du parc de location</strong>
              <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
                Vue détaillée de la flotte de location, avec l&apos;état de chaque véhicule, ses tarifs et sa fiche technique.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, fontSize: "0.78rem", opacity: 0.85 }}>
                <span>{rentalVehicles.length} véhicule(s) au parc</span>
                <span>·</span>
                <span>{rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "DISPONIBLE").length} disponible(s)</span>
                <span>·</span>
                <span>{rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "LOUE").length} loué(s)</span>
                <span>·</span>
                <span>{rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "MAINTENANCE").length} en maintenance</span>
              </div>
            </div>

            {canManage && (
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
            )}

            {rentalVehicles.length === 0 ? (
              <div style={{ padding: "1.5rem", textAlign: "center", opacity: 0.65, fontSize: "0.86rem" }}>
                Aucun véhicule dans le parc de location. Ajoutez un véhicule du showroom ou enregistrez un nouveau véhicule.
              </div>
            ) : (
              <DataTable
                headers={[
                  "VIN / Immatriculation",
                  "Véhicule",
                  "Gamme",
                  "Énergie",
                  "Fournisseur",
                  "Showroom",
                  "Valeur",
                  "Tarif location",
                  "Statut location",
                  "Action",
                ]}
                rows={rentalVehicles.map((vehicle) => {
                  const activeContract = activeRentals.find((rental) => rental.vehicleId === vehicle.id);
                  const hasActive = Boolean(activeContract);
                  return [
                    <div key={`ident-${vehicle.id}`} style={{ fontSize: "0.8rem" }}>
                      <div style={{ fontFamily: "monospace" }}>{vehicle.vin || "-"}</div>
                      <div style={{ opacity: 0.6, fontSize: "0.74rem" }}>{vehicle.registrationNumber || "Sans plaque"}</div>
                    </div>,
                    <div key={`vehicle-${vehicle.id}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {vehicle.mainPhotoUrl ? (
                        <div
                          style={{
                            width: 58,
                            height: 38,
                            borderRadius: 6,
                            background: "var(--surface)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            border: "1px solid var(--border)",
                            flexShrink: 0,
                            padding: 2,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={vehicle.mainPhotoUrl} alt={`${vehicle.brand} ${vehicle.model}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 58,
                            height: 38,
                            borderRadius: 6,
                            background: "var(--surface-soft)",
                            border: "1px dashed var(--ice-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                          title="Aucune photo enregistrée"
                        >
                          <BrandLogoSvg brand={vehicle.brand} size={20} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 650, display: "flex", alignItems: "center", gap: 6 }}>
                          <BrandLogoSvg brand={vehicle.brand} size={15} />
                          <span>{vehicle.brand} {vehicle.model}</span>
                        </div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>
                          {[vehicle.variant, vehicle.year].filter(Boolean).join(" · ") || "Version non précisée"}
                        </div>
                      </div>
                    </div>,
                    VEHICLE_TYPE_LABELS[vehicle.vehicleType || ""] || vehicle.vehicleType || "-",
                    ENERGY_LABELS[vehicle.energy] || vehicle.energy || "-",
                    vehicle.supplier?.name || "Constructeurs partenaires",
                    <span key={`site-${vehicle.id}`} style={{ color: vehicle.site?.code === "ATELIER_SAV" ? "var(--warning-fg)" : "var(--accent-fg)", fontWeight: 600 }}>
                      📍 {vehicle.site?.name || "Showroom CARZONE SARL"}
                    </span>,
                    formatXof(vehicle.priceXof),
                    <div key={`rate-${vehicle.id}`} style={{ fontSize: "0.8rem" }}>
                      <div>{vehicle.rentalDailyXof ? `${formatXof(vehicle.rentalDailyXof)} / jour` : "-"}</div>
                      <div style={{ opacity: 0.65 }}>{vehicle.rentalMonthlyXof ? `${formatXof(vehicle.rentalMonthlyXof)} / mois` : ""}</div>
                    </div>,
                    <Badge key={`status-${vehicle.id}`} tone={RENTAL_STATUS_TONES[vehicle.rentalStatus || "DISPONIBLE"] || "neutral"}>
                      {STATUS_LABEL[vehicle.rentalStatus || "DISPONIBLE"] || vehicle.rentalStatus || "Disponible"}
                    </Badge>,
                    <div key={`actions-${vehicle.id}`} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "nowrap" }}>
                      <a href={`/rentals/${vehicle.id}/fiche-technique`} className="ox-btn ox-btn-ghost ox-btn-sm" style={{ whiteSpace: "nowrap" }}>
                        Fiche technique
                      </a>
                      {activeContract && (
                        <a href={`/rentals/${activeContract.id}/contrat`} className="ox-btn ox-btn-ghost ox-btn-sm" style={{ whiteSpace: "nowrap" }}>
                          Contrat
                        </a>
                      )}
                      {canManage && (
                        <form action={transferVehicleToShowroom}>
                          <input type="hidden" name="vehicleId" value={vehicle.id} />
                          <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm" disabled={hasActive} title={hasActive ? "Retournez d'abord le contrat actif." : "Retirer du parc de location"} style={{ whiteSpace: "nowrap" }}>
                            Retirer du parc
                          </button>
                        </form>
                      )}
                    </div>,
                  ];
                })}
              />
            )}
          </div>
        )}

        {(canManage || canFinance) && rentalRequests.length > 0 && (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
            <div>
              <strong>Demandes de location reçues depuis la vitrine</strong>
              <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
                Demandes de visite showroom ou de contrat à distance. L'acompte de réservation correspond à 50 % du montant estimé.
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

        {(canManage || maintenances.length > 0) && (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
            <div>
              <strong>Entretien, réparations et passage au garage</strong>
              <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
                Planifiez et suivez l'entretien des véhicules de location. Un véhicule planifié ou en cours passe en
                maintenance et n'est plus proposé à la location.
              </p>
            </div>
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
