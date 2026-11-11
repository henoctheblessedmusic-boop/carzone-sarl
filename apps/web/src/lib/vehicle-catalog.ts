/**
 * Modèle de vue de la vitrine publique : une carte par version, une configuration
 * choisie par le client.
 *
 * Règle d'or du projet, tenue ici et nulle part ailleurs : toutes les images
 * affichées pour une configuration proviennent de CETTE configuration. On
 * n'affiche jamais la photo d'une autre teinte, d'un autre intérieur ni d'un
 * autre modèle. Quand une image manque, on en affiche moins, jamais une fausse.
 *
 * Fonctions pures, sans accès base ni DOM : c'est la couche testée unitairement.
 */

import { CANVAS_SLOTS, type CanvasSlot } from "@/lib/vehicle-media";
import { normalizeColorToken, vehicleColorHex } from "@/lib/vehicle-colors";
import {
  INTERIOR_TO_COMPLETE,
  normalizeExteriorBase,
  normalizeExteriorLabel,
  normalizeInteriorLabel,
} from "@/lib/vehicle-configuration";

/**
 * Une version n'apparaît sur la vitrine que si elle a au moins une configuration
 * dont les médias sont validés.
 *
 * Reste à false tant que la séance photo du showroom n'a pas eu lieu : aucune
 * configuration n'est encore PUBLIE et la vitrine serait vide. À passer à true
 * dès que l'écran Médias aura publié les premières configurations, c'est la seule
 * ligne à changer. Les deux branches sont couvertes par les tests.
 */
export const VITRINE_REQUIRES_PUBLISHED_MEDIA = false;

/** Provenance d'une image. Elle gouverne l'avertissement affiché au client. */
export type CatalogMediaOrigin =
  /** Canevas, vue 360 ou panorama validés pour cette configuration exactement. */
  | "SHOWROOM"
  /** Photo d'un véhicule de cette configuration : exacte par construction, un VIN une configuration. */
  | "VEHICULE"
  /** Visuel constructeur de la version : teinte non contractuelle, hors canevas. */
  | "CONSTRUCTEUR";

/** Les trois modes de la scène. spin et interior dépendent des médias présents. */
export type CatalogSceneMode = "gallery" | "spin" | "interior";

export const CATALOG_SCENE_MODES: readonly CatalogSceneMode[] = ["gallery", "spin", "interior"];

export type CatalogImage = {
  url: string;
  /** Déclinaison mobile, quand le traitement serveur l'a produite. */
  urlMobile: string | null;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  origin: CatalogMediaOrigin;
};

export type CatalogCanvasPhoto = CatalogImage & { slot: CanvasSlot };

/**
 * Photos héritées d'un véhicule, dans l'ordre d'affichage. Elles décrivent bien
 * la configuration du véhicule puisqu'un VIN n'appartient qu'à une configuration,
 * mais elles ne suivent pas le canevas imposé : elles disparaissent dès que la
 * configuration a un canevas validé.
 */
export const VEHICLE_PHOTO_KEYS = [
  "principale",
  "exterieur",
  "arriere",
  "interieur",
  "sieges",
] as const;

export type VehiclePhotoKey = (typeof VEHICLE_PHOTO_KEYS)[number];

export type CatalogVehiclePhoto = CatalogImage & { key: VehiclePhotoKey };

/** Image de la scène : une vue du canevas, ou la photo du véhicule en stock. */
export type CatalogSceneImage = CatalogImage & {
  /** Clé stable pour React et pour la conservation de l'angle au changement de teinte. */
  key: string;
  /** Vue du canevas, ou null pour une photo hors canevas. */
  slot: CanvasSlot | null;
};

export type CatalogConfiguration = {
  /** Code du plan de prise de vue, ex. CFG-12. C'est l'identifiant partagé dans l'URL. */
  code: string;
  exteriorColorBase: string;
  exteriorColorLabel: string;
  exteriorHex: string;
  interiorColorLabel: string;
  interiorHex: string;
  isDefault: boolean;
  /** Vrai quand les médias de la configuration ont été validés par un humain. */
  isMediaPublished: boolean;
  /** Véhicules de cette configuration réellement disponibles et publiés. */
  availableCount: number;
  /** Canevas de cette configuration, dans l'ordre C01 à C10. Jamais complété d'ailleurs. */
  canvas: CatalogCanvasPhoto[];
  /** Vues 360 présentes. Le mode 360 exige le tour complet. */
  spinFrameCount: number;
  hasInteriorPanorama: boolean;
  /** Photos des véhicules de cette configuration, tant que le canevas n'est pas validé. */
  vehiclePhotos: CatalogVehiclePhoto[];
};

