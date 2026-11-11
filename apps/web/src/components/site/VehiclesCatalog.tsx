"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import type { SiteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import {
  cardImageOf,
  exteriorBaseFilterOptions,
  exteriorOptionsOf,
  resolveInitialConfiguration,
  versionAvailableCount,
  versionHasExteriorBase,
  versionTitle,
  visibleVersions,
  type CatalogSceneMode,
  type CatalogVersion,
} from "@/lib/vehicle-catalog";
import { buildCatalogSearch, type CatalogUrlState } from "@/lib/vehicle-catalog-url";
import { QuoteActions } from "./QuoteActions";

/**
 * La fiche n'est chargée qu'à la première ouverture : sur un Android d'entrée de
 * gamme en 4G, la page de liste ne paie pas le code de la scène ni celui des
 * sélecteurs de configuration.
 */
const VehicleDetailModal = dynamic(
  () => import("./VehicleDetailModal").then((module) => module.VehicleDetailModal),
  { ssr: false },
);

interface VehiclesCatalogProps {
  versions: CatalogVersion[];
  copy: SiteCopy["vehicules"];
  locale: SiteLocale;
  quoteCopy: SiteCopy["quote"];
  /** État lu dans l'adresse côté serveur : un lien partagé ouvre la bonne fiche. */
  initialState: CatalogUrlState;
  pathname: string;
}

/** Fiche ouverte : version, configuration et mode, tels qu'ils figurent dans l'adresse. */
type OpenVehicleState = {
  versionSlug: string;
  configurationCode: string | null;
  mode: CatalogSceneMode | null;
};

const byNewestYear = (a: CatalogVersion, b: CatalogVersion) => (b.year ?? 0) - (a.year ?? 0);

function uniqueSorted(values: Array<string | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort();
}

export function VehiclesCatalog({
  versions,
  copy,
  locale,
  quoteCopy,
  initialState,
  pathname,
}: VehiclesCatalogProps) {
  const published = useMemo(() => visibleVersions(versions), [versions]);

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [energy, setEnergy] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [colorBase, setColorBase] = useState(initialState.exteriorColorBase ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const [openVehicle, setOpenVehicle] = useState<OpenVehicleState | null>(() =>
    initialState.versionSlug
      ? {
          versionSlug: initialState.versionSlug,
          configurationCode: initialState.configurationCode,
          mode: initialState.mode,
        }
      : null,
  );

  const brandOptions = useMemo(() => uniqueSorted(published.map((v) => v.brand)), [published]);
  const energyOptions = useMemo(() => uniqueSorted(published.map((v) => v.energy)), [published]);
  const typeOptions = useMemo(() => uniqueSorted(published.map((v) => v.vehicleType)), [published]);
  const colorOptions = useMemo(() => exteriorBaseFilterOptions(published), [published]);

  const hasActiveFilters = Boolean(search || brand || energy || vehicleType || colorBase);
  const activeFilterCount = [brand, energy, vehicleType, colorBase].filter(Boolean).length;

  const filteredVersions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = published.filter((version) => {
      if (brand && version.brand !== brand) return false;
      if (energy && version.energy !== energy) return false;
      if (vehicleType && version.vehicleType !== vehicleType) return false;
      if (colorBase && !versionHasExteriorBase(version, colorBase)) return false;
      if (query) {
        const haystack = [version.brand, version.model, version.trim]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    return [...filtered].sort(byNewestYear);
  }, [published, search, brand, energy, vehicleType, colorBase]);

  const selectedVersion = openVehicle
    ? published.find((version) => version.slug === openVehicle.versionSlug) ?? null
    : null;

  /**
   * Le filtre de teinte reste dans l'adresse pour qu'un lien partagé rouvre la
   * même sélection. Quand la fiche est ouverte, c'est elle qui tient l'adresse :
   * on ne lui passe pas devant.
   */
  useEffect(() => {
    // Garde sur selectedVersion et non sur openVehicle : un lien portant une
    // version inconnue n'ouvre aucune fiche, et son adresse doit être nettoyée.
    if (typeof window === "undefined" || selectedVersion) return;
    const next = `${pathname}${buildCatalogSearch({ exteriorColorBase: colorBase || null })}`;
    if (`${window.location.pathname}${window.location.search}` === next) return;
    window.history.replaceState(window.history.state, "", next);
  }, [colorBase, selectedVersion, pathname]);

  function resetFilters() {
    setSearch("");
    setBrand("");
    setEnergy("");
    setVehicleType("");
    setColorBase("");
  }

  const resultsLabel =
    filteredVersions.length === 1
      ? copy.resultsCountOne.replace("{count}", "1")
      : copy.resultsCountOther.replace("{count}", String(filteredVersions.length));

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
            <select
              id="vehicle-brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            >
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
            <select
              id="vehicle-energy"
              value={energy}
              onChange={(event) => setEnergy(event.target.value)}
            >
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
            <select
              id="vehicle-type"
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
            >
              <option value="">{copy.filters.allOption}</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {copy.typeLabels[option] ?? option}
                </option>
              ))}
            </select>
          </div>

          <div className="site-filter-field">
            <label htmlFor="vehicle-color">{copy.filters.colorLabel}</label>
            <select
              id="vehicle-color"
              value={colorBase}
              onChange={(event) => setColorBase(event.target.value)}
            >
              <option value="">{copy.filters.allOption}</option>
              {colorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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

      {filteredVersions.length > 0 ? (
        <div className="site-catalog-grid">
          {filteredVersions.map((version) => (
            <CatalogCard
              key={version.slug}
              version={version}
              copy={copy}
              quoteCopy={quoteCopy}
              colorBase={colorBase}
              onOpen={(configurationCode) =>
                setOpenVehicle({ versionSlug: version.slug, configurationCode, mode: null })
              }
            />
          ))}
        </div>
      ) : (
        <div className="site-catalog-empty">
          <p className="site-catalog-empty-title">{copy.emptyTitle}</p>
          <p className="site-empty-message">{copy.emptyMessage}</p>
        </div>
      )}

      {selectedVersion && openVehicle ? (
        <VehicleDetailModal
          version={selectedVersion}
          copy={copy}
          locale={locale}
          quoteCopy={quoteCopy}
          initialConfigurationCode={openVehicle.configurationCode}
          initialMode={openVehicle.mode}
          urlState={{ pathname, exteriorColorBase: colorBase || null }}
          onClose={() => setOpenVehicle(null)}
        />
      ) : null}
    </div>
  );
}

