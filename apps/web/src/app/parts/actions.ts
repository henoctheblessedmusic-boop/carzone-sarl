"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import type { Role } from "@/lib/roles";
import { logAudit } from "@/lib/audit";

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
  "STOCK_GARAGE",
  "COMPTA",
  "COMPTA_GARAGE",
  "ADMIN",
];

export async function createPart(formData: FormData) {
  const user = await requireUser(AUTHORIZED_ROLES);

  const partNumber = String(formData.get("partNumber") || "").trim().toUpperCase();
  const name = String(formData.get("name") || "").trim();
  const oemNumber = String(formData.get("oemNumber") || "").trim().toUpperCase() || null;
  const category = String(formData.get("category") || "FREINAGE").trim().toUpperCase();
  const system = String(formData.get("system") || "").trim().toUpperCase() || null;
  const subcategory = String(formData.get("subcategory") || "").trim().toUpperCase() || null;
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
  const initialCrossRefType = String(formData.get("initialCrossRefType") || "EQUIVALENT").trim().toUpperCase();

  // Modèle compatible optionnel
  const compatBrand = String(formData.get("compatBrand") || "").trim().toUpperCase();
  const compatModel = String(formData.get("compatModel") || "").trim().toUpperCase();

  const part = await prisma.partItem.create({
    data: {
      partNumber,
      oemNumber,
      name,
      category,
      system,
      subcategory,
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
                referenceType: initialCrossRefType,
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

  await logAudit({
    user,
    action: "part.create",
    entityType: "PartItem",
    entityId: part.id,
    entityLabel: `${part.partNumber} · ${part.name}`,
  });

  revalidatePath("/parts");
  revalidatePath("/workshop");
  return { success: true, partId: part.id };
}

export async function updatePart(formData: FormData) {
  const user = await requireUser(AUTHORIZED_ROLES);
  const id = String(formData.get("id"));
  const currentPart = await prisma.partItem.findUnique({
    where: { id },
    select: { system: true, subcategory: true },
  });

  const partNumber = String(formData.get("partNumber") || "").trim().toUpperCase();
  const name = String(formData.get("name") || "").trim();
  const oemNumber = String(formData.get("oemNumber") || "").trim().toUpperCase() || null;
  const category = String(formData.get("category") || "FREINAGE").trim().toUpperCase();
  const system = String(formData.get("system") || "").trim().toUpperCase() || currentPart?.system || null;
  const subcategory = String(formData.get("subcategory") || "").trim().toUpperCase() || currentPart?.subcategory || null;
  const manufacturer = String(formData.get("manufacturer") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const unit = String(formData.get("unit") || "JEU").trim().toUpperCase();
  const minStockAlert = parseInt(String(formData.get("minStockAlert") || "2"), 10) || 2;
  const purchasePriceXof = parseInt(String(formData.get("purchasePriceXof") || "0"), 10) || 0;
  const sellingPriceXof = parseInt(String(formData.get("sellingPriceXof") || "0"), 10) || 0;
  const description = String(formData.get("description") || "").trim() || null;

  const updated = await prisma.partItem.update({
    where: { id },
    data: {
      partNumber,
      oemNumber,
      name,
      category,
      system,
      subcategory,
      manufacturer,
      location,
      unit,
      minStockAlert,
      purchasePriceXof,
      sellingPriceXof,
      description,
    },
  });

  await logAudit({
    user,
    action: "part.update",
    entityType: "PartItem",
    entityId: updated.id,
    entityLabel: `${updated.partNumber} · ${updated.name}`,
  });

  revalidatePath("/parts");
  revalidatePath("/workshop");
  return { success: true };
}

export async function deletePart(id: string) {
  const user = await requireUser(["PDG", "SG", "DG", "DC", "CHEF_ATELIER", "ADMIN"]);
  const existing = await prisma.partItem.findUnique({ where: { id }, select: { partNumber: true, name: true } });
  await prisma.partItem.delete({
    where: { id },
  });
  await logAudit({
    user,
    action: "part.delete",
    entityType: "PartItem",
    entityId: id,
    entityLabel: existing ? `${existing.partNumber} · ${existing.name}` : id,
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
  const referenceType = String(formData.get("referenceType") || "EQUIVALENT").trim().toUpperCase();
  const notes = String(formData.get("notes") || "").trim() || null;
  const isDirectFit = formData.get("isDirectFit") === "true" || formData.get("isDirectFit") === "on";

  await prisma.partCrossReference.create({
    data: {
      partItemId,
      crossReference,
      brand,
      referenceType,
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

  await logAudit({
    user,
    action: "part.stock_movement",
    entityType: "PartItem",
    entityId: partItemId,
    entityLabel: `${part.partNumber} · ${part.name}`,
    details: `${type} : ${deltaQuantity > 0 ? "+" : ""}${deltaQuantity}${reason ? ` (${reason})` : ""}`,
  });

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

  await logAudit({
    user,
    action: "part.assign_to_workshop_entry",
    entityType: "PartItem",
    entityId: partItemId,
    entityLabel: `${part.partNumber} · ${part.name}`,
    activity: "GARAGE",
    details: `Imputé sur OR ${entry.orNumber || entry.immatriculation} (x${quantity})`,
  });

  revalidatePath("/parts");
  revalidatePath("/workshop");
  return { success: true };
}

type PartOrderInputLine = {
  partItemId: string;
  quantity: number;
  unitPriceXof?: number;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
  notes?: string | null;
};

/**
 * Crée une commande groupée de pièces auprès d'un seul fournisseur.
 * Les lignes peuvent concerner plusieurs véhicules compatibles à la fois.
 */
export async function createPartOrder(input: {
  supplierId: string;
  notes?: string;
  lines: PartOrderInputLine[];
}) {
  const user = await requireUser([...AUTHORIZED_ROLES, "COMMERCIAL"]);
  const supplierId = String(input.supplierId || "").trim();
  if (!supplierId) throw new Error("Fournisseur obligatoire.");
  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    throw new Error("Ajoutez au moins une pièce à la commande.");
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier || !supplier.active) throw new Error("Fournisseur introuvable ou inactif.");

  const partIds = Array.from(new Set(input.lines.map((line) => String(line.partItemId))));
  const parts = await prisma.partItem.findMany({
    where: { id: { in: partIds } },
    select: { id: true, partNumber: true, name: true, purchasePriceXof: true },
  });
  const partsById = new Map(parts.map((part) => [part.id, part]));
  if (parts.length !== partIds.length) throw new Error("Une ou plusieurs pièces sont introuvables.");

  const normalizedLines = input.lines.map((line) => {
    const part = partsById.get(String(line.partItemId));
    if (!part) throw new Error("Pièce introuvable.");
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
    const unitPriceXof = Math.max(
      0,
      Math.round(Number(line.unitPriceXof) || part.purchasePriceXof || 0)
    );
    return {
      partItemId: part.id,
      quantity,
      unitPriceXof,
      totalXof: quantity * unitPriceXof,
      vehicleBrand: line.vehicleBrand?.trim() || null,
      vehicleModel: line.vehicleModel?.trim() || null,
      notes: line.notes?.trim() || null,
    };
  });

  const totalXof = normalizedLines.reduce((sum, line) => sum + line.totalXof, 0);
  const count = await prisma.partOrder.count();
  const number = `CMD-PC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const order = await prisma.partOrder.create({
    data: {
      number,
      supplierId,
      status: "BROUILLON",
      totalXof,
      notes: input.notes?.trim() || null,
      createdByName: user.fullName,
      lines: {
        create: normalizedLines.map((line) => ({
          partItemId: line.partItemId,
          quantity: line.quantity,
          unitPriceXof: line.unitPriceXof,
          totalXof: line.totalXof,
          vehicleBrand: line.vehicleBrand,
          vehicleModel: line.vehicleModel,
          notes: line.notes,
        })),
      },
    },
    include: { lines: true },
  });

  await logAudit({
    user,
    action: "part.order_create",
    entityType: "PartOrder",
    entityId: order.id,
    entityLabel: order.number,
    details: `${normalizedLines.length} ligne(s) - ${totalXof.toLocaleString("fr-BJ")} FCFA - ${supplier.name}`,
  });

  revalidatePath("/parts");
  revalidatePath("/parts/catalogue");
  return { success: true, orderId: order.id, number: order.number };
}

export async function updatePartOrderStatus(formData: FormData) {
  const user = await requireUser([...AUTHORIZED_ROLES, "COMMERCIAL"]);
  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "").trim().toUpperCase();
  const allowed = ["BROUILLON", "CONFIRMEE", "RECUE", "ANNULEE"];
  if (!id || !allowed.includes(status)) throw new Error("Statut de commande invalide.");

  const order = await prisma.partOrder.update({
    where: { id },
    data: { status },
    select: { id: true, number: true, totalXof: true },
  });

  await logAudit({
    user,
    action: "part.order_status",
    entityType: "PartOrder",
    entityId: order.id,
    entityLabel: order.number,
    details: `Statut ${status}`,
  });

  revalidatePath("/parts/catalogue");
  revalidatePath("/parts");
  return { success: true };
}
