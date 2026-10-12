"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Minus,
  Trash2,
  X,
  AlertCircle,
  ShoppingCart,
  Check,
  UserPlus,
  Tag,
} from "lucide-react";
import { formatXof } from "@/lib/format";
import { computeTaxTotals, type TaxMode } from "@/lib/billing";
import { getDefaultCgv, type CgvType } from "@/lib/cgv";
import { createCustomer } from "@/app/clients/actions";
import {
  calculateDiscountAmount,
  formatVehicleDescription,
  type DiscountType,
} from "@/lib/quote-discount";
import { formatLegalAmountNotice } from "@/lib/number-to-words-fr";
import { createProformaWithLines } from "./actions";

export type CustomerOption = {
  id: string;
  contactName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  category?: string | null;
  ifu?: string | null;
  address?: string | null;
};

export type ArticleOption = {
  id: string;
  name: string;
  category?: string | null;
  unitPriceXof: number;
  taxRatePct: number;
  unit?: string | null;
  description?: string | null;
};

export type VehicleOption = {
  id: string;
  vin: string | null;
  brand: string;
  model: string;
  variant?: string | null;
  color: string | null;
  priceXof: number;
};

export type OpportunityOption = {
  id: string;
  title: string;
  customerId: string | null;
};

type FormLine = {
  id: string;
  description: string;
  quantity: number;
  unitPriceXof: number;
  vehicleId?: string | null;
};

