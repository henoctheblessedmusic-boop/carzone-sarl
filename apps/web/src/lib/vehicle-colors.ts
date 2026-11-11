/** Palette de couleurs utilisée par le stock et la vitrine. */
export const VEHICLE_COLOR_HEX: Record<string, string> = {
  blanc: "#e5e7eb",
  blanche: "#e5e7eb",
  noir: "#111827",
  noire: "#111827",
  gris: "#6b7280",
  grise: "#6b7280",
  "gris creme": "#d6d3d1",
  "gris cendre": "#9ca3af",
  bleu: "#2563eb",
  bleue: "#2563eb",
  rouge: "#dc2626",
  "rouge bordeaux": "#7f1d1d",
  terracotta: "#b45309",
  beige: "#d6c7a1",
  argent: "#cbd5e1",
  "argenté": "#cbd5e1",
  marron: "#78350f",
  vert: "#15803d",
  "vert olive": "#4d7c0f",
  jaune: "#eab308",
  orange: "#ea580c",
  violet: "#7e22ce",
};

/**
 * Clé de comparaison d'une couleur : accents retirés, minuscules, espaces repliés.
 * Exportée parce que la configuration véhicule compare les mêmes libellés.
 */
export function normalizeColorToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function vehicleColorHex(value?: string | null): string {
  if (!value) return "#64748b";
  return VEHICLE_COLOR_HEX[normalizeColorToken(value)] ?? "#64748b";
}

export function vehicleColorLabel(value?: string | null): string {
  return value?.trim() || "Couleur à confirmer";
}
