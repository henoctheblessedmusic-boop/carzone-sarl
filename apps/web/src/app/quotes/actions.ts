"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { nextDocNumber, formatXof, formatDate } from "@/lib/format";
import {
  computeTaxTotals,
  canConfirmOrder,
  canNormalizeInvoice,
  canSendProforma,
  canStaffVoid,
  type TaxMode,
} from "@/lib/billing";
import {
  calculateDiscountAmount,
  encodeDiscountInNotes,
  type DiscountType,
} from "@/lib/quote-discount";

export async function createProformaWithLines(payload: {
  customerId: string;
  opportunityId?: string | null;
  taxMode: TaxMode;
  taxRatePct: number;
  validDays?: number;
  notes?: string | null;
  cgvType?: string;
  customCgv?: string | null;
  discountType?: DiscountType;
  discountValue?: number;
  lines: Array<{
    description: string;
    quantity: number;
    unitPriceXof: number;
    vehicleId?: string | null;
  }>;
}) {
  await requireUser([
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
  ]);

  const {
    customerId,
    opportunityId,
    taxMode,
    taxRatePct,
    validDays = 14,
    notes,
    cgvType = "VEHICULE",
    customCgv,
    discountType = "NONE",
    discountValue = 0,
    lines,
  } = payload;
  if (!customerId) throw new Error("Client requis");
  if (!lines || lines.length === 0) throw new Error("Au moins une ligne requise");

  const grossTotal = lines.reduce((s, l) => s + l.quantity * l.unitPriceXof, 0);
  const discountAmount = calculateDiscountAmount(grossTotal, {
    type: discountType,
    value: discountValue,
  });
  const totals = computeTaxTotals({
    lineTotalXof: grossTotal,
    taxMode,
    taxRatePct,
    discountXof: discountAmount,
  });
  const finalNotes = encodeDiscountInNotes(notes, {
    type: discountType,
    value: discountValue,
  });

  const count = await prisma.quote.count();
  const quote = await prisma.quote.create({
    data: {
      number: nextDocNumber("PRO", count),
      customerId,
      opportunityId: opportunityId || null,
      status: "BROUILLON",
      docKind: "PROFORMA",
      taxMode,
      taxRatePct,
      subtotalHtXof: totals.subtotalHtXof,
      taxXof: totals.taxXof,
      totalXof: totals.totalXof,
      validUntil: new Date(Date.now() + (validDays || 14) * 86400000),
      notes: finalNotes,
      cgvType,
      customCgv: customCgv || null,
      lines: {
        create: lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPriceXof: l.unitPriceXof,
          vehicleId: l.vehicleId || null,
        })),
      },
    },
  });

  revalidatePath("/quotes");
  revalidatePath(`/clients/${customerId}`);
  return quote.id;
}

export async function sendProforma(formData: FormData) {
  await requireUser(["DG", "COMMERCIAL", "COMPTA", "ADMIN"]);
  const id = String(formData.get("id"));
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id },
    include: { customer: true, lines: true },
  });
  if (!canSendProforma(quote.status)) return;

  const emailTo =
    String(formData.get("emailTo") || "").trim() || quote.customer.email || null;
  const customSubject = String(formData.get("subject") || "").trim();
  const customBody = String(formData.get("body") || "").trim();
  const now = new Date();

  const finalSubject = customSubject || `Facture Proforma ${quote.number} · CARZONE SARL`;
  const defaultBody = `Bonjour ${quote.customer.contactName},\n\nVeuillez trouver le récapitulatif de votre facture proforma ${quote.number} pour un montant total de ${formatXof(quote.totalXof)} (${quote.taxMode}).\n\nPrestations et articles inclus :\n${quote.lines.map((l) => `- ${l.quantity}x ${l.description} : ${formatXof(l.unitPriceXof * l.quantity)}`).join("\n")}\n\nCe devis proforma est valable jusqu'au ${formatDate(quote.validUntil)}.\n\nLes Conditions Générales de Vente sont adossées au document officiel en page 2.\n\nRestant à votre entière disposition pour validation,\nL'équipe commerciale Carzone SARL\nShowroom Zone Maro-Militaire, Gbèdomidji · Cotonou, Bénin`;
  const finalBody = customBody || defaultBody;

  // Create message in Mailbox
  if (emailTo) {
    await prisma.mailMessage.create({
      data: {
        folder: "SENT",
        from: "contact@topcarzone.com",
        to: emailTo,
        subject: finalSubject,
        snippet: finalBody.slice(0, 120).replace(/\n/g, " ") + "...",
        body: finalBody,
        isRead: true,
        customerId: quote.customerId,
        quoteId: quote.id,
      },
    });
  }

  await prisma.quote.update({
    where: { id },
    data: {
      status: "PROFORMA_ENVOYEE",
      sentAt: quote.sentAt ?? now,
      emailSentAt: now,
      emailTo,
      auditNotes: [
        quote.auditNotes,
        `${now.toISOString()} · Envoi proforma par e-mail vers ${emailTo || "(pas d'e-mail)"}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });

  revalidatePath("/quotes");
  revalidatePath("/mailbox");
}

export async function confirmOrder(formData: FormData) {
  await requireUser([
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
  ]);
  const id = String(formData.get("id"));
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id } });
  if (!canConfirmOrder(quote.status)) return;
  const now = new Date();
  await prisma.quote.update({
    where: { id },
    data: {
      status: "COMMANDE_CONFIRMEE",
      approvedAt: now,
      orderConfirmedAt: now,
      auditNotes: [quote.auditNotes, `${now.toISOString()} · Commande confirmée (engagement ferme)`]
        .filter(Boolean)
        .join("\n"),
    },
  });
  revalidatePath("/quotes");
}

export async function normalizeInvoice(formData: FormData) {
  await requireUser([
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
  ]);
  const id = String(formData.get("id"));
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id } });
  if (!canNormalizeInvoice(quote.status)) return;
  const existing = await prisma.invoice.findUnique({ where: { quoteId: id } });
  if (!existing) {
    const count = await prisma.invoice.count();
    await prisma.invoice.create({
      data: {
        number: nextDocNumber("FAC", count),
        status: "ENVOYEE",
        kind: "NORMALISEE",
        customerId: quote.customerId,
        quoteId: quote.id,
        taxMode: quote.taxMode,
        taxRatePct: quote.taxRatePct,
        subtotalHtXof: quote.subtotalHtXof,
        taxXof: quote.taxXof,
        totalXof: quote.totalXof,
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
    });
  }
  await prisma.quote.update({
    where: { id },
    data: {
      status: "FACTURE_NORMALISEE",
      auditNotes: [
        quote.auditNotes,
        `${new Date().toISOString()} · Conversion en facture normalisée`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });
  revalidatePath("/quotes");
  revalidatePath("/invoices");
}

export async function voidInternally(formData: FormData) {
  const user = await requireUser([
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "COMPTA",
    "ADMIN",
  ]);
  const id = String(formData.get("id"));
  const reason = String(formData.get("cancelReason") || "").trim();
  if (reason.length < 8) return;
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id } });
  if (!canStaffVoid(quote.status)) return;
  const now = new Date();
  await prisma.quote.update({
    where: { id },
    data: {
      status: "ANNULEE_INTERNE",
      cancelReason: reason,
      cancelledAt: now,
      cancelledByName: user.fullName,
      auditNotes: [
        quote.auditNotes,
        `${now.toISOString()} · ANNULEE_INTERNE par ${user.fullName} : ${reason}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });
  revalidatePath("/quotes");
}

export async function deleteQuote(id: string) {
  await requireUser([
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "COMPTA",
    "ASSISTANTE_COMPTABLE",
    "COMMERCIAL",
    "ADMIN",
  ]);
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id },
    include: { invoice: true },
  });
  if (quote.status === "FACTURE_NORMALISEE" || quote.invoice) {
    throw new Error(
      "Impossible de supprimer cette proforma car elle a déjà été convertie en facture normalisée officielle."
    );
  }

  await prisma.quoteLine.deleteMany({ where: { quoteId: id } });
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/quotes");
  revalidatePath("/dashboard");
}

