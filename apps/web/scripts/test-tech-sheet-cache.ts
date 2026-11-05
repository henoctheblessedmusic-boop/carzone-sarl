process.env.DEEPSEEK_API_KEY = "";
process.env.OPENAI_API_KEY = "";

import { PrismaClient } from "@prisma/client";
import { ensureVehicleTechSheet } from "../src/lib/vehicle-model-tech-sheet";

const prisma = new PrismaClient();
const BRAND = "TESTCACHE";
const MODEL = "CACHE-MODEL";
const sheet = {
  title: "Fiche test de cache",
  subtitle: "Réutilisation automatique",
  brand: BRAND,
  model: MODEL,
  energy: "ESSENCE",
  dimensions: {
    lengthWidthHeight: "4700x1900x1700",
    wheelbase: "2800",
    doors: 5,
    seats: 5,
    tankOrBattery: "60L",
  },
  motorisation: {
    displacementOrMotor: "1998 cm3",
    cylinders: "4",
    transmission: "Automatique",
    fuelType: "Essence",
    maxPower: "170 kW",
    maxTorque: "380 Nm",
  },
  equipementConfort: ["Climatisation"],
  exterieur: ["Jantes alliage"],
  securite: ["ABS"],
  translatedAt: new Date().toISOString(),
};
const sheetJson = JSON.stringify(sheet);

async function cleanup() {
  const vehicles = await prisma.vehicle.findMany({ where: { brand: BRAND }, select: { id: true } });
  if (vehicles.length) {
    await prisma.vehicle.deleteMany({ where: { id: { in: vehicles.map((v) => v.id) } } });
  }
  await prisma.vehicleModelTechSheet.deleteMany({ where: { brand: BRAND } });
}

async function main() {
  await cleanup();

  // Une fiche existe déjà pour une version du modèle.
  await prisma.vehicleModelTechSheet.create({
    data: {
      modelKey: `${BRAND}|${MODEL}|VERSION-A|2026|ESSENCE`,
      brand: BRAND,
      model: MODEL,
      variant: "VERSION-A",
      year: 2026,
      energy: "ESSENCE",
      sheetJson,
      status: "APPROVED",
      source: "TEST_FIXTURE",
      approvedAt: new Date(),
    },
  });

  const v1 = await prisma.vehicle.create({
    data: {
      brand: BRAND,
      model: MODEL,
      variant: "VERSION-B",
      year: 2025,
      energy: "DIESEL",
      priceXof: 1000000,
      fleetType: "RENTAL",
      rentalStatus: "DISPONIBLE",
      vin: "TESTCACHEVIN000001",
      registrationNumber: "TEST-CACHE-1",
    },
  });
  const result1 = await ensureVehicleTechSheet(v1.id);
  const reloaded1 = await prisma.vehicle.findUnique({ where: { id: v1.id }, include: { techSheetModel: true } });
  if (result1.source !== "MODEL_CACHE" || !reloaded1?.techSheetModelId) {
    throw new Error(`Version différente non réutilisée: ${result1.source}`);
  }

  const v2 = await prisma.vehicle.create({
    data: {
      brand: BRAND,
      model: MODEL,
      variant: "VERSION-C",
      year: 2027,
      energy: "ESSENCE",
      priceXof: 1000000,
      fleetType: "RENTAL",
      rentalStatus: "DISPONIBLE",
      vin: "TESTCACHEVIN000002",
      registrationNumber: "TEST-CACHE-2",
    },
  });
  const result2 = await ensureVehicleTechSheet(v2.id);
  if (result2.source !== "MODEL_CACHE") {
    throw new Error(`Même modèle non réutilisé: ${result2.source}`);
  }
  const modelSheetCountAfterCache = await prisma.vehicleModelTechSheet.count({ where: { brand: BRAND } });
  if (modelSheetCountAfterCache !== 1) {
    throw new Error(`La fiche existante n'a pas été partagée: ${modelSheetCountAfterCache}`);
  }

  // Cas d'un véhicule historique sans ligne de fiche modèle : la fiche véhicule sert de source.
  await prisma.vehicleModelTechSheet.deleteMany({ where: { brand: BRAND } });
  const legacy = await prisma.vehicle.create({
    data: {
      brand: BRAND,
      model: MODEL,
      variant: "VERSION-D",
      year: 2024,
      energy: "ESSENCE",
      priceXof: 1000000,
      fleetType: "SHOWROOM",
      status: "EN_STOCK",
      vin: "TESTCACHEVIN000003",
      registrationNumber: "TEST-CACHE-3",
      technicalSheetJson: sheetJson,
      hasTechSheet: true,
      techSheetConfirmed: true,
      techSheetConfirmedAt: new Date(),
    },
  });
  const v4 = await prisma.vehicle.create({
    data: {
      brand: BRAND,
      model: MODEL,
      variant: "VERSION-E",
      year: 2026,
      energy: "ESSENCE",
      priceXof: 1000000,
      fleetType: "RENTAL",
      rentalStatus: "DISPONIBLE",
      vin: "TESTCACHEVIN000004",
      registrationNumber: "TEST-CACHE-4",
    },
  });
  const result4 = await ensureVehicleTechSheet(v4.id);
  const reloaded4 = await prisma.vehicle.findUnique({ where: { id: v4.id } });
  if (result4.source !== "VEHICLE_SHEET_CACHE" || !reloaded4?.technicalSheetJson) {
    throw new Error(`Fiche véhicule historique non réutilisée: ${result4.source}`);
  }
  const modelSheetCountAfterSibling = await prisma.vehicleModelTechSheet.count({ where: { brand: BRAND } });
  if (modelSheetCountAfterSibling !== 1) {
    throw new Error(`La fiche historique n'a pas créé une seule fiche modèle: ${modelSheetCountAfterSibling}`);
  }

  console.log(JSON.stringify({
    ok: true,
    firstSource: result1.source,
    secondSource: result2.source,
    siblingSource: result4.source,
    modelSheetCountAfterCache,
    modelSheetCountAfterSibling,
    legacyVehicleId: legacy.id,
  }));
}

main()
  .catch((error) => {
    console.error("TEST FAILED", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });
