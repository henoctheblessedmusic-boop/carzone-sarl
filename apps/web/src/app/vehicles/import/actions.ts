"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireUser } from "@/lib/require-user";
import {
  STOCK_IMPORT_MAX_ROWS,
  isIncompleteStockRow,
  normalizeStockEnergy,
  normalizeStockStatus,
  normalizeStockZone,
  parseStockDate,
  parseStockYear,
  validateStockRow,
  type StockImportRowPayload,
} from "@/lib/stock-import";
import { ensureVehicleConfiguration } from "@/server/vehicle-configuration-service";

const IMPORT_ROLES = ["DEVELOPER", "PDG"] as const;

function assertImportRole(role: string) {
  if (!(IMPORT_ROLES as readonly string[]).includes(role)) {
    throw new Error("Import réservé aux rôles DEVELOPER et PDG.");
  }
}

function normalizedVersionKey(
  brand: string,
  model: string,
  trim: string,
  year: number | null,
  energy: string | null,
): string | null {
  if (!trim || !year || !energy) return null;
  return [brand, model, trim, String(year), energy]
    .map((value) => value.trim().toUpperCase())
    .join("|");
}

export async function importStockVehicles(rows: StockImportRowPayload[]) {
  const user = await requireUser();
  assertImportRole(user.role);

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Aucune ligne à importer.");
  }
  if (rows.length > STOCK_IMPORT_MAX_ROWS) {
    throw new Error(`Trop de lignes : ${rows.length}. Maximum ${STOCK_IMPORT_MAX_ROWS}.`);
  }

  const site = await prisma.site.findFirst({ where: { code: "MARO_MILITAIRE" } });
  if (!site) throw new Error("Site Maro-Militaire introuvable.");

  const seenVins = new Set<string>();
  const anomalies: { excelRow: number; message: string }[] = [];
  const validRows: Array<{
    row: StockImportRowPayload;
    brand: string;
    model: string;
    trim: string;
    year: number | null;
    energy: string | null;
    status: string;
    zone: string;
    arrivalDate: Date | null;
    versionKey: string | null;
  }> = [];

  rows.forEach((raw, index) => {
    const excelRow = index + 2;
    const row: StockImportRowPayload = {
      ...raw,
      vin: String(raw.vin ?? "").trim().toUpperCase(),
      brand: String(raw.brand ?? "").trim(),
      model: String(raw.model ?? "").trim(),
      trim: String(raw.trim ?? "").trim(),
      year: String(raw.year ?? "").trim(),
      energy: String(raw.energy ?? "").trim(),
      engine: String(raw.engine ?? "").trim(),
      transmission: String(raw.transmission ?? "").trim(),
      gearbox: String(raw.gearbox ?? "").trim(),
      seats: String(raw.seats ?? "").trim(),
      otherFeatures: String(raw.otherFeatures ?? "").trim(),
      exteriorColorBase: String(raw.exteriorColorBase ?? "").trim(),
      exteriorColorShade: String(raw.exteriorColorShade ?? "").trim(),
      interiorColor: String(raw.interiorColor ?? "").trim(),
      status: String(raw.status ?? "").trim(),
      site: String(raw.site ?? "").trim(),
      arrivalDate: String(raw.arrivalDate ?? "").trim(),
    };

    const errors = validateStockRow(row);
    if (seenVins.has(row.vin)) errors.push("VIN dupliqué dans le fichier");
    seenVins.add(row.vin);
    if (errors.length > 0) {
      anomalies.push({ excelRow, message: errors.join(" ; ") });
      return;
    }

    try {
      const year = parseStockYear(row.year);
      const energy = normalizeStockEnergy(row.energy);
      const status = normalizeStockStatus(row.status);
      const zone = normalizeStockZone(row.site);
      if (!status || !zone) throw new Error("Statut ou site manquant.");
      validRows.push({
        row,
        brand: row.brand,
        model: row.model,
        trim: row.trim,
        year,
        energy,
        status,
        zone,
        arrivalDate: parseStockDate(row.arrivalDate),
        versionKey: normalizedVersionKey(row.brand, row.model, row.trim, year, energy),
      });
    } catch (error) {
      anomalies.push({ excelRow, message: error instanceof Error ? error.message : "Ligne invalide" });
    }
  });

  let created = 0;
  let updated = 0;

  for (const item of validRows) {
    const { row } = item;
    const brand = await prisma.vehicleBrand.upsert({
      where: { name: item.brand },
      update: { active: true },
      create: { name: item.brand },
    });
    await prisma.vehicleModel.upsert({
      where: { brandId_name: { brandId: brand.id, name: item.model } },
      update: { active: true, energy: item.energy },
      create: { brandId: brand.id, name: item.model, energy: item.energy },
    });

    let versionId: string | null = null;
    if (item.versionKey) {
      const version = await prisma.vehicleVersion.upsert({
        where: { key: item.versionKey },
        update: {
          brand: item.brand,
          model: item.model,
          trim: item.trim || null,
          year: item.year,
          energy: item.energy,
          engineLabel: row.engine || null,
          transmissionType: row.transmission || null,
          gearboxLabel: row.gearbox || null,
          seats: row.seats ? Number(row.seats) || null : null,
          otherFeatures: row.otherFeatures || null,
        },
        create: {
          key: item.versionKey,
          brand: item.brand,
          model: item.model,
          trim: item.trim || null,
          year: item.year,
          energy: item.energy,
          engineLabel: row.engine || null,
          transmissionType: row.transmission || null,
          gearboxLabel: row.gearbox || null,
          seats: row.seats ? Number(row.seats) || null : null,
          otherFeatures: row.otherFeatures || null,
        },
      });
      versionId = version.id;
    }

    const incomplete = isIncompleteStockRow(row);
    const publicationReady = Boolean(row.trim.trim() && row.year.trim() && row.energy.trim());
    const existing = await prisma.vehicle.findUnique({ where: { vin: row.vin } });
    const sharedData = {
      brand: item.brand,
      model: item.model,
      variant: row.trim || null,
      year: item.year,
      energy: item.energy || "NON_RENSEIGNEE",
      transmission: row.transmission || null,
      exteriorColorBase: row.exteriorColorBase || null,
      exteriorColorShade: row.exteriorColorShade || null,
      interiorColor: row.interiorColor || null,
      color: row.exteriorColorShade || row.exteriorColorBase || null,
      stockZone: item.zone,
      arrivalDate: item.arrivalDate,
      status: item.status,
      versionId,
      siteId: site.id,
      isIncompleteSheet: incomplete,
    };

    let vehicleId: string;
    if (existing) {
      const vehicle = await prisma.vehicle.update({
        where: { id: existing.id },
        data: sharedData,
      });
      vehicleId = vehicle.id;
      updated += 1;
    } else {
      const vehicle = await prisma.vehicle.create({
        data: {
          ...sharedData,
          vin: row.vin,
          priceXof: 0,
          priceToConfirm: true,
          publishedOnSite: publicationReady,
          fleetType: "SHOWROOM",
        },
      });
      vehicleId = vehicle.id;
      created += 1;
    }

    // Rattachement a la configuration commercialisable. Un echec ne doit pas
    // interrompre l'import : le script de rattachement rattrape les manquants.
    await ensureVehicleConfiguration(vehicleId).catch((err) => {
      console.error("Vehicle configuration linking error:", row.vin, err);
    });
  }

  const fileVins = rows.map((row) => String(row.vin ?? "").trim().toUpperCase()).filter(Boolean);
  const missing = await prisma.vehicle.findMany({
    where: { fleetType: "SHOWROOM", vin: { notIn: fileVins } },
    select: { vin: true },
    orderBy: { vin: "asc" },
  });

  await logAudit({
    user,
    action: "vehicle.import",
    entityType: "Vehicle",
    entityLabel: `Import stock ${rows.length} lignes`,
    details: `Créés: ${created}, mis à jour: ${updated}, anomalies: ${anomalies.length}`,
  });

  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return {
    created,
    updated,
    anomalies: anomalies.length,
    total: rows.length,
    missingVins: missing.map((item) => item.vin).filter((vin): vin is string => Boolean(vin)),
    errors: anomalies,
  };
}
