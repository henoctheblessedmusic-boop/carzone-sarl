/**
 * Aligne les contrats existants sur le calcul par jours :
 * tarif journalier du véhicule, nombre de jours, total et jeton de partage.
 *
 * Commande :
 *   npx tsx scripts/backfill-rental-contracts.ts
 */
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { computeRentalTotal, rentalDaysBetween } from "../src/lib/rental-contract";

const prisma = new PrismaClient();

async function main() {
  const rentals = await prisma.rental.findMany({
    include: {
      vehicle: {
        select: {
          rentalDailyXof: true,
          rentalMonthlyXof: true,
        },
      },
    },
  });

  let updated = 0;
  for (const rental of rentals) {
    const end = rental.returnedAt || rental.endDate;
    const days = rental.days || rentalDaysBetween(rental.startDate, end);
    const dailyXof =
      rental.dailyXof ||
      rental.vehicle.rentalDailyXof ||
      (rental.monthlyXof ? Math.round(rental.monthlyXof / 30) : null);
    const totalXof =
      rental.totalXof ||
      computeRentalTotal({ dailyXof, monthlyXof: rental.monthlyXof, days });

    await prisma.rental.update({
      where: { id: rental.id },
      data: {
        days: days || null,
        dailyXof,
        totalXof,
        contractToken: rental.contractToken || randomUUID(),
      },
    });
    updated += 1;
  }

  console.log(JSON.stringify({ rentals: rentals.length, updated }));
}

main()
  .catch((error) => {
    console.error("BACKFILL RENTAL CONTRACTS FAILED", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
