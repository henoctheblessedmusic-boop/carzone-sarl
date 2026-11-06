"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { normalizePhone } from "@/lib/client-import";

export async function createLead(formData: FormData) {
  const user = await requireUser(["DG", "COMMERCIAL", "ADMIN", "PDG", "SG"]);
  const energy = String(formData.get("energyPref") || "");
  const lead = await prisma.lead.create({
    data: {
      contactName: String(formData.get("contactName") || "").trim(),
      email: String(formData.get("email") || "").trim() || null,
      phone: normalizePhone(String(formData.get("phone") || "")),
      source: String(formData.get("source") || "showroom"),
      interest: String(formData.get("interest") || "").trim() || null,
      energyPref: energy || null,
      assigneeId: user.id,
      status: "NEW",
    },
    select: { id: true, contactName: true },
  });
  await logAudit({
    user,
    action: "lead.create",
    entityType: "Lead",
    entityId: lead.id,
    entityLabel: lead.contactName,
  });
  revalidatePath("/leads");
}

export async function updateLead(formData: FormData) {
  const user = await requireUser(["DG", "COMMERCIAL", "ADMIN", "PDG", "SG"]);
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Identifiant manquant");

  const contactName = String(formData.get("contactName") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const phone = normalizePhone(String(formData.get("phone") || ""));
  const source = String(formData.get("source") || "showroom");
  const interest = String(formData.get("interest") || "").trim() || null;
  const energyPref = String(formData.get("energyPref") || "").trim() || null;
  const status = String(formData.get("status") || "NEW");

  await prisma.lead.update({
    where: { id },
    data: {
      contactName,
      email,
      phone,
      source,
      interest,
      energyPref,
      status,
    },
  });
  await logAudit({
    user,
    action: "lead.update",
    entityType: "Lead",
    entityId: id,
    entityLabel: contactName,
    details: `Statut ${status}`,
  });
  revalidatePath("/leads");
}

export async function advanceLead(formData: FormData) {
  const user = await requireUser(["DG", "COMMERCIAL", "ADMIN", "PDG", "SG"]);
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.lead.update({ where: { id }, data: { status } });
  await logAudit({
    user,
    action: "lead.advance",
    entityType: "Lead",
    entityId: id,
    details: `Statut ${status}`,
  });
  revalidatePath("/leads");
}
