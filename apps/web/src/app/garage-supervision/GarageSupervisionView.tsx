"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Printer,
  Wrench,
  X,
} from "lucide-react";
import { formatXof } from "@/lib/format";
import { approveWorkshopCost, saveWorkshopCost } from "./actions";

export type SupervisionEntry = {
  id: string;
  orNumber: string | null;
  entryDate: string | null;
  clientName: string;
  phone: string | null;
  immatriculation: string;
  chassis: string | null;
  brand: string | null;
  model: string | null;
  mileage: number | null;
  statusCode: string;
  worksDone: string | null;
  technicianName: string | null;
  workshopManagerName: string | null;
  interventionType: string | null;
  laborCostXof: number;
  partsCostXof: number;
  otherCostXof: number;
  costNotes: string | null;
  costStatus: string;
  costApprovedBy: string | null;
  costApprovedAt: string | null;
  createdAt: string;
};

const COST_STATUS_LABEL: Record<string, string> = {
  BROUILLON: "Brouillon",
  A_VALIDER: "À valider",
  VALIDE: "Validé",
};

const COST_STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  BROUILLON: {
    bg: "var(--text-disabled)",
    color: "var(--text-muted)",
    border: "var(--border-strong)",
  },
  A_VALIDER: {
    bg: "var(--warning)",
    color: "var(--warning-fg)",
    border: "var(--warning)",
  },
  VALIDE: {
    bg: "var(--success)",
    color: "var(--success-fg)",
    border: "var(--success)",
  },
};

function totalCost(entry: SupervisionEntry): number {
  return entry.laborCostXof + entry.partsCostXof + entry.otherCostXof;
}

