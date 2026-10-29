"use client";

import { useState, useTransition } from "react";
import { X, Plus, Minus, Trash2, AlertCircle, Check, Tag } from "lucide-react";
import { formatXof } from "@/lib/format";
import { usePrefs } from "@/components/PrefsProvider";
import { quotesCopy } from "@/lib/i18n/messages/quotes";
import { computeTaxTotals, type TaxMode } from "@/lib/billing";
import {
  decodeDiscountFromNotes,
  calculateDiscountAmount,
  formatVehicleDescription,
  type DiscountType,
} from "@/lib/quote-discount";
import { formatLegalAmountNotice } from "@/lib/number-to-words-fr";
import { updateProformaWithLines } from "./actions";
import type { CustomerOption, ArticleOption, VehicleOption } from "./QuoteCreator";
import type { QuoteItem } from "./QuotesView";

type EditLine = {
  id: string;
  description: string;
  quantity: number;
  unitPriceXof: number;
  vehicleId?: string | null;
};

export function QuoteEditorModal({
  quote,
  customers,
  articles,
  vehicles,
  onClose,
}: {
  quote: QuoteItem;
  customers: CustomerOption[];
  articles: ArticleOption[];
  vehicles: VehicleOption[];
  onClose: () => void;
}) {
  const { locale } = usePrefs();
  const copy = quotesCopy[locale];

  const { discount: initialDiscount, cleanNotes: initialCleanNotes } = decodeDiscountFromNotes(quote.notes);
  const [customerId, setCustomerId] = useState(quote.customer?.id || quote.customerId || "");
  const [taxMode, setTaxMode] = useState<TaxMode>((quote.taxMode as TaxMode) || "HT");
  const [taxRatePct, setTaxRatePct] = useState<number>(quote.taxRatePct || 18);
  const [notes, setNotes] = useState(initialCleanNotes || "");
  const [validDays, setValidDays] = useState(14);
  const [discountType, setDiscountType] = useState<DiscountType>(initialDiscount.type);
  const [discountValue, setDiscountValue] = useState<number>(initialDiscount.value);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [highlightedLineId, setHighlightedLineId] = useState<string | null>(null);

  const [lines, setLines] = useState<EditLine[]>(
    quote.lines.map((l, idx) => ({
      id: l.id || `line-${idx}`,
      description: l.description,
      quantity: l.quantity,
      unitPriceXof: l.unitPriceXof,
      vehicleId: l.vehicleId || null,
    }))
  );

  const grossTotal = lines.reduce((s, l) => s + (l.quantity || 1) * (l.unitPriceXof || 0), 0);
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

  const addEmptyLine = () => {
    const newId = `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setLines((prev) => [
      ...prev,
      {
        id: newId,
        description: "",
        quantity: 1,
        unitPriceXof: 0,
      },
    ]);
    triggerActionFeedback(copy.creator.feedback.emptyLineAdded, newId);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 1) {
      alert(copy.editor.errors.minLines);
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLineField = (id: string, field: keyof EditLine, val: unknown) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: val } : l))
    );
  };

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
      const existingIndex = prev.findIndex((l) => {
        if (vehicleId && l.vehicleId === vehicleId) return true;
        return l.description.trim().toLowerCase() === cleanDesc.toLowerCase();
      });

      if (existingIndex >= 0) {
        // Incrémente la quantité au lieu de dupliquer la ligne !
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = (existing.quantity || 0) + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          unitPriceXof: unitPriceXof !== undefined ? unitPriceXof : existing.unitPriceXof,
        };
        triggerActionFeedback(
          copy.editor.feedback.quantityIncreased(title || cleanDesc, newQty),
          existing.id
        );
        return updated;
      } else {
        const newId = `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        triggerActionFeedback(
          copy.editor.feedback.articleAdded(title || cleanDesc, quantity, formatXof(unitPriceXof)),
          newId
        );
        return [
          ...prev,
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

  const handleSelectArticle = (articleId: string) => {
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
  };

  const handleSelectVehicle = (vehicleId: string) => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError(copy.editor.errors.clientRequired);
      return;
    }
    if (lines.some((l) => !l.description.trim())) {
      setError(copy.editor.errors.designationRequired);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateProformaWithLines({
          quoteId: quote.id,
          customerId,
          taxMode,
          taxRatePct,
          validDays,
          notes: notes.trim() || null,
          discountType,
          discountValue,
          lines: lines.map((l) => ({
            description: l.description.trim(),
            quantity: Number(l.quantity) || 1,
            unitPriceXof: Number(l.unitPriceXof) || 0,
            vehicleId: l.vehicleId || null,
          })),
        });
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : copy.editor.errors.updateFailed);
      }
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          maxHeight: "92vh",
          overflowY: "auto",
          overflowX: "hidden",
          boxSizing: "border-box",
          background: "#161a20",
          border: "1px solid rgba(212, 175, 55, 0.45)",
          borderRadius: 16,
          padding: "20px 24px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--ice-text)" }}>
              {copy.editor.title(quote.number)}
            </h3>
            <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>
              {copy.editor.subtitle(copy.statuses[quote.status] || quote.status)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--ice-text)", opacity: 0.6, cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#f87171",
              fontSize: "0.82rem",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Client & Taxe */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
            <div>
              <label style={labelStyle}>{copy.editor.clientLabel}</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="ox-select"
                style={{ width: "100%" }}
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contactName} {c.companyName ? `(${c.companyName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>{copy.editor.taxModeLabel}</label>
              <select
                value={taxMode}
                onChange={(e) => setTaxMode(e.target.value as TaxMode)}
                className="ox-select"
                style={{ width: "100%" }}
              >
                <option value="HT">{copy.editor.taxHtOption}</option>
                <option value="TTC">{copy.editor.taxTtcOption}</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>{copy.editor.vatRateLabel}</label>
              <select
                value={taxRatePct}
                onChange={(e) => setTaxRatePct(Number(e.target.value))}
                className="ox-select"
                style={{ width: "100%" }}
              >
                <option value={18}>{copy.editor.vatNormal}</option>
                <option value={0}>{copy.editor.vatExempt}</option>
              </select>
            </div>
          </div>

          {/* Sélecteurs rapides pour insérer véhicule ou article */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(212, 175, 55, 0.05)",
              border: "1px dashed rgba(212, 175, 55, 0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--gold, #d4af37)" }}>
                {copy.editor.pickStock}
              </span>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectVehicle(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="ox-select"
                style={{ fontSize: "0.78rem", flex: 1, minWidth: 200 }}
              >
                <option value="">{copy.editor.vehicleOption}</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({formatXof(v.priceXof)})
                  </option>
                ))}
              </select>

              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectArticle(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="ox-select"
                style={{ fontSize: "0.78rem", flex: 1, minWidth: 200 }}
              >
                <option value="">{copy.editor.articleOption}</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.category}] {a.name} ({formatXof(a.unitPriceXof)})
                  </option>
                ))}
              </select>
            </div>

            {/* Panneau de Personnalisation Immédiate */}
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
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        background: "var(--gold)",
                        color: "#000",
                        fontWeight: 750,
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {stagedItem.type === "VEHICLE" ? copy.editor.staged.vehicleBadge : copy.editor.staged.articleBadge}
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

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                  {/* Stepper Quantité */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: "0.72rem", opacity: 0.8 }}>{copy.editor.staged.quantityLabel}</label>
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
                          padding: "5px 8px",
                          cursor: "pointer",
                        }}
                      >
                        <Minus size={13} />
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
                        style={{ width: 44, textAlign: "center", border: "none", background: "transparent", fontWeight: 700 }}
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
                          padding: "5px 8px",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Prix Unitaire Modifiable */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 180 }}>
                    <label style={{ fontSize: "0.72rem", opacity: 0.8 }}>{copy.editor.staged.unitPriceLabel}</label>
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
                        style={{ width: "100%", paddingRight: 50, fontWeight: 700, fontSize: "0.85rem" }}
                      />
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", opacity: 0.6 }}>
                        FCFA
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginLeft: "auto" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.68rem", opacity: 0.65 }}>{copy.editor.staged.lineCalc}</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--gold)" }}>
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
                        padding: "0.5rem 1rem",
                        fontSize: "0.8rem",
                      }}
                    >
                      <Plus size={14} />
                      {copy.editor.staged.insert}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toast / Message de confirmation d'action */}
          {feedbackMessage && (
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                borderRadius: 8,
                color: "#6ee7b7",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={14} />
                <span>{feedbackMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                style={{ background: "none", border: "none", color: "#6ee7b7", cursor: "pointer" }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Tableau des lignes */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={labelStyle}>
                {copy.editor.lines.header(
                  lines.length,
                  lines.reduce((s, l) => s + (l.quantity || 0), 0)
                )}
              </label>
              <button
                type="button"
                onClick={addEmptyLine}
                className="ox-btn ox-btn-sm"
                style={{ fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <Plus size={13} />
                {copy.editor.lines.add}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lines.map((l) => {
                const isHighlighted = l.id === highlightedLineId;
                return (
                  <div
                    key={l.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 105px 150px 120px 38px",
                      gap: 8,
                      alignItems: "center",
                      background: isHighlighted ? "rgba(212, 175, 55, 0.15)" : "rgba(255, 255, 255, 0.03)",
                      border: isHighlighted ? "1px solid var(--gold)" : "1px solid rgba(255, 255, 255, 0.07)",
                      borderRadius: 8,
                      padding: "6px 10px",
                      transition: "background 0.3s ease, border 0.3s ease",
                    }}
                  >
                    <input
                      value={l.description}
                      placeholder={copy.editor.lines.placeholder}
                      required
                      onChange={(e) => updateLineField(l.id, "description", e.target.value)}
                      className="ox-input"
                      style={{ fontSize: "0.82rem" }}
                    />

                    {/* Stepper Quantité */}
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
                          updateLineField(l.id, "quantity", Math.max(1, (l.quantity || 1) - 1))
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--ice-text)",
                          padding: "4px 6px",
                          cursor: "pointer",
                        }}
                      >
                        <Minus size={11} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={l.quantity}
                        onChange={(e) =>
                          updateLineField(l.id, "quantity", Math.max(1, Number(e.target.value) || 1))
                        }
                        className="ox-input"
                        style={{
                          width: "36px",
                          fontSize: "0.82rem",
                          textAlign: "center",
                          border: "none",
                          background: "transparent",
                          fontWeight: 700,
                          padding: "3px 0",
                        }}
                        title={copy.editor.lines.quantityTitle}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateLineField(l.id, "quantity", (l.quantity || 0) + 1)
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--ice-text)",
                          padding: "4px 6px",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={l.unitPriceXof}
                        onChange={(e) =>
                          updateLineField(l.id, "unitPriceXof", Number(e.target.value) || 0)
                        }
                        className="ox-input"
                        style={{ width: "100%", fontSize: "0.82rem", textAlign: "right", paddingRight: 45 }}
                        title={copy.editor.lines.unitPriceTitle}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "0.68rem",
                          opacity: 0.55,
                          pointerEvents: "none",
                        }}
                      >
                        FCFA
                      </span>
                    </div>

                    <div style={{ textAlign: "right", fontSize: "0.82rem", fontWeight: 700, color: "var(--ice-text)" }}>
                      {formatXof((l.quantity || 1) * (l.unitPriceXof || 0))}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLine(l.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title={copy.editor.lines.removeTitle}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stratégie Commerciale / Remise Accordée */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(0, 120, 212, 0.05))",
              border: "1px solid rgba(212, 175, 55, 0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Tag size={15} color="var(--gold)" />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--gold)" }}>
                  {copy.editor.discount.title}
                </span>
              </div>

              {/* Toggle type remise */}
              <div
                style={{
                  display: "flex",
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
                    padding: "3px 8px",
                    fontSize: "0.74rem",
                    fontWeight: 650,
                    border: "none",
                    cursor: "pointer",
                    background: discountType === "NONE" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.25)",
                    color: discountType === "NONE" ? "#fff" : "var(--ice-text-muted)",
                  }}
                >
                  {copy.editor.discount.none}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountType("PERCENT");
                    if (!discountValue || discountValue > 100) setDiscountValue(5);
                  }}
                  style={{
                    padding: "3px 8px",
                    fontSize: "0.74rem",
                    fontWeight: 650,
                    border: "none",
                    cursor: "pointer",
                    background: discountType === "PERCENT" ? "var(--brand)" : "rgba(0,0,0,0.25)",
                    color: discountType === "PERCENT" ? "#fff" : "var(--ice-text-muted)",
                  }}
                >
                  {copy.editor.discount.percent}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountType("AMOUNT");
                    if (!discountValue || discountValue <= 100) setDiscountValue(500000);
                  }}
                  style={{
                    padding: "3px 8px",
                    fontSize: "0.74rem",
                    fontWeight: 650,
                    border: "none",
                    cursor: "pointer",
                    background: discountType === "AMOUNT" ? "var(--gold)" : "rgba(0,0,0,0.25)",
                    color: discountType === "AMOUNT" ? "#0a1622" : "var(--ice-text-muted)",
                  }}
                >
                  {copy.editor.discount.fixed}
                </button>
              </div>
            </div>

            {discountType === "PERCENT" && (
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, paddingTop: 2 }}>
                {[2, 5, 7, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountValue(pct)}
                    style={{
                      padding: "2px 7px",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      borderRadius: 5,
                      border: discountValue === pct ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.1)",
                      background: discountValue === pct ? "rgba(212, 175, 55, 0.25)" : "rgba(255,255,255,0.04)",
                      color: discountValue === pct ? "var(--gold)" : "var(--ice-text)",
                      cursor: "pointer",
                    }}
                  >
                    -{pct}%
                  </button>
                ))}

                <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="ox-input"
                    style={{ width: 65, fontSize: "0.78rem", textAlign: "right", fontWeight: 700 }}
                  />
                  <span style={{ fontSize: "0.74rem", opacity: 0.7 }}>%</span>
                </div>

                <div style={{ width: "100%", fontSize: "0.76rem", color: "var(--gold)", fontWeight: 650 }}>
                  ✨ {copy.editor.discount.granted(formatXof(discountAmount))}
                </div>
              </div>
            )}

            {discountType === "AMOUNT" && (
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, paddingTop: 2 }}>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={discountValue || ""}
                  onChange={(e) => setDiscountValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="ox-input"
                  style={{ width: 180, fontSize: "0.82rem", textAlign: "right", fontWeight: 700 }}
                />
                <span style={{ fontSize: "0.74rem", opacity: 0.7 }}>FCFA</span>
                <div style={{ fontSize: "0.76rem", color: "var(--gold)", fontWeight: 650, marginLeft: "auto" }}>
                  ✨ {copy.editor.discount.deduction(formatXof(discountAmount))}
                </div>
              </div>
            )}
          </div>

          {/* Synthèse des Totaux */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.04))",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: "0.78rem", opacity: 0.75 }}>
                {copy.editor.totals.gross} : <strong>{formatXof(totals.grossHtXof)}</strong>
              </div>
              {totals.discountXof > 0 && (
                <div style={{ fontSize: "0.78rem", color: "var(--gold)", marginTop: 2 }}>
                  {copy.editor.totals.commercialDiscount} : <strong>-{formatXof(totals.discountXof)}</strong>
                </div>
              )}
              {totals.discountXof > 0 && (
                <div style={{ fontSize: "0.78rem", opacity: 0.85, marginTop: 2 }}>
                  {copy.editor.totals.netHt} : <strong>{formatXof(totals.subtotalHtXof)}</strong>
                </div>
              )}
              <div style={{ fontSize: "0.78rem", opacity: 0.75, marginTop: 2 }}>
                {copy.editor.totals.vat(taxRatePct)} : <strong>{formatXof(totals.taxXof)}</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", color: "var(--gold, #d4af37)" }}>
                {copy.editor.totals.totalTtc(taxMode)}
              </div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--gold, #d4af37)" }}>
                {formatXof(totals.totalXof)}
              </div>
            </div>

            <div
              style={{
                width: "100%",
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

          {/* Notes et validité */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12 }}>
            <div>
              <label style={labelStyle}>{copy.editor.notesLabel}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={copy.editor.notesPlaceholder}
                className="ox-input"
                style={{ width: "100%", height: 50, resize: "vertical" }}
              />
            </div>
            <div>
              <label style={labelStyle}>{copy.editor.validityLabel}</label>
              <input
                type="number"
                min="1"
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value) || 14)}
                className="ox-input"
                style={{ width: "100%", height: 50 }}
              />
            </div>
          </div>

          {/* Actions modal */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "transparent",
                color: "var(--ice-text)",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {copy.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: "9px 24px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                color: "#000",
                fontSize: "0.85rem",
                fontWeight: 750,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Check size={16} />
              <span>{isPending ? copy.editor.submit.saving : copy.editor.submit.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.76rem",
  fontWeight: 650,
  opacity: 0.8,
  marginBottom: 4,
};
