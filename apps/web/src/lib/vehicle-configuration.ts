/**
 * Configuration commercialisable : une version + une teinte extérieure + une teinte intérieure.
 *
 * Fonctions pures, sans accès base. La règle d'or du projet veut qu'une configuration
 * ne mélange jamais deux teintes ni deux intérieurs : la clé calculée ici est donc
 * l'unique point de vérité du regroupement des véhicules.
 */

import { normalizeColorToken, vehicleColorHex } from "@/lib/vehicle-colors";

/** Sentinelle d'intérieur non relevé. Non nulle : l'unicité de la configuration en dépend. */
export const INTERIOR_TO_COMPLETE = "À compléter";
/** Sentinelle de teinte extérieure absente du stock. */
export const EXTERIOR_TO_CONFIRM = "À confirmer";
/** Suffixe de clé des versions de rattachement provisoire (finition non relevée). */
export const PROVISIONAL_TRIM_KEY = "A CONFIRMER";
/** Énergie enregistrée par l'import quand la colonne est vide. */
const ENERGY_UNKNOWN = "NON_RENSEIGNEE";
/** Statuts qui sortent un véhicule du stock présentable. Partagés avec le service. */
export const INELIGIBLE_VEHICLE_STATUSES = ["VENDU", "RETIRE"] as const;
/** Parc de vente, par opposition au parc de location. */
export const SHOWROOM_FLEET_TYPE = "SHOWROOM";
const INELIGIBLE_STATUSES: ReadonlySet<string> = new Set(INELIGIBLE_VEHICLE_STATUSES);
const CODE_PREFIX = "CFG-";
const CODE_DIGITS = 2;

/**
 * Teintes extérieures ramenées à un libellé affichable unique.
 * Clés sans accent et en minuscules, comme les sorties de colorToken().
 */
const EXTERIOR_LABEL_ALIASES: Record<string, string> = {
  blanc: "Blanc",
  blanche: "Blanc",
  noir: "Noir",
  noire: "Noir",
  gris: "Gris",
  grise: "Gris",
  "gris creme": "Gris crème",
  "gris cendre": "Gris cendre",
  bleu: "Bleu",
  bleue: "Bleu",
  rouge: "Rouge",
  argent: "Argent",
  argente: "Argent",
  beige: "Beige",
  marron: "Marron",
  vert: "Vert",
  jaune: "Jaune",
  orange: "Orange",
  violet: "Violet",
};

/** Intérieurs ramenés à un libellé affichable unique. */
const INTERIOR_LABEL_ALIASES: Record<string, string> = {
  noir: "Noir",
  noire: "Noir",
  blanc: "Blanc",
  blanche: "Blanc",
  beige: "Beige",
  gris: "Gris",
  terracotta: "Terracotta",
  "terracotta (rouge)": "Terracotta",
  "rouge bordeaux": "Rouge bordeaux",
  bordeaux: "Rouge bordeaux",
  marron: "Marron",
  "a completer": INTERIOR_TO_COMPLETE,
  "a confirmer": INTERIOR_TO_COMPLETE,
};

/**
 * Teintes composées dont la couleur de base diffère du libellé.
 * Sert uniquement de repli quand exteriorColorBase est absent en base.
 */
const EXTERIOR_BASE_BY_LABEL: Record<string, string> = {
  "Gris crème": "Gris",
  "Gris cendre": "Gris",
  "Rouge bordeaux": "Rouge",
};

export type ConfigurationSourceVehicle = {
  vin: string | null;
  brand: string;
  model: string;
  variant?: string | null;
  year?: number | null;
  energy?: string | null;
  status: string;
  fleetType: string;
  exteriorColorBase: string | null;
  exteriorColorShade: string | null;
  interiorColor: string | null;
  /** Clé de la version déjà rattachée, quand le véhicule en a une. */
  versionKey?: string | null;
};

export type ConfigurationKey = {
  versionKey: string;
  exteriorColorBase: string;
  exteriorColorLabel: string;
  interiorColorLabel: string;
};

/** Clé de comparaison d'une couleur, partagée avec la palette du stock. */
export const colorToken = normalizeColorToken;

/** Majuscule initiale, le reste inchangé : repli pour une teinte hors table d'alias. */
function titleCase(value: string): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return trimmed;
  return trimmed[0].toUpperCase() + trimmed.slice(1);
}

/**
 * Libellé extérieur affichable. "Blanche" devient "Blanc", "Gris crème" reste
 * distinct de "Gris". Une teinte absente retombe sur la couleur de base, puis
 * sur la sentinelle "À confirmer".
 */
