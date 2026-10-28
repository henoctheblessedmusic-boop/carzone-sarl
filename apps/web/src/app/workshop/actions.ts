"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { parseWorkshopExcel } from "@/lib/excel-workshop";
import {
  CHECKLIST_STATUSES,
  MAINTENANCE_TIERS,
  SIGNER_ROLES,
  type WorkshopTabletPayload,
} from "@/lib/workshop-types";

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

const tierSchema = z.number().int().refine(
  (value) => (MAINTENANCE_TIERS as readonly number[]).includes(value),
  { message: "Palier d'entretien invalide" },
);

const signatureDataSchema = z
  .string()
  .regex(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/, {
    message: "Format de signature invalide",
  });

const tabletInspectionSchema = z.object({
  id: z.string().min(1),
  reportedFault: z.string().optional(),
  maintenanceTier: tierSchema.optional(),
  faultMotorTransmission: z.string().optional(),
  faultSuspension: z.string().optional(),
  faultElectricity: z.string().optional(),
  faultOthers: z.string().optional(),
  worksDone: z.string().optional(),
  partsToOrder: z.string().optional(),
  observations: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  technicianName: z.string().optional(),
  workshopManagerName: z.string().optional(),
  checklistItems: z
    .array(
      z.object({
        taskLabel: z.string().min(1),
        category: z.string().nullish(),
        mileageTier: tierSchema,
        status: z.enum(CHECKLIST_STATUSES),
        observation: z.string().nullish(),
      }),
    )
    .optional(),
  signatures: z
    .array(
      z.object({
        signerRole: z.enum(SIGNER_ROLES),
        signerName: z.string().min(1),
        signatureData: signatureDataSchema,
      }),
    )
    .optional(),
});

