import { buildStandardTechnicalSheet, type TechnicalSheet } from "@/lib/tech-sheet-generator";
import { findCatalogSpecs } from "@/lib/vehicle-catalog-specs";

type DisplayPhotoVehicle = {
  brand: string;
  model: string;
  variant?: string | null;
  year?: number | null;
  energy?: string | null;
  vehicleType?: string | null;
  transmission?: string | null;
  color?: string | null;
  description?: string | null;
  mainPhotoUrl?: string | null;
  interiorPhotoUrl?: string | null;
  exteriorPhotoUrl?: string | null;
  rearPhotoUrl?: string | null;
  photosVerified?: boolean | null;
  technicalSheetJson?: string | null;
  techSheetConfirmed?: boolean | null;
};

function normalizeModel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

function parseStoredSheet(json?: string | null): TechnicalSheet | null {
  if (!json) return null;
  try {
    const sheet = JSON.parse(json) as TechnicalSheet;
    return sheet && sheet.title ? sheet : null;
  } catch {
    return null;
  }
}

/**
 * Photo affichée sur la carte stock.
 * Priorité aux photos réelles du véhicule. La fiche technique n'est utilisée
 * que si le modèle correspond exactement au catalogue, pour ne jamais afficher
 * la photo d'un autre modèle.
 */
export function resolveVehicleDisplayPhoto(vehicle: DisplayPhotoVehicle): string | null {
  if (vehicle.mainPhotoUrl) return vehicle.mainPhotoUrl;

  const storedSheet = parseStoredSheet(vehicle.technicalSheetJson);
  const catalog = findCatalogSpecs(vehicle.brand, vehicle.model, vehicle.variant);
  const exactCatalogMatch =
    Boolean(catalog) &&
    normalizeModel(catalog?.model ?? "") === normalizeModel(vehicle.model);

  const sheet =
    storedSheet ||
    (exactCatalogMatch
      ? buildStandardTechnicalSheet({
          brand: vehicle.brand,
          model: vehicle.model,
          variant: vehicle.variant,
          year: vehicle.year,
          energy: vehicle.energy,
          vehicleType: vehicle.vehicleType,
          transmission: vehicle.transmission,
          color: vehicle.color,
          description: vehicle.description,
          mainPhotoUrl: vehicle.mainPhotoUrl,
          interiorPhotoUrl: vehicle.interiorPhotoUrl,
          exteriorPhotoUrl: vehicle.exteriorPhotoUrl,
          rearPhotoUrl: vehicle.rearPhotoUrl,
        })
      : null);

  return (
    vehicle.exteriorPhotoUrl ||
    (vehicle.photosVerified ? vehicle.interiorPhotoUrl : null) ||
    vehicle.rearPhotoUrl ||
    sheet?.mainPhotoUrl ||
    sheet?.exteriorPhotoUrl ||
    (vehicle.photosVerified ? sheet?.interiorPhotoUrl : null) ||
    sheet?.rearPhotoUrl ||
    null
  );
}
