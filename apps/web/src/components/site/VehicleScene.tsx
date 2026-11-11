"use client";

import { useRef } from "react";
import type { KeyboardEvent, TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SiteCopy } from "@/lib/i18n/site/types";
import {
  sceneFallbackOf,
  sceneImagesOf,
  sceneModeOffers,
  type CatalogConfiguration,
  type CatalogSceneImage,
  type CatalogSceneMode,
  type CatalogVersion,
} from "@/lib/vehicle-catalog";

/** Distance minimale d'un balayage, pour ne pas confondre avec un appui. */
const SWIPE_THRESHOLD_PX = 40;

type VehicleCopy = SiteCopy["vehicules"];

interface VehicleSceneProps {
  version: CatalogVersion;
  configuration: CatalogConfiguration | null;
  mode: CatalogSceneMode;
  /** Vue affichée, conservée d'une configuration à l'autre quand elle existe. */
  sceneKey: string | null;
  title: string;
  copy: VehicleCopy;
  onModeChange: (mode: CatalogSceneMode) => void;
  onSceneKeyChange: (sceneKey: string) => void;
}

const MODE_LABEL_KEY: Record<CatalogSceneMode, keyof VehicleCopy["modal"]> = {
  gallery: "modeGalleryLabel",
  spin: "modeSpinLabel",
  interior: "modeInteriorLabel",
};

/** Libellé d'une vue : celui du canevas imposé, ou celui de la photo héritée. */
function sceneImageLabel(image: CatalogSceneImage, copy: VehicleCopy): string {
  if (image.slot) return copy.modal.canvasLabels[image.slot] ?? image.slot;
  return copy.modal.vehiclePhotoLabels[image.key] ?? image.key;
}

export function VehicleScene({
  version,
  configuration,
  mode,
  sceneKey,
  title,
  copy,
  onModeChange,
  onSceneKeyChange,
}: VehicleSceneProps) {
  const touchStartX = useRef<number | null>(null);

  const images = sceneImagesOf(configuration);
  const foundIndex = images.findIndex((image) => image.key === sceneKey);
  const activeIndex = foundIndex >= 0 ? foundIndex : 0;
  const activeImage = images[activeIndex] ?? null;
  const fallback = sceneFallbackOf(version, configuration);
  const offers = sceneModeOffers(configuration);

  function step(delta: number) {
    if (images.length < 2) return;
    const next = (activeIndex + delta + images.length) % images.length;
    onSceneKeyChange(images[next].key);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    step(delta < 0 ? 1 : -1);
  }

  return (
    <div className="site-scene">
      <div className="site-scene-modes" role="group" aria-label={copy.modal.configuratorTitle}>
        {offers.map((offer) => {
          const label = copy.modal[MODE_LABEL_KEY[offer.mode]] as string;
          return (
            <button
              key={offer.mode}
              type="button"
              className={offer.mode === mode ? "site-scene-mode is-active" : "site-scene-mode"}
              aria-pressed={offer.mode === mode}
              disabled={!offer.isAvailable}
              title={offer.isAvailable ? undefined : copy.modal.modeUnavailableNote}
              onClick={() => onModeChange(offer.mode)}
            >
              {label}
              {offer.isAvailable ? null : (
                <span className="site-sr-only"> {copy.modal.modeUnavailableNote}</span>
              )}
            </button>
          );
        })}
      </div>

      {activeImage ? (
        <>
          <div
            className="site-scene-stage"
            role="group"
            aria-label={sceneImageLabel(activeImage, copy)}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              // La cle force un remontage : le fondu rejoue a chaque changement
              // de configuration comme a chaque changement de vue.
              key={`${configuration?.code ?? "none"}-${activeImage.key}`}
              src={activeImage.url}
              alt={`${title} - ${sceneImageLabel(activeImage, copy)}`}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="site-scene-img"
              placeholder={activeImage.blurDataUrl ? "blur" : "empty"}
              blurDataURL={activeImage.blurDataUrl ?? undefined}
              priority={activeIndex === 0}
            />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  className="site-scene-arrow site-scene-arrow--prev"
                  onClick={() => step(-1)}
                >
                  <span className="site-sr-only">{copy.modal.previousPhotoLabel}</span>
                  <ChevronLeft aria-hidden="true" size={20} />
                </button>
                <button
                  type="button"
                  className="site-scene-arrow site-scene-arrow--next"
                  onClick={() => step(1)}
                >
                  <span className="site-sr-only">{copy.modal.nextPhotoLabel}</span>
                  <ChevronRight aria-hidden="true" size={20} />
                </button>
              </>
            ) : null}
          </div>

          <p className="site-scene-caption" aria-live="polite">
            <span>{sceneImageLabel(activeImage, copy)}</span>
            {images.length > 1 ? (
              <span className="site-scene-counter">
                {copy.modal.photoCounterTemplate
                  .replace("{index}", String(activeIndex + 1))
                  .replace("{total}", String(images.length))}
              </span>
            ) : null}
          </p>

          {images.length > 1 ? (
            <div className="site-scene-thumbs">
              {images.map((image, index) => (
                <button
                  key={image.key}
                  type="button"
                  aria-label={sceneImageLabel(image, copy)}
                  aria-pressed={index === activeIndex}
                  className={
                    index === activeIndex ? "site-scene-thumb is-active" : "site-scene-thumb"
                  }
                  onClick={() => onSceneKeyChange(image.key)}
                >
                  <Image src={image.url} alt="" fill sizes="88px" className="site-scene-thumb-img" />
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {fallback.kind === "MANUFACTURER" ? (
        <>
          <div className="site-scene-stage site-scene-stage--fallback">
            <Image
              src={fallback.image.url}
              alt={`${title} - ${copy.card.manufacturerVisualBadge}`}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="site-scene-img"
            />
            <span className="site-scene-badge">{copy.card.manufacturerVisualBadge}</span>
          </div>
          <p className="site-scene-notice">{copy.modal.manufacturerNotice}</p>
          <p className="site-scene-notice">{copy.modal.emptyMediaText}</p>
        </>
      ) : null}

      {fallback.kind === "EMPTY" ? (
        <div className="site-scene-stage site-scene-stage--empty">
          <p className="site-scene-empty-title">{copy.modal.emptyMediaTitle}</p>
          <p className="site-scene-notice">{copy.modal.emptyMediaText}</p>
        </div>
      ) : null}
    </div>
  );
}
