"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Package, Search, ShoppingCart, Trash2, Truck } from "lucide-react";
import { formatXof } from "@/lib/format";
import { PART_SYSTEMS, partSystemLabel } from "@/lib/parts-taxonomy";
import { createGeneralPartOrder, updateGeneralPartOrderTracking } from "./actions";

export type GeneralPartView = {
  id: string;
  reference: string;
  oemReference: string | null;
  name: string;
  system: string | null;
  subcategory: string | null;
  manufacturer: string | null;
  description: string | null;
  unit: string;
  references: Array<{
    id: string;
    reference: string;
    brand: string;
    referenceType: string;
    isDirectFit: boolean;
    notes: string | null;
    sourceType: string | null;
    sourceRef: string | null;
    verifiedAt: string | null;
  }>;
  compatibilities: Array<{
    id: string;
    vehicleBrand: string;
    vehicleModel: string;
    years: string | null;
    engine: string | null;
    position: string | null;
  }>;
};

export type GeneralPartOrderView = {
  id: string;
  number: string;
  supplierName: string;
  status: string;
  orderedAt: string;
  expectedAt: string | null;
  receivedAt: string | null;
  totalXof: number;
  notes: string | null;
  lines: Array<{
    id: string;
    reference: string;
    name: string;
    quantity: number;
    unitPriceXof: number | null;
  }>;
};

export type GeneralSupplierView = { id: string; name: string; country: string | null };

const STATUS_LABELS: Record<string, string> = {
  COMMANDE: "Commandée",
  EN_TRANSIT: "En transit",
  AU_PORT: "Au port",
  EN_MAGASIN: "Au magasin",
  ANNULE: "Annulée",
};

const TIMELINE = ["COMMANDE", "EN_TRANSIT", "AU_PORT", "EN_MAGASIN"];

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "Africa/Porto-Novo" }).format(new Date(value));
}

