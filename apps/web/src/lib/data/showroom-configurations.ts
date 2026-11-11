/**
 * Table de référence des 22 configurations du showroom, extraite du classeur
 * "Plan de prise de vue - showroom.xlsx" (dossier média, hors dépôt).
 *
 * Le rapprochement se fait par VIN et jamais par texte : les finitions du
 * classeur et de la base divergent sur 10 véhicules sur 27 (Yueshang 4WD contre
 * YUESHANG, Explorer 4WD contre EXPLORER, Global Edition 2WD contre
 * GLOBAL EDITION...). Le VIN est le seul identifiant fiable et il est unique
 * en base.
 *
 * Les codes CFG-XX sont stables à vie : les dossiers photo du showroom portent
 * déjà ces noms. Un véhicule qui change de version garde son code.
 *
 * Les libellés de teinte servent de garde-fou : le script de rattachement
 * signale tout écart entre le classeur et ce que la base contient réellement.
 * La couleur effectivement enregistrée reste celle de la base.
 *
 * Nommage du CFG-22, décision validée : le modèle reste "DASHENG" en base,
 * comme aujourd'hui, et c'est "Dashing" qui devra être affiché sur la vitrine.
 * La correspondance d'affichage appartient à l'étape 3 (vitrine et pop-up) :
 * elle n'est volontairement pas implémentée ici, l'étape 1 ne touche aucun
 * pixel. Ne pas renommer le modèle en base sans ordre explicite.
 */

export type ShowroomConfigurationReference = {
  code: string;
  /** Version telle que nommée au classeur, pour le rapport du script. */
  versionLabel: string;
  exteriorColorLabel: string;
  interiorColorLabel: string;
  vins: readonly string[];
};

