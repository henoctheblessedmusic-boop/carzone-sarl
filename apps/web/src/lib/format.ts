export { ROLE_LABELS } from "./roles";

export const XOF = new Intl.NumberFormat("fr-BJ", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

export function formatXof(amount: number) {
  return XOF.format(amount);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("fr-BJ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function nextDocNumber(prefix: string, count: number) {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Numérotation des bons de livraison internes — séquences séparées par activité :
 * BL-GAR-0001… pour le garage, BL-SHW-0001… pour le showroom.
 */
export function nextDeliveryNoteNumber(activity: "SHOWROOM" | "GARAGE", count: number) {
  const prefix = activity === "GARAGE" ? "BL-GAR" : "BL-SHW";
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}
