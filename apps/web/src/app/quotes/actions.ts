"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { getLocale } from "@/lib/i18n/server";
import { quotesCopy } from "@/lib/i18n/messages/quotes";
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
import { ACTIVITY, peutGererBL, type Activity } from "@/lib/permissions";
import { certifyInvoiceWithMecef } from "@/lib/dgi-emecef";
import { createAndIssueDeliveryNote } from "../delivery-notes/actions";
import { logAudit } from "@/lib/audit";

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
  const user = await requireUser([
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
    "ADMIN",
  ]);
  const activity = user.role === "COMPTA_GARAGE" ? ACTIVITY.GARAGE : ACTIVITY.SHOWROOM;

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
  const copy = quotesCopy[await getLocale()];
  if (!customerId) throw new Error(copy.server.customerRequired);
  if (!lines || lines.length === 0) throw new Error(copy.server.lineRequired);

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
      activity,
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

  await logAudit({
    user,
    action: "quote.create",
    entityType: "Quote",
    entityId: quote.id,
    entityLabel: quote.number,
    activity,
  });

  revalidatePath("/quotes");
  revalidatePath(`/clients/${customerId}`);
  return quote.id;
}

export async function sendProforma(formData: FormData) {
  const user = await requireUser([
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
    "ADMIN",
  ]);
  const id = String(formData.get("id"));
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id },
    include: { customer: true, lines: true },
  });
  if (user.role === "COMPTA_GARAGE" && quote.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut envoyer que des proformas du périmètre GARAGE.");
  }
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

  await logAudit({
    user,
    action: "quote.send_proforma",
    entityType: "Quote",
    entityId: quote.id,
    entityLabel: quote.number,
    activity: quote.activity as Activity,
  });

  revalidatePath("/quotes");
  revalidatePath("/mailbox");
}

export async function confirmOrder(formData: FormData) {
  const user = await requireUser([
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
    "ADMIN",
  ]);
  const id = String(formData.get("id"));
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id } });
  if (user.role === "COMPTA_GARAGE" && quote.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut confirmer que des commandes du périmètre GARAGE.");
  }
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
  await logAudit({
    user,
    action: "quote.confirm_order",
    entityType: "Quote",
    entityId: quote.id,
    entityLabel: quote.number,
    activity: quote.activity as Activity,
  });
  revalidatePath("/quotes");
}

export async function normalizeInvoice(formData: FormData) {
  const user = await requireUser([
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
    "ADMIN",
  ]);
  const id = String(formData.get("id"));
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id } });
  if (user.role === "COMPTA_GARAGE" && quote.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut normaliser que des proformas du périmètre GARAGE.");
  }
  if (!canNormalizeInvoice(quote.status)) return;
  const existing = await prisma.invoice.findUnique({ where: { quoteId: id } });
  if (!existing) {
    const count = await prisma.invoice.count();
    await prisma.invoice.create({
      data: {
        number: nextDocNumber(quote.activity === ACTIVITY.GARAGE ? "FAC-GAR" : "FAC", count),
        status: "ENVOYEE",
        kind: "NORMALISEE",
        activity: quote.activity,
        isDemo: process.env.DGI_EMECEF_MODE === "DEMO",
        certificationMode: process.env.DGI_EMECEF_MODE === "DEMO" ? "DEMO" : null,
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
  await logAudit({
    user,
    action: "quote.normalize_invoice",
    entityType: "Quote",
    entityId: quote.id,
    entityLabel: quote.number,
    activity: quote.activity as Activity,
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
    "COMPTA_GARAGE",
    "ADMIN",
  ]);
  const id = String(formData.get("id"));
  const reason = String(formData.get("cancelReason") || "").trim();
  if (reason.length < 8) return;
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id } });
  if (user.role === "COMPTA_GARAGE" && quote.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut annuler que des devis du périmètre GARAGE.");
  }
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
  await logAudit({
    user,
    action: "quote.void_internally",
    entityType: "Quote",
    entityId: quote.id,
    entityLabel: quote.number,
    activity: quote.activity as Activity,
    details: reason,
  });
  revalidatePath("/quotes");
}

