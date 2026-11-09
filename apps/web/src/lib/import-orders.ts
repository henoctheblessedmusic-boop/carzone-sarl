import { prisma } from "@/lib/prisma";
import { inheritVehiclePhotos } from "@/lib/vehicle-photos";

/** Correspondance entre le statut logistique d'un import et le statut du véhicule en stock. */
export const IMPORT_TO_VEHICLE_STATUS: Record<string, string> = {
  COMMANDE: "COMMANDE",
  EN_TRANSIT: "EN_TRANSIT",
  DOUANE: "AU_PORT",
  ARRIVE: "EN_MAGASIN",
  ANNULE: "ANNULE",
};

export function importToVehicleStatus(status: string): string {
  return IMPORT_TO_VEHICLE_STATUS[status] || "COMMANDE";
}

/**
 * Garantit qu'une commande d'import possède un véhicule suivi dans le stock showroom.
 * - À la création de la commande : crée le véhicule avec le statut COMMANDE.
 * - À chaque changement de statut : met à jour tous les véhicules liés.
 * - Pour les anciennes commandes sans véhicule : crée le véhicule manquant.
 *
 * Cette fonction est idempotente : elle ne crée jamais de doublon pour une commande.
 */
export async function syncImportOrderVehicle(orderId: string) {
  const order = await prisma.importOrder.findUnique({
    where: { id: orderId },
    include: {
      vehicles: { select: { id: true } },
      supplier: { select: { id: true } },
    },
  });
  if (!order) return null;

  const status = importToVehicleStatus(order.status);

  if (order.vehicles.length > 0) {
    await prisma.vehicle.updateMany({
      where: { importOrderId: order.id },
      data: {
        status,
        etaDate: order.etaDate,
        shippingOriginPort: order.originPort,
        ...(order.supplierId ? { supplierId: order.supplierId } : {}),
      },
    });
    return { created: false, vehicleIds: order.vehicles.map((vehicle) => vehicle.id), status };
  }

  const brand = order.expectedBrand?.trim() || "Marque à préciser";
  const model = order.expectedModel?.trim() || "Modèle à préciser";

  const catalogModel = await prisma.vehicleModel.findFirst({
    where: {
      name: { equals: model, mode: "insensitive" },
      brand: { name: { equals: brand, mode: "insensitive" } },
    },
    select: { energy: true, vehicleType: true },
  });

  const quantity = Math.min(50, Math.max(1, Math.floor(order.quantity || 1)));
  const vehicleIds: string[] = [];

  for (let index = 0; index < quantity; index += 1) {
    const vehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        energy: catalogModel?.energy || "ESSENCE",
        vehicleType: catalogModel?.vehicleType || null,
        priceXof: order.costXof || 0,
        costXof: order.costXof || 0,
        status,
        fleetType: "SHOWROOM",
        supplierId: order.supplierId,
        shippingOriginPort: order.originPort,
        etaDate: order.etaDate,
        orderReference: order.reference,
        importOrderId: order.id,
        description: order.notes || null,
      },
      select: { id: true },
    });

    vehicleIds.push(vehicle.id);

    await inheritVehiclePhotos(vehicle.id).catch((error) => {
      console.error("Photos du véhicule import non héritées:", error);
    });
  }

  return { created: true, vehicleIds, status };
}
