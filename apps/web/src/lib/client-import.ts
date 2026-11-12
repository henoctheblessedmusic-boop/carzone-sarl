/**
 * Import Excel de clients - définitions partagées client/serveur.
 *
 * Le fichier Excel est lu côté navigateur (xlsx), les colonnes sont mappées vers
 * les champs du modèle Customer, puis seules les lignes normalisées sont envoyées
 * à la server action `importClients`.
 */

/**
 * Nombre maximal de lignes acceptees par appel a `importClients`. Les gros
 * fichiers sont decoupes en lots de cette taille cote navigateur : un envoi
 * unique de plusieurs milliers de lignes depassait la limite de corps des
 * server actions et faisait echouer l'import avec une erreur opaque.
 */
export const CLIENT_IMPORT_BATCH_SIZE = 400;

/** Nombre maximal de lignes lues dans un fichier (toutes feuilles confondues). */
export const CLIENT_IMPORT_MAX_ROWS = 20000;

/** Nombre de lignes inspectees pour retrouver la ligne d'en-tetes. */
export const CLIENT_IMPORT_HEADER_SCAN_ROWS = 15;

export type ClientImportFieldKey =
  | "contactName"
  | "companyName"
  | "email"
  | "phone"
  | "city"
  | "address"
  | "ifu"
  | "category"
  | "notes";

export type ClientImportField = {
  key: ClientImportFieldKey;
  label: string;
  required?: boolean;
  aliases: string[];
  placeholder: string;
};

export const CLIENT_IMPORT_FIELDS: ClientImportField[] = [
  {
    key: "contactName",
    label: "Nom du contact",
    required: true,
    aliases: ["nom", "nom du contact", "contact", "client", "nom complet", "name", "full name", "fullname", "contact name"],
    placeholder: "Ex. Jean Dossou",
  },
  {
    key: "companyName",
    label: "Société",
    aliases: ["societe", "société", "entreprise", "company", "raison sociale", "company name"],
    placeholder: "Ex. Dossou Transit SARL",
  },
  {
    key: "email",
    label: "E-mail",
    aliases: ["email", "e-mail", "mail", "courriel", "adresse email", "adresse e-mail"],
    placeholder: "Ex. jean.dossou@example.com",
  },
  {
    key: "phone",
    label: "Téléphone",
    aliases: ["telephone", "téléphone", "tel", "tél", "phone", "mobile", "numero", "numéro", "contact téléphonique"],
    placeholder: "Ex. +229 01 97 00 00 00",
  },
  {
    key: "city",
    label: "Ville",
    aliases: ["ville", "city", "localite", "localité", "commune"],
    placeholder: "Cotonou",
  },
  {
    key: "address",
    label: "Adresse",
    aliases: ["adresse", "address", "adresse postale", "quartier", "localisation"],
    placeholder: "Ex. Zone Maro-Militaire",
  },
  {
    key: "ifu",
    label: "IFU",
    aliases: ["ifu", "numero ifu", "numéro ifu", "nif", "identifiant fiscal"],
    placeholder: "Ex. 3202496111617",
  },
  {
    key: "category",
    label: "Catégorie",
    aliases: ["categorie", "catégorie", "category", "type", "type de client", "segment"],
    placeholder: "Particulier / Entreprise / ONG / Flotte",
  },
  {
    key: "notes",
    label: "Notes",
    aliases: ["notes", "note", "commentaire", "observations", "remarques"],
    placeholder: "Commentaire libre",
  },
];

export type ClientImportPayloadRow = Record<ClientImportFieldKey, string>;

export type ClientImportResult = {
  created: number;
  skippedDuplicates: number;
  invalid: number;
  total: number;
  errors: { row: number; message: string }[];
};

export function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Nombre de colonnes reconnues dans une ligne candidate aux en-têtes.
 * Sert à distinguer la vraie ligne d'en-têtes d'un titre de classeur placé
 * au-dessus (cas courant : « LISTE CLIENTS CARZONE » en première ligne).
 */
export function headerScore(cells: string[]): number {
  const normalized = cells
    .map((cell) => normalizeHeader(String(cell ?? "")))
    .filter((cell) => cell !== "");
  if (normalized.length < 2) return 0;

  let score = 0;
  for (const field of CLIENT_IMPORT_FIELDS) {
    const candidates = [field.label, ...field.aliases].map(normalizeHeader);
    if (normalized.some((cell) => candidates.includes(cell))) score += 1;
  }
  return score;
}

