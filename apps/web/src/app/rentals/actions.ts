"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { ensureVehicleTechSheet, approveVehicleTechSheet } from "@/lib/vehicle-model-tech-sheet";
import { computeRentalTotal, rentalDaysBetween } from "@/lib/rental-contract";

const MANAGE_ROLES = ["GESTIONNAIRE_LOCATION", "DG", "PDG", "SG"] as const;
const FINANCE_ROLES = ["GESTIONNAIRE_LOCATION", "COMPTA", "DG", "PDG", "SG"] as const;

function requireManager(role: string) {
  if (!(MANAGE_ROLES as readonly string[]).includes(role)) {
    throw new Error("Seul le gestionnaire de la location peut modifier le parc et les contrats.");
  }
}

function requireFinance(role: string) {
  if (!(FINANCE_ROLES as readonly string[]).includes(role)) {
    throw new Error("Seuls le gestionnaire de la location et la comptabilité peuvent enregistrer un encaissement.");
  }
}

export async function recordRentalPayment(formData: FormData) {
  const user = await requireUser([...FINANCE_ROLES]);
  requireFinance(user.role);

  const rentalId = String(formData.get("rentalId") || "").trim();
  const amountXof = Math.round(Number(formData.get("amountXof") || 0));
  const method = String(formData.get("method") || "VIREMENT").trim().toUpperCase();
  const reference = String(formData.get("reference") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const paidRaw = String(formData.get("paidAt") || "");
  const paidAt = paidRaw ? new Date(paidRaw) : new Date();

  if (!rentalId) throw new Error("Contrat de location introuvable.");
  if (!Number.isFinite(amountXof) || amountXof <= 0) throw new Error("Le montant encaissé doit être supérieur à zéro.");
  if (Number.isNaN(paidAt.getTime())) throw new Error("Date d'encaissement invalide.");

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { customer: true, vehicle: true },
  });
  if (!rental) throw new Error("Contrat de location introuvable.");

  const payment = await prisma.rentalPayment.create({
    data: { rentalId, amountXof, method, reference, notes, paidAt, createdByName: user.fullName },
    select: { id: true },
  });

  await logAudit({
    user,
    action: "rental.payment",
    entityType: "Rental",
    entityId: rental.id,
    entityLabel: `${rental.vehicle.brand} ${rental.vehicle.model} - ${rental.customer.contactName}`,
    details: `${amountXof.toLocaleString("fr-BJ")} FCFA (${method})`,
  });

  revalidatePath("/rentals");
  revalidatePath("/dashboard");
}

export async function createRentalMaintenance(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);

  const vehicleId = String(formData.get("vehicleId") || "").trim();
  const type = String(formData.get("type") || "ENTRETIEN").trim().toUpperCase();
  const status = String(formData.get("status") || "PLANIFIE").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim();
  const costXof = Math.max(0, Math.round(Number(formData.get("costXof") || 0)));
  const garageName = String(formData.get("garageName") || "").trim() || null;
  const mileage = Math.round(Number(formData.get("mileage") || 0)) || null;
  const scheduledRaw = String(formData.get("scheduledAt") || "");
  const rentalId = String(formData.get("rentalId") || "").trim() || null;
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;

  if (!vehicleId) throw new Error("Véhicule requis.");
  if (!description) throw new Error("Décrivez l'entretien ou la réparation.");
  if (!["PLANIFIE", "EN_COURS", "TERMINE", "ANNULE"].includes(status)) {
    throw new Error("Statut de maintenance invalide.");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, brand: true, model: true, fleetType: true, rentalStatus: true },
  });
  if (!vehicle || vehicle.fleetType !== "RENTAL") throw new Error("Ce véhicule n'appartient pas au parc de location.");

  const maintenance = await prisma.rentalMaintenance.create({
    data: {
      vehicleId,
      rentalId,
      type,
      status,
      description,
      costXof,
      garageName,
      mileage,
      scheduledAt,
      startedAt: status === "EN_COURS" ? new Date() : null,
      completedAt: status === "TERMINE" ? new Date() : null,
      createdByName: user.fullName,
    },
    select: { id: true },
  });

  if (status === "PLANIFIE" || status === "EN_COURS") {
    const activeRental = await prisma.rental.count({ where: { vehicleId, status: "ACTIF" } });
    if (activeRental === 0) {
      await prisma.vehicle.update({ where: { id: vehicleId }, data: { rentalStatus: "MAINTENANCE" } });
    }
  }

  await logAudit({
    user,
    action: "rental.maintenance_create",
    entityType: "Vehicle",
    entityId: vehicleId,
    entityLabel: `${vehicle.brand} ${vehicle.model}`,
    details: `${type} - ${description} - ${costXof.toLocaleString("fr-BJ")} FCFA`,
  });

  revalidatePath("/rentals");
  revalidatePath("/dashboard");
}

