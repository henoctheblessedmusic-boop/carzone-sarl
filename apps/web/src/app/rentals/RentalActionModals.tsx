"use client";

import { useState, type ReactNode } from "react";
import { Car, FilePlus2, Wrench, X } from "lucide-react";
import { computeRentalTotal, rentalDaysBetween } from "@/lib/rental-contract";
import {
  createRental,
  createRentalMaintenance,
  createRentalVehicle,
} from "./actions";

type VehicleOption = {
  id: string;
  brand: string;
  model: string;
  registrationNumber: string | null;
  vin: string | null;
  rentalDailyXof?: number | null;
  rentalMonthlyXof?: number | null;
};

type CustomerOption = {
  id: string;
  contactName: string;
  companyName: string | null;
};

type BrandOption = {
  name: string;
  models: Array<{ name: string; vehicleType: string | null; energy: string | null }>;
};

type GarageUser = {
  id: string;
  fullName: string;
  role: string;
};

type ActiveRentalOption = {
  id: string;
  type: string;
  customerName: string;
};

type ModalKind = "vehicle" | "contract" | "maintenance" | null;

const FIELD = { height: 40, fontSize: "0.88rem" } as const;

const GARAGE_ROLE_LABELS: Record<string, string> = {
  CHEF_ATELIER: "Chef d'atelier",
  ATELIER: "Technicien atelier",
  RTA: "Responsable technique atelier",
};

const ACTIONS = [
  {
    key: "vehicle" as const,
    label: "Enregistrer nouveau véhicule",
    description: "Ajouter un véhicule au parc de location",
    color: "#0078d4",
    background: "linear-gradient(135deg, #0078d4, #0ea5e9)",
    icon: Car,
  },
  {
    key: "contract" as const,
    label: "Créer nouveau contrat",
    description: "Démarrer une location client",
    color: "#0f9f6e",
    background: "linear-gradient(135deg, #0f9f6e, #10b981)",
    icon: FilePlus2,
  },
  {
    key: "maintenance" as const,
    label: "Enregistrer entretien",
    description: "Planifier ou suivre une intervention",
    color: "#d97706",
    background: "linear-gradient(135deg, #d97706, #f59e0b)",
    icon: Wrench,
  },
];

