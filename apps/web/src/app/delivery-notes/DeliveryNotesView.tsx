"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Printer, Ban, Truck } from "lucide-react";
import { formatXof, formatDate } from "@/lib/format";
import { usePrefs } from "@/components/PrefsProvider";
import { deliveryNotesCopy } from "@/lib/i18n/messages/delivery-notes";
import { createAndIssueDeliveryNote, cancelDeliveryNote } from "./actions";

export type DeliveryNoteItem = {
  id: string;
  number: string;
  activity: string;
  status: string;
  notes: string | null;
  cancelReason: string | null;
  cancelledByName: string | null;
  cancelledAt: string | null;
  createdByName: string;
  createdAt: string;
  customer: { id: string; contactName: string; companyName: string | null } | null;
  lines: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPriceXof: number | null;
    vehicle: { brand: string; model: string; vin: string | null } | null;
    partItem: { partNumber: string; name: string } | null;
  }>;
};

type CustomerOption = {
  id: string;
  contactName: string;
  companyName: string | null;
  scopeShowroom: boolean;
  scopeGarage: boolean;
};
type VehicleOption = { id: string; vin: string | null; brand: string; model: string; priceXof: number };
type PartOption = { id: string; partNumber: string; name: string; stockQuantity: number; sellingPriceXof: number };

type DraftLine = {
  key: string;
  kind: "VEHICLE" | "PART";
  refId: string;
  description: string;
  quantity: number;
  unitPriceXof: number;
};

