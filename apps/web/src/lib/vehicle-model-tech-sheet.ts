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

/**
 * Recherche une fiche déjà disponible pour le même modèle.
 * L'égalité stricte (version / année / énergie) est prioritaire, puis on accepte
 * une fiche du même couple marque + modèle pour éviter une nouvelle génération IA.
 */
async function findReusableModelSheet(
  vehicle: { brand: string; model: string },
  exactKey: string,
  exactModelSheet: Awaited<ReturnType<typeof prisma.vehicleModelTechSheet.findUnique>> | null
) {
  if (exactModelSheet && parseSheet(exactModelSheet.sheetJson)) return exactModelSheet;

  const modelPrefix = `${vehicle.brand.trim().toUpperCase()}|${vehicle.model.trim().toUpperCase()}|`;
  const candidates = await prisma.vehicleModelTechSheet.findMany({
    where: { modelKey: { startsWith: modelPrefix } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 20,
  });

  return candidates.find((candidate) => parseSheet(candidate.sheetJson)) || null;
}

async function applyExistingSheetToVehicle(
  vehicleId: string,
  sheet: TechnicalSheet,
  modelSheet: { id: string; status: string; approvedAt: Date | null }
) {
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      technicalSheetJson: JSON.stringify(sheet),
      hasTechSheet: true,
      techSheetModelId: modelSheet.id,
      techSheetConfirmed: modelSheet.status === "APPROVED",
      techSheetConfirmedAt: modelSheet.status === "APPROVED" ? modelSheet.approvedAt : null,
    },
  });
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
  const exactModelSheet =
    vehicle.techSheetModel ||
    (await prisma.vehicleModelTechSheet.findUnique({ where: { modelKey } }));
  const cachedModel = await findReusableModelSheet(vehicle, modelKey, exactModelSheet);

  // 1. Fiche déjà disponible pour ce modèle (même version ou même modèle) :
  //    on la réutilise sans aucun appel IA.
  if (cachedModel && !options.force) {
    const cachedSheet = parseSheet(cachedModel.sheetJson);
    if (cachedSheet) {
      await applyExistingSheetToVehicle(vehicle.id, cachedSheet, cachedModel);
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

  // 3. Aucune fiche de modèle, mais un autre véhicule du même modèle possède déjà
  //    une fiche : on la copie sur ce véhicule au lieu de rappeler l'IA.
  if (!options.force) {
    const siblingVehicle = await prisma.vehicle.findFirst({
      where: {
        id: { not: vehicle.id },
        brand: { equals: vehicle.brand, mode: "insensitive" },
        model: { equals: vehicle.model, mode: "insensitive" },
        technicalSheetJson: { not: null },
      },
      orderBy: [{ techSheetConfirmed: "desc" }, { updatedAt: "desc" }],
      select: {
        technicalSheetJson: true,
        techSheetConfirmed: true,
        techSheetConfirmedAt: true,
        techSheetModelId: true,
      },
    });
    const siblingSheet = parseSheet(siblingVehicle?.technicalSheetJson);
    if (siblingVehicle && siblingSheet) {
      let siblingModelSheet = siblingVehicle.techSheetModelId
        ? await prisma.vehicleModelTechSheet.findUnique({ where: { id: siblingVehicle.techSheetModelId } })
        : null;

      if (!siblingModelSheet || !parseSheet(siblingModelSheet.sheetJson)) {
        siblingModelSheet = await prisma.vehicleModelTechSheet.upsert({
          where: { modelKey },
          create: {
            modelKey,
            brand: vehicle.brand,
            model: vehicle.model,
            variant: vehicle.variant,
            year: vehicle.year,
            energy: vehicle.energy,
            sheetJson: JSON.stringify(siblingSheet),
            status: siblingVehicle.techSheetConfirmed ? "APPROVED" : "GENERATED",
            source: "VEHICLE_SHEET_CACHE",
            generatedBy: options.actorName || null,
            approvedAt: siblingVehicle.techSheetConfirmed ? siblingVehicle.techSheetConfirmedAt : null,
          },
          update: {
            sheetJson: JSON.stringify(siblingSheet),
            status: siblingVehicle.techSheetConfirmed ? "APPROVED" : "GENERATED",
            source: "VEHICLE_SHEET_CACHE",
          },
        });
      }

      await applyExistingSheetToVehicle(vehicle.id, siblingSheet, siblingModelSheet);
      return { sheet: siblingSheet, modelSheet: siblingModelSheet, source: "VEHICLE_SHEET_CACHE" as const };
    }
  }

  // 4. Génération par l'agent IA DeepSeek (puis fallback catalogue local si indisponible).
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
