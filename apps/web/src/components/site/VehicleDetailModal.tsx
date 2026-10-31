"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { SiteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { formatSiteNumber } from "./vehicle-format";
import { QuoteActions } from "./QuoteActions";

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
  mileage: number;
  priceXof: number;
  status: string;
  mainPhotoUrl: string | null;
  interiorPhotoUrl: string | null;
  exteriorPhotoUrl: string | null;
  rearPhotoUrl: string | null;
  seatsPhotoUrl: string | null;
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
    vehicle.interiorPhotoUrl
      ? { key: "interior", url: vehicle.interiorPhotoUrl, label: copy.modal.galleryInteriorLabel }
      : null,
    vehicle.seatsPhotoUrl ? { key: "seats", url: vehicle.seatsPhotoUrl, label: copy.modal.gallerySeatsLabel } : null,
    vehicle.rearPhotoUrl ? { key: "rear", url: vehicle.rearPhotoUrl, label: copy.modal.galleryRearLabel } : null,
  ];
  return candidates.filter((photo): photo is GalleryPhoto => photo !== null);
}

export function VehicleDetailModal({ vehicle, copy, locale, quoteCopy, onClose }: VehicleDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const title = [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
  const photos = buildGallery(vehicle, copy);
  const activePhoto = photos[activeIndex] ?? photos[0];

  const energyLabel = copy.energyLabels[vehicle.energy] ?? vehicle.energy;
  const typeLabel = vehicle.vehicleType ? copy.typeLabels[vehicle.vehicleType] ?? vehicle.vehicleType : null;

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

  return (
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
              <dd>{vehicle.brand}</dd>
            </div>
            <div>
              <dt>{copy.modal.modelLabel}</dt>
              <dd>{vehicle.model}</dd>
            </div>
            {vehicle.variant ? (
              <div>
                <dt>{copy.modal.variantLabel}</dt>
                <dd>{vehicle.variant}</dd>
              </div>
            ) : null}
            {vehicle.year ? (
              <div>
                <dt>{copy.modal.yearLabel}</dt>
                <dd>{vehicle.year}</dd>
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
                <dd>{vehicle.transmission}</dd>
              </div>
            ) : null}
            {vehicle.color ? (
              <div>
                <dt>{copy.modal.colorLabel}</dt>
                <dd>{vehicle.color}</dd>
              </div>
            ) : null}
            <div>
              <dt>{copy.modal.mileageLabel}</dt>
              <dd>
                {formatSiteNumber(vehicle.mileage, locale)} {copy.modal.mileageUnit}
              </dd>
            </div>
          </dl>

          <QuoteActions
            vehicle={vehicle}
            copy={quoteCopy}
            statusLabels={copy.statusLabels}
            energyLabels={copy.energyLabels}
          />
        </div>
      </div>
    </div>
  );
}