export async function saveWorkshopTabletInspection(payload: WorkshopTabletPayload) {
  await requireUser([...WORKSHOP_ALLOWED_ROLES]);

  // 0. Validation runtime (Zod) : aucune valeur hors énumération métier ne doit
  //    atteindre la base de production, même via un appelant autre que l'UI.
  //    On retourne une erreur structurée (et non un throw) : Next.js redacte les
  //    messages des erreurs levées par une Server Action en production.
  const parsed = tabletInspectionSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "Données de fiche atelier invalides ou incomplètes. Vérifiez la fiche puis réessayez.",
    };
  }

  const { id, checklistItems, signatures, ...fields } = parsed.data;

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() || headersList.get("x-real-ip") || null;

  // 1. Tout est écrit dans UNE seule transaction : si une étape échoue, rien
  //    n'est perdu ni laissé à moitié enregistré. Les erreurs Prisma sont
  //    transformées en résultat structuré (Next.js redacte les throws en prod).
  try {
    await prisma.$transaction(
    async (tx) => {
      await tx.workshopEntry.update({
        where: { id },
        data: {
          reportedFault: fields.reportedFault || null,
          maintenanceTier: fields.maintenanceTier || null,
          faultMotorTransmission: fields.faultMotorTransmission || null,
          faultSuspension: fields.faultSuspension || null,
          faultElectricity: fields.faultElectricity || null,
          faultOthers: fields.faultOthers || null,
          worksDone: fields.worksDone || null,
          partsToOrder: fields.partsToOrder || null,
          observations: fields.observations || null,
          startTime: fields.startTime || null,
          endTime: fields.endTime || null,
          technicianName: fields.technicianName || null,
          workshopManagerName: fields.workshopManagerName || null,
        },
      });

      // 2. Checklist : mise à jour ligne par ligne (par taskLabel) au lieu d'un
      //    delete-all + recreate. On préserve `checkedAt` (horodatage réel de la
      //    première exécution) et on ne détruit pas les lignes des autres paliers.
      if (checklistItems && checklistItems.length > 0) {
        const existingItems = await tx.workshopChecklistItem.findMany({
          where: { workshopEntryId: id },
        });
        const existingByLabel = new Map(
          existingItems.map((item) => [item.taskLabel, item]),
        );

        for (const [index, item] of checklistItems.entries()) {
          const existing = existingByLabel.get(item.taskLabel);
          // On ne perd jamais un horodatage déjà posé : même si la tâche est
          // décochée puis reco­chée plus tard, la date de première exécution reste.
          const checkedAt =
            item.status === "EFFECTUE"
              ? (existing?.checkedAt ?? new Date())
              : (existing?.checkedAt ?? null);

          if (existing) {
            await tx.workshopChecklistItem.update({
              where: { id: existing.id },
              data: {
                mileageTier: item.mileageTier,
                category: item.category || null,
                status: item.status,
                observation: item.observation || null,
                checkedAt,
                sortOrder: index,
              },
            });
            existingByLabel.delete(item.taskLabel);
          } else {
            await tx.workshopChecklistItem.create({
              data: {
                workshopEntryId: id,
                mileageTier: item.mileageTier,
                taskLabel: item.taskLabel,
                category: item.category || null,
                status: item.status,
                observation: item.observation || null,
                checkedAt,
                sortOrder: index,
              },
            });
          }
        }

        // Lignes orphelines (tâches retirées de la matrice) : supprimées proprement.
        if (existingByLabel.size > 0) {
          await tx.workshopChecklistItem.deleteMany({
            where: { id: { in: [...existingByLabel.values()].map((item) => item.id) } },
          });
        }
      }

      // 3. Signatures : upsert par rôle, IP de provenance conservée pour la
      //    traçabilité juridique, `signatureData` déjà validée (data URL PNG/JPEG).
      if (signatures && signatures.length > 0) {
        const existingSignatures = await tx.workshopSignature.findMany({
          where: { workshopEntryId: id },
        });
        const existingByRole = new Map(
          existingSignatures.map((signature) => [signature.signerRole, signature]),
        );

        for (const sig of signatures) {
          const existing = existingByRole.get(sig.signerRole);
          if (existing) {
            await tx.workshopSignature.update({
              where: { id: existing.id },
              data: {
                signerName: sig.signerName,
                signatureData: sig.signatureData,
                signedAt: new Date(),
                ...(existing.ipAddress ? {} : { ipAddress }),
              },
            });
          } else {
            await tx.workshopSignature.create({
              data: {
                workshopEntryId: id,
                signerRole: sig.signerRole,
                signerName: sig.signerName,
                signatureData: sig.signatureData,
                ipAddress,
              },
            });
          }
        }
      }
      },
      { timeout: 15000 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 : collision sur (workshopEntryId, taskLabel) — une autre tablette
      // a sauvegardé la même fiche en même temps. Rien n'est corrompu (la
      // transaction est annulée) : on demande une nouvelle tentative.
      if (error.code === "P2002") {
        return {
          success: false as const,
          error:
            "Cette fiche a été mise à jour en parallèle par un autre poste. Rechargez la fiche puis réessayez : votre saisie est conservée.",
        };
      }
      // P2025 : fiche supprimée entre-temps ou identifiant inconnu.
      if (error.code === "P2025") {
        return {
          success: false as const,
          error: "Cette fiche atelier est introuvable ou a été supprimée. Rechargez la liste des passages.",
        };
      }
    }
    console.error("Erreur sauvegarde tablette atelier :", error);
    return {
      success: false as const,
      error: "Erreur serveur lors de la sauvegarde. La fiche n'a pas été enregistrée, veuillez réessayer.",
    };
  }

  revalidatePath("/workshop");
  revalidatePath(`/workshop/${id}/fiche-intervention`);
  revalidatePath(`/workshop/${id}/fiche-entretien`);
  return { success: true as const };
}

export async function seedRealWorkshopData() {
  return { success: false, message: "Le chargement de données de test est désactivé sur Carzone." };
}
