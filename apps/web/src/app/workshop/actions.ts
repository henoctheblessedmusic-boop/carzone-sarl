"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { parseWorkshopExcel } from "@/lib/excel-workshop";

const WORKSHOP_ALLOWED_ROLES = [
  "PDG",
  "SG",
  "DG",
  "ADV",
  "RF",
  "RTA",
  "DC",
  "CHEF_ATELIER",
  "ASSISTANTE_COMPTABLE",
  "ATELIER",
  "COMPTA",
  "ADMIN",
] as const;

export async function importWorkshopExcel(formData: FormData) {
  await requireUser([...WORKSHOP_ALLOWED_ROLES]);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Veuillez sélectionner un fichier Excel (.xlsx, .xls ou .csv)");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { rows, sheetName } = parseWorkshopExcel(buffer);
  if (rows.length === 0) {
    throw new Error("Aucune ligne de passage de véhicule trouvée dans le fichier.");
  }

  let importedCount = 0;

  for (const row of rows) {
    // 1. Trouver ou créer le client pour enrichir la base de données globale
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { contactName: { equals: row.clientName, mode: "insensitive" } },
          ...(row.phone ? [{ phone: { equals: row.phone } }] : []),
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          contactName: row.clientName,
          phone: row.phone || null,
          category: row.clientType === "Interne" ? "Interne" : "Particulier",
          city: "Cotonou",
          notes: `Importé depuis fichier SAV atelier (${sheetName})`,
        },
      });
    }

    // 2. Lier au véhicule concession uniquement s'il existe déjà par son VIN (ex: vendu par Carzone)
    // Règle Métier : les véhicules clients de réparation ne sont JAMAIS créés dans le stock de vente.
    let vehicle = null;
    if (row.chassis) {
      vehicle = await prisma.vehicle.findFirst({
        where: { vin: row.chassis },
      });
    }

    // 3. Enregistrer l'entrée atelier
    await prisma.workshopEntry.create({
      data: {
        entryDate: row.entryDate || null,
        entryTime: row.entryTime || null,
        orNumber: row.orNumber || null,
        immatriculation: row.immatriculation,
        chassis: row.chassis || null,
        brand: row.brand || null,
        model: row.model || null,
        mileage: row.mileage || null,
        clientName: row.clientName,
        clientType: row.clientType || "Client",
        fuelLevel: row.fuelLevel || null,
        phone: row.phone || null,
        receptionist: row.receptionist || null,
        immobilizationDuration: row.immobilizationDuration || null,
        observations: row.observations || null,
        presenceSav: row.presenceSav || "NON",
        statusCode: row.statusCode || "C",
        endWorksAt: row.endWorksAt || null,
        executionDuration: row.executionDuration || null,
        worksDone: row.worksDone || null,
        exitDate: row.exitDate || null,
        exitTime: row.exitTime || null,
        deliverer: row.deliverer || null,
        paymentMode: row.paymentMode || null,
        customerId: customer.id,
        vehicleId: vehicle ? vehicle.id : null,
      },
    });

    importedCount++;
  }

  revalidatePath("/workshop");
  revalidatePath("/clients");
  revalidatePath("/vehicles");

  return { success: true, count: importedCount, sheetName };
}

