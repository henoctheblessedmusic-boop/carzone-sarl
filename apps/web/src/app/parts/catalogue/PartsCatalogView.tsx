"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Package, Search, ShoppingCart, Trash2, Truck } from "lucide-react";
import { formatXof } from "@/lib/format";
import { PART_SYSTEMS, partSubcategoryLabel, partSystemLabel } from "@/lib/parts-taxonomy";
import { createPartOrder, updatePartOrderStatus } from "../actions";

export type CatalogPart = {
  id: string;
  partNumber: string;
  oemNumber: string | null;
  name: string;
  category: string;
  system: string | null;
  subcategory: string | null;
  manufacturer: string | null;
  description: string | null;
  unit: string;
  location: string | null;
  stockQuantity: number;
  minStockAlert: number;
  purchasePriceXof: number;
  sellingPriceXof: number;
  crossReferences: Array<{
    id: string;
    crossReference: string;
    brand: string;
    referenceType: string;
    isDirectFit: boolean;
    notes: string | null;
  }>;
  compatibilities: Array<{
    id: string;
    vehicleBrand: string;
    vehicleModel: string;
    years: string | null;
    engine: string | null;
    position: string | null;
    notes: string | null;
  }>;
  supplierOffers: Array<{
    id: string;
    supplierId: string;
    supplierName: string;
    supplierReference: string | null;
    purchasePriceXof: number;
    leadTimeDays: number | null;
    minOrderQty: number;
  }>;
};

export type CatalogSupplier = {
  id: string;
  name: string;
  type: string;
  country: string | null;
};

export type CatalogOrder = {
  id: string;
  number: string;
  supplierName: string;
  status: string;
  totalXof: number;
  createdAt: string;
  lines: Array<{
    id: string;
    partNumber: string;
    name: string;
    quantity: number;
    unitPriceXof: number;
    totalXof: number;
  }>;
};

const ORDER_STATUS: Record<string, string> = {
  BROUILLON: "Brouillon",
  CONFIRMEE: "Confirmée",
  RECUE: "Reçue",
  ANNULEE: "Annulée",
};

