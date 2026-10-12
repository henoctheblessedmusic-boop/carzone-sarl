import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { ExpensesView } from "./ExpensesView";

export default async function ExpensesPage() {
  const user = await requireUser([
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "COMPTA",
    "ASSISTANTE_COMPTABLE",
    "ADMIN",
    "RH",
  ]);

  const currentYear = new Date().getFullYear();

  const [rawExpenses, rawSalaries] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { serviceDate: "desc" },
    }),
    prisma.salaryPayment.findMany({
      where: { year: currentYear },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeNumber: true } },
      },
      orderBy: { paymentDate: "desc" },
    }),
  ]);

  const expenses = rawExpenses.map((exp) => ({
    id: exp.id,
    expenseNumber: exp.expenseNumber,
    category: exp.category,
    title: exp.title,
    description: exp.description,
    supplierName: exp.supplierName,
    supplierPhone: exp.supplierPhone,
    supplierEmail: exp.supplierEmail,
    proformaRef: exp.proformaRef,
    purchaseOrderNo: exp.purchaseOrderNo,
    amountHtXof: exp.amountHtXof,
    taxXof: exp.taxXof,
    amountTtcXof: exp.amountTtcXof,
    status: exp.status,
    paymentMethod: exp.paymentMethod,
    paymentDate: exp.paymentDate ? exp.paymentDate.toISOString() : null,
    paymentReference: exp.paymentReference,
    invoiceFileUrl: exp.invoiceFileUrl,
    serviceDate: exp.serviceDate.toISOString(),
    dueDate: exp.dueDate ? exp.dueDate.toISOString() : null,
    registeredBy: exp.registeredBy,
    createdAt: exp.createdAt.toISOString(),
  }));

  const salaryPayments = rawSalaries.map((sp) => ({
    id: sp.id,
    employeeId: sp.employeeId,
    month: sp.month,
    year: sp.year,
    amountXof: sp.amountXof,
    paymentDate: sp.paymentDate.toISOString(),
    paymentMethod: sp.paymentMethod,
    reference: sp.reference,
    status: sp.status,
    employee: sp.employee,
  }));

  return (
    <AppShell user={user} titleKey="expenses">
      <ExpensesView
        currentUserRole={user.role}
        initialExpenses={expenses}
        initialSalaryPayments={salaryPayments}
        currentYear={currentYear}
      />
    </AppShell>
  );
}