export function normalizeExteriorLabel(
  shade: string | null | undefined,
  base: string | null | undefined,
): string {
  const source = (shade ?? "").trim() || (base ?? "").trim();
  if (!source) return EXTERIOR_TO_CONFIRM;
  return EXTERIOR_LABEL_ALIASES[colorToken(source)] ?? titleCase(source);
}

/**
 * Couleur de base affichable, utilisée par les filtres de la vitrine.
 * exteriorColorBase est déjà normalisé en base ; le repli par libellé ne sert
 * qu'aux véhicules saisis sans couleur de base.
 */
export function normalizeExteriorBase(
  base: string | null | undefined,
  label: string,
): string {
  const source = (base ?? "").trim();
  if (source) return EXTERIOR_LABEL_ALIASES[colorToken(source)] ?? titleCase(source);
  return EXTERIOR_BASE_BY_LABEL[label] ?? label;
}

/** Libellé intérieur affichable. Un intérieur vide donne la sentinelle "À compléter". */
export function normalizeInteriorLabel(interiorColor: string | null | undefined): string {
  const source = (interiorColor ?? "").trim();
  if (!source) return INTERIOR_TO_COMPLETE;
  return INTERIOR_LABEL_ALIASES[colorToken(source)] ?? titleCase(source);
}

/** Clé de version de rattachement provisoire, pour un véhicule à la finition non relevée. */
export function provisionalVersionKey(brand: string, model: string): string {
  return [brand, model, PROVISIONAL_TRIM_KEY].map((part) => part.trim().toUpperCase()).join("|");
}

/** Vrai si la clé désigne une version de rattachement provisoire. */
export function isProvisionalVersionKey(versionKey: string): boolean {
  return versionKey.endsWith(`|${PROVISIONAL_TRIM_KEY}`);
}

/**
 * Clé de version calculée depuis le véhicule, à l'identique de versionKeyFor()
 * de stock-import.ts : MARQUE|MODELE|FINITION|ANNEE|ENERGIE.
 * Retourne null dès qu'une des trois dernières composantes manque.
 */
export function vehicleVersionKey(vehicle: ConfigurationSourceVehicle): string | null {
  const trim = (vehicle.variant ?? "").trim();
  const energy = (vehicle.energy ?? "").trim();
  if (!trim || !energy || energy === ENERGY_UNKNOWN) return null;
  if (!vehicle.year) return null;
  return [vehicle.brand, vehicle.model, trim, String(vehicle.year), energy]
    .map((part) => part.trim().toUpperCase())
    .join("|");
}

/** Vrai si le véhicule peut porter une configuration : stock showroom, identifié, non sorti. */
export function isConfigurableVehicle(vehicle: ConfigurationSourceVehicle): boolean {
  if (!(vehicle.vin ?? "").trim()) return false;
  if (vehicle.fleetType !== SHOWROOM_FLEET_TYPE) return false;
  if (INELIGIBLE_STATUSES.has(vehicle.status)) return false;
  return true;
}

/**
 * Clé de configuration du véhicule, ou null s'il n'est pas éligible.
 *
 * La version retenue est, dans l'ordre : celle déjà rattachée, celle calculable
 * depuis la fiche, puis une version de rattachement provisoire.
 */
export function resolveConfigurationKey(
  vehicle: ConfigurationSourceVehicle,
): ConfigurationKey | null {
  if (!isConfigurableVehicle(vehicle)) return null;

  const linkedKey = (vehicle.versionKey ?? "").trim().toUpperCase();
  const versionKey =
    linkedKey || vehicleVersionKey(vehicle) || provisionalVersionKey(vehicle.brand, vehicle.model);

  const exteriorColorLabel = normalizeExteriorLabel(
    vehicle.exteriorColorShade,
    vehicle.exteriorColorBase,
  );

  return {
    versionKey,
    exteriorColorBase: normalizeExteriorBase(vehicle.exteriorColorBase, exteriorColorLabel),
    exteriorColorLabel,
    interiorColorLabel: normalizeInteriorLabel(vehicle.interiorColor),
  };
}

/** Identifiant texte stable d'une clé, pour indexer et comparer deux configurations. */
export function configurationKeyId(key: ConfigurationKey): string {
  return [
    key.versionKey,
    key.exteriorColorBase,
    key.exteriorColorLabel,
    key.interiorColorLabel,
  ].join("||");
}

