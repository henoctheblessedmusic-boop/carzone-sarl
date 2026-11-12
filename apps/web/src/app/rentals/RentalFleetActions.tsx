"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { transferVehicleToShowroom, updateRentalVehicle } from "./actions";
import { CONFIRMATION_WORD, isConfirmationWord } from "./confirmation";
import { RentalModal } from "./RentalModal";

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
  rentalDailyWithDriverXof: number | null;
  rentalDailyWithoutDriverXof: number | null;
  mileage: number;
};

const FIELD = { width: "100%", height: 38, fontSize: "0.86rem" } as const;

export function RentalFleetActions({ vehicle, hasActive }: { vehicle: FleetVehicle; hasActive: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [removeWord, setRemoveWord] = useState("");
  const [isRemoving, startRemoval] = useTransition();

  // La ligne disparait du tableau des que le retrait aboutit : le composant est
  // alors demonte alors que la transition tourne encore. On ne touche plus a
  // l'etat apres ce point.
  const isAlive = useRef(true);
  useEffect(() => {
    isAlive.current = true;
    return () => {
      isAlive.current = false;
    };
  }, []);

  function openRemoval() {
    setRemoveWord("");
    setRemoveError("");
    setConfirmRemove(true);
  }

  function closeRemoval() {
    setConfirmRemove(false);
    setRemoveWord("");
    setRemoveError("");
  }

  function handleRemove(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isRemoving) return;

    if (!isConfirmationWord(removeWord)) {
      setRemoveError(`Saisissez exactement ${CONFIRMATION_WORD} pour confirmer le retrait.`);
      return;
    }

    const formData = new FormData();
    formData.set("vehicleId", vehicle.id);
    formData.set("confirmation", removeWord.trim());
    setRemoveError("");

    startRemoval(async () => {
      try {
        const result = await transferVehicleToShowroom(formData);
        if (!isAlive.current) return;
        if (!result.ok) {
          setRemoveError(result.message);
          return;
        }
        setConfirmRemove(false);
        setRemoveWord("");
        // Rafraichissement cible du rendu serveur : la ligne disparait sans
        // rechargement complet de la page.
        router.refresh();
      } catch {
        if (!isAlive.current) return;
        setRemoveError("Le retrait n'a pas abouti. Verifiez votre connexion puis reessayez.");
      }
    });
  }

  const canSubmitRemoval = isConfirmationWord(removeWord) && !isRemoving;
  // Le bouton desactive seul n'explique pas pourquoi il l'est : on le dit.
  const showWordHint = removeWord.trim().length > 0 && !isConfirmationWord(removeWord);

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
          onClick={openRemoval}
        >
          <Trash2 size={13} /> Retirer du parc
        </button>
      </div>

      {confirmRemove && (
        <RentalModal title="Retirer ce véhicule du parc ?" onClose={closeRemoval} busy={isRemoving}>
          <form onSubmit={handleRemove}>
            <p style={{ margin: "0 0 10px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {vehicle.brand} {vehicle.model} {vehicle.registrationNumber ? `(${vehicle.registrationNumber})` : ""} sera retiré de la base locative et remis dans le stock showroom.
              Cette action ne supprime pas la fiche véhicule.
            </p>
            <label style={{ display: "grid", gap: 5, marginBottom: 14, fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Saisissez <strong style={{ color: "var(--danger-fg)" }}>{CONFIRMATION_WORD}</strong> pour confirmer
              <input
                value={removeWord}
                onChange={(event) => {
                  setRemoveWord(event.target.value);
                  setRemoveError("");
                }}
                className="ox-input"
                autoComplete="off"
                autoFocus
                disabled={isRemoving}
                placeholder={CONFIRMATION_WORD}
                aria-invalid={removeError ? true : undefined}
                style={{ maxWidth: 260, height: 38 }}
              />
              {showWordHint ? (
                <span style={{ color: "var(--danger-fg)", fontSize: "0.76rem" }}>
                  Le mot doit être saisi exactement : {CONFIRMATION_WORD}.
                </span>
              ) : null}
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="ox-btn ox-btn-ghost" onClick={closeRemoval} disabled={isRemoving}>
                Annuler
              </button>
              <button type="submit" className="ox-btn ox-btn-primary" disabled={!canSubmitRemoval}>
                {isRemoving ? "Retrait en cours..." : "Confirmer le retrait"}
              </button>
            </div>
          </form>
          {removeError ? (
            <div role="alert" style={{ marginTop: 10, padding: "8px 10px", borderRadius: 8, background: "var(--danger-soft)", color: "var(--danger-fg)", fontSize: "0.8rem" }}>
              {removeError}
            </div>
          ) : null}
        </RentalModal>
      )}

      {editing && (
        <RentalModal title="Modifier le véhicule de location" onClose={() => setEditing(false)}>
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
              <Field label="Tarif / jour avec chauffeur"><input name="rentalDailyWithDriverXof" type="number" min="0" defaultValue={vehicle.rentalDailyWithDriverXof || ""} className="ox-input" style={FIELD} /></Field>
              <Field label="Tarif / jour sans chauffeur"><input name="rentalDailyWithoutDriverXof" type="number" min="0" defaultValue={vehicle.rentalDailyWithoutDriverXof || ""} className="ox-input" style={FIELD} /></Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
              <button type="button" className="ox-btn ox-btn-ghost" onClick={() => setEditing(false)}>Annuler</button>
              <button type="submit" className="ox-btn ox-btn-primary">Enregistrer</button>
            </div>
          </form>
        </RentalModal>
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