export type CatalogVersion = {
  /** Identifiant d'URL stable, dérivé de la version et non de la base. */
  slug: string;
  brand: string;
  model: string;
  trim: string | null;
  year: number | null;
  energy: string;
  vehicleType: string | null;
  transmission: string | null;
  /** Kilométrage relevé sur le stock, ou null quand il n'est pas renseigné. */
  mileage: number | null;
  /** Statut de stock, utilisé par la demande de cotation. */
  status: string;
  /** Visuel constructeur de la version : teinte non contractuelle, hors canevas. */
  manufacturerVisual: CatalogImage | null;
  configurations: CatalogConfiguration[];
};

/** Un tour complet, aligné sur SPIN_FRAME_COUNT du module médias. */
const FULL_SPIN_FRAME_COUNT = 36;

export function versionTitle(version: CatalogVersion): string {
  return [version.brand, version.model, version.trim].filter(Boolean).join(" ");
}

/** Identifiant d'URL d'une version : sans accent, sans ponctuation, stable. */
export function versionSlugOf(input: {
  brand: string;
  model: string;
  trim?: string | null;
  year?: number | null;
}): string {
  return [input.brand, input.model, input.trim, input.year]
    .filter((part) => part !== null && part !== undefined && String(part).trim() !== "")
    .map((part) =>
      String(part)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("-");
}

/** Véhicules disponibles sur l'ensemble des configurations de la version. */
export function versionAvailableCount(version: CatalogVersion): number {
  return version.configurations.reduce(
    (total, configuration) => total + configuration.availableCount,
    0,
  );
}

export function totalAvailableCount(versions: readonly CatalogVersion[]): number {
  return versions.reduce((total, version) => total + versionAvailableCount(version), 0);
}

/**
 * Vrai si la version peut être montrée sur la vitrine.
 * Une version sans aucun véhicule disponible n'a rien à montrer. Le reste dépend
 * de VITRINE_REQUIRES_PUBLISHED_MEDIA.
 */
export function isVersionVisible(
  version: CatalogVersion,
  requirePublishedMedia: boolean = VITRINE_REQUIRES_PUBLISHED_MEDIA,
): boolean {
  if (versionAvailableCount(version) === 0) return false;
  if (!requirePublishedMedia) return true;
  return version.configurations.some(
    (configuration) => configuration.isMediaPublished && configuration.canvas.length > 0,
  );
}

export function visibleVersions(
  versions: readonly CatalogVersion[],
  requirePublishedMedia: boolean = VITRINE_REQUIRES_PUBLISHED_MEDIA,
): CatalogVersion[] {
  return versions.filter((version) => isVersionVisible(version, requirePublishedMedia));
}

export type CatalogExteriorOption = {
  label: string;
  base: string;
  hex: string;
  availableCount: number;
  /** Nombre d'intérieurs proposés pour cette teinte. */
  interiorCount: number;
};

/**
 * Pastilles de teintes extérieures de la version, dans l'ordre : la plus fournie
 * d'abord, puis par libellé, pour que deux rendus donnent le même ordre.
 */
export function exteriorOptionsOf(version: CatalogVersion): CatalogExteriorOption[] {
  const byLabel = new Map<string, CatalogExteriorOption>();

  for (const configuration of version.configurations) {
    const token = normalizeColorToken(configuration.exteriorColorLabel);
    const existing = byLabel.get(token);
    if (existing) {
      existing.availableCount += configuration.availableCount;
      existing.interiorCount += 1;
      continue;
    }
    byLabel.set(token, {
      label: configuration.exteriorColorLabel,
      base: configuration.exteriorColorBase,
      hex: configuration.exteriorHex,
      availableCount: configuration.availableCount,
      interiorCount: 1,
    });
  }

  return [...byLabel.values()].sort(
    (a, b) => b.availableCount - a.availableCount || a.label.localeCompare(b.label, "fr"),
  );
}

export type CatalogInteriorOption = {
  label: string;
  hex: string;
  availableCount: number;
  /** Configuration atteinte par ce choix. */
  code: string;
  /** Vrai pour la sentinelle "À compléter" : intérieur non relevé sur le véhicule. */
  isToComplete: boolean;
};

/**
 * Intérieurs qui existent pour cette teinte extérieure, et eux seuls.
 * C'est ce filtrage qui garantit qu'un client ne peut pas composer une
 * configuration absente du stock.
 */
export function interiorOptionsFor(
  version: CatalogVersion,
  exteriorLabel: string,
): CatalogInteriorOption[] {
  const wanted = normalizeColorToken(exteriorLabel);
  return version.configurations
    .filter((configuration) => normalizeColorToken(configuration.exteriorColorLabel) === wanted)
    .map((configuration) => ({
      label: configuration.interiorColorLabel,
      hex: configuration.interiorHex,
      availableCount: configuration.availableCount,
      code: configuration.code,
      isToComplete:
        normalizeColorToken(configuration.interiorColorLabel) ===
        normalizeColorToken(INTERIOR_TO_COMPLETE),
    }))
    .sort((a, b) => b.availableCount - a.availableCount || a.label.localeCompare(b.label, "fr"));
}

/**
 * Configuration montrée en premier : celle marquée par défaut en base, sinon la
 * plus fournie, sinon le code le plus petit. Déterministe.
 */
export function defaultConfigurationOf(version: CatalogVersion): CatalogConfiguration | null {
  if (version.configurations.length === 0) return null;
  const flagged = version.configurations.find((configuration) => configuration.isDefault);
  if (flagged) return flagged;
  return [...version.configurations].sort(
    (a, b) => b.availableCount - a.availableCount || a.code.localeCompare(b.code),
  )[0];
}

export function findConfigurationByCode(
  version: CatalogVersion,
  code: string | null | undefined,
): CatalogConfiguration | null {
  if (!code) return null;
  const wanted = code.trim().toUpperCase();
  return version.configurations.find((configuration) => configuration.code === wanted) ?? null;
}

/**
 * Configuration correspondant à une teinte, et si possible à un intérieur.
 * Sans intérieur compatible, la configuration la plus fournie de la teinte gagne :
 * c'est ce qui conserve un choix utile quand le client change de couleur.
 */
export function findConfigurationByColors(
  version: CatalogVersion,
  exteriorLabel: string,
  interiorLabel?: string | null,
): CatalogConfiguration | null {
  const options = interiorOptionsFor(version, exteriorLabel);
  if (options.length === 0) return null;

  if (interiorLabel) {
    const wanted = normalizeColorToken(interiorLabel);
    const exact = options.find((option) => normalizeColorToken(option.label) === wanted);
    if (exact) return findConfigurationByCode(version, exact.code);
  }

  return findConfigurationByCode(version, options[0].code);
}

/**
 * Configuration à ouvrir : le code de l'URL d'abord, puis la teinte présélectionnée
 * par le filtre de la vitrine, puis la configuration par défaut.
 */
export function resolveInitialConfiguration(
  version: CatalogVersion,
  selection: { code?: string | null; exteriorColorBase?: string | null } = {},
): CatalogConfiguration | null {
  const byCode = findConfigurationByCode(version, selection.code);
  if (byCode) return byCode;

  const base = (selection.exteriorColorBase ?? "").trim();
  if (base) {
    const wanted = normalizeColorToken(base);
    const matching = version.configurations
      .filter((configuration) => normalizeColorToken(configuration.exteriorColorBase) === wanted)
      .sort((a, b) => b.availableCount - a.availableCount || a.code.localeCompare(b.code));
    if (matching.length > 0) return matching[0];
  }

  return defaultConfigurationOf(version);
}

/**
 * Changement de teinte extérieure : l'intérieur courant est conservé quand il
 * existe pour la nouvelle teinte, sinon on prend l'intérieur le plus fourni.
 */
export function configurationForExterior(
  version: CatalogVersion,
  exteriorLabel: string,
  currentInteriorLabel?: string | null,
): CatalogConfiguration | null {
  return findConfigurationByColors(version, exteriorLabel, currentInteriorLabel);
}

/**
 * Modes que la vitrine sait rendre aujourd'hui.
 *
 * Point d'extension de la scène : la vue 360 et le panorama intérieur sont
 * décrits de bout en bout (médias, URL, sélecteurs, mesure) mais ne sont pas
 * encore rendus, parce qu'aucune configuration n'a de média et qu'aucune
 * bibliothèque de panorama n'est embarquée. Ajouter "spin" puis "interior" ici,
 * et le mode correspondant dans VehicleScene, suffit à les activer.
 */
export const RENDERABLE_SCENE_MODES: readonly CatalogSceneMode[] = ["gallery"];

/** Vrai si la configuration possède les médias du mode, rendu mis de côté. */
export function hasSceneModeMedia(
  mode: CatalogSceneMode,
  configuration: CatalogConfiguration | null,
): boolean {
  if (mode === "gallery") return sceneImagesOf(configuration).length > 0;
  if (!configuration) return false;
  if (mode === "spin") return configuration.spinFrameCount >= FULL_SPIN_FRAME_COUNT;
  return configuration.hasInteriorPanorama;
}

/** Modes réellement atteignables : rendus par la vitrine et servis par les médias. */
export function availableSceneModes(
  configuration: CatalogConfiguration | null,
): CatalogSceneMode[] {
  return RENDERABLE_SCENE_MODES.filter((mode) => hasSceneModeMedia(mode, configuration));
}

export type SceneModeOffer = {
  mode: CatalogSceneMode;
  /** Faux quand le mode est annoncé mais pas encore servi : bouton désactivé. */
  isAvailable: boolean;
};

/** Les trois modes dans l'ordre, avec leur disponibilité, pour les onglets de la scène. */
export function sceneModeOffers(configuration: CatalogConfiguration | null): SceneModeOffer[] {
  const available = availableSceneModes(configuration);
  return CATALOG_SCENE_MODES.map((mode) => ({ mode, isAvailable: available.includes(mode) }));
}

/**
 * Mode effectif : le mode demandé s'il est atteignable, sinon la vue 360 quand
 * le tour complet existe, sinon la galerie.
 */
export function clampSceneMode(
  mode: CatalogSceneMode | null | undefined,
  configuration: CatalogConfiguration | null,
): CatalogSceneMode {
  const modes = availableSceneModes(configuration);
  if (mode && modes.includes(mode)) return mode;
  if (modes.includes("spin")) return "spin";
  return "gallery";
}

/**
 * Images de la scène pour cette configuration, dans l'ordre du canevas.
 * À défaut de canevas validé, la photo du véhicule en stock, qui décrit bien
 * cette configuration puisqu'un VIN n'appartient qu'à une configuration.
 * À défaut de tout, une liste vide : c'est l'état vide, pas une fausse photo.
 */
export function sceneImagesOf(configuration: CatalogConfiguration | null): CatalogSceneImage[] {
  if (!configuration) return [];

  if (configuration.canvas.length > 0) {
    const bySlot = new Map(configuration.canvas.map((photo) => [photo.slot, photo]));
    return CANVAS_SLOTS.filter((slot) => bySlot.has(slot)).map((slot) => {
      const photo = bySlot.get(slot) as CatalogCanvasPhoto;
      return { ...photo, key: slot, slot };
    });
  }

  return configuration.vehiclePhotos.map((photo) => ({ ...photo, slot: null }));
}

export type CatalogSceneFallback =
  | { kind: "NONE" }
  | { kind: "MANUFACTURER"; image: CatalogImage }
  | { kind: "EMPTY" };

/**
 * Ce qu'il faut montrer quand la configuration n'a aucune image : le visuel
 * constructeur de la version, signalé comme teinte non contractuelle, ou un
 * état vide. Jamais l'image d'une autre configuration.
 */
export function sceneFallbackOf(
  version: CatalogVersion,
  configuration: CatalogConfiguration | null,
): CatalogSceneFallback {
  if (sceneImagesOf(configuration).length > 0) return { kind: "NONE" };
  if (version.manufacturerVisual) {
    return { kind: "MANUFACTURER", image: version.manufacturerVisual };
  }
  return { kind: "EMPTY" };
}

/**
 * Conserve l'angle au changement de configuration : la même vue du canevas si
 * la nouvelle configuration la possède, sinon sa première vue.
 */
export function preserveSceneKey(
  previousKey: string | null | undefined,
  configuration: CatalogConfiguration | null,
): string | null {
  const images = sceneImagesOf(configuration);
  if (images.length === 0) return null;
  if (previousKey && images.some((image) => image.key === previousKey)) return previousKey;
  return images[0].key;
}

/** Image de la carte vitrine : le C01 de la configuration, sinon le repli de la version. */
export function cardImageOf(
  version: CatalogVersion,
  configuration: CatalogConfiguration | null,
): CatalogImage | null {
  const canvasCover = configuration?.canvas.find((photo) => photo.slot === "C01");
  if (canvasCover) return canvasCover;
  const vehiclePhoto = configuration?.vehiclePhotos[0];
  if (vehiclePhoto) return vehiclePhoto;
  return version.manufacturerVisual;
}

/** Teintes de base présentes dans le catalogue, pour le filtre de la vitrine. */
export function exteriorBaseFilterOptions(versions: readonly CatalogVersion[]): string[] {
  const bases = new Map<string, string>();
  for (const version of versions) {
    for (const configuration of version.configurations) {
      const token = normalizeColorToken(configuration.exteriorColorBase);
      if (!bases.has(token)) bases.set(token, configuration.exteriorColorBase);
    }
  }
  return [...bases.values()].sort((a, b) => a.localeCompare(b, "fr"));
}

/** Vrai si la version propose au moins une configuration de cette teinte de base. */
export function versionHasExteriorBase(version: CatalogVersion, base: string): boolean {
  const wanted = normalizeColorToken(base);
  return version.configurations.some(
    (configuration) => normalizeColorToken(configuration.exteriorColorBase) === wanted,
  );
}

/**
 * Forme héritée d'un véhicule unique, encore utilisée par l'accueil et le
 * diaporama. Conservée pour que ces deux écrans continuent de fonctionner
 * pendant que la vitrine passe au modèle par configuration.
 */
export type LegacyCatalogVehicle = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  energy: string;
  vehicleType: string | null;
  transmission: string | null;
  color: string | null;
  interiorColor?: string | null;
  mileage: number;
  priceXof: number;
  priceToConfirm?: boolean;
  status: string;
  mainPhotoUrl: string | null;
  interiorPhotoUrl: string | null;
  exteriorPhotoUrl: string | null;
  rearPhotoUrl: string | null;
  seatsPhotoUrl: string | null;
  photosVerified?: boolean;
};

