/**
 * Importe la base de références fournie dans le catalogue général.
 *
 * Source attendue : un dossier contenant donnees/pieces.csv, applications.csv,
 * equivalences.csv, sources.csv et traductions.csv.
 *
 * Commande :
 *   BASE_PIECES_DIR="C:\...\base_pieces" npx tsx scripts/import-base-pieces.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseDir = process.env.BASE_PIECES_DIR || "C:\\Users\\IGOR_GIANI\\Desktop\\Base_references_pieces_auto\\base_pieces";

type Row = Record<string, string>;

/** Parseur CSV minimal avec support des guillemets et des retours ligne. */
function parseDelimited(text: string, delimiter = ";"): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") {
      field += character;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((current) => current.some((value) => value.trim() !== ""));
}

function readRows(fileName: string): Row[] {
  const content = readFileSync(join(baseDir, "donnees", fileName), "utf8");
  const rows = parseDelimited(content);
  if (rows.length === 0) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) => {
    const record: Row = {};
    headers.forEach((header, index) => {
      record[header] = (values[index] || "").trim();
    });
    return record;
  });
}

type SourceInfo = {
  code: string;
  title: string;
  editor: string;
  url: string;
  reliability: string;
  usable: boolean;
};

function confidenceForReliability(reliability: string): string {
  if (reliability === "officiel_constructeur") return "elevee";
  if (reliability === "equipementier") return "moyenne";
  return "faible";
}

function confidenceRank(value: string | null | undefined): number {
  if (value === "elevee") return 3;
  if (value === "moyenne") return 2;
  return 1;
}

function partTaxonomy(family: string, designation: string): { system: string; subcategory: string } {
  const normalized = `${family} ${designation}`.toLowerCase();
  if (normalized.includes("filtre") || normalized.includes("filter")) {
    if (normalized.includes("huile") || normalized.includes("oil")) return { system: "FILTRATION", subcategory: "FILTRE_HUILE" };
    if (normalized.includes("habitacle") || normalized.includes("cabin")) return { system: "FILTRATION", subcategory: "FILTRE_HABITACLE" };
    if (normalized.includes("carburant") || normalized.includes("fuel")) return { system: "FILTRATION", subcategory: "FILTRE_CARBURANT" };
    return { system: "FILTRATION", subcategory: "FILTRE_AIR" };
  }
  if (normalized.includes("plaquette") || normalized.includes("brake pad")) return { system: "FREINAGE", subcategory: "PLAQUETTES" };
  if (normalized.includes("disque") || normalized.includes("disc")) return { system: "FREINAGE", subcategory: "DISQUES" };
  if (normalized.includes("bougie") || normalized.includes("spark plug")) return { system: "MOTEUR", subcategory: "ALLUMAGE" };
  if (normalized.includes("huile moteur") || normalized.includes("engine oil")) return { system: "FLUIDES", subcategory: "HUILE_MOTEUR" };
  if (normalized.includes("amortisseur") || normalized.includes("suspension")) return { system: "SUSPENSION_DIRECTION", subcategory: "AMORTISSEURS" };
  if (normalized.includes("phare") || normalized.includes("feu") || normalized.includes("light")) return { system: "ECLAIRAGE", subcategory: "PHARES" };
  if (family.toLowerCase().includes("carrosserie")) return { system: "CARROSSERIE", subcategory: "PARECHOCS" };
  if (family.toLowerCase().includes("tableau de bord")) return { system: "CARROSSERIE", subcategory: "INTERIEUR" };
  if (family.toLowerCase().includes("moteur")) return { system: "MOTEUR", subcategory: "ADMISSION_ECHAPPEMENT" };
  return { system: "ENTRETIEN", subcategory: "COURANT" };
}

