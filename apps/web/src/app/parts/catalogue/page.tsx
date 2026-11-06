import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { PartsCatalogView, type CatalogPart, type CatalogOrder, type CatalogSupplier } from "./PartsCatalogView";

const CATALOG_ROLES = [
  "PDG",
  "SG",
  "DG",
  "ADV",
  "RF",
  "RTA",
  "DC",
  "COMMERCIAL",
  "CHEF_ATELIER",
  "ATELIER",
  "STOCK_GARAGE",
  "COMPTA",
  "COMPTA_GARAGE",
  "ADMIN",
] as const;

export default async function PartsCatalogPage() {
  const user = await requireUser([...CATALOG_ROLES]);

  const [rawParts, suppliers, rawOrders, brands] = await Promise.all([
    prisma.partItem.findMany({
      where: { active: true },
      include: {
        crossReferences: { orderBy: { brand: "asc" } },
        compatibilities: { orderBy: [{ vehicleBrand: "asc" }, { vehicleModel: "asc" }] },
        supplierOffers: {
          where: { active: true },
          include: { supplier: { select: { id: true, name: true } } },
          orderBy: { purchasePriceXof: "asc" },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.partOrder.findMany({
      include: {
        supplier: { select: { name: true } },
        lines: { include: { partItem: { select: { partNumber: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.vehicleBrand.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { name: true } }),
  ]);

  const parts: CatalogPart[] = rawParts.map((part) => ({
    id: part.id,
    partNumber: part.partNumber,
    oemNumber: part.oemNumber,
    name: part.name,
    category: part.category,
    system: part.system,
    subcategory: part.subcategory,
    manufacturer: part.manufacturer,
    description: part.description,
    unit: part.unit,
    location: part.location,
    stockQuantity: part.stockQuantity,
    minStockAlert: part.minStockAlert,
    purchasePriceXof: part.purchasePriceXof,
    sellingPriceXof: part.sellingPriceXof,
    crossReferences: part.crossReferences.map((reference) => ({
      id: reference.id,
      crossReference: reference.crossReference,
      brand: reference.brand,
      referenceType: reference.referenceType,
      isDirectFit: reference.isDirectFit,
      notes: reference.notes,
    })),
    compatibilities: part.compatibilities.map((compatibility) => ({
      id: compatibility.id,
      vehicleBrand: compatibility.vehicleBrand,
      vehicleModel: compatibility.vehicleModel,
      years: compatibility.years,
      engine: compatibility.engine,
      position: compatibility.position,
      notes: compatibility.notes,
    })),
    supplierOffers: part.supplierOffers.map((offer) => ({
      id: offer.id,
      supplierId: offer.supplierId,
      supplierName: offer.supplier.name,
      supplierReference: offer.supplierReference,
      purchasePriceXof: offer.purchasePriceXof,
      leadTimeDays: offer.leadTimeDays,
      minOrderQty: offer.minOrderQty,
    })),
  }));

  const orders: CatalogOrder[] = rawOrders.map((order) => ({
    id: order.id,
    number: order.number,
    supplierName: order.supplier.name,
    status: order.status,
    totalXof: order.totalXof,
    createdAt: order.createdAt.toISOString(),
    lines: order.lines.map((line) => ({
      id: line.id,
      partNumber: line.partItem.partNumber,
      name: line.partItem.name,
      quantity: line.quantity,
      unitPriceXof: line.unitPriceXof,
      totalXof: line.totalXof,
    })),
  }));

  const catalogSuppliers: CatalogSupplier[] = suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    type: supplier.type,
    country: supplier.country,
  }));
  const brandOptions = Array.from(
    new Set([
      ...brands.map((brand) => brand.name.toUpperCase()),
      ...parts.flatMap((part) => part.compatibilities.map((compatibility) => compatibility.vehicleBrand.toUpperCase())),
    ])
  ).sort();

  return (
    <AppShell user={user} title="Catalogue croisé de pièces">
      <PartsCatalogView
        parts={parts}
        suppliers={catalogSuppliers}
        orders={orders}
        brandOptions={brandOptions}
        canOrder={["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "COMMERCIAL", "CHEF_ATELIER", "STOCK_GARAGE", "COMPTA", "COMPTA_GARAGE", "ADMIN"].includes(user.role)}
      />
    </AppShell>
  );
}
