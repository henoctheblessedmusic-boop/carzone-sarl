"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { normalizeBrandName } from "@/lib/brand-logos";

const VEHICLE_MANAGERS = [
  "PDG",
  "SG",
  "DG",
  "ADV",
  "RF",
  "RTA",
  "DC",
  "STOCK",
  "ADMIN",
] as const;

export async function createVehicle(formData: FormData) {
  await requireUser([...VEHICLE_MANAGERS]);
  const siteIdInput = String(formData.get("siteId") || "").trim() || null;
  const site = siteIdInput
    ? await prisma.site.findUnique({ where: { id: siteIdInput } })
    : await prisma.site.findFirst({ where: { code: "AKPAKPA" } });

  const rawBrand = String(formData.get("brand") || "").trim();
  const brand = normalizeBrandName(rawBrand);
  const model = String(formData.get("model") || "").trim();
  let vehicleType = String(formData.get("vehicleType") || "").trim() || null;
  let energy = String(formData.get("energy") || "ESSENCE");

  if (brand && model && !vehicleType) {
    const catalogModel = await prisma.vehicleModel.findFirst({
      where: {
        name: model,
        brand: { name: brand },
      },
    });
    if (catalogModel) {
      vehicleType = catalogModel.vehicleType;
      if (catalogModel.energy) energy = catalogModel.energy;
    }
  }

  const supplierId = String(formData.get("supplierId") || "").trim() || null;

  const vehicle = await prisma.vehicle.create({
    data: {
      vin: String(formData.get("vin") || "").trim() || null,
      brand,
      model,
      variant: String(formData.get("variant") || "").trim() || null,
      year: Number(formData.get("year") || new Date().getFullYear()),
      energy,
      vehicleType,
      priceXof: Number(formData.get("priceXof") || 0),
      status: "EN_STOCK",
      siteId: site?.id || siteIdInput || null,
      supplierId,
    },
  });

  // Background auto-generation & translation of official French tech sheet
  generateAndSaveVehicleTechSheet(vehicle.id).catch((err) => {
    console.error("Auto tech sheet generation error:", err);
  });

  revalidatePath("/vehicles");
  revalidatePath("/catalog");
}

import { generateAndSaveVehicleTechSheet, generateAllVehiclesTechSheets } from "@/lib/tech-sheet-generator";

export async function batchGenerateAllVehiclesTechSheetsAction() {
  await requireUser([...VEHICLE_MANAGERS]);
  const res = await generateAllVehiclesTechSheets();
  revalidatePath("/vehicles");
  revalidatePath("/quotes");
  return res;
}

export async function regenerateVehicleTechSheetAction(vehicleId: string) {
  await requireUser([...VEHICLE_MANAGERS]);
  const res = await generateAndSaveVehicleTechSheet(vehicleId);
  revalidatePath("/vehicles");
  revalidatePath("/quotes");
  return res;
}

export async function updateVehicle(formData: FormData) {
  await requireUser([...VEHICLE_MANAGERS]);
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Identifiant véhicule requis");

  const vin = String(formData.get("vin") || "").trim() || null;
  const variant = String(formData.get("variant") || "").trim() || null;
  const year = Number(formData.get("year")) || new Date().getFullYear();
  const energy = String(formData.get("energy") || "ESSENCE");
  const vehicleType = String(formData.get("vehicleType") || "").trim() || null;
  const priceXof = Number(formData.get("priceXof") || 0);
  const status = String(formData.get("status") || "EN_STOCK");
  const mileage = Number(formData.get("mileage") || 0);
  const color = String(formData.get("color") || "").trim() || null;
  const supplierId = String(formData.get("supplierId") || "").trim() || null;
  const rawSiteId = String(formData.get("siteId") || "").trim();
  const siteId = rawSiteId || null;

  await prisma.vehicle.update({
    where: { id },
    data: {
      vin,
      variant,
      year,
      energy,
      vehicleType,
      priceXof,
      status,
      mileage,
      color,
      supplierId,
      siteId,
    },
  });

  // Re-synchronize tech sheet with updated vehicle data
  generateAndSaveVehicleTechSheet(id).catch((err) => {
    console.error("Update tech sheet error:", err);
  });

  revalidatePath("/vehicles");
  revalidatePath("/catalog");
}

const VEHICLE_DELETERS = ["PDG", "SG", "DG", "DC", "ADMIN"] as const;

export async function deleteVehicle(formData: FormData) {
  await requireUser([...VEHICLE_DELETERS]);
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Identifiant véhicule requis");

  // Sécurité d'intégrité : vérifier si le véhicule est lié à un devis ou facture
  const quoteLinesCount = await prisma.quoteLine.count({
    where: { vehicleId: id },
  });
  if (quoteLinesCount > 0) {
    throw new Error(
      "Impossible de supprimer cet article car il est associé à un devis ou une facture proforma. Pour préserver l'intégrité comptable et commerciale, veuillez passer son statut en 'VENDU' ou 'RESERVE'."
    );
  }

  // Détacher les opportunités commerciales associées
  await prisma.opportunity.updateMany({
    where: { vehicleId: id },
    data: { vehicleId: null },
  });

  // Détacher les ordres de travail / atelier
  await prisma.workOrder.updateMany({
    where: { vehicleId: id },
    data: { vehicleId: null },
  });

  // Détacher les fiches atelier si elles pointent sur cet ID
  await prisma.workshopEntry.updateMany({
    where: { vehicleId: id },
    data: { vehicleId: null },
  });

  // Supprimer les rattachements de flotte
  await prisma.fleetVehicle.deleteMany({
    where: { vehicleId: id },
  });

  // Suppression définitive de l'article en stock
  await prisma.vehicle.delete({
    where: { id },
  });

  revalidatePath("/vehicles");
  revalidatePath("/catalog");
  revalidatePath("/dashboard");
}
