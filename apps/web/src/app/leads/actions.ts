"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";

export async function createLead(formData: FormData) {
  const user = await requireUser(["DG", "COMMERCIAL", "ADMIN", "PDG", "SG"]);
  const energy = String(formData.get("energyPref") || "");
  await prisma.lead.create({
    data: {
      contactName: String(formData.get("contactName") || "").trim(),
      email: String(formData.get("email") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
      source: String(formData.get("source") || "showroom"),
      interest: String(formData.get("interest") || "").trim() || null,
      energyPref: energy || null,
      assigneeId: user.id,
      status: "NEW",
    },
  });
  revalidatePath("/leads");
}

export async function updateLead(formData: FormData) {
  await requireUser(["DG", "COMMERCIAL", "ADMIN", "PDG", "SG"]);
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Identifiant manquant");

  const contactName = String(formData.get("contactName") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
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
  revalidatePath("/leads");
}

export async function advanceLead(formData: FormData) {
  await requireUser(["DG", "COMMERCIAL", "ADMIN", "PDG", "SG"]);
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/leads");
}
