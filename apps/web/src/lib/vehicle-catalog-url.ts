/**
 * État de la vitrine porté par l'adresse.
 *
 * Un lien copié depuis la fiche doit rouvrir la même version, la même
 * configuration et le même mode. Les jetons de l'adresse sont donc stables et
 * indépendants de la langue affichée, et ce module est le seul endroit qui les
 * connaît. Fonctions pures : ni DOM, ni routeur.
 */

import type { CatalogSceneMode } from "@/lib/vehicle-catalog";

/** Version ouverte, identifiant d'URL de la version. */
export const CATALOG_PARAM_VERSION = "v";
/** Configuration ouverte, code du plan de prise de vue, ex. CFG-12. */
export const CATALOG_PARAM_CONFIGURATION = "c";
/** Mode de la scène. */
export const CATALOG_PARAM_MODE = "mode";
/** Filtre de teinte de la vitrine, appliqué avant toute ouverture de fiche. */
export const CATALOG_PARAM_COLOR = "couleur";

/** Jetons d'adresse des modes, tels qu'ils figurent au cahier des charges. */
const MODE_TO_TOKEN: Record<CatalogSceneMode, string> = {
  gallery: "galerie",
  spin: "360",
  interior: "interieur",
};

/** Jetons acceptés en lecture : les canoniques et leurs équivalents anglais. */
const TOKEN_TO_MODE: Record<string, CatalogSceneMode> = {
  galerie: "gallery",
  gallery: "gallery",
  "360": "spin",
  spin: "spin",
  interieur: "interior",
  interior: "interior",
};

export type CatalogUrlState = {
  versionSlug: string | null;
  configurationCode: string | null;
  mode: CatalogSceneMode | null;
  /** Teinte de base présélectionnée par le filtre de la vitrine. */
  exteriorColorBase: string | null;
};

export const EMPTY_CATALOG_URL_STATE: CatalogUrlState = {
  versionSlug: null,
  configurationCode: null,
  mode: null,
  exteriorColorBase: null,
};

/** Première valeur utile d'un paramètre, qu'il soit simple ou répété. */
function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return firstValue(value[0]);
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : null;
}

/** Mode reconnu, ou null : un jeton inconnu ne doit pas casser l'ouverture. */
export function parseSceneMode(value: string | string[] | undefined): CatalogSceneMode | null {
  const token = firstValue(value);
  if (!token) return null;
  return TOKEN_TO_MODE[token.toLowerCase()] ?? null;
}

export function sceneModeToken(mode: CatalogSceneMode): string {
  return MODE_TO_TOKEN[mode];
}

/**
 * État lu depuis les paramètres d'une adresse. Accepte la forme `searchParams`
 * d'un composant serveur Next comme un URLSearchParams du navigateur.
 */
export function parseCatalogUrlState(
  params:
    | Record<string, string | string[] | undefined>
    | URLSearchParams
    | null
    | undefined,
): CatalogUrlState {
  if (!params) return EMPTY_CATALOG_URL_STATE;

  const read = (key: string): string | string[] | undefined =>
    params instanceof URLSearchParams ? params.get(key) ?? undefined : params[key];

  const code = firstValue(read(CATALOG_PARAM_CONFIGURATION));

  return {
    versionSlug: firstValue(read(CATALOG_PARAM_VERSION)),
    configurationCode: code ? code.toUpperCase() : null,
    mode: parseSceneMode(read(CATALOG_PARAM_MODE)),
    exteriorColorBase: firstValue(read(CATALOG_PARAM_COLOR)),
  };
}

/**
 * Partie interrogation de l'adresse pour cet état, ou une chaîne vide quand il
 * n'y a rien à porter. L'ordre des paramètres est fixe pour que deux rendus
 * produisent le même lien.
 */
export function buildCatalogSearch(state: Partial<CatalogUrlState>): string {
  const params = new URLSearchParams();
  if (state.exteriorColorBase) params.set(CATALOG_PARAM_COLOR, state.exteriorColorBase);
  if (state.versionSlug) params.set(CATALOG_PARAM_VERSION, state.versionSlug);
  if (state.configurationCode) params.set(CATALOG_PARAM_CONFIGURATION, state.configurationCode);
  if (state.mode) params.set(CATALOG_PARAM_MODE, sceneModeToken(state.mode));

  const search = params.toString();
  return search ? `?${search}` : "";
}

/** Adresse relative complète, celle que la barre d'adresse doit afficher. */
export function buildCatalogHref(pathname: string, state: Partial<CatalogUrlState>): string {
  return `${pathname}${buildCatalogSearch(state)}`;
}
