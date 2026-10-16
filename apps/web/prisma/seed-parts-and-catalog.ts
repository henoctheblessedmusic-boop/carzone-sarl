import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Début du peuplement du Catalogue topcarzone.com, du Stock Général et des Pièces Détachées ===");

  // 1. Récupération ou création du site Showroom
  const site =
    (await prisma.site.findFirst({ where: { code: "MARO_MILITAIRE" } })) ||
    (await prisma.site.create({
      data: {
        name: "Siège & Showroom Carzone SARL",
        code: "MARO_MILITAIRE",
        address: "Zone Maro-Militaire, Quartier Gbèdomidji",
        city: "Cotonou",
      },
    }));

  // Fournisseurs
  const supplierChine =
    (await prisma.supplier.findFirst({ where: { name: { contains: "Chine" } } })) ||
    (await prisma.supplier.create({
      data: {
        name: "Constructeurs Partenaires Chine (Changan, Jetour, BAIC)",
        country: "Chine",
        city: "Shanghai / Chongqing",
        type: "IMPORT_PORT",
        notes: "Fournisseur direct usine pour les marques chinoises",
      },
    }));

  const supplierDubai =
    (await prisma.supplier.findFirst({ where: { name: { contains: "Dubaï" } } })) ||
    (await prisma.supplier.create({
      data: {
        name: "Import Dubaï & Golfe",
        country: "Émirats Arabes Unis",
        city: "Dubaï",
        type: "IMPORT_PORT",
      },
    }));

  // 2. ENRICHISSEMENT DU CATALOGUE MARQUES & MODÈLES (Scanné depuis topcarzone.com)
  const fullCatalog = [
    {
      name: "CHANGAN",
      models: [
        { name: "CS35 PLUS", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "CS55 PLUS", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "CS75 2026", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "UNI-K 2026", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "UNI-Z 2026", vehicleType: "SUV", energy: "PHEV" },
        { name: "X5 PLUS 2026", vehicleType: "SUV", energy: "ESSENCE" },
      ],
    },
    {
      name: "JETOUR",
      models: [
        { name: "DASHING", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "X70 PLUS", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "X90 7 PLACES", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "JETOUR L7", vehicleType: "SUV", energy: "PHEV" },
        { name: "T1 i-DM", vehicleType: "SUV", energy: "PHEV" },
        { name: "T2 i-DM 2026", vehicleType: "SUV", energy: "PHEV" },
      ],
    },
    {
      name: "BAIC",
      models: [
        { name: "X35", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "X55", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "X55e REHEV", vehicleType: "SUV", energy: "PHEV" },
        { name: "X7 1.5T", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "B30e 4x4", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "B40 CLASSIQUE", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "B40 PRO", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "B60", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "U5 PLUS", vehicleType: "BERLINE", energy: "ESSENCE" },
        { name: "EU5", vehicleType: "BERLINE", energy: "ELECTRIQUE" },
        { name: "ARCFOX V9", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "ARCFOX T5", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "ARCFOX S5", vehicleType: "BERLINE", energy: "ELECTRIQUE" },
      ],
    },
    {
      name: "BYD",
      models: [
        { name: "SONG PLUS", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "SONG L", vehicleType: "SUV", energy: "PHEV" },
        { name: "QIN", vehicleType: "BERLINE", energy: "PHEV" },
        { name: "LEOPARD 5", vehicleType: "SUV", energy: "PHEV" },
        { name: "LEOPARD 8", vehicleType: "SUV", energy: "PHEV" },
        { name: "ATTO 3", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "SEAGULL", vehicleType: "BERLINE", energy: "ELECTRIQUE" },
        { name: "SEA LION 07", vehicleType: "SUV", energy: "ELECTRIQUE" },
      ],
    },
    {
      name: "FORTHING",
      models: [
        { name: "SX5", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "T5 EVO 2026", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "T5 HEV", vehicleType: "SUV", energy: "HYBRIDE" },
        { name: "T5 MACH", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "FRIDAY", vehicleType: "SUV", energy: "ELECTRIQUE" },
        { name: "V9 HEV", vehicleType: "VAN", energy: "HYBRIDE" },
        { name: "S7", vehicleType: "BERLINE", energy: "ELECTRIQUE" },
        { name: "RICH 7 DC 4x4", vehicleType: "PICKUP", energy: "DIESEL" },
        { name: "RICH 7 4x2", vehicleType: "PICKUP", energy: "ESSENCE" },
      ],
    },
    {
      name: "GEELY",
      models: [
        { name: "STARSHIP 7 2026", vehicleType: "SUV", energy: "PHEV" },
        { name: "GALAXY STARSHIP 7", vehicleType: "SUV", energy: "PHEV" },
        { name: "MONJARO", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "COOLRAY", vehicleType: "SUV", energy: "ESSENCE" },
      ],
    },
    {
      name: "EXEED",
      models: [
        { name: "RX 400 Thermique", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "RX 400 Hybrid", vehicleType: "SUV", energy: "HYBRIDE" },
      ],
    },
    {
      name: "KAIYI",
      models: [
        { name: "X3 PRO 2026", vehicleType: "SUV", energy: "ESSENCE" },
        { name: "X7", vehicleType: "SUV", energy: "ESSENCE" },
      ],
    },
    {
      name: "TOYOTA",
      models: [
        { name: "LAND CRUISER PRADO", vehicleType: "SUV", energy: "DIESEL" },
        { name: "HILUX", vehicleType: "PICKUP", energy: "DIESEL" },
        { name: "LAND CRUISER 300", vehicleType: "SUV", energy: "DIESEL" },
      ],
    },
  ];

  for (let i = 0; i < fullCatalog.length; i++) {
    const brandData = fullCatalog[i];
    const brand = await prisma.vehicleBrand.upsert({
      where: { name: brandData.name },
      update: { sortOrder: i },
      create: { name: brandData.name, sortOrder: i },
    });

    for (const m of brandData.models) {
      await prisma.vehicleModel.upsert({
        where: { brandId_name: { brandId: brand.id, name: m.name } },
        update: { vehicleType: m.vehicleType, energy: m.energy },
        create: {
          brandId: brand.id,
          name: m.name,
          vehicleType: m.vehicleType,
          energy: m.energy,
        },
      });
    }
  }
  console.log("✔ Catalogue marques & modèles topcarzone.com synchronisé");

  // 3. SEED DES VÉHICULES DU STOCK GÉNÉRAL (5 ÉTAPES DU DIRECTEUR)
  const sampleVehicles = [
    // Étape 1: COMMANDES
    {
      brand: "CHANGAN",
      model: "CS75 2026",
      variant: "1.5T Luxury Edition",
      year: 2026,
      energy: "ESSENCE",
      vehicleType: "SUV",
      priceXof: 19800000,
      status: "COMMANDE",
      shippingOriginPort: "Chongqing (Chine)",
      orderReference: "BDC-CZ-2026-041",
      siteId: site.id,
      supplierId: supplierChine.id,
    },
    {
      brand: "JETOUR",
      model: "T2 i-DM 2026",
      variant: "4x4 Tout-Terrain Hybride",
      year: 2026,
      energy: "PHEV",
      vehicleType: "SUV",
      priceXof: 26500000,
      status: "COMMANDE",
      shippingOriginPort: "Ningbo (Chine)",
      orderReference: "BDC-CZ-2026-042",
      siteId: site.id,
      supplierId: supplierChine.id,
    },

    // Étape 2: STOCKS EN PRODUCTION
    {
      brand: "JETOUR",
      model: "DASHING",
      variant: "1.5T Turbo Dynamic",
      year: 2026,
      energy: "ESSENCE",
      vehicleType: "SUV",
      priceXof: 16900000,
      status: "EN_PRODUCTION",
      shippingOriginPort: "Wuhu (Chine)",
      productionWeek: "S-18 (Avril 2026)",
      orderReference: "BDC-CZ-2026-035",
      siteId: site.id,
      supplierId: supplierChine.id,
    },
    {
      brand: "BAIC",
      model: "X55e REHEV",
      variant: "Hybride Rechargeable LV4",
      year: 2026,
      energy: "PHEV",
      vehicleType: "SUV",
      priceXof: 21500000,
      status: "EN_PRODUCTION",
      shippingOriginPort: "Beijing (Chine)",
      productionWeek: "S-17 (Avril 2026)",
      orderReference: "BDC-CZ-2026-038",
      siteId: site.id,
      supplierId: supplierChine.id,
    },

    // Étape 3: STOCK EN TRANSIT (MARITIME)
    {
      vin: "LFV2A21B9P0812345",
      brand: "FORTHING",
      model: "T5 EVO 2026",
      variant: "1.5T Mach Edition",
      year: 2026,
      energy: "ESSENCE",
      vehicleType: "SUV",
      priceXof: 17500000,
      status: "EN_TRANSIT",
      shippingOriginPort: "Shanghai",
      etaDate: new Date(Date.now() + 14 * 86400000), // ETA 14j
      containerNumber: "MSKU9481720",
      siteId: site.id,
      supplierId: supplierChine.id,
    },
    {
      vin: "LB37549P8P0998877",
      brand: "GEELY",
      model: "STARSHIP 7 2026",
      variant: "Qihang Edition 130km PHEV",
      year: 2026,
      energy: "PHEV",
      vehicleType: "SUV",
      priceXof: 22900000,
      status: "EN_TRANSIT",
      shippingOriginPort: "Ningbo",
      etaDate: new Date(Date.now() + 18 * 86400000), // ETA 18j
      containerNumber: "COSU6291840",
      siteId: site.id,
      supplierId: supplierChine.id,
    },

    // Étape 4: STOCK AU PORT (PORT DE COTONOU)
    {
      vin: "LS5A32E16P0554433",
      brand: "CHANGAN",
      model: "UNI-K 2026",
      variant: "2.0T AWD 8AT",
      year: 2026,
      energy: "ESSENCE",
      vehicleType: "SUV",
      priceXof: 29500000,
      status: "AU_PORT",
      shippingOriginPort: "Shanghai",
      containerNumber: "CMAU7361529",
      siteId: site.id,
      supplierId: supplierChine.id,
    },
    {
      vin: "LBA123987P0443322",
      brand: "BAIC",
      model: "B40 PRO",
      variant: "4x4 Tout-Terrain Standard",
      year: 2025,
      energy: "ESSENCE",
      vehicleType: "SUV",
      priceXof: 24900000,
      status: "AU_PORT",
      shippingOriginPort: "Dubaï",
      containerNumber: "HLCU8372619",
      siteId: site.id,
      supplierId: supplierDubai.id,
    },

    // Étape 5: STOCK EN MAGASIN (SHOWROOM COTONOU)
    {
      vin: "LS5A14B82P0332211",
      brand: "CHANGAN",
      model: "CS35 PLUS",
      variant: "1.4T DCT Comfort",
      year: 2025,
      energy: "ESSENCE",
      vehicleType: "SUV",
      priceXof: 14800000,
      status: "EN_MAGASIN",
      siteId: site.id,
      supplierId: supplierChine.id,
    },
    {
      vin: "LB38475P1P0221100",
      brand: "JETOUR",
      model: "DASHING",
      variant: "1.5T DCT Premium",
      year: 2025,
      energy: "ESSENCE",
      vehicleType: "SUV",
      priceXof: 16500000,
      status: "EN_MAGASIN",
      siteId: site.id,
      supplierId: supplierChine.id,
    },
    {
      vin: "LDF93L964P0112233",
      brand: "FORTHING",
      model: "RICH 7 DC 4x4",
      variant: "Double Cabine 8AT Diesel",
      year: 2025,
      energy: "DIESEL",
      vehicleType: "PICKUP",
      priceXof: 23900000,
      status: "EN_MAGASIN",
      siteId: site.id,
      supplierId: supplierChine.id,
    },
    {
      vin: "JTEBX3FJ5P0887766",
      brand: "TOYOTA",
      model: "LAND CRUISER PRADO",
      variant: "TX-L 2.8L D-4D",
      year: 2025,
      energy: "DIESEL",
      vehicleType: "SUV",
      priceXof: 68000000,
      status: "EN_MAGASIN",
      siteId: site.id,
      supplierId: supplierDubai.id,
    },
  ];

  for (const v of sampleVehicles) {
    if (v.vin) {
      const exists = await prisma.vehicle.findUnique({ where: { vin: v.vin } });
      if (!exists) {
        await prisma.vehicle.create({ data: v });
      }
    } else {
      await prisma.vehicle.create({ data: v });
    }
  }
  console.log("✔ Véhicules répartis dans les 5 étapes logistiques créés");

  // 4. SEED DES PIÈCES DÉTACHÉES AVEC CROISEMENTS DE RÉFÉRENCES (LE BESOIN DU DIRECTEUR)
  const partsData = [
    {
      partNumber: "CZ-BRK-35011",
      oemNumber: "3501110-M01",
      name: "Jeu de plaquettes de frein avant (Patin) Multi-Modèles",
      category: "FREINAGE",
      manufacturer: "OEM Changan / Huaxin Friction",
      description: "Patin avant pour étrier flottant. Interchangeable Changan, Jetour Dashing, Chery Tiggo 7 et Kaiyi X3 Pro.",
      unit: "JEU",
      location: "Rayon A - Casier 04",
      stockQuantity: 18,
      minStockAlert: 4,
      purchasePriceXof: 18500,
      sellingPriceXof: 35000,
      crossReferences: [
        { brand: "JETOUR", crossReference: "T15-3501080", isDirectFit: true, notes: "100% identique étrier Wuhu" },
        { brand: "CHERY", crossReference: "T11-3501080BA", isDirectFit: true, notes: "Même garniture céramique" },
        { brand: "BOSCH", crossReference: "0 986 494 567", isDirectFit: true, notes: "Référence équipementier Bosch" },
        { brand: "BREMBO", crossReference: "P 54 017", isDirectFit: true, notes: "Gamme Premium" },
      ],
      compatibilities: [
        { vehicleBrand: "CHANGAN", vehicleModel: "CS35 PLUS", years: "2020-2026", engine: "1.4T / 1.6L", position: "Avant" },
        { vehicleBrand: "JETOUR", vehicleModel: "DASHING", years: "2022-2026", engine: "1.5T / 1.6T", position: "Avant" },
        { vehicleBrand: "CHERY", vehicleModel: "TIGGO 7 PRO", years: "2021-2026", engine: "1.5T", position: "Avant" },
        { vehicleBrand: "KAIYI", vehicleModel: "X3 PRO 2026", years: "2023-2026", engine: "1.5T", position: "Avant" },
      ],
    },
    {
      partNumber: "CZ-BRK-35022",
      oemNumber: "3502100-M01",
      name: "Plaquettes de frein arrière avec capteur électronique",
      category: "FREINAGE",
      manufacturer: "OEM BAIC",
      description: "Plaquettes arrière pour frein à main électrique (EPB).",
      unit: "JEU",
      location: "Rayon A - Casier 08",
      stockQuantity: 12,
      minStockAlert: 3,
      purchasePriceXof: 16000,
      sellingPriceXof: 30000,
      crossReferences: [
        { brand: "FORTHING", crossReference: "3502110-T5", isDirectFit: true, notes: "Compatible T5 EVO & Mach" },
        { brand: "GEELY", crossReference: "4048035600", isDirectFit: true, notes: "Montage étrier Geely" },
        { brand: "FERODO", crossReference: "FDB4318", isDirectFit: true, notes: "Gamme Eco-Friction" },
      ],
      compatibilities: [
        { vehicleBrand: "BAIC", vehicleModel: "X55", years: "2022-2026", engine: "1.5T", position: "Arrière" },
        { vehicleBrand: "FORTHING", vehicleModel: "T5 EVO 2026", years: "2021-2026", engine: "1.5T", position: "Arrière" },
        { vehicleBrand: "GEELY", vehicleModel: "COOLRAY", years: "2022-2026", engine: "1.5T", position: "Arrière" },
      ],
    },
    {
      partNumber: "CZ-FIL-10120",
      oemNumber: "1012010-B01",
      name: "Filtre à huile moteur 1.5T Turbo Universel",
      category: "FILTRATION",
      manufacturer: "OEM Changan / Mann",
      description: "Filtre à huile vissant 1.5L Turbo. La référence la plus croisée du catalogue CARZONE.",
      unit: "PIECE",
      location: "Rayon B - Casier 01",
      stockQuantity: 45,
      minStockAlert: 10,
      purchasePriceXof: 3500,
      sellingPriceXof: 8500,
      crossReferences: [
        { brand: "JETOUR", crossReference: "481H-1012010", isDirectFit: true, notes: "Moteur Acteco 1.5T" },
        { brand: "BAIC", crossReference: "F0101-1012", isDirectFit: true, notes: "Moteur Magic Core" },
        { brand: "MANN-FILTER", crossReference: "W 68/3", isDirectFit: true, notes: "Filtre premium Mann" },
        { brand: "MAHLE", crossReference: "OC 574", isDirectFit: true, notes: "Équivalent Mahle" },
        { brand: "BOSCH", crossReference: "0 986 452 058", isDirectFit: true, notes: "Bosch standard" },
      ],
      compatibilities: [
        { vehicleBrand: "CHANGAN", vehicleModel: "CS55 PLUS", years: "2021-2026", engine: "1.5T" },
        { vehicleBrand: "CHANGAN", vehicleModel: "UNI-Z 2026", years: "2024-2026", engine: "1.5L Hybride" },
        { vehicleBrand: "JETOUR", vehicleModel: "DASHING", years: "2022-2026", engine: "1.5T" },
        { vehicleBrand: "JETOUR", vehicleModel: "X70 PLUS", years: "2021-2026", engine: "1.5T / 1.6T" },
        { vehicleBrand: "BAIC", vehicleModel: "X55", years: "2022-2026", engine: "1.5T" },
        { vehicleBrand: "FORTHING", vehicleModel: "T5 EVO 2026", years: "2021-2026", engine: "1.5T" },
        { vehicleBrand: "KAIYI", vehicleModel: "X7", years: "2023-2026", engine: "1.5T" },
      ],
    },
    {
      partNumber: "CZ-IGN-DK7R",
      oemNumber: "DK7RTI",
      name: "Bougies d'allumage Iridium Haute Performance (Pack de 4)",
      category: "MOTEUR",
      manufacturer: "Torch / NGK",
      description: "Bougie Iridium longue durée (60 000 km) pour moteurs turbocompressés et hybrides rechargeables.",
      unit: "JEU",
      location: "Rayon C - Casier 12",
      stockQuantity: 15,
      minStockAlert: 4,
      purchasePriceXof: 14000,
      sellingPriceXof: 28000,
      crossReferences: [
        { brand: "NGK", crossReference: "ILKER7A8EGS", isDirectFit: true, notes: "Grade thermique 7" },
        { brand: "BOSCH", crossReference: "0 242 140 523", isDirectFit: true, notes: "Double Iridium" },
        { brand: "DENSO", crossReference: "IK20TT", isDirectFit: true, notes: "Iridium TT" },
      ],
      compatibilities: [
        { vehicleBrand: "CHANGAN", vehicleModel: "UNI-K 2026", years: "2022-2026", engine: "2.0T" },
        { vehicleBrand: "CHANGAN", vehicleModel: "UNI-Z 2026", years: "2024-2026", engine: "1.5L Hybride" },
        { vehicleBrand: "JETOUR", vehicleModel: "T2 i-DM 2026", years: "2024-2026", engine: "1.5T PHEV" },
        { vehicleBrand: "BAIC", vehicleModel: "B40 PRO", years: "2022-2026", engine: "2.0T" },
        { vehicleBrand: "GEELY", vehicleModel: "MONJARO", years: "2022-2026", engine: "2.0T" },
      ],
    },
    {
      partNumber: "CZ-SUS-29051",
      oemNumber: "F11-2905010",
      name: "Amortisseur avant droit hydraulique / gaz",
      category: "SUSPENSION",
      manufacturer: "OEM Jetour / KYB",
      description: "Amortisseur de suspension avant MacPherson.",
      unit: "PIECE",
      location: "Rayon D - Casier 02",
      stockQuantity: 6,
      minStockAlert: 2,
      purchasePriceXof: 38000,
      sellingPriceXof: 65000,
      crossReferences: [
        { brand: "CHANGAN", crossReference: "2905100-U01", isDirectFit: true, notes: "Montage sur pivot identique" },
        { brand: "KYB", crossReference: "3340051", isDirectFit: true, notes: "Gamme Excel-G" },
      ],
      compatibilities: [
        { vehicleBrand: "JETOUR", vehicleModel: "DASHING", years: "2022-2026", position: "Avant Droit" },
        { vehicleBrand: "CHANGAN", vehicleModel: "CS55 PLUS", years: "2021-2026", position: "Avant Droit" },
        { vehicleBrand: "KAIYI", vehicleModel: "X7", years: "2023-2026", position: "Avant Droit" },
      ],
    },
    {
      partNumber: "CZ-BRK-35010",
      oemNumber: "T15-3501075",
      name: "Disques de frein avant ventilés (Paire)",
      category: "FREINAGE",
      manufacturer: "Brembo / OEM",
      description: "Diamètre 300 mm, épaisseur 28 mm, 5 trous.",
      unit: "PAIRE",
      location: "Rayon A - Casier 14",
      stockQuantity: 8,
      minStockAlert: 2,
      purchasePriceXof: 45000,
      sellingPriceXof: 78000,
      crossReferences: [
        { brand: "CHANGAN", crossReference: "3501070-M01", isDirectFit: true, notes: "Même déport et perçage 5x114.3" },
        { brand: "BREMBO", crossReference: "09.C395.13", isDirectFit: true, notes: "Disque traité UV" },
      ],
      compatibilities: [
        { vehicleBrand: "JETOUR", vehicleModel: "DASHING", years: "2022-2026", position: "Avant" },
        { vehicleBrand: "CHANGAN", vehicleModel: "CS35 PLUS", years: "2020-2026", position: "Avant" },
        { vehicleBrand: "CHERY", vehicleModel: "TIGGO 7 PRO", years: "2021-2026", position: "Avant" },
      ],
    },
    {
      partNumber: "CZ-FIL-81001",
      oemNumber: "8100110-U01",
      name: "Filtre d'habitacle clim charbon actif antibactérien",
      category: "FILTRATION",
      manufacturer: "Valeo / OEM",
      description: "Filtre pollen et particules fines PM2.5 pour climatisation showroom.",
      unit: "PIECE",
      location: "Rayon B - Casier 09",
      stockQuantity: 24,
      minStockAlert: 5,
      purchasePriceXof: 4500,
      sellingPriceXof: 12000,
      crossReferences: [
        { brand: "BYD", crossReference: "10234850-00", isDirectFit: true, notes: "Dimensions 215x200x30mm" },
        { brand: "VALEO", crossReference: "715555", isDirectFit: true, notes: "ClimFilter Supreme" },
      ],
      compatibilities: [
        { vehicleBrand: "CHANGAN", vehicleModel: "UNI-Z 2026", years: "2024-2026", position: "Habitacle" },
        { vehicleBrand: "BYD", vehicleModel: "SONG PLUS", years: "2022-2026", position: "Habitacle" },
        { vehicleBrand: "JETOUR", vehicleModel: "DASHING", years: "2022-2026", position: "Habitacle" },
      ],
    },
  ];

  for (const p of partsData) {
    const existing = await prisma.partItem.findUnique({
      where: { partNumber: p.partNumber },
    });

    if (!existing) {
      const created = await prisma.partItem.create({
        data: {
          partNumber: p.partNumber,
          oemNumber: p.oemNumber,
          name: p.name,
          category: p.category,
          manufacturer: p.manufacturer,
          description: p.description,
          unit: p.unit,
          location: p.location,
          stockQuantity: p.stockQuantity,
          minStockAlert: p.minStockAlert,
          purchasePriceXof: p.purchasePriceXof,
          sellingPriceXof: p.sellingPriceXof,
          crossReferences: {
            create: p.crossReferences,
          },
          compatibilities: {
            create: p.compatibilities,
          },
          movements: {
            create: {
              type: "ENTREE_ACHAT",
              quantity: p.stockQuantity,
              unitPriceXof: p.purchasePriceXof,
              totalPriceXof: p.stockQuantity * p.purchasePriceXof,
              reason: "Stock initial magasin CARZONE Cotonou",
              performedBy: "direction@topcarzone.com",
            },
          },
        },
      });
      console.log(`✔ Pièce créée : ${created.partNumber} - ${created.name}`);
    }
  }

  console.log("=== Peuplement terminé avec succès ! ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