/** Code porté par la configuration d'un véhicule isolé : il n'a pas de code de plan. */
export const SINGLE_VEHICLE_CONFIGURATION_CODE = "VEHICULE";

/**
 * Version à une seule configuration, construite depuis un véhicule isolé.
 *
 * Ses photos sont celles de ce véhicule, donc de cette configuration : la règle
 * d'or tient. Les vues d'habitacle restent conditionnées à photosVerified.
 */
export function catalogVersionFromVehicle(vehicle: LegacyCatalogVehicle): CatalogVersion {
  const exteriorColorLabel = normalizeExteriorLabel(vehicle.color, vehicle.color);
  const interiorColorLabel = normalizeInteriorLabel(vehicle.interiorColor);

  const photos: CatalogVehiclePhoto[] = [];
  const push = (key: VehiclePhotoKey, url: string | null | undefined) => {
    if (!url) return;
    photos.push({
      key,
      url,
      urlMobile: null,
      width: null,
      height: null,
      blurDataUrl: null,
      origin: "VEHICULE",
    });
  };

  push("principale", vehicle.mainPhotoUrl);
  push("exterieur", vehicle.exteriorPhotoUrl);
  push("arriere", vehicle.rearPhotoUrl);
  if (vehicle.photosVerified) {
    push("interieur", vehicle.interiorPhotoUrl);
    push("sieges", vehicle.seatsPhotoUrl);
  }

  return {
    slug: versionSlugOf({
      brand: vehicle.brand,
      model: vehicle.model,
      trim: vehicle.variant,
      year: vehicle.year,
    }),
    brand: vehicle.brand,
    model: vehicle.model,
    trim: vehicle.variant,
    year: vehicle.year,
    energy: vehicle.energy,
    vehicleType: vehicle.vehicleType,
    transmission: vehicle.transmission,
    mileage: vehicle.mileage,
    status: vehicle.status,
    manufacturerVisual: null,
    configurations: [
      {
        code: SINGLE_VEHICLE_CONFIGURATION_CODE,
        exteriorColorBase: normalizeExteriorBase(vehicle.color, exteriorColorLabel),
        exteriorColorLabel,
        exteriorHex: vehicleColorHex(exteriorColorLabel),
        interiorColorLabel,
        interiorHex: vehicleColorHex(interiorColorLabel),
        isDefault: true,
        isMediaPublished: false,
        availableCount: 1,
        canvas: [],
        spinFrameCount: 0,
        hasInteriorPanorama: false,
        vehiclePhotos: photos,
      },
    ],
  };
}
