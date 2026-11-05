"use client";

import { useState, type ReactNode } from "react";
import { Car, FilePlus2, Wrench, X } from "lucide-react";
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
};

type CustomerOption = {
  id: string;
  contactName: string;
  companyName: string | null;
};

type ActiveRentalOption = {
  id: string;
  type: string;
  customerName: string;
};

type ModalKind = "vehicle" | "contract" | "maintenance" | null;

const FIELD = { height: 40, fontSize: "0.88rem" } as const;

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
  activeRentals,
}: {
  rentalVehicles: VehicleOption[];
  availableVehicles: VehicleOption[];
  customers: CustomerOption[];
  activeRentals: ActiveRentalOption[];
}) {
  const [modal, setModal] = useState<ModalKind>(null);

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
              onClick={() => setModal(key)}
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
                <Field label="Marque *"><input name="brand" className="ox-input" style={FIELD} required placeholder="Ex. Toyota" /></Field>
                <Field label="Modèle *"><input name="model" className="ox-input" style={FIELD} required placeholder="Ex. Corolla" /></Field>
                <Field label="Nom / version"><input name="variant" className="ox-input" style={FIELD} placeholder="Ex. 1.8 Hybride" /></Field>
                <Field label="Année"><input name="year" type="number" min="1900" max="2100" className="ox-input" style={FIELD} placeholder="Ex. 2026" /></Field>
                <Field label="Énergie *">
                  <select name="energy" className="ox-select" style={FIELD} required defaultValue="ESSENCE">
                    <option value="ESSENCE">Essence</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRIDE">Hybride</option>
                    <option value="HYBRIDE_RECHARGEABLE">Hybride rechargeable</option>
                    <option value="ELECTRIQUE">Électrique</option>
                  </select>
                </Field>
                <Field label="Prix du véhicule (FCFA) *"><input name="priceXof" type="number" min="1" className="ox-input" style={FIELD} required placeholder="Ex. 12000000" /></Field>
                <Field label="Tarif location / jour (FCFA)"><input name="rentalDailyXof" type="number" min="0" className="ox-input" style={FIELD} placeholder="Ex. 35000" /></Field>
                <Field label="Tarif location / mois (FCFA)"><input name="rentalMonthlyXof" type="number" min="0" className="ox-input" style={FIELD} placeholder="Ex. 750000" /></Field>
                <Field label="Numéro de châssis (VIN) *"><input name="vin" className="ox-input" style={FIELD} required placeholder="Ex. JTDBR32E720123456" autoComplete="off" /></Field>
                <Field label="Plaque d'immatriculation *"><input name="registrationNumber" className="ox-input" style={FIELD} required placeholder="Ex. AB 1234 RB" autoComplete="off" /></Field>
                <Field label="Kilométrage"><input name="mileage" type="number" min="0" className="ox-input" style={FIELD} placeholder="0" /></Field>
                <Field label="Type">
                  <select name="vehicleType" className="ox-select" style={FIELD} defaultValue="">
                    <option value="">Non précisé</option>
                    <option value="BERLINE">Berline</option>
                    <option value="SUV">SUV</option>
                    <option value="PICKUP">Pick-up</option>
                    <option value="VAN">Van</option>
                  </select>
                </Field>
                <Field label="Couleur"><input name="color" className="ox-input" style={FIELD} placeholder="Ex. Blanc" /></Field>
                <Field label="Transmission"><input name="transmission" className="ox-input" style={FIELD} placeholder="Ex. Automatique" /></Field>
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
                  <select name="vehicleId" className="ox-select" style={FIELD} required defaultValue="">
                    <option value="" disabled>Sélectionner un véhicule</option>
                    {availableVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model}{vehicle.registrationNumber ? ` - ${vehicle.registrationNumber}` : vehicle.vin ? ` - ${vehicle.vin}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Date de début *"><input name="startDate" type="date" className="ox-input" style={FIELD} required /></Field>
                <Field label="Date de fin"><input name="endDate" type="date" className="ox-input" style={FIELD} /></Field>
                <Field label="Tarif mensuel (FCFA)"><input name="monthlyXof" type="number" min="0" className="ox-input" style={FIELD} placeholder="Ex. 150000" /></Field>
                <Field label="Caution (FCFA)"><input name="depositXof" type="number" min="0" className="ox-input" style={FIELD} placeholder="Ex. 500000" /></Field>
                <Field label="État au départ"><input name="departureCondition" className="ox-input" style={FIELD} placeholder="Ex. Véhicule propre, plein fait" /></Field>
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
                <Field label="Garage / prestataire"><input name="garageName" className="ox-input" style={FIELD} placeholder="Ex. Garage partenaire" /></Field>
                <Field label="Date prévue"><input name="scheduledAt" type="date" className="ox-input" style={FIELD} /></Field>
                <Field label="Kilométrage"><input name="mileage" type="number" min="0" className="ox-input" style={FIELD} placeholder="Ex. 45000" /></Field>
                <Field label="Contrat lié (optionnel)">
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
      <label className="ox-label" style={{ margin: 0 }}>{label}</label>
      {children}
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
