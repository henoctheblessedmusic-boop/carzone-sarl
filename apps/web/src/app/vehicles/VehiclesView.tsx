"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge, DataTable } from "@/components/ui";
import { BrandModelSelect, type CatalogBrand } from "@/components/BrandModelSelect";
import {
  Edit2,
  X,
  FileText,
  Trash2,
  AlertTriangle,
  Loader2,
  ShoppingCart,
  Factory,
  Ship,
  Anchor,
  Store,
  ArrowRight,
  Filter,
  Layers,
  Calendar,
  MapPin,
  Box,
  PlusCircle,
} from "lucide-react";
import { formatXof } from "@/lib/format";
import { BrandLogoSvg } from "@/lib/brand-logos";
import { usePrefs } from "@/components/PrefsProvider";
import {
  energyLabel,
  statusLabel,
  stockCopy,
  vehicleTypeLabel,
} from "@/lib/i18n/messages/stock";
import { createVehicle, updateVehicle, deleteVehicle, quickChangeVehicleStatus } from "./actions";

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
  techSheetConfirmed?: boolean;
  techSheetConfirmedAt?: string | null;
  shippingOriginPort?: string | null;
  etaDate?: string | null;
  containerNumber?: string | null;
  orderReference?: string | null;
  productionWeek?: string | null;
};