export async function createWorkshopEntry(formData: FormData) {
  await requireUser([...WORKSHOP_ALLOWED_ROLES]);

  const immatriculation = String(formData.get("immatriculation") || "").trim().toUpperCase();
  const clientName = String(formData.get("clientName") || "").trim();

  if (!immatriculation || !clientName) {
    throw new Error("L'immatriculation et le nom du client sont obligatoires.");
  }

  const mileageRaw = formData.get("mileage");
  const mileage = mileageRaw ? Number(mileageRaw) : null;

  // Clé primaire / N° d'ordre auto (si non fourni ou vide)
  let orNumber = String(formData.get("orNumber") || "").replace(/^#/, "").trim();
  if (!orNumber) {
    const all = await prisma.workshopEntry.findMany({ select: { orNumber: true } });
    let max = 0;
    for (const e of all) {
      if (e.orNumber) {
        const n = parseInt(e.orNumber.replace(/\D/g, ""), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    }
    orNumber = String(max > 0 ? max + 1 : all.length + 1);
  }

  // Création / liaison du client
  const phone = String(formData.get("phone") || "").trim() || null;
  const customerIdRaw = String(formData.get("customerId") || "").trim();
  let customer = null;

  if (customerIdRaw && !customerIdRaw.startsWith("workshop_")) {
    customer = await prisma.customer.findUnique({
      where: { id: customerIdRaw },
    });
  }

  if (!customer) {
    customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { contactName: { equals: clientName, mode: "insensitive" } },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });
  }

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        contactName: clientName,
        phone,
        category: String(formData.get("clientType") || "Client"),
        city: "Cotonou",
      },
    });
  } else if (phone && !customer.phone) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { phone },
    });
  }

  const brand = String(formData.get("brand") || "").trim() || null;
  const model = String(formData.get("model") || "").trim() || null;
  const chassis = String(formData.get("chassis") || "").trim() || null;

  let vehicle = null;
  if (chassis) {
    vehicle = await prisma.vehicle.findFirst({
      where: { vin: chassis },
    });
  }
  // Règle Métier : les voitures clients immatriculées sont des réparations atelier, pas du stock.

  await prisma.workshopEntry.create({
    data: {
      entryDate: String(formData.get("entryDate") || "").trim() || null,
      entryTime: String(formData.get("entryTime") || "").trim() || null,
      orNumber,
      immatriculation,
      chassis,
      brand,
      model,
      mileage,
      clientName,
      clientType: String(formData.get("clientType") || "Client").trim() || "Client",
      fuelLevel: String(formData.get("fuelLevel") || "").trim() || null,
      phone,
      receptionist: String(formData.get("receptionist") || "").trim() || null,
      immobilizationDuration: String(formData.get("immobilizationDuration") || "").trim() || null,
      observations: String(formData.get("observations") || "").trim() || null,
      presenceSav: String(formData.get("presenceSav") || "NON").trim() || "NON",
      statusCode: String(formData.get("statusCode") || "C").trim().toUpperCase(),
      endWorksAt: String(formData.get("endWorksAt") || "").trim() || null,
      executionDuration: String(formData.get("executionDuration") || "").trim() || null,
      worksDone: String(formData.get("worksDone") || "").trim() || null,
      exitDate: String(formData.get("exitDate") || "").trim() || null,
      exitTime: String(formData.get("exitTime") || "").trim() || null,
      deliverer: String(formData.get("deliverer") || "").trim() || null,
      paymentMode: String(formData.get("paymentMode") || "").trim() || null,
      customerId: customer.id,
      vehicleId: vehicle ? vehicle.id : null,
    },
  });

  revalidatePath("/workshop");
  revalidatePath("/clients");
  revalidatePath("/vehicles");
}

export async function updateWorkshopEntry(formData: FormData) {
  await requireUser([...WORKSHOP_ALLOWED_ROLES]);

  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("ID d'entrée atelier requis");

  const mileageRaw = formData.get("mileage");
  const mileage = mileageRaw ? Number(mileageRaw) : null;

  const existing = await prisma.workshopEntry.findUnique({ where: { id } });
  let orNumber = String(formData.get("orNumber") || "").replace(/^#/, "").trim();
  if (!orNumber) {
    orNumber = existing?.orNumber || "";
  }

  await prisma.workshopEntry.update({
    where: { id },
    data: {
      entryDate: String(formData.get("entryDate") || "").trim() || null,
      entryTime: String(formData.get("entryTime") || "").trim() || null,
      orNumber: orNumber || null,
      immatriculation: String(formData.get("immatriculation") || "").trim().toUpperCase(),
      chassis: String(formData.get("chassis") || "").trim() || null,
      brand: String(formData.get("brand") || "").trim() || null,
      model: String(formData.get("model") || "").trim() || null,
      mileage,
      clientName: String(formData.get("clientName") || "").trim(),
      clientType: String(formData.get("clientType") || "Client").trim() || "Client",
      fuelLevel: String(formData.get("fuelLevel") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
      receptionist: String(formData.get("receptionist") || "").trim() || null,
      immobilizationDuration: String(formData.get("immobilizationDuration") || "").trim() || null,
      observations: String(formData.get("observations") || "").trim() || null,
      presenceSav: String(formData.get("presenceSav") || "NON").trim() || "NON",
      statusCode: String(formData.get("statusCode") || "C").trim().toUpperCase(),
      endWorksAt: String(formData.get("endWorksAt") || "").trim() || null,
      executionDuration: String(formData.get("executionDuration") || "").trim() || null,
      worksDone: String(formData.get("worksDone") || "").trim() || null,
      exitDate: String(formData.get("exitDate") || "").trim() || null,
      exitTime: String(formData.get("exitTime") || "").trim() || null,
      deliverer: String(formData.get("deliverer") || "").trim() || null,
      paymentMode: String(formData.get("paymentMode") || "").trim() || null,
    },
  });

  revalidatePath("/workshop");
  revalidatePath("/clients");
  revalidatePath("/vehicles");
}

export async function deleteWorkshopEntry(id: string) {
  await requireUser([...WORKSHOP_ALLOWED_ROLES]);

  await prisma.workshopEntry.delete({
    where: { id },
  });

  revalidatePath("/workshop");
}


export async function seedRealWorkshopData() {
  return { success: false, message: "Le chargement de données de test est désactivé sur Carzone." };
}
