"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const SERVICE_MANAGERS = [
  "PDG",
  "SG",
  "DG",
  "ADV",
  "RF",
  "RTA",
  "DC",
  "COMMERCIAL",
  "HOTESSE",
  "ASSISTANTE_COMPTABLE",
  "CHEF_ATELIER",
  "STOCK",
  "COMPTA",
  "ADMIN",
] as const;

export async function createArticle(formData: FormData) {
  const user = await requireUser([...SERVICE_MANAGERS]);

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Le nom est obligatoire");

  const description = String(formData.get("description") || "").trim() || null;
  const unitPriceXof = Number(formData.get("unitPriceXof") || 0);
  const taxRatePct = Number(formData.get("taxRatePct") || 0);
  const unit = String(formData.get("unit") || "1").trim();
  const category = String(formData.get("category") || "SERVICE").trim();

  const article = await prisma.article.create({
    data: {
      name,
      description,
      unitPriceXof,
      taxRatePct,
      unit,
      category,
      active: true,
    },
    select: { id: true },
  });

  await logAudit({
    user,
    action: "service.create",
    entityType: "Article",
    entityId: article.id,
    entityLabel: name,
    details: `${unitPriceXof.toLocaleString("fr-BJ")} FCFA`,
  });

  revalidatePath("/services");
  revalidatePath("/quotes");
}

export async function updateArticle(formData: FormData) {
  const user = await requireUser([...SERVICE_MANAGERS]);

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) throw new Error("ID et nom requis");

  const description = String(formData.get("description") || "").trim() || null;
  const unitPriceXof = Number(formData.get("unitPriceXof") || 0);
  const taxRatePct = Number(formData.get("taxRatePct") || 0);
  const unit = String(formData.get("unit") || "1").trim();
  const category = String(formData.get("category") || "SERVICE").trim();
  const active =
    formData.get("active") === "true" ||
    formData.get("active") === "1" ||
    formData.get("active") === "on";

  await prisma.article.update({
    where: { id },
    data: {
      name,
      description,
      unitPriceXof,
      taxRatePct,
      unit,
      category,
      active,
    },
  });

  await logAudit({
    user,
    action: "service.update",
    entityType: "Article",
    entityId: id,
    entityLabel: name,
    details: `${unitPriceXof.toLocaleString("fr-BJ")} FCFA - ${active ? "actif" : "inactif"}`,
  });

  revalidatePath("/services");
}

export async function toggleArticleActive(id: string, active: boolean) {
  const user = await requireUser([...SERVICE_MANAGERS]);

  const article = await prisma.article.update({
    where: { id },
    data: { active },
    select: { id: true, name: true },
  });

  await logAudit({
    user,
    action: active ? "service.activate" : "service.deactivate",
    entityType: "Article",
    entityId: article.id,
    entityLabel: article.name,
    details: active ? "Article activé" : "Article désactivé",
  });

  revalidatePath("/services");
}

export async function deleteArticle(id: string) {
  const user = await requireUser(["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "COMPTA"]);

  const article = await prisma.article.delete({
    where: { id },
    select: { id: true, name: true },
  });

  await logAudit({
    user,
    action: "service.delete",
    entityType: "Article",
    entityId: article.id,
    entityLabel: article.name,
    details: "Suppression d'un article/service",
  });

  revalidatePath("/services");
}
