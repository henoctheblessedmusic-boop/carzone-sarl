#!/usr/bin/env node
/**
 * RÈGLE PRIMORDIALE CARZONE : tiret cadratin (U+2014) interdit.
 * Vérifie tous les fichiers texte du dépôt (hors dépendances, builds et artefacts).
 *
 * Usage : node scripts/check-no-em-dash.mjs
 * Exit code 1 si au moins une occurrence est trouvée.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FORBIDDEN = "\u2014";

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", ".dsh", ".vercel", "out", "dist", "coverage",
  ".turbo", ".cache", "build", "tmp",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".css", ".scss", ".sass", ".less",
  ".md", ".mdx", ".txt", ".json", ".prisma", ".sql",
  ".html", ".htm", ".yml", ".yaml", ".xml", ".svg", ".csv",
]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) walk(full, files);
    else if (TEXT_EXTENSIONS.has(path.extname(entry).toLowerCase())) files.push(full);
  }
  return files;
}

const failures = [];
for (const file of walk(ROOT)) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!content.includes(FORBIDDEN)) continue;
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    if (line.includes(FORBIDDEN)) {
      failures.push(`${path.relative(ROOT, file)}:${index + 1}`);
    }
  });
}

if (failures.length > 0) {
  console.error(`ÉCHEC - ${failures.length} occurrence(s) de tiret cadratin (U+2014) détectée(s) :`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("OK - aucun tiret cadratin (U+2014) dans les fichiers texte.");
process.exit(0);
