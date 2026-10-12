import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const Role = {
  DG: "DG",
  ADMIN: "ADMIN",
  COMPTA: "COMPTA",
  COMMERCIAL: "COMMERCIAL",
  STOCK: "STOCK",
  ATELIER: "ATELIER",
  BORNES_OPS: "BORNES_OPS",
  INSTALLATEUR: "INSTALLATEUR",
} as const;

const prisma = new PrismaClient();

async function main() {
  await prisma.chargingInvoice.deleteMany();
  await prisma.chargingSession.deleteMany();
  await prisma.chargingSubscription.deleteMany();
  await prisma.chargingPlan.deleteMany();
  await prisma.chargingStation.deleteMany();
  await prisma.installerQuote.deleteMany();
  await prisma.chargeInstallRequest.deleteMany();
  await prisma.installer.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteLine.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.testDrive.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.fleetVehicle.deleteMany();
  await prisma.fleetAccount.deleteMany();
  await prisma.task.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.vehicleModel.deleteMany();
  await prisma.vehicleBrand.deleteMany();
  await prisma.importOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.site.deleteMany();

  type CatalogModel = { name: string; vehicleType: string; energy?: string };
  const catalog: { name: string; models: CatalogModel[] }[] = [
    {
      name: "DONGFENG",
      models: [
        { name: "MAGE", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "SHINE", vehicleType: "BERLINE", energy: "ESSENCE" },
        { name: "RICH 7", vehicleType: "PICKUP", energy: "DIESEL" },
        { name: "NAMMI", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "BOX", vehicleType: "VAN", energy: "ELECTRIQUE" },
        { name: "AX7", vehicleType: "SUV", energy: "ESSENCE" },
      ],
    },
    {
      name: "BAIC",
      models: [
        { name: "X55", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "BJ40", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "EU5", vehicleType: "BERLINE", energy: "ELECTRIQUE" },
        { name: "BJ60", vehicleType: "SUV", energy: "ESSENCE" },
      ],
    },
    {
      name: "GEELY",
      models: [
        { name: "MONJARO", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "STARRAY", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "COOLRAY", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "GEOMETRY C", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "EMGRAND", vehicleType: "BERLINE", energy: "ESSENCE" },
      ],
    },
    {
      name: "HONDA",
      models: [
        { name: "CR-V", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "HR-V", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "CIVIC", vehicleType: "BERLINE", energy: "ESSENCE" },
        { name: "ACCORD", vehicleType: "BERLINE", energy: "HYBRIDE" },
      ],
    },
    {
      name: "JEEP",
      models: [
        { name: "WRANGLER", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "GRAND CHEROKEE", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "COMPASS", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "RENEGADE", vehicleType: "SUV", energy: "ESSENCE" },
      ],
    },
    {
      name: "LEXUS",
      models: [
        { name: "NX", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "RX", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "ES", vehicleType: "BERLINE", energy: "HYBRIDE" },
        { name: "UX", vehicleType: "SUV", energy: "HYBRIDE" },
      ],
    },
    {
      name: "LYNK & CO",
      models: [
        { name: "01", vehicleType: "SUV", energy: "PHEV" },
        { name: "08", vehicleType: "SUV", energy: "PHEV" },
        { name: "09", vehicleType: "SUV", energy: "PHEV" },
        { name: "02", vehicleType: "SUV", energy: "PHEV" },
      ],
    },
    {
      name: "MERCEDES-BENZ",
      models: [
        { name: "EQA", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "EQB", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "GLC", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "CLASSE C", vehicleType: "BERLINE", energy: "ESSENCE" },
        { name: "CLASSE V", vehicleType: "VAN", energy: "DIESEL" },
      ],
    },
    {
      name: "MITSUBISHI",
      models: [
        { name: "L200", vehicleType: "PICKUP", energy: "DIESEL" },
        { name: "PAJERO SPORT", vehicleType: "SUV", energy: "DIESEL" },
        { name: "OUTLANDER PHEV", vehicleType: "SUV", energy: "PHEV" },
        { name: "ASX", vehicleType: "SUV", energy: "ESSENCE" },
      ],
    },
    {
      name: "NISSAN",
      models: [
        { name: "PATROL", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "X-TRAIL", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "NAVARA", vehicleType: "PICKUP", energy: "DIESEL" },
        { name: "QASHQAI", vehicleType: "SUV", energy: "ESSENCE" },
      ],
    },
    {
      name: "TOYOTA",
      models: [
        { name: "HILUX", vehicleType: "PICKUP", energy: "DIESEL" },
        { name: "FORTUNER", vehicleType: "SUV", energy: "DIESEL" },
        { name: "LAND CRUISER 300", vehicleType: "SUV", energy: "DIESEL" },
        { name: "COROLLA CROSS", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "RAV4", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "HIACE", vehicleType: "VAN", energy: "DIESEL" },
      ],
    },
    {
      name: "VOYAH",
      models: [
        { name: "DREAM", vehicleType: "VAN", energy: "ELECTRIQUE" },
        { name: "FREE", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "PASSION", vehicleType: "BERLINE", energy: "ELECTRIQUE" },
      ],
    },
    {
      name: "BYD",
      models: [
        { name: "SONG PLUS", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "ATTO 3", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "HAN", vehicleType: "BERLINE", energy: "ELECTRIQUE" },
        { name: "SEAL", vehicleType: "BERLINE", energy: "ELECTRIQUE" },
        { name: "DOLPHIN", vehicleType: "BERLINE", energy: "ELECTRIQUE" },
      ],
    },
  ];

  for (let i = 0; i < catalog.length; i++) {
    const b = catalog[i];
    await prisma.vehicleBrand.create({
      data: {
        name: b.name,
        sortOrder: i,
        models: {
          create: b.models.map((m) => ({
            name: m.name,
            vehicleType: m.vehicleType,
            energy: m.energy ?? null,
          })),
        },
      },
    });
  }

  const supplierAnvers = await prisma.supplier.create({
    data: {
      name: "Import Anvers",
      country: "Belgique",
      city: "Anvers",
      type: "IMPORT_PORT",
      contact: "Showroom Logistique CARZONE SARL (+229 01 92 61 61 61)",
      notes: "Port d'embarquement Europe — conteneurs véhicules",
    },
  });
  const supplierDubai = await prisma.supplier.create({
    data: {
      name: "Import Dubaï",
      country: "Émirats arabes unis",
      city: "Dubaï",
      type: "IMPORT_PORT",
      contact: "Desk Moyen-Orient",
      notes: "Hub GCC — SUV & pick-up",
    },
  });
  await prisma.supplier.create({
    data: {
      name: "Import Livourne",
      country: "Italie",
      city: "Livourne",
      type: "IMPORT_PORT",
      contact: "Desk Méditerranée",
      notes: "Port italien — véhicules Europe / Méditerranée",
    },
  });
  await prisma.supplier.create({
    data: {
      name: "Fournisseur générique",
      country: "Bénin",
      city: "Cotonou",
      type: "OTHER",
      contact: "Direction des Achats CARZONE SARL",
      notes: "Placeholder — remplacer par un dealer réel",
    },
  });
  await prisma.supplier.create({
    data: {
      name: "Dealer local Cotonou",
      country: "Bénin",
      city: "Cotonou",
      type: "DEALER",
      phone: "+2290100000000",
      notes: "Approvisionnement showroom / reprise",
    },
  });

  console.log(`Catalogue: ${catalog.length} marques, ${catalog.reduce((n, b) => n + b.models.length, 0)} modèles`);

  const akpakpa = await prisma.site.create({
    data: {
      name: "Showroom Saint-Michel (Immeuble CBDH)",
      code: "AKPAKPA",
      address: "Rte de Porto-Novo, 150m Sobebra",
      city: "Cotonou",
    },
  });
  const etoileRouge = await prisma.site.create({
    data: {
      name: "Showroom Étoile Rouge",
      code: "ETOILE_ROUGE",
      address: "Carrefour Étoile Rouge",
      city: "Cotonou",
    },
  });
  const pk3 = await prisma.site.create({
    data: {
      name: "Atelier SAV Carzone Cotonou",
      code: "PK3",
      address: "Zone Technique & SAV Carzone, Cotonou",
      city: "Cotonou",
    },
  });

  const hash = await bcrypt.hash("carzone2026", 10);
  const users = [
    { email: "jeanine@carzone.bj", fullName: "Jeanine Desroses", role: Role.DG, siteId: akpakpa.id },
    { email: "igor@carzone.bj", fullName: "Igor DAGBONOUTON", role: Role.ADMIN, siteId: akpakpa.id },
    { email: "basile@carzone.bj", fullName: "Basile TOKPOMONHOUN", role: Role.COMPTA, siteId: akpakpa.id },
    { email: "jennifer@carzone.bj", fullName: "Jennifer ONHIAS", role: Role.COMMERCIAL, siteId: akpakpa.id },
    { email: "stanislas@carzone.bj", fullName: "Stanislas FASSINOU", role: Role.STOCK, siteId: akpakpa.id },
    { email: "joslain@carzone.bj", fullName: "Joslain AHOLOU", role: Role.ATELIER, siteId: pk3.id },
    { email: "orelia@carzone.bj", fullName: "Orélia B. DIKPE", role: Role.BORNES_OPS, siteId: akpakpa.id },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: { ...u, passwordHash: hash, active: true },
    });
  }

  const commercial = await prisma.user.findUniqueOrThrow({ where: { email: "jennifer@carzone.bj" } });

  const customer = await prisma.customer.create({
    data: {
      companyName: "Impact Plus Consulting",
      contactName: "Augustin JOHNSON",
      email: "a.johnson@impactplus.bj",
      phone: "+2290148655040",
      city: "Cotonou",
      category: "Entreprise",
    },
  });

  await prisma.customer.create({
    data: {
      companyName: "DHL Bénin",
      contactName: "Dr Nadine HOUVI",
      email: "n.houvi@dhl.bj",
      phone: "+2290143429984",
      city: "Cotonou",
    },
  });

  const byd = await prisma.vehicle.create({
    data: {
      vin: "LGXC14C49P0123456",
      brand: "BYD",
      model: "SONG PLUS",
      variant: "EV Excellence",
      year: 2025,
      energy: "ELECTRIQUE",
      vehicleType: "SUV",
      transmission: "Automatique",
      color: "Blanc",
      priceXof: 18900000,
      costXof: 15200000,
      status: "EN_STOCK",
      siteId: akpakpa.id,
      supplierId: supplierDubai.id,
    },
  });

  await prisma.vehicle.create({
    data: {
      vin: "LDP93L964P0654321",
      brand: "DONGFENG",
      model: "RICH 7",
      year: 2025,
      energy: "DIESEL",
      vehicleType: "PICKUP",
      transmission: "Manuelle",
      color: "Gris",
      priceXof: 22500000,
      status: "EN_STOCK",
      siteId: akpakpa.id,
      supplierId: supplierAnvers.id,
    },
  });

  await prisma.vehicle.create({
    data: {
      brand: "TOYOTA",
      model: "HILUX",
      year: 2024,
      energy: "DIESEL",
      vehicleType: "PICKUP",
      priceXof: 28500000,
      status: "EN_TRANSIT",
      siteId: akpakpa.id,
      supplierId: supplierDubai.id,
    },
  });

  const lead = await prisma.lead.create({
    data: {
      source: "site_web",
      contactName: "Kofi MENSAH",
      email: "kofi@example.bj",
      phone: "+2290199001122",
      interest: "SUV électrique",
      energyPref: "ELECTRIQUE",
      budgetMax: 20000000,
      assigneeId: commercial.id,
      status: "QUALIFIED",
    },
  });

  const opp = await prisma.opportunity.create({
    data: {
      title: "Vente BYD Song Plus — Augustin JOHNSON",
      stage: "DEVIS",
      customerId: customer.id,
      leadId: lead.id,
      vehicleId: byd.id,
      ownerId: commercial.id,
      amountXof: 18900000,
    },
  });

  const quote = await prisma.quote.create({
    data: {
      number: "PRO-2026-0001",
      status: "PROFORMA_ENVOYEE",
      docKind: "PROFORMA",
      customerId: customer.id,
      opportunityId: opp.id,
      taxMode: "HT",
      taxRatePct: 0,
      subtotalHtXof: 18900000,
      taxXof: 0,
      totalXof: 18900000,
      sentAt: new Date(),
      validUntil: new Date(Date.now() + 14 * 86400000),
      lines: {
        create: [
          {
            description: "BYD SONG PLUS EV Excellence",
            quantity: 1,
            unitPriceXof: 18900000,
            vehicleId: byd.id,
          },
        ],
      },
    },
  });

  const confirmed = await prisma.quote.create({
    data: {
      number: "PRO-2026-0002",
      status: "COMMANDE_CONFIRMEE",
      docKind: "PROFORMA",
      customerId: customer.id,
      taxMode: "HT",
      taxRatePct: 18,
      subtotalHtXof: 10000000,
      taxXof: 1800000,
      totalXof: 11800000,
      sentAt: new Date(Date.now() - 5 * 86400000),
      approvedAt: new Date(Date.now() - 2 * 86400000),
      orderConfirmedAt: new Date(Date.now() - 2 * 86400000),
      lines: {
        create: [
          {
            description: "DONGFENG RICH 7 (acompte commande)",
            quantity: 1,
            unitPriceXof: 10000000,
          },
        ],
      },
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      number: "FAC-2026-0001",
      status: "EN_RETARD",
      kind: "NORMALISEE",
      customerId: customer.id,
      quoteId: quote.id,
      taxMode: "HT",
      taxRatePct: 0,
      subtotalHtXof: 18900000,
      taxXof: 0,
      totalXof: 18900000,
      paidXof: 0,
      dueDate: new Date(Date.now() - 3 * 86400000),
    },
  });

  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: "FACTURE_NORMALISEE" },
  });

  console.log("Proforma confirmée démo:", confirmed.number);

  await prisma.task.createMany({
    data: [
      {
        title: "Relancer facture FAC-2026-0001",
        assigneeId: (await prisma.user.findUniqueOrThrow({ where: { email: "basile@carzone.bj" } })).id,
        relatedType: "invoice",
        relatedId: invoice.id,
      },
      {
        title: "Préparer essai BYD Song Plus",
        assigneeId: commercial.id,
        relatedType: "opportunity",
        relatedId: opp.id,
      },
    ],
  });

  const installer1 = await prisma.installer.create({
    data: {
      companyName: "VoltHome Bénin",
      contactName: "Serge ADJOVI",
      email: "contact@volthome.bj",
      phone: "+2290166007788",
      specialties: "Bornes murales 7–22 kW, résidentiel",
      rating: 4.8,
    },
  });
  const installer2 = await prisma.installer.create({
    data: {
      companyName: "E-Charge Cotonou",
      contactName: "Amina SOULE",
      email: "amina@echarge.bj",
      phone: "+2290177112233",
      specialties: "Bornes AC/DC, entreprises",
      rating: 4.5,
    },
  });

  await prisma.user.create({
    data: {
      email: "installateur@volthome.bj",
      fullName: "Serge ADJOVI",
      role: Role.INSTALLATEUR,
      passwordHash: hash,
      installerId: installer1.id,
    },
  });

  const installReq = await prisma.chargeInstallRequest.create({
    data: {
      customerId: customer.id,
      address: "Fidjrossè, Cotonou",
      powerKw: 7.4,
      vehicleBrand: "BYD",
      vehicleModel: "SONG PLUS",
      status: "ENVOYEE_INSTALLATEURS",
      installerQuotes: {
        create: [
          { installerId: installer1.id, status: "SOUMIS", amountXof: 850000, leadDays: 7, submittedAt: new Date() },
          { installerId: installer2.id, status: "EN_ATTENTE" },
        ],
      },
    },
  });

  const planPub = await prisma.chargingPlan.create({
    data: {
      name: "Public",
      description: "Tarif standard sans abonnement",
      monthlyFeeXof: 0,
      kwhPriceXof: 125,
      publicKwhPriceXof: 125,
    },
  });
  const planClub = await prisma.chargingPlan.create({
    data: {
      name: "CARZONE Club VIP",
      description: "Abonnement recharge préférentiel",
      monthlyFeeXof: 15000,
      kwhPriceXof: 90,
      publicKwhPriceXof: 125,
    },
  });
  await prisma.chargingPlan.create({
    data: {
      name: "CARZONE Flex",
      description: "Tarif intermédiaire",
      monthlyFeeXof: 8000,
      kwhPriceXof: 115,
      publicKwhPriceXof: 125,
    },
  });

  await prisma.chargingSubscription.create({
    data: {
      customerId: customer.id,
      planId: planClub.id,
      active: true,
    },
  });

  const station = await prisma.chargingStation.create({
    data: {
      code: "OXC-AKP-01",
      name: "Borne Showroom Saint-Michel (Immeuble CBDH)",
      address: "Showroom Saint-Michel (Immeuble CBDH)",
      siteId: akpakpa.id,
      powerKw: 22,
      terminalId: "TERM-AKP-01",
    },
  });

  const session = await prisma.chargingSession.create({
    data: {
      stationId: station.id,
      customerId: customer.id,
      status: "TERMINEE",
      kwhDelivered: 24.5,
      pricePerKwh: 90,
      totalXof: 2205,
      paymentMethod: "MOBILE_MONEY",
      paymentRef: "MM-DEMO-001",
      endedAt: new Date(),
    },
  });

  await prisma.chargingInvoice.create({
    data: {
      number: "CHG-2026-0001",
      status: "PAYEE",
      customerId: customer.id,
      sessionId: session.id,
      totalXof: 2205,
      paidAt: new Date(),
    },
  });

  await prisma.rental.create({
    data: {
      type: "LCD",
      status: "ACTIF",
      customerId: customer.id,
      vehicleId: byd.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 86400000),
      monthlyXof: 350000,
      depositXof: 200000,
    },
  });

  const fleet = await prisma.fleetAccount.create({
    data: {
      name: "Flotte Impact Plus",
      company: "Impact Plus Consulting",
    },
  });
  await prisma.fleetVehicle.create({
    data: {
      fleetAccountId: fleet.id,
      vehicleId: byd.id,
      customerId: customer.id,
      plateNumber: "A1234RB",
      driverName: "Augustin JOHNSON",
    },
  });

  await prisma.workOrder.create({
    data: {
      number: "OR-2026-0001",
      status: "EN_COURS",
      vehicleId: byd.id,
      customerName: "Augustin JOHNSON",
      description: "Révision 10 000 km + contrôle batterie",
      laborXof: 45000,
      partsXof: 28000,
      technicianId: (await prisma.user.findUniqueOrThrow({ where: { email: "joslain@carzone.bj" } })).id,
    },
  });

  await prisma.importOrder.create({
    data: {
      reference: "IMP-ANV-2026-014",
      originPort: "Anvers",
      status: "EN_TRANSIT",
      etaDate: new Date(Date.now() + 21 * 86400000),
      costXof: 4200000,
      supplierId: supplierAnvers.id,
      expectedBrand: "DONGFENG",
      expectedModel: "MAGE",
      notes: "Conteneur 2 véhicules Dongfeng",
    },
  });

  console.log("Seed OK");
  console.log("Login: igor@carzone.bj / carzone2026");
  console.log("Install request:", installReq.id);
  console.log("Public plan id:", planPub.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
