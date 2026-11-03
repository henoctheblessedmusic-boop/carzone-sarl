"use server";

import { certifyInvoiceWithMecef } from "@/lib/dgi-emecef";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { getServerMessages } from "@/lib/i18n/server";
import { invoicesCopy } from "@/lib/i18n/messages/invoices";
import { ACTIVITY, type Activity } from "@/lib/permissions";
import { formatXof } from "@/lib/format";
import { SITE_WEBSITE, SITE_EMAILS } from "@/lib/site-constants";
import { logAudit } from "@/lib/audit";

export async function addPayment(formData: FormData) {
  // Encaissements clients : direction, comptabilité, assistante comptable et responsable
  // des ventes. Les autres rôles n'enregistrent pas de règlement.
  const user = await requireUser([
    "PDG",
    "SG",
    "DG",
    "COMMERCIAL",
    "ASSISTANTE_COMPTABLE",
    "COMPTA",
    "COMPTA_GARAGE",
  ]);
  const { locale } = await getServerMessages();
  const copy = invoicesCopy[locale];
  const invoiceId = String(formData.get("invoiceId") || "");
  const amountXof = Number(formData.get("amountXof") || 0);
  const method = String(formData.get("method") || "VIREMENT");
  const reference = String(formData.get("reference") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const rawDate = String(formData.get("paidAt") || "");
  const paidAt = rawDate ? new Date(rawDate) : new Date();

  if (!invoiceId) throw new Error(copy.server.invoiceRequired);
  if (amountXof <= 0) throw new Error(copy.server.invalidAmount);

  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { payments: true, customer: true },
  });

  if (user.role === "COMPTA_GARAGE" && invoice.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut encaisser que des factures du périmètre GARAGE.");
  }

  if (invoice.isDemo) {
    throw new Error("Facture de démonstration : aucun encaissement réel ne peut être enregistré.");
  }
  if (invoice.kind !== "NORMALISEE") {
    throw new Error("Un encaissement doit être rattaché à une facture normalisée.");
  }
  if (["BROUILLON", "ANNULEE"].includes(invoice.status) || invoice.cancelledAt) {
    throw new Error("Cette facture n'est pas encaissable (brouillon ou annulée).");
  }
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amountXof,
      method,
      reference,
      notes,
      paidAt,
      createdByName: user.fullName,
    },
  });

  const allPayments = await prisma.payment.findMany({ where: { invoiceId } });
  const paidXof = allPayments.reduce((s, p) => s + p.amountXof, 0);

  let newStatus = invoice.status;
  if (paidXof >= invoice.totalXof) {
    newStatus = "PAYEE";
  } else if (paidXof > 0) {
    newStatus = "PAYEE_PARTIEL";
  }

  const auditEntry = `${new Date().toISOString()} · Encaissement de ${amountXof.toLocaleString("fr-BJ")} FCFA (${method}${reference ? ` / ${reference}` : ""}) par ${user.fullName}`;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidXof,
      status: newStatus,
      notes: [invoice.notes, auditEntry].filter(Boolean).join("\n"),
    },
  });

  await logAudit({
    user,
    action: "invoice.add_payment",
    entityType: "Invoice",
    entityId: invoice.id,
    entityLabel: invoice.number,
    activity: invoice.activity as Activity,
    details: `${amountXof.toLocaleString("fr-BJ")} FCFA (${method})`,
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/clients/${invoice.customerId}`);

  return { paymentId: payment.id };
}

export async function voidInvoice(formData: FormData) {
  const user = await requireUser(["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "COMPTA_GARAGE"]);
  const id = String(formData.get("id"));
  const reason = String(formData.get("cancelReason") || "").trim();
  if (reason.length < 8) throw new Error("Motif d'annulation obligatoire (au moins 8 caractères)");

  const inv = await prisma.invoice.findUniqueOrThrow({ where: { id } });
  if (user.role === "COMPTA_GARAGE" && inv.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut annuler que des factures du périmètre GARAGE.");
  }
  if (inv.status === "ANNULEE" || inv.status === "PAYEE") {
    throw new Error("Impossible d'annuler une facture soldée ou déjà annulée");
  }

  const now = new Date();
  await prisma.invoice.update({
    where: { id },
    data: {
      status: "ANNULEE",
      cancelReason: reason,
      cancelledAt: now,
      cancelledByName: user.fullName,
      notes: [inv.notes, `${now.toISOString()} · Annulation interne par ${user.fullName}: ${reason}`]
        .filter(Boolean)
        .join("\n"),
    },
  });

  await logAudit({
    user,
    action: "invoice.void",
    entityType: "Invoice",
    entityId: inv.id,
    entityLabel: inv.number,
    activity: inv.activity as Activity,
    details: reason,
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function certifyInvoiceDgi(formData: FormData): Promise<void> {
  const user = await requireUser(["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "COMPTA_GARAGE"]);
  const invoiceId = String(formData.get("invoiceId") || "");
  if (!invoiceId) throw new Error("Facture requise");

  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  if (user.role === "COMPTA_GARAGE" && invoice.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut certifier que des factures du périmètre GARAGE.");
  }

  await certifyInvoiceWithMecef(invoiceId);
  await logAudit({
    user,
    action: "invoice.certify_dgi",
    entityType: "Invoice",
    entityId: invoice.id,
    entityLabel: invoice.number,
    activity: invoice.activity as Activity,
  });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}/print`);
}

