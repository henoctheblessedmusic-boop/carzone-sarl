"use client";

import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { transferVehicleToShowroom, updateRentalVehicle } from "./actions";

type FleetVehicle = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  energy: string;
  vin: string | null;
  registrationNumber: string | null;
  rentalDailyXof: number | null;
  rentalMonthlyXof: number | null;
  mileage: number;
};

const FIELD = { width: "100%", height: 38, fontSize: "0.86rem" } as const;

export function RentalFleetActions({ vehicle, hasActive }: { vehicle: FleetVehicle; hasActive: boolean }) {
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="ox-btn ox-btn-ghost ox-btn-sm" onClick={() => setEditing(true)}>
          <Pencil size={13} /> Modifier
        </button>
        <button
          type="button"
          className="ox-btn ox-btn-ghost ox-btn-sm"
          disabled={hasActive}
          title={hasActive ? "Retournez d'abord le contrat actif." : "Retirer du parc de location"}
          onClick={() => setConfirmRemove(true)}
        >
          <Trash2 size={13} /> Retirer du parc
        </button>
      </div>

      {confirmRemove && (
        <Modal title="Retirer ce véhicule du parc ?" onClose={() => setConfirmRemove(false)}>
          <p style={{ margin: "0 0 14px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            {vehicle.brand} {vehicle.model} {vehicle.registrationNumber ? `(${vehicle.registrationNumber})` : ""} sera remis dans le stock showroom.
            Cette action ne supprime pas le véhicule.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="ox-btn ox-btn-ghost" onClick={() => setConfirmRemove(false)}>Annuler</button>
            <form action={transferVehicleToShowroom} onSubmit={() => setConfirmRemove(false)}>
              <input type="hidden" name="vehicleId" value={vehicle.id} />
              <button type="submit" className="ox-btn ox-btn-primary">Confirmer le retrait</button>
            </form>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal title="Modifier le véhicule de location" onClose={() => setEditing(false)}>
          <form action={updateRentalVehicle} style={{ display: "grid", gap: 10 }}>
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 10 }}>
              <Field label="Marque *"><input name="brand" defaultValue={vehicle.brand} required className="ox-input" style={FIELD} /></Field>
              <Field label="Modèle *"><input name="model" defaultValue={vehicle.model} required className="ox-input" style={FIELD} /></Field>
              <Field label="Version"><input name="variant" defaultValue={vehicle.variant || ""} className="ox-input" style={FIELD} /></Field>
              <Field label="Année"><input name="year" type="number" min="1900" max="2100" defaultValue={vehicle.year || ""} className="ox-input" style={FIELD} /></Field>
              <Field label="Énergie *"><input name="energy" defaultValue={vehicle.energy} required className="ox-input" style={FIELD} /></Field>
              <Field label="VIN *"><input name="vin" defaultValue={vehicle.vin || ""} required className="ox-input" style={FIELD} /></Field>
              <Field label="Immatriculation *"><input name="registrationNumber" defaultValue={vehicle.registrationNumber || ""} required className="ox-input" style={FIELD} /></Field>
              <Field label="Kilométrage"><input name="mileage" type="number" min="0" defaultValue={vehicle.mileage} className="ox-input" style={FIELD} /></Field>
              <Field label="Tarif / jour (FCFA)"><input name="rentalDailyXof" type="number" min="0" defaultValue={vehicle.rentalDailyXof || ""} className="ox-input" style={FIELD} /></Field>
              <Field label="Tarif / mois (FCFA)"><input name="rentalMonthlyXof" type="number" min="0" defaultValue={vehicle.rentalMonthlyXof || ""} className="ox-input" style={FIELD} /></Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
              <button type="button" className="ox-btn ox-btn-ghost" onClick={() => setEditing(false)}>Annuler</button>
              <button type="submit" className="ox-btn ox-btn-primary">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 4, fontSize: "0.76rem", color: "var(--text-muted)" }}>
      {label}
      {children}
    </label>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 1200, display: "grid", placeItems: "center", padding: "1rem", background: "var(--surface-overlay)", backdropFilter: "blur(8px)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        style={{ width: "min(720px,100%)", maxHeight: "90vh", overflowY: "auto", padding: "1.2rem", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <strong>{title}</strong>
          <button type="button" onClick={onClose} aria-label="Fermer" className="ox-btn ox-btn-ghost ox-btn-sm"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