export function QuoteCreator({
  customers,
  articles,
  vehicles,
  opportunities,
  onCreated,
}: {
  customers: CustomerOption[];
  articles: ArticleOption[];
  vehicles: VehicleOption[];
  opportunities: OpportunityOption[];
  onCreated?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Dynamic customer list (includes newly added clients during session)
  const [customerList, setCustomerList] = useState<CustomerOption[]>(customers);

  // Form states
  const [customerId, setCustomerId] = useState("");
  const [opportunityId, setOpportunityId] = useState("");
  const [taxMode, setTaxMode] = useState<TaxMode>("HT");
  const [taxRatePct, setTaxRatePct] = useState<number>(18);
  const [validDays, setValidDays] = useState<number>(14);
  const [notes, setNotes] = useState("");

  // CGV Page 2 contract states
  const [cgvType, setCgvType] = useState<CgvType>("VEHICULE");
  const [customCgvText, setCustomCgvText] = useState<string>(() => getDefaultCgv("VEHICULE"));
  const [isCgvCustomized, setIsCgvCustomized] = useState(false);
  const [showCgvEditor, setShowCgvEditor] = useState(false);

  // Quick Client Creation Modal states
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientError, setNewClientError] = useState<string | null>(null);
  const [newContactName, setNewContactName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newIfu, setNewIfu] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCategory, setNewCategory] = useState("Particulier");

  // Stratégie Commerciale / Remise
  const [discountType, setDiscountType] = useState<DiscountType>("NONE");
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Staged item for customizing quantity and unit price before insertion
  type StagedItem = {
    type: "ARTICLE" | "VEHICLE";
    sourceId: string;
    title: string;
    description: string;
    catalogPriceXof: number;
    unitPriceXof: number;
    quantity: number;
    vehicleId?: string | null;
  };
  const [stagedItem, setStagedItem] = useState<StagedItem | null>(null);

  // Real-time toast feedback & highlighted row
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [highlightedLineId, setHighlightedLineId] = useState<string | null>(null);

  // Multi-lines
  const [lines, setLines] = useState<FormLine[]>([
    {
      id: "line-1",
      description: "",
      quantity: 1,
      unitPriceXof: 0,
      vehicleId: null,
    },
  ]);

  // Dropdown helper selectors
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  // Real-time tax and discount computation
  const grossTotal = lines.reduce((s, l) => s + (l.quantity || 0) * (l.unitPriceXof || 0), 0);
  const discountAmount = calculateDiscountAmount(grossTotal, {
    type: discountType,
    value: discountValue,
  });
  const totals = computeTaxTotals({
    lineTotalXof: grossTotal,
    taxMode,
    taxRatePct,
    discountXof: discountAmount,
  });

  function triggerActionFeedback(msg: string, lineId?: string) {
    setFeedbackMessage(msg);
    if (lineId) setHighlightedLineId(lineId);
    setTimeout(() => {
      setFeedbackMessage(null);
      setHighlightedLineId(null);
    }, 4500);
  }

  function handleCgvTypeChange(type: CgvType) {
    setCgvType(type);
    if (!isCgvCustomized) {
      setCustomCgvText(getDefaultCgv(type));
    }
  }

  async function handleQuickCreateClient(e: React.FormEvent) {
    e.preventDefault();
    if (!newContactName.trim()) {
      setNewClientError("Le nom du client est requis.");
      return;
    }
    setNewClientError(null);
    setIsCreatingClient(true);
    try {
      const fd = new FormData();
      fd.append("contactName", newContactName.trim());
      if (newCompanyName.trim()) fd.append("companyName", newCompanyName.trim());
      if (newEmail.trim()) fd.append("email", newEmail.trim());
      if (newPhone.trim()) fd.append("phone", newPhone.trim());
      if (newIfu.trim()) fd.append("ifu", newIfu.trim());
      if (newAddress.trim()) fd.append("address", newAddress.trim());
      fd.append("category", newCategory);

      const created = await createCustomer(fd);
      const newOption: CustomerOption = {
        id: created.id,
        contactName: created.contactName,
        companyName: created.companyName,
        email: created.email,
        phone: created.phone,
        category: created.category,
        ifu: created.ifu,
        address: created.address,
      };

      setCustomerList((prev) => [newOption, ...prev]);
      setCustomerId(created.id);
      setIsNewClientModalOpen(false);
      // Reset fields
      setNewContactName("");
      setNewCompanyName("");
      setNewEmail("");
      setNewPhone("");
      setNewIfu("");
      setNewAddress("");
    } catch (err: unknown) {
      setNewClientError(err instanceof Error ? err.message : "Erreur lors de la création du client");
    } finally {
      setIsCreatingClient(false);
    }
  }

  function addEmptyLine() {
    const newId = `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setLines((prev) => [
      ...prev,
      {
        id: newId,
        description: "",
        quantity: 1,
        unitPriceXof: 0,
        vehicleId: null,
      },
    ]);
    triggerActionFeedback("Nouvelle ligne vide ajoutée", newId);
  }

  function addOrIncrementLine(params: {
    description: string;
    quantity: number;
    unitPriceXof: number;
    vehicleId?: string | null;
    title?: string;
  }) {
    const { description, quantity, unitPriceXof, vehicleId, title } = params;
    const cleanDesc = description.trim();

    setLines((prev) => {
      const cleaned = prev.filter((l) => l.description.trim() !== "" || l.unitPriceXof > 0);

      const existingIndex = cleaned.findIndex((l) => {
        if (vehicleId && l.vehicleId === vehicleId) return true;
        return l.description.trim().toLowerCase() === cleanDesc.toLowerCase();
      });

      if (existingIndex >= 0) {
        // Incrémente la quantité au lieu de dupliquer la ligne !
        const updated = [...cleaned];
        const existing = updated[existingIndex];
        const newQty = (existing.quantity || 0) + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          unitPriceXof: unitPriceXof !== undefined ? unitPriceXof : existing.unitPriceXof,
        };
        triggerActionFeedback(
          `✨ Quantité augmentée : "${title || cleanDesc}" passe à ${newQty} unité(s)`,
          existing.id
        );
        return updated;
      } else {
        const newId = `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        triggerActionFeedback(
          `✅ Article ajouté au devis : "${title || cleanDesc}" (${quantity}x ${formatXof(unitPriceXof)})`,
          newId
        );
        return [
          ...cleaned,
          {
            id: newId,
            description: cleanDesc,
            quantity: quantity || 1,
            unitPriceXof: unitPriceXof || 0,
            vehicleId: vehicleId || null,
          },
        ];
      }
    });
  }

  function handleSelectArticle(articleId: string) {
    if (!articleId) return;
    const art = articles.find((a) => a.id === articleId);
    if (!art) return;
    const desc = art.name + (art.description ? ` — ${art.description}` : "");
    const existing = lines.find((l) => l.description.trim().toLowerCase() === desc.trim().toLowerCase());
    setStagedItem({
      type: "ARTICLE",
      sourceId: art.id,
      title: art.name,
      description: desc,
      catalogPriceXof: art.unitPriceXof,
      unitPriceXof: existing ? existing.unitPriceXof : art.unitPriceXof,
      quantity: 1,
      vehicleId: null,
    });
    setSelectedArticleId("");
  }

  function handleSelectVehicle(vehicleId: string) {
    if (!vehicleId) return;
    const veh = vehicles.find((v) => v.id === vehicleId);
    if (!veh) return;
    const desc = formatVehicleDescription(veh);
    const existing = lines.find((l) => (veh.id && l.vehicleId === veh.id) || l.description.trim().toLowerCase() === desc.trim().toLowerCase());
    setStagedItem({
      type: "VEHICLE",
      sourceId: veh.id,
      title: `${veh.brand} ${veh.model}`,
      description: desc,
      catalogPriceXof: veh.priceXof,
      unitPriceXof: existing ? existing.unitPriceXof : veh.priceXof,
      quantity: 1,
      vehicleId: veh.id,
    });
    setSelectedVehicleId("");
  }

  function updateLine<K extends keyof FormLine>(id: string, field: K, value: FormLine[K]) {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  }

  function removeLine(id: string) {
    if (lines.length <= 1) {
      setLines([
        {
          id: "line-1",
          description: "",
          quantity: 1,
          unitPriceXof: 0,
          vehicleId: null,
        },
      ]);
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function resetForm() {
    setCustomerId("");
    setOpportunityId("");
    setTaxMode("HT");
    setTaxRatePct(18);
    setValidDays(14);
    setNotes("");
    setDiscountType("NONE");
    setDiscountValue(0);
    setStagedItem(null);
    setFeedbackMessage(null);
    setHighlightedLineId(null);
    setLines([
      {
        id: "line-1",
        description: "",
        quantity: 1,
        unitPriceXof: 0,
        vehicleId: null,
      },
    ]);
    setError(null);
  }

  function handleSubmit() {
    if (!customerId) {
      setError("Veuillez sélectionner un client destinataire.");
      return;
    }

    const validLines = lines.filter((l) => l.description.trim().length > 0 && l.unitPriceXof >= 0);
    if (validLines.length === 0) {
      setError("Veuillez ajouter au moins une ligne avec une désignation valide.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await createProformaWithLines({
          customerId,
          opportunityId: opportunityId || null,
          taxMode,
          taxRatePct,
          validDays,
          notes: notes.trim() || null,
          cgvType,
          customCgv: isCgvCustomized ? customCgvText : null,
          discountType,
          discountValue,
          lines: validLines.map((l) => ({
            description: l.description.trim(),
            quantity: Number(l.quantity) || 1,
            unitPriceXof: Number(l.unitPriceXof) || 0,
            vehicleId: l.vehicleId || null,
          })),
        });
        resetForm();
        setIsOpen(false);
        if (onCreated) onCreated();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création de la proforma";
        setError(message);
      }
    });
  }

  const selectedCustomer = customerList.find((c) => c.id === customerId);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ox-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "linear-gradient(135deg, var(--gold) 0%, #b89130 100%)",
          color: "#0a1622",
          fontWeight: 650,
          padding: "0.65rem 1.25rem",
          borderRadius: "8px",
          border: "none",
          boxShadow: "0 4px 14px rgba(212, 175, 55, 0.25)",
          cursor: "pointer",
        }}
      >
        <Plus size={18} />
        Nouvelle Proforma Multi-lignes
      </button>

      {isOpen && mounted && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(3, 8, 15, 0.88)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1.5rem 1rem",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) {
              setIsOpen(false);
            }
          }}
        >
          <div
            className="ox-modal-box"
            style={{
              width: "100%",
              maxWidth: 960,
              maxHeight: "92vh",
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              margin: "auto",
              background: "rgba(10, 24, 34, 0.98)",
              border: "1px solid var(--ice-border)",
              borderRadius: 18,
              boxShadow: "0 25px 65px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(126, 200, 227, 0.15)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--ice-border)",
                paddingBottom: "1rem",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShoppingCart size={22} color="var(--gold)" />
                  <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                    Création de Devis Proforma
                  </h2>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--ice-text-muted)", marginTop: 4 }}>
                  CARZONE SARL · Showroom Immeuble CBDH Saint-Michel, Cotonou · Devis catalogue & véhicules
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--ice-text)",
                  opacity: 0.7,
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={22} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 8,
                  color: "#fca5a5",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.9rem",
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* En-tête Client & Paramètres fiscaux (Sleek & 100% Responsive) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                background: "rgba(255,255,255,0.02)",
                padding: "1rem",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Ligne 1 : Client & Opportunité */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "0.85rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <label style={{ fontSize: "0.8rem", opacity: 0.8, margin: 0, fontWeight: 600 }}>
                      Client destinataire *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsNewClientModalOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--gold)",
                        fontSize: "0.78rem",
                        fontWeight: 650,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: 0,
                      }}
                    >
                      <UserPlus size={13} />
                      + Nouveau Client
                    </button>
                  </div>
                  <select
                    className="ox-select"
                    style={{ width: "100%" }}
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="">-- Sélectionner un client --</option>
                    {customerList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.contactName} {c.companyName ? `(${c.companyName})` : ""} {c.phone ? `· ${c.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>
                    Opportunité commerciale (optionnel)
                  </label>
                  <select
                    className="ox-select"
                    style={{ width: "100%" }}
                    value={opportunityId}
                    onChange={(e) => setOpportunityId(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="">-- Aucune opportunité liée --</option>
                    {opportunities
                      .filter((o) => !customerId || o.customerId === customerId)
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {selectedCustomer && (
                <div
                  style={{
                    padding: "0.45rem 0.75rem",
                    borderRadius: 6,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "0.78rem",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "var(--ice-text-strong)" }}>
                    ✓ {selectedCustomer.contactName} {selectedCustomer.companyName ? `(${selectedCustomer.companyName})` : ""}
                  </span>
                  {selectedCustomer.phone && <span style={{ opacity: 0.8 }}>📞 {selectedCustomer.phone}</span>}
                  {selectedCustomer.email && <span style={{ opacity: 0.8 }}>✉️ {selectedCustomer.email}</span>}
                  {selectedCustomer.ifu && (
                    <span style={{ color: "var(--ice-highlight)", fontWeight: 600 }}>
                      IFU : {selectedCustomer.ifu}
                    </span>
                  )}
                </div>
              )}

              {/* Ligne 2 : Base fiscale, TVA, Validité */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", opacity: 0.75, marginBottom: 3 }}>
                    Base fiscale
                  </label>
                  <select
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                    value={taxMode}
                    onChange={(e) => setTaxMode(e.target.value as TaxMode)}
                    disabled={isPending}
                  >
                    <option value="HT">Montants HT</option>
                    <option value="TTC">Montants TTC</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", opacity: 0.75, marginBottom: 3 }}>
                    Taux TVA
                  </label>
                  <select
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                    value={taxRatePct}
                    onChange={(e) => setTaxRatePct(Number(e.target.value))}
                    disabled={isPending}
                  >
                    <option value="18">18 % (Standard)</option>
                    <option value="0">0 % (Exonéré)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", opacity: 0.75, marginBottom: 3 }}>
                    Validité
                  </label>
                  <select
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    disabled={isPending}
                  >
                    <option value="7">7 jours</option>
                    <option value="14">14 jours</option>
                    <option value="30">30 jours</option>
                    <option value="60">60 jours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sélecteurs rapides Catalogue / Véhicules */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                background: "rgba(212, 175, 55, 0.04)",
                padding: "0.75rem 1rem",
                borderRadius: 10,
                border: "1px dashed rgba(212, 175, 55, 0.3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--gold)" }}>
                  ⚡ Ajout rapide depuis le catalogue & stock :
                </span>
                <button
                  type="button"
                  onClick={addEmptyLine}
                  className="ox-btn ox-btn-ghost ox-btn-sm"
                  style={{ fontSize: "0.78rem", padding: "0.3rem 0.65rem" }}
                  disabled={isPending}
                >
                  + Ligne libre
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "0.6rem" }}>
                <select
                  className="ox-select"
                  style={{ width: "100%", fontSize: "0.83rem" }}
                  value={selectedArticleId}
                  onChange={(e) => {
                    setSelectedArticleId(e.target.value);
                    if (e.target.value) handleSelectArticle(e.target.value);
                  }}
                  disabled={isPending}
                >
                  <option value="">⚡ + Article / Borne / Service...</option>
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      [{art.category}] {art.name} — {formatXof(art.unitPriceXof)}
                    </option>
                  ))}
                </select>

                <select
                  className="ox-select"
                  style={{ width: "100%", fontSize: "0.83rem" }}
                  value={selectedVehicleId}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    if (e.target.value) handleSelectVehicle(e.target.value);
                  }}
                  disabled={isPending}
                >
                  <option value="">🚗 + Véhicule en stock...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.color || "Standard"}) — {formatXof(v.priceXof)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Panneau de Personnalisation Immédiate (Quantité & Prix Négocié) */}
              {stagedItem && (
                <div
                  style={{
                    background: "rgba(10, 24, 34, 0.95)",
                    border: "1px solid var(--gold)",
                    borderRadius: 8,
                    padding: "0.85rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          background: "var(--gold)",
                          color: "#0a1622",
                          fontWeight: 750,
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {stagedItem.type === "VEHICLE" ? "🚗 VÉHICULE EN STOCK" : "⚡ ARTICLE / SERVICE"}
                      </span>
                      <strong style={{ color: "var(--ice-text-strong)", fontSize: "0.95rem" }}>
                        {stagedItem.title}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStagedItem(null)}
                      style={{ background: "none", border: "none", color: "var(--ice-text-muted)", cursor: "pointer" }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)" }}>
                    {stagedItem.description}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                    {/* Quantité avec stepper */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: "0.75rem", opacity: 0.8 }}>Quantité à ajouter :</label>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          border: "1px solid var(--ice-border)",
                          borderRadius: 6,
                          background: "rgba(0,0,0,0.3)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setStagedItem((prev) =>
                              prev ? { ...prev, quantity: Math.max(1, prev.quantity - 1) } : null
                            )
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--ice-text)",
                            padding: "6px 10px",
                            cursor: "pointer",
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={stagedItem.quantity}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            setStagedItem((prev) => (prev ? { ...prev, quantity: val } : null));
                          }}
                          className="ox-input"
                          style={{
                            width: 50,
                            textAlign: "center",
                            border: "none",
                            background: "transparent",
                            fontWeight: 700,
                            padding: "4px 0",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setStagedItem((prev) =>
                              prev ? { ...prev, quantity: prev.quantity + 1 } : null
                            )
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--ice-text)",
                            padding: "6px 10px",
                            cursor: "pointer",
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Prix unitaire modifiable */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                          Prix unitaire (modifiable selon négociation) :
                        </label>
                        {stagedItem.unitPriceXof !== stagedItem.catalogPriceXof && (
                          <span style={{ fontSize: "0.7rem", color: "var(--gold)" }}>
                            Base catalogue : {formatXof(stagedItem.catalogPriceXof)}
                          </span>
                        )}
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={stagedItem.unitPriceXof}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setStagedItem((prev) => (prev ? { ...prev, unitPriceXof: val } : null));
                          }}
                          className="ox-input"
                          style={{ width: "100%", paddingRight: 60, fontWeight: 700, fontSize: "0.9rem" }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "0.75rem",
                            opacity: 0.6,
                          }}
                        >
                          FCFA
                        </span>
                      </div>
                    </div>

                    {/* Total et validation */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginLeft: "auto" }}>
                      <div style={{ textAlign: "right", marginRight: 6 }}>
                        <div style={{ fontSize: "0.7rem", opacity: 0.65 }}>Ligne calculée</div>
                        <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--gold)" }}>
                          {formatXof(stagedItem.quantity * stagedItem.unitPriceXof)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addOrIncrementLine({
                            description: stagedItem.description,
                            quantity: stagedItem.quantity,
                            unitPriceXof: stagedItem.unitPriceXof,
                            vehicleId: stagedItem.vehicleId,
                            title: stagedItem.title,
                          });
                          setStagedItem(null);
                        }}
                        className="ox-btn"
                        style={{
                          background: "linear-gradient(135deg, var(--gold) 0%, #b89130 100%)",
                          color: "#0a1622",
                          fontWeight: 700,
                          padding: "0.6rem 1.15rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Plus size={16} />
                        Insérer dans le devis
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification / Toast de confirmation d'action */}
            {feedbackMessage && (
              <div
                style={{
                  padding: "0.6rem 1rem",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: 8,
                  color: "#6ee7b7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={16} />
                  <span>{feedbackMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackMessage(null)}
                  style={{ background: "none", border: "none", color: "#6ee7b7", cursor: "pointer", opacity: 0.8 }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Table des Lignes */}
            <div
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(0, 0, 0, 0.2)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.6rem 1rem",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.82rem",
                }}
              >
                <span style={{ fontWeight: 650, color: "var(--ice-text)" }}>
                  Lignes du devis ({lines.length}) · {lines.reduce((s, l) => s + (l.quantity || 0), 0)} article(s) au total
                </span>
                <span style={{ opacity: 0.65, fontSize: "0.75rem" }}>
                  💡 Vous pouvez modifier la désignation, la quantité et le prix unitaire directement sur chaque ligne.
                </span>
              </div>

              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table
                  style={{
                    width: "100%",
                    minWidth: 540,
                    borderCollapse: "collapse",
                    fontSize: "0.88rem",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid rgba(255,255,255,0.1)",
                        textAlign: "left",
                        opacity: 0.7,
                      }}
                    >
                      <th style={{ padding: "0.6rem 0.5rem", width: "42%" }}>Désignation / Article</th>
                      <th style={{ padding: "0.6rem 0.5rem", width: "16%", textAlign: "center" }}>Quantité</th>
                      <th style={{ padding: "0.6rem 0.5rem", width: "22%", textAlign: "right" }}>P.U. (XOF)</th>
                      <th style={{ padding: "0.6rem 0.5rem", width: "15%", textAlign: "right" }}>Total</th>
                      <th style={{ padding: "0.6rem 0.5rem", width: "5%", textAlign: "center" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => {
                      const lineTotal = (line.quantity || 0) * (line.unitPriceXof || 0);
                      const isHighlighted = line.id === highlightedLineId;
                      return (
                        <tr
                          key={line.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            background: isHighlighted ? "rgba(212, 175, 55, 0.12)" : undefined,
                            transition: "background 0.3s ease",
                          }}
                        >
                          <td style={{ padding: "0.5rem" }}>
                            <input
                              type="text"
                              className="ox-input"
                              style={{ width: "100%", fontSize: "0.85rem" }}
                              placeholder={`Ligne ${idx + 1} — ex: TOYOTA COROLLA CROSS, Borne Wallbox...`}
                              value={line.description}
                              onChange={(e) => updateLine(line.id, "description", e.target.value)}
                              disabled={isPending}
                            />
                          </td>
                          <td style={{ padding: "0.5rem", textAlign: "center" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                border: "1px solid var(--ice-border)",
                                borderRadius: 6,
                                background: "rgba(0,0,0,0.25)",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  updateLine(line.id, "quantity", Math.max(1, (line.quantity || 1) - 1))
                                }
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--ice-text)",
                                  padding: "4px 7px",
                                  cursor: "pointer",
                                }}
                                title="Diminuer la quantité"
                                disabled={isPending}
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                className="ox-input"
                                style={{
                                  width: "48px",
                                  textAlign: "center",
                                  fontSize: "0.85rem",
                                  border: "none",
                                  background: "transparent",
                                  fontWeight: 700,
                                  padding: "4px 0",
                                }}
                                value={line.quantity}
                                onChange={(e) =>
                                  updateLine(line.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                                }
                                disabled={isPending}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateLine(line.id, "quantity", (line.quantity || 0) + 1)
                                }
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--ice-text)",
                                  padding: "4px 7px",
                                  cursor: "pointer",
                                }}
                                title="Augmenter la quantité"
                                disabled={isPending}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: "0.5rem", textAlign: "right" }}>
                            <div style={{ position: "relative" }}>
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                className="ox-input"
                                style={{ width: "100%", textAlign: "right", fontSize: "0.85rem", paddingRight: 45 }}
                                value={line.unitPriceXof || ""}
                                onChange={(e) =>
                                  updateLine(line.id, "unitPriceXof", parseInt(e.target.value) || 0)
                                }
                                disabled={isPending}
                              />
                              <span
                                style={{
                                  position: "absolute",
                                  right: 8,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  fontSize: "0.7rem",
                                  opacity: 0.55,
                                  pointerEvents: "none",
                                }}
                              >
                                FCFA
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "0.5rem", textAlign: "right", fontWeight: 700, color: "var(--ice-text)" }}>
                            {formatXof(lineTotal)}
                          </td>
                          <td style={{ padding: "0.5rem", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeLine(line.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                opacity: 0.7,
                              }}
                              title="Supprimer cette ligne"
                              disabled={isPending}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Conditions Générales de Vente (CGV Page 2 Imprimée) */}
            <div
              style={{
                background: "rgba(0, 120, 212, 0.04)",
                border: "1px solid rgba(0, 120, 212, 0.18)",
                borderRadius: 8,
                padding: "0.6rem 0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--ice-highlight)" }}>
                    📜 CGV adossées en Page 2 :
                  </span>
                  <div
                    style={{
                      display: "inline-flex",
                      borderRadius: 6,
                      overflow: "hidden",
                      border: "1px solid var(--ice-border)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCgvTypeChange("VEHICULE")}
                      style={{
                        padding: "0.25rem 0.6rem",
                        fontSize: "0.75rem",
                        fontWeight: 650,
                        border: "none",
                        cursor: "pointer",
                        background: cgvType === "VEHICULE" ? "var(--brand)" : "rgba(255,255,255,0.05)",
                        color: cgvType === "VEHICULE" ? "#fff" : "var(--ice-text)",
                      }}
                    >
                      🚗 Véhicules
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCgvTypeChange("ATELIER")}
                      style={{
                        padding: "0.25rem 0.6rem",
                        fontSize: "0.75rem",
                        fontWeight: 650,
                        border: "none",
                        cursor: "pointer",
                        background: cgvType === "ATELIER" ? "var(--brand)" : "rgba(255,255,255,0.05)",
                        color: cgvType === "ATELIER" ? "#fff" : "var(--ice-text)",
                      }}
                    >
                      🔧 Atelier SAV
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCgvEditor((p) => !p)}
                  className="ox-btn ox-btn-ghost ox-btn-sm"
                  style={{ fontSize: "0.75rem", padding: "0.25rem 0.55rem" }}
                >
                  {showCgvEditor ? "Masquer texte" : "Personnaliser le texte"}
                </button>
              </div>

              {showCgvEditor && (
                <div style={{ marginTop: 6 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.75rem",
                      opacity: 0.8,
                      marginBottom: 4,
                    }}
                  >
                    <span>
                      Texte contractuel applicable ({cgvType === "VEHICULE" ? "Vente Véhicules" : "Atelier SAV"}) :
                    </span>
                    {isCgvCustomized && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCgvText(getDefaultCgv(cgvType));
                          setIsCgvCustomized(false);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--gold)",
                          cursor: "pointer",
                          fontSize: "0.74rem",
                          fontWeight: 600,
                        }}
                      >
                        ↺ Réinitialiser au texte officiel
                      </button>
                    )}
                  </div>
                  <textarea
                    className="ox-input"
                    style={{
                      width: "100%",
                      height: 150,
                      fontSize: "0.78rem",
                      fontFamily: "monospace",
                      lineHeight: 1.45,
                    }}
                    value={customCgvText}
                    onChange={(e) => {
                      setCustomCgvText(e.target.value);
                      setIsCgvCustomized(true);
                    }}
                    disabled={isPending}
                  />
                </div>
              )}
            </div>

            {/* Stratégie Commerciale / Remise Accordée */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.06), rgba(0, 120, 212, 0.03))",
                border: "1px solid rgba(212, 175, 55, 0.28)",
                borderRadius: 8,
                padding: "0.65rem 0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Tag size={16} color="var(--gold)" />
                  <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--gold)" }}>
                    Stratégie Commerciale &amp; Remise :
                  </span>
                </div>

                {/* Toggle Type Remise */}
                <div
                  style={{
                    display: "inline-flex",
                    borderRadius: 6,
                    overflow: "hidden",
                    border: "1px solid var(--ice-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType("NONE");
                      setDiscountValue(0);
                    }}
                    style={{
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.75rem",
                      fontWeight: 650,
                      border: "none",
                      cursor: "pointer",
                      background: discountType === "NONE" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.25)",
                      color: discountType === "NONE" ? "#fff" : "var(--ice-text-muted)",
                    }}
                  >
                    Sans remise
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType("PERCENT");
                      if (!discountValue || discountValue > 100) setDiscountValue(5);
                    }}
                    style={{
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.75rem",
                      fontWeight: 650,
                      border: "none",
                      cursor: "pointer",
                      background: discountType === "PERCENT" ? "var(--brand)" : "rgba(0,0,0,0.25)",
                      color: discountType === "PERCENT" ? "#fff" : "var(--ice-text-muted)",
                    }}
                  >
                    % Pourcentage
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType("AMOUNT");
                      if (!discountValue || discountValue <= 100) setDiscountValue(500000);
                    }}
                    style={{
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.75rem",
                      fontWeight: 650,
                      border: "none",
                      cursor: "pointer",
                      background: discountType === "AMOUNT" ? "var(--gold)" : "rgba(0,0,0,0.25)",
                      color: discountType === "AMOUNT" ? "#0a1622" : "var(--ice-text-muted)",
                    }}
                  >
                    Montant Fixe
                  </button>
                </div>
              </div>

              {discountType === "PERCENT" && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, paddingTop: 4 }}>
                  <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>Paliers rapides :</span>
                  {[2, 5, 7, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountValue(pct)}
                      style={{
                        padding: "0.3rem 0.65rem",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        borderRadius: 6,
                        border: discountValue === pct ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.1)",
                        background: discountValue === pct ? "rgba(212, 175, 55, 0.25)" : "rgba(255,255,255,0.04)",
                        color: discountValue === pct ? "var(--gold)" : "var(--ice-text)",
                        cursor: "pointer",
                      }}
                    >
                      -{pct} %
                    </button>
                  ))}

                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                    <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>Taux personnalisé :</label>
                    <div style={{ position: "relative", width: 85 }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={discountValue || ""}
                        onChange={(e) => setDiscountValue(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="ox-input"
                        style={{ width: "100%", paddingRight: 24, fontSize: "0.85rem", textAlign: "right", fontWeight: 700 }}
                      />
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", opacity: 0.6 }}>
                        %
                      </span>
                    </div>
                  </div>

                  <div style={{ width: "100%", fontSize: "0.82rem", color: "var(--gold)", fontWeight: 650 }}>
                    ✨ Remise accordée : -{formatXof(discountAmount)} déduite du montant brut
                  </div>
                </div>
              )}

              {discountType === "AMOUNT" && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, paddingTop: 4 }}>
                  <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>Montant net de la remise accordée :</label>
                  <div style={{ position: "relative", width: 220 }}>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={discountValue || ""}
                      onChange={(e) => setDiscountValue(Math.max(0, parseInt(e.target.value) || 0))}
                      className="ox-input"
                      style={{ width: "100%", paddingRight: 55, fontSize: "0.85rem", textAlign: "right", fontWeight: 700 }}
                    />
                    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", opacity: 0.6 }}>
                      FCFA
                    </span>
                  </div>

                  <div style={{ fontSize: "0.82rem", color: "var(--gold)", fontWeight: 650, marginLeft: "auto" }}>
                    ✨ Remise déduite : -{formatXof(discountAmount)} ({grossTotal > 0 ? ((discountAmount / grossTotal) * 100).toFixed(1) : 0}% du brut)
                  </div>
                </div>
              )}
            </div>

            {/* Totaux & Notes */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
                alignItems: "start",
                paddingTop: "0.5rem",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", opacity: 0.8, marginBottom: 4 }}>
                  Notes & Conditions particulières (imprimées sur le devis)
                </label>
                <textarea
                  className="ox-input"
                  style={{ width: "100%", height: 90, fontSize: "0.85rem" }}
                  placeholder="Ex: Livraison sous 48h au Showroom (Akpakpa ou Étoile Rouge). Câble de recharge Type 2 et première révision offerts. Garantie batterie 8 ans / 150 000 km."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div
                style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ opacity: 0.7 }}>Sous-total Brut HT :</span>
                  <span style={{ fontWeight: 600 }}>{formatXof(totals.grossHtXof)}</span>
                </div>

                {totals.discountXof > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--gold)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Tag size={13} />
                      Remise Commerciale {discountType === "PERCENT" ? `(-${discountValue}%)` : ""} :
                    </span>
                    <span style={{ fontWeight: 700 }}>-{formatXof(totals.discountXof)}</span>
                  </div>
                )}

                {totals.discountXof > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                      borderTop: "1px dashed rgba(255,255,255,0.1)",
                      paddingTop: 4,
                    }}
                  >
                    <span style={{ opacity: 0.7 }}>Net Commercial HT :</span>
                    <span style={{ fontWeight: 600 }}>{formatXof(totals.subtotalHtXof)}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ opacity: 0.7 }}>TVA Bénin ({taxRatePct}%) :</span>
                  <span style={{ fontWeight: 600 }}>{formatXof(totals.taxXof)}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    borderTop: "1px solid var(--ice-border)",
                    paddingTop: 8,
                    marginTop: 4,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--gold)" }}>
                    Total TTC Net ({taxMode}) :
                  </span>
                  <span style={{ fontWeight: 800, fontSize: "1.35rem", color: "var(--ice-text-strong)" }}>
                    {formatXof(totals.totalXof)}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 6,
                    paddingTop: 8,
                    borderTop: "1px dashed rgba(255,255,255,0.1)",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.7)",
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}
                >
                  ✍️ {formatLegalAmountNotice(totals.totalXof, "proforma")}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                borderTop: "1px solid var(--ice-border)",
                paddingTop: "1rem",
              }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ox-btn ox-btn-ghost"
                disabled={isPending}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="ox-btn"
                disabled={isPending}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 650,
                  minWidth: 180,
                  justifyContent: "center",
                }}
              >
                {isPending ? (
                  <span>Génération en cours...</span>
                ) : (
                  <>
                    <Check size={18} />
                    Créer la Proforma
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL RAPIDE : NOUVEAU CLIENT */}
      {isNewClientModalOpen && mounted && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(3, 8, 15, 0.9)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
            padding: "1rem",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isCreatingClient) {
              setIsNewClientModalOpen(false);
            }
          }}
        >
          <div
            className="ox-modal-box"
            style={{
              width: "100%",
              maxWidth: 540,
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.1rem",
              margin: "auto",
              background: "rgba(10, 24, 34, 0.98)",
              border: "1px solid var(--ice-border)",
              borderRadius: 16,
              boxShadow: "0 25px 65px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--ice-border)",
                paddingBottom: "0.75rem",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                  Nouveau Client (Ajout express)
                </h3>
                <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
                  Coordonnées client &amp; identifiant fiscal IFU pour le devis
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(false)}
                disabled={isCreatingClient}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--ice-text)",
                  opacity: 0.7,
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {newClientError && (
              <div
                style={{
                  padding: "0.6rem 0.8rem",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 6,
                  color: "#fca5a5",
                  fontSize: "0.85rem",
                }}
              >
                {newClientError}
              </div>
            )}

            <form onSubmit={handleQuickCreateClient} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                  Nom &amp; Prénom du Contact *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Nadine HOUVI, M. Michel DOSSOU"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="ox-input"
                  style={{ width: "100%", fontSize: "0.88rem" }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                  Entreprise / Société (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Benin Logistics SA, Cabinet Alpha..."
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="ox-input"
                  style={{ width: "100%", fontSize: "0.88rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                    N° IFU Bénin (Fiscal &amp; Immatriculation)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 0201910815523"
                    value={newIfu}
                    onChange={(e) => setNewIfu(e.target.value)}
                    className="ox-input"
                    style={{ width: "100%", fontSize: "0.88rem", borderColor: newIfu ? "var(--ok)" : undefined }}
                  />
                  <span style={{ fontSize: "0.7rem", opacity: 0.65 }}>Requis pour facture &amp; ANaTT</span>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.88rem" }}
                  >
                    <option value="Particulier">Particulier</option>
                    <option value="Entreprise">Entreprise</option>
                    <option value="ONG / Diplomate">ONG / Diplomate</option>
                    <option value="Flotte">Flotte</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="+229 01 97 00 00 00"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="ox-input"
                    style={{ width: "100%", fontSize: "0.88rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                    Adresse E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="client@domaine.bj"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="ox-input"
                    style={{ width: "100%", fontSize: "0.88rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                  Adresse physique (Showroom / Livraison)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Haie Vive, Rue 340, Cotonou"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="ox-input"
                  style={{ width: "100%", fontSize: "0.88rem" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 6,
                  borderTop: "1px solid var(--ice-border)",
                  paddingTop: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="ox-btn ox-btn-ghost"
                  disabled={isCreatingClient}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="ox-btn"
                  disabled={isCreatingClient}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--brand)",
                    color: "#fff",
                  }}
                >
                  {isCreatingClient ? "Création..." : "Enregistrer et Sélectionner"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
