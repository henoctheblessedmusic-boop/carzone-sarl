"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const MANAGE_ROLES = ["GESTIONNAIRE_LOCATION", "DG", "PDG", "SG"] as const;

function requireManager(role: string) {
  if (!(MANAGE_ROLES as readonly string[]).includes(role)) {
    throw new Error("Seul le gestionnaire de la location peut modifier le parc et les contrats.");
  }
}

export async function createRental(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);

  const vehicleId = String(formData.get("vehicleId") || "").trim();
  const customerId = String(formData.get("customerId") || "").trim();
  const type = String(formData.get("type") || "LCD");
  const startRaw = String(formData.get("startDate") || "");
  const endRaw = String(formData.get("endDate") || "");
  const monthlyXof = Number(formData.get("monthlyXof") || 0) || null;
  const depositXof = Number(formData.get("depositXof") || 0) || null;
  const departureCondition = String(formData.get("departureCondition") || "").trim() || null;

  if (!vehicleId || !customerId) throw new Error("Véhicule et client obligatoires.");
  const startDate = startRaw ? new Date(startRaw) : new Date();
  if (Number.isNaN(startDate.getTime())) throw new Error("Date de début invalide.");
  const endDate = endRaw ? new Date(endRaw) : null;
  if (endDate && Number.isNaN(endDate.getTime())) throw new Error("Date de fin invalide.");
  if (endDate && endDate < startDate) throw new Error("La date de fin doit être postérieure au début.");

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, brand: true, model: true, fleetType: true, rentalStatus: true },
  });
  if (!vehicle || vehicle.fleetType !== "RENTAL") {
    throw new Error("Ce véhicule n'appartient pas au parc de location.");
  }
  if (vehicle.rentalStatus !== "DISPONIBLE") {
    throw new Error("Ce véhicule de location n'est pas disponible.");
  }

  const rental = await prisma.rental.create({
    data: {
      type,
      status: "ACTIF",
      customerId,
      vehicleId,
      startDate,
      endDate,
      monthlyXof,
      depositXof,
      departureCondition,
      createdByName: user.fullName,
    },
    select: { id: true, customer: { select: { contactName: true } } },
  });

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { rentalStatus: "LOUE" },
  });

  await logAudit({
    user,
    action: "rental.create",
    entityType: "Rental",
    entityId: rental.id,
    entityLabel: `${vehicle.brand} ${vehicle.model} - ${rental.customer.contactName}`,
    details: `Contrat ${type} démarré le ${startDate.toISOString().slice(0, 10)}`,
  });

  revalidatePath("/rentals");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
}

export async function returnRental(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Contrat introuvable.");

  const rental = await prisma.rental.findUnique({
    where: { id },
    select: { id: true, status: true, vehicleId: true, vehicle: { select: { brand: true, model: true } } },
  });
  if (!rental) throw new Error("Contrat introuvable.");
  if (rental.status !== "ACTIF") throw new Error("Seul un contrat actif peut être clôturé.");

  const returnCondition = String(formData.get("returnCondition") || "").trim() || null;

  await prisma.rental.update({
    where: { id },
    data: { status: "TERMINE", returnedAt: new Date(), returnCondition },
  });
  await prisma.vehicle.update({
    where: { id: rental.vehicleId },
    data: { rentalStatus: "DISPONIBLE" },
  });

  await logAudit({
    user,
    action: "rental.return",
    entityType: "Rental",
    entityId: rental.id,
    entityLabel: `${rental.vehicle.brand} ${rental.vehicle.model}`,
    details: "Retour du véhicule et remise à disposition",
  });

  revalidatePath("/rentals");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
}

export async function transferVehicleToRental(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);
  const vehicleId = String(formData.get("vehicleId") || "").trim();
  if (!vehicleId) throw new Error("Véhicule requis.");

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, fleetType: true, brand: true, model: true },
  });
  if (!vehicle) throw new Error("Véhicule introuvable.");
  if (vehicle.fleetType === "RENTAL") throw new Error("Ce véhicule est déjà dans le parc de location.");

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { fleetType: "RENTAL", rentalStatus: "DISPONIBLE" },
  });
  await logAudit({
    user,
    action: "rental.fleet_add",
    entityType: "Vehicle",
    entityId: vehicle.id,
    entityLabel: `${vehicle.brand} ${vehicle.model}`,
    details: "Transfert du stock showroom vers le parc de location",
  });
  revalidatePath("/rentals");
  revalidatePath("/vehicles");
}

export async function transferVehicleToShowroom(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);
  const vehicleId = String(formData.get("vehicleId") || "").trim();
  if (!vehicleId) throw new Error("Véhicule requis.");

  const activeRental = await prisma.rental.count({
    where: { vehicleId, status: "ACTIF" },
  });
  if (activeRental > 0) {
    throw new Error("Impossible de sortir un véhicule avec un contrat de location actif.");
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { fleetType: "SHOWROOM", rentalStatus: null },
    select: { id: true, brand: true, model: true },
  });
  await logAudit({
    user,
    action: "rental.fleet_remove",
    entityType: "Vehicle",
    entityId: vehicle.id,
    entityLabel: `${vehicle.brand} ${vehicle.model}`,
    details: "Retour du parc de location vers le stock showroom",
  });
  revalidatePath("/rentals");
  revalidatePath("/vehicles");
}
