/**
 * Lecture du classeur historique de la gestionnaire de location.
 *
 * Le fichier melange trois entites dans une seule feuille : le client, le
 * vehicule et le contrat. Ce module ne fait aucune ecriture en base et ne lit
 * pas le disque : il transforme les lignes Excel en plan importable.
 */

export type RentalWorkbookClient = {
  key: string;
  contactName: string;
  companyName: string | null;
  address: string | null;
  phone: string | null;
  identityDocumentType: string | null;
  identityNumber: string | null;
  secondaryContact: string | null;
  contractCount: number;
};

export type RentalWorkbookVehicle = {
  fleetCode: string;
  brand: string;
  model: string;
  color: string;
  year: number;
  energy: string;
  seats: number;
  sourceName: string;
};

export type RentalWorkbookContract = {
  sourceReference: string;
  clientKey: string;
  fleetCode: string;
  days: number;
  startDate: string | null;
  endDate: string | null;
  operationDate: string | null;
  amountXof: number | null;
  dailyXof: number | null;
  withDriver: boolean | null;
  paymentMethod: string | null;
  paymentStatus: "PAYE" | "NON_PAYE";
  status: "BROUILLON" | "ACTIF" | "TERMINE";
  warnings: string[];
};

export type RentalWorkbookPreview = {
  clients: RentalWorkbookClient[];
  vehicles: RentalWorkbookVehicle[];
  contracts: RentalWorkbookContract[];
  warnings: string[];
  ignoredRows: number;
};

const HEADER_ALIASES = {
  order: ["N° D'ORDRE", "N D'ORDRE", "NUMERO", "N°"],
  name: ["NOMS", "NOM", "NOM CLIENT", "CLIENT"],
  address: ["ADRESSE", "ADRESSE CLIENT"],
  identity: ["N° CIP/CNI", "CIP/CNI", "CIP", "CNI", "PIECE IDENTITE"],
  phone: ["CONTACT_CLIENT", "CONTACT CLIENT", "TELEPHONE", "TEL"],
  secondary: ["PERSONNE A CONTACTER", "CONTACT URGENCE", "PERSONNE A CONTACTER EN CAS DE PROBLEME"],
  operation: ["TYPE D'OPERATION", "TYPE OPERATION"],
  driver: ["AVEC OU SANS CHAUFFEUR", "CHAUFFEUR"],
  days: ["NRE DE JOURS", "NOMBRE DE JOURS", "JOURS"],
  start: ["EFFET", "DATE EFFET", "DATE DE PRISE D'EFFET"],
  end: ["ECHEANCE", "DATE ECHEANCE"],
  vehicle: ["MARQUE de VOITURE Loué", "MARQUE VOITURE LOUE", "VEHICULE"],
  color: ["COULEUR"],
  year: ["ANNEE", "ANNEE MODELE"],
  energy: ["ENERGIE", "CARBURANT"],
  seats: ["PLACE", "PLACES", "NOMBRE DE PLACES"],
  amount: ["MONTANT"],
  payment: ["MOYEN DE PAIEMENT", "MODE DE PAIEMENT"],
  operationDate: ["DATE D'OPERATION", "DATE OPERATION"],
} as const;

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHeader(value: unknown): string {
  return normalizeText(value).toUpperCase();
}

function findHeaderIndex(matrix: unknown[][]): number {
  for (let rowIndex = 0; rowIndex < Math.min(matrix.length, 15); rowIndex += 1) {
    const headers = (matrix[rowIndex] || []).map(normalizeHeader);
    if (headers.includes("NOMS") || headers.includes("NOM") || headers.includes("CLIENT")) return rowIndex;
  }
  return -1;
}

function buildHeaderMap(headerRow: unknown[]): Record<string, number> {
  const headers = headerRow.map(normalizeHeader);
  const result: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const index = headers.findIndex((header) => aliases.some((alias) => normalizeHeader(alias) === header));
    if (index >= 0) result[field] = index;
  }
  return result;
}

function cell(row: unknown[], map: Record<string, number>, field: string): string {
  const index = map[field];
  return index === undefined ? "" : String(row[index] ?? "").trim();
}

