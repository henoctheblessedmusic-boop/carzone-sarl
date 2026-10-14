const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const vehicles = await prisma.vehicle.findMany({
    where: { model: { contains: 'CS75' } }
  });
  console.log(`Found ${vehicles.length} CS75 vehicles`);
  for (const v of vehicles) {
    console.log('ID:', v.id, 'Brand:', v.brand, 'Model:', v.model, 'Variant:', v.variant);
    try {
      const sheet = JSON.parse(v.technicalSheetJson);
      console.log('Sheet title:', sheet.title);
      console.log('Sheet variant:', sheet.variant);
      console.log('Interior Photo:', sheet.interiorPhotoUrl);
      console.log('Seats Photo:', sheet.interiorSeatsPhotoUrl);
      console.log('Exterior Photo:', sheet.exteriorPhotoUrl);
      console.log('Rear Photo:', sheet.rearPhotoUrl);
    } catch (e) {
      console.log('Error parsing sheet');
    }
  }

  // Also check Quotes lines
  const quoteLines = await prisma.quoteLine.findMany({
    where: {
      vehicle: {
        model: { contains: 'CS75' }
      }
    },
    include: { quote: true, vehicle: true }
  });
  console.log(`Found ${quoteLines.length} quote lines with CS75`);
  for (const ql of quoteLines) {
    console.log(`Quote ${ql.quote.number} (id: ${ql.quote.id}) has vehicle ${ql.vehicle.model}`);
  }
}
run().finally(() => prisma.$disconnect());
