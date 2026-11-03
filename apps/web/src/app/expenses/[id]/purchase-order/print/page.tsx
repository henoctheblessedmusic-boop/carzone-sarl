import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { PurchaseOrderDocument } from "../../../PurchaseOrderDocument";
import { PurchaseOrderPrintToolbar } from "../../../PurchaseOrderPrintToolbar";

const ALLOWED_ROLES = [
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

export default async function PurchaseOrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser([...ALLOWED_ROLES]);
  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });
  if (!expense) notFound();

  const documentExpense = {
    id: expense.id,
    expenseNumber: expense.expenseNumber,
    purchaseOrderNo: expense.purchaseOrderNo,
    category: expense.category,
    title: expense.title,
    description: expense.description,
    supplierName: expense.supplierName,
    supplierPhone: expense.supplierPhone,
    supplierEmail: expense.supplierEmail,
    proformaRef: expense.proformaRef,
    serviceDate: expense.serviceDate.toISOString(),
    dueDate: expense.dueDate ? expense.dueDate.toISOString() : null,
    deliveryAddress: expense.deliveryAddress,
    deliveryDate: expense.deliveryDate ? expense.deliveryDate.toISOString() : null,
    paymentTerms: expense.paymentTerms,
    budgetLine: expense.budgetLine,
    fundingSource: expense.fundingSource,
    taxRatePct: expense.taxRatePct,
    amountHtXof: expense.amountHtXof,
    taxXof: expense.taxXof,
    amountTtcXof: expense.amountTtcXof,
    authorizedByName: expense.authorizedByName,
    authorizedTitle: expense.authorizedTitle,
    authorizedAt: expense.authorizedAt ? expense.authorizedAt.toISOString() : null,
    supplierAcceptedByName: expense.supplierAcceptedByName,
    supplierAcceptedAt: expense.supplierAcceptedAt ? expense.supplierAcceptedAt.toISOString() : null,
    lines: expense.lines.map((line) => ({
      id: line.id,
      description: line.description,
      quantity: line.quantity,
      unit: line.unit,
      unitPriceXof: line.unitPriceXof,
      totalXof: line.totalXof,
    })),
    registeredBy: expense.registeredBy,
    createdAt: expense.createdAt.toISOString(),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#e5e7eb" }}>
      <PurchaseOrderPrintToolbar backHref="/expenses" />
      <main style={{ padding: "20px 12px 40px" }}>
        <div style={{ boxShadow: "0 10px 30px rgba(15,23,42,0.12)", background: "#fff", maxWidth: 900, margin: "0 auto" }}>
          <PurchaseOrderDocument expense={documentExpense} />
        </div>
      </main>
    </div>
  );
}
