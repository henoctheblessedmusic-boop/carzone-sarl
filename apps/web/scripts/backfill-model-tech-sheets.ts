/**
 * Backfill : crée les fiches de modèle à partir des fiches déjà présentes sur les
 * véhicules existants, pour que les prochains véhicules du même modèle les réutilisent
 * immédiatement sans nouvel appel IA.
 *
 * Commande :
 *   npx tsx scripts/backfill-model-tech-sheets.ts
 */
import { PrismaClient } from "@prisma/client";
import { vehicleTechSheetModelKey } from "../src/lib/vehicle-model-tech-sheet";
import type { TechnicalSheet } from "../src/lib/tech-sheet-generator";

const prisma = new PrismaClient();

function parseSheet(json: string | null): TechnicalSheet | null {
  if (!json) return null;
  try {
    const sheet = JSON.parse(json) as TechnicalSheet;
    if (sheet?.title && (sheet.motorisation || sheet.dimensions)) return sheet;
  } catch {
    return null;
  }
  return null;
}

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    where: { technicalSheetJson: { not: null } },
    select: {
      id: true,
      brand: true,
      model: true,
      variant: true,
      year: true,
      energy: true,
      technicalSheetJson: true,
      techSheetConfirmed: true,
      techSheetConfirmedAt: true,
      techSheetModelId: true,
    },
  });

  const groups = new Map<string, typeof vehicles>();
  for (const vehicle of vehicles) {
    if (!parseSheet(vehicle.technicalSheetJson)) continue;
    const key = vehicleTechSheetModelKey(vehicle);
    const group = groups.get(key) || [];
    group.push(vehicle);
    groups.set(key, group);
  }

  let created = 0;
  let linked = 0;
  for (const [modelKey, group] of groups) {
    const sourceVehicle =
      group.find((vehicle) => vehicle.techSheetConfirmed) || group[0];
    const sheet = parseSheet(sourceVehicle.technicalSheetJson);
    if (!sheet) continue;

    let modelSheet = await prisma.vehicleModelTechSheet.findUnique({ where: { modelKey } });
    if (!modelSheet) {
      modelSheet = await prisma.vehicleModelTechSheet.create({
        data: {
          modelKey,
          brand: sourceVehicle.brand,
          model: sourceVehicle.model,
          variant: sourceVehicle.variant,
          year: sourceVehicle.year,
          energy: sourceVehicle.energy,
          sheetJson: JSON.stringify(sheet),
          status: sourceVehicle.techSheetConfirmed ? "APPROVED" : "GENERATED",
          source: "VEHICLE_SHEET_BACKFILL",
          generatedBy: "BACKFILL",
          approvedAt: sourceVehicle.techSheetConfirmed ? sourceVehicle.techSheetConfirmedAt : null,
        },
      });
      created += 1;
    }

    const idsToLink = group.filter((vehicle) => vehicle.techSheetModelId !== modelSheet.id).map((vehicle) => vehicle.id);
    if (idsToLink.length > 0) {
      const result = await prisma.vehicle.updateMany({
        where: { id: { in: idsToLink } },
        data: {
          techSheetModelId: modelSheet.id,
          hasTechSheet: true,
        },
      });
      linked += result.count;
    }
  }

  console.log(
    JSON.stringify({
      vehiclesWithSheet: vehicles.length,
      distinctModelKeys: groups.size,
      modelSheetsCreated: created,
      vehiclesLinked: linked,
    })
  );
}

main()
  .catch((error) => {
    console.error("BACKFILL FAILED", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