/**
 * Index de la ligne d'en-têtes dans une matrice de cellules.
 * On retient la ligne qui reconnaît le plus de colonnes ; à défaut, la première
 * ligne non vide, comme avant.
 */
export function detectHeaderRowIndex(matrix: string[][]): number {
  let bestIndex = -1;
  let bestScore = 0;
  const limit = Math.min(matrix.length, CLIENT_IMPORT_HEADER_SCAN_ROWS);

  for (let index = 0; index < limit; index += 1) {
    const score = headerScore(matrix[index] ?? []);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }
  if (bestIndex >= 0) return bestIndex;

  return matrix.findIndex((row) => (row ?? []).some((cell) => String(cell ?? "").trim() !== ""));
}

/** Rend uniques des en-têtes dupliqués ou vides, en conservant leur ordre. */
export function buildUniqueHeaders(cells: string[]): string[] {
  const unique: string[] = [];
  cells.forEach((cell, index) => {
    const label = String(cell ?? "").trim() || `Colonne ${index + 1}`;
    let candidate = label;
    let suffix = 2;
    while (unique.includes(candidate)) {
      candidate = `${label} (${suffix})`;
      suffix += 1;
    }
    unique.push(candidate);
  });
  return unique;
}

export function autoMapHeaders(headers: string[]): Partial<Record<ClientImportFieldKey, string>> {
  const mapping: Partial<Record<ClientImportFieldKey, string>> = {};
  const normalized = headers.map((h) => ({ raw: h, norm: normalizeHeader(h) }));

  for (const field of CLIENT_IMPORT_FIELDS) {
    const exact = normalized.find((h) => h.norm === normalizeHeader(field.label));
    const alias = normalized.find((h) => field.aliases.some((a) => h.norm === normalizeHeader(a)));
    const contains = normalized.find((h) => field.aliases.some((a) => h.norm.includes(normalizeHeader(a))));
    const chosen = exact ?? alias ?? contains;
    if (chosen) mapping[field.key] = chosen.raw;
  }

  // Le nom du contact est indispensable : si aucune colonne évidente, on prend la
  // première colonne non déjà utilisée (cas fréquent des fichiers « Nom;Téléphone… »).
  if (!mapping.contactName && headers.length > 0) {
    const used = new Set(Object.values(mapping));
    const firstFree = headers.find((h) => !used.has(h));
    if (firstFree) mapping.contactName = firstFree;
  }

  return mapping;
}

export function normalizeEmail(value: string | null | undefined): string | null {
  const email = (value ?? "").trim().toLowerCase();
  return email || null;
}

export function normalizePhone(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  // Bénin : les numéros locaux sont désormais à 10 chiffres et commencent par 01.
  // Les anciens numéros à 8 chiffres sont automatiquement préfixés par 01.
  // Un numéro déjà saisi au format local (0197112233) doit être reconnu au même
  // titre qu'un numéro indicatif compris (+229 01 97 11 22 33), faute de quoi le
  // même abonné était enregistré deux fois sous deux écritures différentes.
  let local: string | null = digits.startsWith("229") ? digits.slice(3) : null;
  if (local === null && (digits.length === 8 || (digits.length === 10 && digits.startsWith("01")))) {
    local = digits;
  }
  if (local !== null) {
    if (local.length === 8) local = `01${local}`;
    if (local.length === 10 && local.startsWith("01")) {
      return `+229 ${local.match(/.{1,2}/g)?.join(" ")}`;
    }
  }

  // Conserve un éventuel + initial pour les numéros internationaux.
  const plus = raw.startsWith("+") ? "+" : "";
  return `${plus}${digits}`;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildTemplateRows(): string[][] {
  return [
    CLIENT_IMPORT_FIELDS.map((f) => f.label),
    [
      "Jean Dossou",
      "Dossou Transit SARL",
      "jean.dossou@example.com",
      "+229 01 97 00 00 00",
      "Cotonou",
      "Zone Maro-Militaire",
      "3202496111617",
      "Entreprise",
      "Client existant importé depuis Excel",
    ],
    [
      "Awa Bio",
      "",
      "awa.bio@example.com",
      "+229 01 96 00 00 00",
      "Porto-Novo",
      "",
      "",
      "Particulier",
      "",
    ],
  ];
}
