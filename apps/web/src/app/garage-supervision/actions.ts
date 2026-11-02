"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const COST_EDITOR_ROLES = [
  "COMPTA_GARAGE",
  "COMPTA",
  "CHEF_ATELIER",
  "DG",
  "PDG",
  "SG",
] as const;

const COST_APPROVER_ROLES = ["COMPTA_GARAGE", "COMPTA", "DG", "PDG", "SG"] as const;

const INTERVENTION_TYPES = [
  "ENTRETIEN",
  "REPARATION",
  "DIAGNOSTIC",
  "CARROSSERIE",
  "MOTEUR",
  "AUTRE",
] as const;

const saveCostSchema = z.object({
  id: z.string().min(1),
  interventionType: z.enum(INTERVENTION_TYPES),
  laborCostXof: z.coerce.number().int().min(0).max(1_000_000_000),
  partsCostXof: z.coerce.number().int().min(0).max(1_000_000_000),
  otherCostXof: z.coerce.number().int().min(0).max(1_000_000_000),
  costNotes: z.string().max(2000).optional().default(""),
});

function parseCostForm(formData: FormData) {
  return saveCostSchema.parse({
    id: String(formData.get("id") || ""),
    interventionType: String(formData.get("interventionType") || "REPARATION"),
    laborCostXof: String(formData.get("laborCostXof") || "0"),
    partsCostXof: String(formData.get("partsCostXof") || "0"),
    otherCostXof: String(formData.get("otherCostXof") || "0"),
    costNotes: String(formData.get("costNotes") || "").trim(),
  });
}

/**
 * Enregistre / met à jour le coût d'une intervention atelier.
 * Toute modification remet le coût en attente de validation par la comptabilité garage.
 */
export async function saveWorkshopCost(formData: FormData) {
  const user = await requireUser([...COST_EDITOR_ROLES]);
  const data = parseCostForm(formData);

  const entry = await prisma.workshopEntry.update({
    where: { id: data.id },
    data: {
      interventionType: data.interventionType,
      laborCostXof: data.laborCostXof,
      partsCostXof: data.partsCostXof,
      otherCostXof: data.otherCostXof,
      costNotes: data.costNotes || null,
      costStatus: "A_VALIDER",
      costApprovedBy: null,
      costApprovedAt: null,
    },
    select: { id: true, orNumber: true, clientName: true, immatriculation: true },
  });

  await logAudit({
    user,
    action: "WORKSHOP_COST_SAVE",
    entityType: "WorkshopEntry",
    entityId: entry.id,
    entityLabel: `${entry.orNumber || "OR"} · ${entry.clientName} · ${entry.immatriculation}`,
    activity: "GARAGE",
    details: `Type ${data.interventionType} · MO ${data.laborCostXof} FCFA · Pièces ${data.partsCostXof} FCFA · Autres ${data.otherCostXof} FCFA`,
  });

  revalidatePath("/garage-supervision");
  revalidatePath("/workshop");
  revalidatePath("/dashboard");
}

/** Valide le coût d'une intervention (Comptable Garage / Comptabilité / Direction). */
export async function approveWorkshopCost(formData: FormData) {
  const user = await requireUser([...COST_APPROVER_ROLES]);
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Identifiant intervention requis.");

  const entry = await prisma.workshopEntry.update({
    where: { id },
    data: {
      costStatus: "VALIDE",
      costApprovedBy: user.fullName,
      costApprovedAt: new Date(),
    },
    select: { id: true, orNumber: true, clientName: true, immatriculation: true },
  });

  await logAudit({
    user,
    action: "WORKSHOP_COST_APPROVE",
    entityType: "WorkshopEntry",
    entityId: entry.id,
    entityLabel: `${entry.orNumber || "OR"} · ${entry.clientName} · ${entry.immatriculation}`,
    activity: "GARAGE",
    details: "Coût d'intervention validé",
  });

  revalidatePath("/garage-supervision");
  revalidatePath("/workshop");
  revalidatePath("/dashboard");
}