export async function updateRentalMaintenanceStatus(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);

  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "").trim().toUpperCase();
  if (!id || !["PLANIFIE", "EN_COURS", "TERMINE", "ANNULE"].includes(status)) {
    throw new Error("Statut de maintenance invalide.");
  }

  const maintenance = await prisma.rentalMaintenance.update({
    where: { id },
    data: {
      status,
      startedAt: status === "EN_COURS" ? new Date() : undefined,
      completedAt: status === "TERMINE" ? new Date() : status === "PLANIFIE" || status === "EN_COURS" ? null : undefined,
    },
    include: { vehicle: { select: { id: true, brand: true, model: true } } },
  });

  const activeRental = await prisma.rental.count({ where: { vehicleId: maintenance.vehicleId, status: "ACTIF" } });
  if (activeRental === 0) {
    await prisma.vehicle.update({
      where: { id: maintenance.vehicleId },
      data: { rentalStatus: status === "PLANIFIE" || status === "EN_COURS" ? "MAINTENANCE" : "DISPONIBLE" },
    });
  }

  await logAudit({
    user,
    action: "rental.maintenance_status",
    entityType: "RentalMaintenance",
    entityId: maintenance.id,
    entityLabel: `${maintenance.vehicle.brand} ${maintenance.vehicle.model}`,
    details: `Statut ${status}`,
  });

  revalidatePath("/rentals");
  revalidatePath("/dashboard");
}

export async function generateRentalVehicleTechSheet(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);
  const vehicleId = String(formData.get("vehicleId") || "").trim();
  if (!vehicleId) throw new Error("Véhicule requis.");

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, brand: true, model: true },
  });
  if (!vehicle) throw new Error("Véhicule introuvable.");

  await ensureVehicleTechSheet(vehicleId, {
    preferDeepSeek: true,
    actorName: user.fullName,
    force: true,
  });

  await logAudit({
    user,
    action: "rental.tech_sheet_generate",
    entityType: "Vehicle",
    entityId: vehicle.id,
    entityLabel: `${vehicle.brand} ${vehicle.model}`,
    details: "Génération de la fiche technique par l'agent DeepSeek",
  });

  revalidatePath(`/rentals/${vehicleId}/fiche-technique`);
  revalidatePath("/rentals");
}

export async function approveRentalVehicleTechSheet(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);
  const vehicleId = String(formData.get("vehicleId") || "").trim();
  if (!vehicleId) throw new Error("Véhicule requis.");

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, brand: true, model: true },
  });
  if (!vehicle) throw new Error("Véhicule introuvable.");

  await approveVehicleTechSheet(vehicleId, user.fullName);

  await logAudit({
    user,
    action: "rental.tech_sheet_approve",
    entityType: "Vehicle",
    entityId: vehicle.id,
    entityLabel: `${vehicle.brand} ${vehicle.model}`,
    details: "Fiche technique approuvée et sauvegardée pour le modèle",
  });

  revalidatePath(`/rentals/${vehicleId}/fiche-technique`);
  revalidatePath("/rentals");
}

