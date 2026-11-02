#!/usr/bin/env node
/**
 * Audit de cohérence des rôles CARZONE — complète audit-navigation.mjs.
 *
 * audit-navigation.mjs vérifie déjà : liens morts (onboarding + menu) et
 * rôle onboarding/menu <-> requireUser() de la page cible.
 *
 * Ce script ajoute la 3e vérification demandée : rôles des pages <-> rôles des
 * server actions des modules clés. Pour chaque module, on vérifie que les rôles
 * "essentiels" (COMPTA_GARAGE, ASSISTANTE_COMPTABLE) autorisés sur la page le
 * sont aussi sur les actions d'écriture/transition de ce module (hors
 * suppression/forçage, légitimement réservées à des rôles plus restreints par
 * règle métier documentée dans le code).
 *
 * Usage : node scripts/audit-role-coherence.mjs
 * Exit code 0 si aucune incohérence essentielle détectée, 1 sinon.
 * Les incohérences résiduelles connues (hors scope, cf. memory CARZONE RBAC)
 * sont affichées en avertissement (WARN) sans faire échouer le script.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const WEB_ROOT = path.join(REPO_ROOT, "apps", "web");
const SRC = path.join(WEB_ROOT, "src");

const SUPER_ADMIN_ROLES = new Set(["DEVELOPER", "DG", "PDG", "SG"]);

/** Fonctions exclues de la vérification : suppression/forçage, réservées par
 * règle métier à des rôles plus restreints (ce n'est pas une incohérence). */
const EXCLUDED_FN_PREFIXES = ["delete", "force", "toggle", "void", "cancel", "certify"];

/** Rôles "essentiels" pour cette passe : le périmètre explicitement demandé
 * par le client (COMPTA_GARAGE) + un rôle de cohérence additionnel observé
 * comme concerné par les mêmes modules garage (ASSISTANTE_COMPTABLE). */
const ESSENTIAL_ROLES = ["COMPTA_GARAGE", "ASSISTANTE_COMPTABLE"];

/** Modules à vérifier : page de garde + fichier(s) d'actions serveur. */
const MODULES = [
  {
    name: "workshop",
    pageFile: path.join(SRC, "app", "workshop", "page.tsx"),
    actionFiles: [path.join(SRC, "app", "workshop", "actions.ts")],
    extraPageFiles: [
      path.join(SRC, "app", "workshop", "[id]", "fiche-intervention", "page.tsx"),
      path.join(SRC, "app", "workshop", "[id]", "fiche-entretien", "page.tsx"),
    ],
  },
  {
    name: "parts",
    pageFile: path.join(SRC, "app", "parts", "page.tsx"),
    actionFiles: [path.join(SRC, "app", "parts", "actions.ts")],
  },
  {
    name: "delivery-notes",
    pageFile: path.join(SRC, "app", "delivery-notes", "page.tsx"),
    actionFiles: [path.join(SRC, "app", "delivery-notes", "actions.ts")],
  },
  {
    name: "quotes",
    pageFile: path.join(SRC, "app", "quotes", "page.tsx"),
    actionFiles: [path.join(SRC, "app", "quotes", "actions.ts")],
  },
  {
    name: "invoices",
    pageFile: path.join(SRC, "app", "invoices", "page.tsx"),
    actionFiles: [path.join(SRC, "app", "invoices", "actions.ts")],
  },
];

/** Parse les `const NOM = [...]` / `const NOM: Role[] = [...]` de premier niveau
 * d'un fichier, pour résoudre les tableaux de rôles référencés par identifiant
 * (ex: requireUser([...WORKSHOP_ALLOWED_ROLES]) ou requireUser(AUTHORIZED_ROLES)). */
function parseConstArrays(content) {
  const map = new Map();
  const re = /const\s+([A-Z][A-Z0-9_]*)\s*(?::[^=]+)?=\s*\[([^\]]*)\]/g;
  for (const m of content.matchAll(re)) {
    const roles = [...m[2].matchAll(/"([A-Z_]+)"/g)].map((x) => x[1]);
    if (roles.length) map.set(m[1], roles);
  }
  return map;
}

/** Résout le contenu d'un appel requireUser(...) en liste de rôles, en
 * suivant soit un tableau inline, soit un spread/identifiant de const résolu
 * via `constArrays`. Retourne null si la restriction n'a pas pu être résolue
 * (ex: requireUser() sans argument -> page ouverte, pas une incohérence). */
function resolveRequireUserArg(arg, constArrays) {
  const trimmed = arg.trim();
  if (trimmed.startsWith("[")) {
    const inline = [...trimmed.matchAll(/"([A-Z_]+)"/g)].map((x) => x[1]);
    if (inline.length) return inline;
    const spreadMatch = trimmed.match(/\.\.\.([A-Z][A-Z0-9_]*)/);
    if (spreadMatch) return constArrays.get(spreadMatch[1]) || null;
    return null;
  }
  const identMatch = trimmed.match(/^([A-Z][A-Z0-9_]*)$/);
  if (identMatch) return constArrays.get(identMatch[1]) || null;
  return null;
}

