"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Layers,
  Wrench,
  Boxes,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Car,
  Package,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Filter,
  Check,
  X,
  History,
  Info,
} from "lucide-react";
import { formatXof } from "@/lib/format";
import { PART_SYSTEMS } from "@/lib/parts-taxonomy";
import { usePrefs } from "@/components/PrefsProvider";
import {
  PART_CATEGORY_KEYS,
  PART_MOVEMENT_TYPE_KEYS,
  PART_UNIT_KEYS,
  movementTypeLabel,
  partCategoryLabel,
  partUnitLabel,
  workshopCopy,
} from "@/lib/i18n/messages/workshop";
import {
  createPart,
  updatePart,
  deletePart,
  addCrossReference,
  deleteCrossReference,
  addCompatibility,
  deleteCompatibility,
  recordStockMovement,
  assignPartToWorkshopEntry,
} from "./actions";

export type PartItemWithRelations = {
  id: string;
  partNumber: string;
  oemNumber: string | null;
  name: string;
  category: string;
  manufacturer: string | null;
  description: string | null;
  unit: string;
  location: string | null;
  stockQuantity: number;
  minStockAlert: number;
  purchasePriceXof: number;
  sellingPriceXof: number;
  active: boolean;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  crossReferences: {
    id: string;
    crossReference: string;
    brand: string;
    isDirectFit: boolean;
    notes: string | null;
  }[];
  compatibilities: {
    id: string;
    vehicleBrand: string;
    vehicleModel: string;
    years: string | null;
    engine: string | null;
    position: string | null;
    notes: string | null;
  }[];
  movements: {
    id: string;
    type: string;
    quantity: number;
    unitPriceXof: number;
    totalPriceXof: number;
    referenceDoc: string | null;
    reason: string | null;
    performedBy: string | null;
    createdAt: Date;
  }[];
};

export type WorkshopSelectOption = {
  id: string;
  orNumber: string | null;
  immatriculation: string;
  brand: string | null;
  model: string | null;
  clientName: string;
};