export async function updateRentalRequestStatus(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);
  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "").trim().toUpperCase();
  const allowed = ["NOUVELLE", "CONTACTEE", "CONFIRMEE", "ANNULEE"];
  if (!id || !allowed.includes(status)) throw new Error("Statut de demande invalide.");

  const requestRecord = await prisma.rentalRequest.update({
    where: { id },
    data: { status },
    include: { vehicle: { select: { brand: true, model: true } } },
  });

  await logAudit({
    user,
    action: "rental.request_status",
    entityType: "RentalRequest",
    entityId: requestRecord.id,
    entityLabel: `${requestRecord.vehicle.brand} ${requestRecord.vehicle.model} - ${requestRecord.customerName}`,
    details: `Statut ${status}`,
  });

  revalidatePath("/rentals");
}

export async function createRentalVehicle(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);

  const brand = String(formData.get("brand") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const variant = String(formData.get("variant") || "").trim() || null;
  const energy = String(formData.get("energy") || "").trim().toUpperCase();
  const vin = String(formData.get("vin") || "").trim().toUpperCase();
  const registrationNumber = String(formData.get("registrationNumber") || "").trim().toUpperCase();
  const priceXof = Math.round(Number(formData.get("priceXof") || 0));
  const rentalDailyXof = Math.round(Number(formData.get("rentalDailyXof") || 0)) || null;
  const rentalMonthlyXof = Math.round(Number(formData.get("rentalMonthlyXof") || 0)) || null;
  const yearRaw = Number(formData.get("year") || 0);
  const mileage = Math.max(0, Math.round(Number(formData.get("mileage") || 0)));
  const vehicleType = String(formData.get("vehicleType") || "").trim().toUpperCase() || null;
  const colorSelect = String(formData.get("color") || "").trim();
  const colorCustom = String(formData.get("colorCustom") || "").trim();
  const color = (colorSelect === "AUTRE" ? colorCustom : colorSelect) || null;
  const transmission = String(formData.get("transmission") || "").trim().toUpperCase() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const year = Number.isFinite(yearRaw) && yearRaw > 1900 ? Math.round(yearRaw) : null;

  if (!brand || !model || !energy || !vin || !registrationNumber || priceXof <= 0) {
    throw new Error("Marque, modèle, énergie, prix, numéro de châssis et plaque sont obligatoires.");
  }
  if (vin.length < 5) throw new Error("Le numéro de châssis est trop court.");
  if (registrationNumber.length < 4) throw new Error("La plaque d'immatriculation est trop courte.");

  const duplicate = await prisma.vehicle.findFirst({
    where: { OR: [{ vin }, { registrationNumber }] },
    select: { id: true, brand: true, model: true },
  });
  if (duplicate) {
    throw new Error("Un véhicule avec ce numéro de châssis ou cette plaque existe déjà.");
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      brand,
      model,
      variant,
      year,
      energy,
      priceXof,
      rentalDailyXof,
      rentalMonthlyXof,
      status: "EN_STOCK",
      fleetType: "RENTAL",
      rentalStatus: "DISPONIBLE",
      vin,
      registrationNumber,
      mileage,
      vehicleType,
      color,
      transmission,
      description,
    },
    select: { id: true, brand: true, model: true, registrationNumber: true },
  });

  await logAudit({
    user,
    action: "rental.vehicle_create",
    entityType: "Vehicle",
    entityId: vehicle.id,
    entityLabel: `${vehicle.brand} ${vehicle.model} - ${vehicle.registrationNumber || ""}`,
    details: "Création d'un véhicule du parc de location",
  });

  // La fiche technique est générée et sauvegardée dès l'entrée du véhicule en base.
  await ensureVehicleTechSheet(vehicle.id, {
    preferDeepSeek: true,
    actorName: user.fullName,
  }).catch((error) => {
    console.error("Fiche technique location non générée automatiquement:", error);
  });

  revalidatePath("/rentals");
  revalidatePath("/vehicles");
  revalidatePath("/location-vehicule");
  revalidatePath("/dashboard");
}


