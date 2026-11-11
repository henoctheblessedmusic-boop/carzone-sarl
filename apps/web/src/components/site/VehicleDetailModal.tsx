"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import type { SiteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { formatSiteNumber } from "./vehicle-format";
import { QuoteActions } from "./QuoteActions";

export interface CatalogColorOption {
  id: string;
  label: string;
  base: string | null;
  hex: string;
  available: number;
  mainPhotoUrl: string | null;
  interiorPhotoUrl: string | null;
  exteriorPhotoUrl: string | null;
  rearPhotoUrl: string | null;
  seatsPhotoUrl: string | null;
  photosVerified: boolean;
}

export interface CatalogVehicle {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  energy: string;
  vehicleType: string | null;
  transmission: string | null;
  color: string | null;
  interiorColor?: string | null;
  mileage: number;
  priceXof: number;
  priceToConfirm?: boolean;
  availableCount?: number;
  colors?: string[];
  colorOptions?: CatalogColorOption[];
  status: string;
  mainPhotoUrl: string | null;
  interiorPhotoUrl: string | null;
  exteriorPhotoUrl: string | null;
  rearPhotoUrl: string | null;
  seatsPhotoUrl: string | null;
  photosVerified?: boolean;
}

interface VehicleDetailModalProps {
  vehicle: CatalogVehicle;
  copy: SiteCopy["vehicules"];
  locale: SiteLocale;
  quoteCopy: SiteCopy["quote"];
  onClose: () => void;
}

