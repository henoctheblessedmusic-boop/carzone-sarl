import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    include: { quoteLines: true, opportunities: true, workshopEntries: true, rentals: true, workOrders: true, fleetLinks: true }
  });
  console.log(`TOTAL VEHICLES: ${vehicles.length}`);
  for (const v of vehicles) {
    console.log(`[${v.id}] ${v.brand} ${v.model} (var: ${v.variant || 'N/A'}) - Prix: ${v.priceXof} - Status: ${v.status} | Quotes: ${v.quoteLines.length} | Opps: ${v.opportunities.length} | Workshop: ${v.workshopEntries.length}`);
  }
}

main().finally(() => prisma.$disconnect());
