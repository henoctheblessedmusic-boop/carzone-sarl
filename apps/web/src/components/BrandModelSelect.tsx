"use client";

import { useMemo, useState } from "react";

export type CatalogBrand = {
  id: string;
  name: string;
  models: { id: string; name: string; energy: string | null; vehicleType?: string | null }[];
};

export function BrandModelSelect({
  brands,
  brandName = "brand",
  modelName = "model",
  vehicleTypeName = "vehicleType",
  energyFieldId,
  required = true,
  allowFreeText = true,
  defaultBrand = "",
  defaultModel = "",
  filterType,
}: {
  brands: CatalogBrand[];
  brandName?: string;
  modelName?: string;
  vehicleTypeName?: string;
  /** When set, syncs a sibling <select id=...> energy value on model change */
  energyFieldId?: string;
  required?: boolean;
  allowFreeText?: boolean;
  defaultBrand?: string;
  defaultModel?: string;
  /** Optional gamme filter (SUV | PICKUP | BERLINE | VAN) */
  filterType?: string;
}) {
  const [brand, setBrand] = useState(defaultBrand);
  const [model, setModel] = useState(defaultModel);
  const [freeBrand, setFreeBrand] = useState("");
  const [freeModel, setFreeModel] = useState("");
  const [useOverride, setUseOverride] = useState(false);

  const models = useMemo(() => {
    const b = brands.find((x) => x.name === brand);
    const list = b?.models ?? [];
    if (!filterType) return list;
    return list.filter((m) => m.vehicleType === filterType);
  }, [brands, brand, filterType]);

  const selectedModel = models.find((m) => m.name === model);

  return (
    <div className="ox-form-row" style={{ marginBottom: 0 }}>
      <select
        className="ox-select"
        value={useOverride ? "" : brand}
        disabled={useOverride}
        required={required && !useOverride}
        onChange={(e) => {
          setBrand(e.target.value);
          setModel("");
        }}
        title="Choisir la marque au catalogue"
        aria-label="Marque"
      >
        <option value="">Marque *</option>
        {brands.map((b) => (
          <option key={b.id} value={b.name}>
            {b.name}
          </option>
        ))}
      </select>
      <select
        className="ox-select"
        value={useOverride ? "" : model}
        disabled={useOverride || !brand}
        required={required && !useOverride}
        onChange={(e) => {
          const next = e.target.value;
          setModel(next);
          if (energyFieldId) {
            const m = models.find((x) => x.name === next);
            const el = document.getElementById(energyFieldId) as HTMLSelectElement | null;
            if (el && m?.energy) el.value = m.energy;
          }
        }}
        title="Choisir le modèle (dépend de la marque)"
        aria-label="Modèle"
      >
        <option value="">Modèle *</option>
        {models.map((m) => (
          <option key={m.id} value={m.name}>
            {m.name}
            {m.vehicleType ? ` · ${m.vehicleType}` : ""}
            {m.energy ? ` (${m.energy})` : ""}
          </option>
        ))}
      </select>

      {!useOverride ? (
        <>
          <input type="hidden" name={brandName} value={brand} />
          <input type="hidden" name={modelName} value={model} />
          <input type="hidden" name={vehicleTypeName} value={selectedModel?.vehicleType ?? ""} />
        </>
      ) : (
        <>
          <input
            className="ox-input"
            name={brandName}
            placeholder="Marque libre *"
            required={required}
            value={freeBrand}
            onChange={(e) => setFreeBrand(e.target.value)}
            title="Saisie libre hors catalogue"
          />
          <input
            className="ox-input"
            name={modelName}
            placeholder="Modèle libre *"
            required={required}
            value={freeModel}
            onChange={(e) => setFreeModel(e.target.value)}
            title="Saisie libre hors catalogue"
          />
          <input type="hidden" name={vehicleTypeName} value="" />
        </>
      )}

      {allowFreeText ? (
        <label
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", opacity: 0.85 }}
          title="Utile pour véhicules hors catalogue CARZONE"
        >
          <input
            type="checkbox"
            checked={useOverride}
            onChange={(e) => setUseOverride(e.target.checked)}
          />
          Texte libre
        </label>
      ) : null}
    </div>
  );
}
