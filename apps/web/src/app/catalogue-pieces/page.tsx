import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import {
  GeneralPartsCatalogView,
  type GeneralPartView,
  type GeneralPartOrderView,
  type GeneralSupplierView,
} from "./GeneralPartsCatalogView";

// Le Gestionnaire de la location est volontairement absent : son périmètre
// s'arrête au parc locatif, aux contrats et aux entretiens (voir
// RENTAL_MANAGER_ALLOWED_PREFIXES dans src/lib/role-service.ts).
const CATALOG_ROLES = [
  "PDG",
  "DG",
  "COMPTA",
  "STOCK_GARAGE",
  "DC",
  "COMMERCIAL",
  "COMPTA_GARAGE",
  "ADMIN",
] as const;

export default async function GeneralPartsCatalogPage() {
  const user = await requireUser([...CATALOG_ROLES]);

  const [parts, suppliers, orders] = await Promise.all([
    prisma.generalPart.findMany({
      where: { active: true },
      include: {
        references: { orderBy: { brand: "asc" } },
        compatibilities: { orderBy: [{ vehicleBrand: "asc" }, { vehicleModel: "asc" }] },
      },
      orderBy: [{ system: "asc" }, { name: "asc" }],
    }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, country: true } }),
    prisma.generalPartOrder.findMany({
      include: {
        supplier: { select: { name: true } },
        lines: { include: { generalPart: { select: { reference: true, name: true } } } },
      },
      orderBy: { orderedAt: "desc" },
      take: 50,
    }),
  ]);

  const catalogParts: GeneralPartView[] = parts.map((part) => ({
    id: part.id,
    reference: part.reference,
    partNumber: part.partNumber,
    referenceBrand: part.referenceBrand,
    oemReference: part.oemReference,
    name: part.name,
    system: part.system,
    subcategory: part.subcategory,
    family: part.family,
    position: part.position,
    characteristics: part.characteristics,
    manufacturer: part.manufacturer,
    description: part.description,
    unit: part.unit,
    confidence: part.confidence,
    status: part.status,
    sourceCode: part.sourceCode,
    sourceName: part.sourceName,
    sourceUrl: part.sourceUrl,
    references: part.references.map((reference) => ({
      id: reference.id,
      reference: reference.reference,
      brand: reference.brand,
      referenceType: reference.referenceType,
      isDirectFit: reference.isDirectFit,
      notes: reference.notes,
      sourceType: reference.sourceType,
      sourceRef: reference.sourceRef,
      verifiedAt: reference.verifiedAt?.toISOString() || null,
    })),
    compatibilities: part.compatibilities.map((compatibility) => ({
      id: compatibility.id,
      vehicleBrand: compatibility.vehicleBrand,
      vehicleModel: compatibility.vehicleModel,
      version: compatibility.version,
      years: compatibility.years,
      engine: compatibility.engine,
      position: compatibility.position,
      confidence: compatibility.confidence,
      sourceCode: compatibility.sourceCode,
    })),
  }));

  const catalogOrders: GeneralPartOrderView[] = orders.map((order) => ({
    id: order.id,
    number: order.number,
    supplierName: order.supplier?.name || "Fournisseur non précisé",
    status: order.status,
    orderedAt: order.orderedAt.toISOString(),
    expectedAt: order.expectedAt?.toISOString() || null,
    receivedAt: order.receivedAt?.toISOString() || null,
    totalXof: order.totalXof,
    notes: order.notes,
    lines: order.lines.map((line) => ({
      id: line.id,
      reference: line.generalPart.reference,
      name: line.generalPart.name,
      quantity: line.quantity,
      unitPriceXof: line.unitPriceXof,
    })),
  }));

  const catalogSuppliers: GeneralSupplierView[] = suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    country: supplier.country,
  }));

  return (
    <AppShell user={user} title="Catalogue général des pièces">
      <GeneralPartsCatalogView
        parts={catalogParts}
        suppliers={catalogSuppliers}
        orders={catalogOrders}
        canOrder
      />
    </AppShell>
  );
}
