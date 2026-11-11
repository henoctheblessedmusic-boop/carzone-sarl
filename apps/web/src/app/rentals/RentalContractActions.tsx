"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteRentalContract, updateRentalContract } from "./actions";
import { RentalModal } from "./RentalModal";

type ContractRow = {
  id: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  dailyXof: number | null;
  monthlyXof: number | null;
  depositXof: number | null;
  departureCondition: string | null;
  notes: string | null;
  paymentCount: number;
};

const FIELD = { width: "100%", height: 38, fontSize: "0.86rem" } as const;

export function RentalContractActions({ rental }: { rental: ContractRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, startDeletion] = useTransition();

  // La ligne disparait du tableau des que la suppression aboutit : le composant
  // est demonte alors que la transition tourne encore.
  const isAlive = useRef(true);
  useEffect(() => {
    isAlive.current = true;
    return () => {
      isAlive.current = false;
    };
  }, []);

  function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isDeleting) return;
    const formData = new FormData(event.currentTarget);
    setDeleteError("");
    startDeletion(async () => {
      try {
        await deleteRentalContract(formData);
        if (!isAlive.current) return;
        setConfirmDelete(false);
        router.refresh();
      } catch (error) {
        if (!isAlive.current) return;
        setDeleteError(error instanceof Error ? error.message : "La suppression n'a pas abouti. Reessayez.");
      }
    });
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button type="button" className="ox-btn ox-btn-ghost ox-btn-sm" onClick={() => setEditing(true)}>
        <Pencil size={13} /> Modifier
      </button>
      <button
        type="button"
        className="ox-btn ox-btn-ghost ox-btn-sm"
        disabled={rental.paymentCount > 0}
        title={rental.paymentCount > 0 ? "Ce contrat contient des encaissements." : "Supprimer le contrat"}
        onClick={() => setConfirmDelete(true)}
      >
        <Trash2 size={13} /> Supprimer
      </button>

      {confirmDelete && (
        <RentalModal title="Supprimer ce contrat ?" onClose={() => setConfirmDelete(false)} busy={isDeleting}>
          <p style={{ margin: "0 0 14px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Le contrat sera définitivement supprimé. Le véhicule sera remis à disposition s&apos;il était actif.
            {rental.paymentCount > 0 ? " Suppression impossible : des encaissements existent." : ""}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="ox-btn ox-btn-ghost" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>Annuler</button>
            <form onSubmit={handleDelete}>
              <input type="hidden" name="id" value={rental.id} />
              <button type="submit" className="ox-btn ox-btn-primary" disabled={rental.paymentCount > 0 || isDeleting}>
                {isDeleting ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </form>
          </div>
          {deleteError ? (
            <div role="alert" style={{ marginTop: 10, padding: "8px 10px", borderRadius: 8, background: "var(--danger-soft)", color: "var(--danger-fg)", fontSize: "0.8rem" }}>
              {deleteError}
            </div>
          ) : null}
        </RentalModal>
      )}

      {editing && (
        <RentalModal title="Modifier le contrat de location" onClose={() => setEditing(false)}>
          <form action={updateRentalContract} style={{ display: "grid", gap: 10 }}>
            <input type="hidden" name="id" value={rental.id} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 10 }}>
              <Field label="Type de contrat">
                <select name="type" defaultValue={rental.type} className="ox-select" style={FIELD}>
                  <option value="LCD">LCD</option>
                  <option value="LLD">LLD</option>
                  <option value="LOA">LOA</option>
                </select>
              </Field>
              <Field label="Date de début *"><input name="startDate" type="date" required defaultValue={rental.startDate} className="ox-input" style={FIELD} /></Field>
              <Field label="Date de fin *"><input name="endDate" type="date" required defaultValue={rental.endDate || ""} className="ox-input" style={FIELD} /></Field>
              <Field label="Tarif / jour (FCFA)"><input name="dailyXof" type="number" min="0" defaultValue={rental.dailyXof || ""} className="ox-input" style={FIELD} /></Field>
              <Field label="Tarif / mois (FCFA)"><input name="monthlyXof" type="number" min="0" defaultValue={rental.monthlyXof || ""} className="ox-input" style={FIELD} /></Field>
              <Field label="Caution (FCFA)"><input name="depositXof" type="number" min="0" defaultValue={rental.depositXof || ""} className="ox-input" style={FIELD} /></Field>
            </div>
            <Field label="État au départ"><input name="departureCondition" defaultValue={rental.departureCondition || ""} className="ox-input" style={FIELD} /></Field>
            <Field label="Notes"><textarea name="notes" defaultValue={rental.notes || ""} rows={3} className="ox-input" style={{ width: "100%", fontSize: "0.86rem" }} /></Field>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
              <button type="button" className="ox-btn ox-btn-ghost" onClick={() => setEditing(false)}>Annuler</button>
              <button type="submit" className="ox-btn ox-btn-primary">Enregistrer</button>
            </div>
          </form>
        </RentalModal>
      )}
    </div>
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
