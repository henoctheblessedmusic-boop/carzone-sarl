"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";

const CLIENT_MANAGERS = [
  "PDG",
  "SG",
  "DG",
  "ADV",
  "RF",
  "RTA",
  "DC",
  "COMMERCIAL",
  "HOTESSE",
  "CHEF_ATELIER",
  "ASSISTANTE_COMPTABLE",
  "COMPTA",
  "ADMIN",
] as const;

export async function createCustomer(formData: FormData) {
  await requireUser([...CLIENT_MANAGERS]);

  const contactName = String(formData.get("contactName") || "").trim();
  if (!contactName) {
    throw new Error("Le nom du contact est obligatoire");
  }

  const companyName = String(formData.get("companyName") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const city = String(formData.get("city") || "Cotonou").trim();
  const address = String(formData.get("address") || "").trim() || null;
  const ifu = String(formData.get("ifu") || "").trim() || null;
  const category = String(formData.get("category") || "Particulier").trim();
  const notes = String(formData.get("notes") || "").trim() || null;
  const showroomNotes = String(formData.get("showroomNotes") || "").trim() || null;

  const customer = await prisma.customer.create({
    data: {
      contactName,
      companyName,
      email,
      phone,
      city,
      address,
      ifu,
      category,
      notes,
      showroomNotes,
      active: true,
    },
  });

  revalidatePath("/clients");
  revalidatePath("/quotes");
  return customer;
}

export async function updateCustomer(formData: FormData) {
  await requireUser([...CLIENT_MANAGERS]);

  const id = String(formData.get("id") || "").trim();
  const contactName = String(formData.get("contactName") || "").trim();
  if (!id || !contactName) {
    throw new Error("Identifiant et nom de contact requis");
  }

  const companyName = String(formData.get("companyName") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const city = String(formData.get("city") || "Cotonou").trim();
  const address = String(formData.get("address") || "").trim() || null;
  const ifu = String(formData.get("ifu") || "").trim() || null;
  const category = String(formData.get("category") || "Particulier").trim();
  const notes = String(formData.get("notes") || "").trim() || null;
  const showroomNotes = String(formData.get("showroomNotes") || "").trim() || null;
  const active =
    formData.get("active") === "true" ||
    formData.get("active") === "1" ||
    formData.get("active") === "on";

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      contactName,
      companyName,
      email,
      phone,
      city,
      address,
      ifu,
      category,
      notes,
      showroomNotes,
      active,
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/quotes");
  return updated;
}

export async function toggleCustomerActive(id: string, active: boolean) {
  await requireUser([...CLIENT_MANAGERS]);

  await prisma.customer.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/clients");
}

export async function deleteCustomer(id: string) {
  await requireUser(["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "ADMIN"]);

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          quotes: true,
          invoices: true,
          rentals: true,
          installRequests: true,
        },
      },
    },
  });

  if (!customer) return;

  if (
    customer._count.quotes > 0 ||
    customer._count.invoices > 0 ||
    customer._count.rentals > 0 ||
    customer._count.installRequests > 0
  ) {
    await prisma.customer.update({
      where: { id },
      data: { active: false },
    });
  } else {
    await prisma.customer.delete({
      where: { id },
    });
  }

  revalidatePath("/clients");
}

export async function uploadCustomerDocument(formData: FormData) {
  await requireUser([...CLIENT_MANAGERS]);

  const customerId = String(formData.get("customerId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const docType = String(formData.get("docType") || "AUTRE").trim();
  const fileName = String(formData.get("fileName") || "document").trim();
  const fileSize = Number(formData.get("fileSize") || 0);
  const fileUrl = String(formData.get("fileUrl") || "").trim();
  const mimeType = String(formData.get("mimeType") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!customerId || !title || !fileUrl) {
    throw new Error("Informations de document incomplètes");
  }

  const doc = await prisma.customerDocument.create({
    data: {
      customerId,
      title,
      docType,
      fileName,
      fileSize,
      fileUrl,
      mimeType,
      status: "VALIDE",
      notes,
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${customerId}`);
  return doc;
}

export async function deleteCustomerDocument(documentId: string, customerId: string) {
  await requireUser([...CLIENT_MANAGERS]);

  await prisma.customerDocument.delete({
    where: { id: documentId },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${customerId}`);
}

export async function updateCustomerDocumentStatus(
  documentId: string,
  customerId: string,
  status: string
) {
  await requireUser([...CLIENT_MANAGERS]);

  await prisma.customerDocument.update({
    where: { id: documentId },
    data: { status },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${customerId}`);
}
