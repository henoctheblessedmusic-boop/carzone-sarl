#!/usr/bin/env node
/**
 * Audit de navigation CARZONE — anti-régression sans dépendance.
 *
 * Vérifie que :
 *  1) tous les href statiques du didacticiel "Premiers pas" (onboarding.ts) et
 *     du menu principal (AppShell.tsx) correspondent à une route réelle sous
 *     apps/web/src/app/**\/page.tsx ;
 *  2) pour chaque étape d'onboarding par rôle, le `requireUser([...])` de la
 *     page de destination autorise bien ce rôle (ou un rôle super-admin).
 *
 * Usage : node scripts/audit-navigation.mjs
 * Exit code 0 si tout est cohérent, 1 sinon.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const WEB_ROOT = path.join(REPO_ROOT, "apps", "web");
const APP_DIR = path.join(WEB_ROOT, "src", "app");
const ONBOARDING_FILE = path.join(WEB_ROOT, "src", "lib", "onboarding.ts");
const APPSHELL_FILE = path.join(WEB_ROOT, "src", "components", "AppShell.tsx");

const SUPER_ADMIN_ROLES = new Set(["DEVELOPER", "DG", "PDG", "SG"]);

/** Liens à ignorer : ancres, externes, API, protocoles non-page. */
function isSkippableHref(href) {
  return (
    !href ||
    href === "#" ||
    href.startsWith("#") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("/api")
  );
}

function stripQueryAndHash(href) {
  return href.split("?")[0].split("#")[0];
}

/** Parcourt récursivement src/app pour trouver tous les page.tsx et en déduire la route. */
function findPageRoutes(dir) {
  const routes = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const info = statSync(fullPath);
    if (info.isDirectory()) {
      routes.push(...findPageRoutes(fullPath));
    } else if (entry === "page.tsx" || entry === "page.ts") {
      const relative = path.relative(APP_DIR, dir).split(path.sep).filter(Boolean);
      const segments = relative.filter((seg) => !/^\(.*\)$/.test(seg));
      const route = "/" + segments.join("/");
      routes.push({ route: route === "/" ? "/" : route, file: fullPath });
    }
  }
  return routes;
}

/** true si href (sans query/hash) correspond à une route statique ou dynamique connue. */
function routeExists(href, pageRoutes) {
  const clean = stripQueryAndHash(href);
  for (const { route } of pageRoutes) {
    if (route === clean) return true;
    // Supporte les routes dynamiques ([id], [...slug]) comme préfixe de correspondance.
    const pattern = "^" + route.replace(/\[[^\]]+\]/g, "[^/]+") + "$";
    if (new RegExp(pattern).test(clean)) return true;
  }
  return false;
}

/** Extrait, pour chaque page.tsx, les rôles autorisés par le requireUser() du composant de PAGE
 * (celui qui suit `export default function`), en ignorant les requireUser() des server actions
 * définies plus haut dans le même fichier. Retourne null si aucune restriction n'est trouvée
 * (page ouverte à tout utilisateur authentifié, ex: /dashboard, /clients, /chat). */
function extractPageRoles(filePath) {
  const content = readFileSync(filePath, "utf8");
  const defaultFnIdx = content.search(/export default (async\s+)?function/);
  if (defaultFnIdx === -1) return null;
  const afterDefault = content.slice(defaultFnIdx);
  const match = afterDefault.match(/requireUser\(\s*\[([^\]]*)\]/);
  if (!match) return null;
  const roles = [...match[1].matchAll(/"([A-Z_]+)"/g)].map((m) => m[1]);
  return roles.length ? roles : null;
}

/** Parse src/lib/onboarding.ts ligne par ligne : regroupe les étapes { id, href } par rôle. */
function extractOnboardingSteps(filePath) {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const steps = [];
  let currentRole = null;
  const roleBlockStart = /^\s*([A-Z_]+):\s*\[\s*$/;
  const stepLine = /\{\s*id:\s*"([^"]+)"\s*,\s*label:\s*"[^"]*"\s*,\s*href:\s*"([^"]+)"/;
  for (const line of lines) {
    const blockMatch = line.match(roleBlockStart);
    if (blockMatch) {
      currentRole = blockMatch[1];
      continue;
    }
    if (currentRole && /^\s*\],\s*$/.test(line)) {
      currentRole = null;
      continue;
    }
    if (currentRole) {
      const stepMatch = line.match(stepLine);
      if (stepMatch) {
        steps.push({ role: currentRole, id: stepMatch[1], href: stepMatch[2] });
      }
    }
  }
  return steps;
}

