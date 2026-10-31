import Image from "next/image";
import type { SiteCopy } from "@/lib/i18n/site";
import { QuoteActions } from "./QuoteActions";

export interface FeaturedVehicle {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  energy: string;
  status: string;
  mainPhotoUrl: string | null;
}

interface VehicleCardProps {
  vehicle: FeaturedVehicle;
  newBadgeLabel: string;
  quoteCopy: SiteCopy["quote"];
  statusLabels?: Record<string, string>;
  energyLabels?: Record<string, string>;
}

const CURRENT_YEAR = new Date().getFullYear();

export function VehicleCard({ vehicle, newBadgeLabel, quoteCopy, statusLabels, energyLabels }: VehicleCardProps) {
  const title = [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
  const isRecent = vehicle.year !== null && vehicle.year >= CURRENT_YEAR - 1;

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
      </div>
      <div className="site-vehicle-card-body">
        <p className="site-vehicle-card-energy">{vehicle.energy}</p>
        <h3 className="site-vehicle-card-title">{title}</h3>
        {vehicle.year ? <p className="site-vehicle-card-year">{vehicle.year}</p> : null}
        <QuoteActions
          vehicle={vehicle}
          copy={quoteCopy}
          statusLabels={statusLabels}
          energyLabels={energyLabels}
          variant="card"
        />
      </div>
    </article>
  );
}