export async function deleteQuote(id: string) {
  const user = await requireUser([
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "COMPTA",
    "COMPTA_GARAGE",
    "ASSISTANTE_COMPTABLE",
    "COMMERCIAL",
    "ADMIN",
  ]);
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id },
    include: { invoice: true },
  });
  if (user.role === "COMPTA_GARAGE" && quote.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut supprimer que des devis du périmètre GARAGE.");
  }
  if (quote.status === "FACTURE_NORMALISEE" || quote.invoice) {
    throw new Error(quotesCopy[await getLocale()].server.deleteNormalized);
  }

  await prisma.quoteLine.deleteMany({ where: { quoteId: id } });
  await prisma.quote.delete({ where: { id } });
  await logAudit({
    user,
    action: "quote.delete",
    entityType: "Quote",
    entityId: quote.id,
    entityLabel: quote.number,
    activity: quote.activity as Activity,
  });
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
  const user = await requireUser([
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

  const copy = quotesCopy[await getLocale()];

  if (!quoteId) throw new Error(copy.server.missingId);
  if (!customerId) throw new Error(copy.server.customerRequired);
  if (!lines || lines.length === 0) throw new Error(copy.server.lineRequired);

  const existing = await prisma.quote.findUnique({
    where: { id: quoteId },
  });
  if (!existing) throw new Error(copy.server.quoteNotFound);
  if (user.role === "COMPTA_GARAGE" && existing.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut modifier que des devis du périmètre GARAGE.");
  }

  // RÈGLE COMMERCIALE & LÉGALE STRICTE :
  // Non modifiable si le bon de commande a déjà été confirmé ou s'il y a une facture normalisée !
  if (
    existing.status === "COMMANDE_CONFIRMEE" ||
    existing.status === "FACTURE_NORMALISEE" ||
    existing.status === "ACCEPTE"
  ) {
    throw new Error(copy.server.quoteLocked);
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

  await logAudit({
    user,
    action: "quote.update",
    entityType: "Quote",
    entityId: updated.id,
    entityLabel: updated.number,
    activity: updated.activity as Activity,
  });

  revalidatePath("/quotes");
  revalidatePath(`/clients/${customerId}`);
  return updated.id;
}

export type TranscribeQuoteResult = {
  mode: "BL_INTERNE" | "FACTURE_NORMALISEE";
  invoiceId?: string;
  invoiceNumber?: string;
  certificationFailed?: boolean;
  certificationMessage?: string;
  deliveryNoteId: string | null;
  deliveryNoteNumber: string | null;
  deliveryNoteError: string | null;
};

/**
 * Transcrit une proforma en BL interne (déstockage non fiscal) ou en facture normalisée
 * (certification e-MECeF + BL interne lié créés automatiquement). Opération unique par
 * devis : bloquée si une facture ou un BL existe déjà, ou si le devis est déjà transcrit.
 */
export async function transcribeQuote(formData: FormData): Promise<TranscribeQuoteResult> {
  const user = await requireUser([
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
    "ADMIN",
  ]);

  const id = String(formData.get("id") || "");
  const mode = String(formData.get("mode") || "");
  if (mode !== "BL_INTERNE" && mode !== "FACTURE_NORMALISEE") {
    throw new Error("Mode de transcription invalide.");
  }

  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id },
    include: { lines: true, invoice: true },
  });

  const activity = quote.activity as Activity;

  if (user.role === "COMPTA_GARAGE" && activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut transcrire que des proformas du périmètre GARAGE.");
  }
  if (!peutGererBL(user.role, activity)) {
    throw new Error(
      activity === ACTIVITY.GARAGE
        ? "Seules la Comptable Garage, la Comptabilité ou la direction peuvent transcrire une proforma garage."
        : "Seule la Comptabilité ou la direction peuvent transcrire une proforma showroom.",
    );
  }
  if (quote.status === "ANNULEE_INTERNE") {
    throw new Error("Cette proforma est annulée en interne : transcription impossible.");
  }
  if (quote.transcribedAt || quote.invoice) {
    throw new Error("Cette proforma a déjà été transcrite.");
  }
  const existingNote = await prisma.deliveryNote.findFirst({ where: { quoteId: id } });
  if (existingNote) {
    throw new Error("Un bon de livraison existe déjà pour cette proforma.");
  }

  const deliveryLines = quote.lines.map((l) => ({
    description: l.description,
    quantity: l.quantity,
    unitPriceXof: l.unitPriceXof as number | null,
    vehicleId: l.vehicleId,
    partItemId: null as string | null,
  }));

  const now = new Date();

  if (mode === "BL_INTERNE") {
    const note = await createAndIssueDeliveryNote({
      activity,
      customerId: quote.customerId,
      quoteId: quote.id,
      notes: `Transcription BL interne de la proforma ${quote.number}`,
      lines: deliveryLines,
    });

    await prisma.quote.update({
      where: { id },
      data: {
        transcribedAt: now,
        transcriptionMode: "BL_INTERNE",
        auditNotes: [
          quote.auditNotes,
          `${now.toISOString()} · Transcrite en BL interne ${note.number} par ${user.fullName}`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });

    await logAudit({
      user,
      action: "quote.transcribe_bl",
      entityType: "Quote",
      entityId: quote.id,
      entityLabel: quote.number,
      activity,
      details: `BL interne ${note.number}`,
    });

    revalidatePath("/quotes");
    revalidatePath("/delivery-notes");

    return {
      mode: "BL_INTERNE",
      deliveryNoteId: note.id,
      deliveryNoteNumber: note.number,
      deliveryNoteError: null,
    };
  }

  // Mode FACTURE_NORMALISEE
  const invoiceCount = await prisma.invoice.count();
  const invoice = await prisma.invoice.create({
    data: {
      number: nextDocNumber(activity === ACTIVITY.GARAGE ? "FAC-GAR" : "FAC", invoiceCount),
      status: "ENVOYEE",
      kind: "NORMALISEE",
      activity,
      isDemo: process.env.DGI_EMECEF_MODE === "DEMO",
      certificationMode: process.env.DGI_EMECEF_MODE === "DEMO" ? "DEMO" : null,
      customerId: quote.customerId,
      quoteId: quote.id,
      taxMode: quote.taxMode,
      taxRatePct: quote.taxRatePct,
      subtotalHtXof: quote.subtotalHtXof,
      taxXof: quote.taxXof,
      totalXof: quote.totalXof,
      cgvType: quote.cgvType,
      customCgv: quote.customCgv,
      dueDate: new Date(Date.now() + 7 * 86400000),
    },
  });

  let certificationFailed = false;
  let certificationMessage = "Facture certifiée auprès de la DGI.";
  try {
    const result = await certifyInvoiceWithMecef(invoice.id);
    certificationMessage = result.message;
  } catch (err) {
    certificationFailed = true;
    certificationMessage =
      err instanceof Error
        ? err.message
        : "La certification DGI a échoué. Réessayez depuis la page Factures.";
  }

  let deliveryNoteId: string | null = null;
  let deliveryNoteNumber: string | null = null;
  let deliveryNoteError: string | null = null;
  try {
    const note = await createAndIssueDeliveryNote({
      activity,
      customerId: quote.customerId,
      quoteId: quote.id,
      invoiceId: invoice.id,
      notes: `BL interne généré automatiquement avec la facture ${invoice.number}`,
      lines: deliveryLines,
    });
    deliveryNoteId = note.id;
    deliveryNoteNumber = note.number;
  } catch (err) {
    deliveryNoteError =
      err instanceof Error ? err.message : "La création du bon de livraison interne a échoué.";
  }

  await prisma.quote.update({
    where: { id },
    data: {
      status: "FACTURE_NORMALISEE",
      transcribedAt: now,
      transcriptionMode: "FACTURE_NORMALISEE",
      auditNotes: [
        quote.auditNotes,
        `${now.toISOString()} · Transcrite en facture normalisée ${invoice.number} par ${user.fullName}` +
          (certificationFailed ? " (certification DGI en attente)" : "") +
          (deliveryNoteError ? ` (BL interne non créé : ${deliveryNoteError})` : ""),
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });

  await logAudit({
    user,
    action: "quote.transcribe_invoice",
    entityType: "Quote",
    entityId: quote.id,
    entityLabel: quote.number,
    activity,
    details: `Facture ${invoice.number}`,
  });

  revalidatePath("/quotes");
  revalidatePath("/invoices");
  revalidatePath("/delivery-notes");

  return {
    mode: "FACTURE_NORMALISEE",
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    certificationFailed,
    certificationMessage,
    deliveryNoteId,
    deliveryNoteNumber,
    deliveryNoteError,
  };
}

