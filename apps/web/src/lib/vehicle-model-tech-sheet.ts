import { prisma } from "@/lib/prisma";
import { generateTechSheetWithAI, isChineseBrand } from "@/lib/openai-tech-sheet";
import {
  buildStandardTechnicalSheet,
  resolveVehicleTechSheet,
  type TechnicalSheet,
} from "@/lib/tech-sheet-generator";

type VehicleLike = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  energy: string;
  technicalSheetJson: string | null;
  techSheetConfirmed: boolean;
};

function parseSheet(json: string | null | undefined): TechnicalSheet | null {
  if (!json) return null;
  try {
    const sheet = JSON.parse(json) as TechnicalSheet;
    if (sheet?.title && (sheet.motorisation || sheet.dimensions)) return sheet;
  } catch {
    // ignore
  }
  return null;
}

/** Clé de modèle : une fiche unique par marque / modèle / version / année / énergie. */
export function vehicleTechSheetModelKey(vehicle: {
  brand: string;
  model: string;
  variant?: string | null;
  year?: number | null;
  energy?: string | null;
}): string {
  return [
    vehicle.brand.trim().toUpperCase(),
    vehicle.model.trim().toUpperCase(),
    (vehicle.variant || "").trim().toUpperCase(),
    vehicle.year ? String(vehicle.year) : "",
    (vehicle.energy || "").trim().toUpperCase(),
  ].join("|");
}

export async function ensureVehicleTechSheet(
  vehicleId: string,
  options: { preferDeepSeek?: boolean; actorName?: string; force?: boolean } = {}
) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      techSheetModel: true,
    },
  });
  if (!vehicle) throw new Error("Véhicule introuvable.");

  const modelKey = vehicleTechSheetModelKey(vehicle);
  const ownSheet = parseSheet(vehicle.technicalSheetJson);
  const cachedModel =
    vehicle.techSheetModel ||
    (await prisma.vehicleModelTechSheet.findUnique({ where: { modelKey } }));

  // 1. Fiche de modèle déjà disponible : on la réutilise sans nouvel appel IA.
  if (cachedModel && !options.force) {
    const cachedSheet = parseSheet(cachedModel.sheetJson);
    if (cachedSheet) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          technicalSheetJson: JSON.stringify(cachedSheet),
          hasTechSheet: true,
          techSheetModelId: cachedModel.id,
          techSheetConfirmed: cachedModel.status === "APPROVED",
          techSheetConfirmedAt: cachedModel.status === "APPROVED" ? cachedModel.approvedAt : null,
        },
      });
      return { sheet: cachedSheet, modelSheet: cachedModel, source: "MODEL_CACHE" as const };
    }
  }

  // 2. Fiche déjà présente sur ce véhicule (ex. véhicule importé) : on la rattache au modèle.
  if (ownSheet && !options.force) {
    const modelSheet = await prisma.vehicleModelTechSheet.upsert({
      where: { modelKey },
      create: {
        modelKey,
        brand: vehicle.brand,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        energy: vehicle.energy,
        sheetJson: JSON.stringify(ownSheet),
        status: vehicle.techSheetConfirmed ? "APPROVED" : "GENERATED",
        source: "EXISTING_VEHICLE_SHEET",
        generatedBy: options.actorName || null,
        approvedAt: vehicle.techSheetConfirmed ? vehicle.techSheetConfirmedAt : null,
      },
      update: {
        sheetJson: JSON.stringify(ownSheet),
        status: vehicle.techSheetConfirmed ? "APPROVED" : "GENERATED",
      },
    });
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { techSheetModelId: modelSheet.id, hasTechSheet: true },
    });
    return { sheet: ownSheet, modelSheet, source: "EXISTING_VEHICLE_SHEET" as const };
  }

  // 3. Génération par l'agent IA DeepSeek (puis fallback catalogue local si indisponible).
  let sheet: TechnicalSheet;
  let source = "DEEPSEEK_AGENT";
  try {
    sheet = await generateTechSheetWithAI(
      {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        energy: vehicle.energy,
      },
      undefined,
      { preferDeepSeek: options.preferDeepSeek !== false }
    );
    source = sheet.sourceChinese || (isChineseBrand(vehicle.brand) ? "DEEPSEEK_AGENT" : "AI_AGENT");
  } catch (error) {
    console.warn("Génération IA fiche technique indisponible, fallback catalogue:", error);
    sheet = buildStandardTechnicalSheet(vehicle);
    source = "CATALOG_FALLBACK";
  }

  // Ne jamais remplacer les photos réelles du véhicule par une photo générique.
  sheet = {
    ...sheet,
    mainPhotoUrl: vehicle.mainPhotoUrl || sheet.mainPhotoUrl,
    interiorPhotoUrl: vehicle.interiorPhotoUrl || sheet.interiorPhotoUrl,
    exteriorPhotoUrl: vehicle.exteriorPhotoUrl || sheet.exteriorPhotoUrl,
    rearPhotoUrl: vehicle.rearPhotoUrl || sheet.rearPhotoUrl,
  };

  const modelSheet = await prisma.vehicleModelTechSheet.upsert({
    where: { modelKey },
    create: {
      modelKey,
      brand: vehicle.brand,
      model: vehicle.model,
      variant: vehicle.variant,
      year: vehicle.year,
      energy: vehicle.energy,
      sheetJson: JSON.stringify(sheet),
      status: "GENERATED",
      source,
      generatedBy: options.actorName || null,
    },
    update: {
      sheetJson: JSON.stringify(sheet),
      status: "GENERATED",
      source,
    },
  });

  await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: {
      technicalSheetJson: JSON.stringify(sheet),
      hasTechSheet: true,
      techSheetModelId: modelSheet.id,
      techSheetConfirmed: false,
    },
  });

  return { sheet, modelSheet, source };
}

export async function approveVehicleTechSheet(vehicleId: string, actorName: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { techSheetModel: true },
  });
  if (!vehicle) throw new Error("Véhicule introuvable.");

  let modelSheet = vehicle.techSheetModel;
  if (!modelSheet) {
    const ensured = await ensureVehicleTechSheet(vehicleId, { actorName });
    modelSheet = ensured.modelSheet;
  }

  const sheet = parseSheet(modelSheet.sheetJson) || resolveVehicleTechSheet(vehicle);
  const approvedAt = new Date();

  await prisma.vehicleModelTechSheet.update({
    where: { id: modelSheet.id },
    data: {
      status: "APPROVED",
      approvedBy: actorName,
      approvedAt,
      sheetJson: JSON.stringify(sheet),
    },
  });

  await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: {
      technicalSheetJson: JSON.stringify(sheet),
      techSheetModelId: modelSheet.id,
      hasTechSheet: true,
      techSheetConfirmed: true,
      techSheetConfirmedAt: approvedAt,
    },
  });

  return { sheet, modelSheetId: modelSheet.id, approvedAt };
}
