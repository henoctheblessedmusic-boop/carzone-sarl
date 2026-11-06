"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const CATALOG_ROLES = [
  "PDG",
  "DG",
  "COMPTA",
  "STOCK_GARAGE",
  "GESTIONNAIRE_LOCATION",
  "DC",
  "COMMERCIAL",
  "ADMIN",
  "COMPTA_GARAGE",
] as const;

const ORDER_STATUSES = ["COMMANDE", "EN_TRANSIT", "AU_PORT", "EN_MAGASIN", "ANNULE"] as const;

export async function createGeneralPartOrder(input: {
  supplierId?: string | null;
  expectedAt?: string | null;
  notes?: string | null;
  lines: Array<{ generalPartId: string; quantity: number; unitPriceXof?: number | null }>;
}) {
  const user = await requireUser([...CATALOG_ROLES]);
  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    throw new Error("Sélectionnez au moins une référence à commander.");
  }

  const ids = Array.from(new Set(input.lines.map((line) => String(line.generalPartId))));
  const parts = await prisma.generalPart.findMany({
    where: { id: { in: ids }, active: true },
    select: { id: true, reference: true, name: true },
  });
  if (parts.length !== ids.length) throw new Error("Une ou plusieurs références sont introuvables.");

  const supplierId = input.supplierId?.trim() || null;
  if (supplierId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true } });
    if (!supplier) throw new Error("Fournisseur introuvable.");
  }

  const normalizedLines = input.lines.map((line) => ({
    generalPartId: line.generalPartId,
    quantity: Math.max(1, Math.floor(Number(line.quantity) || 1)),
    unitPriceXof: line.unitPriceXof == null ? null : Math.max(0, Math.round(Number(line.unitPriceXof))),
  }));

  const totalXof = normalizedLines.reduce((sum, line) => sum + (line.unitPriceXof || 0) * line.quantity, 0);
  const count = await prisma.generalPartOrder.count();
  const number = `CMD-GEN-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const order = await prisma.generalPartOrder.create({
    data: {
      number,
      supplierId,
      status: "COMMANDE",
      expectedAt: input.expectedAt ? new Date(input.expectedAt) : null,
      totalXof,
      notes: input.notes?.trim() || null,
      createdByName: user.fullName,
      lines: { create: normalizedLines },
    },
  });

  await logAudit({
    user,
    action: "general_part.order_create",
    entityType: "GeneralPartOrder",
    entityId: order.id,
    entityLabel: order.number,
    details: `${normalizedLines.length} référence(s) - ${totalXof.toLocaleString("fr-BJ")} FCFA`,
  });

  revalidatePath("/catalogue-pieces");
  return { success: true, number: order.number, orderId: order.id };
}

export async function updateGeneralPartOrderTracking(formData: FormData) {
  const user = await requireUser([...CATALOG_ROLES]);
  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "").trim().toUpperCase();
  const expectedRaw = String(formData.get("expectedAt") || "").trim();
  if (!id) throw new Error("Commande introuvable.");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    throw new Error("Statut de commande invalide.");
  }

  const order = await prisma.generalPartOrder.update({
    where: { id },
    data: {
      status,
      expectedAt: expectedRaw ? new Date(expectedRaw) : undefined,
      receivedAt: status === "EN_MAGASIN" ? new Date() : undefined,
    },
    select: { id: true, number: true, status: true },
  });

  await logAudit({
    user,
    action: "general_part.order_status",
    entityType: "GeneralPartOrder",
    entityId: order.id,
    entityLabel: order.number,
    details: `Statut ${status}`,
  });

  revalidatePath("/catalogue-pieces");
  return { success: true };
}
