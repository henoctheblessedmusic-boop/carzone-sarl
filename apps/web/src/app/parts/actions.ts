"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import type { Role } from "@/lib/roles";

const AUTHORIZED_ROLES: Role[] = [
  "PDG",
  "SG",
  "DG",
  "ADV",
  "RF",
  "RTA",
  "DC",
  "CHEF_ATELIER",
  "ATELIER",
  "STOCK",
  "COMPTA",
  "ADMIN",
];

export async function createPart(formData: FormData) {
  const user = await requireUser(AUTHORIZED_ROLES);

  const partNumber = String(formData.get("partNumber") || "").trim().toUpperCase();
  const name = String(formData.get("name") || "").trim();
  const oemNumber = String(formData.get("oemNumber") || "").trim().toUpperCase() || null;
  const category = String(formData.get("category") || "FREINAGE").trim().toUpperCase();
  const manufacturer = String(formData.get("manufacturer") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const unit = String(formData.get("unit") || "JEU").trim().toUpperCase();
  const stockQuantity = parseInt(String(formData.get("stockQuantity") || "0"), 10) || 0;
  const minStockAlert = parseInt(String(formData.get("minStockAlert") || "2"), 10) || 2;
  const purchasePriceXof = parseInt(String(formData.get("purchasePriceXof") || "0"), 10) || 0;
  const sellingPriceXof = parseInt(String(formData.get("sellingPriceXof") || "0"), 10) || 0;
  const description = String(formData.get("description") || "").trim() || null;

  // Références croisées optionnelles saisies à la création
  const initialCrossRef = String(formData.get("initialCrossRef") || "").trim().toUpperCase();
  const initialCrossBrand = String(formData.get("initialCrossBrand") || "").trim().toUpperCase();

  // Modèle compatible optionnel
  const compatBrand = String(formData.get("compatBrand") || "").trim().toUpperCase();
  const compatModel = String(formData.get("compatModel") || "").trim().toUpperCase();

  const part = await prisma.partItem.create({
    data: {
      partNumber,
      oemNumber,
      name,
      category,
      manufacturer,
      location,
      unit,
      stockQuantity,
      minStockAlert,
      purchasePriceXof,
      sellingPriceXof,
      description,
      ...(initialCrossRef && initialCrossBrand
        ? {
            crossReferences: {
              create: {
                crossReference: initialCrossRef,
                brand: initialCrossBrand,
                isDirectFit: true,
                notes: "Création initiale",
              },
            },
          }
        : {}),
      ...(compatBrand && compatModel
        ? {
            compatibilities: {
              create: {
                vehicleBrand: compatBrand,
                vehicleModel: compatModel,
                notes: "Modèle certifié",
              },
            },
          }
        : {}),
    },
  });

  // Si du stock initial a été renseigné, enregistrer le mouvement
  if (stockQuantity > 0) {
    await prisma.partStockMovement.create({
      data: {
        partItemId: part.id,
        type: "ENTREE_ACHAT",
        quantity: stockQuantity,
        unitPriceXof: purchasePriceXof,
        totalPriceXof: purchasePriceXof * stockQuantity,
        reason: "Inventaire initial / Stock de départ",
        performedBy: user.email,
      },
    });
  }

  revalidatePath("/parts");
  revalidatePath("/workshop");
  return { success: true, partId: part.id };
}

export async function updatePart(formData: FormData) {
  await requireUser(AUTHORIZED_ROLES);
  const id = String(formData.get("id"));

  const partNumber = String(formData.get("partNumber") || "").trim().toUpperCase();
  const name = String(formData.get("name") || "").trim();
  const oemNumber = String(formData.get("oemNumber") || "").trim().toUpperCase() || null;
  const category = String(formData.get("category") || "FREINAGE").trim().toUpperCase();
  const manufacturer = String(formData.get("manufacturer") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const unit = String(formData.get("unit") || "JEU").trim().toUpperCase();
  const minStockAlert = parseInt(String(formData.get("minStockAlert") || "2"), 10) || 2;
  const purchasePriceXof = parseInt(String(formData.get("purchasePriceXof") || "0"), 10) || 0;
  const sellingPriceXof = parseInt(String(formData.get("sellingPriceXof") || "0"), 10) || 0;
  const description = String(formData.get("description") || "").trim() || null;

  await prisma.partItem.update({
    where: { id },
    data: {
      partNumber,
      oemNumber,
      name,
      category,
      manufacturer,
      location,
      unit,
      minStockAlert,
      purchasePriceXof,
      sellingPriceXof,
      description,
    },
  });

  revalidatePath("/parts");
  revalidatePath("/workshop");
  return { success: true };
}

export async function deletePart(id: string) {
  await requireUser(["PDG", "SG", "DG", "DC", "CHEF_ATELIER", "ADMIN"]);
  await prisma.partItem.delete({
    where: { id },
  });
  revalidatePath("/parts");
  revalidatePath("/workshop");
  return { success: true };
}

export async function addCrossReference(formData: FormData) {
  await requireUser(AUTHORIZED_ROLES);
  const partItemId = String(formData.get("partItemId"));
  const crossReference = String(formData.get("crossReference") || "").trim().toUpperCase();
  const brand = String(formData.get("brand") || "").trim().toUpperCase();
  const notes = String(formData.get("notes") || "").trim() || null;
  const isDirectFit = formData.get("isDirectFit") === "true" || formData.get("isDirectFit") === "on";

  await prisma.partCrossReference.create({
    data: {
      partItemId,
      crossReference,
      brand,
      isDirectFit,
      notes,
    },
  });

  revalidatePath("/parts");
  return { success: true };
}

export async function deleteCrossReference(id: string) {
  await requireUser(AUTHORIZED_ROLES);
  await prisma.partCrossReference.delete({
    where: { id },
  });
  revalidatePath("/parts");
  return { success: true };
}

export async function addCompatibility(formData: FormData) {
  await requireUser(AUTHORIZED_ROLES);
  const partItemId = String(formData.get("partItemId"));
  const vehicleBrand = String(formData.get("vehicleBrand") || "").trim().toUpperCase();
  const vehicleModel = String(formData.get("vehicleModel") || "").trim().toUpperCase();
  const years = String(formData.get("years") || "").trim() || null;
  const engine = String(formData.get("engine") || "").trim() || null;
  const position = String(formData.get("position") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  await prisma.partCompatibility.create({
    data: {
      partItemId,
      vehicleBrand,
      vehicleModel,
      years,
      engine,
      position,
      notes,
    },
  });

  revalidatePath("/parts");
  return { success: true };
}

export async function deleteCompatibility(id: string) {
  await requireUser(AUTHORIZED_ROLES);
  await prisma.partCompatibility.delete({
    where: { id },
  });
  revalidatePath("/parts");
  return { success: true };
}

export async function recordStockMovement(formData: FormData) {
  const user = await requireUser(AUTHORIZED_ROLES);
  const partItemId = String(formData.get("partItemId"));
  const type = String(formData.get("type") || "ENTREE_ACHAT"); // ENTREE_ACHAT, SORTIE_ATELIER, RETOUR_STOCK, AJUSTEMENT_INVENTAIRE
  const quantity = Math.abs(parseInt(String(formData.get("quantity") || "1"), 10) || 1);
  const referenceDoc = String(formData.get("referenceDoc") || "").trim() || null;
  const reason = String(formData.get("reason") || "").trim() || null;

  const part = await prisma.partItem.findUnique({
    where: { id: partItemId },
  });
  if (!part) throw new Error("Pièce introuvable");

  let deltaQuantity = quantity;
  if (type === "SORTIE_ATELIER") {
    if (part.stockQuantity < quantity) {
      throw new Error(`Stock insuffisant (${part.stockQuantity} dispo, ${quantity} demandés)`);
    }
    deltaQuantity = -quantity;
  } else if (type === "AJUSTEMENT_INVENTAIRE") {
    // Si l'utilisateur saisit la quantité réelle comptée
    const targetStock = parseInt(String(formData.get("targetStock") || "0"), 10);
    deltaQuantity = targetStock - part.stockQuantity;
  }

  const newStock = Math.max(0, part.stockQuantity + deltaQuantity);

  await prisma.$transaction([
    prisma.partItem.update({
      where: { id: partItemId },
      data: { stockQuantity: newStock },
    }),
    prisma.partStockMovement.create({
      data: {
        partItemId,
        type,
        quantity: deltaQuantity,
        unitPriceXof: part.purchasePriceXof,
        totalPriceXof: Math.abs(deltaQuantity) * part.purchasePriceXof,
        referenceDoc,
        reason,
        performedBy: user.email,
      },
    }),
  ]);

  revalidatePath("/parts");
  revalidatePath("/workshop");
  return { success: true, newStock };
}

export async function assignPartToWorkshopEntry(formData: FormData) {
  const user = await requireUser(AUTHORIZED_ROLES);
  const workshopEntryId = String(formData.get("workshopEntryId") || "");
  const partItemId = String(formData.get("partItemId") || "");
  const quantity = Math.abs(parseInt(String(formData.get("quantity") || "1"), 10) || 1);
  const notes = String(formData.get("notes") || "").trim() || null;

  const entry = await prisma.workshopEntry.findUnique({
    where: { id: workshopEntryId },
    include: { workOrder: true },
  });
  if (!entry) throw new Error("Entrée atelier introuvable");

  const part = await prisma.partItem.findUnique({
    where: { id: partItemId },
  });
  if (!part) throw new Error("Pièce introuvable");

  if (part.stockQuantity < quantity) {
    throw new Error(`Stock insuffisant en magasin (${part.stockQuantity} disponible(s))`);
  }

  const unitPrice = part.sellingPriceXof || part.purchasePriceXof || 0;
  const totalPrice = unitPrice * quantity;

  await prisma.$transaction([
    // Sortie physique du stock
    prisma.partItem.update({
      where: { id: partItemId },
      data: { stockQuantity: { decrement: quantity } },
    }),
    // Traçabilité du mouvement
    prisma.partStockMovement.create({
      data: {
        partItemId,
        type: "SORTIE_ATELIER",
        quantity: -quantity,
        unitPriceXof: part.purchasePriceXof,
        totalPriceXof: quantity * part.purchasePriceXof,
        referenceDoc: entry.orNumber || entry.immatriculation,
        reason: `Imputation atelier véhicule ${entry.brand || ""} ${entry.model || ""} (${entry.immatriculation})`,
        performedBy: user.email,
      },
    }),
    // Affectation de la pièce sur l'OR
    prisma.workOrderPartUsage.create({
      data: {
        partItemId,
        workshopEntryId: entry.id,
        workOrderId: entry.workOrderId || null,
        quantity,
        unitPriceXof: unitPrice,
        totalPriceXof: totalPrice,
        notes,
      },
    }),
    // Mise à jour de l'OR si présent
    ...(entry.workOrder
      ? [
          prisma.workOrder.update({
            where: { id: entry.workOrder.id },
            data: {
              partsXof: { increment: totalPrice },
            },
          }),
        ]
      : []),
  ]);

  revalidatePath("/parts");
  revalidatePath("/workshop");
  return { success: true };
}