/** Pastilles de la vitrine : les hex dérivent de la palette existante, jamais redéfinis ici. */
export function configurationColorHex(key: ConfigurationKey): {
  exteriorHex: string;
  interiorHex: string;
} {
  return {
    exteriorHex: vehicleColorHex(key.exteriorColorLabel),
    interiorHex: vehicleColorHex(key.interiorColorLabel),
  };
}

export type ConfigurationGroup<T> = {
  key: ConfigurationKey;
  keyId: string;
  vehicles: T[];
};

/**
 * Regroupe des véhicules par configuration. Les véhicules non éligibles sont
 * renvoyés à part : aucun rattachement silencieux.
 */
export function groupVehiclesByConfiguration<T extends ConfigurationSourceVehicle>(
  vehicles: T[],
): { groups: ConfigurationGroup<T>[]; skipped: T[] } {
  const groups = new Map<string, ConfigurationGroup<T>>();
  const skipped: T[] = [];

  for (const vehicle of vehicles) {
    const key = resolveConfigurationKey(vehicle);
    if (!key) {
      skipped.push(vehicle);
      continue;
    }
    const keyId = configurationKeyId(key);
    const existing = groups.get(keyId);
    if (existing) existing.vehicles.push(vehicle);
    else groups.set(keyId, { key, keyId, vehicles: [vehicle] });
  }

  return { groups: [...groups.values()], skipped };
}

export type DefaultCandidate = {
  code: string;
  versionKey: string;
  exteriorColorLabel: string;
  vehicleCount: number;
};

/**
 * Codes des configurations montrées en premier, une par version.
 *
 * Classement déterministe, pour que deux exécutions donnent le même résultat :
 * le plus de véhicules en stock, puis la teinte la plus fréquente sur la version,
 * puis le code le plus petit.
 */
export function resolveDefaultConfigurationCodes(candidates: DefaultCandidate[]): Set<string> {
  const byVersion = new Map<string, DefaultCandidate[]>();
  for (const candidate of candidates) {
    const bucket = byVersion.get(candidate.versionKey);
    if (bucket) bucket.push(candidate);
    else byVersion.set(candidate.versionKey, [candidate]);
  }

  const defaults = new Set<string>();
  for (const bucket of byVersion.values()) {
    const labelCounts = new Map<string, number>();
    for (const candidate of bucket) {
      const token = colorToken(candidate.exteriorColorLabel);
      labelCounts.set(token, (labelCounts.get(token) ?? 0) + candidate.vehicleCount);
    }
    const labelCount = (candidate: DefaultCandidate) =>
      labelCounts.get(colorToken(candidate.exteriorColorLabel)) ?? 0;

    const winner = [...bucket].sort(
      (a, b) =>
        b.vehicleCount - a.vehicleCount ||
        labelCount(b) - labelCount(a) ||
        a.code.localeCompare(b.code),
    )[0];
    if (winner) defaults.add(winner.code);
  }

  return defaults;
}

/** Numéro d'un code de configuration, ou null si le code n'a pas la forme CFG-XX. */
export function parseConfigurationCode(code: string): number | null {
  const match = /^CFG-(\d{2,})$/.exec(code.trim().toUpperCase());
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

/** Code de configuration à partir de son numéro : 23 donne CFG-23. */
export function formatConfigurationCode(sequence: number): string {
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    throw new Error(`Numéro de configuration invalide : ${sequence}`);
  }
  return `${CODE_PREFIX}${String(sequence).padStart(CODE_DIGITS, "0")}`;
}

/** Prochain code libre, à partir des codes déjà attribués. */
export function nextConfigurationCode(existingCodes: readonly string[]): string {
  const highest = existingCodes.reduce((max, code) => {
    const sequence = parseConfigurationCode(code);
    return sequence && sequence > max ? sequence : max;
  }, 0);
  return formatConfigurationCode(highest + 1);
}

/**
 * Raison lisible de la non-éligibilité d'un véhicule, ou null s'il est éligible.
 * Partagée par le service et par le script de rattachement : un seul texte de référence.
 */
export function describeIneligibility(vehicle: ConfigurationSourceVehicle): string | null {
  if (!(vehicle.vin ?? "").trim()) return "VIN absent";
  if (vehicle.fleetType !== SHOWROOM_FLEET_TYPE) return `Hors showroom (parc ${vehicle.fleetType})`;
  if (INELIGIBLE_STATUSES.has(vehicle.status)) return `Sorti du stock (statut ${vehicle.status})`;
  return null;
}