export async function createRental(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);

  const vehicleId = String(formData.get("vehicleId") || "").trim();
  const customerId = String(formData.get("customerId") || "").trim();
  const type = String(formData.get("type") || "LCD");
  const startRaw = String(formData.get("startDate") || "");
  const endRaw = String(formData.get("endDate") || "");
  const dailyXofInput = Math.round(Number(formData.get("dailyXof") || 0)) || null;
  const monthlyXof = Math.round(Number(formData.get("monthlyXof") || 0)) || null;
  const depositXof = Math.round(Number(formData.get("depositXof") || 0)) || null;
  const departureCondition = String(formData.get("departureCondition") || "").trim() || null;

  if (!vehicleId || !customerId) throw new Error("Véhicule et client obligatoires.");
  const startDate = startRaw ? new Date(startRaw) : new Date();
  if (Number.isNaN(startDate.getTime())) throw new Error("Date de début invalide.");
  const endDate = endRaw ? new Date(endRaw) : null;
  if (!endDate) throw new Error("La date de fin est obligatoire pour calculer la durée du contrat.");
  if (Number.isNaN(endDate.getTime())) throw new Error("Date de fin invalide.");
  if (endDate < startDate) throw new Error("La date de fin doit être postérieure à la date de début.");

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: {
      id: true,
      brand: true,
      model: true,
      fleetType: true,
      rentalStatus: true,
      rentalDailyXof: true,
      rentalMonthlyXof: true,
    },
  });
  if (!vehicle || vehicle.fleetType !== "RENTAL") {
    throw new Error("Ce véhicule n'appartient pas au parc de location.");
  }
  if (vehicle.rentalStatus !== "DISPONIBLE") {
    throw new Error("Ce véhicule de location n'est pas disponible.");
  }

  const days = rentalDaysBetween(startDate, endDate);
  if (days < 1) throw new Error("La durée du contrat doit être d'au moins un jour.");
  const dailyXof = dailyXofInput || vehicle.rentalDailyXof || null;
  const effectiveMonthlyXof = monthlyXof || vehicle.rentalMonthlyXof || null;
  const totalXof = computeRentalTotal({ dailyXof, monthlyXof: effectiveMonthlyXof, days });
  if (!totalXof) {
    throw new Error("Renseignez un tarif journalier ou un tarif mensuel pour calculer le total.");
  }

  const rental = await prisma.rental.create({
    data: {
      type,
      status: "ACTIF",
      customerId,
      vehicleId,
      startDate,
      endDate,
      dailyXof,
      monthlyXof: monthlyXof || null,
      days,
      totalXof,
      depositXof,
      departureCondition,
      contractToken: randomUUID(),
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
    details: `Contrat ${type} - ${days} jour(s) - ${totalXof.toLocaleString("fr-BJ")} FCFA`,
  });

  revalidatePath("/rentals");
  revalidatePath("/vehicles");
  revalidatePath("/location-vehicule");
  revalidatePath("/dashboard");
}

export async function markRentalContractSigned(formData: FormData) {
  const user = await requireUser([...MANAGE_ROLES]);
  requireManager(user.role);
  const id = String(formData.get("id") || "").trim();
  const signedByClient = String(formData.get("signedByClient") || "").trim();
  const signedByCompany = String(formData.get("signedByCompany") || "").trim();
  if (!id) throw new Error("Contrat introuvable.");
  if (!signedByClient || !signedByCompany) {
    throw new Error("Les noms des deux signataires sont obligatoires.");
  }

  const rental = await prisma.rental.update({
    where: { id },
    data: { signedAt: new Date(), signedByClient, signedByCompany },
    include: { customer: { select: { contactName: true } }, vehicle: { select: { brand: true, model: true } } },
  });

  await logAudit({
    user,
    action: "rental.contract_sign",
    entityType: "Rental",
    entityId: rental.id,
    entityLabel: `${rental.vehicle.brand} ${rental.vehicle.model} - ${rental.customer.contactName}`,
    details: `Contrat signé par ${signedByClient} et ${signedByCompany}`,
  });

  revalidatePath("/rentals");
  revalidatePath(`/rentals/${id}/contrat`);
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
  revalidatePath("/location-vehicule");
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

  // Réutilise la fiche existante du véhicule importé, sinon la génère pour le modèle.
  await ensureVehicleTechSheet(vehicleId, {
    preferDeepSeek: true,
    actorName: user.fullName,
  }).catch((error) => {
    console.error("Fiche technique location non générée au transfert:", error);
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
