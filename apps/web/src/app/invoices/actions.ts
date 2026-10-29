"use server";

import { certifyInvoiceWithMecef } from "@/lib/dgi-emecef";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { getServerMessages } from "@/lib/i18n/server";
import { invoicesCopy } from "@/lib/i18n/messages/invoices";

export async function addPayment(formData: FormData) {
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
    "ADMIN",
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

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amountXof,
      method,
      reference,
      notes,
      paidAt,
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

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/clients/${invoice.customerId}`);

  return { paymentId: payment.id };
}

export async function voidInvoice(formData: FormData) {
  const user = await requireUser(["PDG", "SG", "DG", "ADV", "RF", "COMPTA"]);
  const id = String(formData.get("id"));
  const reason = String(formData.get("cancelReason") || "").trim();
  if (reason.length < 8) throw new Error("Motif d'annulation obligatoire (au moins 8 caractères)");

  const inv = await prisma.invoice.findUniqueOrThrow({ where: { id } });
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

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function certifyInvoiceDgi(formData: FormData): Promise<void> {
  await requireUser(["PDG", "SG", "DG", "ADV", "RF", "COMPTA"]);
  const invoiceId = String(formData.get("invoiceId") || "");
  if (!invoiceId) throw new Error("Facture requise");

  await certifyInvoiceWithMecef(invoiceId);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}/print`);
}
