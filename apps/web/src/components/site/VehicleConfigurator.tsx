"use client";

import { Check } from "lucide-react";
import type { SiteCopy } from "@/lib/i18n/site/types";
import {
  exteriorOptionsOf,
  interiorOptionsFor,
  versionAvailableCount,
  type CatalogConfiguration,
  type CatalogVersion,
} from "@/lib/vehicle-catalog";

type VehicleCopy = SiteCopy["vehicules"];

interface VehicleConfiguratorProps {
  version: CatalogVersion;
  configuration: CatalogConfiguration;
  copy: VehicleCopy;
  /** Changement de teinte : l'intérieur courant est conservé si la teinte le propose. */
  onSelectExterior: (exteriorColorLabel: string) => void;
  /** Changement d'intérieur : la configuration visée est déjà connue. */
  onSelectConfiguration: (code: string) => void;
}

/** "2 disponibles en Gris crème, intérieur Terracotta", ou "Sur commande". */
function availabilityText(configuration: CatalogConfiguration, copy: VehicleCopy): string {
  if (configuration.availableCount === 0) return copy.modal.availabilityNone;
  const template =
    configuration.availableCount === 1
      ? copy.modal.availabilityOneTemplate
      : copy.modal.availabilityTemplate;
  return template
    .replace("{count}", String(configuration.availableCount))
    .replace("{exterior}", configuration.exteriorColorLabel)
    .replace("{interior}", configuration.interiorColorLabel);
}

function versionTotalText(version: CatalogVersion, copy: VehicleCopy): string {
  const total = versionAvailableCount(version);
  const template =
    total === 1 ? copy.modal.versionTotalOneTemplate : copy.modal.versionTotalTemplate;
  return template.replace("{count}", String(total));
}

export function VehicleConfigurator({
  version,
  configuration,
  copy,
  onSelectExterior,
  onSelectConfiguration,
}: VehicleConfiguratorProps) {
  const exteriors = exteriorOptionsOf(version);
  const interiors = interiorOptionsFor(version, configuration.exteriorColorLabel);
  const hasInteriorChoice = interiors.length > 1;

  return (
    <section className="site-configurator" aria-label={copy.modal.configuratorTitle}>
      <h3 className="site-configurator-title">{copy.modal.configuratorTitle}</h3>

      <div className="site-configurator-group">
        <p className="site-configurator-label" id="vehicle-exterior-label">
          {copy.modal.exteriorTitle}
        </p>
        <div className="site-swatches" role="group" aria-labelledby="vehicle-exterior-label">
          {exteriors.map((option) => {
            const isActive = option.label === configuration.exteriorColorLabel;
            return (
              <button
                key={option.label}
                type="button"
                className={isActive ? "site-swatch is-active" : "site-swatch"}
                aria-pressed={isActive}
                aria-label={copy.modal.exteriorSwatchTemplate
                  .replace("{color}", option.label)
                  .replace("{count}", String(option.availableCount))}
                onClick={() => onSelectExterior(option.label)}
              >
                <span
                  className="site-swatch-dot"
                  style={{ background: option.hex }}
                  aria-hidden="true"
                >
                  {isActive ? <Check aria-hidden="true" size={12} /> : null}
                </span>
                <span className="site-swatch-text">
                  <span className="site-swatch-name">{option.label}</span>
                  <span className="site-swatch-count">{option.availableCount}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="site-configurator-group">
        <p className="site-configurator-label" id="vehicle-interior-label">
          {copy.modal.interiorTitle}
        </p>
        {hasInteriorChoice ? (
          <div className="site-swatches" role="group" aria-labelledby="vehicle-interior-label">
            {interiors.map((option) => {
              const isActive = option.code === configuration.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  className={isActive ? "site-swatch is-active" : "site-swatch"}
                  aria-pressed={isActive}
                  aria-label={copy.modal.interiorSwatchTemplate
                    .replace("{color}", option.label)
                    .replace("{count}", String(option.availableCount))}
                  onClick={() => onSelectConfiguration(option.code)}
                >
                  <span
                    className="site-swatch-dot"
                    style={{ background: option.hex }}
                    aria-hidden="true"
                  >
                    {isActive ? <Check aria-hidden="true" size={12} /> : null}
                  </span>
                  <span className="site-swatch-text">
                    <span className="site-swatch-name">{option.label}</span>
                    <span className="site-swatch-count">{option.availableCount}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="site-configurator-single">
            <span
              className="site-swatch-dot"
              style={{ background: configuration.interiorHex }}
              aria-hidden="true"
            />
            {configuration.interiorColorLabel}
            <span className="site-configurator-note">{copy.modal.interiorSingleNote}</span>
          </p>
        )}
      </div>

      <p className="site-configurator-availability" aria-live="polite">
        <strong>{availabilityText(configuration, copy)}</strong>
        <span>{versionTotalText(version, copy)}</span>
      </p>
    </section>
  );
}
