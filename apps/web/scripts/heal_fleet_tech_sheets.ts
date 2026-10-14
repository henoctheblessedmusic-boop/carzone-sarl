import { prisma } from "../src/lib/prisma";
import { buildStandardTechnicalSheet } from "../src/lib/tech-sheet-generator";

async function healFleet() {
  console.log("🚀 Démarrage de la mise à jour complète de la flotte Carzone SARL...");

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`📋 Total de véhicules trouvés en BDD : ${vehicles.length}`);

  let updatedCount = 0;

  for (const v of vehicles) {
    // Reconstruire la fiche technique officielle avec le catalogue certifié
    const sheet = buildStandardTechnicalSheet(v);

    await prisma.vehicle.update({
      where: { id: v.id },
      data: {
        technicalSheetJson: JSON.stringify(sheet),
        hasTechSheet: true,
        mainPhotoUrl: sheet.mainPhotoUrl,
        interiorPhotoUrl: sheet.interiorPhotoUrl,
        exteriorPhotoUrl: sheet.exteriorPhotoUrl,
        rearPhotoUrl: sheet.rearPhotoUrl,
      },
    });

    console.log(`✅ [${v.brand} - ${v.model}]`);
    console.log(`   Titre : ${sheet.title}`);
    console.log(`   Photo Principale : ${sheet.mainPhotoUrl}`);
    console.log(`   Photo Intérieur  : ${sheet.interiorPhotoUrl}`);
    console.log("-----------------------------------------------------------------");
    updatedCount++;
  }

  console.log(`\n🎉 Succès : ${updatedCount} fiches techniques mises à jour avec leurs vraies photos constructeurs !`);

  // Vérification finale anti-Corolla Cross
  const remainingBad = await prisma.vehicle.findMany({
    where: {
      OR: [
        { mainPhotoUrl: { contains: "Corolla_Cross" } },
        { technicalSheetJson: { contains: "Corolla_Cross" } },
      ],
    },
  });

  if (remainingBad.length === 0) {
    console.log("🛡️ VÉRIFICATION STRICTE : 0 anomalie Corolla Cross en base de données. Flotte 100% saine !");
  } else {
    console.error(`⚠️ Attention : ${remainingBad.length} véhicules ont encore des traces Corolla Cross.`);
  }
}

healFleet()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
