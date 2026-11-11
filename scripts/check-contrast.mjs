#!/usr/bin/env node
/**
 * Verifie le contraste WCAG des jetons semantiques declares dans apps/web/src/app/globals.css.
 * Lit le bloc sombre (:root) et le bloc clair (html[data-theme="light"]), resout les var()
 * internes, puis controle chaque paire texte/surface declaree dans PAIRS.
 *
 * Usage : node scripts/check-contrast.mjs
 * Sortie : tableau des ratios par theme, code de sortie 1 si une paire echoue.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = join(here, "..", "apps", "web", "src", "app", "styles", "tokens.css");

const TEXT_MIN = 4.5;
const LARGE_MIN = 3;

/** Paires a verifier : [jetonTexte, jetonFond, seuil, libelle metier] */
const PAIRS = [
  ["--text-strong", "--surface", TEXT_MIN, "Titre sur carte"],
  ["--text-strong", "--surface-base", TEXT_MIN, "Titre sur fond de page"],
  ["--text", "--surface", TEXT_MIN, "Texte courant sur carte"],
  ["--text", "--surface-base", TEXT_MIN, "Texte courant sur fond de page"],
  ["--text", "--surface-soft", TEXT_MIN, "Texte courant sur surface douce"],
  ["--text", "--surface-sunken", TEXT_MIN, "Texte courant sur surface creusee"],
  ["--text", "--surface-raised", TEXT_MIN, "Texte courant sur surface elevee"],
  ["--text-muted", "--surface", TEXT_MIN, "Texte secondaire sur carte"],
  ["--text-muted", "--surface-base", TEXT_MIN, "Texte secondaire sur fond de page"],
  ["--text-muted", "--surface-soft", TEXT_MIN, "Texte secondaire sur surface douce"],
  ["--text-muted", "--surface-sunken", TEXT_MIN, "Texte secondaire sur surface creusee"],
  ["--text-subtle", "--surface", TEXT_MIN, "Texte tertiaire sur carte"],
  ["--text-subtle", "--surface-soft", TEXT_MIN, "Texte tertiaire sur surface douce"],
  ["--text-disabled", "--surface", LARGE_MIN, "Texte desactive sur carte"],
  ["--text-on-accent", "--accent", TEXT_MIN, "Texte sur bouton primaire"],
  ["--text-on-accent", "--accent-solid", TEXT_MIN, "Texte sur aplat accent sature"],
  ["--text-on-accent", "--danger-solid", TEXT_MIN, "Texte sur bouton danger"],
  ["--text-on-accent", "--success-solid", TEXT_MIN, "Texte sur aplat succes sature"],
  ["--text-on-accent", "--info-solid", TEXT_MIN, "Texte sur aplat info sature"],
  ["--text-on-accent", "--warning-solid", TEXT_MIN, "Texte sur aplat alerte sature"],
  ["--text-on-accent", "--purple-solid", TEXT_MIN, "Texte sur aplat violet sature"],
  ["--text-on-accent", "--gold-solid", TEXT_MIN, "Texte sur aplat or sature"],
  ["--text-on-inverse", "--surface-inverse", TEXT_MIN, "Texte sur bandeau inverse"],
  ["--text-muted-on-inverse", "--surface-inverse", TEXT_MIN, "Texte secondaire sur bandeau inverse"],
  ["--accent-fg", "--surface", TEXT_MIN, "Lien accent sur carte"],
  ["--accent-fg", "--surface-base", TEXT_MIN, "Lien accent sur fond de page"],
  ["--accent-fg", "--accent-soft", TEXT_MIN, "Accent sur pastille accent"],
  ["--success-fg", "--surface", TEXT_MIN, "Montant encaisse sur carte"],
  ["--success-fg", "--surface-base", TEXT_MIN, "Montant encaisse sur fond de page"],
  ["--success-fg", "--success-soft", TEXT_MIN, "Succes sur pastille succes"],
  ["--warning-fg", "--surface", TEXT_MIN, "Alerte sur carte"],
  ["--warning-fg", "--surface-base", TEXT_MIN, "Alerte sur fond de page"],
  ["--warning-fg", "--warning-soft", TEXT_MIN, "Alerte sur pastille alerte"],
  ["--danger-fg", "--surface", TEXT_MIN, "Danger sur carte"],
  ["--danger-fg", "--surface-base", TEXT_MIN, "Danger sur fond de page"],
  ["--danger-fg", "--danger-soft", TEXT_MIN, "Danger sur pastille danger"],
  ["--info-fg", "--surface", TEXT_MIN, "Info sur carte"],
  ["--info-fg", "--surface-base", TEXT_MIN, "Info sur fond de page"],
  ["--info-fg", "--info-soft", TEXT_MIN, "Info sur pastille info"],
  ["--purple-fg", "--surface", TEXT_MIN, "Violet sur carte"],
  ["--purple-fg", "--purple-soft", TEXT_MIN, "Violet sur pastille violette"],
  ["--gold-fg", "--surface", TEXT_MIN, "Or sur carte"],
  ["--gold-fg", "--surface-base", TEXT_MIN, "Or sur fond de page"],
  ["--gold-fg", "--gold-soft", TEXT_MIN, "Or sur pastille or"],
  ["--text-on-brand", "--brand", TEXT_MIN, "Texte sur bouton de marque"],
  // Elements graphiques, bordures et series de graphiques : seuil 3:1
  ["--border-strong", "--surface", LARGE_MIN, "Bordure marquee sur carte"],
  ["--focus-ring", "--surface", LARGE_MIN, "Anneau de focus sur carte"],
  ["--focus-ring", "--surface-base", LARGE_MIN, "Anneau de focus sur fond de page"],
  ["--accent", "--surface", LARGE_MIN, "Aplat accent sur carte"],
  ["--success", "--surface", LARGE_MIN, "Aplat succes sur carte"],
  ["--warning", "--surface", LARGE_MIN, "Aplat alerte sur carte"],
  ["--danger", "--surface", LARGE_MIN, "Aplat danger sur carte"],
  ["--info", "--surface", LARGE_MIN, "Aplat info sur carte"],
  ["--purple", "--surface", LARGE_MIN, "Aplat violet sur carte"],
  ["--chart-1", "--surface", LARGE_MIN, "Serie graphique 1"],
  ["--chart-2", "--surface", LARGE_MIN, "Serie graphique 2"],
  ["--chart-3", "--surface", LARGE_MIN, "Serie graphique 3"],
  ["--chart-4", "--surface", LARGE_MIN, "Serie graphique 4"],
  ["--chart-5", "--surface", LARGE_MIN, "Serie graphique 5"],
  ["--chart-6", "--surface", LARGE_MIN, "Serie graphique 6"],
  ["--chart-7", "--surface", LARGE_MIN, "Serie graphique 7"],
  ["--chart-8", "--surface", LARGE_MIN, "Serie graphique 8"],
];

