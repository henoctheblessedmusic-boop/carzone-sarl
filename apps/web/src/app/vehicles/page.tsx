import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { VehiclesView, type VehicleItem } from "./VehiclesView";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ energy?: string; q?: string; vehicleType?: string; siteId?: string }>;
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
  ]);
  const params = await searchParams;
  const [rawVehicles, brands, suppliers, sites] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        ...(params.energy ? { energy: params.energy } : {}),
        ...(params.vehicleType ? { vehicleType: params.vehicleType } : {}),
        ...(params.siteId ? { siteId: params.siteId } : {}),
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
    "PDG",
    "SG",
    "DG",
    "DC",
    "ADMIN",
  ].includes(user.role);

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
    status: v.status,
    mileage: v.mileage,
    color: v.color,
    supplierId: v.supplierId,
    supplier: v.supplier ? { id: v.supplier.id, name: v.supplier.name } : null,
    siteId: v.siteId,
    site: v.site ? { id: v.site.id, name: v.site.name, code: v.site.code } : null,
    mainPhotoUrl: v.mainPhotoUrl,
    hasTechSheet: v.hasTechSheet,
  }));

  return (
    <AppShell user={user} titleKey="vehicles">
      <VehiclesView
        vehicles={vehicles}
        catalog={catalog}
        suppliers={suppliers}
        sites={sites}
        canCreate={canCreate}
        canDelete={canDelete}
        initialParams={params}
      />
    </AppShell>
  );
}
