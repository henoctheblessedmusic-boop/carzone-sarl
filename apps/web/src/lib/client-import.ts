/**
 * Import Excel de clients - définitions partagées client/serveur.
 *
 * Le fichier Excel est lu côté navigateur (xlsx), les colonnes sont mappées vers
 * les champs du modèle Customer, puis seules les lignes normalisées sont envoyées
 * à la server action `importClients`.
 */

export const CLIENT_IMPORT_MAX_ROWS = 2000;

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
  let local: string | null = digits.startsWith("229") ? digits.slice(3) : null;
  if (local === null && digits.length === 8) local = digits;
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