/** Parse les entrées du menu principal AppShell.tsx (href + roles autorisés). */
function extractAppShellEntries(filePath) {
  const content = readFileSync(filePath, "utf8");
  const navDefsMatch = content.match(/const navDefs = \[([\s\S]*?)\n\];/);
  if (!navDefsMatch) return [];
  const body = navDefsMatch[1];
  const entryRe = /\{\s*href:\s*"([^"]+)"\s*,\s*roles:\s*(null(?:\s+as\s+[^,}]+)?|\[([^\]]*)\])\s*\}/g;
  return [...body.matchAll(entryRe)].map((m) => ({
    href: m[1],
    roles: m[2].startsWith("null") ? null : [...m[3].matchAll(/"([A-Z_]+)"/g)].map((x) => x[1]),
  }));
}

function main() {
  const pageRoutes = findPageRoutes(APP_DIR);
  const onboardingSteps = extractOnboardingSteps(ONBOARDING_FILE);
  const appShellEntries = extractAppShellEntries(APPSHELL_FILE);

  const failures = [];

  // (c) Vérification des liens morts (onboarding + menu).
  const allHrefs = [
    ...onboardingSteps.map((s) => ({ href: s.href, source: `onboarding.${s.role}.${s.id}` })),
    ...appShellEntries.map(({ href }) => ({ href, source: "AppShell.navDefs" })),
  ];
  for (const { href, source } of allHrefs) {
    if (isSkippableHref(href)) continue;
    if (!routeExists(href, pageRoutes)) {
      failures.push(`[LIEN MORT] ${source} -> "${href}" ne correspond à aucune route sous src/app`);
    }
  }

  // (d) Vérification rôle onboarding <-> requireUser() de la page cible.
  const pageRolesCache = new Map();
  for (const step of onboardingSteps) {
    if (isSkippableHref(step.href)) continue;
    const clean = stripQueryAndHash(step.href);
    const target = pageRoutes.find(
      ({ route }) =>
        route === clean ||
        new RegExp("^" + route.replace(/\[[^\]]+\]/g, "[^/]+") + "$").test(clean)
    );
    if (!target) continue; // déjà signalé comme lien mort ci-dessus

    if (!pageRolesCache.has(target.file)) {
      pageRolesCache.set(target.file, extractPageRoles(target.file));
    }
    const allowedRoles = pageRolesCache.get(target.file);

    if (allowedRoles === null) continue; // page ouverte à tout utilisateur authentifié
    if (SUPER_ADMIN_ROLES.has(step.role)) continue; // bypass super-admin
    if (!allowedRoles.includes(step.role)) {
      failures.push(
        `[RÔLE BLOQUÉ] onboarding.${step.role}.${step.id} -> "${step.href}" : requireUser() de ` +
          `${path.relative(REPO_ROOT, target.file)} n'autorise pas le rôle ${step.role} ` +
          `(rôles autorisés : ${allowedRoles.join(", ")})`
      );
    }
  }

  // (e) Vérification rôle menu <-> requireUser() de la page cible.
  for (const entry of appShellEntries) {
    if (isSkippableHref(entry.href) || !entry.roles) continue;
    const clean = stripQueryAndHash(entry.href);
    const target = pageRoutes.find(
      ({ route }) =>
        route === clean ||
        new RegExp("^" + route.replace(/\[[^\]]+\]/g, "[^/]+") + "$").test(clean)
    );
    if (!target) continue; // lien mort déjà signalé
    if (!pageRolesCache.has(target.file)) {
      pageRolesCache.set(target.file, extractPageRoles(target.file));
    }
    const allowedRoles = pageRolesCache.get(target.file);
    if (allowedRoles === null) continue;
    for (const role of entry.roles) {
      if (SUPER_ADMIN_ROLES.has(role)) continue;
      if (!allowedRoles.includes(role)) {
        failures.push(
          `[MENU RÔLE BLOQUÉ] AppShell ${entry.href} -> requireUser() de ` +
            `${path.relative(REPO_ROOT, target.file)} n'autorise pas le rôle ${role} ` +
            `(rôles autorisés : ${allowedRoles.join(", ")})`
        );
      }
    }
  }

  console.log(`Routes détectées : ${pageRoutes.length}`);
  console.log(`Étapes d'onboarding analysées : ${onboardingSteps.length}`);
  console.log(`Liens de menu analysés : ${appShellEntries.length}`);
  console.log("");

  if (failures.length > 0) {
    console.error(`ÉCHEC — ${failures.length} problème(s) détecté(s) :\n`);
    for (const f of failures) console.error(" - " + f);
    process.exit(1);
  }

  console.log("OK — aucun lien mort ni rôle bloqué détecté dans le didacticiel ou le menu.");
  process.exit(0);
}

main();
