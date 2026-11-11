/**
 * Chargement de la vitrine : une version par carte, ses configurations, et les
 * seules images qui décrivent réellement chaque configuration.
 *
 * Lecture seule. Toute la logique d'affichage vit dans `@/lib/vehicle-catalog`,
 * qui est testé unitairement : ce module se limite à interroger la base et à
 * remplir le modèle de vue.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findCatalogSpecs } from "@/lib/vehicle-catalog-specs";
import { CANVAS_SLOTS, type CanvasSlot } from "@/lib/vehicle-media";
import {
  versionSlugOf,
  type CatalogCanvasPhoto,
  type CatalogConfiguration,
  type CatalogImage,
  type CatalogVehiclePhoto,
  type CatalogVersion,
} from "@/lib/vehicle-catalog";

/** Statuts de stock montrés sur la vitrine. */
const SHOWROOM_STATUSES = ["EN_MAGASIN", "EN_STOCK"];
/** Énergie enregistrée par l'import quand la colonne est vide. */
const ENERGY_UNKNOWN = "NON_RENSEIGNEE";

/**
 * Véhicule présentable au public : en stock, publié, du parc de vente, et dont
 * la fiche est assez complète pour nommer une version.
 */
const PUBLISHED_VEHICLE_WHERE = {
  status: { in: SHOWROOM_STATUSES },
  publishedOnSite: true,
  fleetType: "SHOWROOM",
  variant: { not: null },
  year: { not: null },
  energy: { not: ENERGY_UNKNOWN },
} satisfies Prisma.VehicleWhereInput;

const CANVAS_SLOT_SET: ReadonlySet<string> = new Set(CANVAS_SLOTS);

