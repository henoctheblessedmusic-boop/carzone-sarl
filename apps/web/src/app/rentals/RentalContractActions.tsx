"use client";

import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteRentalContract, updateRentalContract } from "./actions";

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
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
        <Modal title="Supprimer ce contrat ?" onClose={() => setConfirmDelete(false)}>
          <p style={{ margin: "0 0 14px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Le contrat sera définitivement supprimé. Le véhicule sera remis à disposition s&apos;il était actif.
            {rental.paymentCount > 0 ? " Suppression impossible : des encaissements existent." : ""}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="ox-btn ox-btn-ghost" onClick={() => setConfirmDelete(false)}>Annuler</button>
            <form action={deleteRentalContract} onSubmit={() => setConfirmDelete(false)}>
              <input type="hidden" name="id" value={rental.id} />
              <button type="submit" className="ox-btn ox-btn-primary" disabled={rental.paymentCount > 0}>Confirmer la suppression</button>
            </form>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal title="Modifier le contrat de location" onClose={() => setEditing(false)}>
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
        </Modal>
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
