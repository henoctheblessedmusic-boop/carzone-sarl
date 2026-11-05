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
  vehicle: {
    brand: string;
    model: string;
    variant: string | null;
    year: number | null;
    registrationNumber: string | null;
    vin: string | null;
    color: string | null;
    energy: string;
    mileage: number;
  };
  payments: Array<{ amountXof: number }>;
};