const CONFIGURATION_SELECTION = {
  code: true,
  exteriorColorBase: true,
  exteriorColorLabel: true,
  exteriorHex: true,
  interiorColorLabel: true,
  interiorHex: true,
  isDefault: true,
  mediaStatus: true,
  version: {
    select: {
      id: true,
      brand: true,
      model: true,
      trim: true,
      year: true,
      energy: true,
    },
  },
  /** Les 36 vues 360 ne sont pas chargées ici : seul leur décompte sert à la vitrine. */
  media: {
    where: { kind: { in: ["CANVAS", "INTERIOR_PANORAMA"] } },
    select: {
      kind: true,
      slot: true,
      url: true,
      urlMobile: true,
      width: true,
      height: true,
      blurDataUrl: true,
    },
  },
  vehicles: {
    where: PUBLISHED_VEHICLE_WHERE,
    select: {
      id: true,
      vehicleType: true,
      transmission: true,
      mileage: true,
      status: true,
      mainPhotoUrl: true,
      exteriorPhotoUrl: true,
      rearPhotoUrl: true,
      interiorPhotoUrl: true,
      photosVerified: true,
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.VehicleConfigurationSelect;

type SelectedConfiguration = Prisma.VehicleConfigurationGetPayload<{
  select: typeof CONFIGURATION_SELECTION;
}>;

type SelectedVehicle = SelectedConfiguration["vehicles"][number];

/** La vue « sièges » dérive de la photo d'intérieur par convention de nommage. */
function toSeatsPhotoUrl(interiorPhotoUrl: string | null): string | null {
  if (!interiorPhotoUrl || !interiorPhotoUrl.includes("-interior.")) return null;
  return interiorPhotoUrl.replace("-interior.", "-seats.");
}

/**
 * Photos héritées des véhicules de la configuration, sans doublon.
 *
 * Elles sont exactes pour cette configuration : un VIN n'appartient qu'à une
 * configuration. Les vues d'habitacle restent conditionnées à photosVerified,
 * comme ailleurs dans le projet, parce qu'une photo d'intérieur non vérifiée est
 * la plus susceptible d'avoir été prise sur un autre véhicule.
 */
function vehiclePhotosOf(vehicles: readonly SelectedVehicle[]): CatalogVehiclePhoto[] {
  const photos: CatalogVehiclePhoto[] = [];
  const seenUrls = new Set<string>();

  const push = (key: CatalogVehiclePhoto["key"], url: string | null) => {
    if (!url || seenUrls.has(url)) return;
    if (photos.some((photo) => photo.key === key)) return;
    seenUrls.add(url);
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

  for (const vehicle of vehicles) {
    push("principale", vehicle.mainPhotoUrl);
    push("exterieur", vehicle.exteriorPhotoUrl);
    push("arriere", vehicle.rearPhotoUrl);
    if (vehicle.photosVerified) {
      push("interieur", vehicle.interiorPhotoUrl);
      push("sieges", toSeatsPhotoUrl(vehicle.interiorPhotoUrl));
    }
  }

  return photos;
}

/** Canevas de la configuration, uniquement quand ses médias ont été validés. */
function canvasOf(
  configuration: SelectedConfiguration,
  isMediaPublished: boolean,
): CatalogCanvasPhoto[] {
  if (!isMediaPublished) return [];

  const bySlot = new Map<CanvasSlot, CatalogCanvasPhoto>();
  for (const media of configuration.media) {
    if (media.kind !== "CANVAS" || !CANVAS_SLOT_SET.has(media.slot)) continue;
    const slot = media.slot as CanvasSlot;
    if (bySlot.has(slot)) continue;
    bySlot.set(slot, {
      slot,
      url: media.url,
      urlMobile: media.urlMobile,
      width: media.width,
      height: media.height,
      blurDataUrl: media.blurDataUrl,
      origin: "SHOWROOM",
    });
  }

  return CANVAS_SLOTS.filter((slot) => bySlot.has(slot)).map(
    (slot) => bySlot.get(slot) as CatalogCanvasPhoto,
  );
}

function normalizeModel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

/**
 * Visuel constructeur de la version, teinte non contractuelle.
 *
 * Le rapprochement du catalogue constructeur est volontairement plus strict
 * qu'ailleurs : égalité exacte du nom de modèle. findCatalogSpecs() accepte des
 * rapprochements partiels qui, sur la vitrine, finiraient par montrer la photo
 * d'un autre modèle. Aucun repli générique n'est utilisé ici.
 */
function manufacturerVisualOf(
  brand: string,
  model: string,
  trim: string | null,
): CatalogImage | null {
  const entry = findCatalogSpecs(brand, model, trim);
  if (!entry) return null;
  if (normalizeModel(entry.model) !== normalizeModel(model)) return null;

  const url = entry.photos.mainPhotoUrl || entry.photos.exteriorPhotoUrl;
  if (!url) return null;

  return {
    url,
    urlMobile: null,
    width: null,
    height: null,
    blurDataUrl: null,
    origin: "CONSTRUCTEUR",
  };
}

/** Nombre de vues 360 par configuration, compté sans charger les images. */
async function loadSpinFrameCounts(): Promise<Map<string, number>> {
  const rows = await prisma.vehicleMedia.groupBy({
    by: ["configurationId"],
    where: { kind: "SPIN_EXTERIOR" },
    _count: { _all: true },
  });

  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.configurationId, row._count._all);
  return counts;
}

function toCatalogConfiguration(
  configuration: SelectedConfiguration,
  spinFrameCount: number,
): CatalogConfiguration {
  const isMediaPublished = configuration.mediaStatus === "PUBLIE";
  const canvas = canvasOf(configuration, isMediaPublished);

  return {
    code: configuration.code,
    exteriorColorBase: configuration.exteriorColorBase,
    exteriorColorLabel: configuration.exteriorColorLabel,
    exteriorHex: configuration.exteriorHex,
    interiorColorLabel: configuration.interiorColorLabel,
    interiorHex: configuration.interiorHex,
    isDefault: configuration.isDefault,
    isMediaPublished,
    availableCount: configuration.vehicles.length,
    canvas,
    spinFrameCount: isMediaPublished ? spinFrameCount : 0,
    hasInteriorPanorama:
      isMediaPublished && configuration.media.some((media) => media.kind === "INTERIOR_PANORAMA"),
    // Le canevas validé remplace les photos héritées : on ne mélange pas les deux.
    vehiclePhotos: canvas.length > 0 ? [] : vehiclePhotosOf(configuration.vehicles),
  };
}

/**
 * Versions de la vitrine, triées de la plus récente à la plus ancienne.
 * Une version sans configuration disponible n'est pas renvoyée.
 */
export async function loadCatalogVersions(): Promise<CatalogVersion[]> {
  const [configurations, spinCounts] = await Promise.all([
    prisma.vehicleConfiguration.findMany({
      where: { vehicles: { some: PUBLISHED_VEHICLE_WHERE } },
      select: { id: true, ...CONFIGURATION_SELECTION },
      orderBy: { code: "asc" },
    }),
    loadSpinFrameCounts(),
  ]);

  const byVersionId = new Map<string, CatalogVersion>();

  for (const configuration of configurations) {
    const version = configuration.version;
    let catalogVersion = byVersionId.get(version.id);

    if (!catalogVersion) {
      const firstVehicle = configuration.vehicles[0];
      catalogVersion = {
        slug: versionSlugOf({
          brand: version.brand,
          model: version.model,
          trim: version.trim,
          year: version.year,
        }),
        brand: version.brand,
        model: version.model,
        trim: version.trim,
        year: version.year,
        energy: version.energy ?? "",
        vehicleType: firstVehicle?.vehicleType ?? null,
        transmission: firstVehicle?.transmission ?? null,
        mileage: firstVehicle?.mileage ?? null,
        status: firstVehicle?.status ?? "EN_MAGASIN",
        manufacturerVisual: manufacturerVisualOf(version.brand, version.model, version.trim),
        configurations: [],
      };
      byVersionId.set(version.id, catalogVersion);
    }

    catalogVersion.configurations.push(
      toCatalogConfiguration(configuration, spinCounts.get(configuration.id) ?? 0),
    );
  }

  return [...byVersionId.values()]
    .filter((version) => version.configurations.length > 0)
    .sort(
      (a, b) =>
        (b.year ?? 0) - (a.year ?? 0) ||
        a.brand.localeCompare(b.brand, "fr") ||
        a.model.localeCompare(b.model, "fr"),
    );
}