/** Extrait, pour chaque fonction exportée (page par défaut OU `export async
 * function NAME`), le premier appel requireUser(...) rencontré dans son corps. */
function extractFunctionRoles(filePath) {
  const content = readFileSync(filePath, "utf8");
  const constArrays = parseConstArrays(content);
  const results = [];

  // Composant de page par défaut.
  const defaultIdx = content.search(/export default (async\s+)?function/);
  if (defaultIdx !== -1) {
    const body = content.slice(defaultIdx);
    const call = body.match(/requireUser\(\s*(\[[^\]]*\]|[A-Z][A-Z0-9_]*)?\s*\)/);
    if (call && call[1]) {
      results.push({ name: "<page>", roles: resolveRequireUserArg(call[1], constArrays) });
    }
  }

  // Fonctions exportées nommées (server actions).
  const fnRe = /export async function ([a-zA-Z0-9_]+)\s*\(/g;
  const matches = [...content.matchAll(fnRe)];
  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1];
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const body = content.slice(start, end);
    const call = body.match(/requireUser\(\s*(\[[^\]]*\]|[A-Z][A-Z0-9_]*)?\s*\)/);
    if (call && call[1]) {
      results.push({ name, roles: resolveRequireUserArg(call[1], constArrays) });
    } else {
      results.push({ name, roles: null }); // pas de restriction résolue -> ignoré
    }
  }

  return results;
}

function main() {
  const failures = [];
  const warnings = [];

  for (const mod of MODULES) {
    const pageFiles = [mod.pageFile, ...(mod.extraPageFiles || [])];
    const pageRoleSets = pageFiles.map((f) => {
      const entries = extractFunctionRoles(f);
      const pageEntry = entries.find((e) => e.name === "<page>");
      return { file: f, roles: pageEntry ? pageEntry.roles : null };
    });

    for (const essentialRole of ESSENTIAL_ROLES) {
      // 1) Le rôle doit être autorisé sur AU MOINS une des pages du module pour
      //    que la vérification des actions ait un sens (sinon rien à signaler ici
      //    : le cas "page bloque déjà" est couvert par audit-navigation.mjs).
      const allowedOnAnyPage = pageRoleSets.some(
        ({ roles }) => roles === null || roles.includes(essentialRole)
      );
      if (!allowedOnAnyPage) continue;

      // Les pages du module qui EXCLUENT ce rôle alors qu'une autre page du même
      // module l'autorise sont signalées (régression directe du type "fiche-intervention").
      for (const { file, roles } of pageRoleSets) {
        if (roles !== null && !roles.includes(essentialRole)) {
          failures.push(
            `[PAGE] ${path.relative(REPO_ROOT, file)} n'autorise pas ${essentialRole} ` +
              `alors qu'une autre page du module "${mod.name}" l'autorise.`
          );
        }
      }

      // 2) Les actions d'écriture/transition du module doivent aussi l'autoriser.
      for (const actionFile of mod.actionFiles) {
        const fnEntries = extractFunctionRoles(actionFile).filter((e) => e.name !== "<page>");
        for (const { name, roles } of fnEntries) {
          if (roles === null) continue; // restriction non résolue statiquement : ignoré
          if (EXCLUDED_FN_PREFIXES.some((p) => name.toLowerCase().startsWith(p))) continue;
          if (!roles.includes(essentialRole)) {
            failures.push(
              `[ACTION] ${path.relative(REPO_ROOT, actionFile)} :: ${name}() n'autorise pas ` +
                `${essentialRole}, alors que la page du module "${mod.name}" l'autorise ` +
                `(rôles actuels : ${roles.join(", ")}).`
            );
          }
        }
      }
    }
  }

  // Les anciennes dérives menu/page (/catalog, /imports, /opportunities, /leads)
  // ont été corrigées en alignant le menu sur les gardes réelles ; elles sont
  // désormais couvertes par audit-navigation.mjs (rôles menu <-> requireUser).

  console.log(`Modules analysés : ${MODULES.length}`);
  console.log(`Rôles essentiels vérifiés : ${ESSENTIAL_ROLES.join(", ")}`);
  console.log("");

  if (warnings.length > 0) {
    console.log(`AVERTISSEMENT — ${warnings.length} drift(s) résiduel(s) connu(s), hors scope :`);
    for (const w of warnings) console.log(" - " + w);
    console.log("");
  }

  if (failures.length > 0) {
    console.error(`ÉCHEC — ${failures.length} incohérence(s) essentielle(s) détectée(s) :\n`);
    for (const f of failures) console.error(" - " + f);
    process.exit(1);
  }

  console.log("OK — aucune incohérence essentielle détectée pour COMPTA_GARAGE / ASSISTANTE_COMPTABLE.");
  process.exit(0);
}

main();