export function GarageSupervisionView({
  entries,
  canApprove,
}: {
  entries: SupervisionEntry[];
  canApprove: boolean;
  isGarageAccountant: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<SupervisionEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const summary = useMemo(() => {
    const totals = entries.reduce(
      (acc, entry) => {
        acc.labor += entry.laborCostXof;
        acc.parts += entry.partsCostXof;
        acc.other += entry.otherCostXof;
        if (entry.costStatus === "A_VALIDER") acc.pending += 1;
        if (entry.costStatus === "VALIDE") acc.validated += 1;
        return acc;
      },
      { labor: 0, parts: 0, other: 0, pending: 0, validated: 0 }
    );
    return { ...totals, total: totals.labor + totals.parts + totals.other };
  }, [entries]);

  function submitCost(formData: FormData) {
    startTransition(async () => {
      try {
        setError(null);
        await saveWorkshopCost(formData);
        setEditing(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Enregistrement du coût impossible.");
      }
    });
  }

  function approve(entry: SupervisionEntry) {
    startTransition(async () => {
      try {
        setError(null);
        const formData = new FormData();
        formData.set("id", entry.id);
        await approveWorkshopCost(formData);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Validation du coût impossible.");
      }
    });
  }

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      <div className="ox-hero-card">
        <div>
          <div className="ox-hero-card-title">Supervision garage & coûts d&apos;intervention</div>
          <div className="ox-hero-card-sub">
            Passages atelier, maintenance et réparations · validation des coûts par la comptabilité
            garage
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/workshop" className="ox-btn ox-btn-ghost ox-quick-btn">
            <Wrench size={15} /> Atelier
          </Link>
          <Link href="/quotes" className="ox-btn ox-btn-ghost ox-quick-btn">
            <FileText size={15} /> Proformas garage
          </Link>
        </div>
      </div>

      <div className="ox-kpi-grid">
        <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--info)" }}>
          <div className="ox-kpi-label">Interventions suivies</div>
          <div className="ox-kpi-value">{entries.length}</div>
          <div className="ox-kpi-hint">{summary.pending} coût(s) à valider</div>
        </div>
        <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--warning)" }}>
          <div className="ox-kpi-label">Coût main-d&apos;œuvre</div>
          <div className="ox-kpi-value">{formatXof(summary.labor)}</div>
          <div className="ox-kpi-hint">Cumul des interventions</div>
        </div>
        <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--purple)" }}>
          <div className="ox-kpi-label">Coût pièces</div>
          <div className="ox-kpi-value">{formatXof(summary.parts)}</div>
          <div className="ox-kpi-hint">Pièces détachées</div>
        </div>
        <div className="ox-kpi-card" style={{ borderLeft: "4px solid var(--success)" }}>
          <div className="ox-kpi-label">Coût total interventions</div>
          <div className="ox-kpi-value">{formatXof(summary.total)}</div>
          <div className="ox-kpi-hint">{summary.validated} coût(s) validé(s)</div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "0.7rem 0.9rem",
            borderRadius: 10,
            border: "1px solid var(--danger)",
            background: "var(--danger-soft)",
            color: "var(--danger-fg)",
            fontSize: "0.86rem",
          }}
        >
          {error}
        </div>
      )}

      <div className="ox-table-wrap">
        <table className="ox-table" style={{ fontSize: "0.83rem" }}>
          <thead>
            <tr>
              <th>OR / Date</th>
              <th>Client / Véhicule</th>
              <th>Type</th>
              <th>Main-d&apos;œuvre</th>
              <th>Pièces</th>
              <th>Autres</th>
              <th>Total</th>
              <th>Validation</th>
              <th>Documents</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                  Aucun passage atelier enregistré.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const statusStyle = COST_STATUS_STYLE[entry.costStatus] || COST_STATUS_STYLE.BROUILLON;
                return (
                  <tr key={entry.id}>
                    <td>
                      <strong>{entry.orNumber || "-"}</strong>
                      <div style={{ opacity: 0.6, fontSize: "0.76rem" }}>
                        {entry.entryDate || entry.createdAt.slice(0, 10)}
                      </div>
                    </td>
                    <td>
                      <strong>{entry.clientName}</strong>
                      <div style={{ opacity: 0.7 }}>
                        {entry.immatriculation} · {entry.brand || ""} {entry.model || ""}
                      </div>
                      {entry.technicianName && (
                        <div style={{ opacity: 0.55, fontSize: "0.75rem" }}>
                          Technicien : {entry.technicianName}
                        </div>
                      )}
                    </td>
                    <td>{entry.interventionType || "REPARATION"}</td>
                    <td>{formatXof(entry.laborCostXof)}</td>
                    <td>{formatXof(entry.partsCostXof)}</td>
                    <td>{formatXof(entry.otherCostXof)}</td>
                    <td>
                      <strong>{formatXof(totalCost(entry))}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                        }}
                      >
                        {COST_STATUS_LABEL[entry.costStatus] || entry.costStatus}
                      </span>
                      {entry.costApprovedBy && (
                        <div style={{ opacity: 0.55, fontSize: "0.72rem", marginTop: 3 }}>
                          {entry.costApprovedBy}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link
                          href={`/workshop/${entry.id}/fiche-intervention`}
                          target="_blank"
                          title="Fiche d'intervention"
                          style={{ color: "var(--info-fg)" }}
                        >
                          <FileText size={15} />
                        </Link>
                        <Link
                          href={`/workshop/${entry.id}/fiche-entretien`}
                          target="_blank"
                          title="Fiche d'entretien"
                          style={{ color: "var(--purple-fg)" }}
                        >
                          <Printer size={15} />
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          onClick={() => {
                            setError(null);
                            setEditing(entry);
                          }}
                          disabled={isPending}
                        >
                          <Pencil size={13} style={{ marginRight: 4 }} />
                          Coûts
                        </button>
                        {canApprove && entry.costStatus !== "VALIDE" && (
                          <button
                            type="button"
                            className="ox-btn ox-btn-sm"
                            onClick={() => approve(entry)}
                            disabled={isPending}
                          >
                            <CheckCircle2 size={13} style={{ marginRight: 4 }} />
                            Valider
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface-sunken)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            zIndex: 1200,
            padding: 16,
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ox-glass"
            style={{ width: "100%", maxWidth: 620, maxHeight: "92vh", overflowY: "auto", padding: "1.4rem 1.5rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.08rem" }}>Coût de l&apos;intervention</h2>
                <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
                  {editing.orNumber || "OR"} · {editing.clientName} · {editing.immatriculation}
                </p>
              </div>
              <button
                type="button"
                className="ox-btn ox-btn-ghost"
                onClick={() => setEditing(null)}
                disabled={isPending}
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <form action={submitCost} style={{ display: "grid", gap: 12 }}>
              <input type="hidden" name="id" value={editing.id} />
              <label style={{ display: "grid", gap: 4, fontSize: "0.83rem" }}>
                Type d&apos;intervention
                <select
                  name="interventionType"
                  className="ox-select"
                  defaultValue={editing.interventionType || "REPARATION"}
                >
                  <option value="ENTRETIEN">Entretien</option>
                  <option value="REPARATION">Réparation</option>
                  <option value="DIAGNOSTIC">Diagnostic</option>
                  <option value="CARROSSERIE">Carrosserie</option>
                  <option value="MOTEUR">Moteur</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                <label style={{ display: "grid", gap: 4, fontSize: "0.83rem" }}>
                  Main-d&apos;œuvre (FCFA)
                  <input
                    type="number"
                    min={0}
                    name="laborCostXof"
                    className="ox-input"
                    defaultValue={editing.laborCostXof}
                  />
                </label>
                <label style={{ display: "grid", gap: 4, fontSize: "0.83rem" }}>
                  Pièces (FCFA)
                  <input
                    type="number"
                    min={0}
                    name="partsCostXof"
                    className="ox-input"
                    defaultValue={editing.partsCostXof}
                  />
                </label>
                <label style={{ display: "grid", gap: 4, fontSize: "0.83rem" }}>
                  Autres (FCFA)
                  <input
                    type="number"
                    min={0}
                    name="otherCostXof"
                    className="ox-input"
                    defaultValue={editing.otherCostXof}
                  />
                </label>
              </div>
              <label style={{ display: "grid", gap: 4, fontSize: "0.83rem" }}>
                Notes de coût
                <textarea
                  name="costNotes"
                  className="ox-input"
                  rows={3}
                  defaultValue={editing.costNotes || ""}
                  placeholder="Détail des pièces, sous-traitance, observations…"
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="ox-btn ox-btn-ghost"
                  onClick={() => setEditing(null)}
                  disabled={isPending}
                >
                  Annuler
                </button>
                <button type="submit" className="ox-btn" disabled={isPending}>
                  {isPending ? <Loader2 size={15} className="ox-spin" /> : <CheckCircle2 size={15} />}
                  <span style={{ marginLeft: 6 }}>Enregistrer (à valider)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
