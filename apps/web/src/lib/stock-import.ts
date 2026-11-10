/** Import Excel du stock véhicules : définitions partagées client/serveur. */

export const STOCK_IMPORT_MAX_ROWS = 500;
export const STOCK_ZONES = ["Showroom 1", "Showroom 2", "Arrivage"] as const;
export type StockZone = (typeof STOCK_ZONES)[number];

export const STOCK_IMPORT_STATUS_MAP: Record<string, string> = {
  "En stock": "EN_MAGASIN",
  "En arrivage": "EN_ARRIVAGE",
  "Réservé": "RESERVE",
  Resérvé: "RESERVE",
  Vendu: "VENDU",
  "Retiré": "RETIRE",
};

export const STOCK_ENERGY_MAP: Record<string, string> = {
  Essence: "ESSENCE",
  Diesel: "DIESEL",
  Hybride: "HYBRIDE",
  "Hybride rechargeable (PHEV)": "PHEV",
  "Hybride rechargeable": "PHEV",
  PHEV: "PHEV",
  Électrique: "ELECTRIQUE",
  Electrique: "ELECTRIQUE",
};

export const STOCK_IMPORT_FIELDS = {
  brand: ["marque", "brand"],
  model: ["modele", "modèle", "model"],
  trim: ["finition", "finition / pack", "variant", "version"],
  year: ["annee", "année", "year"],
  energy: ["energie", "énergie", "energy"],
  engine: ["moteur", "engine", "motorisation"],
  transmission: ["transmission", "drivetrain"],
  gearbox: ["boite", "boîte", "gearbox"],
  seats: ["places", "seats"],
  otherFeatures: ["autres caracteristiques", "autres caractéristiques", "other features"],
  exteriorColorBase: ["couleur ext", "couleur ext.", "couleur exterieure", "couleur extérieure", "external color"],
  exteriorColorShade: ["teinte ext exacte", "teinte ext. exacte", "teinte extérieure", "exact shade"],
  interiorColor: ["couleur int", "couleur int.", "couleur interieure", "couleur intérieure", "interior color"],
  vin: ["n vin", "n° vin", "vin", "numero vin", "numéro vin"],
  status: ["statut", "status"],
  site: ["site", "zone", "showroom"],
  arrivalDate: ["date d arrivee", "date d'arrivée", "date arrivée", "arrival date"],
} as const;

export type StockImportFieldKey = keyof typeof STOCK_IMPORT_FIELDS;

export function normalizeStockHeader(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function mapStockHeaders(headers: string[]): Partial<Record<StockImportFieldKey, string>> {
  const normalized = headers.map((raw) => ({ raw, norm: normalizeStockHeader(raw) }));
  const mapping: Partial<Record<StockImportFieldKey, string>> = {};

  for (const field of Object.keys(STOCK_IMPORT_FIELDS) as StockImportFieldKey[]) {
    const aliases = STOCK_IMPORT_FIELDS[field].map(normalizeStockHeader);
    const found =
      normalized.find((h) => aliases.includes(h.norm)) ??
      normalized.find((h) => aliases.some((alias) => h.norm.includes(alias)));
    if (found) mapping[field] = found.raw;
  }

  return mapping;
}

export type StockImportPayloadRow = {
  excelRow: number;
  brand: string;
  model: string;
  trim: string;
  year: string;
  energy: string;
  engine: string;
  transmission: string;
  gearbox: string;
  seats: string;
  otherFeatures: string;
  exteriorColorBase: string;
  exteriorColorShade: string;
  interiorColor: string;
  vin: string;
  status: string;
  site: string;
  arrivalDate: string;
};

export type StockImportPreparedRow = {
  row: StockImportPayloadRow;
  errors: string[];
  duplicateInFile: boolean;
};

export type StockImportResult = {
  created: number;
  updated: number;
  anomalies: number;
  total: number;
  missingVins: string[];
};

export type StockImportRowPayload = Omit<StockImportPayloadRow, "excelRow">;

export function parseStockYear(value: string): number | null {
  const raw = value.trim();
  if (!raw) return null;
  if (!/^\d{4}$/.test(raw)) throw new Error(`Année invalide : ${raw}`);
  const year = Number(raw);
  if (year < 2015 || year > 2100) throw new Error(`Année hors plage : ${raw}`);
  return year;
}

export function normalizeStockEnergy(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  const normalized = STOCK_ENERGY_MAP[raw] ?? STOCK_ENERGY_MAP[raw.replace(/\.$/, "")];
  if (!normalized) throw new Error(`Énergie inconnue : ${raw}`);
  return normalized;
}

export function normalizeStockStatus(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  const status = STOCK_IMPORT_STATUS_MAP[raw];
  if (!status) throw new Error(`Statut inconnu : ${raw}`);
  return status;
}

export function normalizeStockZone(value: string): StockZone | null {
  const raw = value.trim();
  if (!raw) return null;
  if ((STOCK_ZONES as readonly string[]).includes(raw)) return raw as StockZone;
  throw new Error(`Site inconnu : ${raw}`);
}

export function parseStockDate(value: string): Date | null {
  const raw = value.trim();
  if (!raw) return null;
  const french = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (french) {
    const year = Number(french[3].length === 2 ? `20${french[3]}` : french[3]);
    const date = new Date(Date.UTC(year, Number(french[2]) - 1, Number(french[1])));
    if (Number.isNaN(date.getTime())) throw new Error(`Date invalide : ${raw}`);
    return date;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) throw new Error(`Date invalide : ${raw}`);
  return date;
}

export function isValidVin(vin: string): boolean {
  return /^[A-Z0-9]{17}$/.test(vin);
}

export function versionKeyFor(row: StockImportRowPayload): string | null {
  const trim = row.trim.trim();
  const energy = row.energy.trim();
  const year = row.year.trim();
  if (!trim || !energy || !year) return null;
  return [row.brand, row.model, trim, year, energy].map((v) => v.trim().toUpperCase()).join("|");
}

export function isIncompleteStockRow(row: StockImportRowPayload): boolean {
  return !row.trim.trim() || !row.year.trim() || !row.energy.trim() || !row.interiorColor.trim();
}

export function validateStockRow(row: StockImportRowPayload): string[] {
  const errors: string[] = [];
  if (!row.vin.trim()) errors.push("VIN obligatoire");
  else if (!isValidVin(row.vin.trim())) errors.push("VIN invalide : 17 caractères alphanumériques attendus");
  if (!row.brand.trim()) errors.push("Marque obligatoire");
  if (!row.model.trim()) errors.push("Modèle obligatoire");
  if (!row.status.trim()) errors.push("Statut obligatoire");
  if (!row.site.trim()) errors.push("Site obligatoire");
  try {
    parseStockYear(row.year);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Année invalide");
  }
  try {
    normalizeStockEnergy(row.energy);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Énergie inconnue");
  }
  try {
    normalizeStockStatus(row.status);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Statut inconnu");
  }
  try {
    normalizeStockZone(row.site);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Site inconnu");
  }
  try {
    parseStockDate(row.arrivalDate);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Date invalide");
  }
  return errors;
}