export async function updateProformaWithLines(payload: {
  quoteId: string;
  customerId: string;
  taxMode: TaxMode;
  taxRatePct: number;
  validDays?: number;
  notes?: string | null;
  cgvType?: string;
  customCgv?: string | null;
  discountType?: DiscountType;
  discountValue?: number;
  lines: Array<{
    description: string;
    quantity: number;
    unitPriceXof: number;
    vehicleId?: string | null;
  }>;
}) {
  await requireUser([
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
  ]);

  const {
    quoteId,
    customerId,
    taxMode,
    taxRatePct,
    validDays = 14,
    notes,
    cgvType = "VEHICULE",
    customCgv,
    discountType = "NONE",
    discountValue = 0,
    lines,
  } = payload;

  if (!quoteId) throw new Error("ID du devis manquant");
  if (!customerId) throw new Error("Client requis");
  if (!lines || lines.length === 0) throw new Error("Au moins une ligne requise");

  const existing = await prisma.quote.findUnique({
    where: { id: quoteId },
  });
  if (!existing) throw new Error("Devis introuvable");

  // RÈGLE COMMERCIALE & LÉGALE STRICTE :
  // Non modifiable si le bon de commande a déjà été confirmé ou s'il y a une facture normalisée !
  if (
    existing.status === "COMMANDE_CONFIRMEE" ||
    existing.status === "FACTURE_NORMALISEE" ||
    existing.status === "ACCEPTE"
  ) {
    throw new Error(
      "Ce document a été validé en bon de commande ferme ou facture fiscale normalisée. Conformément aux règles de gestion, il ne peut plus être modifié."
    );
  }

  const grossTotal = lines.reduce((s, l) => s + l.quantity * l.unitPriceXof, 0);
  const discountAmount = calculateDiscountAmount(grossTotal, {
    type: discountType,
    value: discountValue,
  });
  const totals = computeTaxTotals({
    lineTotalXof: grossTotal,
    taxMode,
    taxRatePct,
    discountXof: discountAmount,
  });
  const finalNotes = encodeDiscountInNotes(notes, {
    type: discountType,
    value: discountValue,
  });

  // Supprimer les anciennes lignes et réinsérer les nouvelles
  await prisma.quoteLine.deleteMany({ where: { quoteId } });

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      customerId,
      taxMode,
      taxRatePct,
      subtotalHtXof: totals.subtotalHtXof,
      taxXof: totals.taxXof,
      totalXof: totals.totalXof,
      validUntil: new Date(Date.now() + (validDays || 14) * 86400000),
      notes: finalNotes,
      cgvType,
      customCgv: customCgv || null,
      lines: {
        create: lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPriceXof: l.unitPriceXof,
          vehicleId: l.vehicleId || null,
        })),
      },
    },
  });

  revalidatePath("/quotes");
  revalidatePath(`/clients/${customerId}`);
  return updated.id;
}

