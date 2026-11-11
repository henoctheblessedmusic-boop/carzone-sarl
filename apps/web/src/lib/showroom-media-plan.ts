/**
 * Planification des médias showroom.
 *
 * Ce module ne lit pas le disque et n'écrit pas en base : il transforme une
 * liste de fichiers en plan vérifiable. L'import réel restera séparé pour
 * pouvoir brancher le stockage sans changer les règles de nommage.
 */

export type ShowroomMediaKind = "CANVAS" | "SPIN_EXTERIOR" | "INTERIOR_PANORAMA" | "DETAIL";

export type ShowroomMediaPlanEntry = {
  configurationCode: string;
  kind: ShowroomMediaKind;
  slot: string;
  frameIndex: number;
  relativePath: string;
};

export type ShowroomFolderInput = {
  configurationCode: string;
  files: string[];
};

export type ShowroomMediaPlan = {
  entries: ShowroomMediaPlanEntry[];
  warnings: string[];
  folders: number;
};

const IMAGE_EXTENSION = /\.(jpe?g|png|webp)$/i;
const CANVAS_FILE = /^CFG-\d{2}_C(\d{2})\.(jpe?g|png|webp)$/i;
const SPIN_FILE = /^(\d{2,3})\.(jpe?g|png|webp)$/i;
const CONFIG_CODE = /^CFG-\d{2}$/i;

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function basename(value: string): string {
  const normalized = normalizePath(value);
  return normalized.slice(normalized.lastIndexOf("/") + 1);
}

/**
 * Transforme un fichier d'un dossier de configuration en média planifié.
 * Retourne null si le fichier ne suit pas une convention connue.
 */
export function parseShowroomMediaFile(
  configurationCode: string,
  relativePath: string,
): ShowroomMediaPlanEntry | null {
  if (!CONFIG_CODE.test(configurationCode)) return null;
  if (!IMAGE_EXTENSION.test(relativePath)) return null;

  const normalized = normalizePath(relativePath);
  const name = basename(normalized);

  const canvas = name.match(CANVAS_FILE);
  if (canvas) {
    const slotNumber = Number(canvas[1]);
    if (slotNumber < 1 || slotNumber > 10) return null;
    return {
      configurationCode,
      kind: "CANVAS",
      slot: `C${String(slotNumber).padStart(2, "0")}`,
      frameIndex: -1,
      relativePath: normalized,
    };
  }

  if (normalized.toLowerCase().includes("360/") && !normalized.toLowerCase().includes("intérieur")) {
    const spin = name.match(SPIN_FILE);
    if (!spin) return null;
    const frame = Number(spin[1]) - 1;
    if (frame < 0 || frame >= 36) return null;
    return {
      configurationCode,
      kind: "SPIN_EXTERIOR",
      slot: "NA",
      frameIndex: frame,
      relativePath: normalized,
    };
  }

  if (normalized.toLowerCase().includes("intérieur 360/")) {
    if (name.toLowerCase().startsWith("panorama")) {
      return {
        configurationCode,
        kind: "INTERIOR_PANORAMA",
        slot: "NA",
        frameIndex: -1,
        relativePath: normalized,
      };
    }
    return {
      configurationCode,
      kind: "DETAIL",
      slot: "NA",
      frameIndex: -1,
      relativePath: normalized,
    };
  }

  return null;
}

export function buildShowroomMediaPlan(folders: ShowroomFolderInput[]): ShowroomMediaPlan {
  const entries: ShowroomMediaPlanEntry[] = [];
  const warnings: string[] = [];

  for (const folder of folders) {
    if (!CONFIG_CODE.test(folder.configurationCode)) {
      warnings.push(`Dossier ignore, code de configuration invalide: ${folder.configurationCode}`);
      continue;
    }
    for (const file of folder.files) {
      const entry = parseShowroomMediaFile(folder.configurationCode, file);
      if (!entry) {
        warnings.push(`Fichier ignore, convention inconnue: ${folder.configurationCode}/${file}`);
        continue;
      }
      entries.push(entry);
    }
  }

  return { entries, warnings, folders: folders.length };
}

export function countByKind(entries: readonly ShowroomMediaPlanEntry[]): Record<ShowroomMediaKind, number> {
  return entries.reduce<Record<ShowroomMediaKind, number>>(
    (acc, entry) => {
      acc[entry.kind] += 1;
      return acc;
    },
    { CANVAS: 0, SPIN_EXTERIOR: 0, INTERIOR_PANORAMA: 0, DETAIL: 0 },
  );
}