export function DeliveryNotesView({
  notes,
  customers,
  vehicles,
  parts,
  userRole,
}: {
  notes: DeliveryNoteItem[];
  customers: CustomerOption[];
  vehicles: VehicleOption[];
  parts: PartOption[];
  userRole: string;
}) {
  const { locale } = usePrefs();
  const copy = deliveryNotesCopy[locale];
  const [isPending, startTransition] = useTransition();

  const isGarageOnly = userRole === "COMPTA_GARAGE";

  const [activityFilter, setActivityFilter] = useState<"ALL" | "SHOWROOM" | "GARAGE">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "EMIS" | "ANNULE">("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<DeliveryNoteItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [activity, setActivity] = useState<"SHOWROOM" | "GARAGE">("GARAGE");
  const [customerId, setCustomerId] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);

  const showActivityToggle = notes.some((n) => n.activity === "GARAGE") && notes.some((n) => n.activity === "SHOWROOM");

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (activityFilter !== "ALL" && n.activity !== activityFilter) return false;
      if (statusFilter !== "ALL" && n.status !== statusFilter) return false;
      return true;
    });
  }, [notes, activityFilter, statusFilter]);

  function addVehicleLine() {
    setLines((prev) => [
      ...prev,
      { key: crypto.randomUUID(), kind: "VEHICLE", refId: "", description: "", quantity: 1, unitPriceXof: 0 },
    ]);
  }

  function addPartLine() {
    setLines((prev) => [
      ...prev,
      { key: crypto.randomUUID(), kind: "PART", refId: "", description: "", quantity: 1, unitPriceXof: 0 },
    ]);
  }

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  function pickVehicle(key: string, vehicleId: string) {
    const v = vehicles.find((x) => x.id === vehicleId);
    updateLine(key, {
      refId: vehicleId,
      description: v ? `${v.brand} ${v.model}${v.vin ? ` (VIN ${v.vin})` : ""}` : "",
      unitPriceXof: v ? v.priceXof : 0,
    });
  }

  function pickPart(key: string, partItemId: string) {
    const p = parts.find((x) => x.id === partItemId);
    updateLine(key, {
      refId: partItemId,
      description: p ? `${p.name} (${p.partNumber})` : "",
      unitPriceXof: p ? p.sellingPriceXof : 0,
    });
  }

  function resetForm() {
    setActivity("GARAGE");
    setCustomerId("");
    setDraftNotes("");
    setLines([]);
    setError(null);
  }

  function handleCreate() {
    const validLines = lines.filter((l) => l.refId && l.description.trim().length > 0);
    if (validLines.length === 0) {
      setError(copy.createModal.atLeastOneLine);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createAndIssueDeliveryNote({
          activity,
          customerId: customerId || null,
          notes: draftNotes.trim() || null,
          lines: validLines.map((l) => ({
            description: l.description.trim(),
            quantity: Number(l.quantity) || 1,
            unitPriceXof: Number(l.unitPriceXof) || 0,
            vehicleId: l.kind === "VEHICLE" ? l.refId : null,
            partItemId: l.kind === "PART" ? l.refId : null,
          })),
        });
        resetForm();
        setShowCreate(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur lors de la création du bon de livraison.");
      }
    });
  }

  function handleCancel() {
    if (!cancelTarget) return;
    if (cancelReason.trim().length < 8) {
      setError(copy.actions.cancelTooShort);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("id", cancelTarget.id);
        fd.set("cancelReason", cancelReason.trim());
        await cancelDeliveryNote(fd);
        setCancelTarget(null);
        setCancelReason("");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'annulation.");
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 750 }}>{copy.title}</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--ice-text-muted)" }}>{copy.subtitle}</p>
        </div>
        <button className="ox-btn" onClick={() => setShowCreate(true)}>
          <Plus size={16} style={{ marginRight: 6 }} />
          {copy.actions.create}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {showActivityToggle && (
          <div style={{ display: "flex", gap: 4 }}>
            {(["ALL", "SHOWROOM", "GARAGE"] as const).map((id) => (
              <button
                key={id}
                className="ox-btn ox-btn-sm"
                onClick={() => setActivityFilter(id)}
                style={{
                  background: activityFilter === id ? "rgba(197,216,228,0.25)" : "transparent",
                  color: activityFilter === id ? "#fff" : "rgba(255,255,255,0.65)",
                }}
              >
                {id === "ALL" ? copy.tabs.all : id === "SHOWROOM" ? copy.tabs.showroom : copy.tabs.garage}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 4 }}>
          {(["ALL", "EMIS", "ANNULE"] as const).map((id) => (
            <button
              key={id}
              className="ox-btn ox-btn-sm"
              onClick={() => setStatusFilter(id)}
              style={{
                background: statusFilter === id ? "rgba(197,216,228,0.25)" : "transparent",
                color: statusFilter === id ? "#fff" : "rgba(255,255,255,0.65)",
              }}
            >
              {id === "ALL" ? copy.statusFilters.all : id === "EMIS" ? copy.statusFilters.issued : copy.statusFilters.cancelled}
            </button>
          ))}
        </div>
      </div>

      <div className="ox-glass" style={{ borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", textAlign: "left", opacity: 0.75 }}>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.table.number}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.table.activity}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.table.customer}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.table.lines}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.table.status}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.table.createdAt}</th>
                <th style={{ padding: "0.85rem 1rem" }}>{copy.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "1.5rem", textAlign: "center", opacity: 0.6 }}>
                    {copy.table.empty}
                  </td>
                </tr>
              ) : (
                filteredNotes.map((n) => (
                  <tr key={n.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding: "0.7rem 1rem", fontWeight: 700 }}>{n.number}</td>
                    <td style={{ padding: "0.7rem 1rem" }}>{n.activity === "GARAGE" ? copy.tabs.garage : copy.tabs.showroom}</td>
                    <td style={{ padding: "0.7rem 1rem" }}>
                      {n.customer ? n.customer.companyName || n.customer.contactName : "-"}
                    </td>
                    <td style={{ padding: "0.7rem 1rem" }}>{n.lines.length}</td>
                    <td style={{ padding: "0.7rem 1rem" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background: n.status === "EMIS" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                          color: n.status === "EMIS" ? "#10b981" : "#ef4444",
                        }}
                      >
                        {n.status === "EMIS" ? copy.status.EMIS : copy.status.ANNULE}
                      </span>
                    </td>
                    <td style={{ padding: "0.7rem 1rem" }}>{formatDate(n.createdAt)}</td>
                    <td style={{ padding: "0.7rem 1rem", display: "flex", gap: 6 }}>
                      <Link href={`/delivery-notes/${n.id}/print`} target="_blank" className="ox-btn ox-btn-sm ox-btn-ghost" title={copy.actions.print}>
                        <Printer size={14} />
                      </Link>
                      {n.status === "EMIS" && (
                        <button
                          className="ox-btn ox-btn-sm ox-btn-ghost"
                          title={copy.actions.cancel}
                          onClick={() => {
                            setCancelTarget(n);
                            setCancelReason("");
                            setError(null);
                          }}
                        >
                          <Ban size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="ox-modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="ox-modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{copy.createModal.title}</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label>
                {copy.createModal.activity}
                <select
                  className="ox-input"
                  value={activity}
                  disabled={isGarageOnly}
                  onChange={(e) => {
                    setActivity(e.target.value as "SHOWROOM" | "GARAGE");
                    setCustomerId("");
                  }}
                >
                  <option value="GARAGE">{copy.tabs.garage}</option>
                  <option value="SHOWROOM">{copy.tabs.showroom}</option>
                </select>
              </label>

              <label>
                {copy.createModal.customer}
                <select className="ox-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">{copy.createModal.customerPlaceholder}</option>
                  {customers
                    .filter((c) => (activity === "GARAGE" ? c.scopeGarage : c.scopeShowroom))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName || c.contactName}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                {copy.createModal.notes}
                <textarea className="ox-input" value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} rows={2} />
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lines.map((l) => (
                  <div key={l.key} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {l.kind === "VEHICLE" ? (
                      <select className="ox-input" value={l.refId} onChange={(e) => pickVehicle(l.key, e.target.value)}>
                        <option value="">{copy.createModal.lineVehicle}</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.brand} {v.model} {v.vin ? `(${v.vin})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select className="ox-input" value={l.refId} onChange={(e) => pickPart(l.key, e.target.value)}>
                        <option value="">{copy.createModal.linePart}</option>
                        {parts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.partNumber}) - stock {p.stockQuantity}
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      type="number"
                      min={1}
                      className="ox-input"
                      style={{ width: 70 }}
                      value={l.quantity}
                      onChange={(e) => updateLine(l.key, { quantity: Number(e.target.value) || 1 })}
                      title={copy.createModal.quantity}
                    />
                    <span style={{ fontSize: "0.8rem", minWidth: 90, textAlign: "right" }}>
                      {formatXof(l.unitPriceXof)}
                    </span>
                    <button className="ox-btn ox-btn-sm ox-btn-ghost" onClick={() => removeLine(l.key)}>
                      ✕
                    </button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="ox-btn ox-btn-sm ox-btn-ghost" onClick={addVehicleLine}>
                    {copy.createModal.addVehicleLine}
                  </button>
                  <button className="ox-btn ox-btn-sm ox-btn-ghost" onClick={addPartLine}>
                    {copy.createModal.addPartLine}
                  </button>
                </div>
              </div>

              {error && <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button className="ox-btn ox-btn-ghost" onClick={() => setShowCreate(false)}>
                  {copy.createModal.cancel}
                </button>
                <button className="ox-btn" disabled={isPending} onClick={handleCreate}>
                  <Truck size={16} style={{ marginRight: 6 }} />
                  {copy.createModal.submit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="ox-modal-backdrop" onClick={() => setCancelTarget(null)}>
          <div className="ox-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{copy.actions.cancelConfirmTitle}</h3>
            <p style={{ fontSize: "0.85rem" }}>{cancelTarget.number}</p>
            <textarea
              className="ox-input"
              rows={3}
              placeholder={copy.actions.cancelReasonPlaceholder}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            {error && <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: 6 }}>{error}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
              <button className="ox-btn ox-btn-ghost" onClick={() => setCancelTarget(null)}>
                {copy.createModal.cancel}
              </button>
              <button className="ox-btn" disabled={isPending} onClick={handleCancel}>
                {copy.actions.cancelSubmit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
