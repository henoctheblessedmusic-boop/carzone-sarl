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
import { usePrefs } from "@/components/PrefsProvider";
import { quotesCopy } from "@/lib/i18n/messages/quotes";
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
  status?: string | null;
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
  const { locale } = usePrefs();
  const copy = quotesCopy[locale];

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
      setNewClientError(copy.creator.newClient.nameRequired);
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
      setNewClientError(err instanceof Error ? err.message : copy.creator.newClient.createFailed);
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
    triggerActionFeedback(copy.creator.feedback.emptyLineAdded, newId);
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
          copy.creator.feedback.quantityIncreased(title || cleanDesc, newQty),
          existing.id
        );
        return updated;
      } else {
        const newId = `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        triggerActionFeedback(
          copy.creator.feedback.articleAdded(title || cleanDesc, quantity, formatXof(unitPriceXof)),
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
    const desc = art.name + (art.description ? ` · ${art.description}` : "");
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
      setError(copy.creator.errors.clientRequired);
      return;
    }

    const validLines = lines.filter((l) => l.description.trim().length > 0 && l.unitPriceXof >= 0);
    if (validLines.length === 0) {
      setError(copy.creator.errors.lineRequired);
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
        const message = err instanceof Error ? err.message : copy.creator.errors.createFailed;
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
        {copy.creator.openButton}
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
                    {copy.creator.title}
                  </h2>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--ice-text-muted)", marginTop: 4 }}>
                  {copy.creator.subtitle}
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
                      {copy.creator.client.label}
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
                      {copy.creator.client.newClient}
                    </button>
                  </div>
                  <select
                    className="ox-select"
                    style={{ width: "100%" }}
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="">{copy.creator.client.selectPlaceholder}</option>
                    {customerList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.contactName} {c.companyName ? `(${c.companyName})` : ""} {c.phone ? `· ${c.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>
                    {copy.creator.client.opportunityLabel}
                  </label>
                  <select
                    className="ox-select"
                    style={{ width: "100%" }}
                    value={opportunityId}
                    onChange={(e) => setOpportunityId(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="">{copy.creator.client.noOpportunity}</option>
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
                      {copy.creator.client.ifuPrefix}{selectedCustomer.ifu}
                    </span>
                  )}
                </div>
              )}

              {/* Ligne 2 : Base fiscale, TVA, Validité */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", opacity: 0.75, marginBottom: 3 }}>
                    {copy.creator.tax.baseLabel}
                  </label>
                  <select
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                    value={taxMode}
                    onChange={(e) => setTaxMode(e.target.value as TaxMode)}
                    disabled={isPending}
                  >
                    <option value="HT">{copy.creator.tax.htOption}</option>
                    <option value="TTC">{copy.creator.tax.ttcOption}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", opacity: 0.75, marginBottom: 3 }}>
                    {copy.creator.tax.vatRateLabel}
                  </label>
                  <select
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                    value={taxRatePct}
                    onChange={(e) => setTaxRatePct(Number(e.target.value))}
                    disabled={isPending}
                  >
                    <option value="18">{copy.creator.tax.vatStandard}</option>
                    <option value="0">{copy.creator.tax.vatExempt}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", opacity: 0.75, marginBottom: 3 }}>
                    {copy.creator.tax.validityLabel}
                  </label>
                  <select
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    disabled={isPending}
                  >
                    <option value="7">{copy.creator.tax.days(7)}</option>
                    <option value="14">{copy.creator.tax.days(14)}</option>
                    <option value="30">{copy.creator.tax.days(30)}</option>
                    <option value="60">{copy.creator.tax.days(60)}</option>
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
                  {copy.creator.quickAdd.title}
                </span>
                <button
                  type="button"
                  onClick={addEmptyLine}
                  className="ox-btn ox-btn-ghost ox-btn-sm"
                  style={{ fontSize: "0.78rem", padding: "0.3rem 0.65rem" }}
                  disabled={isPending}
                >
                  {copy.creator.quickAdd.freeLine}
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
                  <option value="">{copy.creator.quickAdd.articleOption}</option>
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      [{art.category}] {art.name} · {formatXof(art.unitPriceXof)}
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
                  <option value="">{copy.creator.quickAdd.vehicleOption}</option>
                  {vehicles.map((v) => {
                    const statusBadge =
                      v.status === "EN_MAGASIN" || v.status === "EN_STOCK"
                        ? copy.creator.quickAdd.vehicleStatus.showroom
                        : v.status === "AU_PORT"
                        ? copy.creator.quickAdd.vehicleStatus.port
                        : v.status === "EN_TRANSIT"
                        ? copy.creator.quickAdd.vehicleStatus.transit
                        : v.status === "EN_PRODUCTION"
                        ? copy.creator.quickAdd.vehicleStatus.production
                        : v.status === "COMMANDE"
                        ? copy.creator.quickAdd.vehicleStatus.order
                        : "";
                    const badgeText = statusBadge ? ` [${statusBadge}]` : "";
                    const variantText = v.variant ? ` · ${v.variant}` : "";
                    const colorText = v.color ? ` (${v.color})` : "";
                    return (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model}{variantText}{colorText}{badgeText} · {formatXof(v.priceXof)}
                      </option>
                    );
                  })}
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
                        {stagedItem.type === "VEHICLE" ? copy.creator.staged.vehicleBadge : copy.creator.staged.articleBadge}
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
                      <label style={{ fontSize: "0.75rem", opacity: 0.8 }}>{copy.creator.staged.quantityLabel}</label>
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
                          {copy.creator.staged.unitPriceLabel}
                        </label>
                        {stagedItem.unitPriceXof !== stagedItem.catalogPriceXof && (
                          <span style={{ fontSize: "0.7rem", color: "var(--gold)" }}>
                            {copy.creator.staged.catalogBase(formatXof(stagedItem.catalogPriceXof))}
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
                        <div style={{ fontSize: "0.7rem", opacity: 0.65 }}>{copy.creator.staged.lineCalc}</div>
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
                        {copy.creator.staged.insert}
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
                  {copy.creator.lines.header(
                    lines.length,
                    lines.reduce((s, l) => s + (l.quantity || 0), 0)
                  )}
                </span>
                <span style={{ opacity: 0.65, fontSize: "0.75rem" }}>
                  {copy.creator.lines.tip}
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
                      <th style={{ padding: "0.6rem 0.5rem", width: "42%" }}>{copy.creator.lines.colDescription}</th>
                      <th style={{ padding: "0.6rem 0.5rem", width: "16%", textAlign: "center" }}>{copy.creator.lines.colQuantity}</th>
                      <th style={{ padding: "0.6rem 0.5rem", width: "22%", textAlign: "right" }}>{copy.creator.lines.colUnitPrice}</th>
                      <th style={{ padding: "0.6rem 0.5rem", width: "15%", textAlign: "right" }}>{copy.creator.lines.colTotal}</th>
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
                              placeholder={copy.creator.lines.placeholder(idx + 1)}
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
                                title={copy.creator.lines.decrease}
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
                                title={copy.creator.lines.increase}
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
                              title={copy.creator.lines.remove}
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
                    {copy.creator.cgv.title}
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
                      🚗 {copy.creator.cgv.vehicle}
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
                      🔧 {copy.creator.cgv.workshop}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCgvEditor((p) => !p)}
                  className="ox-btn ox-btn-ghost ox-btn-sm"
                  style={{ fontSize: "0.75rem", padding: "0.25rem 0.55rem" }}
                >
                  {showCgvEditor ? copy.creator.cgv.hideText : copy.creator.cgv.editText}
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
                      {copy.creator.cgv.applicable(
                        cgvType === "VEHICULE"
                          ? copy.creator.cgv.kindVehicle
                          : copy.creator.cgv.kindWorkshop
                      )}
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
                        {copy.creator.cgv.reset}
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
                    {copy.creator.discount.title}
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
                    {copy.creator.discount.none}
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
                    {copy.creator.discount.percent}
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
                    {copy.creator.discount.fixed}
                  </button>
                </div>
              </div>

              {discountType === "PERCENT" && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, paddingTop: 4 }}>
                  <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>{copy.creator.discount.tiers}</span>
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
                      {copy.creator.discount.percentOff(pct)}
                    </button>
                  ))}

                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                    <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>{copy.creator.discount.customRate}</label>
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
                    ✨ {copy.creator.discount.granted(formatXof(discountAmount))}
                  </div>
                </div>
              )}

              {discountType === "AMOUNT" && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, paddingTop: 4 }}>
                  <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>{copy.creator.discount.amountLabel}</label>
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
                    ✨ {copy.creator.discount.deducted(formatXof(discountAmount), (grossTotal > 0 ? ((discountAmount / grossTotal) * 100).toFixed(1) : "0"))}
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
                  {copy.creator.totals.notesLabel}
                </label>
                <textarea
                  className="ox-input"
                  style={{ width: "100%", height: 90, fontSize: "0.85rem" }}
                  placeholder={copy.creator.totals.notesPlaceholder}
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
                  <span style={{ opacity: 0.7 }}>{copy.creator.totals.gross}</span>
                  <span style={{ fontWeight: 600 }}>{formatXof(totals.grossHtXof)}</span>
                </div>

                {totals.discountXof > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--gold)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Tag size={13} />
                      {copy.creator.totals.commercialDiscount(
                        discountType === "PERCENT" ? String(discountValue) : null
                      )}
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
                    <span style={{ opacity: 0.7 }}>{copy.creator.totals.netHt}</span>
                    <span style={{ fontWeight: 600 }}>{formatXof(totals.subtotalHtXof)}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ opacity: 0.7 }}>{copy.creator.totals.vat(taxRatePct)}</span>
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
                    {copy.creator.totals.totalTtc(taxMode)}
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
                {copy.common.cancel}
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
                  <span>{copy.creator.submit.creating}</span>
                ) : (
                  <>
                    <Check size={18} />
                    {copy.creator.submit.create}
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
                  {copy.creator.newClient.title}
                </h3>
                <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
                  {copy.creator.newClient.subtitle}
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
                  {copy.creator.newClient.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder={copy.creator.newClient.namePlaceholder}
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="ox-input"
                  style={{ width: "100%", fontSize: "0.88rem" }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                  {copy.creator.newClient.companyLabel}
                </label>
                <input
                  type="text"
                  placeholder={copy.creator.newClient.companyPlaceholder}
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="ox-input"
                  style={{ width: "100%", fontSize: "0.88rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                    {copy.creator.newClient.ifuLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={copy.creator.newClient.ifuPlaceholder}
                    value={newIfu}
                    onChange={(e) => setNewIfu(e.target.value)}
                    className="ox-input"
                    style={{ width: "100%", fontSize: "0.88rem", borderColor: newIfu ? "var(--ok)" : undefined }}
                  />
                  <span style={{ fontSize: "0.7rem", opacity: 0.65 }}>{copy.creator.newClient.ifuHint}</span>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                    {copy.creator.newClient.categoryLabel}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.88rem" }}
                  >
                    <option value="Particulier">{copy.creator.newClient.categories.particulier}</option>
                    <option value="Entreprise">{copy.creator.newClient.categories.entreprise}</option>
                    <option value="ONG / Diplomate">{copy.creator.newClient.categories.ong}</option>
                    <option value="Flotte">{copy.creator.newClient.categories.flotte}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                    {copy.creator.newClient.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    placeholder={copy.creator.newClient.phonePlaceholder}
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="ox-input"
                    style={{ width: "100%", fontSize: "0.88rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                    {copy.creator.newClient.emailLabel}
                  </label>
                  <input
                    type="email"
                    placeholder={copy.creator.newClient.emailPlaceholder}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="ox-input"
                    style={{ width: "100%", fontSize: "0.88rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                  {copy.creator.newClient.addressLabel}
                </label>
                <input
                  type="text"
                  placeholder={copy.creator.newClient.addressPlaceholder}
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
                  {copy.common.cancel}
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
                  {isCreatingClient
                    ? copy.creator.newClient.creating
                    : copy.creator.newClient.submit}
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