export function parseExcelDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const rawYear = Number(match[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function isoDate(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

function parsePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `+${digits}`;
}

function parseAmount(value: string): number | null {
  if (!value || /pas encore|non encaisse|impaye/i.test(value)) return null;
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function normalizePaymentMethod(value: string): string | null {
  const normalized = normalizeHeader(value);
  if (!normalized) return null;
  if (normalized.includes("ESPECE")) return "ESPECES";
  if (normalized.includes("MOBILE") || normalized.includes("MOMO")) return "MOBILE_MONEY";
  if (normalized.includes("VIREMENT")) return "VIREMENT";
  if (normalized.includes("CHEQUE")) return "CHEQUE";
  return normalized.replace(/\s+/g, "_");
}

function normalizedIdentity(value: string): string | null {
  const normalized = value.replace(/\s+/g, "").toUpperCase();
  return normalized || null;
}

function clientKey(name: string, phone: string | null, identity: string | null): string {
  if (identity) return `ID:${identity}`;
  return `NP:${normalizeText(name).toUpperCase()}|${phone || ""}`;
}

type CanonicalVehicle = Omit<RentalWorkbookVehicle, "sourceName">;

function resolveVehicle(rawVehicle: string): CanonicalVehicle | null {
  const value = normalizeHeader(rawVehicle);
  if (!value) return null;
  if (value.includes("SUZUKI")) return null;
  if (value.includes("CS55")) {
    return { fleetCode: "LOC-CCS55-GRIS", brand: "Changan", model: "CS55", color: "Gris", year: 2026, energy: "ESSENCE", seats: 5 };
  }
  if (value.includes("RAV4")) {
    return { fleetCode: "LOC-RAV4-HYBRIDE", brand: "Toyota", model: "RAV4", color: "Blanc", year: 2025, energy: "HYBRIDE", seats: 5 };
  }
  if (value.includes("X5")) {
    return { fleetCode: "LOC-X5-BLANC", brand: "Changan", model: "X5", color: "Blanc", year: 2026, energy: "ESSENCE", seats: 5 };
  }
  if (value.includes("CS75")) {
    return { fleetCode: "LOC-CS75-GRIS", brand: "Changan", model: "CS75", color: "Gris", year: 2026, energy: "ESSENCE", seats: 5 };
  }
  if (value.includes("JETOUR")) {
    return { fleetCode: "LOC-JETOUR-CREME", brand: "Jetour", model: "JETOUR", color: "Creme", year: 2026, energy: "ESSENCE", seats: 5 };
  }
  if (value.includes("GEELY")) {
    return { fleetCode: "LOC-GEELY-GRIS", brand: "Geely", model: "GEELY", color: "Gris", year: 2026, energy: "ESSENCE", seats: 5 };
  }
  if (value.includes("BYD")) {
    return { fleetCode: "LOC-BYD-NOIRE", brand: "BYD", model: "BYD", color: "Noir", year: 2026, energy: "ESSENCE", seats: 5 };
  }
  if (value.includes("GRUE")) {
    return { fleetCode: "LOC-GRUE", brand: "GRUE", model: "GRUE", color: "Noir", year: 2026, energy: "ESSENCE", seats: 3 };
  }
  return null;
}

/**
 * Transforme la matrice Excel en aperçu importable.
 * Les lignes SUZUKI sont ignorées conformément à la décision métier.
 */
export function parseRentalWorkbook(matrix: unknown[][]): RentalWorkbookPreview {
  const headerIndex = findHeaderIndex(matrix);
  if (headerIndex < 0) {
    return { clients: [], vehicles: [], contracts: [], warnings: ["Aucune ligne d'en-têtes clients reconnue."], ignoredRows: 0 };
  }

  const map = buildHeaderMap(matrix[headerIndex] || []);
  if (map.name === undefined || map.vehicle === undefined) {
    return { clients: [], vehicles: [], contracts: [], warnings: ["Colonnes NOMS ou VEHICULE introuvables."], ignoredRows: 0 };
  }

  const clients = new Map<string, RentalWorkbookClient>();
  const vehicles = new Map<string, RentalWorkbookVehicle>();
  const contracts: RentalWorkbookContract[] = [];
  const warnings: string[] = [];
  let ignoredRows = 0;
  const today = new Date();

  for (let rowIndex = headerIndex + 1; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex] || [];
    if (!row.some((value) => String(value ?? "").trim() !== "")) continue;

    const vehicle = resolveVehicle(cell(row, map, "vehicle"));
    if (!vehicle) {
      ignoredRows += 1;
      warnings.push(`Ligne ${rowIndex + 1} ignoree : vehicule non actif (${cell(row, map, "vehicle") || "vide"}).`);
      continue;
    }

    const name = cell(row, map, "name");
    if (!name) {
      ignoredRows += 1;
      warnings.push(`Ligne ${rowIndex + 1} ignoree : nom client vide.`);
      continue;
    }

    const identity = normalizedIdentity(cell(row, map, "identity"));
    const phone = parsePhone(cell(row, map, "phone"));
    const key = clientKey(name, phone, identity);
    const existingClient = clients.get(key);
    if (existingClient) {
      existingClient.contractCount += 1;
    } else {
      clients.set(key, {
        key,
        contactName: name,
        companyName: null,
        address: cell(row, map, "address") || null,
        phone,
        identityDocumentType: identity
          ? identity.toUpperCase().startsWith("CIP")
            ? "CIP"
            : identity.toUpperCase().startsWith("CNI")
              ? "CNI"
              : null
          : null,
        identityNumber: identity,
        secondaryContact: cell(row, map, "secondary") || null,
        contractCount: 1,
      });
    }

    if (!vehicles.has(vehicle.fleetCode)) vehicles.set(vehicle.fleetCode, { ...vehicle, sourceName: cell(row, map, "vehicle") });

    const dayValue = cell(row, map, "days");
    const days = Number(dayValue);
    const start = parseExcelDate(cell(row, map, "start"));
    const end = parseExcelDate(cell(row, map, "end"));
    const operationDate = parseExcelDate(cell(row, map, "operationDate"));
    const amount = parseAmount(cell(row, map, "amount"));
    const driverRaw = normalizeHeader(cell(row, map, "driver"));
    const withDriver = driverRaw === "OUI" ? true : driverRaw === "NON" ? false : null;
    const rowWarnings: string[] = [];

    if (!dayValue) rowWarnings.push("duree manquante");
    if (Number.isNaN(days) || days <= 0) rowWarnings.push("duree nulle ou invalide");
    if (!start) rowWarnings.push("date d'effet manquante ou invalide");
    if (amount === null) rowWarnings.push("montant non encaisse ou invalide");
    if (!driverRaw) rowWarnings.push("chauffeur non renseigne");

    let status: RentalWorkbookContract["status"] = "BROUILLON";
    if (start && end && days > 0) {
      if (end < today) status = "TERMINE";
      else if (start <= today && end >= today) status = "ACTIF";
    }

    contracts.push({
      sourceReference: `BASE-CLIENTS-LOCATION-${rowIndex + 1}`,
      clientKey: key,
      fleetCode: vehicle.fleetCode,
      days: Number.isFinite(days) ? Math.max(0, Math.round(days)) : 0,
      startDate: isoDate(start),
      endDate: isoDate(end),
      operationDate: isoDate(operationDate),
      amountXof: amount,
      dailyXof: amount && days > 0 ? Math.round(amount / days) : null,
      withDriver,
      paymentMethod: normalizePaymentMethod(cell(row, map, "payment")),
      paymentStatus: amount ? "PAYE" : "NON_PAYE",
      status,
      warnings: rowWarnings,
    });
  }

  return {
    clients: [...clients.values()],
    vehicles: [...vehicles.values()],
    contracts,
    warnings: [
      ...warnings,
      ...contracts.flatMap((contract) => contract.warnings.map((warning) => `${contract.sourceReference}: ${warning}`)),
    ],
    ignoredRows,
  };
}

export function summarizeRentalWorkbook(preview: RentalWorkbookPreview) {
  return {
    clients: preview.clients.length,
    vehicles: preview.vehicles.length,
    contracts: preview.contracts.length,
    drafts: preview.contracts.filter((contract) => contract.status === "BROUILLON").length,
    actives: preview.contracts.filter((contract) => contract.status === "ACTIF").length,
    unpaid: preview.contracts.filter((contract) => contract.paymentStatus === "NON_PAYE").length,
    withDriver: preview.contracts.filter((contract) => contract.withDriver === true).length,
    withoutDriver: preview.contracts.filter((contract) => contract.withDriver === false).length,
    unknownDriver: preview.contracts.filter((contract) => contract.withDriver === null).length,
    warnings: preview.warnings.length,
    ignoredRows: preview.ignoredRows,
  };
}
