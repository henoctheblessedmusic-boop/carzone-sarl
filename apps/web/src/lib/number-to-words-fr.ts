/**
 * Conversion de montants numériques en toutes lettres en français (Franc CFA).
 * Conforme aux règles d'orthographe et aux usages comptables (OHADA / UEMOA / Bénin).
 */

const UNITES = [
  "",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
  "dix-sept",
  "dix-huit",
  "dix-neuf",
];

const DIZAINES = [
  "",
  "",
  "vingt",
  "trente",
  "quarante",
  "cinquante",
  "soixante",
  "soixante-dix",
  "quatre-vingt",
  "quatre-vingt-dix",
];

/**
 * Convertit un nombre entier entre 0 et 999 en texte français.
 */
function convertHundreds(n: number): string {
  if (n === 0) return "";

  const c = Math.floor(n / 100);
  const r = n % 100;
  let res = "";

  if (c > 0) {
    if (c === 1) {
      res = "cent";
    } else {
      res = UNITES[c] + " cent";
      if (r === 0) res += "s"; // "deux cents", "trois cents"
    }
  }

  if (r > 0) {
    if (res) res += " ";

    if (r < 20) {
      res += UNITES[r];
    } else {
      const d = Math.floor(r / 10);
      const u = r % 10;

      if (d === 7) {
        // 70 à 79 -> soixante-dix ...
        if (u === 1) {
          res += "soixante et onze";
        } else {
          res += "soixante-" + UNITES[10 + u];
        }
      } else if (d === 8) {
        // 80 à 89 -> quatre-vingts ...
        if (u === 0) {
          res += "quatre-vingts";
        } else {
          res += "quatre-vingt-" + UNITES[u];
        }
      } else if (d === 9) {
        // 90 à 99 -> quatre-vingt-dix ...
        res += "quatre-vingt-" + UNITES[10 + u];
      } else {
        // 20 à 69
        if (u === 1) {
          res += DIZAINES[d] + " et un";
        } else if (u > 1) {
          res += DIZAINES[d] + "-" + UNITES[u];
        } else {
          res += DIZAINES[d];
        }
      }
    }
  }

  return res;
}

/**
 * Convertit un nombre entier positif en toutes lettres françaises.
 */
export function numberToWordsFr(num: number): string {
  const n = Math.round(Math.abs(num));
  if (n === 0) return "zéro";

  const milliards = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const milliers = Math.floor((n % 1_000_000) / 1_000);
  const unites = n % 1_000;

  const parts: string[] = [];

  if (milliards > 0) {
    if (milliards === 1) {
      parts.push("un milliard");
    } else {
      parts.push(convertHundreds(milliards) + " milliards");
    }
  }

  if (millions > 0) {
    if (millions === 1) {
      parts.push("un million");
    } else {
      parts.push(convertHundreds(millions) + " millions");
    }
  }

  if (milliers > 0) {
    if (milliers === 1) {
      parts.push("mille");
    } else {
      parts.push(convertHundreds(milliers) + " mille");
    }
  }

  if (unites > 0) {
    parts.push(convertHundreds(unites));
  }

  return parts.join(" ").trim();
}

/**
 * Génère la mention légale et comptable d'arrêté en toutes lettres.
 * Ex: "Arrêté la présente facture proforma à la somme de : Treize millions neuf cent quatre-vingt-dix mille Francs CFA TTC."
 */
export function formatLegalAmountNotice(
  totalXof: number,
  kind: "proforma" | "facture" = "proforma"
): string {
  const inWords = numberToWordsFr(totalXof);
  const capitalized = inWords.charAt(0).toUpperCase() + inWords.slice(1);
  const label = kind === "proforma" ? "cette facture proforma" : "cette facture";
  return `Arrêté ${label} à la somme de : ${capitalized} Francs CFA.`;
}