export function PartsCatalogView({
  parts,
  suppliers,
  orders,
  brandOptions,
  canOrder,
}: {
  parts: CatalogPart[];
  suppliers: CatalogSupplier[];
  orders: CatalogOrder[];
  brandOptions: string[];
  canOrder: boolean;
}) {
  const [search, setSearch] = useState("");
  const [systemFilter, setSystemFilter] = useState("ALL");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [modelFilter, setModelFilter] = useState("ALL");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const systemOptions = useMemo(() => {
    const codes = new Set(parts.map((part) => part.system || part.category));
    return Array.from(codes).sort();
  }, [parts]);

  const modelOptions = useMemo(() => {
    const models = new Set<string>();
    for (const part of parts) {
      for (const compatibility of part.compatibilities) {
        if (brandFilter === "ALL" || compatibility.vehicleBrand.toUpperCase() === brandFilter) {
          models.add(compatibility.vehicleModel.toUpperCase());
        }
      }
    }
    return Array.from(models).sort();
  }, [parts, brandFilter]);

  const filteredParts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return parts.filter((part) => {
      const system = part.system || part.category;
      if (systemFilter !== "ALL" && system !== systemFilter) return false;
      if (brandFilter !== "ALL") {
        const hasBrand = part.compatibilities.some(
          (compatibility) => compatibility.vehicleBrand.toUpperCase() === brandFilter
        );
        if (!hasBrand) return false;
      }
      if (modelFilter !== "ALL") {
        const hasModel = part.compatibilities.some(
          (compatibility) => compatibility.vehicleModel.toUpperCase() === modelFilter
        );
        if (!hasModel) return false;
      }
      if (query) {
        const haystack = [
          part.partNumber,
          part.oemNumber,
          part.name,
          part.manufacturer,
          part.category,
          part.system,
          part.subcategory,
          ...part.crossReferences.flatMap((reference) => [reference.crossReference, reference.brand]),
          ...part.compatibilities.flatMap((compatibility) => [compatibility.vehicleBrand, compatibility.vehicleModel]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [parts, search, systemFilter, brandFilter, modelFilter]);

  const selectedLines = useMemo(() => {
    return Array.from(selected.entries())
      .map(([partId, quantity]) => {
        const part = parts.find((item) => item.id === partId);
        if (!part) return null;
        const offer = part.supplierOffers.find((item) => item.supplierId === supplierId);
        const unitPriceXof = offer?.purchasePriceXof || part.purchasePriceXof || 0;
        return { part, quantity, unitPriceXof, totalXof: unitPriceXof * quantity };
      })
      .filter((line): line is NonNullable<typeof line> => Boolean(line));
  }, [selected, parts, supplierId]);

  const orderTotal = selectedLines.reduce((sum, line) => sum + line.totalXof, 0);
  const crossRefCount = parts.reduce((sum, part) => sum + part.crossReferences.length, 0);
  const compatibilityCount = parts.reduce((sum, part) => sum + part.compatibilities.length, 0);

  function togglePart(part: CatalogPart) {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(part.id)) next.delete(part.id);
      else next.set(part.id, 1);
      return next;
    });
  }

  function setQuantity(partId: string, quantity: number) {
    setSelected((current) => {
      const next = new Map(current);
      next.set(partId, Math.max(1, Math.floor(quantity) || 1));
      return next;
    });
  }

  async function submitOrder() {
    setError(null);
    setMessage(null);
    if (!supplierId) {
      setError("Sélectionnez le fournisseur de la commande.");
      return;
    }
    if (selectedLines.length === 0) {
      setError("Ajoutez au moins une pièce à la commande.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createPartOrder({
        supplierId,
        notes,
        lines: selectedLines.map((line) => ({
          partItemId: line.part.id,
          quantity: line.quantity,
          unitPriceXof: line.unitPriceXof,
        })),
      });
      setMessage(`Commande ${result.number} créée avec succès.`);
      setSelected(new Map());
      setNotes("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossible de créer la commande.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <div className="ox-glass" style={{ padding: "1.2rem", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/parts" className="ox-btn ox-btn-ghost ox-btn-sm" style={{ padding: "4px 8px" }}><ArrowLeft size={15} /></a>
            <h1 style={{ margin: 0, fontSize: "1.35rem" }}>Catalogue croisé de pièces</h1>
          </div>
          <p style={{ margin: "5px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
            Recherchez par référence OEM, référence équivalente, marque, modèle ou système. Sélectionnez plusieurs pièces pour les regrouper dans une seule commande fournisseur.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="ox-badge ox-badge--ice"><Package size={13} /> {parts.length} références</span>
          <span className="ox-badge ox-badge--ok"><Copy size={13} /> {crossRefCount} croisements</span>
          <span className="ox-badge ox-badge--warn"><Truck size={13} /> {compatibilityCount} compatibilités</span>
        </div>
      </div>

      <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 8 }}>
          <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
            Recherche
            <span style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 9, top: 10, opacity: 0.55 }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="ox-input"
                style={{ paddingLeft: 28, width: "100%" }}
                placeholder="OEM, référence, désignation..."
              />
            </span>
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
            Système
            <select value={systemFilter} onChange={(event) => setSystemFilter(event.target.value)} className="ox-select">
              <option value="ALL">Tous les systèmes</option>
              {systemOptions.map((system) => (
                <option key={system} value={system}>{partSystemLabel(system)}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
            Marque véhicule
            <select value={brandFilter} onChange={(event) => { setBrandFilter(event.target.value); setModelFilter("ALL"); }} className="ox-select">
              <option value="ALL">Toutes les marques</option>
              {brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
            Modèle
            <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)} className="ox-select">
              <option value="ALL">Tous les modèles</option>
              {modelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
            Fournisseur pour la commande
            <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="ox-select">
              <option value="">Sélectionner un fournisseur</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="ox-table-wrap">
        <table className="ox-table" style={{ fontSize: "0.78rem" }}>
          <thead>
            <tr>
              <th></th>
              <th>Référence / OEM</th>
              <th>Désignation</th>
              <th>Système</th>
              <th>Compatibilités</th>
              <th>Références croisées</th>
              <th>Stock</th>
              <th>Prix achat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredParts.map((part) => {
              const isSelected = selected.has(part.id);
              const selectedOffer = part.supplierOffers.find((offer) => offer.supplierId === supplierId);
              return (
                <tr key={part.id} style={{ background: isSelected ? "var(--info-soft)" : undefined }}>
                  <td>
                    <input type="checkbox" checked={isSelected} onChange={() => togglePart(part)} aria-label={`Sélectionner ${part.name}`} />
                  </td>
                  <td>
                    <div style={{ fontFamily: "monospace", fontWeight: 700 }}>{part.partNumber}</div>
                    <div style={{ opacity: 0.65 }}>OEM : {part.oemNumber || "-"}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 650 }}>{part.name}</div>
                    <div style={{ opacity: 0.65 }}>{part.manufacturer || "-"} · {part.unit}</div>
                  </td>
                  <td>
                    <div>{partSystemLabel(part.system || part.category)}</div>
                    <div style={{ opacity: 0.65 }}>{part.subcategory ? partSubcategoryLabel(part.system, part.subcategory) : "-"}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 230 }}>
                      {part.compatibilities.slice(0, 4).map((compatibility) => (
                        <span key={compatibility.id} className="ox-badge ox-badge--neutral" style={{ fontSize: "0.66rem" }}>
                          {compatibility.vehicleBrand} {compatibility.vehicleModel}
                        </span>
                      ))}
                      {part.compatibilities.length > 4 && <span style={{ opacity: 0.6 }}>+{part.compatibilities.length - 4}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 240 }}>
                      {part.crossReferences.slice(0, 4).map((reference) => (
                        <span key={reference.id} className="ox-badge ox-badge--ice" style={{ fontSize: "0.66rem" }} title={`${reference.referenceType}${reference.isDirectFit ? " · montage direct" : ""}`}>
                          {reference.brand} · {reference.crossReference}
                        </span>
                      ))}
                      {part.crossReferences.length > 4 && <span style={{ opacity: 0.6 }}>+{part.crossReferences.length - 4}</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: part.stockQuantity === 0 ? "var(--danger-fg)" : part.stockQuantity <= part.minStockAlert ? "var(--warning-fg)" : "var(--success-fg)", fontWeight: 700 }}>
                      {part.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <div>{formatXof(selectedOffer?.purchasePriceXof ?? part.purchasePriceXof)}</div>
                    {selectedOffer?.leadTimeDays ? <div style={{ opacity: 0.6 }}>{selectedOffer.leadTimeDays} j</div> : null}
                  </td>
                  <td>
                    <button type="button" className="ox-btn ox-btn-ghost ox-btn-sm" onClick={() => togglePart(part)}>
                      {isSelected ? <Check size={14} /> : <ShoppingCart size={14} />}
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredParts.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: "1.5rem", textAlign: "center", opacity: 0.65 }}>
                  Aucune pièce ne correspond aux filtres. Vérifiez la référence, la marque ou le système.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {canOrder && (
        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <strong>Commande groupée · {selectedLines.length} ligne(s)</strong>
            <span style={{ fontWeight: 800, color: "var(--gold-fg)" }}>{formatXof(orderTotal)}</span>
          </div>
          {selectedLines.length === 0 ? (
            <div style={{ opacity: 0.65, fontSize: "0.84rem" }}>Cochez des pièces dans le catalogue pour préparer une commande auprès d&apos;un seul fournisseur.</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {selectedLines.map((line) => (
                <div key={line.part.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px auto", gap: 8, alignItems: "center", fontSize: "0.8rem", borderBottom: "1px solid var(--ice-border)", paddingBottom: 6 }}>
                  <div>
                    <strong>{line.part.partNumber}</strong> · {line.part.name}
                  </div>
                  <input type="number" min={1} value={line.quantity} onChange={(event) => setQuantity(line.part.id, Number(event.target.value))} className="ox-input" style={{ height: 30 }} />
                  <button type="button" className="ox-btn ox-btn-ghost ox-btn-sm" onClick={() => togglePart(line.part)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="ox-input" style={{ minHeight: 56 }} placeholder="Note de commande (délai, véhicule concerné, urgence...)" />
          {error && <p style={{ color: "var(--danger-fg)", margin: 0, fontSize: "0.82rem" }}>{error}</p>}
          {message && <p style={{ color: "var(--success-fg)", margin: 0, fontSize: "0.82rem" }}>{message}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="ox-btn ox-btn-primary" onClick={submitOrder} disabled={isSubmitting || selectedLines.length === 0}>
              {isSubmitting ? "Création..." : "Créer la commande groupée"}
            </button>
          </div>
        </div>
      )}

      <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <strong>Commandes de pièces récentes</strong>
          <span style={{ opacity: 0.65, fontSize: "0.8rem" }}>{orders.length} commande(s)</span>
        </div>
        {orders.length === 0 ? (
          <p style={{ opacity: 0.65, fontSize: "0.84rem", margin: 0 }}>Aucune commande groupée enregistrée.</p>
        ) : (
          <div className="ox-table-wrap">
            <table className="ox-table" style={{ fontSize: "0.8rem" }}>
              <thead><tr><th>Numéro</th><th>Fournisseur</th><th>Lignes</th><th>Total</th><th>Date</th><th>Statut</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: "monospace" }}>{order.number}</td>
                    <td>{order.supplierName}</td>
                    <td>{order.lines.map((line) => `${line.partNumber} x${line.quantity}`).join(", ")}</td>
                    <td>{formatXof(order.totalXof)}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>
                      <form
                        action={async (formData) => {
                          await updatePartOrderStatus(formData);
                        }}
                        style={{ display: "flex", gap: 4 }}
                      >
                        <input type="hidden" name="id" value={order.id} />
                        <select name="status" className="ox-select" defaultValue={order.status} style={{ height: 30, fontSize: "0.76rem" }}>
                          {Object.entries(ORDER_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <button type="submit" className="ox-btn ox-btn-ghost ox-btn-sm">OK</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
