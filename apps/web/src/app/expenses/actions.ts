"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

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
}) {
  const user = await requireUser([...CAN_MANAGE_EXPENSES]);

  if (!data.title.trim() || !data.supplierName.trim() || data.amountTtcXof <= 0) {
    throw new Error("Veuillez renseigner la désignation, le prestataire et le montant valide.");
  }

  const expenseNumber = await generateExpenseNumber();

  const expense = await prisma.expense.create({
    data: {
      expenseNumber,
      category: data.category || "PRESTATAIRE_SERVICE",
      title: data.title.trim(),
      description: data.description?.trim() || null,
      supplierName: data.supplierName.trim(),
      supplierPhone: data.supplierPhone?.trim() || null,
      supplierEmail: data.supplierEmail?.trim() || null,
      proformaRef: data.proformaRef?.trim() || null,
      purchaseOrderNo: data.purchaseOrderNo?.trim() || null,
      amountHtXof: Number(data.amountHtXof) || Number(data.amountTtcXof),
      taxXof: Number(data.taxXof) || 0,
      amountTtcXof: Number(data.amountTtcXof),
      status: data.status || "A_PAYER",
      paymentMethod: data.paymentMethod || null,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : (data.status === "PAYE" ? new Date() : null),
      paymentReference: data.paymentReference?.trim() || null,
      invoiceFileUrl: data.invoiceFileUrl?.trim() || null,
      serviceDate: data.serviceDate ? new Date(data.serviceDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      registeredBy: user.fullName || user.role,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
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
  await requireUser([...CAN_MANAGE_EXPENSES]);

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      status: "PAYE",
      paymentMethod: paymentData.paymentMethod || "VIREMENT",
      paymentReference: paymentData.paymentReference?.trim() || null,
      paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date(),
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return updated;
}

export async function deleteExpense(id: string) {
  await requireUser([...CAN_MANAGE_EXPENSES]);

  await prisma.expense.delete({
    where: { id },
  });

  revalidatePath("/expenses");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true };
}
