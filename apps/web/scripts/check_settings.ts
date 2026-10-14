import { prisma } from "../src/lib/prisma";

async function main() {
  const settings = await prisma.systemSetting.findMany();
  console.log("ALL SETTINGS IN DB:", settings);
}

main().catch(console.error).finally(() => prisma.$disconnect());