function extractBlock(css, selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error("Bloc introuvable : " + selector);
  const open = css.indexOf("{", start);
  let depth = 0;
  let i = open;
  for (; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return css.slice(open + 1, i);
}

function parseVars(block) {
  const out = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m = re.exec(block);
  while (m) {
    out.set(m[1], m[2].trim());
    m = re.exec(block);
  }
  return out;
}

function resolve(vars, name, seen) {
  const visited = seen || new Set();
  if (visited.has(name)) return null;
  visited.add(name);
  const raw = vars.get(name);
  if (!raw) return null;
  const varRef = raw.match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,[^)]*)?\)$/i);
  if (varRef) return resolve(vars, varRef[1], visited);
  return raw;
}

function toRgb(value) {
  if (!value) return null;
  const v = value.trim();
  let m = v.match(/^#([0-9a-f]{3})$/i);
  if (m) {
    const parts = m[1].split("").map((c) => parseInt(c + c, 16));
    return { r: parts[0], g: parts[1], b: parts[2], a: 1 };
  }
  m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  m = v.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (parts.slice(0, 3).some(Number.isNaN)) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }
  return null;
}

function compositeOver(fg, bg) {
  if (fg.a >= 1) return fg;
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function luminance(rgb) {
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrastRatio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

const css = readFileSync(CSS_PATH, "utf8");
const darkVars = parseVars(extractBlock(css, ":root,"));
const lightOverrides = parseVars(extractBlock(css, 'html[data-theme="light"] {'));
// Le theme clair n'ecrase que ce qui change : il herite du bloc sombre.
const themes = {
  sombre: darkVars,
  clair: new Map([...darkVars, ...lightOverrides]),
};

let failures = 0;
let unresolved = 0;

for (const themeName of Object.keys(themes)) {
  const vars = themes[themeName];
  const rows = [];
  for (const [fgName, bgName, threshold, label] of PAIRS) {
    const fg = toRgb(resolve(vars, fgName));
    const bg = toRgb(resolve(vars, bgName));
    if (!fg || !bg) {
      unresolved += 1;
      rows.push({
        Element: label,
        Paire: fgName + " / " + bgName,
        Ratio: "n/a",
        Seuil: threshold,
        Etat: "NON RESOLU",
      });
      continue;
    }
    const ratio = contrastRatio(compositeOver(fg, bg), bg);
    const pass = ratio >= threshold;
    if (!pass) failures += 1;
    rows.push({
      Element: label,
      Paire: fgName + " / " + bgName,
      Ratio: ratio.toFixed(2),
      Seuil: threshold,
      Etat: pass ? "OK" : "ECHEC",
    });
  }
  console.log("\n=== Theme " + themeName + " ===");
  const bad = rows.filter((r) => r.Etat !== "OK");
  console.table(bad.length > 0 ? bad : rows);
  if (bad.length > 0) {
    console.log("(" + (rows.length - bad.length) + " paires conformes non affichees)");
  }
}

console.log("\nEchecs : " + failures + " | Jetons non resolus : " + unresolved);
process.exit(failures > 0 || unresolved > 0 ? 1 : 0);
