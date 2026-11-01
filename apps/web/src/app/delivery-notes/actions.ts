"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { nextDeliveryNoteNumber } from "@/lib/format";
import { ACTIVITY, peutGererBL, type Activity } from "@/lib/permissions";

const DELIVERY_NOTE_ROLES = [
  "PDG",
  "SG",
  "DG",
  "ADV",
  "RF",
  "COMPTA",
  "COMPTA_GARAGE",
  "ADMIN",
] as const;

/** Statuts véhicule qui interdisent tout nouveau déstockage (déjà sorti du parc vendable). */
const VEHICLE_NON_VENDABLE_STATUSES = ["VENDU", "ARCHIVE"] as const;

const lineSchema = z
  .object({
    description: z.string().min(1, "Description requise"),
    quantity: z.number().int().min(1).default(1),
    unitPriceXof: z.number().int().min(0).nullish(),
    vehicleId: z.string().nullish(),
    partItemId: z.string().nullish(),
  })
  .refine((l) => Boolean(l.vehicleId) || Boolean(l.partItemId), {
    message: "Chaque ligne doit référencer un véhicule ou une pièce.",
  });

const createSchema = z.object({
  activity: z.enum([ACTIVITY.SHOWROOM, ACTIVITY.GARAGE]),
  customerId: z.string().nullish(),
  quoteId: z.string().nullish(),
  invoiceId: z.string().nullish(),
  vehicleId: z.string().nullish(),
  notes: z.string().nullish(),
  lines: z.array(lineSchema).min(1, "Au moins une ligne est requise"),
});

export type CreateDeliveryNoteInput = z.infer<typeof createSchema>;

function requireBLAuthorization(role: string, activity: Activity) {
  if (!peutGererBL(role as Parameters<typeof peutGererBL>[0], activity)) {
    throw new Error(
      activity === ACTIVITY.GARAGE
        ? "Seules la Comptable Garage, la Comptabilité ou la direction peuvent gérer un BL garage."
        : "Seule la Comptabilité ou la direction peuvent gérer un BL showroom."
    );
  }
}

/**
 * Crée le bon de livraison interne ET déstocke les lignes dans une seule transaction.
 * Toute erreur (stock insuffisant, véhicule indisponible, incohérence d'activité) annule
 * intégralement la création : aucun BL "orphelin" ne peut exister sans son mouvement de stock.
 */
export async function createAndIssueDeliveryNote(payload: CreateDeliveryNoteInput) {
  const user = await requireUser([...DELIVERY_NOTE_ROLES]);
  const parsed = createSchema.parse(payload);
  const activity = parsed.activity as Activity;

  requireBLAuthorization(user.role, activity);

  if (parsed.quoteId) {
    const quote = await prisma.quote.findUnique({ where: { id: parsed.quoteId }, select: { activity: true } });
    if (!quote) throw new Error("Devis introuvable.");
    if (quote.activity !== activity) {
      throw new Error("Le devis lié appartient à un autre périmètre d'activité (showroom/garage).");
    }
  }
  if (parsed.invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: parsed.invoiceId }, select: { activity: true } });
    if (!invoice) throw new Error("Facture introuvable.");
    if (invoice.activity !== activity) {
      throw new Error("La facture liée appartient à un autre périmètre d'activité (showroom/garage).");
    }
  }

  const note = await prisma.$transaction(async (tx) => {
    const count = await tx.deliveryNote.count({ where: { activity } });
    const number = nextDeliveryNoteNumber(activity, count);

    const created = await tx.deliveryNote.create({
      data: {
        number,
        activity,
        status: "EMIS",
        customerId: parsed.customerId || null,
        quoteId: parsed.quoteId || null,
        invoiceId: parsed.invoiceId || null,
        vehicleId: parsed.vehicleId || null,
        notes: parsed.notes || null,
        createdByName: user.fullName,
        lines: {
          create: parsed.lines.map((l) => ({
            description: l.description,
            quantity: l.quantity,
            unitPriceXof: l.unitPriceXof ?? null,
            vehicleId: l.vehicleId || null,
            partItemId: l.partItemId || null,
          })),
        },
      },
      include: { lines: true },
    });

    for (const line of created.lines) {
      if (line.vehicleId) {
        const vehicle = await tx.vehicle.findUnique({
          where: { id: line.vehicleId },
          select: { brand: true, model: true, status: true },
        });
        if (!vehicle) throw new Error("Véhicule introuvable.");

        const result = await tx.vehicle.updateMany({
          where: { id: line.vehicleId, status: { notIn: [...VEHICLE_NON_VENDABLE_STATUSES] } },
          data: { status: "VENDU" },
        });
        if (result.count === 0) {
          throw new Error(
            `Véhicule ${vehicle.brand} ${vehicle.model} indisponible pour le déstockage (déjà vendu ou archivé).`
          );
        }
      }

      if (line.partItemId) {
        const part = await tx.partItem.findUnique({ where: { id: line.partItemId } });
        if (!part) throw new Error("Pièce introuvable.");

        const result = await tx.partItem.updateMany({
          where: { id: line.partItemId, stockQuantity: { gte: line.quantity } },
          data: { stockQuantity: { decrement: line.quantity } },
        });
        if (result.count === 0) {
          throw new Error(
            `Stock insuffisant pour ${part.name} (disponible ${part.stockQuantity}, demandé ${line.quantity}).`
          );
        }

        await tx.partStockMovement.create({
          data: {
            partItemId: line.partItemId,
            type: "SORTIE_ATELIER",
            quantity: -line.quantity,
            unitPriceXof: part.purchasePriceXof,
            totalPriceXof: line.quantity * part.purchasePriceXof,
            referenceDoc: created.number,
            reason: `Déstockage BL interne ${created.number}`,
            performedBy: user.email,
          },
        });
      }
    }

    return created;
  });

  revalidatePath("/delivery-notes");
  revalidatePath("/parts");
  revalidatePath("/vehicles");
  return { id: note.id, number: note.number };
}

