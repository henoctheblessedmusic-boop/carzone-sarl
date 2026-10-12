import { AppShell } from "@/components/AppShell";
import { PolicyPanel } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { QuotesView, type QuoteItem } from "./QuotesView";

export default async function QuotesPage() {
  const user = await requireUser(["DG", "COMMERCIAL", "COMPTA", "ADMIN"]);

  const [rawQuotes, customers, articles, vehicles, opps] = await Promise.all([
    prisma.quote.findMany({
      include: {
        customer: true,
        lines: {
          include: {
            vehicle: true,
          },
        },
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({
      where: { active: true },
      orderBy: { contactName: "asc" },
      select: {
        id: true,
        contactName: true,
        companyName: true,
        email: true,
        phone: true,
        category: true,
        ifu: true,
        address: true,
      },
    }),
    prisma.article.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        category: true,
        unitPriceXof: true,
        taxRatePct: true,
        unit: true,
        description: true,
      },
    }),
    prisma.vehicle.findMany({
      where: { status: "EN_STOCK" },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      select: {
        id: true,
        vin: true,
        brand: true,
        model: true,
        variant: true,
        color: true,
        priceXof: true,
      },
    }),
    prisma.opportunity.findMany({
      where: { stage: { in: ["DEVIS", "ESSAI", "MATCHING", "NEGOCIATION"] } },
      select: {
        id: true,
        title: true,
        customerId: true,
      },
    }),
  ]);

  const quotes: QuoteItem[] = rawQuotes.map((q) => ({
    id: q.id,
    number: q.number,
    status: q.status,
    docKind: q.docKind,
    taxMode: q.taxMode,
    taxRatePct: q.taxRatePct,
    subtotalHtXof: q.subtotalHtXof,
    taxXof: q.taxXof,
    totalXof: q.totalXof,
    validUntil: q.validUntil ? q.validUntil.toISOString() : null,
    notes: q.notes,
    createdAt: q.createdAt.toISOString(),
    sentAt: q.sentAt ? q.sentAt.toISOString() : null,
    customerId: q.customerId,
    customer: {
      id: q.customer.id,
      contactName: q.customer.contactName,
      companyName: q.customer.companyName,
      email: q.customer.email,
      phone: q.customer.phone,
    },
    lines: q.lines.map((l) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      unitPriceXof: l.unitPriceXof,
      vehicleId: l.vehicleId,
      vehicle: l.vehicle
        ? {
            brand: l.vehicle.brand,
            model: l.vehicle.model,
            vin: l.vehicle.vin,
          }
        : null,
    })),
    invoice: q.invoice
      ? {
          id: q.invoice.id,
          number: q.invoice.number,
          status: q.invoice.status,
        }
      : null,
  }));

  return (
    <AppShell user={user} titleKey="quotes">
      <PolicyPanel />
      <QuotesView
        quotes={quotes}
        customers={customers}
        articles={articles}
        vehicles={vehicles}
        opportunities={opps}
        userRole={user.role}
      />
    </AppShell>
  );
}