export function PartsView({
  parts,
  workshopEntries,
  canManage,
  canImport = false,
}: {
  parts: PartItemWithRelations[];
  workshopEntries: WorkshopSelectOption[];
  canManage: boolean;
  canImport?: boolean;
}) {
  const { locale } = usePrefs();
  const copy = workshopCopy[locale].parts;
  const dateLocale = workshopCopy[locale].dateLocale;
  const [activeTab, setActiveTab] = useState<"inventory" | "cross-ref" | "movements">("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("ALL");
  const [createSystem, setCreateSystem] = useState("MOTEUR");
  const [createSubcategory, setCreateSubcategory] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<PartItemWithRelations | null>(null);
  const [movementPart, setMovementPart] = useState<PartItemWithRelations | null>(null);
  const [assignPart, setAssignPart] = useState<PartItemWithRelations | null>(null);
  const [selectedPartForDetails, setSelectedPartForDetails] = useState<PartItemWithRelations | null>(null);

  // Cross ref inline add
  const [newCrossRefBrand, setNewCrossRefBrand] = useState("BOSCH");
  const [newCrossRefCode, setNewCrossRefCode] = useState("");
  const [newCrossRefNotes, setNewCrossRefNotes] = useState("");

  // Compatibility inline add
  const [newCompatBrand, setNewCompatBrand] = useState("CHANGAN");
  const [newCompatModel, setNewCompatModel] = useState("");
  const [newCompatEngine, setNewCompatEngine] = useState("");

  // KPIs
  const stats = useMemo(() => {
    const totalRef = parts.length;
    const totalStockQty = parts.reduce((acc, p) => acc + p.stockQuantity, 0);
    const totalValueXof = parts.reduce((acc, p) => acc + p.stockQuantity * p.purchasePriceXof, 0);
    const lowStockCount = parts.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert).length;
    const outOfStockCount = parts.filter((p) => p.stockQuantity === 0).length;
    const totalCrossRefs = parts.reduce((acc, p) => acc + p.crossReferences.length, 0);
    return { totalRef, totalStockQty, totalValueXof, lowStockCount, outOfStockCount, totalCrossRefs };
  }, [parts]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(parts.map((p) => p.category));
    return ["ALL", ...Array.from(set)];
  }, [parts]);

  // Filtered parts
  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      // Category filter
      if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;

      // Stock status filter
      if (stockStatusFilter === "LOW" && (p.stockQuantity === 0 || p.stockQuantity > p.minStockAlert)) return false;
      if (stockStatusFilter === "OUT" && p.stockQuantity > 0) return false;
      if (stockStatusFilter === "IN_STOCK" && p.stockQuantity === 0) return false;

      // Search query filter (matches part number, OEM, name, manufacturer, cross references, compatible vehicle models)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = p.partNumber.toLowerCase().includes(q);
        const matchOem = p.oemNumber ? p.oemNumber.toLowerCase().includes(q) : false;
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.manufacturer ? p.manufacturer.toLowerCase().includes(q) : false;
        const matchLocation = p.location ? p.location.toLowerCase().includes(q) : false;
        const matchCrossRef = p.crossReferences.some(
          (cr) => cr.crossReference.toLowerCase().includes(q) || cr.brand.toLowerCase().includes(q)
        );
        const matchCompat = p.compatibilities.some(
          (c) => c.vehicleBrand.toLowerCase().includes(q) || c.vehicleModel.toLowerCase().includes(q)
        );
        return matchCode || matchOem || matchName || matchBrand || matchLocation || matchCrossRef || matchCompat;
      }

      return true;
    });
  }, [parts, categoryFilter, stockStatusFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* HEADER SECTION */}
      <div
        className="ox-glass"
        style={{
          padding: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          borderRadius: "16px",
          background: "linear-gradient(135deg, var(--accent-soft) 0%, var(--surface-sunken) 100%)",
          border: "1px solid var(--accent)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "var(--accent)",
                color: "var(--text-strong)",
                boxShadow: "0 4px 12px rgba(225, 29, 72, 0.35)",
              }}
            >
              <Wrench size={20} />
            </span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              {copy.title}
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--ice-text-muted)" }}>
            {copy.subtitle}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {canImport && (
            <a href="/admin/import-pieces" className="ox-btn ox-btn-ghost">
              Importer CSV
            </a>
          )}
          <a href="/catalogue-pieces" className="ox-btn ox-btn-ghost">
            Catalogue général pièces
          </a>
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="ox-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--accent)",
                border: "none",
                fontWeight: 600,
                boxShadow: "0 4px 14px rgba(225, 29, 72, 0.3)",
              }}
            >
              <Plus size={16} />
              {copy.newPart}
            </button>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <div
          className="ox-glass"
          style={{ padding: "1.2rem", borderRadius: "14px", border: "1px solid var(--border)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
            <span>{copy.kpiRefs}</span>
            <Package size={16} color="var(--info-fg)" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.4rem", color: "var(--text)" }}>
            {stats.totalRef}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: "0.3rem" }}>
            {copy.kpiRefsHint(stats.totalStockQty)}
          </div>
        </div>

        <div
          className="ox-glass"
          style={{ padding: "1.2rem", borderRadius: "14px", border: "1px solid var(--border)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
            <span>{copy.kpiCrossRefs}</span>
            <ArrowRightLeft size={16} color="var(--purple-fg)" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.4rem", color: "var(--purple-fg)" }}>
            {stats.totalCrossRefs}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: "0.3rem" }}>
            {copy.kpiCrossRefsHint}
          </div>
        </div>

        <div
          className="ox-glass"
          style={{ padding: "1.2rem", borderRadius: "14px", border: "1px solid var(--border)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
            <span>{copy.kpiValue}</span>
            <Boxes size={16} color="var(--success-fg)" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.4rem", color: "var(--success-fg)" }}>
            {formatXof(stats.totalValueXof)}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: "0.3rem" }}>
            {copy.kpiValueHint}
          </div>
        </div>

        <div
          className="ox-glass"
          style={{
            padding: "1.2rem",
            borderRadius: "14px",
            border: stats.outOfStockCount > 0 ? "1px solid var(--danger)" : "1px solid var(--border)",
            background: stats.outOfStockCount > 0 ? "var(--danger-soft)" : undefined,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
            <span>{copy.kpiAlerts}</span>
            <AlertTriangle size={16} color={stats.outOfStockCount > 0 ? "var(--danger-fg)" : "var(--warning-fg)"} />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.4rem", color: stats.outOfStockCount > 0 ? "var(--danger-fg)" : "var(--warning-fg)" }}>
            {stats.outOfStockCount} <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--ice-text-muted)" }}>{copy.kpiAlertsOut}</span> · {stats.lowStockCount} <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--ice-text-muted)" }}>{copy.kpiAlertsLow}</span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: "0.3rem" }}>
            {copy.kpiAlertsHint}
          </div>
        </div>
      </div>

      {/* GUIDE RAPIDE DE FORMATION & UTILISATION */}
      <div
        className="ox-glass"
        style={{
          padding: "0.9rem 1.25rem",
          borderRadius: "12px",
          background: "var(--surface-sunken)",
          border: "1px solid var(--info)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--info-fg)", fontWeight: 700, fontSize: "0.85rem" }}>
          <Info size={16} />
          <span>{copy.guideTitle}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <div><strong>{copy.guideFindTitle}</strong> {copy.guideFind}</div>
          <div><strong>{copy.guideCheckTitle}</strong> {copy.guideCheck}</div>
          <div><strong>{copy.guideActTitle}</strong> {copy.guideAct}</div>
        </div>
      </div>

      {/* NAVIGATION TABS (2 VUES CLAIRES + HISTORIQUE) */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0.5rem",
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "inventory" ? "var(--accent)" : "transparent",
            color: activeTab === "inventory" ? "var(--text-strong)" : "var(--ice-text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Boxes size={16} />
          {copy.tabInventory(parts.length)}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cross-ref")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "cross-ref" ? "var(--accent)" : "transparent",
            color: activeTab === "cross-ref" ? "var(--text-strong)" : "var(--ice-text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowRightLeft size={16} />
          {copy.tabCrossRefs}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("movements")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "movements" ? "var(--accent)" : "transparent",
            color: activeTab === "movements" ? "var(--text-strong)" : "var(--ice-text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <History size={16} />
          {copy.tabMovements}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CROISEMENT DES RÉFÉRENCES (LE BESOIN PRINCIPAL DU DIRECTEUR) */}
      {/* ========================================================================= */}
      {activeTab === "cross-ref" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {/* SEARCH BOX BANNER */}
          <div
            className="ox-glass"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              background: "linear-gradient(180deg, var(--surface-sunken) 0%, var(--surface) 100%)",
              border: "1px solid var(--accent)",
            }}
          >
            <div style={{ maxWidth: 750, margin: "0 auto", textAlign: "center" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  background: "var(--accent-soft)",
                  color: "var(--danger-fg)",
                  fontWeight: 600,
                  marginBottom: "0.8rem",
                }}
              >
                <Sparkles size={14} /> {copy.crossBadge}
              </span>
              <h2 style={{ fontSize: "1.4rem", margin: "0 0 0.5rem", color: "var(--text)" }}>
                {copy.crossTitle}
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--ice-text-muted)", margin: "0 0 1.2rem" }}>
                {copy.crossIntro}
              </p>

              <div style={{ position: "relative" }}>
                <Search
                  size={20}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={copy.crossPlaceholder}
                  className="ox-input"
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem 0.9rem 3rem",
                    fontSize: "1rem",
                    borderRadius: "12px",
                    background: "var(--surface)",
                    border: "2px solid var(--accent)",
                    color: "var(--text)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* CHIPS EXEMPLES RAPIDES */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "0.8rem",
                  fontSize: "0.8rem",
                  color: "var(--ice-text-muted)",
                }}
              >
                <span>{copy.quickSearches}</span>
                {[
                  "Patin",
                  "CS35",
                  "Jetour Dashing",
                  "Filtre huile 1.5T",
                  "BAIC X55",
                  "Bougie",
                  "Amortisseur",
                  "Bosch",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                      background: "var(--surface-soft)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RÉSULTATS DE RECHERCHE CROISÉE */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 600 }}>
                {copy.resultCount(filteredParts.length)}
              </h3>
              <span style={{ fontSize: "0.82rem", color: "var(--ice-text-muted)" }}>
                {copy.resultsHint}
              </span>
            </div>

            {filteredParts.length === 0 ? (
              <div
                className="ox-glass"
                style={{
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                  borderRadius: "14px",
                  color: "var(--ice-text-muted)",
                }}
              >
                <AlertTriangle size={36} color="var(--warning-fg)" style={{ margin: "0 auto 1rem" }} />
                <h4 style={{ color: "var(--text)", margin: "0 0 0.5rem" }}>{copy.emptyTitle}</h4>
                <p style={{ fontSize: "0.9rem", margin: 0 }}>
                  {copy.emptyBody}
                </p>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="ox-btn"
                    style={{ marginTop: "1rem" }}
                  >
                    {copy.emptyAction}
                  </button>
                )}
              </div>
            ) : (
              filteredParts.map((part) => {
                const isOutOfStock = part.stockQuantity === 0;
                const isLowStock = !isOutOfStock && part.stockQuantity <= part.minStockAlert;

                return (
                  <div
                    key={part.id}
                    className="ox-glass"
                    style={{
                      padding: "1.4rem",
                      borderRadius: "16px",
                      border: isOutOfStock
                        ? "1px solid var(--danger)"
                        : "1px solid var(--border)",
                      background: isOutOfStock
                        ? "linear-gradient(180deg, var(--danger-soft) 0%, var(--surface-sunken) 100%)"
                        : "var(--surface-sunken)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {/* EN-TÊTE DE LA FICHE PIÈCE */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: "1.15rem",
                              fontWeight: 700,
                              color: "var(--text)",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {part.partNumber}
                          </span>
                          {part.oemNumber && (
                            <span
                              style={{
                                fontSize: "0.82rem",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "6px",
                                background: "var(--info-soft)",
                                color: "var(--info-fg)",
                                fontWeight: 600,
                              }}
                            >
                              OEM: {part.oemNumber}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "0.78rem",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "6px",
                              background: "var(--surface-soft)",
                              color: "var(--ice-text-muted)",
                            }}
                          >
                            {partCategoryLabel(copy, part.category)}
                          </span>
                          {part.manufacturer && (
                            <span
                              style={{
                                fontSize: "0.78rem",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "6px",
                                background: "var(--purple-soft)",
                                color: "var(--purple-fg)",
                                fontWeight: 550,
                              }}
                            >
                              {copy.manufacturerBadge} {part.manufacturer}
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0.4rem 0 0.2rem", color: "var(--text)" }}>
                          {part.name}
                        </h4>
                        {part.description && (
                          <p style={{ fontSize: "0.85rem", color: "var(--ice-text-muted)", margin: 0 }}>
                            {part.description}
                          </p>
                        )}
                      </div>

                      {/* ÉTAT DU STOCK & PRIX */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", textAlign: "right" }}>
                        <div>
                          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)" }}>{copy.salePrice}</div>
                          <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text)" }}>
                            {formatXof(part.sellingPriceXof)}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--ice-text-muted)" }}>
                            {copy.purchasePrice(formatXof(part.purchasePriceXof))}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "0.6rem 1rem",
                            borderRadius: "10px",
                            textAlign: "center",
                            background: isOutOfStock
                              ? "var(--danger-soft)"
                              : isLowStock
                              ? "var(--warning-soft)"
                              : "var(--success-soft)",
                            border: isOutOfStock
                              ? "1px solid var(--danger)"
                              : isLowStock
                              ? "1px solid var(--warning)"
                              : "1px solid var(--success)",
                            minWidth: 100,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "1.2rem",
                              fontWeight: 700,
                              color: isOutOfStock ? "var(--danger-fg)" : isLowStock ? "var(--warning-fg)" : "var(--success-fg)",
                            }}
                          >
                            {part.stockQuantity} {partUnitLabel(copy, part.unit)}
                          </div>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              color: isOutOfStock ? "var(--danger-fg)" : isLowStock ? "var(--warning-fg)" : "var(--success-fg)",
                            }}
                          >
                            {isOutOfStock ? copy.stockOut : isLowStock ? copy.stockLow : copy.stockIn}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* EMPLACEMENT MAGASIN */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                        background: "var(--surface-soft)",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "8px",
                        width: "fit-content",
                      }}
                    >
                      <MapPin size={14} color="var(--danger-fg)" />
                      <span>{copy.locationLabel}</span>
                      <strong style={{ color: "var(--text)" }}>{part.location || copy.locationNone}</strong>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1rem",
                        paddingTop: "0.5rem",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      {/* BLOC 1: RÉFÉRENCES CROISÉES (CROSS-REFERENCES) */}
                      <div
                        style={{
                          background: "var(--surface-sunken)",
                          padding: "0.9rem",
                          borderRadius: "12px",
                          border: "1px solid var(--purple)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.6rem",
                          }}
                        >
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--purple-fg)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <ArrowRightLeft size={14} />
                            {copy.crossBlockTitle}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
                            {copy.crossCount(part.crossReferences.length)}
                          </span>
                        </div>

                        {part.crossReferences.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", fontStyle: "italic" }}>
                            {copy.crossEmpty}
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {part.crossReferences.map((cr) => (
                              <div
                                key={cr.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                  padding: "0.35rem 0.65rem",
                                  borderRadius: "8px",
                                  background: "var(--purple-soft)",
                                  border: "1px solid var(--purple)",
                                  fontSize: "0.8rem",
                                }}
                              >
                                <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>{cr.brand}:</span>
                                <span style={{ color: "var(--purple-fg)", fontFamily: "monospace", fontWeight: 600 }}>
                                  {cr.crossReference}
                                </span>
                                {cr.notes && (
                                  <span style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)" }}>
                                    ({cr.notes})
                                  </span>
                                )}
                                {canManage && (
                                  <button
                                    type="button"
                                    onClick={() => deleteCrossReference(cr.id)}
                                    title={copy.crossDeleteTitle}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "var(--danger-fg)",
                                      cursor: "pointer",
                                      padding: 0,
                                      marginLeft: 4,
                                    }}
                                  >
                                    <X size={13} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* BLOC 2: MODÈLES DE VOITURES COMPATIBLES (MULTI-MODÈLES) */}
                      <div
                        style={{
                          background: "var(--surface-sunken)",
                          padding: "0.9rem",
                          borderRadius: "12px",
                          border: "1px solid var(--info)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.6rem",
                          }}
                        >
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--info-fg)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Car size={14} />
                            {copy.compatBlockTitle}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
                            {copy.compatCount(part.compatibilities.length)}
                          </span>
                        </div>

                        {part.compatibilities.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", fontStyle: "italic" }}>
                            {copy.compatEmpty}
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                            {part.compatibilities.map((c) => (
                              <div
                                key={c.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  padding: "0.35rem 0.6rem",
                                  borderRadius: "8px",
                                  background: "var(--info-soft)",
                                  border: "1px solid var(--info)",
                                  fontSize: "0.8rem",
                                }}
                              >
                                <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>{c.vehicleBrand}</span>
                                <span style={{ color: "var(--info-fg)", fontWeight: 600 }}>{c.vehicleModel}</span>
                                {c.engine && (
                                  <span style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)" }}>
                                    [{c.engine}]
                                  </span>
                                )}
                                {c.position && (
                                  <span style={{ fontSize: "0.72rem", color: "var(--warning-fg)" }}>
                                    ({c.position})
                                  </span>
                                )}
                                {canManage && (
                                  <button
                                    type="button"
                                    onClick={() => deleteCompatibility(c.id)}
                                    title={copy.compatDeleteTitle}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "var(--danger-fg)",
                                      cursor: "pointer",
                                      padding: 0,
                                      marginLeft: 3,
                                    }}
                                  >
                                    <X size={13} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS RAPIDES SUR LA PIÈCE */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "0.6rem",
                        paddingTop: "0.4rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedPartForDetails(part)}
                        className="ox-btn"
                        style={{
                          fontSize: "0.82rem",
                          padding: "0.4rem 0.8rem",
                          background: "var(--surface-soft)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <Plus size={14} /> {copy.actionAddCrossRef}
                      </button>

                      <button
                        type="button"
                        onClick={() => setMovementPart(part)}
                        className="ox-btn"
                        style={{
                          fontSize: "0.82rem",
                          padding: "0.4rem 0.8rem",
                          background: "var(--success-soft)",
                          border: "1px solid var(--success)",
                          color: "var(--success-fg)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <Boxes size={14} /> {copy.actionMovement}
                      </button>

                      {part.stockQuantity > 0 && workshopEntries.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAssignPart(part)}
                          className="ox-btn"
                          style={{
                            fontSize: "0.82rem",
                            padding: "0.4rem 0.8rem",
                            background: "var(--accent)",
                            border: "none",
                            color: "var(--text-strong)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <Wrench size={14} /> {copy.actionPickForWorkshop}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INVENTAIRE & MAGASIN CENTRAL */}
      {/* ========================================================================= */}
      {activeTab === "inventory" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* BARRE DE FILTRES */}
          <div
            className="ox-glass"
            style={{
              padding: "1rem",
              borderRadius: "14px",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", width: "100%" }}>
              <div style={{ position: "relative", flex: "1 1 320px" }}>
                <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  placeholder={copy.filterSearchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ox-input"
                  style={{ paddingLeft: "2.3rem", width: "100%", fontSize: "0.92rem", borderRadius: "10px" }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="ox-select"
                style={{ fontSize: "0.85rem", minWidth: 160 }}
              >
                <option value="ALL">{copy.filterAllCategories}</option>
                {categories.filter((c) => c !== "ALL").map((c) => (
                  <option key={c} value={c}>
                    {partCategoryLabel(copy, c)}
                  </option>
                ))}
              </select>

              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="ox-select"
                style={{ fontSize: "0.85rem", minWidth: 160 }}
              >
                <option value="ALL">{copy.filterAllStock}</option>
                <option value="IN_STOCK">{copy.filterInStock}</option>
                <option value="LOW">{copy.filterLowStock}</option>
                <option value="OUT">{copy.filterOutStock}</option>
              </select>
            </div>

            {/* BOUTONS DE FILTRAGE RAPIDE PAR VOITURE DE COTONOU */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.4rem", marginTop: "0.6rem", width: "100%", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--ice-text-muted)", fontSize: "0.78rem", marginRight: "0.3rem" }}>{copy.filterQuick}</span>
              {[
                { label: "Patin frein", query: "Patin" },
                { label: "Jetour Dashing", query: "Jetour Dashing" },
                { label: "Changan CS35", query: "CS35" },
                { label: "Kaiyi X3 Pro", query: "Kaiyi" },
                { label: "BAIC X35/X55", query: "BAIC" },
                { label: "Filtres 1.5T", query: "Filtre" },
                { label: "Bougies", query: "Bougie" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => setSearchQuery(btn.query)}
                  style={{
                    padding: "0.2rem 0.55rem",
                    borderRadius: "6px",
                    background: searchQuery === btn.query ? "var(--accent-soft)" : "var(--surface-soft)",
                    border: searchQuery === btn.query ? "1px solid var(--accent)" : "1px solid var(--border)",
                    color: searchQuery === btn.query ? "var(--danger-fg)" : "var(--text-muted)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    fontWeight: searchQuery === btn.query ? 700 : 500,
                  }}
                >
                  {btn.label}
                </button>
              ))}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    padding: "0.2rem 0.55rem",
                    borderRadius: "6px",
                    background: "var(--danger-soft)",
                    border: "1px solid var(--danger)",
                    color: "var(--danger-fg)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {copy.filterClear} ✕
                </button>
              )}
            </div>
          </div>

          {/* TABLEAU DU MAGASIN */}
          <div className="ox-table-wrap">
            <table className="ox-table">
              <thead>
                <tr>
                  <th>{copy.colPartCode}</th>
                  <th>{copy.colOem}</th>
                  <th>{copy.colName}</th>
                  <th>{copy.colCategory}</th>
                  <th>{copy.colLocation}</th>
                  <th>{copy.colCrossRefs}</th>
                  <th>{copy.colCompatible}</th>
                  <th>{copy.colStock}</th>
                  <th>{copy.colSalePrice}</th>
                  <th>{copy.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((p) => {
                  const isOutOfStock = p.stockQuantity === 0;
                  const isLow = !isOutOfStock && p.stockQuantity <= p.minStockAlert;

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>
                        {p.partNumber}
                      </td>
                      <td style={{ color: "var(--info-fg)", fontFamily: "monospace" }}>
                        {p.oemNumber || "-"}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.manufacturer && (
                          <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
                            {p.manufacturer}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: "0.78rem", padding: "0.2rem 0.5rem", borderRadius: "6px", background: "var(--surface-soft)" }}>
                          {partCategoryLabel(copy, p.category)}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {p.location || copy.locationUndefined}
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {p.crossReferences.length === 0 ? (
                            <span style={{ color: "var(--ice-text-muted)", fontSize: "0.8rem" }}>-</span>
                          ) : (
                            p.crossReferences.map((cr) => (
                              <span
                                key={cr.id}
                                style={{
                                  fontSize: "0.72rem",
                                  padding: "0.15rem 0.4rem",
                                  borderRadius: "4px",
                                  background: "var(--purple-soft)",
                                  color: "var(--purple-fg)",
                                  fontFamily: "monospace",
                                }}
                              >
                                {cr.brand}: {cr.crossReference}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {p.compatibilities.length === 0 ? (
                            <span style={{ color: "var(--ice-text-muted)", fontSize: "0.8rem" }}>-</span>
                          ) : (
                            p.compatibilities.map((c) => (
                              <span
                                key={c.id}
                                style={{
                                  fontSize: "0.72rem",
                                  padding: "0.15rem 0.4rem",
                                  borderRadius: "4px",
                                  background: "var(--info-soft)",
                                  color: "var(--info-fg)",
                                }}
                              >
                                {c.vehicleBrand} {c.vehicleModel}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            padding: "0.25rem 0.6rem",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            background: isOutOfStock
                              ? "var(--danger-soft)"
                              : isLow
                              ? "var(--warning-soft)"
                              : "var(--success-soft)",
                            color: isOutOfStock ? "var(--danger-fg)" : isLow ? "var(--warning-fg)" : "var(--success-fg)",
                          }}
                        >
                          {p.stockQuantity} {partUnitLabel(copy, p.unit)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text)" }}>
                        {formatXof(p.sellingPriceXof)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => setMovementPart(p)}
                            title={copy.rowStockTitle}
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "6px",
                              background: "var(--success-soft)",
                              border: "1px solid var(--success)",
                              color: "var(--success-fg)",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <Boxes size={13} /> {copy.rowStockButton}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPartForDetails(p)}
                            title={copy.rowVehiclesTitle}
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "6px",
                              background: "var(--info-soft)",
                              border: "1px solid var(--info)",
                              color: "var(--info-fg)",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <ArrowRightLeft size={13} /> {copy.rowVehicles(p.compatibilities.length)}
                          </button>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => setEditingPart(p)}
                              title={copy.rowEditTitle}
                              style={{
                                padding: "0.35rem 0.55rem",
                                borderRadius: "6px",
                                background: "var(--surface-soft)",
                                border: "1px solid var(--border)",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                fontSize: "0.78rem",
                                display: "inline-flex",
                                alignItems: "center",
                              }}
                            >
                              <Tag size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TRAÇABILITÉ DES MOUVEMENTS & SORTIES ATELIER */}
      {/* ========================================================================= */}
      {activeTab === "movements" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            className="ox-glass"
            style={{ padding: "1.2rem", borderRadius: "14px" }}
          >
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem", fontWeight: 700 }}>
              {copy.auditTitle}
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ice-text-muted)" }}>
              {copy.auditSubtitle}
            </p>
          </div>

          <div className="ox-table-wrap">
            <table className="ox-table">
              <thead>
                <tr>
                  <th>{copy.colDate}</th>
                  <th>{copy.colPart}</th>
                  <th>{copy.colMovementType}</th>
                  <th>{copy.colQuantity}</th>
                  <th>{copy.colTotal}</th>
                  <th>{copy.colDocument}</th>
                  <th>{copy.colReason}</th>
                  <th>{copy.colOperator}</th>
                </tr>
              </thead>
              <tbody>
                {parts
                  .flatMap((p) =>
                    p.movements.map((m) => ({
                      ...m,
                      partCode: p.partNumber,
                      partName: p.name,
                    }))
                  )
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 100)
                  .map((m) => {
                    const isOut = m.quantity < 0 || m.type === "SORTIE_ATELIER";

                    return (
                      <tr key={m.id}>
                        <td style={{ color: "var(--ice-text-muted)", fontSize: "0.82rem" }}>
                          {new Date(m.createdAt).toLocaleDateString(dateLocale, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--text)" }}>
                            {m.partCode}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)" }}>
                            {m.partName}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.78rem",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "6px",
                              fontWeight: 600,
                              background: isOut ? "var(--danger-soft)" : "var(--success-soft)",
                              color: isOut ? "var(--danger-fg)" : "var(--success-fg)",
                            }}
                          >
                            {movementTypeLabel(copy, m.type)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: isOut ? "var(--danger-fg)" : "var(--success-fg)" }}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {formatXof(m.totalPriceXof)}
                        </td>
                        <td style={{ color: "var(--info-fg)", fontWeight: 600 }}>
                          {m.referenceDoc || "-"}
                        </td>
                        <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          {m.reason || "-"}
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)" }}>
                          {m.performedBy || copy.operatorSystem}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* MODAL 1: CRÉER UNE NOUVELLE PIÈCE */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface-sunken)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.8rem",
              borderRadius: "18px",
              background: "var(--surface)",
              border: "1px solid var(--accent)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
                {copy.createTitle}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--surface-sunken)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={async (formData) => {
                await createPart(formData);
                setIsCreateModalOpen(false);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createCodeLabel}
                  </label>
                  <input
                    name="partNumber"
                    required
                    placeholder={copy.createCodePlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createOemLabel}
                  </label>
                  <input
                    name="oemNumber"
                    placeholder={copy.createOemPlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  {copy.createNameLabel}
                </label>
                <input
                  name="name"
                  required
                  placeholder={copy.createNamePlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Système technique
                  </label>
                  <select
                    name="system"
                    className="ox-select"
                    style={{ width: "100%" }}
                    value={createSystem}
                    onChange={(event) => {
                      setCreateSystem(event.target.value);
                      setCreateSubcategory("");
                    }}
                  >
                    {PART_SYSTEMS.map((system) => (
                      <option key={system.code} value={system.code}>{system.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Sous-catégorie
                  </label>
                  <select
                    name="subcategory"
                    className="ox-select"
                    style={{ width: "100%" }}
                    value={createSubcategory}
                    onChange={(event) => setCreateSubcategory(event.target.value)}
                  >
                    <option value="">Non précisée</option>
                    {(PART_SYSTEMS.find((system) => system.code === createSystem)?.subcategories || []).map((subcategory) => (
                      <option key={subcategory.code} value={subcategory.code}>{subcategory.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createManufacturerLabel}
                  </label>
                  <input
                    name="manufacturer"
                    placeholder={copy.createManufacturerPlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createUnitLabel}
                  </label>
                  <select name="unit" className="ox-select" style={{ width: "100%" }}>
                    {PART_UNIT_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {copy.unit[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createStockLabel}
                  </label>
                  <input
                    name="stockQuantity"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createAlertLabel}
                  </label>
                  <input
                    name="minStockAlert"
                    type="number"
                    min="1"
                    defaultValue="2"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createLocationLabel}
                  </label>
                  <input
                    name="location"
                    placeholder={copy.createLocationPlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createCategoryLabel}
                  </label>
                  <select name="category" className="ox-select" style={{ width: "100%" }}>
                    {PART_CATEGORY_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {copy.category[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Type de référence croisée initiale
                  </label>
                  <select name="initialCrossRefType" className="ox-select" style={{ width: "100%" }}>
                    <option value="EQUIVALENT">Équivalent</option>
                    <option value="OEM">OEM constructeur</option>
                    <option value="AFTERMARKET">Équipementier</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createPurchaseLabel}
                  </label>
                  <input
                    name="purchasePriceXof"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    {copy.createSaleLabel}
                  </label>
                  <input
                    name="sellingPriceXof"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* CROISEMENT DE RÉFÉRENCE INITIAL */}
              <div
                style={{
                  padding: "0.9rem",
                  borderRadius: "10px",
                  background: "var(--purple-soft)",
                  border: "1px solid var(--purple)",
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--purple-fg)", marginBottom: "0.5rem" }}>
                  {copy.createCrossRefTitle}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input
                    name="initialCrossBrand"
                    placeholder={copy.createCrossRefBrandPlaceholder}
                    className="ox-input"
                  />
                  <input
                    name="initialCrossRef"
                    placeholder={copy.createCrossRefCodePlaceholder}
                    className="ox-input"
                  />
                </div>
              </div>

              {/* VÉHICULE COMPATIBLE INITIAL */}
              <div
                style={{
                  padding: "0.9rem",
                  borderRadius: "10px",
                  background: "var(--info-soft)",
                  border: "1px solid var(--info)",
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--info-fg)", marginBottom: "0.5rem" }}>
                  {copy.createCompatTitle}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input
                    name="compatBrand"
                    placeholder={copy.createCompatBrandPlaceholder}
                    className="ox-input"
                  />
                  <input
                    name="compatModel"
                    placeholder={copy.createCompatModelPlaceholder}
                    className="ox-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="ox-btn"
                  style={{ background: "var(--surface-soft)" }}
                >
                  {copy.cancel}
                </button>
                <button
                  type="submit"
                  className="ox-btn"
                  style={{ background: "var(--accent)", border: "none" }}
                >
                  {copy.createSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GÉRER LES RÉFÉRENCES CROISÉES ET COMPATIBILITÉS */}
      {/* ========================================================================= */}
      {selectedPartForDetails && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface-sunken)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.8rem",
              borderRadius: "18px",
              background: "var(--surface)",
              border: "1px solid var(--purple)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                  {copy.detailsTitle(selectedPartForDetails.partNumber)}
                </h3>
                <div style={{ fontSize: "0.85rem", color: "var(--ice-text-muted)" }}>
                  {copy.detailsSubtitle(
                    selectedPartForDetails.name,
                    selectedPartForDetails.stockQuantity,
                    partUnitLabel(copy, selectedPartForDetails.unit)
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPartForDetails(null)}
                style={{ background: "none", border: "none", color: "var(--surface-sunken)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* SECTION A: AJOUTER UNE RÉFÉRENCE CROISÉE */}
              <div
                style={{
                  padding: "1.2rem",
                  borderRadius: "12px",
                  background: "var(--purple-soft)",
                  border: "1px solid var(--purple)",
                }}
              >
                <h4 style={{ margin: "0 0 0.8rem", color: "var(--purple-fg)", fontSize: "0.95rem", fontWeight: 700 }}>
                  {copy.detailsAddCrossRefTitle}
                </h4>

                <form
                  action={async (formData) => {
                    formData.append("partItemId", selectedPartForDetails.id);
                    await addCrossReference(formData);
                    setNewCrossRefCode("");
                    setNewCrossRefNotes("");
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 3 }}>
                        {copy.detailsBrandLabel}
                      </label>
                      <input
                        name="brand"
                        value={newCrossRefBrand}
                        onChange={(e) => setNewCrossRefBrand(e.target.value)}
                        placeholder={copy.detailsBrandPlaceholder}
                        className="ox-input"
                        required
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 3 }}>
                        {copy.detailsCodeLabel}
                      </label>
                      <input
                        name="crossReference"
                        value={newCrossRefCode}
                        onChange={(e) => setNewCrossRefCode(e.target.value)}
                        placeholder={copy.detailsCodePlaceholder}
                        className="ox-input"
                        required
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      name="notes"
                      value={newCrossRefNotes}
                      onChange={(e) => setNewCrossRefNotes(e.target.value)}
                      placeholder={copy.detailsNotesPlaceholder}
                      className="ox-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      className="ox-btn"
                      style={{ background: "var(--purple-solid)", border: "none", fontSize: "0.85rem" }}
                    >
                      {copy.detailsAddCrossRefSubmit}
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION B: AJOUTER UN VÉHICULE COMPATIBLE */}
              <div
                style={{
                  padding: "1.2rem",
                  borderRadius: "12px",
                  background: "var(--info-soft)",
                  border: "1px solid var(--info)",
                }}
              >
                <h4 style={{ margin: "0 0 0.8rem", color: "var(--info-fg)", fontSize: "0.95rem", fontWeight: 700 }}>
                  {copy.detailsAddCompatTitle}
                </h4>

                <form
                  action={async (formData) => {
                    formData.append("partItemId", selectedPartForDetails.id);
                    await addCompatibility(formData);
                    setNewCompatModel("");
                    setNewCompatEngine("");
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 3 }}>
                        {copy.detailsVehicleBrandLabel}
                      </label>
                      <input
                        name="vehicleBrand"
                        value={newCompatBrand}
                        onChange={(e) => setNewCompatBrand(e.target.value)}
                        placeholder={copy.detailsVehicleBrandPlaceholder}
                        className="ox-input"
                        required
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 3 }}>
                        {copy.detailsVehicleModelLabel}
                      </label>
                      <input
                        name="vehicleModel"
                        value={newCompatModel}
                        onChange={(e) => setNewCompatModel(e.target.value)}
                        placeholder={copy.detailsVehicleModelPlaceholder}
                        className="ox-input"
                        required
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                    <input
                      name="years"
                      placeholder={copy.detailsYearsPlaceholder}
                      className="ox-input"
                    />
                    <input
                      name="engine"
                      value={newCompatEngine}
                      onChange={(e) => setNewCompatEngine(e.target.value)}
                      placeholder={copy.detailsEnginePlaceholder}
                      className="ox-input"
                    />
                    <input
                      name="position"
                      placeholder={copy.detailsPositionPlaceholder}
                      className="ox-input"
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      className="ox-btn"
                      style={{ background: "var(--info-solid)", border: "none", fontSize: "0.85rem" }}
                    >
                      {copy.detailsAddCompatSubmit}
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSelectedPartForDetails(null)}
                  className="ox-btn"
                >
                  {copy.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MOUVEMENT DE STOCK (ENTRÉE ACHAT / SORTIE MANUELLE) */}
      {/* ========================================================================= */}
      {movementPart && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface-sunken)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 500,
              padding: "1.8rem",
              borderRadius: "18px",
              background: "var(--surface)",
              border: "1px solid var(--success)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                {copy.movementTitle(movementPart.partNumber)}
              </h3>
              <button
                type="button"
                onClick={() => setMovementPart(null)}
                style={{ background: "none", border: "none", color: "var(--surface-sunken)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--ice-text-muted)", marginBottom: "1rem" }}>
              {copy.movementCurrentStock} <strong style={{ color: "var(--success-fg)" }}>{movementPart.stockQuantity} {partUnitLabel(copy, movementPart.unit)}</strong>
            </div>

            <form
              action={async (formData) => {
                formData.append("partItemId", movementPart.id);
                await recordStockMovement(formData);
                setMovementPart(null);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  {copy.movementTypeLabel}
                </label>
                <select name="type" className="ox-select" style={{ width: "100%" }}>
                  {PART_MOVEMENT_TYPE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {copy.movementType[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  {copy.movementQuantityLabel}
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  {copy.movementDocumentLabel}
                </label>
                <input
                  name="referenceDoc"
                  placeholder={copy.movementDocumentPlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  {copy.movementReasonLabel}
                </label>
                <input
                  name="reason"
                  placeholder={copy.movementReasonPlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setMovementPart(null)}
                  className="ox-btn"
                  style={{ background: "var(--surface-soft)" }}
                >
                  {copy.cancel}
                </button>
                <button
                  type="submit"
                  className="ox-btn"
                  style={{ background: "var(--success-solid)", border: "none" }}
                >
                  {copy.movementSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRÉLEVER UNE PIÈCE POUR UN VÉHICULE EN ATELIER */}
      {/* ========================================================================= */}
      {assignPart && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface-sunken)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 550,
              padding: "1.8rem",
              borderRadius: "18px",
              background: "var(--surface)",
              border: "1px solid var(--accent)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                {copy.assignTitle}
              </h3>
              <button
                type="button"
                onClick={() => setAssignPart(null)}
                style={{ background: "none", border: "none", color: "var(--surface-sunken)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: "0.8rem",
                borderRadius: "10px",
                background: "var(--surface-soft)",
                marginBottom: "1rem",
                fontSize: "0.85rem",
              }}
            >
              <div><strong>{copy.assignPartLabel}</strong> {assignPart.name} ({assignPart.partNumber})</div>
              <div><strong>{copy.assignAvailableLabel}</strong> {assignPart.stockQuantity} {partUnitLabel(copy, assignPart.unit)}</div>
              <div><strong>{copy.assignPriceLabel}</strong> {formatXof(assignPart.sellingPriceXof)}</div>
            </div>

            <form
              action={async (formData) => {
                formData.append("partItemId", assignPart.id);
                await assignPartToWorkshopEntry(formData);
                setAssignPart(null);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  {copy.assignEntryLabel}
                </label>
                <select name="workshopEntryId" required className="ox-select" style={{ width: "100%" }}>
                  <option value="">-- {copy.assignEntryPlaceholder} --</option>
                  {workshopEntries.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.immatriculation} {w.brand ? `(${w.brand} ${w.model || ""})` : ""} · {w.clientName} {w.orNumber ? `[OR: ${w.orNumber}]` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  {copy.assignQuantityLabel}
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  max={assignPart.stockQuantity}
                  defaultValue="1"
                  required
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  {copy.assignNotesLabel}
                </label>
                <input
                  name="notes"
                  placeholder={copy.assignNotesPlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setAssignPart(null)}
                  className="ox-btn"
                  style={{ background: "var(--surface-soft)" }}
                >
                  {copy.cancel}
                </button>
                <button
                  type="submit"
                  className="ox-btn"
                  style={{ background: "var(--accent)", border: "none" }}
                >
                  {copy.assignSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
