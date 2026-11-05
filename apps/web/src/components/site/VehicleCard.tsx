"use client";

import { useState } from "react";
import Image from "next/image";
import type { SiteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { QuoteActions } from "./QuoteActions";
import { VehicleDetailModal, type CatalogVehicle } from "./VehicleDetailModal";

export type FeaturedVehicle = CatalogVehicle;

interface VehicleCardProps {
  vehicle: FeaturedVehicle;
  locale: SiteLocale;
  newBadgeLabel: string;
  quoteCopy: SiteCopy["quote"];
  vehicleCopy: SiteCopy["vehicules"];
  statusLabels?: Record<string, string>;
  energyLabels?: Record<string, string>;
}

const CURRENT_YEAR = new Date().getFullYear();

export function VehicleCard({
  vehicle,
  locale,
  newBadgeLabel,
  quoteCopy,
  vehicleCopy,
  statusLabels,
  energyLabels,
}: VehicleCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const title = [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
  const isRecent = vehicle.year !== null && vehicle.year >= CURRENT_YEAR - 1;
  const energyLabel = energyLabels?.[vehicle.energy] ?? vehicle.energy;

  return (
    <article className="site-vehicle-card">
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
        {isRecent ? <span className="site-badge site-badge--accent">{newBadgeLabel}</span> : null}
        <button
          type="button"
          className="site-vehicle-card-gallery-trigger"
          onClick={() => setIsGalleryOpen(true)}
          aria-label={`Voir la galerie photos de ${title}`}
        >
          <span>Voir la galerie</span>
        </button>
      </div>
      <div className="site-vehicle-card-body">
        <p className="site-vehicle-card-energy">
          <span>{vehicleCopy.modal.energyLabel}</span>
          <strong>{energyLabel}</strong>
        </p>
        <h3 className="site-vehicle-card-title">
          <button
            type="button"
            className="site-vehicle-card-gallery-title"
            onClick={() => setIsGalleryOpen(true)}
          >
            {title}
          </button>
        </h3>
        {vehicle.year ? <p className="site-vehicle-card-year">{vehicle.year}</p> : null}
        <QuoteActions
          vehicle={vehicle}
          copy={quoteCopy}
          statusLabels={statusLabels}
          energyLabels={energyLabels}
          variant="card"
        />
      </div>

      {isGalleryOpen ? (
        <VehicleDetailModal
          vehicle={vehicle}
          copy={vehicleCopy}
          locale={locale}
          quoteCopy={quoteCopy}
          onClose={() => setIsGalleryOpen(false)}
        />
      ) : null}
    </article>
  );
}