// 5 STATUTS OFFICIELS DEMANDÉS PAR LE DIRECTEUR DE CARZONE
// Les libellés traduits vivent dans stockCopy (lib/i18n/messages/stock.ts).
export const STOCK_STAGES = [
  {
    key: "COMMANDE",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
    icon: ShoppingCart,
  },
  {
    key: "EN_PRODUCTION",
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.35)",
    icon: Factory,
  },
  {
    key: "EN_TRANSIT",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.35)",
    icon: Ship,
  },
  {
    key: "AU_PORT",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.12)",
    border: "rgba(236, 72, 153, 0.35)",
    icon: Anchor,
  },
  {
    key: "EN_MAGASIN",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.35)",
    icon: Store,
  },
] as const;

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
  const { locale } = usePrefs();
  const copy = stockCopy[locale];
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<VehicleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Normalisation du statut (EN_STOCK = EN_MAGASIN)
  const normalizedVehicles = useMemo(() => {
    return vehicles.map((v) => ({
      ...v,
      stageKey:
        v.status === "EN_STOCK" || v.status === "EN_MAGASIN"
          ? "EN_MAGASIN"
          : v.status === "COMMANDE"
          ? "COMMANDE"
          : v.status === "EN_PRODUCTION"
          ? "EN_PRODUCTION"
          : v.status === "EN_TRANSIT"
          ? "EN_TRANSIT"
          : v.status === "AU_PORT"
          ? "AU_PORT"
          : v.status,
    }));
  }, [vehicles]);

  // Statistiques par étape
  const stageStats = useMemo(() => {
    const map: Record<string, { count: number; totalXof: number }> = {
      COMMANDE: { count: 0, totalXof: 0 },
      EN_PRODUCTION: { count: 0, totalXof: 0 },
      EN_TRANSIT: { count: 0, totalXof: 0 },
      AU_PORT: { count: 0, totalXof: 0 },
      EN_MAGASIN: { count: 0, totalXof: 0 },
    };

    normalizedVehicles.forEach((v) => {
      if (map[v.stageKey]) {
        map[v.stageKey].count += 1;
        map[v.stageKey].totalXof += v.priceXof || 0;
      }
    });

    return map;
  }, [normalizedVehicles]);

  // Valeur totale
  const totalStockCount = vehicles.length;
  const totalStockValue = vehicles.reduce((acc, v) => acc + (v.priceXof || 0), 0);

  // Prochaine étape logique
  const getNextStage = (current: string): string | null => {
    switch (current) {
      case "COMMANDE":
        return "EN_PRODUCTION";
      case "EN_PRODUCTION":
        return "EN_TRANSIT";
      case "EN_TRANSIT":
        return "AU_PORT";
      case "AU_PORT":
        return "EN_MAGASIN";
      default:
        return null;
    }
  };

  return (
    <>
      {/* DIRECTORIAL BANNER - 5 ETAPES DU DIRECTEUR */}
      <div
        className="ox-glass"
        style={{
          padding: "1.4rem",
          borderRadius: "16px",
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)",
          border: "1px solid rgba(225, 29, 72, 0.25)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
                  color: "#fff",
                }}
              >
                <Layers size={18} />
              </span>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                {copy.pipeline.title}
              </h2>
            </div>
            <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "var(--ice-text-muted)" }}>
              {copy.pipeline.subtitle}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
            {canCreate && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="ox-btn"
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                  cursor: "pointer",
                }}
                title={copy.pipeline.entryTitle}
              >
                <PlusCircle size={17} />
                <span>{copy.pipeline.entryButton}</span>
              </button>
            )}

            <div
              style={{
                display: "inline-flex",
                background: "rgba(0,0,0,0.3)",
                padding: "0.3rem",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("pipeline")}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "7px",
                  border: "none",
                  background: viewMode === "pipeline" ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" : "transparent",
                  color: viewMode === "pipeline" ? "#fff" : "var(--ice-text-muted)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {copy.pipeline.viewPipeline}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "7px",
                  border: "none",
                  background: viewMode === "table" ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" : "transparent",
                  color: viewMode === "table" ? "#fff" : "var(--ice-text-muted)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {copy.pipeline.viewTable(totalStockCount)}
              </button>
            </div>
          </div>
        </div>

        {/* 5 KPI METRICS DU DIRECTEUR */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "0.75rem",
            marginTop: "1.2rem",
          }}
        >
          {STOCK_STAGES.map((stg) => {
            const data = stageStats[stg.key] || { count: 0, totalXof: 0 };
            const Icon = stg.icon;

            return (
              <div
                key={stg.key}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  background: stg.bg,
                  border: `1px solid ${stg.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: stg.color }}>
                    {copy.stages[stg.key].label}
                  </span>
                  <Icon size={15} color={stg.color} />
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f8fafc" }}>
                  {data.count} <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--ice-text-muted)" }}>{copy.pipeline.unitShort}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
                  {formatXof(data.totalXof)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL POP-UP : NOUVELLE ENTRÉE EN STOCK (ÉPURÉ ET SANS ENCOMBREMENT) */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div
            style={{
              background: "#0f172a",
              border: "1.5px solid rgba(225, 29, 72, 0.35)",
              borderRadius: "18px",
              padding: "1.75rem",
              width: "100%",
              maxWidth: 780,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "1rem",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      borderRadius: "8px",
                      padding: "0.35rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PlusCircle size={22} />
                  </span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#f8fafc" }}>
                    {copy.createModal.title}
                  </h3>
                </div>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--ice-text-muted)" }}>
                  {copy.createModal.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#cbd5e1",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title={copy.createModal.close}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulaire dans la modale */}
            <form
              action={async (formData) => {
                await createVehicle(formData);
                setIsCreateModalOpen(false);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
            >
              {/* SECTION 1 : VÉHICULE & MODÈLE */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.4)",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                  {copy.createModal.section1}
                </div>
                <BrandModelSelect brands={catalog} energyFieldId="modal-vehicle-energy" />
                <div className="ox-form-row" style={{ marginTop: "0.75rem" }}>
                  <input name="variant" placeholder={copy.createModal.variantPlaceholder} className="ox-input" title={copy.createModal.variantTitle} />
                  <input name="year" type="number" placeholder={copy.createModal.yearPlaceholder} defaultValue={2026} className="ox-input" />
                  <select
                    id="modal-vehicle-energy"
                    name="energy"
                    className="ox-select"
                    defaultValue="HYBRIDE"
                    title={copy.createModal.energyTitle}
                  >
                    <option value="ELECTRIQUE">{copy.energyOption.ELECTRIQUE}</option>
                    <option value="HYBRIDE">{copy.energyOption.HYBRIDE}</option>
                    <option value="PHEV">{copy.energyOption.PHEV}</option>
                    <option value="ESSENCE">{copy.energyOption.ESSENCE}</option>
                    <option value="DIESEL">{copy.energyOption.DIESEL}</option>
                  </select>
                </div>
              </div>

              {/* SECTION 2 : ÉTAPE LOGISTIQUE & SHOWROOM */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.4)",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                  {copy.createModal.section2}
                </div>
                <div className="ox-form-row">
                  <select
                    name="status"
                    defaultValue="EN_MAGASIN"
                    className="ox-select"
                    title={copy.createModal.statusTitle}
                    style={{ fontWeight: 700, color: "#34d399", background: "rgba(15,23,42,0.8)" }}
                  >
                    <option value="COMMANDE">{copy.statusOption.COMMANDE}</option>
                    <option value="EN_PRODUCTION">{copy.statusOption.EN_PRODUCTION}</option>
                    <option value="EN_TRANSIT">{copy.statusOption.EN_TRANSIT}</option>
                    <option value="AU_PORT">{copy.statusOption.AU_PORT}</option>
                    <option value="EN_MAGASIN">{copy.statusOption.EN_MAGASIN}</option>
                  </select>

                  <select name="siteId" className="ox-select" defaultValue={sites[0]?.id || ""} title={copy.createModal.siteTitle}>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        📍 {s.name}
                      </option>
                    ))}
                  </select>

                  <select name="supplierId" className="ox-select" defaultValue="" title={copy.createModal.supplierTitle}>
                    <option value="">{copy.createModal.supplierOptional}</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION 3 : EXPÉDITION & CHÂSSIS VIN */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.4)",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                  {copy.createModal.section3}
                </div>
                <div className="ox-form-row">
                  <input
                    name="shippingOriginPort"
                    placeholder={copy.createModal.portPlaceholder}
                    className="ox-input"
                  />
                  <input
                    name="etaDate"
                    type="date"
                    title={copy.createModal.etaTitle}
                    className="ox-input"
                  />
                  <input
                    name="containerNumber"
                    placeholder={copy.createModal.containerPlaceholder}
                    className="ox-input"
                  />
                  <input
                    name="vin"
                    placeholder={copy.createModal.vinPlaceholder}
                    className="ox-input"
                    title={copy.createModal.vinTitle}
                  />
                </div>
              </div>

              {/* SECTION 4 : PRIX DE VENTE & VALIDATION */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.4)",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ec4899", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                  {copy.createModal.section4}
                </div>
                <div className="ox-form-row">
                  <input
                    name="priceXof"
                    type="number"
                    placeholder={copy.createModal.pricePlaceholder}
                    required
                    className="ox-input"
                    title={copy.createModal.priceTitle}
                    style={{ fontWeight: 800, fontSize: "1.05rem", color: "#34d399", minWidth: 260 }}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.8rem",
                  marginTop: "0.5rem",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="ox-btn ox-btn-ghost"
                  style={{ color: "#cbd5e1" }}
                >
                  {copy.createModal.cancel}
                </button>
                <button
                  type="submit"
                  className="ox-btn"
                  style={{
                    background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
                    border: "none",
                    padding: "0.6rem 1.4rem",
                    fontWeight: 800,
                    fontSize: "0.92rem",
                  }}
                >
                  {copy.createModal.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECHERCHE ET FILTRES RAPIDES */}
      <form className="ox-form-row" style={{ marginBottom: 16 }}>
        <input
          name="q"
          placeholder={copy.filters.searchPlaceholder}
          defaultValue={initialParams.q}
          className="ox-input"
          style={{ minWidth: 260 }}
        />
        <select name="siteId" defaultValue={initialParams.siteId || ""} className="ox-select">
          <option value="">{copy.filters.allShowrooms}</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              📍 {s.name}
            </option>
          ))}
        </select>
        <select name="energy" defaultValue={initialParams.energy || ""} className="ox-select">
          <option value="">{copy.filters.allEnergies}</option>
          <option value="ELECTRIQUE">{copy.energy.ELECTRIQUE}</option>
          <option value="HYBRIDE">{copy.energy.HYBRIDE}</option>
          <option value="PHEV">{copy.energy.PHEV}</option>
          <option value="ESSENCE">{copy.energy.ESSENCE}</option>
          <option value="DIESEL">{copy.energy.DIESEL}</option>
        </select>
        <select name="vehicleType" defaultValue={initialParams.vehicleType || ""} className="ox-select">
          <option value="">{copy.filters.allTypes}</option>
          <option value="SUV">{copy.vehicleType.SUV}</option>
          <option value="PICKUP">{copy.vehicleType.PICKUP}</option>
          <option value="BERLINE">{copy.vehicleType.BERLINE}</option>
          <option value="VAN">{copy.vehicleType.VAN}</option>
        </select>
        <button type="submit" className="ox-btn">
          {copy.filters.submit}
        </button>
      </form>

      {/* ========================================================================= */}
      {/* VUE PIPELINE EN 5 COLONNES (KANBAN DES 5 ÉTAPES DU DIRECTEUR) */}
      {/* ========================================================================= */}
      {viewMode === "pipeline" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(250px, 1fr))",
            gap: "1rem",
            overflowX: "auto",
            paddingBottom: "1.5rem",
          }}
        >
          {STOCK_STAGES.map((stage) => {
            const vehiclesInStage = normalizedVehicles.filter((v) => v.stageKey === stage.key);
            const totalStageXof = vehiclesInStage.reduce((acc, v) => acc + (v.priceXof || 0), 0);
            const nextKey = getNextStage(stage.key);

            return (
              <div
                key={stage.key}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "14px",
                  border: `1px solid ${stage.border}`,
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  minHeight: 450,
                }}
              >
                {/* EN-TÊTE COLONNE */}
                <div
                  style={{
                    padding: "0.6rem 0.8rem",
                    borderRadius: "10px",
                    background: stage.bg,
                    border: `1px solid ${stage.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: stage.color }}>
                      {copy.stages[stage.key].label}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--ice-text-muted)" }}>
                      {formatXof(totalStageXof)}
                    </div>
                  </div>
                  <span
                    style={{
                      background: stage.color,
                      color: "#000",
                      fontWeight: 800,
                      borderRadius: "12px",
                      padding: "0.15rem 0.5rem",
                      fontSize: "0.78rem",
                    }}
                  >
                    {vehiclesInStage.length}
                  </span>
                </div>

                {/* LISTE DES CARTES VÉHICULES */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1, overflowY: "auto" }}>
                  {vehiclesInStage.length === 0 ? (
                    <div
                      style={{
                        padding: "2rem 1rem",
                        textAlign: "center",
                        fontSize: "0.78rem",
                        color: "var(--ice-text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      {copy.card.emptyStage}
                    </div>
                  ) : (
                    vehiclesInStage.map((v) => (
                      <div
                        key={v.id}
                        className="ox-glass"
                        style={{
                          padding: "0.85rem",
                          borderRadius: "12px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          background: "rgba(30, 41, 59, 0.4)",
                        }}
                      >
                        {/* PHOTO & MARQUE (STUDIO CADRÉ SANS AUCUN ROGNAGE) */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          {v.mainPhotoUrl ? (
                            <div
                              style={{
                                width: 56,
                                height: 38,
                                borderRadius: 6,
                                background: "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                border: "1px solid rgba(255,255,255,0.1)",
                                flexShrink: 0,
                                padding: "2px",
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={v.mainPhotoUrl}
                                alt={v.model}
                                referrerPolicy="no-referrer"
                                style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
                              />
                            </div>
                          ) : (
                            <Box size={24} color={stage.color} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 5 }}>
                              <BrandLogoSvg brand={v.brand} size={14} />
                              <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {v.brand} {v.model}
                              </span>
                            </div>
                            {v.variant && (
                              <div style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {v.variant}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CARACTÉRISTIQUES */}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#cbd5e1" }}>
                          <span>{energyLabel(copy, v.energy)}</span>
                          <span>{vehicleTypeLabel(copy, v.vehicleType || "SUV")}</span>
                          <span>{v.year || 2026}</span>
                        </div>

                        {/* PRIX */}
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#34d399" }}>
                          {formatXof(v.priceXof)}
                        </div>

                        {/* INFOS LOGISTIQUES */}
                        {(v.shippingOriginPort || v.etaDate || v.containerNumber || v.vin) && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--ice-text-muted)",
                              padding: "0.3rem 0.5rem",
                              borderRadius: "6px",
                              background: "rgba(0,0,0,0.25)",
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {v.vin && <div>{copy.card.vin} <code>{v.vin}</code></div>}
                            {v.shippingOriginPort && <div>{copy.card.port} {v.shippingOriginPort}</div>}
                            {v.etaDate && <div>{copy.card.eta} {new Date(v.etaDate).toLocaleDateString(copy.dateLocale)}</div>}
                            {v.containerNumber && <div>{copy.card.container} {v.containerNumber}</div>}
                          </div>
                        )}

                        {/* ACTIONS DE CARTE */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "0.3rem",
                            paddingTop: "0.4rem",
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div style={{ display: "flex", gap: "0.3rem" }}>
                            <button
                              type="button"
                              onClick={() => setEditingVehicle(v)}
                              title={copy.card.editTitle}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#cbd5e1",
                                cursor: "pointer",
                                padding: "2px",
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <Link
                              href={`/vehicles/${v.id}/fiche-technique`}
                              title={
                                v.techSheetConfirmed
                                  ? copy.card.sheetConfirmedTitle
                                  : copy.card.sheetPendingTitle
                              }
                              style={{
                                color: v.techSheetConfirmed ? "#10b981" : "#f59e0b",
                                padding: "2px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <FileText size={13} />
                              {v.techSheetConfirmed && <span style={{ fontSize: "10px", fontWeight: 800 }}>✓</span>}
                            </Link>
                          </div>

                          {/* BOUTON PASSER À L'ÉTAPE SUIVANTE */}
                          {nextKey && (
                            <form
                              action={quickChangeVehicleStatus}
                              style={{ margin: 0 }}
                            >
                              <input type="hidden" name="id" value={v.id} />
                              <input type="hidden" name="status" value={nextKey} />
                              <button
                                type="submit"
                                title={copy.card.nextTitle(statusLabel(copy, nextKey))}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                  padding: "0.25rem 0.55rem",
                                  borderRadius: "6px",
                                  background: "rgba(255,255,255,0.1)",
                                  border: "1px solid rgba(255,255,255,0.2)",
                                  color: "#f8fafc",
                                  cursor: "pointer",
                                }}
                              >
                                <span>{copy.card.nextButton}</span>
                                <ArrowRight size={11} />
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VUE TABLEAU TRADITIONNELLE AMÉLIORÉE */
        <DataTable
          headers={[
            copy.table.colVin,
            copy.table.colVehicle,
            copy.table.colRange,
            copy.table.colEnergy,
            copy.table.colSupplier,
            copy.table.colShowroom,
            copy.table.colPrice,
            copy.table.colStatus,
            copy.table.colAction,
          ]}
          rows={vehicles.map((v) => [
            v.vin || "-",
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {v.mainPhotoUrl ? (
                <div
                  style={{
                    width: 58,
                    height: 38,
                    borderRadius: 6,
                    background: "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.15)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    flexShrink: 0,
                    padding: "2px",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.mainPhotoUrl}
                    alt={v.model}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                  />
                </div>
              ) : null}
              <div>
                <div style={{ fontWeight: 650, display: "flex", alignItems: "center", gap: 6 }}>
                  <BrandLogoSvg brand={v.brand} size={15} />
                  <span>{`${v.brand} ${v.model}`}</span>
                </div>
                {v.variant && <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>{v.variant}</div>}
              </div>
            </div>,
            v.vehicleType ? vehicleTypeLabel(copy, v.vehicleType) : "-",
            energyLabel(copy, v.energy),
            v.supplier?.name || "-",
            v.site ? (
              <span
                key={`site-${v.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.82rem",
                  fontWeight: 550,
                  color: v.site.code === "ATELIER_SAV" ? "#f59e0b" : "var(--brand, #0078d4)",
                }}
                title={v.site.name}
              >
                <span style={{ fontSize: "0.85rem" }}>📍</span>
                <span>{v.site.name}</span>
              </span>
            ) : (
              <span key={`site-${v.id}`} style={{ opacity: 0.5 }}>-</span>
            ),
            formatXof(v.priceXof),
            <Badge
              key={`b-${v.id}`}
              tone={
                v.status === "EN_MAGASIN" || v.status === "EN_STOCK"
                  ? "ok"
                  : v.status === "AU_PORT"
                  ? "bad"
                  : v.status === "EN_TRANSIT"
                  ? "ice"
                  : "warn"
              }
            >
              {statusLabel(copy, v.status)}
            </Badge>,
            <div key={`act-${v.id}`} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
              <Link
                key={`sheet-${v.id}`}
                href={`/vehicles/${v.id}/fiche-technique`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: v.techSheetConfirmed
                    ? "1px solid rgba(16, 185, 129, 0.4)"
                    : "1px solid rgba(245, 158, 11, 0.4)",
                  background: v.techSheetConfirmed
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(245, 158, 11, 0.12)",
                  color: v.techSheetConfirmed ? "#10b981" : "#f59e0b",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
                title={
                  v.techSheetConfirmed
                    ? copy.table.sheetConfirmedTitle
                    : copy.table.sheetPendingTitle
                }
              >
                <FileText size={12} />
                <span>{v.techSheetConfirmed ? copy.table.sheetConfirmed : copy.table.sheetPending}</span>
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
                title={copy.table.editTitle}
              >
                <Edit2 size={12} color="var(--gold, #d4af37)" />
                <span>{copy.table.edit}</span>
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
                  title={copy.table.deleteTitle}
                >
                  <Trash2 size={12} />
                  <span>{copy.table.delete}</span>
                </button>
              )}
            </div>,
          ])}
        />
      )}

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
              maxWidth: 580,
              background: "#161a20",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--ice-text)" }}>
                  {copy.editModal.title}
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
                    {copy.editModal.priceLabel}
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
                    {copy.editModal.statusLabel}
                  </label>
                  <select
                    name="status"
                    defaultValue={editingVehicle.status === "EN_STOCK" ? "EN_MAGASIN" : editingVehicle.status}
                    className="ox-select"
                    style={{ width: "100%", fontWeight: 600, color: "#38bdf8" }}
                  >
                    <option value="COMMANDE">{copy.statusOption.COMMANDE}</option>
                    <option value="EN_PRODUCTION">{copy.statusOption.EN_PRODUCTION}</option>
                    <option value="EN_TRANSIT">{copy.statusOption.EN_TRANSIT}</option>
                    <option value="AU_PORT">{copy.statusOption.AU_PORT}</option>
                    <option value="EN_MAGASIN">{copy.statusOption.EN_MAGASIN}</option>
                    <option value="RESERVE">{copy.statusOption.RESERVE}</option>
                    <option value="VENDU">{copy.statusOption.VENDU}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {copy.editModal.originPortLabel}
                  </label>
                  <input
                    name="shippingOriginPort"
                    defaultValue={editingVehicle.shippingOriginPort || ""}
                    placeholder={copy.editModal.originPortPlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {copy.editModal.etaLabel}
                  </label>
                  <input
                    name="etaDate"
                    type="date"
                    defaultValue={editingVehicle.etaDate ? editingVehicle.etaDate.slice(0, 10) : ""}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {copy.editModal.containerLabel}
                  </label>
                  <input
                    name="containerNumber"
                    defaultValue={editingVehicle.containerNumber || ""}
                    placeholder={copy.editModal.containerPlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {copy.editModal.orderRefLabel}
                  </label>
                  <input
                    name="orderReference"
                    defaultValue={editingVehicle.orderReference || ""}
                    placeholder={copy.editModal.orderRefPlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {copy.editModal.vinLabel}
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
                    {copy.editModal.variantLabel}
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
                    {copy.editModal.yearLabel}
                  </label>
                  <input
                    name="year"
                    type="number"
                    defaultValue={editingVehicle.year || 2026}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {copy.editModal.energyLabel}
                  </label>
                  <select
                    name="energy"
                    defaultValue={editingVehicle.energy}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="ELECTRIQUE">{copy.energy.ELECTRIQUE}</option>
                    <option value="HYBRIDE">{copy.energy.HYBRIDE}</option>
                    <option value="PHEV">{copy.energy.PHEV}</option>
                    <option value="ESSENCE">{copy.energy.ESSENCE}</option>
                    <option value="DIESEL">{copy.energy.DIESEL}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {copy.editModal.rangeLabel}
                  </label>
                  <select
                    name="vehicleType"
                    defaultValue={editingVehicle.vehicleType || ""}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="">-</option>
                    <option value="SUV">{copy.vehicleType.SUV}</option>
                    <option value="PICKUP">{copy.vehicleType.PICKUP}</option>
                    <option value="BERLINE">{copy.vehicleType.BERLINE}</option>
                    <option value="VAN">{copy.vehicleType.VAN}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {copy.editModal.siteLabel}
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

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {copy.editModal.supplierLabel}
                  </label>
                  <select
                    name="supplierId"
                    defaultValue={editingVehicle.supplierId || ""}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="">{copy.editModal.supplierNone}</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
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
                    title={copy.editModal.deleteTitle}
                  >
                    <Trash2 size={14} />
                    <span>{copy.editModal.deleteButton}</span>
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
                    {copy.editModal.cancel}
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
                    {copy.editModal.save}
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
                  {copy.deleteModal.title}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", opacity: 0.75 }}>
                  {copy.deleteModal.warning}
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
                <span style={{ opacity: 0.65 }}>{copy.deleteModal.vehicleLabel}</span>
                <strong style={{ color: "var(--ice-text)" }}>
                  {deletingVehicle.brand} {deletingVehicle.model} {deletingVehicle.variant || ""}
                </strong>
              </div>
              {deletingVehicle.vin && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ opacity: 0.65 }}>{copy.deleteModal.vinLabel}</span>
                  <code style={{ fontSize: "0.8rem", color: "var(--gold, #d4af37)" }}>{deletingVehicle.vin}</code>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.65 }}>{copy.deleteModal.siteLabel}</span>
                <span>{deletingVehicle.site?.name || copy.deleteModal.siteUnassigned}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.65 }}>{copy.deleteModal.priceLabel}</span>
                <strong style={{ color: "#22c55e" }}>{formatXof(deletingVehicle.priceXof)}</strong>
              </div>
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
                {copy.deleteModal.cancel}
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
                    setDeleteError(err instanceof Error ? err.message : copy.errors.deleteFailed);
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
                <span>{isDeleting ? copy.deleteModal.deleting : copy.deleteModal.confirm}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
