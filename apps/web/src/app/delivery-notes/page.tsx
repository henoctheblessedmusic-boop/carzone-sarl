import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { ACTIVITY } from "@/lib/permissions";
import { DeliveryNotesView, type DeliveryNoteItem } from "./DeliveryNotesView";

export default async function DeliveryNotesPage() {
  const user = await requireUser(["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "COMPTA_GARAGE", "ADMIN"]);

  const scope = user.role === "COMPTA_GARAGE" ? { activity: ACTIVITY.GARAGE } : undefined;

  const [rawNotes, customers, vehicles, parts] = await Promise.all([
    prisma.deliveryNote.findMany({
      where: scope,
      include: {
        customer: true,
        lines: { include: { vehicle: true, partItem: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({
      where: { active: true },
      orderBy: { contactName: "asc" },
      select: { id: true, contactName: true, companyName: true, scopeShowroom: true, scopeGarage: true },
    }),
    prisma.vehicle.findMany({
      where: { status: { in: ["EN_STOCK", "EN_MAGASIN"] } },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      select: { id: true, vin: true, brand: true, model: true, priceXof: true },
    }),
    prisma.partItem.findMany({
      where: { active: true, stockQuantity: { gt: 0 } },
      orderBy: { name: "asc" },
      select: { id: true, partNumber: true, name: true, stockQuantity: true, sellingPriceXof: true },
    }),
  ]);

  const notes: DeliveryNoteItem[] = rawNotes.map((n) => ({
    id: n.id,
    number: n.number,
    activity: n.activity,
    status: n.status,
    notes: n.notes,
    cancelReason: n.cancelReason,
    cancelledByName: n.cancelledByName,
    cancelledAt: n.cancelledAt ? n.cancelledAt.toISOString() : null,
    createdByName: n.createdByName,
    createdAt: n.createdAt.toISOString(),
    customer: n.customer
      ? { id: n.customer.id, contactName: n.customer.contactName, companyName: n.customer.companyName }
      : null,
    lines: n.lines.map((l) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      unitPriceXof: l.unitPriceXof,
      vehicle: l.vehicle ? { brand: l.vehicle.brand, model: l.vehicle.model, vin: l.vehicle.vin } : null,
      partItem: l.partItem ? { partNumber: l.partItem.partNumber, name: l.partItem.name } : null,
    })),
  }));

  return (
    <AppShell user={user} title="Bons de livraison">
      <DeliveryNotesView
        notes={notes}
        customers={customers}
        vehicles={vehicles}
        parts={parts}
        userRole={user.role}
      />
    </AppShell>
  );
}