/** Annule un BL émis : motif obligatoire (>= 8 caractères) + restitution des mouvements inverses. */
export async function cancelDeliveryNote(formData: FormData) {
  const user = await requireUser([...DELIVERY_NOTE_ROLES]);
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("cancelReason") || "").trim();
  if (reason.length < 8) {
    throw new Error("Le motif d'annulation doit contenir au moins 8 caractères.");
  }

  const note = await prisma.deliveryNote.findUniqueOrThrow({
    where: { id },
    include: { lines: true },
  });

  requireBLAuthorization(user.role, note.activity as Activity);

  if (note.status === "ANNULE") {
    throw new Error("Ce bon de livraison est déjà annulé.");
  }
  if (note.status !== "EMIS") {
    throw new Error("Seul un bon de livraison émis (EMIS) peut être annulé.");
  }

  await prisma.$transaction(async (tx) => {
    // Garde atomique : transition EMIS -> ANNULE une seule fois, même en cas de double clic.
    const guarded = await tx.deliveryNote.updateMany({
      where: { id, status: "EMIS" },
      data: {
        status: "ANNULE",
        cancelReason: reason,
        cancelledAt: new Date(),
        cancelledByName: user.fullName,
      },
    });
    if (guarded.count === 0) {
      throw new Error("Ce bon de livraison a déjà été annulé entre-temps.");
    }

    for (const line of note.lines) {
      if (line.vehicleId) {
        await tx.vehicle.updateMany({
          where: { id: line.vehicleId, status: "VENDU" },
          data: { status: "EN_STOCK" },
        });
      }

      if (line.partItemId) {
        const movement = await tx.partStockMovement.findFirst({
          where: { referenceDoc: note.number, partItemId: line.partItemId, type: "SORTIE_ATELIER" },
        });
        if (!movement) continue; // Pas de sortie de stock enregistrée pour cette ligne : aucune restitution (évite le double crédit).

        const part = await tx.partItem.findUnique({ where: { id: line.partItemId } });
        if (!part) continue;

        await tx.partItem.update({
          where: { id: line.partItemId },
          data: { stockQuantity: { increment: line.quantity } },
        });
        await tx.partStockMovement.create({
          data: {
            partItemId: line.partItemId,
            type: "RETOUR_STOCK",
            quantity: line.quantity,
            unitPriceXof: part.purchasePriceXof,
            totalPriceXof: line.quantity * part.purchasePriceXof,
            referenceDoc: note.number,
            reason: `Annulation BL interne ${note.number} : ${reason}`,
            performedBy: user.email,
          },
        });
      }
    }
  });

  revalidatePath("/delivery-notes");
  revalidatePath("/parts");
  revalidatePath("/vehicles");
  return { success: true };
}

/** Suppression définitive interdite pour un BL émis (document non fiscal mais traçable). */
export async function deleteDeliveryNote(id: string) {
  const user = await requireUser([...DELIVERY_NOTE_ROLES]);
  const note = await prisma.deliveryNote.findUniqueOrThrow({ where: { id } });

  requireBLAuthorization(user.role, note.activity as Activity);
  if (note.status === "EMIS") {
    throw new Error("Un bon de livraison émis ne peut pas être supprimé : annulez-le avec un motif.");
  }

  await prisma.deliveryNoteLine.deleteMany({ where: { deliveryNoteId: id } });
  await prisma.deliveryNote.delete({ where: { id } });

  revalidatePath("/delivery-notes");
  return { success: true };
}
