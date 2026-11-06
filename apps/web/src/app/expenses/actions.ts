"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { getLocale } from "@/lib/i18n/server";
import { adminCopy } from "@/lib/i18n/messages/admin";
import { normalizePhone } from "@/lib/client-import";

const CAN_MANAGE_EXPENSES = [
  "PDG",
  "SG",
  "DG",
  "ADV",
  "RF",
  "COMPTA",
  "ASSISTANTE_COMPTABLE",
  "ADMIN",
  "RH",
] as const;

export async function generateExpenseNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.expense.count();
  const seq = String(count + 1).padStart(3, "0");
  return `DEP-${currentYear}-${seq}`;
}

export async function generatePurchaseOrderNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.expense.count({
    where: { purchaseOrderNo: { not: null } },
  });
  const seq = String(count + 1).padStart(3, "0");
  return `BC-${currentYear}-${seq}`;
}

export async function createExpense(data: {
  category: string;
  title: string;
  description?: string;
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  proformaRef?: string;
  purchaseOrderNo?: string;
  amountHtXof: number;
  taxXof?: number;
  amountTtcXof: number;
  status?: string; // "A_PAYER", "PAYE"
  paymentMethod?: string;
  paymentDate?: string;
  paymentReference?: string;
  invoiceFileUrl?: string;
  serviceDate?: string;
  dueDate?: string;
  lines?: Array<{ description: string; quantity: number; unit?: string; unitPriceXof: number }>;
  taxRatePct?: number;
  deliveryAddress?: string;
  deliveryDate?: string;
  paymentTerms?: string;
  budgetLine?: string;
  fundingSource?: string;
  authorizedByName?: string;
  authorizedTitle?: string;
}) {
  const user = await requireUser([...CAN_MANAGE_EXPENSES]);

  const normalizedLines = (data.lines ?? [])
    .map((line, index) => {
      const description = String(line.description || "").trim();
      const quantity = Number(line.quantity) || 0;
      const unitPriceXof = Math.max(0, Math.round(Number(line.unitPriceXof) || 0));
      return {
        description,
        quantity,
        unit: String(line.unit || "U").trim() || "U",
        unitPriceXof,
        totalXof: Math.round(quantity * unitPriceXof),
        sortOrder: index,
      };
    })
    .filter((line) => line.description && line.quantity > 0 && line.unitPriceXof >= 0);

  const computedHt = normalizedLines.length
    ? normalizedLines.reduce((sum, line) => sum + line.totalXof, 0)
    : Number(data.amountHtXof) || Number(data.amountTtcXof);
  const taxRatePct = Math.max(0, Number(data.taxRatePct) || 0);
  const taxXof = Math.max(
    0,
    Math.round(Number(data.taxXof) || 0) || Math.round((computedHt * taxRatePct) / 100)
  );
  const amountTtcXof = computedHt + taxXof;

  if (!data.title.trim() || !data.supplierName.trim() || amountTtcXof <= 0) {
    throw new Error(adminCopy[await getLocale()].server.expenses.requiredExpenseFields);
  }

  const expenseNumber = await generateExpenseNumber();

  const expense = await prisma.expense.create({
    data: {
      expenseNumber,
      category: data.category || "PRESTATAIRE_SERVICE",
      title: data.title.trim(),
      description: data.description?.trim() || null,
      supplierName: data.supplierName.trim(),
      supplierPhone: normalizePhone(data.supplierPhone),
      supplierEmail: data.supplierEmail?.trim() || null,
      proformaRef: data.proformaRef?.trim() || null,
      purchaseOrderNo: data.purchaseOrderNo?.trim() || null,
      amountHtXof: computedHt,
      taxXof,
      amountTtcXof,
      taxRatePct,
      status: data.status || "A_PAYER",
      paymentMethod: data.paymentMethod || null,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : (data.status === "PAYE" ? new Date() : null),
      paymentReference: data.paymentReference?.trim() || null,
      invoiceFileUrl: data.invoiceFileUrl?.trim() || null,
      serviceDate: data.serviceDate ? new Date(data.serviceDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      deliveryAddress: data.deliveryAddress?.trim() || null,
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
      paymentTerms: data.paymentTerms?.trim() || null,
      budgetLine: data.budgetLine?.trim() || null,
      fundingSource: data.fundingSource?.trim() || null,
      authorizedByName: data.authorizedByName?.trim() || user.fullName || null,
      authorizedTitle: data.authorizedTitle?.trim() || null,
      authorizedAt: data.purchaseOrderNo ? new Date() : null,
      registeredBy: user.fullName || user.role,
      lines: normalizedLines.length ? { create: normalizedLines } : undefined,
    },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });

  revalidatePath("/expenses");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");

  await logAudit({
    user,
    action: "expense.create",
    entityType: "Expense",
    entityId: expense.id,
    entityLabel: `${expense.expenseNumber} - ${expense.title}`,
    details: `${expense.amountTtcXof.toLocaleString("fr-BJ")} FCFA - ${expense.supplierName}`,
  });

  return expense;
}

export async function markExpensePaid(
  id: string,
  paymentData: {
    paymentMethod: string;
    paymentReference?: string;
    paymentDate?: string;
  }
) {
  const user = await requireUser([...CAN_MANAGE_EXPENSES]);

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      status: "PAYE",
      paymentMethod: paymentData.paymentMethod || "VIREMENT",
      paymentReference: paymentData.paymentReference?.trim() || null,
      paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date(),
    },
  });

  await logAudit({
    user,
    action: "expense.pay",
    entityType: "Expense",
    entityId: updated.id,
    entityLabel: `${updated.expenseNumber} - ${updated.title}`,
    details: `Paiement ${updated.paymentMethod} - ${updated.amountTtcXof.toLocaleString("fr-BJ")} FCFA`,
  });

  revalidatePath("/expenses");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return updated;
}

export async function deleteExpense(id: string) {
  const user = await requireUser([...CAN_MANAGE_EXPENSES]);

  const deleted = await prisma.expense.delete({
    where: { id },
  });

  await logAudit({
    user,
    action: "expense.delete",
    entityType: "Expense",
    entityId: id,
    entityLabel: `${deleted.expenseNumber} - ${deleted.title}`,
    details: `Suppression d'une dépense de ${deleted.amountTtcXof.toLocaleString("fr-BJ")} FCFA`,
  });

  revalidatePath("/expenses");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true };
}