interface CatalogCardProps {
  version: CatalogVersion;
  copy: SiteCopy["vehicules"];
  quoteCopy: SiteCopy["quote"];
  /** Teinte présélectionnée par le filtre : la carte montre cette configuration. */
  colorBase: string;
  onOpen: (configurationCode: string | null) => void;
}

function CatalogCard({ version, copy, quoteCopy, colorBase, onOpen }: CatalogCardProps) {
  const title = versionTitle(version);
  const energyLabel = copy.energyLabels[version.energy] ?? version.energy;
  const configuration = resolveInitialConfiguration(version, {
    exteriorColorBase: colorBase || null,
  });
  const image = cardImageOf(version, configuration);
  const exteriors = exteriorOptionsOf(version);
  const availableCount = versionAvailableCount(version);
  const availableLabel = (
    availableCount === 1 ? copy.card.availableOneTemplate : copy.card.availableTemplate
  ).replace("{count}", String(availableCount));

  const quoteVehicle = {
    id: version.slug,
    brand: version.brand,
    model: version.model,
    variant: version.trim,
    year: version.year,
    energy: version.energy,
    status: version.status,
  };

  return (
    <article className="site-vehicle-card site-catalog-card">
      <button
        type="button"
        className="site-catalog-card-trigger"
        onClick={() => onOpen(configuration?.code ?? null)}
      >
        <div className="site-vehicle-card-media">
          {image ? (
            <>
              <Image
                src={image.url}
                alt={title}
                fill
                sizes="(max-width: 768px) 92vw, (max-width: 1024px) 45vw, 30vw"
                className="site-vehicle-card-img"
                placeholder={image.blurDataUrl ? "blur" : "empty"}
                blurDataURL={image.blurDataUrl ?? undefined}
              />
              {image.origin === "CONSTRUCTEUR" ? (
                <span className="site-card-badge">{copy.card.manufacturerVisualBadge}</span>
              ) : null}
            </>
          ) : (
            <div className="site-vehicle-card-placeholder">
              <span>{copy.card.photosComingSoon}</span>
            </div>
          )}
        </div>
        <div className="site-vehicle-card-body">
          <p className="site-vehicle-card-energy">
            <span>{copy.modal.energyLabel}</span>
            <strong>{energyLabel}</strong>
          </p>
          <h3 className="site-vehicle-card-title">{title}</h3>
          {version.year ? <p className="site-vehicle-card-year">{version.year}</p> : null}
          <p className="site-vehicle-card-year">{availableLabel}</p>
          <span className="site-catalog-card-cta">{copy.card.viewDetails}</span>
        </div>
      </button>

      {exteriors.length > 0 ? (
        <div className="site-card-swatches">
          <p className="site-card-swatches-label">{copy.card.colorsAvailableLabel}</p>
          <div className="site-card-swatches-list">
            {exteriors.map((option) => {
              const label = copy.card.colorSwatchTemplate
                .replace("{color}", option.label)
                .replace("{count}", String(option.availableCount));
              const target =
                version.configurations.find(
                  (item) => item.exteriorColorLabel === option.label,
                ) ?? null;
              return (
                <button
                  key={option.label}
                  type="button"
                  className="site-card-swatch"
                  title={label}
                  aria-label={label}
                  onClick={() => onOpen(target?.code ?? null)}
                >
                  <span
                    className="site-card-swatch-dot"
                    style={{ background: option.hex }}
                    aria-hidden="true"
                  />
                  <span className="site-card-swatch-count" aria-hidden="true">
                    {option.availableCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <QuoteActions
        vehicle={quoteVehicle}
        copy={quoteCopy}
        statusLabels={copy.statusLabels}
        energyLabels={copy.energyLabels}
        variant="card"
      />
    </article>
  );
}
