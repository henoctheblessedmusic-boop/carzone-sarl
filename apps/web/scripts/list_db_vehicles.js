const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, brand: true, model: true, color: true, mainPhotoUrl: true }
  });
  console.log('Total vehicles in DB:', vehicles.length);
  vehicles.forEach(v => console.log(`${v.brand} | ${v.model} | ${v.color} | ${v.mainPhotoUrl}`));
}
run().finally(() => prisma.$disconnect());
