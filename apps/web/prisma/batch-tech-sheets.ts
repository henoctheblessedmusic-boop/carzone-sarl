import { prisma } from "../src/lib/prisma";
import { generateAllVehiclesTechSheets } from "../src/lib/tech-sheet-generator";

async function main() {
  console.log("Starting batch tech sheets generation...");
  const res = await generateAllVehiclesTechSheets();
  console.log("Done! Processed vehicles:", res.totalProcessed);
  
  const sample = await prisma.vehicle.findFirst({
    where: { hasTechSheet: true },
    select: { id: true, brand: true, model: true, technicalSheetJson: true }
  });
  console.log("Sample vehicle tech sheet:", sample?.brand, sample?.model);
  console.log(sample?.technicalSheetJson?.slice(0, 300));
}

main().catch(console.error).finally(() => prisma.$disconnect());