export function RentalActionModals({
  rentalVehicles,
  availableVehicles,
  customers,
  brands,
  garageUsers,
  activeRentals,
}: {
  rentalVehicles: VehicleOption[];
  availableVehicles: VehicleOption[];
  customers: CustomerOption[];
  brands: BrandOption[];
  garageUsers: GarageUser[];
  activeRentals: ActiveRentalOption[];
}) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [brandName, setBrandName] = useState("");
  const [colorChoice, setColorChoice] = useState("");
  const [contractVehicleId, setContractVehicleId] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [contractDaily, setContractDaily] = useState("");
  const [contractMonthly, setContractMonthly] = useState("");

  const selectedBrand = brands.find((brand) => brand.name === brandName);
  const yearOptions = Array.from({ length: new Date().getFullYear() + 1 - 2015 + 1 }, (_, index) => new Date().getFullYear() + 1 - index);
  const selectedContractVehicle = availableVehicles.find((vehicle) => vehicle.id === contractVehicleId);
  const contractDays =
    contractStart && contractEnd
      ? Math.max(0, rentalDaysBetween(new Date(contractStart), new Date(contractEnd)))
      : 0;
  const contractTotal = computeRentalTotal({
    dailyXof: Number(contractDaily) || null,
    monthlyXof: Number(contractMonthly) || null,
    days: contractDays,
  });

  function close() {
    setModal(null);
  }

  return (
    <>
      <div
        className="ox-glass"
        style={{
          padding: "1rem 1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.02rem" }}>Actions rapides</div>
          <div style={{ opacity: 0.68, fontSize: "0.82rem", marginTop: 2 }}>
            Gérez le parc, les contrats et l'entretien depuis un seul endroit.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ACTIONS.map(({ key, label, description, background, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setModal(key);
                if (key === "vehicle") {
                  setBrandName("");
                  setColorChoice("");
                }
                if (key === "contract") {
                  setContractVehicleId("");
                  setContractStart("");
                  setContractEnd("");
                  setContractDaily("");
                  setContractMonthly("");
                }
              }}
              title={description}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minHeight: 42,
                padding: "0.55rem 0.9rem",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {modal ? (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(3, 10, 18, 0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            overflowY: "auto",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rental-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: "min(780px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "var(--ice-bg-mid, #0c1a24)",
              border: "1px solid var(--ice-border, rgba(160,210,230,0.25))",
              borderRadius: 16,
              boxShadow: "0 28px 70px rgba(0,0,0,0.6)",
              padding: "1.25rem 1.35rem 1.4rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: "1rem" }}>
              <div>
                <div id="rental-modal-title" style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  {modal === "vehicle"
                    ? "Enregistrer un nouveau véhicule"
                    : modal === "contract"
                      ? "Créer un nouveau contrat de location"
                      : "Enregistrer un entretien"}
                </div>
                <div style={{ opacity: 0.68, fontSize: "0.82rem", marginTop: 3 }}>
                  {modal === "vehicle"
                    ? "Le véhicule sera enregistré dans le parc de location avec sa fiche technique."
                    : modal === "contract"
                      ? "Renseignez le client, le véhicule et les conditions de location."
                      : "Planifiez ou enregistrez une intervention pour un véhicule du parc."}
                </div>
              </div>
              <button type="button" onClick={close} className="ox-btn ox-btn-ghost" aria-label="Fermer" style={{ padding: 6 }}>
                <X size={20} />
              </button>
            </div>

            {modal === "vehicle" && (
              <form
                action={createRentalVehicle}
                onSubmit={close}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 10 }}
              >
                <Field label="Marque *" hint="Marques chinoises importées et marques internationales">
                  <select
                    name="brand"
                    className="ox-select"
                    style={FIELD}
                    required
                    value={brandName}
                    onChange={(event) => setBrandName(event.target.value)}
                  >
                    <option value="" disabled>Sélectionner une marque</option>
                    {brands.map((brand) => (
                      <option key={brand.name} value={brand.name}>{brand.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Modèle *" hint={brandName ? `${selectedBrand?.models.length || 0} modèle(s) disponible(s)` : "Choisissez d'abord la marque"}>
                  <select name="model" className="ox-select" style={FIELD} required defaultValue="" disabled={!brandName}>
                    <option value="" disabled>{brandName ? "Sélectionner un modèle" : "Marque requise"}</option>
                    {(selectedBrand?.models || []).map((model) => (
                      <option key={model.name} value={model.name}>{model.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Version / finition"><input name="variant" className="ox-input" style={FIELD} placeholder="Ex. Premium 1.5T 7DCT" /></Field>
                <Field label="Année">
                  <select name="year" className="ox-select" style={FIELD} defaultValue={String(new Date().getFullYear())}>
                    {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </Field>
                <Field label="Énergie *">
                  <select name="energy" className="ox-select" style={FIELD} required defaultValue="ESSENCE">
                    <option value="ESSENCE">Essence</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRIDE">Hybride</option>
                    <option value="HYBRIDE_RECHARGEABLE">Hybride rechargeable</option>
                    <option value="ELECTRIQUE">Électrique</option>
                  </select>
                </Field>
                <Field label="Valeur du véhicule (FCFA) *" hint="Valeur patrimoniale du véhicule, pas le tarif de location">
                  <input name="priceXof" type="number" min="1" className="ox-input" style={FIELD} required placeholder="Ex. 12000000" />
                </Field>
                <Field label="Tarif location / jour (FCFA)" hint="Utilisé pour la cotation vitrine et l'acompte de 50 %">
                  <input name="rentalDailyXof" type="number" min="0" className="ox-input" style={FIELD} placeholder="Ex. 35000" />
                </Field>
                <Field label="Tarif location / mois (FCFA)" hint="Optionnel, pour les contrats longue durée">
                  <input name="rentalMonthlyXof" type="number" min="0" className="ox-input" style={FIELD} placeholder="Ex. 750000" />
                </Field>
                <Field label="Numéro de châssis (VIN) *" hint="17 caractères en général">
                  <input name="vin" className="ox-input" style={FIELD} required placeholder="Ex. JTDBR32E720123456" autoComplete="off" />
                </Field>
                <Field label="Plaque d'immatriculation *" hint="Format béninois, ex. AB 1234 RB">
                  <input name="registrationNumber" className="ox-input" style={FIELD} required placeholder="Ex. AB 1234 RB" autoComplete="off" />
                </Field>
                <Field label="Kilométrage (km)" hint="Relevez le compteur à l'entrée">
                  <input name="mileage" type="number" min="0" inputMode="numeric" className="ox-input" style={FIELD} placeholder="Ex. 45000" />
                </Field>
                <Field label="Type de véhicule">
                  <select name="vehicleType" className="ox-select" style={FIELD} defaultValue="">
                    <option value="">Non précisé</option>
                    <option value="BERLINE">Berline</option>
                    <option value="SUV">SUV</option>
                    <option value="PICKUP">Pick-up</option>
                    <option value="VAN">Van</option>
                  </select>
                </Field>
                <Field label="Couleur">
                  <select name="color" className="ox-select" style={FIELD} value={colorChoice} onChange={(event) => setColorChoice(event.target.value)}>
                    <option value="">Sélectionner une couleur</option>
                    <option value="Blanc">Blanc</option>
                    <option value="Blanc nacré">Blanc nacré</option>
                    <option value="Noir">Noir</option>
                    <option value="Noir métallisé">Noir métallisé</option>
                    <option value="Gris">Gris</option>
                    <option value="Gris anthracite">Gris anthracite</option>
                    <option value="Argent">Argent</option>
                    <option value="Rouge">Rouge</option>
                    <option value="Bleu">Bleu</option>
                    <option value="Bleu nuit">Bleu nuit</option>
                    <option value="Marron">Marron</option>
                    <option value="Beige">Beige</option>
                    <option value="Vert">Vert</option>
                    <option value="Jaune">Jaune</option>
                    <option value="Orange">Orange</option>
                    <option value="Or">Or</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Violet">Violet</option>
                    <option value="AUTRE">Couleur personnalisée</option>
                  </select>
                </Field>
                {colorChoice === "AUTRE" && (
                  <Field label="Couleur personnalisée *">
                    <input name="colorCustom" className="ox-input" style={FIELD} required placeholder="Saisir la couleur exacte" />
                  </Field>
                )}
                <Field label="Transmission">
                  <select name="transmission" className="ox-select" style={FIELD} defaultValue="AUTOMATIQUE">
                    <option value="AUTOMATIQUE">Automatique</option>
                    <option value="MANUELLE">Manuelle</option>
                  </select>
                </Field>
                <FormActions onCancel={close} submitLabel="Enregistrer le véhicule" />
              </form>
            )}

            {modal === "contract" && (
              <form
                action={createRental}
                onSubmit={close}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 10 }}
              >
                <Field label="Type de contrat">
                  <select name="type" className="ox-select" style={FIELD} defaultValue="LCD">
                    <option value="LCD">Courte durée</option>
                    <option value="LLD">Longue durée</option>
                    <option value="LOA">Location avec option d'achat</option>
                  </select>
                </Field>
                <Field label="Client *">
                  <select name="customerId" className="ox-select" style={FIELD} required defaultValue="">
                    <option value="" disabled>Sélectionner un client</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.contactName}{customer.companyName ? ` (${customer.companyName})` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Véhicule disponible *">
                  <select
                    name="vehicleId"
                    className="ox-select"
                    style={FIELD}
                    required
                    value={contractVehicleId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setContractVehicleId(value);
                      const vehicle = availableVehicles.find((item) => item.id === value);
                      if (vehicle?.rentalDailyXof) setContractDaily(String(vehicle.rentalDailyXof));
                      if (vehicle?.rentalMonthlyXof) setContractMonthly(String(vehicle.rentalMonthlyXof));
                    }}
                  >
                    <option value="" disabled>Sélectionner un véhicule</option>
                    {availableVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model}{vehicle.registrationNumber ? ` - ${vehicle.registrationNumber}` : vehicle.vin ? ` - ${vehicle.vin}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Date de début *">
                  <input name="startDate" type="date" className="ox-input" style={FIELD} required value={contractStart} onChange={(event) => setContractStart(event.target.value)} />
                </Field>
                <Field label="Date de fin *" hint="La durée est calculée en jours calendaires. Exemple : du 5 au 8 = 3 jours.">
                  <input name="endDate" type="date" className="ox-input" style={FIELD} required value={contractEnd} onChange={(event) => setContractEnd(event.target.value)} />
                </Field>
                <Field label="Tarif journalier (FCFA) *" hint="Tarif appliqué par jour. Prérempli avec le tarif du véhicule sélectionné.">
                  <input name="dailyXof" type="number" min="0" className="ox-input" style={FIELD} required={!contractMonthly} value={contractDaily} onChange={(event) => setContractDaily(event.target.value)} placeholder="Ex. 45000" />
                </Field>
                <Field label="Tarif mensuel (FCFA)" hint="Optionnel. Utilisé seulement si aucun tarif journalier n'est saisi.">
                  <input name="monthlyXof" type="number" min="0" className="ox-input" style={FIELD} value={contractMonthly} onChange={(event) => setContractMonthly(event.target.value)} placeholder="Ex. 1350000" />
                </Field>
                <Field label="Caution / dépôt de garantie (FCFA)" hint="Montant remboursable versé à la remise des clés. Ce n'est pas un loyer.">
                  <input name="depositXof" type="number" min="0" className="ox-input" style={FIELD} placeholder="Ex. 500000" />
                </Field>
                <Field label="État au départ" hint="Relevé contradictoire : propreté, carburant, kilométrage, dommages visibles.">
                  <input name="departureCondition" className="ox-input" style={FIELD} placeholder="Ex. Véhicule propre, plein fait" />
                </Field>
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--ice-border)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.04em" }}>Durée facturée</div>
                    <div style={{ fontWeight: 800, marginTop: 2 }}>{contractDays > 0 ? `${contractDays} jour(s)` : "Sélectionnez les dates"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total du contrat</div>
                    <div style={{ fontWeight: 800, marginTop: 2 }}>{contractTotal ? `${contractTotal.toLocaleString("fr-BJ")} FCFA` : "À calculer"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.04em" }}>Véhicule</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{selectedContractVehicle ? `${selectedContractVehicle.brand} ${selectedContractVehicle.model}` : "-"}</div>
                  </div>
                </div>
                <FormActions onCancel={close} submitLabel="Créer le contrat" />
              </form>
            )}

            {modal === "maintenance" && (
              <form
                action={createRentalMaintenance}
                onSubmit={close}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 10 }}
              >
                <Field label="Véhicule du parc *">
                  <select name="vehicleId" className="ox-select" style={FIELD} required defaultValue="">
                    <option value="" disabled>Sélectionner un véhicule</option>
                    {rentalVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model}{vehicle.registrationNumber ? ` - ${vehicle.registrationNumber}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Type d'intervention">
                  <select name="type" className="ox-select" style={FIELD} defaultValue="ENTRETIEN">
                    <option value="ENTRETIEN">Entretien</option>
                    <option value="VIDANGE">Vidange</option>
                    <option value="REPARATION">Réparation</option>
                    <option value="PNEUMATIQUES">Pneumatiques</option>
                    <option value="CONTROLE_TECHNIQUE">Contrôle technique</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </Field>
                <Field label="Statut">
                  <select name="status" className="ox-select" style={FIELD} defaultValue="PLANIFIE">
                    <option value="PLANIFIE">Planifié</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                  </select>
                </Field>
                <Field label="Description *"><input name="description" className="ox-input" style={FIELD} required placeholder="Ex. Vidange et filtres" /></Field>
                <Field label="Coût (FCFA)"><input name="costXof" type="number" min="0" className="ox-input" style={FIELD} placeholder="Ex. 25000" /></Field>
                <Field label="Garage / prestataire" hint="Garage CARZONE Godomè et intervenants habilités">
                  <select name="garageName" className="ox-select" style={FIELD} defaultValue="Garage CARZONE Godomè">
                    <option value="Garage CARZONE Godomè">Garage CARZONE Godomè</option>
                    {garageUsers.map((garageUser) => (
                      <option key={garageUser.id} value={garageUser.fullName}>
                        {garageUser.fullName} - {GARAGE_ROLE_LABELS[garageUser.role] || garageUser.role}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Date prévue"><input name="scheduledAt" type="date" className="ox-input" style={FIELD} /></Field>
                <Field label="Kilométrage (km)"><input name="mileage" type="number" min="0" inputMode="numeric" className="ox-input" style={FIELD} placeholder="Ex. 45000" /></Field>
                <Field label="Contrat lié (optionnel)" hint="Rattache l'entretien à une location en cours pour suivre le coût par contrat.">
                  <select name="rentalId" className="ox-select" style={FIELD} defaultValue="">
                    <option value="">Sans contrat lié</option>
                    {activeRentals.map((rental) => (
                      <option key={rental.id} value={rental.id}>
                        {rental.type} - {rental.customerName}
                      </option>
                    ))}
                  </select>
                </Field>
                <FormActions onCancel={close} submitLabel="Enregistrer l'entretien" />
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
      <label className="ox-label" style={{ margin: 0 }}>{label}</label>
      {children}
      {hint && <small style={{ opacity: 0.55, fontSize: "0.72rem", lineHeight: 1.35 }}>{hint}</small>}
    </div>
  );
}

function FormActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
      <button type="button" onClick={onCancel} className="ox-btn ox-btn-ghost">Annuler</button>
      <button type="submit" className="ox-btn ox-btn-primary">{submitLabel}</button>
    </div>
  );
}
