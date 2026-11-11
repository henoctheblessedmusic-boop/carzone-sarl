"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { userHasCapability } from "@/lib/permissions-config";
import { logAudit } from "@/lib/audit";
import {
  CLIENT_IMPORT_MAX_ROWS,
  EMAIL_REGEX,
  normalizeEmail,
  normalizePhone,
  type ClientImportPayloadRow,
  type ClientImportResult,
} from "@/lib/client-import";

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
  "COMPTA_GARAGE",
  "GESTIONNAIRE_LOCATION",
  "ADMIN",
] as const;

function readScopeFlags(formData: FormData): {
  scopeShowroom: boolean;
  scopeGarage: boolean;
  isPartner: boolean;
} {
  const scopeShowroomRaw = formData.get("scopeShowroom");
  const scopeGarageRaw = formData.get("scopeGarage");
  const scopeShowroom = scopeShowroomRaw === null ? true : scopeShowroomRaw === "true";
  const scopeGarage = scopeGarageRaw === null ? false : scopeGarageRaw === "true";
  const isPartner = formData.get("isPartner") === "true";
  if (!scopeShowroom && !scopeGarage) {
    throw new Error("Un client doit appartenir au périmètre Showroom et/ou Garage.");
  }
  return { scopeShowroom, scopeGarage, isPartner };
}

export async function createCustomer(formData: FormData) {
  const user = await requireUser([...CLIENT_MANAGERS]);

  const contactName = String(formData.get("contactName") || "").trim();
  if (!contactName) {
    throw new Error("Le nom du contact est obligatoire");
  }

  const companyName = String(formData.get("companyName") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const phone = normalizePhone(String(formData.get("phone") || ""));
  const city = String(formData.get("city") || "Cotonou").trim();
  const address = String(formData.get("address") || "").trim() || null;
  const ifu = String(formData.get("ifu") || "").trim() || null;
  const category = String(formData.get("category") || "Particulier").trim();
  const notes = String(formData.get("notes") || "").trim() || null;
  const showroomNotes = String(formData.get("showroomNotes") || "").trim() || null;
  const { scopeShowroom, scopeGarage, isPartner } = readScopeFlags(formData);

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
      scopeShowroom,
      scopeGarage,
      isPartner,
      active: true,
    },
  });

  await logAudit({
    user,
    action: "customer.create",
    entityType: "Customer",
    entityId: customer.id,
    entityLabel: customer.contactName,
  });

  revalidatePath("/clients");
  revalidatePath("/quotes");
  return customer;
}

export async function updateCustomer(formData: FormData) {
  const user = await requireUser([...CLIENT_MANAGERS]);

  const id = String(formData.get("id") || "").trim();
  const contactName = String(formData.get("contactName") || "").trim();
  if (!id || !contactName) {
    throw new Error("Identifiant et nom de contact requis");
  }

  const companyName = String(formData.get("companyName") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const phone = normalizePhone(String(formData.get("phone") || ""));
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
  const { scopeShowroom, scopeGarage, isPartner } = readScopeFlags(formData);

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
      scopeShowroom,
      scopeGarage,
      isPartner,
      active,
    },
  });

  await logAudit({
    user,
    action: "customer.update",
    entityType: "Customer",
    entityId: updated.id,
    entityLabel: updated.contactName,
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
  const user = await requireUser(["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "ADMIN"]);

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

  let action = "customer.delete";
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
    action = "customer.deactivate";
  } else {
    await prisma.customer.delete({
      where: { id },
    });
  }

  await logAudit({
    user,
    action,
    entityType: "Customer",
    entityId: id,
    entityLabel: customer.contactName,
  });

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

/**
 * Import Excel de clients : reçoit des lignes déjà mappées/normalisées côté navigateur,
 * valide chaque ligne, ignore les doublons (e-mail/téléphone) et crée les clients.
 */
const importRowSchema = z.object({
  contactName: z.string().max(200).optional().default(""),
  companyName: z.string().max(200).optional().default(""),
  email: z.string().max(200).optional().default(""),
  phone: z.string().max(60).optional().default(""),
  city: z.string().max(120).optional().default(""),
  address: z.string().max(300).optional().default(""),
  ifu: z.string().max(60).optional().default(""),
  category: z.string().max(80).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
});

const importPayloadSchema = z.object({
  rows: z.array(importRowSchema).min(1).max(CLIENT_IMPORT_MAX_ROWS),
});

export async function importClients(input: {
  rows: ClientImportPayloadRow[];
}): Promise<ClientImportResult> {
  const user = await requireUser([...CLIENT_MANAGERS]);
  if (!userHasCapability(user.role, "customers:create", user.customPermissions)) {
    throw new Error("Vous n'êtes pas autorisé à importer des clients.");
  }

  const parsed = importPayloadSchema.parse(input);
  const existing = await prisma.customer.findMany({ select: { email: true, phone: true } });

  const existingEmails = new Set(
    existing.map((c) => normalizeEmail(c.email)).filter((v): v is string => Boolean(v))
  );
  const existingPhones = new Set(
    existing.map((c) => normalizePhone(c.phone)).filter((v): v is string => Boolean(v))
  );
  const batchEmails = new Set<string>();
  const batchPhones = new Set<string>();

  const rowsToCreate: {
    contactName: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
    city: string;
    address: string | null;
    ifu: string | null;
    category: string;
    notes: string | null;
    active: boolean;
  }[] = [];
  const errors: { row: number; message: string }[] = [];
  let skippedDuplicates = 0;

  parsed.rows.forEach((row, index) => {
    const excelRow = index + 2; // ligne 1 = en-têtes
    const contactName = row.contactName.trim();
    if (!contactName) {
      errors.push({ row: excelRow, message: "Nom du contact obligatoire" });
      return;
    }
    const email = normalizeEmail(row.email);
    if (email && !EMAIL_REGEX.test(email)) {
      errors.push({ row: excelRow, message: `E-mail invalide : ${row.email}` });
      return;
    }
    const phone = normalizePhone(row.phone);

    const duplicateEmail = email
      ? existingEmails.has(email) || batchEmails.has(email)
      : false;
    const duplicatePhone = phone
      ? existingPhones.has(phone) || batchPhones.has(phone)
      : false;
    if (duplicateEmail || duplicatePhone) {
      skippedDuplicates += 1;
      return;
    }

    if (email) batchEmails.add(email);
    if (phone) batchPhones.add(phone);

    rowsToCreate.push({
      contactName,
      companyName: row.companyName.trim() || null,
      email,
      phone,
      city: row.city.trim() || "Cotonou",
      address: row.address.trim() || null,
      ifu: row.ifu.trim() || null,
      category: row.category.trim() || "Particulier",
      notes: row.notes.trim() || null,
      active: true,
    });
  });

  let created = 0;
  if (rowsToCreate.length > 0) {
    const result = await prisma.customer.createMany({ data: rowsToCreate });
    created = result.count;
  }

  await logAudit({
    user,
    action: "customer.import",
    entityType: "Customer",
    details: `${created} créé(s), ${skippedDuplicates} doublon(s) ignoré(s), ${errors.length} erreur(s)`,
  });

  revalidatePath("/clients");
  revalidatePath("/quotes");
  revalidatePath("/dashboard");

  return {
    created,
    skippedDuplicates,
    invalid: errors.length,
    total: parsed.rows.length,
    errors: errors.slice(0, 50),
  };
}
