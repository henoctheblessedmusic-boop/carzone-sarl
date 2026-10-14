const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const v = await prisma.vehicle.findFirst({ where: { brand: 'BAIC', model: { contains: 'X55' } } });
  console.log('ID:', v.id);
  const sheet = JSON.parse(v.technicalSheetJson);
  console.log('Sheet Title:', sheet.title);
  console.log('Sheet Variant:', sheet.variant);
  console.log('Photos:', {
    main: sheet.mainPhotoUrl,
    interior: sheet.interiorPhotoUrl,
    seats: sheet.interiorSeatsPhotoUrl,
    exterior: sheet.exteriorPhotoUrl,
    rear: sheet.rearPhotoUrl
  });
}
run().finally(() => prisma.$disconnect());
