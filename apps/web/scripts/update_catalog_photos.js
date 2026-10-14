const fs = require('fs');
let code = fs.readFileSync('src/lib/vehicle-catalog-specs.ts', 'utf8');

const MAPPINGS = [
  {
    modelRegex: /brand:\s*"JETOUR",\s*model:\s*"DASHING"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "JETOUR",\n    model: "DASHING",\n    variant: "Luxury 1.6TGDI 7DCT",\n    category: "SUV",\n    year: 2026,\n    energy: "ESSENCE",\n    title: "JETOUR DASHING LUXURY 1.6TGDI 7DCT",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/dashing-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/dashing-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/dashing-seats.jpg",\n      exteriorPhotoUrl: "/images/vehicles/dashing-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/dashing-rear.jpg",\n    }`
  },
  {
    modelRegex: /brand:\s*"JETOUR",\s*model:\s*"T2"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "JETOUR",\n    model: "T2",\n    variant: "Traveller 2.0TGDI 4WD X-WD",\n    category: "SUV",\n    year: 2026,\n    energy: "ESSENCE",\n    title: "JETOUR T2 TRAVELLER 2.0T 4WD X-WD",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/t2-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/t2-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/t2-seats.jpg",\n      exteriorPhotoUrl: "/images/vehicles/t2-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/t2-rear.jpg",\n    }`
  },
  {
    modelRegex: /brand:\s*"FORTHING",\s*model:\s*"RICH 7"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "FORTHING",\n    model: "RICH 7",\n    variant: "Double Cabine 2.0T 4x4 Luxe",\n    category: "PICKUP",\n    year: 2026,\n    energy: "DIESEL",\n    title: "DONGFENG FORTHING RICH 7 DOUBLE CABINE 4x4",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/rich7-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/rich7-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/rich7-interior.jpg",\n      exteriorPhotoUrl: "/images/vehicles/rich7-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/rich7-rear.jpg",\n    }`
  },
  {
    modelRegex: /brand:\s*"FORTHING",\s*model:\s*"T5 EVO"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "FORTHING",\n    model: "T5 EVO",\n    variant: "Mach Edition 1.5TD 7DCT",\n    category: "SUV",\n    year: 2026,\n    energy: "ESSENCE",\n    title: "FORTHING T5 EVO MACH EDITION 1.5TD 7DCT",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/t5evo-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/t5evo-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/t5evo-seats.jpg",\n      exteriorPhotoUrl: "/images/vehicles/t5evo-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/t5evo-rear.jpg",\n    }`
  },
  {
    modelRegex: /brand:\s*"CHANGAN",\s*model:\s*"CS75"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "CHANGAN",\n    model: "CS75",\n    variant: "Plus Flagship 2.0T 8AT",\n    category: "SUV",\n    year: 2026,\n    energy: "ESSENCE",\n    title: "CHANGAN CS75 PLUS FLAGSHIP 2.0T 8AT",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/cs75-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/cs75-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/cs75-seats.jpg",\n      exteriorPhotoUrl: "/images/vehicles/cs75-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/cs75-rear.jpg",\n    }`
  },
  {
    modelRegex: /brand:\s*"CHANGAN",\s*model:\s*"CS35 PLUS"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "CHANGAN",\n    model: "CS35 PLUS",\n    variant: "Luxe 1.4T Blue Whale 7DCT",\n    category: "SUV",\n    year: 2026,\n    energy: "ESSENCE",\n    title: "CHANGAN CS35 PLUS LUXE 1.4T BLUE WHALE 7DCT",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/cs35-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/cs35-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/cs35-seats.jpg",\n      exteriorPhotoUrl: "/images/vehicles/cs35-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/cs35-rear.jpg",\n    }`
  },
  {
    modelRegex: /brand:\s*"CHANGAN",\s*model:\s*"UNI-K"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "CHANGAN",\n    model: "UNI-K",\n    variant: "Flagship 2.0T AWD 8AT",\n    category: "SUV",\n    year: 2026,\n    energy: "ESSENCE",\n    title: "CHANGAN UNI-K FLAGSHIP 2.0T AWD 8AT",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/unik-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/unik-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/unik-seats.jpg",\n      exteriorPhotoUrl: "/images/vehicles/unik-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/unik-rear.jpg",\n    }`
  },
  {
    modelRegex: /brand:\s*"BAIC",\s*model:\s*"B40 PRO"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "BAIC",\n    model: "B40 PRO",\n    variant: "Champion 2.0T 4x4 BVA8",\n    category: "SUV",\n    year: 2026,\n    energy: "ESSENCE",\n    title: "BAIC B40 PRO CHAMPION 2.0T 4x4",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/b40-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/b40-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/b40-seats.jpg",\n      exteriorPhotoUrl: "/images/vehicles/b40-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/b40-rear.jpg",\n    }`
  },
  {
    modelRegex: /brand:\s*"GEELY",\s*model:\s*"STARSHIP 7"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "GEELY",\n    model: "STARSHIP 7",\n    variant: "Galaxy EM-i PHEV Exploration",\n    category: "SUV",\n    year: 2026,\n    energy: "HYBRIDE",\n    title: "GEELY GALAXY STARSHIP 7 EM-i PHEV",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/starship7-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/starship7-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/starship7-seats.jpg",\n      exteriorPhotoUrl: "/images/vehicles/starship7-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/starship7-rear.jpg",\n    }`
  },
  {
    modelRegex: /brand:\s*"TOYOTA",\s*model:\s*"LAND CRUISER PRADO"[\s\S]*?photos:\s*\{[\s\S]*?\}/,
    replacement: `brand: "TOYOTA",\n    model: "LAND CRUISER PRADO",\n    variant: "TX-L 2.8 D-4D 4x4 7 Places",\n    category: "SUV",\n    year: 2026,\n    energy: "DIESEL",\n    title: "TOYOTA LAND CRUISER PRADO TX-L 2.8L D-4D 4x4",\n    photos: {\n      mainPhotoUrl: "/images/vehicles/prado-main.jpg",\n      interiorPhotoUrl: "/images/vehicles/prado-interior.jpg",\n      interiorSeatsPhotoUrl: "/images/vehicles/prado-seats.jpg",\n      exteriorPhotoUrl: "/images/vehicles/prado-exterior.jpg",\n      rearPhotoUrl: "/images/vehicles/prado-rear.jpg",\n    }`
  }
];

let updatedCount = 0;
for (const m of MAPPINGS) {
  if (m.modelRegex.test(code)) {
    code = code.replace(m.modelRegex, m.replacement);
    updatedCount++;
    console.log(`Updated model in catalog`);
  } else {
    console.warn(`Could not match regex for a mapping!`);
  }
}

fs.writeFileSync('src/lib/vehicle-catalog-specs.ts', code, 'utf8');
console.log(`Done! Updated ${updatedCount} model specifications in catalog.`);