/**
 * Enregistre l'envoi de la facture (et du BL interne lié, si présent) comme un message
 * dans la boîte Mail de l'application. Le logiciel n'a pas de SMTP réel : rien n'est
 * transmis à un serveur de messagerie externe, le message reste consultable dans /mailbox.
 */
export async function sendInvoiceEmail(formData: FormData) {
  const user = await requireUser([
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "COMMERCIAL",
    "HOTESSE",
    "CHEF_ATELIER",
    "ASSISTANTE_COMPTABLE",
    "COMPTA",
    "COMPTA_GARAGE",
    "ADMIN",
  ]);

  const invoiceId = String(formData.get("invoiceId") || "");
  if (!invoiceId) throw new Error("Facture requise.");

  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { customer: true, deliveryNotes: { where: { status: "EMIS" }, take: 1 } },
  });

  if (user.role === "COMPTA_GARAGE" && invoice.activity !== ACTIVITY.GARAGE) {
    throw new Error("La Comptable Garage ne peut envoyer que des factures du périmètre GARAGE.");
  }

  const emailTo = String(formData.get("emailTo") || "").trim() || invoice.customer.email || null;
  if (!emailTo) throw new Error("Aucune adresse e-mail de destination.");

  const customSubject = String(formData.get("subject") || "").trim();
  const customBody = String(formData.get("body") || "").trim();
  const now = new Date();

  const deliveryNote = invoice.deliveryNotes[0] || null;
  const invoiceUrl = `${SITE_WEBSITE}/invoices/${invoice.id}/print`;
  const deliveryNoteUrl = deliveryNote ? `${SITE_WEBSITE}/delivery-notes/${deliveryNote.id}/print` : null;

  const finalSubject =
    customSubject ||
    `Facture ${invoice.number}${deliveryNote ? ` et bon de livraison ${deliveryNote.number}` : ""} · CARZONE SARL`;

  const deliveryNoteLine =
    deliveryNote && deliveryNoteUrl
      ? `Lien d'impression du bon de livraison interne ${deliveryNote.number} : ${deliveryNoteUrl}\n`
      : "";

  const defaultBody = `Bonjour ${invoice.customer.contactName},

Veuillez trouver ci-joint votre facture normalisée ${invoice.number}, d'un montant total de ${formatXof(invoice.totalXof)}.

Lien d'impression de la facture : ${invoiceUrl}
${deliveryNoteLine}
Restant à votre entière disposition,
L'équipe CARZONE SARL
Showroom Zone Maro-Militaire, Gbèdomidji · Cotonou, Bénin`;

  const finalBody = customBody || defaultBody;

  await prisma.mailMessage.create({
    data: {
      folder: "SENT",
      from: SITE_EMAILS.contact,
      to: emailTo,
      subject: finalSubject,
      snippet: finalBody.slice(0, 120).replace(/\n/g, " ") + "...",
      body: finalBody,
      isRead: true,
      customerId: invoice.customerId,
      invoiceId: invoice.id,
    },
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      notes: [
        invoice.notes,
        `${now.toISOString()} · Envoi facture par e-mail vers ${emailTo} par ${user.fullName}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });

  await logAudit({
    user,
    action: "invoice.send_email",
    entityType: "Invoice",
    entityId: invoice.id,
    entityLabel: invoice.number,
    activity: invoice.activity as Activity,
    details: `Envoi vers ${emailTo}`,
  });

  revalidatePath("/invoices");
  revalidatePath("/mailbox");
}
