"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import type { SiteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { VehicleDetailModal, type CatalogVehicle } from "./VehicleDetailModal";
import { QuoteActions } from "./QuoteActions";

interface VehiclesCatalogProps {
  vehicles: CatalogVehicle[];
  copy: SiteCopy["vehicules"];
  locale: SiteLocale;
  quoteCopy: SiteCopy["quote"];
}

const byNewestYear = (a: CatalogVehicle, b: CatalogVehicle) => (b.year ?? 0) - (a.year ?? 0);

function uniqueSorted(values: Array<string | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort();
}

export function VehiclesCatalog({ vehicles, copy, locale, quoteCopy }: VehiclesCatalogProps) {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [energy, setEnergy] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const [selectedVehicle, setSelectedVehicle] = useState<CatalogVehicle | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const brandOptions = useMemo(() => uniqueSorted(vehicles.map((v) => v.brand)), [vehicles]);
  const energyOptions = useMemo(() => uniqueSorted(vehicles.map((v) => v.energy)), [vehicles]);
  const typeOptions = useMemo(() => uniqueSorted(vehicles.map((v) => v.vehicleType)), [vehicles]);

  const hasActiveFilters = Boolean(search || brand || energy || vehicleType);
  const activeFilterCount = [brand, energy, vehicleType].filter(Boolean).length;

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = vehicles.filter((vehicle) => {
      if (brand && vehicle.brand !== brand) return false;
      if (energy && vehicle.energy !== energy) return false;
      if (vehicleType && vehicle.vehicleType !== vehicleType) return false;
      if (query) {
        const haystack = [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    return [...filtered].sort(byNewestYear);
  }, [vehicles, search, brand, energy, vehicleType]);

  function resetFilters() {
    setSearch("");
    setBrand("");
    setEnergy("");
    setVehicleType("");
  }

  const resultsLabel =
    filteredVehicles.length === 1
      ? copy.resultsCountOne.replace("{count}", "1")
      : copy.resultsCountOther.replace("{count}", String(filteredVehicles.length));

  return (
    <div className="site-catalog">
      <form className="site-filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="site-filter-field site-filter-field--search">
          <label htmlFor="vehicle-search">{copy.filters.searchLabel}</label>
          <div className="site-filter-search-input">
            <Search aria-hidden="true" size={18} />
            <input
              id="vehicle-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.filters.searchPlaceholder}
            />
          </div>
        </div>

        <button
          type="button"
          className="site-filters-toggle"
          aria-expanded={showFilters}
          aria-controls="vehicle-advanced-filters"
          onClick={() => setShowFilters((open) => !open)}
        >
          <SlidersHorizontal aria-hidden="true" size={16} />
          {activeFilterCount > 0
            ? copy.filters.toggleActiveLabel.replace("{count}", String(activeFilterCount))
            : copy.filters.toggleLabel}
        </button>

        <div
          id="vehicle-advanced-filters"
          className={showFilters ? "site-filters-fields is-open" : "site-filters-fields"}
        >
        <div className="site-filter-field">
          <label htmlFor="vehicle-brand">{copy.filters.brandLabel}</label>
          <select id="vehicle-brand" value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option value="">{copy.filters.allOption}</option>
            {brandOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="site-filter-field">
          <label htmlFor="vehicle-energy">{copy.filters.energyLabel}</label>
          <select id="vehicle-energy" value={energy} onChange={(event) => setEnergy(event.target.value)}>
            <option value="">{copy.filters.allOption}</option>
            {energyOptions.map((option) => (
              <option key={option} value={option}>
                {copy.energyLabels[option] ?? option}
              </option>
            ))}
          </select>
        </div>

        <div className="site-filter-field">
          <label htmlFor="vehicle-type">{copy.filters.typeLabel}</label>
          <select id="vehicle-type" value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}>
            <option value="">{copy.filters.allOption}</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {copy.typeLabels[option] ?? option}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="site-cta site-cta--ghost site-filters-reset"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
        >
          {copy.filters.resetLabel}
        </button>
        </div>
      </form>

      <p className="site-results-count" aria-live="polite">
        {resultsLabel}
      </p>

      {filteredVehicles.length > 0 ? (
        <div className="site-catalog-grid">
          {filteredVehicles.map((vehicle) => (
            <CatalogCard
              key={vehicle.id}
              vehicle={vehicle}
              copy={copy}
              locale={locale}
              quoteCopy={quoteCopy}
              onOpen={() => setSelectedVehicle(vehicle)}
            />
          ))}
        </div>
      ) : (
        <div className="site-catalog-empty">
          <p className="site-catalog-empty-title">{copy.emptyTitle}</p>
          <p className="site-empty-message">{copy.emptyMessage}</p>
        </div>
      )}

      {selectedVehicle ? (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          copy={copy}
          locale={locale}
          quoteCopy={quoteCopy}
          onClose={() => setSelectedVehicle(null)}
        />
      ) : null}
    </div>
  );
}

interface CatalogCardProps {
  vehicle: CatalogVehicle;
  copy: SiteCopy["vehicules"];
  locale: SiteLocale;
  quoteCopy: SiteCopy["quote"];
  onOpen: () => void;
}

function CatalogCard({ vehicle, copy, locale, quoteCopy, onOpen }: CatalogCardProps) {
  const title = [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
  const energyLabel = copy.energyLabels[vehicle.energy] ?? vehicle.energy;

  return (
    <article className="site-vehicle-card site-catalog-card">
      <button type="button" className="site-catalog-card-trigger" onClick={onOpen}>
        <div className="site-vehicle-card-media">
          {vehicle.mainPhotoUrl ? (
            <Image
              src={vehicle.mainPhotoUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 92vw, (max-width: 1024px) 45vw, 30vw"
              className="site-vehicle-card-img"
            />
          ) : (
            <div className="site-vehicle-card-placeholder" aria-hidden="true" />
          )}
        </div>
        <div className="site-vehicle-card-body">
          <p className="site-vehicle-card-energy">{energyLabel}</p>
          <h3 className="site-vehicle-card-title">{title}</h3>
          {vehicle.year ? <p className="site-vehicle-card-year">{vehicle.year}</p> : null}
          <span className="site-catalog-card-cta">{copy.card.viewDetails}</span>
        </div>
      </button>
      <QuoteActions
        vehicle={vehicle}
        copy={quoteCopy}
        statusLabels={copy.statusLabels}
        energyLabels={copy.energyLabels}
        variant="card"
      />
    </article>
  );
}