export function GeneralPartsCatalogView({
  parts,
  suppliers,
  orders,
  canOrder,
}: {
  parts: GeneralPartView[];
  suppliers: GeneralSupplierView[];
  orders: GeneralPartOrderView[];
  canOrder: boolean;
}) {
  const [search, setSearch] = useState("");
  const [systemFilter, setSystemFilter] = useState("ALL");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [expectedAt, setExpectedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const systems = useMemo(() => {
    const values = new Set(parts.map((part) => part.system || "AUTRE"));
    return Array.from(values).sort();
  }, [parts]);
  const brands = useMemo(() => {
    const values = new Set(parts.flatMap((part) => part.compatibilities.map((compatibility) => compatibility.vehicleBrand.toUpperCase())));
    return Array.from(values).sort();
  }, [parts]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return parts.filter((part) => {
      if (systemFilter !== "ALL" && (part.system || "AUTRE") !== systemFilter) return false;
      if (brandFilter !== "ALL" && !part.compatibilities.some((compatibility) => compatibility.vehicleBrand.toUpperCase() === brandFilter)) return false;
      if (!query) return true;
      const haystack = [
        part.reference,
        part.oemReference,
        part.name,
        part.manufacturer,
        part.system,
        part.subcategory,
        ...part.references.flatMap((reference) => [reference.reference, reference.brand]),
        ...part.compatibilities.flatMap((compatibility) => [compatibility.vehicleBrand, compatibility.vehicleModel]),
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [parts, search, systemFilter, brandFilter]);

  const selectedLines = useMemo(
    () =>
      Array.from(selected.entries())
        .map(([partId, quantity]) => {
          const part = parts.find((item) => item.id === partId);
          return part ? { part, quantity } : null;
        })
        .filter((line): line is NonNullable<typeof line> => Boolean(line)),
    [selected, parts]
  );

  function togglePart(partId: string) {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(partId)) next.delete(partId);
      else next.set(partId, 1);
      return next;
    });
  }

  async function submitOrder() {
    setError(null);
    setMessage(null);
    if (selectedLines.length === 0) {
      setError("Sélectionnez au moins une référence.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createGeneralPartOrder({
        supplierId: supplierId || null,
        expectedAt: expectedAt || null,
        notes,
        lines: selectedLines.map((line) => ({
          generalPartId: line.part.id,
          quantity: line.quantity,
          unitPriceXof: null,
        })),
      });
      setMessage(`Commande ${result.number} enregistrée.`);
      setSelected(new Map());
      setNotes("");
      setExpectedAt("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossible de créer la commande.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <div className="ox-glass" style={{ padding: "1.2rem", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/dashboard" className="ox-btn ox-btn-ghost ox-btn-sm" style={{ padding: "4px 8px" }} title="Retour au tableau de bord"><ArrowLeft size={15} /></a>
            <h1 style={{ margin: 0, fontSize: "1.35rem" }}>Catalogue général des pièces</h1>
          </div>
          <p style={{ margin: "5px 0 0", opacity: 0.72, fontSize: "0.84rem" }}>
            Catalogue de référence indépendant du stock : consultez les constructeurs, les modèles compatibles et les références OEM pour préparer vos commandes.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="ox-badge ox-badge--ice"><Package size={13} /> {parts.length} références</span>
          <span className="ox-badge ox-badge--warn"><Truck size={13} /> {orders.length} commandes</span>
        </div>
      </div>

      <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 8 }}>
        <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
          Recherche
          <span style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 9, top: 10, opacity: 0.55 }} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="ox-input" style={{ paddingLeft: 28, width: "100%" }} placeholder="Référence, OEM, désignation..." />
          </span>
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
          Système
          <select value={systemFilter} onChange={(event) => setSystemFilter(event.target.value)} className="ox-select">
            <option value="ALL">Tous les systèmes</option>
            {systems.map((system) => <option key={system} value={system}>{partSystemLabel(system)}</option>)}
          </select>
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
          Constructeur / modèle
          <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} className="ox-select">
            <option value="ALL">Tous les constructeurs</option>
            {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
          </select>
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
          Fournisseur de commande
          <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="ox-select">
            <option value="">Non précisé</option>
            {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </select>
        </label>
      </div>

      <div className="ox-table-wrap">
        <table className="ox-table" style={{ fontSize: "0.78rem" }}>
          <thead>
            <tr>
              <th></th>
              <th>Référence / OEM</th>
              <th>Désignation</th>
              <th>Système</th>
              <th>Constructeurs & modèles compatibles</th>
              <th>Références croisées</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((part) => {
              const isSelected = selected.has(part.id);
              return (
                <tr key={part.id} style={{ background: isSelected ? "rgba(56,189,248,0.07)" : undefined }}>
                  <td><input type="checkbox" checked={isSelected} onChange={() => togglePart(part.id)} aria-label={`Sélectionner ${part.name}`} /></td>
                  <td>
                    <div style={{ fontFamily: "monospace", fontWeight: 700 }}>{part.reference}</div>
                    <div style={{ opacity: 0.65 }}>OEM : {part.oemReference || "-"}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 650 }}>{part.name}</div>
                    <div style={{ opacity: 0.65 }}>{part.manufacturer || "-"} · {part.unit}</div>
                  </td>
                  <td>{partSystemLabel(part.system || "AUTRE")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 300 }}>
                      {part.compatibilities.slice(0, 6).map((compatibility) => (
                        <span key={compatibility.id} className="ox-badge ox-badge--neutral" style={{ fontSize: "0.66rem" }} title={`${compatibility.years || ""} ${compatibility.engine || ""}`}>
                          {compatibility.vehicleBrand} {compatibility.vehicleModel}
                        </span>
                      ))}
                      {part.compatibilities.length > 6 && <span style={{ opacity: 0.6 }}>+{part.compatibilities.length - 6}</span>}
                      {part.compatibilities.length === 0 && <span style={{ opacity: 0.55 }}>À renseigner</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 260 }}>
                      {part.references.slice(0, 5).map((reference) => (
                        <span key={reference.id} className="ox-badge ox-badge--ice" style={{ fontSize: "0.66rem" }} title={`${reference.referenceType} · ${reference.isDirectFit ? "montage direct" : "adaptation"} · ${reference.sourceType ? `source: ${reference.sourceType}` : "source non renseignée"}`}>
                          {reference.brand} · {reference.reference}
                        </span>
                      ))}
                      {part.references.length > 5 && <span style={{ opacity: 0.6 }}>+{part.references.length - 5}</span>}
                    </div>
                    {part.references.length > 0 && !part.references.some((reference) => reference.verifiedAt) && (
                      <div style={{ fontSize: "0.66rem", color: "#fbbf24", marginTop: 3 }}>Référence non vérifiée - source à confirmer</div>
                    )}
                  </td>
                  <td>
                    <button type="button" className="ox-btn ox-btn-ghost ox-btn-sm" onClick={() => togglePart(part.id)}>
                      {isSelected ? <Check size={14} /> : <ShoppingCart size={14} />}
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "1.5rem", textAlign: "center", opacity: 0.65 }}>Aucune référence ne correspond à cette recherche.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {canOrder && (
        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <strong>Commande à préparer · {selectedLines.length} ligne(s)</strong>
            <span style={{ fontSize: "0.78rem", opacity: 0.65 }}>Les prix seront complétés par le fournisseur.</span>
          </div>
          {selectedLines.length === 0 ? (
            <div style={{ opacity: 0.65, fontSize: "0.84rem" }}>Cochez des références pour préparer une commande groupée.</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {selectedLines.map((line) => (
                <div key={line.part.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px auto", gap: 8, alignItems: "center", fontSize: "0.8rem", borderBottom: "1px solid var(--ice-border)", paddingBottom: 6 }}>
                  <div><strong>{line.part.reference}</strong> · {line.part.name}</div>
                  <input type="number" min={1} value={line.quantity} onChange={(event) => {
                    const quantity = Math.max(1, Number(event.target.value) || 1);
                    setSelected((current) => { const next = new Map(current); next.set(line.part.id, quantity); return next; });
                  }} className="ox-input" style={{ height: 30 }} />
                  <button type="button" className="ox-btn ox-btn-ghost ox-btn-sm" onClick={() => togglePart(line.part.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}><CalendarDays size={14} /> Date d&apos;arrivée prévue<input type="date" value={expectedAt} onChange={(event) => setExpectedAt(event.target.value)} className="ox-input" /></label>
            <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>Note<textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="ox-input" style={{ minHeight: 40 }} /></label>
          </div>
          {error && <p style={{ color: "#f87171", margin: 0, fontSize: "0.82rem" }}>{error}</p>}
          {message && <p style={{ color: "#4ade80", margin: 0, fontSize: "0.82rem" }}>{message}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="ox-btn ox-btn-primary" onClick={submitOrder} disabled={submitting || selectedLines.length === 0}>
              {submitting ? "Enregistrement..." : "Enregistrer la commande"}
            </button>
          </div>
        </div>
      )}

      <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <strong>Suivi des commandes de pièces</strong>
          <span style={{ fontSize: "0.78rem", opacity: 0.65 }}>Dates et progression jusqu&apos;au magasin</span>
        </div>
        {orders.length === 0 ? (
          <p style={{ opacity: 0.65, fontSize: "0.84rem", margin: 0 }}>Aucune commande enregistrée.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {orders.map((order) => {
              const currentIndex = TIMELINE.indexOf(order.status);
              return (
                <div key={order.id} style={{ border: "1px solid var(--ice-border)", borderRadius: 10, padding: "10px 12px", display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <div><strong>{order.number}</strong> · {order.supplierName}</div>
                    <span className="ox-badge ox-badge--ice">{STATUS_LABELS[order.status] || order.status}</span>
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: "0.78rem", opacity: 0.8 }}>
                    <span>Commandée le {formatDate(order.orderedAt)}</span>
                    <span>Arrivée prévue : {formatDate(order.expectedAt)}</span>
                    <span>Reçue : {formatDate(order.receivedAt)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                    {TIMELINE.map((stage, index) => (
                      <span key={stage} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: currentIndex >= index ? "#4ade80" : "var(--ice-text-muted)" }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: currentIndex >= index ? "#4ade80" : "var(--ice-border)" }} />
                        {STATUS_LABELS[stage]}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.78rem", opacity: 0.72 }}>{order.lines.map((line) => `${line.reference} x${line.quantity}`).join(" · ")}</div>
                  <form action={async (formData) => { await updateGeneralPartOrderTracking(formData); }} style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "end" }}>
                    <input type="hidden" name="id" value={order.id} />
                    <label style={{ display: "grid", gap: 3, fontSize: "0.72rem" }}>Statut
                      <select name="status" defaultValue={order.status} className="ox-select" style={{ height: 32 }}>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: 3, fontSize: "0.72rem" }}>Arrivée prévue
                      <input name="expectedAt" type="date" defaultValue={order.expectedAt?.slice(0, 10) || ""} className="ox-input" style={{ height: 32 }} />
                    </label>
                    <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm">Mettre à jour</button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
