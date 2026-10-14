import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const list = await prisma.vehicle.findMany({
    select: {
      id: true,
      brand: true,
      model: true,
      variant: true,
      color: true,
      mainPhotoUrl: true,
      interiorPhotoUrl: true,
      exteriorPhotoUrl: true,
      rearPhotoUrl: true,
    },
    orderBy: { createdAt: "asc" }
  });
  console.log("DB Vehicles count:", list.length);
  for (const v of list) {
    console.log(`[${v.id}] ${v.brand} ${v.model} (${v.variant || "standard"}) | color: ${v.color}`);
    console.log(`   Main:     ${v.mainPhotoUrl}`);
    console.log(`   Interior: ${v.interiorPhotoUrl}`);
    console.log(`   Exterior: ${v.exteriorPhotoUrl}`);
    console.log(`   Rear:     ${v.rearPhotoUrl}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
