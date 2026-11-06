import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import {
  GeneralPartsCatalogView,
  type GeneralPartView,
  type GeneralPartOrderView,
  type GeneralSupplierView,
} from "./GeneralPartsCatalogView";
import { importGeneralPartsCatalog } from "./actions";

const CATALOG_ROLES = [
  "PDG",
  "DG",
  "COMPTA",
  "STOCK_GARAGE",
  "GESTIONNAIRE_LOCATION",
  "DC",
  "COMMERCIAL",
  "COMPTA_GARAGE",
  "ADMIN",
] as const;

export default async function GeneralPartsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; skipped?: string }>;
}) {
  const user = await requireUser([...CATALOG_ROLES]);
  const params = await searchParams;

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
    oemReference: part.oemReference,
    name: part.name,
    system: part.system,
    subcategory: part.subcategory,
    manufacturer: part.manufacturer,
    description: part.description,
    unit: part.unit,
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
      years: compatibility.years,
      engine: compatibility.engine,
      position: compatibility.position,
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
      <div style={{ display: "grid", gap: "1rem" }}>
        <form
          action={importGeneralPartsCatalog}
          encType="multipart/form-data"
          className="ox-glass"
          style={{ padding: "0.9rem 1.1rem", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
        >
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Importer un catalogue OEM constructeur</div>
            <div style={{ opacity: 0.65, fontSize: "0.76rem" }}>
              Fichier JSON, CSV ou Excel. Le catalogue général reste séparé du stock.
            </div>
          </div>
          <input type="file" name="file" accept=".json,.csv,.xlsx,.xls" required className="ox-input" style={{ padding: 7 }} />
          <button type="submit" className="ox-btn ox-btn-primary ox-btn-sm">Importer</button>
          <a href="/templates/catalogue-pieces-modele.csv" className="ox-btn ox-btn-ghost ox-btn-sm" download>Télécharger le modèle CSV</a>
        </form>
        {(params.imported || params.skipped) && (
          <div className="ox-glass" style={{ padding: "0.7rem 1rem", fontSize: "0.84rem", color: "#4ade80" }}>
            Import terminé : {params.imported || 0} référence(s) importée(s), {params.skipped || 0} ligne(s) ignorée(s).
          </div>
        )}
        <GeneralPartsCatalogView
          parts={catalogParts}
          suppliers={catalogSuppliers}
          orders={catalogOrders}
          canOrder
        />
      </div>
    </AppShell>
  );
}
