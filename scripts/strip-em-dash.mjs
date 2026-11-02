#!/usr/bin/env node
/**
 * RÈGLE PRIMORDIALE CARZONE : le tiret cadratin U+2014 ("-") est interdit.
 * Ce script le remplace par le tiret simple "-" dans tous les fichiers texte
 * du dépôt (hors dépendances, builds et artefacts).
 *
 * Usage : node scripts/strip-em-dash.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FORBIDDEN = "\u2014";
const REPLACEMENT = "-";

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
    if (info.isDirectory()) {
      walk(full, files);
    } else if (TEXT_EXTENSIONS.has(path.extname(entry).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(ROOT);
let changedFiles = 0;
let removed = 0;

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!content.includes(FORBIDDEN)) continue;
  const occurrences = content.split(FORBIDDEN).length - 1;
  removed += occurrences;
  changedFiles += 1;
  writeFileSync(file, content.split(FORBIDDEN).join(REPLACEMENT), "utf8");
  console.log(`${occurrences} occurrence(s) : ${path.relative(ROOT, file)}`);
}

console.log(`\n${changedFiles} fichier(s), ${removed} tiret(s) cadratin(s) remplacé(s) par "-".`);
process.exit(removed > 0 ? 0 : 0);
