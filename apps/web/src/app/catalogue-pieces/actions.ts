"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
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

type ImportedReference = {
  reference: string;
  brand: string;
  referenceType: string;
  isDirectFit: boolean;
  notes: string | null;
  sourceType: string | null;
  sourceRef: string | null;
  verifiedAt: Date | null;
};
type ImportedCompatibility = {
  vehicleBrand: string;
  vehicleModel: string;
  years: string | null;
  engine: string | null;
  position: string | null;
  notes: string | null;
};

function text(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function list(value: unknown): string[] {
  return text(value).split(";").map((item) => item.trim()).filter(Boolean);
}

function parseReference(value: unknown): ImportedReference | null {
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    const reference = text(row.reference || row.crossReference);
    const brand = text(row.brand || row.manufacturer);
    if (!reference || !brand) return null;
    return {
      reference,
      brand,
      referenceType: text(row.referenceType || row.type || "EQUIVALENT").toUpperCase(),
      isDirectFit: row.isDirectFit !== false,
      notes: text(row.notes) || null,
      sourceType: text(row.sourceType || row.source) || null,
      sourceRef: text(row.sourceRef || row.sourceReference) || null,
      verifiedAt: text(row.verifiedAt) ? new Date(text(row.verifiedAt)) : null,
    };
  }
  const parts = text(value).split("|").map((item) => item.trim());
  if (parts.length < 2 || !parts[0] || !parts[1]) return null;
  return {
    reference: parts[1],
    brand: parts[0],
    referenceType: (parts[2] || "EQUIVALENT").toUpperCase(),
    isDirectFit: (parts[3] || "1") !== "0",
    notes: parts[4] || null,
    sourceType: parts[5] || null,
    sourceRef: parts[6] || null,
    verifiedAt: parts[7] ? new Date(parts[7]) : null,
  };
}

function parseCompatibility(value: unknown): ImportedCompatibility | null {
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    const vehicleBrand = text(row.vehicleBrand || row.brand);
    const vehicleModel = text(row.vehicleModel || row.model);
    if (!vehicleBrand || !vehicleModel) return null;
    return {
      vehicleBrand,
      vehicleModel,
      years: text(row.years) || null,
      engine: text(row.engine) || null,
      position: text(row.position) || null,
      notes: text(row.notes) || null,
    };
  }
  const parts = text(value).split("|").map((item) => item.trim());
  if (parts.length < 2 || !parts[0] || !parts[1]) return null;
  return {
    vehicleBrand: parts[0],
    vehicleModel: parts[1],
    years: parts[2] || null,
    engine: parts[3] || null,
    position: parts[4] || null,
    notes: parts[5] || null,
  };
}

/**
 * Import massif d'un catalogue général OEM.
 * Formats acceptés : .json, .csv, .xlsx.
 * Le catalogue reste indépendant du stock.
 */
export async function importGeneralPartsCatalog(formData: FormData) {
  const user = await requireUser([...CATALOG_ROLES]);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Sélectionnez un fichier JSON, CSV ou Excel.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Fichier trop volumineux (12 Mo maximum).");
  }

  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  let rows: unknown[] = [];

  if (fileName.endsWith(".json")) {
    const parsed = JSON.parse(buffer.toString("utf8"));
    rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.parts) ? parsed.parts : [];
  } else {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  }

  if (rows.length === 0) throw new Error("Le fichier ne contient aucune ligne exploitable.");
  if (rows.length > 5000) throw new Error("Import limité à 5 000 lignes par fichier.");

  let imported = 0;
  let skipped = 0;
  for (const raw of rows) {
    if (!raw || typeof raw !== "object") {
      skipped += 1;
      continue;
    }
    const row = raw as Record<string, unknown>;
    const reference = text(row.reference || row.partNumber || row.ref);
    const name = text(row.name || row.designation);
    if (!reference || !name) {
      skipped += 1;
      continue;
    }

    const references: ImportedReference[] = [];
    const referencesRaw = row.references ?? row.crossReferences;
    if (Array.isArray(referencesRaw)) {
      for (const item of referencesRaw) {
        const parsed = parseReference(item);
        if (parsed) references.push(parsed);
      }
    } else if (typeof referencesRaw === "string" && referencesRaw.trim()) {
      for (const item of referencesRaw.split(";")) {
        const parsed = parseReference(item);
        if (parsed) references.push(parsed);
      }
    }

    const compatibilities: ImportedCompatibility[] = [];
    const compatRaw = row.compatibilities ?? row.vehicles;
    if (Array.isArray(compatRaw)) {
      for (const item of compatRaw) {
        const parsed = parseCompatibility(item);
        if (parsed) compatibilities.push(parsed);
      }
    } else if (typeof compatRaw === "string" && compatRaw.trim()) {
      for (const item of compatRaw.split(";")) {
        const parsed = parseCompatibility(item);
        if (parsed) compatibilities.push(parsed);
      }
    }
    if (text(row.vehicleBrand) && text(row.vehicleModel)) {
      const parsed = parseCompatibility({
        vehicleBrand: row.vehicleBrand,
        vehicleModel: row.vehicleModel,
        years: row.years,
        engine: row.engine,
        position: row.position,
      });
      if (parsed) compatibilities.push(parsed);
    }

    const data = {
      reference,
      oemReference: text(row.oemReference || row.oem) || null,
      name,
      system: text(row.system || row.category).toUpperCase() || null,
      subcategory: text(row.subcategory).toUpperCase() || null,
      manufacturer: text(row.manufacturer || row.fabricant) || null,
      description: text(row.description) || null,
      unit: text(row.unit) || "PIECE",
    };

    const existing = await prisma.generalPart.findUnique({ where: { reference }, select: { id: true } });
    if (existing) {
      await prisma.generalPart.update({ where: { id: existing.id }, data });
      await prisma.generalPartReference.deleteMany({ where: { generalPartId: existing.id } });
      await prisma.generalPartCompatibility.deleteMany({ where: { generalPartId: existing.id } });
    }
    const part = existing
      ? { id: existing.id }
      : await prisma.generalPart.create({ data, select: { id: true } });

    if (references.length > 0) {
      await prisma.generalPartReference.createMany({
        data: references.map((referenceRow) => ({ generalPartId: part.id, ...referenceRow })),
      });
    }
    if (compatibilities.length > 0) {
      await prisma.generalPartCompatibility.createMany({
        data: compatibilities.map((compatibility) => ({ generalPartId: part.id, ...compatibility })),
      });
    }
    imported += 1;
  }

  await logAudit({
    user,
    action: "general_part.catalog_import",
    entityType: "GeneralPart",
    entityLabel: file.name,
    details: `${imported} référence(s) importée(s), ${skipped} ligne(s) ignorée(s)`,
  });

  revalidatePath("/catalogue-pieces");
  redirect(`/catalogue-pieces?imported=${imported}&skipped=${skipped}`);
}
