"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import type {
  RentalWorkbookClient,
  RentalWorkbookContract,
  RentalWorkbookPreview,
  RentalWorkbookVehicle,
} from "@/lib/rental-workbook";

const IMPORT_ROLES = ["GESTIONNAIRE_LOCATION", "DG", "PDG", "SG"] as const;

export type RentalWorkbookImportResult = {
  clientsCreated: number;
  clientsMatched: number;
  vehiclesCreated: number;
  vehiclesMatched: number;
  contractsCreated: number;
  contractsSkipped: number;
  paymentsCreated: number;
  warnings: string[];
};

function text(value: string | null | undefined): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function clientLookupKey(client: Pick<RentalWorkbookClient, "contactName" | "phone" | "identityNumber">): string {
  if (client.identityNumber) return `ID:${client.identityNumber}`;
  return `NP:${text(client.contactName)}|${client.phone || ""}`;
}

/**
 * Importe le classeur location en trois entites. Le client envoie l'aperçu déjà
 * normalisé, mais le serveur revalide les champs critiques et ne supprime
 * jamais de données existantes.
 */
export async function importRentalWorkbook(input: {
  clients: RentalWorkbookClient[];
  vehicles: RentalWorkbookVehicle[];
  contracts: RentalWorkbookContract[];
  createHistoricalPayments: boolean;
}): Promise<RentalWorkbookImportResult> {
  const user = await requireUser([...IMPORT_ROLES]);
  if (!Array.isArray(input.clients) || !Array.isArray(input.vehicles) || !Array.isArray(input.contracts)) {
    throw new Error("Données d'import invalides.");
  }
  if (input.clients.length > 500 || input.vehicles.length > 50 || input.contracts.length > 2000) {
    throw new Error("Le fichier dépasse les limites d'import autorisées.");
  }

  const batchId = randomUUID();
  const warnings: string[] = [];
  let clientsCreated = 0;
  let clientsMatched = 0;
  let vehiclesCreated = 0;
  let vehiclesMatched = 0;
  let contractsCreated = 0;
  let contractsSkipped = 0;
  let paymentsCreated = 0;

  await prisma.$transaction(async (tx) => {
    const existingCustomers = await tx.customer.findMany({
      select: { id: true, contactName: true, phone: true, identityNumber: true },
    });
    const customersByIdentity = new Map<string, string>();
    const customersByContact = new Map<string, string>();
    for (const customer of existingCustomers) {
      if (customer.identityNumber) customersByIdentity.set(customer.identityNumber, customer.id);
      customersByContact.set(`NP:${text(customer.contactName)}|${customer.phone || ""}`, customer.id);
    }
    const customerIdByKey = new Map<string, string>();

    for (const client of input.clients) {
      if (!client.contactName?.trim()) {
        warnings.push(`Client ignoré sans nom : ${client.key}`);
        continue;
      }
      const key = clientLookupKey(client);
      const existingId = client.identityNumber
        ? customersByIdentity.get(client.identityNumber) || customersByContact.get(key)
        : customersByContact.get(key);
      if (existingId) {
        customerIdByKey.set(client.key, existingId);
        clientsMatched += 1;
        continue;
      }
      const created = await tx.customer.create({
        data: {
          contactName: client.contactName.trim(),
          companyName: client.companyName || null,
          phone: client.phone || null,
          address: client.address || null,
          city: "Cotonou",
          identityDocumentType: client.identityDocumentType || null,
          identityNumber: client.identityNumber || null,
          secondaryContact: client.secondaryContact || null,
          scopeShowroom: false,
          scopeGarage: false,
          scopeRental: true,
          source: "IMPORT_BASE_CLIENTS_LOCATION",
          active: true,
        },
        select: { id: true },
      });
      customerIdByKey.set(client.key, created.id);
      clientsCreated += 1;
    }

    const existingVehicles = await tx.vehicle.findMany({
      where: { fleetCode: { in: input.vehicles.map((vehicle) => vehicle.fleetCode) } },
      select: { id: true, fleetCode: true },
    });
    const vehicleIdByCode = new Map<string, string>();
    for (const vehicle of existingVehicles) {
      if (vehicle.fleetCode) vehicleIdByCode.set(vehicle.fleetCode, vehicle.id);
    }

    for (const vehicle of input.vehicles) {
      const existingId = vehicleIdByCode.get(vehicle.fleetCode);
      if (existingId) {
        vehiclesMatched += 1;
        continue;
      }
      const created = await tx.vehicle.create({
        data: {
          brand: vehicle.brand,
          model: vehicle.model,
          color: vehicle.color,
          exteriorColorBase: vehicle.color,
          exteriorColorShade: vehicle.color,
          year: vehicle.year,
          energy: vehicle.energy,
          seats: vehicle.seats,
          fleetCode: vehicle.fleetCode,
          fleetType: "RENTAL",
          rentalStatus: "DISPONIBLE",
          status: "EN_STOCK",
          source: "IMPORT_BASE_CLIENTS_LOCATION",
          priceXof: 0,
          priceToConfirm: false,
          isIncompleteSheet: false,
        },
        select: { id: true },
      });
      vehicleIdByCode.set(vehicle.fleetCode, created.id);
      vehiclesCreated += 1;
    }

    const existingSourceReferences = new Set(
      (
        await tx.rental.findMany({
          where: { sourceReference: { in: input.contracts.map((contract) => contract.sourceReference) } },
          select: { sourceReference: true },
        })
      )
        .map((rental) => rental.sourceReference)
        .filter((reference): reference is string => Boolean(reference)),
    );

    for (const contract of input.contracts) {
      if (existingSourceReferences.has(contract.sourceReference)) {
        contractsSkipped += 1;
        continue;
      }
      const customerId = customerIdByKey.get(contract.clientKey);
      const vehicleId = vehicleIdByCode.get(contract.fleetCode);
      if (!customerId || !vehicleId) {
        warnings.push(`Contrat ${contract.sourceReference} ignoré : client ou véhicule introuvable.`);
        contractsSkipped += 1;
        continue;
      }
      const startDate = contract.startDate ? new Date(contract.startDate) : contract.operationDate ? new Date(contract.operationDate) : new Date();
      const endDate = contract.endDate ? new Date(contract.endDate) : null;
      const created = await tx.rental.create({
        data: {
          type: "LCD",
          status: contract.status,
          customerId,
          vehicleId,
          startDate,
          endDate,
          days: contract.days > 0 ? contract.days : null,
          dailyXof: contract.dailyXof,
          totalXof: contract.amountXof,
          withDriver: contract.withDriver,
          operationDate: contract.operationDate ? new Date(contract.operationDate) : null,
          paymentMethod: contract.paymentMethod,
          paymentStatus: contract.paymentStatus,
          sourceReference: contract.sourceReference,
          importBatchId: batchId,
          notes: contract.warnings.length ? `Import historique : ${contract.warnings.join(", ")}` : "Import historique",
          createdByName: user.fullName,
        },
        select: { id: true },
      });
      contractsCreated += 1;

      if (input.createHistoricalPayments && contract.amountXof && contract.paymentStatus === "PAYE") {
        await tx.rentalPayment.create({
          data: {
            rentalId: created.id,
            amountXof: contract.amountXof,
            method: contract.paymentMethod || "ESPECES",
            reference: contract.sourceReference,
            paidAt: contract.operationDate ? new Date(contract.operationDate) : startDate,
            notes: "Paiement historique importé depuis la base clients location",
            createdByName: user.fullName,
          },
        });
        paymentsCreated += 1;
      }
    }

    const activeByVehicle = await tx.rental.groupBy({
      by: ["vehicleId"],
      where: { status: "ACTIF" },
      _count: { _all: true },
    });
    const activeVehicleIds = new Set(activeByVehicle.map((row) => row.vehicleId));
    for (const vehicleId of vehicleIdByCode.values()) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { rentalStatus: activeVehicleIds.has(vehicleId) ? "LOUE" : "DISPONIBLE" },
      });
    }
  }, { timeout: 30000 });

  await logAudit({
    user,
    action: "rental.workbook_import",
    entityType: "Rental",
    entityId: batchId,
    details: `${contractsCreated} contrat(s), ${clientsCreated} client(s), ${vehiclesCreated} vehicule(s), ${paymentsCreated} paiement(s)`,
  });

  revalidatePath("/rentals/fleet");
  revalidatePath("/rentals/contracts");
  revalidatePath("/rentals/import");
  revalidatePath("/clients");
  revalidatePath("/dashboard");

  return {
    clientsCreated,
    clientsMatched,
    vehiclesCreated,
    vehiclesMatched,
    contractsCreated,
    contractsSkipped,
    paymentsCreated,
    warnings,
  };
}
