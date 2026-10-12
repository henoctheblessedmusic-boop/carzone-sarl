import { AppShell } from "@/components/AppShell";
import { PolicyPanel } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { InvoicesView, type InvoiceItem, type PaymentRow } from "./InvoicesView";
import type { ExpenseItem, SalaryItem, VehicleStat, WorkOrderStat } from "./FinancialBilanTab";

export default async function InvoicesPage() {
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

  const currentYear = new Date().getFullYear();

  const [
    rawInvoices,
    rawPayments,
    rawExpenses,
    rawSalaries,
    rawVehicles,
    rawWorkOrders,
  ] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        customer: true,
        payments: {
          orderBy: { paidAt: "asc" },
        },
        quote: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { paidAt: "desc" },
    }),
    prisma.expense.findMany({
      orderBy: { serviceDate: "desc" },
    }),
    prisma.salaryPayment.findMany({
      include: {
        employee: { select: { firstName: true, lastName: true, employeeNumber: true } },
      },
      orderBy: { paymentDate: "desc" },
    }),
    prisma.vehicle.findMany({
      select: {
        id: true,
        vin: true,
        brand: true,
        model: true,
        costXof: true,
        priceXof: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.workOrder.findMany({
      select: {
        id: true,
        number: true,
        laborXof: true,
        partsXof: true,
        status: true,
        openedAt: true,
        closedAt: true,
      },
    }),
  ]);

  const invoices: InvoiceItem[] = rawInvoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    kind: inv.kind,
    taxMode: inv.taxMode,
    taxRatePct: inv.taxRatePct,
    subtotalHtXof: inv.subtotalHtXof,
    taxXof: inv.taxXof,
    totalXof: inv.totalXof,
    paidXof: inv.paidXof,
    isFiscalCertified: inv.isFiscalCertified,
    mecefCode: inv.mecefCode,
    mecefNim: inv.mecefNim,
    mecefQrCode: inv.mecefQrCode,
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
    customer: {
      id: inv.customer.id,
      contactName: inv.customer.contactName,
      companyName: inv.customer.companyName,
      email: inv.customer.email,
      phone: inv.customer.phone,
    },
    quote: inv.quote
      ? {
          id: inv.quote.id,
          number: inv.quote.number,
        }
      : null,
    payments: inv.payments.map((p) => ({
      id: p.id,
      amountXof: p.amountXof,
      method: p.method,
      reference: p.reference,
      paidAt: p.paidAt.toISOString(),
      notes: p.notes,
    })),
  }));

  const allPayments: PaymentRow[] = rawPayments.map((p) => ({
    id: p.id,
    amountXof: p.amountXof,
    method: p.method,
    reference: p.reference,
    paidAt: p.paidAt.toISOString(),
    notes: p.notes,
    invoice: {
      id: p.invoice.id,
      number: p.invoice.number,
      totalXof: p.invoice.totalXof,
      customer: {
        contactName: p.invoice.customer.contactName,
        companyName: p.invoice.customer.companyName,
      },
    },
  }));

  const expenses: ExpenseItem[] = rawExpenses.map((exp) => ({
    id: exp.id,
    expenseNumber: exp.expenseNumber,
    category: exp.category,
    title: exp.title,
    supplierName: exp.supplierName,
    purchaseOrderNo: exp.purchaseOrderNo,
    amountHtXof: exp.amountHtXof,
    taxXof: exp.taxXof,
    amountTtcXof: exp.amountTtcXof,
    status: exp.status,
    paymentMethod: exp.paymentMethod,
    serviceDate: exp.serviceDate.toISOString(),
    paymentDate: exp.paymentDate ? exp.paymentDate.toISOString() : null,
  }));

  const salaries: SalaryItem[] = rawSalaries.map((s) => ({
    id: s.id,
    month: s.month,
    year: s.year,
    amountXof: s.amountXof,
    paymentDate: s.paymentDate.toISOString(),
    status: s.status,
    employee: s.employee,
  }));

  const vehicles: VehicleStat[] = rawVehicles.map((v) => ({
    id: v.id,
    vin: v.vin,
    brand: v.brand,
    model: v.model,
    costXof: v.costXof,
    priceXof: v.priceXof,
    status: v.status,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));

  const workOrders: WorkOrderStat[] = rawWorkOrders.map((wo) => ({
    id: wo.id,
    number: wo.number,
    laborXof: wo.laborXof,
    partsXof: wo.partsXof,
    status: wo.status,
    openedAt: wo.openedAt.toISOString(),
    closedAt: wo.closedAt ? wo.closedAt.toISOString() : null,
  }));

  return (
    <AppShell user={user} titleKey="invoices">
      <PolicyPanel />
      <InvoicesView
        invoices={invoices}
        allPayments={allPayments}
        expenses={expenses}
        salaries={salaries}
        vehicles={vehicles}
        workOrders={workOrders}
        currentYear={currentYear}
        userRole={user.role}
      />
    </AppShell>
  );
}