async function main() {
  const sourceRows = readRows("sources.csv");
  const sources = new Map<string, SourceInfo>();
  for (const row of sourceRows) {
    sources.set(row.code, {
      code: row.code,
      title: row.titre,
      editor: row.editeur,
      url: row.url,
      reliability: row.fiabilite,
      usable: row.utilisable_en_base === "1",
    });
  }

  const translations = new Map<string, string>();
  for (const row of readRows("traductions.csv")) {
    if (row.designation_source && row.designation_fr) translations.set(row.designation_source, row.designation_fr);
  }

  const pieceRows = readRows("pieces.csv");
  const groupedPieces = new Map<
    string,
    {
      brand: string;
      number: string;
      type: string;
      designation: string;
      family: string;
      position: string;
      characteristics: string;
      notes: string;
      sources: SourceInfo[];
      locations: string[];
    }
  >();

  for (const row of pieceRows) {
    const source = sources.get(row.source);
    if (!source || !source.usable) continue;
    const key = `${row.marque_emettrice}|${row.numero}`;
    const current = groupedPieces.get(key);
    if (current) {
      current.sources.push(source);
      if (row.localisation) current.locations.push(row.localisation);
      continue;
    }
    groupedPieces.set(key, {
      brand: row.marque_emettrice,
      number: row.numero,
      type: row.type_reference,
      designation: row.designation,
      family: row.famille,
      position: row.position,
      characteristics: row.caracteristiques,
      notes: row.notes,
      sources: [source],
      locations: row.localisation ? [row.localisation] : [],
    });
  }

  const existingOrders = await prisma.generalPartOrder.count();
  if (existingOrders > 0) {
    throw new Error("Des commandes existent déjà. Import interrompu pour ne pas casser les lignes de commande.");
  }
  await prisma.generalPart.deleteMany({});

  const partIds = new Map<string, string>();
  let createdParts = 0;
  for (const piece of groupedPieces.values()) {
    const primarySource = piece.sources[0];
    const bestConfidence = piece.sources
      .map((source) => confidenceForReliability(source.reliability))
      .sort((left, right) => confidenceRank(right) - confidenceRank(left))[0];
    const translated = translations.get(piece.designation);
    const taxonomy = partTaxonomy(piece.family, piece.designation);
    const created = await prisma.generalPart.create({
      data: {
        reference: piece.number,
        partNumber: piece.number,
        referenceBrand: piece.brand,
        oemReference: piece.type === "OEM" ? piece.number : null,
        name: translated || piece.designation,
        system: taxonomy.system,
        subcategory: taxonomy.subcategory,
        family: piece.family,
        position: piece.position || null,
        characteristics: piece.characteristics || null,
        manufacturer: piece.brand,
        description: piece.designation,
        unit: "PIECE",
        confidence: bestConfidence,
        status: "a_verifier",
        sourceCode: Array.from(new Set(piece.sources.map((source) => source.code))).join(","),
        sourceName: Array.from(new Set(piece.sources.map((source) => `${source.editor} - ${source.title}`))).join(" | "),
        sourceUrl: primarySource.url,
        notes: piece.notes || null,
      },
      select: { id: true },
    });
    partIds.set(`${piece.brand}|${piece.number}`, created.id);
    createdParts += 1;
  }

  const applicationRows = readRows("applications.csv");
  const compatibilityKeys = new Set<string>();
  let createdCompatibilities = 0;
  for (const row of applicationRows) {
    const source = sources.get(row.source);
    if (!source || !source.usable) continue;
    const partId = partIds.get(`${row.marque_emettrice}|${row.numero}`);
    if (!partId) continue;
    const key = [partId, row.marque_vehicule, row.modele, row.version, row.motorisation, row.source, row.preuve].join("|");
    if (compatibilityKeys.has(key)) continue;
    compatibilityKeys.add(key);
    const years = [row.debut, row.fin].filter(Boolean).join(" - ");
    await prisma.generalPartCompatibility.create({
      data: {
        generalPartId: partId,
        vehicleBrand: row.marque_vehicule,
        vehicleModel: row.modele,
        version: row.version || null,
        years: years || null,
        engine: row.motorisation || null,
        position: null,
        notes: row.notes || null,
        confidence: row.confiance || confidenceForReliability(source.reliability),
        status: "a_verifier",
        sourceCode: source.code,
        sourceUrl: source.url,
        proof: row.preuve || null,
      },
    });
    createdCompatibilities += 1;
  }

  const equivalenceRows = readRows("equivalences.csv");
  const referenceKeys = new Set<string>();
  let createdReferences = 0;
  for (const row of equivalenceRows) {
    const source = sources.get(row.source);
    if (!source || !source.usable) continue;
    const left = partIds.get(`${row.marque_a}|${row.numero_a}`);
    const right = partIds.get(`${row.marque_b}|${row.numero_b}`);
    if (!left || !right) continue;
    const pairs = [
      { partId: left, otherBrand: row.marque_b, otherNumber: row.numero_b },
      { partId: right, otherBrand: row.marque_a, otherNumber: row.numero_a },
    ];
    for (const pair of pairs) {
      const key = `${pair.partId}|${pair.otherBrand}|${pair.otherNumber}`;
      if (referenceKeys.has(key)) continue;
      referenceKeys.add(key);
      await prisma.generalPartReference.create({
        data: {
          generalPartId: pair.partId,
          reference: pair.otherNumber,
          brand: pair.otherBrand,
          referenceType: "EQUIVALENT",
          isDirectFit: row.type_equivalence === "remplacement_declare",
          notes: row.notes || null,
          confidence: row.confiance || confidenceForReliability(source.reliability),
          status: "a_verifier",
          sourceType: source.code,
          sourceRef: row.preuve || source.url,
          verifiedAt: null,
        },
      });
      createdReferences += 1;
    }
  }

  const total = await prisma.generalPart.count();
  console.log(
    JSON.stringify({
      sources: sources.size,
      pieceRows: pieceRows.length,
      uniquePieces: groupedPieces.size,
      createdParts,
      createdCompatibilities,
      createdReferences,
      total,
    })
  );
}

main()
  .catch((error) => {
    console.error("IMPORT BASE PIECES FAILED", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
