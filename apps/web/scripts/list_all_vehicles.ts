import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const list = await prisma.vehicle.findMany({
    select: {
      id: true,
      brand: true,
      model: true,
      variant: true,
      year: true,
      color: true,
      vin: true,
      mainPhotoUrl: true,
      interiorPhotoUrl: true,
      exteriorPhotoUrl: true,
      rearPhotoUrl: true,
      technicalSheetJson: true
    },
    orderBy: [{ brand: 'asc' }, { model: 'asc' }]
  });
  console.log('TOTAL VEHICLES:', list.length);
  for (const v of list) {
    const ft = v.technicalSheetJson as any;
    console.log(
      JSON.stringify({
        id: v.id,
        brand: v.brand,
        model: v.model,
        variant: v.variant,
        year: v.year,
        color: v.color,
        vin: v.vin,
        mainPhoto: v.mainPhotoUrl?.slice(0, 60),
        interior: v.interiorPhotoUrl?.slice(0, 60),
        exterior: v.exteriorPhotoUrl?.slice(0, 60),
        rear: v.rearPhotoUrl?.slice(0, 60),
      })
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