export const SHOWROOM_CONFIGURATIONS: readonly ShowroomConfigurationReference[] = [
  {
    code: "CFG-01",
    versionLabel: "BYD Song L, à confirmer",
    exteriorColorLabel: "Gris",
    interiorColorLabel: "Blanc",
    vins: ["LGXCE4CB0S0880867"],
  },
  {
    code: "CFG-02",
    versionLabel: "Changan CS75 Plus Smart Champion Edition 2026",
    exteriorColorLabel: "Blanc",
    interiorColorLabel: "Terracotta",
    vins: ["LS4ASE2E7TD029479"],
  },
  {
    code: "CFG-03",
    versionLabel: "Changan CS75 Plus Smart Champion Edition 2026",
    exteriorColorLabel: "Gris",
    interiorColorLabel: "Terracotta",
    vins: ["LS4ASE2E5TD029562"],
  },
  {
    code: "CFG-04",
    versionLabel: "Changan Uni-K Yueshang 2024",
    exteriorColorLabel: "Bleu",
    interiorColorLabel: "Noir",
    vins: ["LS4ASE2A2SA704149"],
  },
  {
    code: "CFG-05",
    versionLabel: "Changan Uni-K, à confirmer",
    exteriorColorLabel: "Noir",
    interiorColorLabel: "Noir",
    vins: ["LS4ASE2A2SA997972"],
  },
  {
    code: "CFG-06",
    versionLabel: "Changan Uni-Z, à confirmer",
    exteriorColorLabel: "Blanc",
    interiorColorLabel: "Noir",
    vins: ["LS4ASE2E2TB333735"],
  },
  {
    code: "CFG-07",
    versionLabel: "Changan Uni-Z, à confirmer",
    exteriorColorLabel: "Gris",
    interiorColorLabel: "Noir",
    vins: ["LS4ASE2E2TB326509"],
  },
  {
    code: "CFG-08",
    versionLabel: "Changan X5 Plus Basic Excellence Pro 2026",
    exteriorColorLabel: "Blanc",
    interiorColorLabel: "Noir",
    vins: ["LS4ASE2EXTB426308"],
  },
  {
    code: "CFG-09",
    versionLabel: "Jetour Mountain & Sea T1 Explorer 2025",
    exteriorColorLabel: "Noir",
    interiorColorLabel: "Noir",
    vins: ["LNNBDDEY3SDN14204"],
  },
  {
    code: "CFG-10",
    versionLabel: "Lynk & Co 900, à confirmer",
    exteriorColorLabel: "Noir",
    interiorColorLabel: "Blanc",
    vins: ["L6T79END0TT004275"],
  },
  {
    code: "CFG-11",
    versionLabel: "Changan CS75 Plus Smart Champion Edition 2026",
    exteriorColorLabel: "Blanc",
    interiorColorLabel: "À compléter",
    vins: ["LS4ASE2E0TD018744"],
  },
  {
    code: "CFG-12",
    versionLabel: "Changan Uni-K Yueshang 2024",
    exteriorColorLabel: "Blanc",
    interiorColorLabel: "Noir",
    vins: ["LS4ASE2A8SA704219", "LS4ASE2A9SA704150"],
  },
  {
    code: "CFG-13",
    versionLabel: "Changan Uni-K Yueshang 2024",
    exteriorColorLabel: "Blanc",
    interiorColorLabel: "Terracotta",
    vins: ["LS4ASE2A7SA704454"],
  },
  {
    code: "CFG-14",
    versionLabel: "Changan Uni-K Yueshang 2024",
    exteriorColorLabel: "Gris",
    interiorColorLabel: "Noir",
    vins: ["LS4ASE2A0SA704053"],
  },
  {
    code: "CFG-15",
    versionLabel: "Changan Uni-K Yueshang 2024",
    exteriorColorLabel: "Gris cendre",
    interiorColorLabel: "À compléter",
    vins: ["LS4ASE2A0SA704036"],
  },
  {
    code: "CFG-16",
    versionLabel: "Changan Uni-K Yueshang 2024",
    exteriorColorLabel: "Gris crème",
    interiorColorLabel: "Noir",
    vins: ["LS4ASE2A1SA704031", "LS4ASE2A8SA704172"],
  },
  {
    code: "CFG-17",
    versionLabel: "Changan Uni-K Yueshang 2024",
    exteriorColorLabel: "Gris crème",
    interiorColorLabel: "Terracotta",
    vins: ["LS4ASE2A2SA704359"],
  },
  {
    code: "CFG-18",
    versionLabel: "Changan X5 Plus Basic High-Energy Pro 2026",
    exteriorColorLabel: "Blanc",
    interiorColorLabel: "Noir",
    vins: ["LS4ASE2E6TB426631"],
  },
  {
    code: "CFG-19",
    versionLabel: "Exeed Yaoguang C-DM Global Edition 2026",
    exteriorColorLabel: "Blanc",
    interiorColorLabel: "Noir",
    vins: ["LNNBBDEEXSG082415"],
  },
  {
    code: "CFG-20",
    versionLabel: "Exeed Yaoguang C-DM Global Edition 2026",
    exteriorColorLabel: "Noir",
    interiorColorLabel: "À compléter",
    vins: ["LNNBBDEE1SG086255"],
  },
  {
    code: "CFG-21",
    versionLabel: "Exeed Yaoguang Global Edition 2026",
    exteriorColorLabel: "Noir",
    interiorColorLabel: "Rouge bordeaux",
    vins: ["LVTDB24B4SG121299", "LVTDB24B0SG121316", "LVTDB24B1SG121308"],
  },
  {
    code: "CFG-22",
    versionLabel: "Jetour Dashing Youth Edition Luxury 2026",
    exteriorColorLabel: "Noir",
    interiorColorLabel: "Noir",
    vins: ["LVTDB21B8SDA16337", "LVTDB21B8SDA11347"],
  },
];

/** Code de configuration attendu pour chaque VIN du classeur. */
export const CONFIGURATION_CODE_BY_VIN: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    SHOWROOM_CONFIGURATIONS.flatMap((configuration) =>
      configuration.vins.map((vin) => [vin, configuration.code] as const),
    ),
  ),
);

/** Les 27 VIN du plan de prise de vue. */
export const SHOWROOM_REFERENCE_VINS: readonly string[] = Object.keys(CONFIGURATION_CODE_BY_VIN);
