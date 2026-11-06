import { prisma } from "@/lib/prisma";
import { normalizeVehicleModelName } from "@/lib/vehicle-model-tech-sheet";
import type { TechnicalSheet } from "@/lib/tech-sheet-generator";

type PhotoFields = {
  mainPhotoUrl: string | null;
  interiorPhotoUrl: string | null;
  exteriorPhotoUrl: string | null;
  rearPhotoUrl: string | null;
};

/**
 * Complète les photos manquantes d'un véhicule à partir :
 * 1. d'un autre véhicule du même modèle (même marque, nom de modèle normalisé) ;
 * 2. de la fiche technique (photos officielles constructeur ou catalogue).
 *
 * Les photos déjà renseignées ne sont jamais remplacées.
 */
export async function inheritVehiclePhotos(
  vehicleId: string,
  sheet?: Pick<TechnicalSheet, "mainPhotoUrl" | "interiorPhotoUrl" | "exteriorPhotoUrl" | "rearPhotoUrl"> | null
): Promise<PhotoFields | null> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: {
      id: true,
      brand: true,
      model: true,
      mainPhotoUrl: true,
      interiorPhotoUrl: true,
      exteriorPhotoUrl: true,
      rearPhotoUrl: true,
    },
  });
  if (!vehicle) return null;

  if (
    vehicle.mainPhotoUrl &&
    vehicle.interiorPhotoUrl &&
    vehicle.exteriorPhotoUrl &&
    vehicle.rearPhotoUrl
  ) {
    return {
      mainPhotoUrl: vehicle.mainPhotoUrl,
      interiorPhotoUrl: vehicle.interiorPhotoUrl,
      exteriorPhotoUrl: vehicle.exteriorPhotoUrl,
      rearPhotoUrl: vehicle.rearPhotoUrl,
    };
  }

  const candidates = await prisma.vehicle.findMany({
    where: {
      id: { not: vehicle.id },
      brand: { equals: vehicle.brand, mode: "insensitive" },
      mainPhotoUrl: { not: null },
    },
    select: {
      model: true,
      mainPhotoUrl: true,
      interiorPhotoUrl: true,
      exteriorPhotoUrl: true,
      rearPhotoUrl: true,
    },
    take: 100,
    orderBy: { updatedAt: "desc" },
  });

  const normalizedModel = normalizeVehicleModelName(vehicle.model);
  const sourceVehicle =
    candidates.find((candidate) => normalizeVehicleModelName(candidate.model) === normalizedModel) || null;

  const sourceSheet = sheet || null;
  const resolved: PhotoFields = {
    mainPhotoUrl: vehicle.mainPhotoUrl || sourceVehicle?.mainPhotoUrl || sourceSheet?.mainPhotoUrl || null,
    interiorPhotoUrl:
      vehicle.interiorPhotoUrl || sourceVehicle?.interiorPhotoUrl || sourceSheet?.interiorPhotoUrl || null,
    exteriorPhotoUrl:
      vehicle.exteriorPhotoUrl || sourceVehicle?.exteriorPhotoUrl || sourceSheet?.exteriorPhotoUrl || null,
    rearPhotoUrl:
      vehicle.rearPhotoUrl || sourceVehicle?.rearPhotoUrl || sourceSheet?.rearPhotoUrl || null,
  };

  if (!resolved.mainPhotoUrl) return resolved;

  await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: {
      ...(vehicle.mainPhotoUrl ? {} : { mainPhotoUrl: resolved.mainPhotoUrl }),
      ...(vehicle.interiorPhotoUrl ? {} : { interiorPhotoUrl: resolved.interiorPhotoUrl }),
      ...(vehicle.exteriorPhotoUrl ? {} : { exteriorPhotoUrl: resolved.exteriorPhotoUrl }),
      ...(vehicle.rearPhotoUrl ? {} : { rearPhotoUrl: resolved.rearPhotoUrl }),
    },
  });

  return resolved;
}
