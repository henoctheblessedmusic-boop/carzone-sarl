#!/usr/bin/env node
/**
 * Référentiel marques/modèles véhicules - CARZONE.
 * - marques chinoises d'abord (celles du catalogue existant conservent leur ordre) ;
 * - puis les marques les plus courantes (Toyota, Nissan, Kia, Hyundai, etc.).
 * Réexécutable et idempotent (upsert par nom).
 *
 * Usage : node scripts/seed-vehicle-brands-models.mjs
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const WEB_ROOT = path.join(REPO_ROOT, "apps", "web");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvFile(path.join(WEB_ROOT, ".env"));
loadEnvFile(path.join(WEB_ROOT, ".env.local"));

const require = createRequire(path.join(WEB_ROOT, "package.json"));
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Marques chinoises / déjà au catalogue, puis marques généralistes.
const BRANDS = [
  { name: "CHANGAN", models: ["CS35 PLUS", "CS55 PLUS", "CS75", "CS75 2026", "UNI-K", "UNI-T", "UNI-V", "AXE", "LUMIN", "HUNTER"] },
  { name: "JETOUR", models: ["DASHING", "X70 PLUS", "X90 7 PLACES", "T1 i-DM", "T2", "JETOUR L7"] },
  { name: "BAIC", models: ["X35", "X55", "X55e REHEV", "X7 1.5T", "B30e", "B40", "B60", "BJ40", "BJ80"] },
  { name: "BYD", models: ["SONG PLUS", "SONG L", "QIN", "HAN", "TANG", "YUAN PLUS", "SEAL", "LEOPARD 5", "LEOPARD 8", "DOLPHIN"] },
  { name: "FORTHING", models: ["SX5", "T5 EVO 2026", "T5 HEV", "T5 MACH", "FRIDAY", "T5 EVO"] },
  { name: "GEELY", models: ["STARSHIP 7 2026", "GALAXY STARSHIP 7", "MONJARO", "COOLRAY", "EMGRAND", "OKAVANGO"] },
  { name: "EXEED", models: ["RX 400 Thermique", "RX 400 Hybrid", "VX", "TXL", "LX"] },
  { name: "KAIYI", models: ["X3 PRO 2026", "X7", "E5", "X3"] },
  { name: "CHERY", models: ["TIGGO 4", "TIGGO 7", "TIGGO 8", "ARRIZO 5", "ARRIZO 8", "OMODA 5"] },
  { name: "HAVAL", models: ["JOLION", "H6", "DAGO", "H2", "H9"] },
  { name: "TANK", models: ["TANK 300", "TANK 400", "TANK 500", "TANK 700"] },
  { name: "GAC", models: ["GS3", "GS4", "GS8", "EMKOO", "GN8"] },
  { name: "VOYAH", models: ["FREE", "DREAMER", "PASSION"] },
  { name: "MG", models: ["MG5", "MG6", "ZS", "HS", "RX5", "MARVEL R"] },
  { name: "MAXUS", models: ["T60", "T70", "D90", "G10", "V90"] },
  { name: "LIFAN", models: ["X50", "X60", "X70", "820"] },
  { name: "TOYOTA", models: ["COROLLA", "CAMRY", "RAV4", "HILUX", "LAND CRUISER", "PRADO", "YARIS", "AVENSIS", "HIACE", "FORTUNER", "PRIUS"] },
  { name: "NISSAN", models: ["ALMERA", "SENTRA", "QASHQAI", "X-TRAIL", "NAVARA", "PATROL", "JUKE", "MICRA", "NOTE"] },
  { name: "KIA", models: ["PICANTO", "RIO", "CERATO", "SPORTAGE", "SORENTO", "SELTOS", "CARNIVAL", "K5", "K3"] },
  { name: "HYUNDAI", models: ["I10", "I20", "ACCENT", "ELANTRA", "TUCSON", "SANTA FE", "IX35", "CRETA", "STARIA"] },
  { name: "SUZUKI", models: ["SWIFT", "DZIRE", "VITARA", "JIMNY", "ALTO", "BALENO", "ERTIGA"] },
  { name: "MITSUBISHI", models: ["L200", "PAJERO", "OUTLANDER", "ASX", "LANCER", "ECLIPSE CROSS"] },
  { name: "HONDA", models: ["CIVIC", "ACCORD", "CR-V", "HR-V", "JAZZ", "CITY", "PILOT"] },
  { name: "FORD", models: ["RANGER", "EVEREST", "FOCUS", "FIESTA", "EXPLORER", "TRANSIT"] },
  { name: "MERCEDES-BENZ", models: ["CLASSE A", "CLASSE C", "CLASSE E", "GLA", "GLC", "GLE", "SPRINTER", "VITO"] },
  { name: "BMW", models: ["SERIE 1", "SERIE 3", "SERIE 5", "X1", "X3", "X5", "X7"] },
  { name: "VOLKSWAGEN", models: ["GOLF", "PASSAT", "TIGUAN", "POLO", "TOUAREG", "AMAROK", "CADDY"] },
  { name: "PEUGEOT", models: ["208", "301", "308", "3008", "5008", "PARTNER", "BOXER"] },
  { name: "RENAULT", models: ["CLIO", "DUSTER", "LOGAN", "KWID", "KOLEOS", "MASTER"] },
  { name: "LAND ROVER", models: ["DEFENDER", "DISCOVERY", "RANGE ROVER", "RANGE ROVER SPORT", "FREELANDER"] },
  { name: "LEXUS", models: ["RX", "NX", "LX", "ES", "GX"] },
  { name: "MAZDA", models: ["MAZDA 2", "MAZDA 3", "MAZDA 6", "CX-3", "CX-5", "CX-8"] },
  { name: "ISUZU", models: ["D-MAX", "MU-X", "NPR", "NQR"] },
  { name: "AUDI", models: ["A3", "A4", "A6", "Q3", "Q5", "Q7"] },
  { name: "VOLVO", models: ["XC40", "XC60", "XC90", "S60", "S90"] },
  { name: "CHEVROLET", models: ["AVEO", "CRUZE", "CAPTIVA", "TRAILBLAZER", "SILVERADO"] },
  { name: "JEEP", models: ["WRANGLER", "GRAND CHEROKEE", "COMPASS", "RENEGADE"] },
  { name: "DACIA", models: ["DUSTER", "LOGAN", "SANDERO", "JOGGER"] },
];

const CHINESE = new Set([
  "CHANGAN", "JETOUR", "BAIC", "BYD", "FORTHING", "GEELY", "EXEED", "KAIYI",
  "CHERY", "HAVAL", "TANK", "GAC", "VOYAH", "MG", "MAXUS", "LIFAN",
]);

async function main() {
  const existing = await prisma.vehicleBrand.findMany({ select: { id: true, name: true, sortOrder: true } });
  const existingByName = new Map(existing.map((b) => [b.name.toUpperCase(), b]));
  let createdBrands = 0;
  let createdModels = 0;

  // Les marques chinoises déjà présentes gardent leur ordre ; les nouvelles
  // marques chinoises viennent ensuite, puis les marques généralistes.
  let nextChineseOrder = Math.max(0, ...existing.filter((b) => CHINESE.has(b.name.toUpperCase())).map((b) => b.sortOrder)) + 1;
  let nextGeneralOrder = Math.max(100, ...existing.map((b) => b.sortOrder)) + 1;
  const presentGeneral = existing.filter((b) => !CHINESE.has(b.name.toUpperCase())).length;

  for (const brand of BRANDS) {
    const upper = brand.name.toUpperCase();
    const isChinese = CHINESE.has(upper);
    const sortOrder = existingByName.has(upper)
      ? existingByName.get(upper).sortOrder
      : isChinese
        ? nextChineseOrder++
        : nextGeneralOrder + presentGeneral;

    let dbBrand = existingByName.get(upper);
    if (!dbBrand) {
      dbBrand = await prisma.vehicleBrand.create({
        data: { name: brand.name, sortOrder, active: true },
        select: { id: true, name: true, sortOrder: true },
      });
      existingByName.set(upper, dbBrand);
      createdBrands += 1;
    } else {
      await prisma.vehicleBrand.update({
        where: { id: dbBrand.id },
        data: { active: true, sortOrder: dbBrand.sortOrder },
      });
    }

    const existingModels = await prisma.vehicleModel.findMany({
      where: { brandId: dbBrand.id },
      select: { name: true },
    });
    const modelNames = new Set(existingModels.map((m) => m.name.toUpperCase()));
    for (const model of brand.models) {
      if (modelNames.has(model.toUpperCase())) continue;
      await prisma.vehicleModel.create({ data: { brandId: dbBrand.id, name: model, active: true } });
      createdModels += 1;
    }
  }

  console.log(`Marques créées : ${createdBrands} · Modèles créés : ${createdModels}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e.message);
  await prisma.$disconnect();
  process.exit(1);
});
