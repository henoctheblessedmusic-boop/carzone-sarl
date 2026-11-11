/**
 * Plan d'import des medias showroom.
 *
 * Usage :
 *   npm run media:plan
 *   npm run media:plan -- --root "C:\...\Photos showroom Carzone" --json
 *
 * Le script ne copie aucun fichier et n'ecrit rien en base. Il produit un
 * manifeste verifiable des dossiers CFG-XX et des fichiers reconnus.
 */

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import {
  buildShowroomMediaPlan,
  countByKind,
  type ShowroomFolderInput,
} from "../src/lib/showroom-media-plan";

const DEFAULT_ROOT = "C:\\Users\\IGOR_GIANI\\Desktop\\Catalogue voitures chinoises\\Photos showroom Carzone";

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || null : null;
}

async function readFiles(root: string, directory: string): Promise<string[]> {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readFiles(root, relative)));
    } else if (entry.isFile()) {
      files.push(relative.replaceAll("\\", "/"));
    }
  }
  return files;
}

async function main() {
  const root = argValue("--root") || process.env.SHOWROOM_MEDIA_ROOT || DEFAULT_ROOT;
  const json = process.argv.includes("--json");

  try {
    const info = await stat(root);
    if (!info.isDirectory()) throw new Error("Ce chemin n'est pas un dossier");
  } catch {
    console.error(`Dossier showroom introuvable : ${root}`);
    process.exit(1);
  }

  const folders: ShowroomFolderInput[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^(CFG-\d{2})/i);
    if (!match) continue;
    folders.push({
      configurationCode: match[1].toUpperCase(),
      files: await readFiles(root, entry.name),
    });
  }
  folders.sort((a, b) => a.configurationCode.localeCompare(b.configurationCode));

  const plan = buildShowroomMediaPlan(folders);
  const summary = {
    root,
    folders: plan.folders,
    files: plan.entries.length,
    byKind: countByKind(plan.entries),
    warnings: plan.warnings,
    entries: plan.entries,
  };

  if (json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(`Dossier : ${root}`);
  console.log(`Configurations : ${summary.folders}`);
  console.log(`Fichiers reconnus : ${summary.files}`);
  console.log(`Canevas : ${summary.byKind.CANVAS}`);
  console.log(`Vues 360 : ${summary.byKind.SPIN_EXTERIOR}`);
  console.log(`Panoramas interieurs : ${summary.byKind.INTERIOR_PANORAMA}`);
  console.log(`Details : ${summary.byKind.DETAIL}`);
  if (summary.warnings.length > 0) {
    console.log(`Avertissements : ${summary.warnings.length}`);
    for (const warning of summary.warnings.slice(0, 20)) console.log(`- ${warning}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
