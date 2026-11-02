import { AppShell } from "@/components/AppShell";
import { PolicyPanel } from "@/components/PolicyPanel";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { ACTIVITY, customerScopeFilterForRole, quoteScopeForRole } from "@/lib/permissions";
import { QuotesView, type QuoteItem } from "./QuotesView";

export default async function QuotesPage() {
  const user = await requireUser([
    "DG",
    "COMMERCIAL",
    "COMPTA",
    "COMPTA_GARAGE",
    "ADMIN",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "CHEF_ATELIER",
    "HOTESSE",
    "ASSISTANTE_COMPTABLE",
  ]);

  const scope = quoteScopeForRole(user.role);
  const isGarageScope = scope === ACTIVITY.GARAGE;
  const customerScopeFilter = customerScopeFilterForRole(user.role);

  const [rawQuotes, customers, articles, vehicles, opps, parts] = await Promise.all([
    prisma.quote.findMany({
      where: user.role === "COMPTA_GARAGE" ? { activity: ACTIVITY.GARAGE } : undefined,
      include: {
        customer: true,
        lines: {
          include: {
            vehicle: true,
          },
        },
        invoice: true,
        deliveryNotes: {
          select: { id: true, number: true, status: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({
      where: { active: true, ...customerScopeFilter },
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
      where: { active: true, ...(isGarageScope ? { category: { not: "VEHICULE" } } : {}) },
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
    isGarageScope
      ? Promise.resolve([])
      : prisma.vehicle.findMany({
          where: {
            status: { notIn: ["VENDU", "ARCHIVE"] },
          },
          orderBy: [{ brand: "asc" }, { model: "asc" }],
          select: {
            id: true,
            vin: true,
            brand: true,
            model: true,
            variant: true,
            color: true,
            priceXof: true,
            status: true,
          },
        }),
    isGarageScope
      ? Promise.resolve([])
      : prisma.opportunity.findMany({
          where: { stage: { in: ["DEVIS", "ESSAI", "MATCHING", "NEGOCIATION"] } },
          select: {
            id: true,
            title: true,
            customerId: true,
          },
        }),
    isGarageScope
      ? prisma.partItem.findMany({
          where: { active: true },
          orderBy: [{ category: "asc" }, { name: "asc" }],
          select: {
            id: true,
            partNumber: true,
            oemNumber: true,
            name: true,
            category: true,
            unit: true,
            stockQuantity: true,
            sellingPriceXof: true,
            taxRatePct: true,
          },
        })
      : Promise.resolve([]),
  ]);

  // Trier les véhicules pour que le Stock Showroom apparaisse en premier, puis Au Port, En Transit, etc.
  const statusOrder: Record<string, number> = {
    EN_MAGASIN: 1,
    EN_STOCK: 1,
    AU_PORT: 2,
    EN_TRANSIT: 3,
    EN_PRODUCTION: 4,
    COMMANDE: 5,
  };

  const sortedVehicles = [...vehicles].sort((a, b) => {
    const pA = statusOrder[a.status || ""] || 99;
    const pB = statusOrder[b.status || ""] || 99;
    if (pA !== pB) return pA - pB;
    return a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model);
  });

  const quotes: QuoteItem[] = rawQuotes.map((q) => ({
    id: q.id,
    number: q.number,
    status: q.status,
    docKind: q.docKind,
    activity: q.activity,
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
    transcribedAt: q.transcribedAt ? q.transcribedAt.toISOString() : null,
    transcriptionMode: q.transcriptionMode,
    deliveryNotes: q.deliveryNotes.map((n) => ({ id: n.id, number: n.number, status: n.status })),
  }));

  return (
    <AppShell user={user} titleKey="quotes">
      <PolicyPanel />
      <QuotesView
        quotes={quotes}
        customers={customers}
        articles={articles}
        vehicles={sortedVehicles}
        parts={parts}
        opportunities={opps}
        userRole={user.role}
        scope={scope}
      />
    </AppShell>
  );
}
