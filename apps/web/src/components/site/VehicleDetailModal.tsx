"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link2, X } from "lucide-react";
import { track } from "@vercel/analytics";
import type { SiteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { parseConfigurationCode } from "@/lib/vehicle-configuration";
import {
  clampSceneMode,
  configurationForExterior,
  findConfigurationByCode,
  preserveSceneKey,
  resolveInitialConfiguration,
  versionTitle,
  type CatalogConfiguration,
  type CatalogSceneMode,
  type CatalogVersion,
  type LegacyCatalogVehicle,
} from "@/lib/vehicle-catalog";
import { buildCatalogHref, type CatalogUrlState } from "@/lib/vehicle-catalog-url";
import { formatSiteNumber } from "./vehicle-format";
import { QuoteActions } from "./QuoteActions";
import { VehicleConfigurator } from "./VehicleConfigurator";
import { VehicleScene } from "./VehicleScene";

/**
 * Forme héritée encore attendue par l'accueil et le diaporama. Les deux
 * convertissent leur véhicule en version à une configuration avec
 * catalogVersionFromVehicle() avant d'ouvrir cette fiche.
 */
export type CatalogVehicle = LegacyCatalogVehicle;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])';

/** Marqueur de l'entrée d'historique ajoutée à l'ouverture, pour le geste retour. */
const MODAL_HISTORY_MARKER = "carzoneVehicleModal";

/** Délai d'affichage de la confirmation de copie du lien. */
const COPY_FEEDBACK_MS = 2500;

/** Partie de l'adresse que la vitrine doit conserver quand la fiche s'ouvre. */
export type VehicleModalUrlState = {
  pathname: string;
  exteriorColorBase: string | null;
};

interface VehicleDetailModalProps {
  version: CatalogVersion;
  copy: SiteCopy["vehicules"];
  locale: SiteLocale;
  quoteCopy: SiteCopy["quote"];
  onClose: () => void;
  /** Configuration à ouvrir, lue dans l'adresse ou choisie depuis une pastille. */
  initialConfigurationCode?: string | null;
  initialMode?: CatalogSceneMode | null;
  /**
   * Quand elle est fournie, l'état de la fiche est porté par l'adresse et le
   * geste retour du téléphone la referme. L'accueil n'en a pas besoin.
   */
  urlState?: VehicleModalUrlState | null;
}

