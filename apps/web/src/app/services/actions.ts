"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";

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
  await requireUser([...SERVICE_MANAGERS]);

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Le nom est obligatoire");

  const description = String(formData.get("description") || "").trim() || null;
  const unitPriceXof = Number(formData.get("unitPriceXof") || 0);
  const taxRatePct = Number(formData.get("taxRatePct") || 0);
  const unit = String(formData.get("unit") || "1").trim();
  const category = String(formData.get("category") || "SERVICE").trim();

  await prisma.article.create({
    data: {
      name,
      description,
      unitPriceXof,
      taxRatePct,
      unit,
      category,
      active: true,
    },
  });

  revalidatePath("/services");
  revalidatePath("/quotes");
}

export async function updateArticle(formData: FormData) {
  await requireUser([...SERVICE_MANAGERS]);

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

  revalidatePath("/services");
}

export async function toggleArticleActive(id: string, active: boolean) {
  await requireUser([...SERVICE_MANAGERS]);

  await prisma.article.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/services");
}

export async function deleteArticle(id: string) {
  await requireUser(["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "COMPTA"]);

  await prisma.article.delete({
    where: { id },
  });

  revalidatePath("/services");
}
