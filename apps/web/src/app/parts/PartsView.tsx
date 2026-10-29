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
}: {
  parts: PartItemWithRelations[];
  workshopEntries: WorkshopSelectOption[];
  canManage: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"inventory" | "cross-ref" | "movements">("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("ALL");

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
          background: "linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)",
          border: "1px solid rgba(225, 29, 72, 0.2)",
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
                background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(225, 29, 72, 0.35)",
              }}
            >
              <Wrench size={20} />
            </span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              Gestion des Pièces & Références Croisées
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--ice-text-muted)" }}>
            Atelier SAV & Magasin Central CARZONE · Croisement multi-modèles (Changan, Jetour, Chery, BAIC, Forthing, BYD, Toyota)
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="ox-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
                border: "none",
                fontWeight: 600,
                boxShadow: "0 4px 14px rgba(225, 29, 72, 0.3)",
              }}
            >
              <Plus size={16} />
              Nouvelle Pièce Détachée
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
          style={{ padding: "1.2rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
            <span>RÉFÉRENCES PIÈCES</span>
            <Package size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.4rem", color: "#f8fafc" }}>
            {stats.totalRef}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: "0.3rem" }}>
            {stats.totalStockQty} unités physiques en stock
          </div>
        </div>

        <div
          className="ox-glass"
          style={{ padding: "1.2rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
            <span>RÉFÉRENCES CROISÉES</span>
            <ArrowRightLeft size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.4rem", color: "#c084fc" }}>
            {stats.totalCrossRefs}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: "0.3rem" }}>
            Équivalences multi-marques actives
          </div>
        </div>

        <div
          className="ox-glass"
          style={{ padding: "1.2rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
            <span>VALEUR STOCK MAGASIN</span>
            <Boxes size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.4rem", color: "#34d399" }}>
            {formatXof(stats.totalValueXof)}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: "0.3rem" }}>
            Coût d&apos;achat immobilisé en magasin
          </div>
        </div>

        <div
          className="ox-glass"
          style={{
            padding: "1.2rem",
            borderRadius: "14px",
            border: stats.outOfStockCount > 0 ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid rgba(255,255,255,0.08)",
            background: stats.outOfStockCount > 0 ? "rgba(244, 63, 94, 0.05)" : undefined,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--ice-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
            <span>ALERTES RÉAPPROVISIONNEMENT</span>
            <AlertTriangle size={16} color={stats.outOfStockCount > 0 ? "#f43f5e" : "#fbbf24"} />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.4rem", color: stats.outOfStockCount > 0 ? "#f43f5e" : "#fbbf24" }}>
            {stats.outOfStockCount} <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--ice-text-muted)" }}>ruptures</span> · {stats.lowStockCount} <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--ice-text-muted)" }}>faibles</span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: "0.3rem" }}>
            Commandes réapprovisionnement à lancer
          </div>
        </div>
      </div>

      {/* GUIDE RAPIDE DE FORMATION & UTILISATION */}
      <div
        className="ox-glass"
        style={{
          padding: "0.9rem 1.25rem",
          borderRadius: "12px",
          background: "rgba(15, 23, 42, 0.5)",
          border: "1px solid rgba(56, 189, 248, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#38bdf8", fontWeight: 700, fontSize: "0.85rem" }}>
          <Info size={16} />
          <span>Guide opérationnel :</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem", fontSize: "0.82rem", color: "#cbd5e1" }}>
          <div><strong>1. Trouver :</strong> Tapez le modèle (ex: <em>Jetour Dashing</em>) ou le type de pièce (ex: <em>Patin frein</em>).</div>
          <div><strong>2. Vérifier :</strong> Les badges bleus indiquent sur quelles autres voitures la pièce se monte.</div>
          <div><strong>3. Actionner :</strong> Cliquez sur <em>Entrée/Sortie</em> pour mettre à jour le stock en temps réel.</div>
        </div>
      </div>

      {/* NAVIGATION TABS (2 VUES CLAIRES + HISTORIQUE) */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
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
            background: activeTab === "inventory" ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" : "transparent",
            color: activeTab === "inventory" ? "#fff" : "var(--ice-text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Boxes size={16} />
          Magasin & Stock Pièces ({parts.length})
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
            background: activeTab === "cross-ref" ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" : "transparent",
            color: activeTab === "cross-ref" ? "#fff" : "var(--ice-text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowRightLeft size={16} />
          Fiches d&apos;Interchangeabilité Multi-Modèles
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
            background: activeTab === "movements" ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" : "transparent",
            color: activeTab === "movements" ? "#fff" : "var(--ice-text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <History size={16} />
          Historique Entrées & Sorties
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
              background: "linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
              border: "1px solid rgba(225, 29, 72, 0.25)",
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
                  background: "rgba(225, 29, 72, 0.2)",
                  color: "#fb7185",
                  fontWeight: 600,
                  marginBottom: "0.8rem",
                }}
              >
                <Sparkles size={14} /> Moteur d&apos;interchangeabilité pièces multi-marques CARZONE
              </span>
              <h2 style={{ fontSize: "1.4rem", margin: "0 0 0.5rem", color: "#f8fafc" }}>
                Recherche de Référence Croisée & Compatibilité Véhicule
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--ice-text-muted)", margin: "0 0 1.2rem" }}>
                Tapez une référence OEM constructeur, une référence équipementier (Bosch, Brembo, Valeo...) ou le nom d&apos;un véhicule (ex: <em>Jetour Dashing</em>, <em>Changan CS35</em>, <em>Patin</em>, <em>Filtre 1.5T</em>).
              </p>

              <div style={{ position: "relative" }}>
                <Search
                  size={20}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: 3501110-M01, T15-3501080, Changan CS35, Jetour Dashing, Patin frein..."
                  className="ox-input"
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem 0.9rem 3rem",
                    fontSize: "1rem",
                    borderRadius: "12px",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "2px solid rgba(225, 29, 72, 0.35)",
                    color: "#f8fafc",
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
                      color: "#94a3b8",
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
                <span>Recherches rapides :</span>
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
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#cbd5e1",
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
                {filteredParts.length} résultat(s) correspondant(s)
              </h3>
              <span style={{ fontSize: "0.82rem", color: "var(--ice-text-muted)" }}>
                Les correspondances croisées et multi-modèles sont recalculées instantanément
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
                <AlertTriangle size={36} color="#fbbf24" style={{ margin: "0 auto 1rem" }} />
                <h4 style={{ color: "#f8fafc", margin: "0 0 0.5rem" }}>Aucune pièce trouvée pour cette recherche</h4>
                <p style={{ fontSize: "0.9rem", margin: 0 }}>
                  Essayez avec une autre référence, un nom de modèle (ex: Changan, Jetour, Chery, BAIC) ou ajoutez la pièce au catalogue.
                </p>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="ox-btn"
                    style={{ marginTop: "1rem" }}
                  >
                    Ajouter cette référence au stock
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
                        ? "1px solid rgba(244, 63, 94, 0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                      background: isOutOfStock
                        ? "linear-gradient(180deg, rgba(244, 63, 94, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%)"
                        : "linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)",
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
                              color: "#f8fafc",
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
                                background: "rgba(56, 189, 248, 0.15)",
                                color: "#38bdf8",
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
                              background: "rgba(255,255,255,0.08)",
                              color: "var(--ice-text-muted)",
                            }}
                          >
                            {part.category}
                          </span>
                          {part.manufacturer && (
                            <span
                              style={{
                                fontSize: "0.78rem",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "6px",
                                background: "rgba(168, 85, 247, 0.15)",
                                color: "#c084fc",
                                fontWeight: 550,
                              }}
                            >
                              Fabriquant: {part.manufacturer}
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0.4rem 0 0.2rem", color: "#f1f5f9" }}>
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
                          <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)" }}>Prix Vente Atelier</div>
                          <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#f8fafc" }}>
                            {formatXof(part.sellingPriceXof)}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--ice-text-muted)" }}>
                            Achat: {formatXof(part.purchasePriceXof)}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "0.6rem 1rem",
                            borderRadius: "10px",
                            textAlign: "center",
                            background: isOutOfStock
                              ? "rgba(244, 63, 94, 0.15)"
                              : isLowStock
                              ? "rgba(251, 191, 36, 0.15)"
                              : "rgba(34, 197, 94, 0.15)",
                            border: isOutOfStock
                              ? "1px solid rgba(244, 63, 94, 0.3)"
                              : isLowStock
                              ? "1px solid rgba(251, 191, 36, 0.3)"
                              : "1px solid rgba(34, 197, 94, 0.3)",
                            minWidth: 100,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "1.2rem",
                              fontWeight: 700,
                              color: isOutOfStock ? "#f43f5e" : isLowStock ? "#fbbf24" : "#4ade80",
                            }}
                          >
                            {part.stockQuantity} {part.unit}
                          </div>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              color: isOutOfStock ? "#f43f5e" : isLowStock ? "#fbbf24" : "#4ade80",
                            }}
                          >
                            {isOutOfStock ? "RUPTURE" : isLowStock ? "STOCK FAIBLE" : "EN MAGASIN"}
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
                        color: "#94a3b8",
                        background: "rgba(0,0,0,0.2)",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "8px",
                        width: "fit-content",
                      }}
                    >
                      <MapPin size={14} color="#f43f5e" />
                      <span>Emplacement :</span>
                      <strong style={{ color: "#f8fafc" }}>{part.location || "Non assigné (Magasin)"}</strong>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1rem",
                        paddingTop: "0.5rem",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* BLOC 1: RÉFÉRENCES CROISÉES (CROSS-REFERENCES) */}
                      <div
                        style={{
                          background: "rgba(15, 23, 42, 0.4)",
                          padding: "0.9rem",
                          borderRadius: "12px",
                          border: "1px solid rgba(168, 85, 247, 0.2)",
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
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#c084fc", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <ArrowRightLeft size={14} />
                            RÉFÉRENCES CROISÉES (Équivalences OEM & Équipementiers)
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
                            {part.crossReferences.length} réf.
                          </span>
                        </div>

                        {part.crossReferences.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", fontStyle: "italic" }}>
                            Aucune référence croisée enregistrée pour l&apos;instant.
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
                                  background: "rgba(168, 85, 247, 0.1)",
                                  border: "1px solid rgba(168, 85, 247, 0.3)",
                                  fontSize: "0.8rem",
                                }}
                              >
                                <span style={{ fontWeight: 700, color: "#e2e8f0" }}>{cr.brand}:</span>
                                <span style={{ color: "#c084fc", fontFamily: "monospace", fontWeight: 600 }}>
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
                                    title="Supprimer cette référence croisée"
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#f43f5e",
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
                          background: "rgba(15, 23, 42, 0.4)",
                          padding: "0.9rem",
                          borderRadius: "12px",
                          border: "1px solid rgba(56, 189, 248, 0.2)",
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
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#38bdf8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Car size={14} />
                            VÉHICULES COMPATIBLES (Interchangeabilité directe)
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)" }}>
                            {part.compatibilities.length} modèle(s)
                          </span>
                        </div>

                        {part.compatibilities.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", fontStyle: "italic" }}>
                            Aucun véhicule associé pour l&apos;instant.
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
                                  background: "rgba(56, 189, 248, 0.1)",
                                  border: "1px solid rgba(56, 189, 248, 0.3)",
                                  fontSize: "0.8rem",
                                }}
                              >
                                <span style={{ fontWeight: 700, color: "#e2e8f0" }}>{c.vehicleBrand}</span>
                                <span style={{ color: "#38bdf8", fontWeight: 600 }}>{c.vehicleModel}</span>
                                {c.engine && (
                                  <span style={{ fontSize: "0.72rem", color: "var(--ice-text-muted)" }}>
                                    [{c.engine}]
                                  </span>
                                )}
                                {c.position && (
                                  <span style={{ fontSize: "0.72rem", color: "#fbbf24" }}>
                                    ({c.position})
                                  </span>
                                )}
                                {canManage && (
                                  <button
                                    type="button"
                                    onClick={() => deleteCompatibility(c.id)}
                                    title="Supprimer cette compatibilité"
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#f43f5e",
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
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <Plus size={14} /> Ajouter Réf. Croisée / Véhicule
                      </button>

                      <button
                        type="button"
                        onClick={() => setMovementPart(part)}
                        className="ox-btn"
                        style={{
                          fontSize: "0.82rem",
                          padding: "0.4rem 0.8rem",
                          background: "rgba(34, 197, 94, 0.15)",
                          border: "1px solid rgba(34, 197, 94, 0.3)",
                          color: "#4ade80",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <Boxes size={14} /> Entrée / Sortie Stock
                      </button>

                      {part.stockQuantity > 0 && workshopEntries.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAssignPart(part)}
                          className="ox-btn"
                          style={{
                            fontSize: "0.82rem",
                            padding: "0.4rem 0.8rem",
                            background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
                            border: "none",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <Wrench size={14} /> Prélever pour Réparation Atelier
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
                <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Tapez un modèle (ex: Jetour Dashing), un nom (ex: Patin) ou une référence..."
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
                      color: "#94a3b8",
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
                <option value="ALL">Toutes les catégories</option>
                {categories.filter((c) => c !== "ALL").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="ox-select"
                style={{ fontSize: "0.85rem", minWidth: 160 }}
              >
                <option value="ALL">Tous les statuts de stock</option>
                <option value="IN_STOCK">En Stock uniquement</option>
                <option value="LOW">Stock Faible / Alerte</option>
                <option value="OUT">Rupture de Stock</option>
              </select>
            </div>

            {/* BOUTONS DE FILTRAGE RAPIDE PAR VOITURE DE COTONOU */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.4rem", marginTop: "0.6rem", width: "100%", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--ice-text-muted)", fontSize: "0.78rem", marginRight: "0.3rem" }}>Filtres rapides :</span>
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
                    background: searchQuery === btn.query ? "rgba(225, 29, 72, 0.25)" : "rgba(255,255,255,0.06)",
                    border: searchQuery === btn.query ? "1px solid rgba(225, 29, 72, 0.5)" : "1px solid rgba(255,255,255,0.1)",
                    color: searchQuery === btn.query ? "#fb7185" : "#cbd5e1",
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
                    background: "rgba(244, 63, 94, 0.15)",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    color: "#fb7185",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Effacer le filtre ✕
                </button>
              )}
            </div>
          </div>

          {/* TABLEAU DU MAGASIN */}
          <div className="ox-table-wrap">
            <table className="ox-table">
              <thead>
                <tr>
                  <th>Code CARZONE</th>
                  <th>Réf. OEM</th>
                  <th>Désignation</th>
                  <th>Catégorie</th>
                  <th>Emplacement</th>
                  <th>Réf. Croisées</th>
                  <th>Véhicules Compatibles</th>
                  <th>Stock Magasin</th>
                  <th>Prix Vente</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((p) => {
                  const isOutOfStock = p.stockQuantity === 0;
                  const isLow = !isOutOfStock && p.stockQuantity <= p.minStockAlert;

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: "#f8fafc", fontFamily: "monospace" }}>
                        {p.partNumber}
                      </td>
                      <td style={{ color: "#38bdf8", fontFamily: "monospace" }}>
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
                        <span style={{ fontSize: "0.78rem", padding: "0.2rem 0.5rem", borderRadius: "6px", background: "rgba(255,255,255,0.06)" }}>
                          {p.category}
                        </span>
                      </td>
                      <td style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
                        {p.location || "Non défini"}
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
                                  background: "rgba(168, 85, 247, 0.15)",
                                  color: "#c084fc",
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
                                  background: "rgba(56, 189, 248, 0.15)",
                                  color: "#38bdf8",
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
                              ? "rgba(244, 63, 94, 0.2)"
                              : isLow
                              ? "rgba(251, 191, 36, 0.2)"
                              : "rgba(34, 197, 94, 0.2)",
                            color: isOutOfStock ? "#f43f5e" : isLow ? "#fbbf24" : "#4ade80",
                          }}
                        >
                          {p.stockQuantity} {p.unit}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "#f8fafc" }}>
                        {formatXof(p.sellingPriceXof)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => setMovementPart(p)}
                            title="Entrée ou sortie de stock"
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "6px",
                              background: "rgba(34, 197, 94, 0.15)",
                              border: "1px solid rgba(34, 197, 94, 0.35)",
                              color: "#4ade80",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <Boxes size={13} /> ± Stock
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPartForDetails(p)}
                            title="Voir et associer des voitures compatibles ou références croisées"
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "6px",
                              background: "rgba(56, 189, 248, 0.15)",
                              border: "1px solid rgba(56, 189, 248, 0.35)",
                              color: "#38bdf8",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <ArrowRightLeft size={13} /> Voitures ({p.compatibilities.length})
                          </button>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => setEditingPart(p)}
                              title="Modifier la fiche pièce"
                              style={{
                                padding: "0.35rem 0.55rem",
                                borderRadius: "6px",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                color: "#cbd5e1",
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
              Journal d&apos;Audit des Mouvements de Stock
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ice-text-muted)" }}>
              Historique complet des entrées achats, sorties vers l&apos;atelier pour les réparations, et ajustements physiques.
            </p>
          </div>

          <div className="ox-table-wrap">
            <table className="ox-table">
              <thead>
                <tr>
                  <th>Date & Heure</th>
                  <th>Pièce / Réf.</th>
                  <th>Type de Mouvement</th>
                  <th>Quantité</th>
                  <th>Montant Total</th>
                  <th>Document / Véhicule</th>
                  <th>Motif / Commentaire</th>
                  <th>Opérateur</th>
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
                          {new Date(m.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontFamily: "monospace", color: "#f8fafc" }}>
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
                              background: isOut ? "rgba(244, 63, 94, 0.15)" : "rgba(34, 197, 94, 0.15)",
                              color: isOut ? "#fb7185" : "#4ade80",
                            }}
                          >
                            {m.type === "SORTIE_ATELIER"
                              ? "SORTIE ATELIER"
                              : m.type === "ENTREE_ACHAT"
                              ? "ENTRÉE ACHAT"
                              : m.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: isOut ? "#fb7185" : "#4ade80" }}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {formatXof(m.totalPriceXof)}
                        </td>
                        <td style={{ color: "#38bdf8", fontWeight: 600 }}>
                          {m.referenceDoc || "-"}
                        </td>
                        <td style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                          {m.reason || "-"}
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)" }}>
                          {m.performedBy || "Système"}
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
            background: "rgba(0,0,0,0.75)",
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
              background: "#0f172a",
              border: "1px solid rgba(225, 29, 72, 0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
                Enregistrer une Nouvelle Pièce Détachée
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
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
                    Code CARZONE (interne) *
                  </label>
                  <input
                    name="partNumber"
                    required
                    placeholder="Ex: CZ-BRK-35011"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Référence OEM Constructeur (opt.)
                  </label>
                  <input
                    name="oemNumber"
                    placeholder="Ex: 3501110-M01"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  Désignation de la pièce *
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ex: Jeu de plaquettes de frein avant (Patin)"
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Catégorie
                  </label>
                  <select name="category" className="ox-select" style={{ width: "100%" }}>
                    <option value="FREINAGE">FREINAGE</option>
                    <option value="FILTRATION">FILTRATION</option>
                    <option value="SUSPENSION">SUSPENSION</option>
                    <option value="MOTEUR">MOTEUR</option>
                    <option value="ELECTRICITE">ÉLECTRICITÉ</option>
                    <option value="ECLAIRAGE">ÉCLAIRAGE</option>
                    <option value="CARROSSERIE">CARROSSERIE</option>
                    <option value="FLUIDES">FLUIDES & HUILES</option>
                    <option value="AUTRE">AUTRE</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Fabricant / Marque
                  </label>
                  <input
                    name="manufacturer"
                    placeholder="Ex: OEM Changan / Bosch"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Unité
                  </label>
                  <select name="unit" className="ox-select" style={{ width: "100%" }}>
                    <option value="JEU">JEU</option>
                    <option value="PIECE">PIÈCE</option>
                    <option value="PAIRE">PAIRE</option>
                    <option value="LITRE">LITRE</option>
                    <option value="KIT">KIT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Quantité stock initial
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
                    Seuil alerte réappro
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
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Emplacement Magasin
                  </label>
                  <input
                    name="location"
                    placeholder="Ex: Rayon B - Casier 04"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                    Prix d&apos;achat (FCFA)
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
                    Prix de vente Atelier (FCFA)
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
                  background: "rgba(168, 85, 247, 0.08)",
                  border: "1px solid rgba(168, 85, 247, 0.25)",
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c084fc", marginBottom: "0.5rem" }}>
                  Première Référence Croisée / Équivalence (opt.)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input
                    name="initialCrossBrand"
                    placeholder="Marque équivalente (ex: JETOUR, BOSCH)"
                    className="ox-input"
                  />
                  <input
                    name="initialCrossRef"
                    placeholder="Code équivalent (ex: T15-3501080)"
                    className="ox-input"
                  />
                </div>
              </div>

              {/* VÉHICULE COMPATIBLE INITIAL */}
              <div
                style={{
                  padding: "0.9rem",
                  borderRadius: "10px",
                  background: "rgba(56, 189, 248, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#38bdf8", marginBottom: "0.5rem" }}>
                  Premier Véhicule Compatible certifié (opt.)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input
                    name="compatBrand"
                    placeholder="Marque voiture (ex: CHANGAN)"
                    className="ox-input"
                  />
                  <input
                    name="compatModel"
                    placeholder="Modèle voiture (ex: CS35 PLUS)"
                    className="ox-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="ox-btn"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="ox-btn"
                  style={{ background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)", border: "none" }}
                >
                  Créer et enregistrer
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
            background: "rgba(0,0,0,0.75)",
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
              background: "#0f172a",
              border: "1px solid rgba(168, 85, 247, 0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                  Gestion des Croisements · {selectedPartForDetails.partNumber}
                </h3>
                <div style={{ fontSize: "0.85rem", color: "var(--ice-text-muted)" }}>
                  {selectedPartForDetails.name} (Stock: {selectedPartForDetails.stockQuantity} {selectedPartForDetails.unit})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPartForDetails(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
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
                  background: "rgba(168, 85, 247, 0.08)",
                  border: "1px solid rgba(168, 85, 247, 0.25)",
                }}
              >
                <h4 style={{ margin: "0 0 0.8rem", color: "#c084fc", fontSize: "0.95rem", fontWeight: 700 }}>
                  + Ajouter une Nouvelle Référence Croisée (Équivalence)
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
                        Marque / Équipementier
                      </label>
                      <input
                        name="brand"
                        value={newCrossRefBrand}
                        onChange={(e) => setNewCrossRefBrand(e.target.value)}
                        placeholder="Ex: JETOUR, BOSCH, CHERY, BREMBO"
                        className="ox-input"
                        required
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 3 }}>
                        Référence équivalente *
                      </label>
                      <input
                        name="crossReference"
                        value={newCrossRefCode}
                        onChange={(e) => setNewCrossRefCode(e.target.value)}
                        placeholder="Ex: T15-3501080 ou 0 986 494 567"
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
                      placeholder="Remarque technique (ex: Même étrier, dimensions identiques)"
                      className="ox-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      className="ox-btn"
                      style={{ background: "#9333ea", border: "none", fontSize: "0.85rem" }}
                    >
                      Enregistrer la Référence Croisée
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION B: AJOUTER UN VÉHICULE COMPATIBLE */}
              <div
                style={{
                  padding: "1.2rem",
                  borderRadius: "12px",
                  background: "rgba(56, 189, 248, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                }}
              >
                <h4 style={{ margin: "0 0 0.8rem", color: "#38bdf8", fontSize: "0.95rem", fontWeight: 700 }}>
                  + Associer un Modèle de Véhicule Compatible
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
                        Marque Véhicule
                      </label>
                      <input
                        name="vehicleBrand"
                        value={newCompatBrand}
                        onChange={(e) => setNewCompatBrand(e.target.value)}
                        placeholder="Ex: JETOUR, CHANGAN, BAIC"
                        className="ox-input"
                        required
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 3 }}>
                        Modèle Véhicule *
                      </label>
                      <input
                        name="vehicleModel"
                        value={newCompatModel}
                        onChange={(e) => setNewCompatModel(e.target.value)}
                        placeholder="Ex: DASHING, CS55 PLUS, T5 EVO"
                        className="ox-input"
                        required
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                    <input
                      name="years"
                      placeholder="Années (ex: 2022-2026)"
                      className="ox-input"
                    />
                    <input
                      name="engine"
                      value={newCompatEngine}
                      onChange={(e) => setNewCompatEngine(e.target.value)}
                      placeholder="Moteur (ex: 1.5T Turbo)"
                      className="ox-input"
                    />
                    <input
                      name="position"
                      placeholder="Position (ex: Avant, Arrière)"
                      className="ox-input"
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      className="ox-btn"
                      style={{ background: "#0284c7", border: "none", fontSize: "0.85rem" }}
                    >
                      Associer ce Véhicule
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
                  Fermer
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
            background: "rgba(0,0,0,0.75)",
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
              background: "#0f172a",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                Mouvement de Stock · {movementPart.partNumber}
              </h3>
              <button
                type="button"
                onClick={() => setMovementPart(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--ice-text-muted)", marginBottom: "1rem" }}>
              Stock actuel : <strong style={{ color: "#4ade80" }}>{movementPart.stockQuantity} {movementPart.unit}</strong>
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
                  Type d&apos;opération
                </label>
                <select name="type" className="ox-select" style={{ width: "100%" }}>
                  <option value="ENTREE_ACHAT">Entrée en stock (Réception commande fournisseur)</option>
                  <option value="SORTIE_ATELIER">Sortie vers atelier (Consommation réparation)</option>
                  <option value="RETOUR_STOCK">Retour de pièce non utilisée</option>
                  <option value="AJUSTEMENT_INVENTAIRE">Ajustement inventaire physique</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  Quantité
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
                  N° de Document / Référence (opt.)
                </label>
                <input
                  name="referenceDoc"
                  placeholder="Ex: BC-2026-089, OR-042..."
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  Motif / Raison
                </label>
                <input
                  name="reason"
                  placeholder="Ex: Arrivage conteneur Shanghai, entretien rapide..."
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setMovementPart(null)}
                  className="ox-btn"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="ox-btn"
                  style={{ background: "#16a34a", border: "none" }}
                >
                  Valider le Mouvement
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
            background: "rgba(0,0,0,0.75)",
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
              background: "#0f172a",
              border: "1px solid rgba(225, 29, 72, 0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                Imputer la Pièce sur un Ordre de Réparation (OR)
              </h3>
              <button
                type="button"
                onClick={() => setAssignPart(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: "0.8rem",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
                marginBottom: "1rem",
                fontSize: "0.85rem",
              }}
            >
              <div><strong>Pièce :</strong> {assignPart.name} ({assignPart.partNumber})</div>
              <div><strong>Disponible en stock :</strong> {assignPart.stockQuantity} {assignPart.unit}</div>
              <div><strong>Prix de facturation :</strong> {formatXof(assignPart.sellingPriceXof)}</div>
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
                  Sélectionner le Véhicule / OR de l&apos;Atelier SAV *
                </label>
                <select name="workshopEntryId" required className="ox-select" style={{ width: "100%" }}>
                  <option value="">-- Choisir un dossier en cours à l&apos;atelier --</option>
                  {workshopEntries.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.immatriculation} {w.brand ? `(${w.brand} ${w.model || ""})` : ""} · {w.clientName} {w.orNumber ? `[OR: ${w.orNumber}]` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", display: "block", marginBottom: 4 }}>
                  Quantité à prélever
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
                  Observation technicien (opt.)
                </label>
                <input
                  name="notes"
                  placeholder="Ex: Remplacement plaquettes avant sous garantie / révision 20 000 km"
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setAssignPart(null)}
                  className="ox-btn"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="ox-btn"
                  style={{ background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)", border: "none" }}
                >
                  Confirmer le prélèvement & sortir du stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
