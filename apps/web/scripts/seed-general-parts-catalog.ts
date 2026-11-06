/**
 * Initialise le catalogue général à partir des références déjà présentes dans le
 * module pièces. Le catalogue général reste indépendant du stock : aucune quantité
 * de stock n'est copiée.
 *
 * Commande :
 *   npx tsx scripts/seed-general-parts-catalog.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sourceParts = await prisma.partItem.findMany({
    include: { crossReferences: true, compatibilities: true },
  });

  let created = 0;
  for (const source of sourceParts) {
    const existing = await prisma.generalPart.findUnique({ where: { reference: source.partNumber } });
    if (existing) continue;

    await prisma.generalPart.create({
      data: {
        reference: source.partNumber,
        oemReference: source.oemNumber,
        name: source.name,
        system: source.system || source.category,
        subcategory: source.subcategory,
        manufacturer: source.manufacturer,
        description: source.description,
        unit: source.unit,
        references: {
          create: source.crossReferences.map((reference) => ({
            reference: reference.crossReference,
            brand: reference.brand,
            referenceType: reference.referenceType || "EQUIVALENT",
            isDirectFit: reference.isDirectFit,
            notes: reference.notes,
          })),
        },
        compatibilities: {
          create: source.compatibilities.map((compatibility) => ({
            vehicleBrand: compatibility.vehicleBrand,
            vehicleModel: compatibility.vehicleModel,
            years: compatibility.years,
            engine: compatibility.engine,
            position: compatibility.position,
            notes: compatibility.notes,
          })),
        },
      },
    });
    created += 1;
  }

  const total = await prisma.generalPart.count();
  console.log(JSON.stringify({ sourceParts: sourceParts.length, created, total }));
}

main()
  .catch((error) => {
    console.error("SEED GENERAL PARTS FAILED", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
