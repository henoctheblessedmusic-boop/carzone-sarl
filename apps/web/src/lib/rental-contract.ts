/** Calculs et références partagés pour les contrats de location. */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Normalise une date au jour calendaire UTC pour éviter les décalages d'heure. */
export function rentalDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/**
 * Nombre de jours facturés entre deux dates.
 * Exemple : du 5 au 8 = 3 jours ; même journée = 1 jour minimum.
 */
export function rentalDaysBetween(startDate: Date, endDate: Date | null | undefined): number {
  if (!endDate) return 0;
  const start = rentalDateOnly(startDate).getTime();
  const end = rentalDateOnly(endDate).getTime();
  if (end < start) return 0;
  return Math.max(1, Math.round((end - start) / DAY_MS));
}

/**
 * Total du contrat : tarif journalier prioritaire, sinon prorata du tarif mensuel.
 * Le total est calculé côté serveur et ne dépend jamais du montant affiché par le navigateur.
 */
export function computeRentalTotal(input: {
  dailyXof?: number | null;
  monthlyXof?: number | null;
  days: number;
}): number | null {
  if (!input.days || input.days < 1) return null;
  if (input.dailyXof && input.dailyXof > 0) {
    return Math.round(input.dailyXof * input.days);
  }
  if (input.monthlyXof && input.monthlyXof > 0) {
    return Math.round((input.monthlyXof * input.days) / 30);
  }
  return null;
}

export function rentalContractReference(rentalId: string): string {
  return `LOC-${rentalId.slice(-8).toUpperCase()}`;
}

export function formatRentalDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-BJ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

/** Date en toutes lettres pour le corps juridique du contrat : « 20 août 2026 ». */
export function formatRentalDateLong(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-BJ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

/** Données minimales nécessaires à l'affichage d'un contrat de location. */
export type RentalContractData = {
  id: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  days: number | null;
  dailyXof: number | null;
  monthlyXof: number | null;
  totalXof: number | null;
  depositXof: number | null;
  departureCondition: string | null;
  createdByName: string | null;
  signedAt: Date | null;
  signedByClient: string | null;
  signedByCompany: string | null;
  customer: {
    contactName: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    address: string | null;
    ifu: string | null;
  };
  vehicle: RentalContractVehicle;
  payments: Array<{ amountXof: number }>;
};

/**
 * Véhicule tel qu'il figure à l'article 2 du contrat.
 * `version` est optionnel : les pages qui ne chargent pas la version du catalogue
 * restent compatibles, le nombre de places tombe alors sur un tiret.
 */
export type RentalContractVehicle = {
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  registrationNumber: string | null;
  vin: string | null;
  color: string | null;
  exteriorColorBase: string | null;
  exteriorColorShade: string | null;
  interiorColor: string | null;
  energy: string;
  mileage: number;
  version?: { trim: string | null; seats: number | null } | null;
};

/** Valeur affichée quand la fiche véhicule ne renseigne pas le champ. */
const NOT_PROVIDED = "-";

/** Libellés de carburant du contrat : document juridique toujours rédigé en français. */
const FUEL_LABELS: Record<string, string> = {
  ESSENCE: "Essence",
  DIESEL: "Diesel",
  HYBRIDE: "Hybride",
  PHEV: "Hybride rechargeable",
  ELECTRIQUE: "Électrique",
};

export function rentalFuelLabel(energy: string | null | undefined): string {
  if (!energy) return NOT_PROVIDED;
  return FUEL_LABELS[energy] || energy;
}

/**
 * Teinte extérieure la plus précise de la fiche stock.
 * Même ordre de priorité que le module stock : teinte exacte, puis couleur de base.
 */
export function rentalExteriorColor(vehicle: RentalContractVehicle): string {
  return vehicle.exteriorColorShade || vehicle.exteriorColorBase || vehicle.color || NOT_PROVIDED;
}

export function rentalVehicleLabel(vehicle: RentalContractVehicle): string {
  return [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
}

function seatsLabel(seats: number | null | undefined): string {
  if (!seats || seats < 1) return NOT_PROVIDED;
  return `${seats} place${seats > 1 ? "s" : ""}`;
}

/**
 * Les neuf caractéristiques de l'article 2, dans l'ordre du canevas papier CARZONE.
 * Aucune valeur n'est inventée : un champ absent de la fiche véhicule reste un tiret.
 */
export function rentalVehicleSpecs(
  vehicle: RentalContractVehicle,
): ReadonlyArray<{ label: string; value: string }> {
  return [
    { label: "Marque", value: vehicle.brand || NOT_PROVIDED },
    { label: "Modèle", value: vehicle.model || NOT_PROVIDED },
    { label: "Année modèle", value: vehicle.year ? String(vehicle.year) : NOT_PROVIDED },
    { label: "Génération", value: vehicle.variant || vehicle.version?.trim || NOT_PROVIDED },
    { label: "Carburant", value: rentalFuelLabel(vehicle.energy) },
    { label: "Nombre de places", value: seatsLabel(vehicle.version?.seats) },
    { label: "Couleur extérieure", value: rentalExteriorColor(vehicle) },
    { label: "Couleur intérieure", value: vehicle.interiorColor || NOT_PROVIDED },
    { label: "Numéro VIN (châssis)", value: vehicle.vin || NOT_PROVIDED },
  ];
}

