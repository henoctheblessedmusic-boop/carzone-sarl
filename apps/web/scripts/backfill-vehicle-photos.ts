/**
 * Complète les photos manquantes des véhicules à partir d'un véhicule du même modèle
 * déjà illustré. Utile pour les anciens véhicules de location créés sans photo.
 *
 * Commande :
 *   npx tsx scripts/backfill-vehicle-photos.ts
 */
import { PrismaClient } from "@prisma/client";
import { inheritVehiclePhotos } from "../src/lib/vehicle-photos";

const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: [
        { mainPhotoUrl: null },
        { interiorPhotoUrl: null },
        { exteriorPhotoUrl: null },
        { rearPhotoUrl: null },
      ],
    },
    select: { id: true, brand: true, model: true },
  });

  let withPhoto = 0;
  let stillWithoutPhoto = 0;
  for (const vehicle of vehicles) {
    const photos = await inheritVehiclePhotos(vehicle.id);
    if (photos?.mainPhotoUrl) withPhoto += 1;
    else stillWithoutPhoto += 1;
  }

  console.log(JSON.stringify({ checked: vehicles.length, withPhoto, stillWithoutPhoto }));
}

main()
  .catch((error) => {
    console.error("BACKFILL VEHICLE PHOTOS FAILED", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
