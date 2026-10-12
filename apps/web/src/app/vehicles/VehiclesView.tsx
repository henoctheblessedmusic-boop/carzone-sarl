"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, DataTable } from "@/components/ui";
import { BrandModelSelect, type CatalogBrand } from "@/components/BrandModelSelect";
import { Edit2, X, FileText, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { formatXof } from "@/lib/format";
import { BrandLogoSvg } from "@/lib/brand-logos";
import { createVehicle, updateVehicle, deleteVehicle } from "./actions";

const TYPE_LABEL: Record<string, string> = {
  SUV: "SUV",
  PICKUP: "Pick-up",
  BERLINE: "Berline",
  VAN: "Van / Minibus",
};

export type VehicleItem = {
  id: string;
  vin?: string | null;
  brand: string;
  model: string;
  variant?: string | null;
  year?: number | null;
  energy: string;
  vehicleType?: string | null;
  priceXof: number;
  status: string;
  mileage?: number;
  color?: string | null;
  supplierId?: string | null;
  supplier?: { id: string; name: string } | null;
  siteId?: string | null;
  site?: { id: string; name: string; code?: string } | null;
  mainPhotoUrl?: string | null;
  hasTechSheet?: boolean;
};

export function VehiclesView({
  vehicles,
  catalog,
  suppliers,
  sites,
  canCreate,
  canDelete = false,
  initialParams,
}: {
  vehicles: VehicleItem[];
  catalog: CatalogBrand[];
  suppliers: { id: string; name: string }[];
  sites: { id: string; name: string; code?: string }[];
  canCreate: boolean;
  canDelete?: boolean;
  initialParams: { energy?: string; q?: string; vehicleType?: string; siteId?: string };
}) {
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<VehicleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <>
      {canCreate ? (
        <form action={createVehicle} className="ox-glass" style={{ padding: "1rem", marginBottom: 16 }}>
          <div style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: 8 }}>
            Ajout stock — sélectionnez marque puis modèle (catalogue CARZONE), showroom d&apos;affectation et prix.
          </div>
          <BrandModelSelect brands={catalog} energyFieldId="vehicle-energy" />
          <div className="ox-form-row" style={{ marginTop: 8 }}>
            <input name="variant" placeholder="Finition" className="ox-input" title="Finition / variante" />
            <input name="vin" placeholder="VIN" className="ox-input" title="Numéro VIN" />
            <input name="year" type="number" placeholder="Année" defaultValue={2025} className="ox-input" />
            <select
              id="vehicle-energy"
              name="energy"
              className="ox-select"
              defaultValue="ELECTRIQUE"
              title="Énergie"
            >
              <option value="ELECTRIQUE">Électrique</option>
              <option value="HYBRIDE">Hybride</option>
              <option value="PHEV">PHEV</option>
              <option value="ESSENCE">Essence</option>
              <option value="DIESEL">Diesel</option>
            </select>
            <select name="siteId" className="ox-select" defaultValue={sites[0]?.id || ""} title="Showroom d'affectation">
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  📍 {s.name}
                </option>
              ))}
            </select>
            <select name="supplierId" className="ox-select" defaultValue="" title="Fournisseur">
              <option value="">Fournisseur (opt.)</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              name="priceXof"
              type="number"
              placeholder="Prix XOF *"
              required
              className="ox-input"
              title="Prix de vente en francs CFA"
            />
            <button type="submit" className="ox-btn" title="Enregistrer le véhicule en stock">
              Ajouter au stock
            </button>
          </div>
        </form>
      ) : null}

      <form className="ox-form-row" style={{ marginBottom: 16 }}>
        <input
          name="q"
          placeholder="Recherche marque / modèle / VIN"
          defaultValue={initialParams.q}
          className="ox-input"
          title="Recherche texte"
        />
        <select name="siteId" defaultValue={initialParams.siteId || ""} className="ox-select" title="Filtrer par showroom">
          <option value="">Tous les showrooms</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              📍 {s.name}
            </option>
          ))}
        </select>
        <select name="energy" defaultValue={initialParams.energy || ""} className="ox-select" title="Filtrer par énergie">
          <option value="">Toutes énergies</option>
          <option value="ELECTRIQUE">Électrique</option>
          <option value="HYBRIDE">Hybride</option>
          <option value="PHEV">PHEV</option>
          <option value="ESSENCE">Essence</option>
          <option value="DIESEL">Diesel</option>
        </select>
        <select
          name="vehicleType"
          defaultValue={initialParams.vehicleType || ""}
          className="ox-select"
          title="Filtrer par gamme"
        >
          <option value="">Toutes gammes</option>
          <option value="SUV">SUV</option>
          <option value="PICKUP">Pick-up</option>
          <option value="BERLINE">Berline</option>
          <option value="VAN">Van / Minibus</option>
        </select>
        <button type="submit" className="ox-btn" title="Appliquer les filtres matching">
          Filtrer
        </button>
      </form>

      <DataTable
        headers={["VIN", "Véhicule", "Gamme", "Énergie", "Fournisseur", "Site", "Prix", "Statut", "Action"]}
        rows={vehicles.map((v) => [
          v.vin || "—",
          <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {v.mainPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={v.mainPhotoUrl}
                alt={v.model}
                referrerPolicy="no-referrer"
                style={{
                  width: 48,
                  height: 32,
                  objectFit: "cover",
                  borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  background: "#f1f5f9",
                  flexShrink: 0,
                }}
              />
            ) : null}
            <div>
              <div style={{ fontWeight: 650, display: "flex", alignItems: "center", gap: 6 }}>
                <BrandLogoSvg brand={v.brand} size={15} />
                <span>{`${v.brand} ${v.model}`}</span>
              </div>
              {v.variant && <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>{v.variant}</div>}
            </div>
          </div>,
          v.vehicleType ? TYPE_LABEL[v.vehicleType] || v.vehicleType : "—",
          v.energy,
          v.supplier?.name || "—",
          v.site ? (
            <span
              key={`site-${v.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.82rem",
                fontWeight: 550,
                color: v.site.code === "ETOILE_ROUGE" ? "#ef4444" : "var(--brand, #0078d4)",
              }}
              title={v.site.name}
            >
              <span style={{ fontSize: "0.85rem" }}>📍</span>
              <span>{v.site.name}</span>
            </span>
          ) : (
            <span key={`site-${v.id}`} style={{ opacity: 0.5 }}>—</span>
          ),
          formatXof(v.priceXof),
          <Badge
            key={`b-${v.id}`}
            tone={v.status === "EN_STOCK" ? "ok" : v.status === "VENDU" ? "neutral" : "warn"}
          >
            {v.status}
          </Badge>,
          <div key={`act-${v.id}`} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <Link
              href={`/vehicles/${v.id}/fiche-technique`}
              target="_blank"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid rgba(0, 120, 212, 0.4)",
                background: "rgba(0, 120, 212, 0.12)",
                color: "var(--brand, #0078d4)",
                fontSize: "0.75rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
              title="Consulter et imprimer la fiche technique officielle (FR)"
            >
              <FileText size={12} />
              <span>Fiche Technique</span>
            </Link>
            <button
              key={`edit-${v.id}`}
              type="button"
              onClick={() => setEditingVehicle(v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                background: "rgba(255, 255, 255, 0.06)",
                color: "var(--ice-text)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Modifier ce véhicule en stock"
            >
              <Edit2 size={12} color="var(--gold, #d4af37)" />
              <span>Modifier</span>
            </button>
            {canDelete && (
              <button
                key={`del-${v.id}`}
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeletingVehicle(v);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#f87171",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                title="Supprimer définitivement cet article du stock (Direction & Admin)"
              >
                <Trash2 size={12} />
                <span>Supprimer</span>
              </button>
            )}
          </div>,
        ])}
      />

      {/* Modal de Modification Véhicule en Stock */}
      {editingVehicle && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#161a20",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--ice-text)" }}>
                  ✏️ Modifier le Véhicule en Stock
                </h3>
                <span style={{ fontSize: "0.78rem", opacity: 0.65 }}>
                  {editingVehicle.brand} {editingVehicle.model}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                style={{ background: "none", border: "none", color: "var(--ice-text)", opacity: 0.6, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateVehicle(formData);
                setEditingVehicle(null);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <input type="hidden" name="id" value={editingVehicle.id} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Prix de vente XOF *
                  </label>
                  <input
                    name="priceXof"
                    type="number"
                    defaultValue={editingVehicle.priceXof}
                    required
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Statut en stock
                  </label>
                  <select
                    name="status"
                    defaultValue={editingVehicle.status}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="EN_STOCK">EN_STOCK</option>
                    <option value="RESERVE">RESERVE</option>
                    <option value="COMMANDE">COMMANDE</option>
                    <option value="VENDU">VENDU</option>
                    <option value="EN_TRANSIT">EN_TRANSIT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Numéro VIN (Châssis)
                  </label>
                  <input
                    name="vin"
                    defaultValue={editingVehicle.vin || ""}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Finition / Variante
                  </label>
                  <input
                    name="variant"
                    defaultValue={editingVehicle.variant || ""}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Année
                  </label>
                  <input
                    name="year"
                    type="number"
                    defaultValue={editingVehicle.year || 2025}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Énergie
                  </label>
                  <select
                    name="energy"
                    defaultValue={editingVehicle.energy}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="ELECTRIQUE">Électrique</option>
                    <option value="HYBRIDE">Hybride</option>
                    <option value="PHEV">PHEV</option>
                    <option value="ESSENCE">Essence</option>
                    <option value="DIESEL">Diesel</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Gamme
                  </label>
                  <select
                    name="vehicleType"
                    defaultValue={editingVehicle.vehicleType || ""}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="">—</option>
                    <option value="SUV">SUV</option>
                    <option value="PICKUP">Pick-up</option>
                    <option value="BERLINE">Berline</option>
                    <option value="VAN">Van / Minibus</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Kilométrage (km)
                  </label>
                  <input
                    name="mileage"
                    type="number"
                    defaultValue={editingVehicle.mileage || 0}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Showroom d&apos;affectation
                  </label>
                  <select
                    name="siteId"
                    defaultValue={editingVehicle.siteId || sites[0]?.id || ""}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        📍 {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Fournisseur
                  </label>
                  <select
                    name="supplierId"
                    defaultValue={editingVehicle.supplierId || ""}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="">Aucun</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Couleur
                  </label>
                  <input
                    name="color"
                    defaultValue={editingVehicle.color || ""}
                    placeholder="ex: Blanc Nacré, Gris Minéral"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      const v = editingVehicle;
                      setEditingVehicle(null);
                      setDeleteError(null);
                      setDeletingVehicle(v);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      background: "rgba(239, 68, 68, 0.12)",
                      color: "#f87171",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    title="Supprimer définitivement cet article du stock"
                  >
                    <Trash2 size={14} />
                    <span>Supprimer du stock</span>
                  </button>
                ) : <div />}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingVehicle(null)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      background: "transparent",
                      color: "var(--ice-text)",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "8px 18px",
                      borderRadius: 8,
                      border: "none",
                      background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmation de Suppression de Véhicule */}
      {deletingVehicle && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#121820",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.75)",
              color: "var(--ice-text)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ef4444",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#f87171" }}>
                  Supprimer cet article en stock ?
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", opacity: 0.75 }}>
                  Action réservée aux rôles Direction (PDG, DG, DC, SG) et Administration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setDeletingVehicle(null);
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                style={{ background: "none", border: "none", color: "var(--ice-text)", opacity: 0.6, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: "0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.65 }}>Véhicule :</span>
                <strong style={{ color: "var(--ice-text)" }}>
                  {deletingVehicle.brand} {deletingVehicle.model} {deletingVehicle.variant || ""}
                </strong>
              </div>
              {deletingVehicle.vin && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ opacity: 0.65 }}>VIN :</span>
                  <code style={{ fontSize: "0.8rem", color: "var(--gold, #d4af37)" }}>{deletingVehicle.vin}</code>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.65 }}>Showroom :</span>
                <span>{deletingVehicle.site?.name || "Non assigné"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.65 }}>Prix :</span>
                <strong style={{ color: "#22c55e" }}>{formatXof(deletingVehicle.priceXof)}</strong>
              </div>
            </div>

            <div
              style={{
                fontSize: "0.8rem",
                lineHeight: 1.5,
                color: "rgba(239, 68, 68, 0.9)",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              ⚠️ <strong>Attention :</strong> Cette action est irréversible. L&apos;article sera définitivement retiré du stock. S&apos;il est déjà lié à des devis ou factures, la suppression sera bloquée pour garantir l&apos;intégrité comptable.
            </div>

            {deleteError && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#f87171",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  padding: "8px 12px",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                {deleteError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setDeletingVehicle(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "transparent",
                  color: "var(--ice-text)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    setDeleteError(null);
                    const fd = new FormData();
                    fd.set("id", deletingVehicle.id);
                    await deleteVehicle(fd);
                    setDeletingVehicle(null);
                  } catch (err: unknown) {
                    setDeleteError(err instanceof Error ? err.message : "Erreur lors de la suppression");
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.35)",
                }}
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{isDeleting ? "Suppression..." : "Confirmer la suppression"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