export function VehicleDetailModal({
  version,
  copy,
  locale,
  quoteCopy,
  onClose,
  initialConfigurationCode = null,
  initialMode = null,
  urlState = null,
}: VehicleDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const pushedHistoryEntry = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const initialConfiguration = resolveInitialConfiguration(version, {
    code: initialConfigurationCode,
    exteriorColorBase: urlState?.exteriorColorBase ?? null,
  });

  const [configurationCode, setConfigurationCode] = useState(initialConfiguration?.code ?? "");
  const [mode, setMode] = useState<CatalogSceneMode>(() =>
    clampSceneMode(initialMode, initialConfiguration),
  );
  const [sceneKey, setSceneKey] = useState<string | null>(() =>
    preserveSceneKey(null, initialConfiguration),
  );

  const configuration: CatalogConfiguration | null =
    findConfigurationByCode(version, configurationCode) ?? initialConfiguration;
  const title = versionTitle(version);

  const href = urlState
    ? buildCatalogHref(urlState.pathname, {
        exteriorColorBase: urlState.exteriorColorBase,
        versionSlug: version.slug,
        configurationCode: configuration?.code ?? null,
        mode,
      } satisfies Partial<CatalogUrlState>)
    : null;

  /** Teinte, intérieur et code de configuration, déjà traduits, pour la cotation. */
  const configurationSummary = configuration
    ? `${configuration.exteriorColorLabel}, ${copy.modal.interiorLabel.toLowerCase()} ${
        configuration.interiorColorLabel
      }${parseConfigurationCode(configuration.code) ? ` (${configuration.code})` : ""}`
    : null;

  const quoteVehicle = {
    id: version.slug,
    brand: version.brand,
    model: version.model,
    variant: version.trim,
    year: version.year,
    energy: version.energy,
    status: version.status,
    configurationSummary,
  };

  const selectConfiguration = useCallback(
    (next: CatalogConfiguration | null, event: "color_change" | "interior_change") => {
      if (!next || next.code === configurationCode) return;
      setConfigurationCode(next.code);
      // L'angle est conservé : on ne repart de la premiere vue que si la
      // nouvelle configuration ne possede pas la vue courante.
      setSceneKey((previous) => preserveSceneKey(previous, next));
      setMode((previous) => clampSceneMode(previous, next));
      track(event, { version: version.slug, configuration: next.code });
    },
    [configurationCode, version.slug],
  );

  function selectExterior(exteriorColorLabel: string) {
    selectConfiguration(
      configurationForExterior(version, exteriorColorLabel, configuration?.interiorColorLabel),
      "color_change",
    );
  }

  function selectConfigurationCode(code: string) {
    selectConfiguration(findConfigurationByCode(version, code), "interior_change");
  }

  function selectMode(next: CatalogSceneMode) {
    if (next === mode) return;
    setMode(next);
    const payload = { version: version.slug, configuration: configurationCode };
    if (next === "spin") track("spin_interact", payload);
    if (next === "interior") track("interior_open", payload);
  }

  async function copyLink() {
    if (!href || typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(new URL(href, window.location.origin).toString());
      setLinkCopied(true);
    } catch {
      // Presse-papiers refusé (contexte non sécurisé, permission) : l'adresse de
      // la barre porte déjà le même état, le client peut la copier à la main.
      setLinkCopied(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!linkCopied) return;
    const timer = window.setTimeout(() => setLinkCopied(false), COPY_FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [linkCopied]);

  useEffect(() => {
    track("vehicle_open", {
      version: version.slug,
      configuration: initialConfiguration?.code ?? "",
    });
    // Un seul évènement par ouverture : les changements de configuration ont
    // leurs propres évènements.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const dialogNode = dialogRef.current;
    dialogNode?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogNode) return;

      const focusable = dialogNode.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  /**
   * L'adresse porte l'état de la fiche. L'ouverture ajoute une entrée
   * d'historique, ce qui fait du geste retour du téléphone une fermeture, et la
   * fermeture par bouton ou par Échap retire cette entrée.
   */
  useEffect(() => {
    if (!href) return;
    if (!pushedHistoryEntry.current) {
      window.history.pushState({ [MODAL_HISTORY_MARKER]: true }, "", href);
      pushedHistoryEntry.current = true;
      return;
    }
    window.history.replaceState({ [MODAL_HISTORY_MARKER]: true }, "", href);
  }, [href]);

  useEffect(() => {
    if (!urlState) return;

    function handlePopState() {
      pushedHistoryEntry.current = false;
      onClose();
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (pushedHistoryEntry.current) {
        pushedHistoryEntry.current = false;
        window.history.back();
      }
    };
  }, [urlState, onClose]);

  if (!mounted || !configuration) return null;

  const energyLabel = copy.energyLabels[version.energy] ?? version.energy;
  const typeLabel = version.vehicleType
    ? copy.typeLabels[version.vehicleType] ?? version.vehicleType
    : null;
  const showConfigurationCode = parseConfigurationCode(configuration.code) !== null;

  // Portail vers document.body : le modal reste fixe et centré même s'il est déclenché
  // depuis une carte avec transform/overflow, ce qui évite le rendu déformé dans la carte.
  // Le conteneur .site-shell réapplique les variables de thème du site au modal.
  return createPortal(
    <div className="site-shell site-modal-shell">
      <div className="site-modal-backdrop" onMouseDown={onClose}>
        <div
          className="site-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vehicle-modal-title"
          ref={dialogRef}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button type="button" className="site-modal-close" onClick={onClose}>
            <span className="site-sr-only">{copy.modal.closeLabel}</span>
            <X aria-hidden="true" size={20} />
          </button>

          <div className="site-modal-gallery">
            <VehicleScene
              version={version}
              configuration={configuration}
              mode={mode}
              sceneKey={sceneKey}
              title={title}
              copy={copy}
              onModeChange={selectMode}
              onSceneKeyChange={setSceneKey}
            />
          </div>

          <div className="site-modal-body">
            <h2 id="vehicle-modal-title" className="site-modal-title">
              {title}
            </h2>

            <VehicleConfigurator
              version={version}
              configuration={configuration}
              copy={copy}
              onSelectExterior={selectExterior}
              onSelectConfiguration={selectConfigurationCode}
            />

            <dl className="site-modal-specs">
              <div>
                <dt>{copy.modal.brandLabel}</dt>
                <dd>{version.brand}</dd>
              </div>
              <div>
                <dt>{copy.modal.modelLabel}</dt>
                <dd>{version.model}</dd>
              </div>
              {version.trim ? (
                <div>
                  <dt>{copy.modal.variantLabel}</dt>
                  <dd>{version.trim}</dd>
                </div>
              ) : null}
              {version.year ? (
                <div>
                  <dt>{copy.modal.yearLabel}</dt>
                  <dd>{version.year}</dd>
                </div>
              ) : null}
              {version.energy ? (
                <div>
                  <dt>{copy.modal.energyLabel}</dt>
                  <dd>{energyLabel}</dd>
                </div>
              ) : null}
              {typeLabel ? (
                <div>
                  <dt>{copy.modal.typeLabel}</dt>
                  <dd>{typeLabel}</dd>
                </div>
              ) : null}
              {version.transmission ? (
                <div>
                  <dt>{copy.modal.transmissionLabel}</dt>
                  <dd>{version.transmission}</dd>
                </div>
              ) : null}
              <div>
                <dt>{copy.modal.colorLabel}</dt>
                <dd>{configuration.exteriorColorLabel}</dd>
              </div>
              <div>
                <dt>{copy.modal.interiorLabel}</dt>
                <dd>{configuration.interiorColorLabel}</dd>
              </div>
              {showConfigurationCode ? (
                <div>
                  <dt>{copy.modal.configurationCodeLabel}</dt>
                  <dd>{configuration.code}</dd>
                </div>
              ) : null}
              {version.mileage !== null ? (
                <div>
                  <dt>{copy.modal.mileageLabel}</dt>
                  <dd>
                    {formatSiteNumber(version.mileage, locale)} {copy.modal.mileageUnit}
                  </dd>
                </div>
              ) : null}
            </dl>

            <QuoteActions
              vehicle={quoteVehicle}
              copy={quoteCopy}
              statusLabels={copy.statusLabels}
              energyLabels={copy.energyLabels}
              configurationCode={configuration.code}
            />

            {href ? (
              <button type="button" className="site-modal-share" onClick={copyLink}>
                <Link2 aria-hidden="true" size={16} />
                {linkCopied ? copy.modal.shareCopiedLabel : copy.modal.shareLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