interface GalleryPhoto {
  key: string;
  url: string;
  label: string;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

function buildGallery(vehicle: CatalogVehicle, copy: SiteCopy["vehicules"]): GalleryPhoto[] {
  const candidates: Array<GalleryPhoto | null> = [
    vehicle.mainPhotoUrl ? { key: "main", url: vehicle.mainPhotoUrl, label: copy.modal.galleryMainLabel } : null,
    vehicle.exteriorPhotoUrl
      ? { key: "exterior", url: vehicle.exteriorPhotoUrl, label: copy.modal.galleryExteriorLabel }
      : null,
    vehicle.interiorPhotoUrl && vehicle.photosVerified
      ? { key: "interior", url: vehicle.interiorPhotoUrl, label: copy.modal.galleryInteriorLabel }
      : null,
    vehicle.seatsPhotoUrl && vehicle.photosVerified
      ? { key: "seats", url: vehicle.seatsPhotoUrl, label: copy.modal.gallerySeatsLabel }
      : null,
    vehicle.rearPhotoUrl ? { key: "rear", url: vehicle.rearPhotoUrl, label: copy.modal.galleryRearLabel } : null,
  ];
  return candidates.filter((photo): photo is GalleryPhoto => photo !== null);
}

export function VehicleDetailModal({ vehicle, copy, locale, quoteCopy, onClose }: VehicleDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const colorOptions = vehicle.colorOptions?.length
    ? vehicle.colorOptions
    : [
        {
          id: vehicle.id,
          label: vehicle.color ?? "Couleur à confirmer",
          base: vehicle.color,
          hex: "#64748b",
          available: 1,
          mainPhotoUrl: vehicle.mainPhotoUrl,
          interiorPhotoUrl: vehicle.interiorPhotoUrl,
          exteriorPhotoUrl: vehicle.exteriorPhotoUrl,
          rearPhotoUrl: vehicle.rearPhotoUrl,
          seatsPhotoUrl: vehicle.seatsPhotoUrl,
          photosVerified: Boolean(vehicle.photosVerified),
        },
      ];
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].label);
  const selectedOption = colorOptions.find((option) => option.label === selectedColor) ?? colorOptions[0];
  const displayVehicle: CatalogVehicle = {
    ...vehicle,
    id: selectedOption.id,
    color: selectedOption.label,
    interiorColor: vehicle.interiorColor,
    mainPhotoUrl: selectedOption.mainPhotoUrl,
    interiorPhotoUrl: selectedOption.interiorPhotoUrl,
    exteriorPhotoUrl: selectedOption.exteriorPhotoUrl,
    rearPhotoUrl: selectedOption.rearPhotoUrl,
    seatsPhotoUrl: selectedOption.seatsPhotoUrl,
    photosVerified: selectedOption.photosVerified,
  };

  const title = [displayVehicle.brand, displayVehicle.model, displayVehicle.variant].filter(Boolean).join(" ");
  const photos = buildGallery(displayVehicle, copy);
  const activePhoto = photos[activeIndex] ?? photos[0];

  const energyLabel = copy.energyLabels[displayVehicle.energy] ?? displayVehicle.energy;
  const typeLabel = displayVehicle.vehicleType ? copy.typeLabels[displayVehicle.vehicleType] ?? displayVehicle.vehicleType : null;

  function selectColor(option: (typeof colorOptions)[number]) {
    setSelectedColor(option.label);
    setActiveIndex(0);
  }

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

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
          <div className="site-modal-gallery-main">
            {activePhoto ? (
              <Image
                src={activePhoto.url}
                alt={`${title} - ${activePhoto.label}`}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="site-modal-gallery-img"
                priority
              />
            ) : (
              <div className="site-vehicle-card-placeholder" aria-hidden="true" />
            )}
          </div>
          {photos.length > 1 ? (
            <div className="site-modal-thumbs">
              {photos.map((photo, index) => (
                <button
                  key={photo.key}
                  type="button"
                  aria-label={photo.label}
                  aria-pressed={index === activeIndex}
                  className={index === activeIndex ? "site-modal-thumb is-active" : "site-modal-thumb"}
                  onClick={() => setActiveIndex(index)}
                >
                  <Image src={photo.url} alt="" fill sizes="80px" className="site-modal-thumb-img" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="site-modal-body">
          <h2 id="vehicle-modal-title" className="site-modal-title">
            {title}
          </h2>

          <dl className="site-modal-specs">
            <div>
              <dt>{copy.modal.brandLabel}</dt>
              <dd>{displayVehicle.brand}</dd>
            </div>
            <div>
              <dt>{copy.modal.modelLabel}</dt>
              <dd>{displayVehicle.model}</dd>
            </div>
            {vehicle.variant ? (
              <div>
                <dt>{copy.modal.variantLabel}</dt>
                <dd>{displayVehicle.variant}</dd>
              </div>
            ) : null}
            {vehicle.year ? (
              <div>
                <dt>{copy.modal.yearLabel}</dt>
                <dd>{displayVehicle.year}</dd>
              </div>
            ) : null}
            <div>
              <dt>{copy.modal.energyLabel}</dt>
              <dd>{energyLabel}</dd>
            </div>
            {typeLabel ? (
              <div>
                <dt>{copy.modal.typeLabel}</dt>
                <dd>{typeLabel}</dd>
              </div>
            ) : null}
            {vehicle.transmission ? (
              <div>
                <dt>{copy.modal.transmissionLabel}</dt>
                <dd>{displayVehicle.transmission}</dd>
              </div>
            ) : null}
            {vehicle.color ? (
              <div>
                <dt>{copy.modal.colorLabel}</dt>
                <dd>{displayVehicle.color}</dd>
              </div>
            ) : null}
            <div>
              <dt>{copy.modal.mileageLabel}</dt>
              <dd>
                {formatSiteNumber(displayVehicle.mileage, locale)} {copy.modal.mileageUnit}
              </dd>
            </div>
          </dl>

          {colorOptions.length > 0 && (
            <div style={{ margin: "12px 0 16px" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, marginBottom: 7 }}>
                {copy.modal.colorLabel}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {colorOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    title={`${option.label}${option.available > 1 ? ` · ${option.available}` : ""}`}
                    aria-label={`${option.label}${option.available > 1 ? ` · ${option.available}` : ""}`}
                    aria-pressed={option.label === selectedColor}
                    onClick={() => selectColor(option)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 9px",
                      borderRadius: 8,
                      border: option.label === selectedColor ? "1px solid #d4af37" : "1px solid rgba(255,255,255,0.16)",
                      background: option.label === selectedColor ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
                      color: "inherit",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        background: option.hex,
                        border: "1px solid rgba(255,255,255,0.35)",
                        flexShrink: 0,
                      }}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <QuoteActions
            vehicle={displayVehicle}
            copy={quoteCopy}
            statusLabels={copy.statusLabels}
            energyLabels={copy.energyLabels}
          />
        </div>
      </div>
    </div>
    </div>,
    document.body
  );
}
