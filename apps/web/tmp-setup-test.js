const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const direction = await p.user.findUniqueOrThrow({ where: { email: "direction@topcarzone.com" } });

  const commercial = await p.user.upsert({
    where: { email: "test-dashboard@carzone.bj" },
    update: { role: "COMMERCIAL", active: true, passwordHash: direction.passwordHash, siteId: direction.siteId, customPermissions: [] },
    create: {
      email: "test-dashboard@carzone.bj",
      fullName: "Test Commercial",
      role: "COMMERCIAL",
      active: true,
      passwordHash: direction.passwordHash,
      siteId: direction.siteId,
      customPermissions: [],
    },
  });

  const dev = await p.user.upsert({
    where: { email: "test-dev@carzone.bj" },
    update: { role: "DEVELOPER", active: true, passwordHash: direction.passwordHash, siteId: direction.siteId, customPermissions: [] },
    create: {
      email: "test-dev@carzone.bj",
      fullName: "Test Developpeur",
      role: "DEVELOPER",
      active: true,
      passwordHash: direction.passwordHash,
      siteId: direction.siteId,
      customPermissions: [],
    },
  });

  const existing = await p.vehicle.findFirst({ where: { brand: "TEST-DEMO" } });
  const vehicle =
    existing ||
    (await p.vehicle.create({
      data: {
        brand: "TEST-DEMO",
        model: "Vehicule Demonstration",
        variant: "Suppression",
        year: 2026,
        energy: "ELECTRIQUE",
        priceXof: 1000,
        status: "EN_STOCK",
        siteId: direction.siteId,
      },
    }));

  console.log(JSON.stringify({ commercialId: commercial.id, devId: dev.id, vehicleId: vehicle.id }));
  await p.$disconnect();
})().catch(async (e) => {
  console.error("ERR", e.message);
  await p.$disconnect();
  process.exit(1);
});
