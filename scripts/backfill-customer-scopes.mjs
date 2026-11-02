#!/usr/bin/env node
/**
 * Backfill des périmètres client (scopeShowroom / scopeGarage / isPartner) — CARZONE.
 *
 * Règle métier (cf. plan "cloisonnement garage/showroom") :
 *  - scopeShowroom = true pour TOUS les clients existants (comportement historique :
 *    avant cette migration, tout client était implicitement "showroom").
 *  - scopeGarage = true pour tout client ayant déjà :
 *      · un passage atelier (WorkshopEntry.customerId) OU
 *      · un devis Quote.activity = GARAGE OU
 *      · une facture Invoice.activity = GARAGE
 *  - isPartner n'est jamais déduit automatiquement (aucune donnée fiable pour
 *    l'inférer) : il reste à `false` et doit être qualifié manuellement.
 *
 * Réexécutable : idempotent, ne fait que mettre scopeShowroom/scopeGarage à `true`
 * là où la règle l'exige (ne retire jamais un périmètre déjà acquis).
 *
 * Usage : node scripts/backfill-customer-scopes.mjs
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const WEB_ROOT = path.join(REPO_ROOT, "apps", "web");

/** Charge apps/web/.env puis apps/web/.env.local (qui a priorité) dans process.env,
 * sans écraser des variables déjà définies par le shell appelant. */
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(WEB_ROOT, ".env"));
loadEnvFile(path.join(WEB_ROOT, ".env.local"));

const require = createRequire(path.join(WEB_ROOT, "package.json"));
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Backfill des périmètres client (scopeShowroom / scopeGarage)…");

  const showroomResult = await prisma.customer.updateMany({
    where: { scopeShowroom: false },
    data: { scopeShowroom: true },
  });
  console.log(`scopeShowroom=true : ${showroomResult.count} client(s) mis à jour.`);

  const [workshopCustomerIds, garageQuoteCustomerIds, garageInvoiceCustomerIds] = await Promise.all([
    prisma.workshopEntry.findMany({
      where: { customerId: { not: null } },
      select: { customerId: true },
      distinct: ["customerId"],
    }),
    prisma.quote.findMany({
      where: { activity: "GARAGE" },
      select: { customerId: true },
      distinct: ["customerId"],
    }),
    prisma.invoice.findMany({
      where: { activity: "GARAGE" },
      select: { customerId: true },
      distinct: ["customerId"],
    }),
  ]);

  const garageCustomerIds = Array.from(
    new Set(
      [...workshopCustomerIds, ...garageQuoteCustomerIds, ...garageInvoiceCustomerIds]
        .map((r) => r.customerId)
        .filter((id) => Boolean(id))
    )
  );

  const garageResult = await prisma.customer.updateMany({
    where: { id: { in: garageCustomerIds }, scopeGarage: false },
    data: { scopeGarage: true },
  });
  console.log(
    `scopeGarage=true : ${garageResult.count} client(s) mis à jour (sur ${garageCustomerIds.length} clients identifiés via WorkshopEntry/Quote/Invoice GARAGE).`
  );

  console.log("Backfill terminé. isPartner laissé à false (aucune donnée fiable pour l'inférer).");
}

main()
  .catch((err) => {
    console.error("Échec du backfill :", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
