import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== NETTOYAGE DU STOCK CONCESSION (SÉPARATION ATELIER / STOCK) ===");

  // 1. Trouver tous les véhicules qui sont en réalité des véhicules clients d'atelier
  // Critères : priceXof === 0 ou variant correspondant à une plaque d'immatriculation (ex: '.. .. RB')
  const vehicles = await prisma.vehicle.findMany({
    include: {
      workshopEntries: true,
      quoteLines: true,
      opportunities: true,
      rentals: true,
      workOrders: true,
    },
  });

  const clientRepairVehicles = vehicles.filter((v) => {
    const isPlate = v.variant && /\b[A-Z]{2}\s*\d{4}\s*RB\b/i.test(v.variant);
    const isZeroPrice = v.priceXof === 0;
    const hasNoQuotes = v.quoteLines.length === 0 && v.opportunities.length === 0;
    return (isPlate || isZeroPrice) && hasNoQuotes;
  });

  console.log(`Trouvé ${clientRepairVehicles.length} véhicules clients de réparation dans le stock.`);

  for (const v of clientRepairVehicles) {
    console.log(`- Dissociation & retrait : [${v.id}] ${v.brand} ${v.model} (Immat: ${v.variant || 'N/A'})`);

    // Détacher des entrées atelier pour préserver l'historique complet
    await prisma.workshopEntry.updateMany({
      where: { vehicleId: v.id },
      data: { vehicleId: null },
    });

    // Supprimer le faux véhicule du stock concession
    await prisma.vehicle.delete({
      where: { id: v.id },
    });
  }

  const remainingStock = await prisma.vehicle.findMany({
    select: { id: true, brand: true, model: true, variant: true, year: true, priceXof: true, status: true },
  });

  console.log("\n=== VRAI STOCK CONCESSIONNAIRE RESTANT ===");
  console.log(`Total véhicules neufs / stock de vente : ${remainingStock.length}`);
  for (const s of remainingStock) {
    console.log(`  * ${s.brand} ${s.model} ${s.variant || ''} - ${s.priceXof.toLocaleString('fr-FR')} XOF (${s.status})`);
  }

  const workshopCount = await prisma.workshopEntry.count();
  console.log(`\nTotal dossiers d'interventions atelier préservés : ${workshopCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
