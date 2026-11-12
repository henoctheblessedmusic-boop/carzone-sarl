import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { BrandLogoSvg } from "@/lib/brand-logos";
import { requireUser } from "@/lib/require-user";
import { formatXof } from "@/lib/format";
import { transferVehicleToRental } from "../actions";
import { RentalActionModals } from "../RentalActionModals";
import { RentalFleetActions } from "../RentalFleetActions";
import { RentalSectionNav } from "../_shared/RentalSectionNav";
import {
  ENERGY_LABELS,
  FIELD_STYLE,
  RENTAL_STATUS_TONES,
  STATUS_LABEL,
  VEHICLE_TYPE_LABELS,
} from "../_shared/labels";
import {
  RENTAL_ROLES,
  findGarageUsers,
  findRentalCustomers,
  findRentalVehicles,
  findRentals,
  findShowroomVehicles,
  findVehicleBrands,
  rentalAccess,
} from "../_shared/data";

export default async function RentalFleetPage() {
  const user = await requireUser([...RENTAL_ROLES]);
  const { canManage, canFinance } = rentalAccess(user.role);

  const [rentals, rentalVehicles, showroomVehicles, customers, vehicleBrands, garageUsers] = await Promise.all([
    findRentals(),
    findRentalVehicles(),
    findShowroomVehicles(),
    findRentalCustomers(user.role),
    findVehicleBrands(),
    findGarageUsers(),
  ]);

  const activeRentals = rentals.filter((rental) => rental.status === "ACTIF");
  const availableVehicles = rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "DISPONIBLE");
  const rentedCount = rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "LOUE").length;
  const maintenanceCount = rentalVehicles.filter((vehicle) => vehicle.rentalStatus === "MAINTENANCE").length;

  return (
    <AppShell user={user} title="Location - Parc locatif">
      <div style={{ display: "grid", gap: "1.2rem" }}>
        <div className="ox-hero-card">
          <div>
            <div className="ox-hero-card-title">Parc de véhicules de location</div>
            <div className="ox-hero-card-sub">
              Parc distinct du stock de vente - enregistrement de nouveaux véhicules, reprise du stock
              showroom, tarifs et disponibilité.
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

        <RentalSectionNav current="fleet" />

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
            allowed={["vehicle"]}
            title="Enregistrer un véhicule"
            description="Ajoutez un véhicule neuf au parc, ou reprenez un véhicule du stock showroom ci-dessous."
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
            <div className="ox-kpi-label">Loués</div>
            <div className="ox-kpi-value">{rentedCount}</div>
            <div className="ox-kpi-hint">Actuellement chez un client</div>
          </div>
          <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--purple)" }}>
            <div className="ox-kpi-label">En maintenance</div>
            <div className="ox-kpi-value">{maintenanceCount}</div>
            <div className="ox-kpi-hint">Indisponibles à la location</div>
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
                <span>{availableVehicles.length} disponible(s)</span>
                <span>·</span>
                <span>{rentedCount} loué(s)</span>
                <span>·</span>
                <span>{maintenanceCount} en maintenance</span>
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
                        <RentalFleetActions
                          vehicle={{
                            id: vehicle.id,
                            brand: vehicle.brand,
                            model: vehicle.model,
                            variant: vehicle.variant,
                            year: vehicle.year,
                            energy: vehicle.energy,
                            vin: vehicle.vin,
                            registrationNumber: vehicle.registrationNumber,
                            rentalDailyXof: vehicle.rentalDailyXof,
                            rentalMonthlyXof: vehicle.rentalMonthlyXof,
                            mileage: vehicle.mileage,
                          }}
                          hasActive={hasActive}
                        />
                      )}
                    </div>,
                  ];
                })}
              />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
