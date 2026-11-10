import { AppShell } from "@/components/AppShell";
import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { resolveVehicleDisplayPhoto } from "@/lib/vehicle-display-photo";
import { VehiclesView, type VehicleItem } from "./VehiclesView";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ energy?: string; q?: string; vehicleType?: string; siteId?: string; brand?: string; zone?: string; status?: string; incomplete?: string; color?: string }>;
}) {
  const user = await requireUser([
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "COMMERCIAL",
    "HOTESSE",
    "CHEF_ATELIER",
    "ASSISTANTE_COMPTABLE",
    "STOCK",
    "COMPTA",
    "ADMIN",
    "ATELIER",
  ]);
  const params = await searchParams;
  const [rawVehicles, allVehicles, brands, suppliers, sites] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        fleetType: "SHOWROOM",
        ...(params.energy ? { energy: params.energy } : {}),
        ...(params.vehicleType ? { vehicleType: params.vehicleType } : {}),
        ...(params.siteId ? { siteId: params.siteId } : {}),
        ...(params.brand ? { brand: { contains: params.brand } } : {}),
        ...(params.zone ? { stockZone: params.zone } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.incomplete === "1" ? { isIncompleteSheet: true } : {}),
        ...(params.color
          ? {
              OR: [
                { exteriorColorBase: { contains: params.color } },
                { exteriorColorShade: { contains: params.color } },
                { color: { contains: params.color } },
              ],
            }
          : {}),
        ...(params.q
          ? {
              OR: [
                { brand: { contains: params.q } },
                { model: { contains: params.q } },
                { vin: { contains: params.q } },
              ],
            }
          : {}),
      },
      include: { site: true, supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.findMany({
      where: { fleetType: "SHOWROOM" },
      select: { stockZone: true, brand: true, model: true, energy: true, status: true, isIncompleteSheet: true, exteriorColorBase: true, exteriorColorShade: true, color: true },
    }),
    prisma.vehicleBrand.findMany({
      where: { active: true },
      include: { models: { where: { active: true }, orderBy: { name: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.site.findMany({ orderBy: { name: "asc" } }),
  ]);

  const catalog = brands.map((b) => ({
    id: b.id,
    name: b.name,
    models: b.models.map((m) => ({
      id: m.id,
      name: m.name,
      energy: m.energy,
      vehicleType: m.vehicleType,
    })),
  }));

  const canCreate = [
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "STOCK",
    "ADMIN",
  ].includes(user.role);

  const canDelete = [
    "DEVELOPER",
    "PDG",
    "SG",
    "DG",
    "DC",
    "ADMIN",
  ].includes(user.role);
  const canImport = ["DEVELOPER", "PDG"].includes(user.role);

  const countBy = <T extends string>(values: T[]) => {
    const map = new Map<string, number>();
    for (const value of values) {
      const key = value || "Non affecté";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  };
  const modelZoneMap = new Map<string, Record<string, number>>();
  for (const vehicle of allVehicles) {
    const zone = vehicle.stockZone || "Non affecté";
    const model = `${vehicle.brand} ${vehicle.model}`;
    const current = modelZoneMap.get(model) ?? {};
    current[zone] = (current[zone] ?? 0) + 1;
    modelZoneMap.set(model, current);
  }
  const zones = ["Showroom 1", "Showroom 2", "Arrivage", "Non affecté"];
  const stockSummary = {
    total: allVehicles.length,
    incomplete: allVehicles.filter((vehicle) => vehicle.isIncompleteSheet).length,
    byZone: countBy(allVehicles.map((vehicle) => vehicle.stockZone || "Non affecté")),
    byModel: countBy(allVehicles.map((vehicle) => `${vehicle.brand} ${vehicle.model}`)),
    byBrand: countBy(allVehicles.map((vehicle) => vehicle.brand)),
    byEnergy: countBy(allVehicles.map((vehicle) => vehicle.energy)),
    byColor: countBy(allVehicles.map((vehicle) => vehicle.exteriorColorShade || vehicle.exteriorColorBase || vehicle.color || "Non renseignée")),
    byStatus: countBy(allVehicles.map((vehicle) => vehicle.status)),
    modelZone: Array.from(modelZoneMap.entries())
      .map(([model, counts]) => ({ model, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total),
    zones,
  };

  const vehicles: VehicleItem[] = rawVehicles.map((v) => ({
    id: v.id,
    vin: v.vin,
    brand: v.brand,
    model: v.model,
    variant: v.variant,
    year: v.year,
    energy: v.energy,
    vehicleType: v.vehicleType,
    priceXof: v.priceXof,
    priceToConfirm: v.priceToConfirm,
    status: v.status,
    mileage: v.mileage,
    color: v.color,
    stockZone: v.stockZone,
    exteriorColorBase: v.exteriorColorBase,
    exteriorColorShade: v.exteriorColorShade,
    interiorColor: v.interiorColor,
    arrivalDate: v.arrivalDate ? v.arrivalDate.toISOString() : null,
    publishedOnSite: v.publishedOnSite,
    isIncompleteSheet: v.isIncompleteSheet,
    supplierId: v.supplierId,
    supplier: v.supplier ? { id: v.supplier.id, name: v.supplier.name } : null,
    siteId: v.siteId,
    site: v.site ? { id: v.site.id, name: v.site.name, code: v.site.code } : null,
    mainPhotoUrl: v.mainPhotoUrl,
    displayPhotoUrl: resolveVehicleDisplayPhoto(v),
    interiorPhotoUrl: v.interiorPhotoUrl,
    exteriorPhotoUrl: v.exteriorPhotoUrl,
    rearPhotoUrl: v.rearPhotoUrl,
    photosVerified: v.photosVerified,
    hasTechSheet: v.hasTechSheet,
    techSheetConfirmed: v.techSheetConfirmed,
    techSheetConfirmedAt: v.techSheetConfirmedAt ? v.techSheetConfirmedAt.toISOString() : null,
    shippingOriginPort: v.shippingOriginPort,
    etaDate: v.etaDate ? v.etaDate.toISOString() : null,
    containerNumber: v.containerNumber,
    orderReference: v.orderReference,
    productionWeek: v.productionWeek,
  }));

  return (
    <AppShell user={user} titleKey="vehicles">
      {canImport && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <Link href="/vehicles/import" className="ox-btn ox-btn-ghost" style={{ textDecoration: "none" }}>
            Importer le stock Excel
          </Link>
        </div>
      )}
      <VehiclesView
        vehicles={vehicles}
        catalog={catalog}
        suppliers={suppliers}
        sites={sites}
        canCreate={canCreate}
        canDelete={canDelete}
        initialParams={params}
        stockSummary={stockSummary}
      />
    </AppShell>
  );
}
