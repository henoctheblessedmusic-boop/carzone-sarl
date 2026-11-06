/**
 * Backfill : garantit qu'une commande d'import possède toujours son véhicule de stock.
 * À lancer une fois après déploiement du flux import → stock.
 *
 * Commande :
 *   npx tsx scripts/backfill-import-vehicles.ts
 */
import { PrismaClient } from "@prisma/client";
import { syncImportOrderVehicle } from "../src/lib/import-orders";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.importOrder.findMany({ select: { id: true, reference: true } });
  let created = 0;
  let synced = 0;
  for (const order of orders) {
    const result = await syncImportOrderVehicle(order.id);
    if (result?.created) created += 1;
    else if (result) synced += 1;
  }
  console.log(JSON.stringify({ orders: orders.length, vehiclesCreated: created, vehiclesSynced: synced }));
}

main()
  .catch((error) => {
    console.error("BACKFILL IMPORT VEHICLES FAILED", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
