import { describe, expect, it } from "vitest";

import {
  configurationColorHex,
  configurationKeyId,
  describeIneligibility,
  formatConfigurationCode,
  groupVehiclesByConfiguration,
  isProvisionalVersionKey,
  nextConfigurationCode,
  normalizeExteriorBase,
  normalizeExteriorLabel,
  normalizeInteriorLabel,
  parseConfigurationCode,
  provisionalVersionKey,
  resolveConfigurationKey,
  resolveDefaultConfigurationCodes,
  vehicleVersionKey,
  INTERIOR_TO_COMPLETE,
  EXTERIOR_TO_CONFIRM,
  type ConfigurationSourceVehicle,
} from "@/lib/vehicle-configuration";

/** Vehicule de reference minimal, surchargeable champ par champ. */
function vehicle(overrides: Partial<ConfigurationSourceVehicle> = {}): ConfigurationSourceVehicle {
  return {
    vin: "LS4ASE2A8SA704219",
    brand: "Changan",
    model: "Uni-K",
    variant: "YUESHANG",
    year: 2024,
    energy: "ESSENCE",
    status: "EN_MAGASIN",
    fleetType: "SHOWROOM",
    exteriorColorBase: "Blanc",
    exteriorColorShade: "Blanc",
    interiorColor: "Noir",
    versionKey: null,
    ...overrides,
  };
}

describe("normalizeExteriorLabel", () => {
  it("ramene Blanche sur Blanc", () => {
    expect(normalizeExteriorLabel("Blanche", "Blanc")).toBe("Blanc");
  });

  it("conserve Gris creme comme teinte distincte de Gris", () => {
    expect(normalizeExteriorLabel("Gris creme", "Gris")).toBe("Gris crème");
    expect(normalizeExteriorLabel("Gris crème", "Gris")).toBe("Gris crème");
    expect(normalizeExteriorLabel("Gris", "Gris")).toBe("Gris");
    expect(normalizeExteriorLabel("Gris creme", "Gris")).not.toBe(
      normalizeExteriorLabel("Gris", "Gris"),
    );
  });

  it("conserve Gris cendre comme teinte distincte de Gris creme", () => {
    expect(normalizeExteriorLabel("Gris cendre", "Gris")).toBe("Gris cendre");
    expect(normalizeExteriorLabel("Gris cendre", "Gris")).not.toBe(
      normalizeExteriorLabel("Gris creme", "Gris"),
    );
  });

  it("retombe sur la couleur de base quand la teinte exacte manque", () => {
    expect(normalizeExteriorLabel(null, "Noir")).toBe("Noir");
    expect(normalizeExteriorLabel("   ", "Bleu")).toBe("Bleu");
  });

  it("retombe sur la sentinelle quand aucune couleur est renseignee", () => {
    expect(normalizeExteriorLabel(null, null)).toBe(EXTERIOR_TO_CONFIRM);
  });

  it("met une majuscule initiale sur une teinte hors table d alias", () => {
    expect(normalizeExteriorLabel("bronze   satine", null)).toBe("Bronze satine");
  });
});

describe("normalizeExteriorBase", () => {
  it("garde la couleur de base enregistree en base", () => {
    expect(normalizeExteriorBase("Gris", "Gris crème")).toBe("Gris");
  });

  it("deduit la base d une teinte composee quand la base manque", () => {
    expect(normalizeExteriorBase(null, "Gris crème")).toBe("Gris");
    expect(normalizeExteriorBase("", "Gris cendre")).toBe("Gris");
  });

  it("utilise le libelle comme base pour une teinte simple sans base", () => {
    expect(normalizeExteriorBase(null, "Noir")).toBe("Noir");
  });
});

describe("normalizeInteriorLabel", () => {
  it("rend la sentinelle pour un interieur non releve", () => {
    expect(normalizeInteriorLabel(null)).toBe(INTERIOR_TO_COMPLETE);
    expect(normalizeInteriorLabel("")).toBe(INTERIOR_TO_COMPLETE);
    expect(normalizeInteriorLabel("   ")).toBe(INTERIOR_TO_COMPLETE);
    expect(normalizeInteriorLabel("A completer")).toBe(INTERIOR_TO_COMPLETE);
  });

  it("ramene Terracotta (rouge) sur Terracotta", () => {
    expect(normalizeInteriorLabel("Terracotta (rouge)")).toBe("Terracotta");
    expect(normalizeInteriorLabel("Terracotta")).toBe("Terracotta");
  });

  it("ramene Bordeaux sur Rouge bordeaux", () => {
    expect(normalizeInteriorLabel("Bordeaux")).toBe("Rouge bordeaux");
    expect(normalizeInteriorLabel("Rouge bordeaux")).toBe("Rouge bordeaux");
  });
});

describe("vehicleVersionKey", () => {
  it("reprend la forme de cle de stock-import", () => {
    expect(vehicleVersionKey(vehicle())).toBe("CHANGAN|UNI-K|YUESHANG|2024|ESSENCE");
  });

  it("rend null quand la finition, l annee ou l energie manque", () => {
    expect(vehicleVersionKey(vehicle({ variant: null }))).toBeNull();
    expect(vehicleVersionKey(vehicle({ variant: "  " }))).toBeNull();
    expect(vehicleVersionKey(vehicle({ year: null }))).toBeNull();
    expect(vehicleVersionKey(vehicle({ energy: "" }))).toBeNull();
  });

  it("traite l energie non renseignee de l import comme absente", () => {
    expect(vehicleVersionKey(vehicle({ energy: "NON_RENSEIGNEE" }))).toBeNull();
  });
});

describe("provisionalVersionKey", () => {
  it("construit une cle en majuscules reconnaissable", () => {
    const key = provisionalVersionKey("Changan", "Uni-Z");
    expect(key).toBe("CHANGAN|UNI-Z|A CONFIRMER");
    expect(isProvisionalVersionKey(key)).toBe(true);
  });

  it("ne confond pas une cle de version reelle avec une cle provisoire", () => {
    expect(isProvisionalVersionKey("CHANGAN|UNI-K|YUESHANG|2024|ESSENCE")).toBe(false);
  });
});

describe("resolveConfigurationKey", () => {
  it("donne la meme cle pour deux vehicules de meme configuration", () => {
    const first = resolveConfigurationKey(vehicle({ vin: "LS4ASE2A8SA704219" }));
    const second = resolveConfigurationKey(vehicle({ vin: "LS4ASE2A9SA704150" }));
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(configurationKeyId(first!)).toBe(configurationKeyId(second!));
  });

  it("separe deux vehicules des que la finition change", () => {
    const yueshang = resolveConfigurationKey(vehicle({ variant: "YUESHANG" }))!;
    const explorer = resolveConfigurationKey(vehicle({ variant: "EXPLORER" }))!;
    expect(configurationKeyId(yueshang)).not.toBe(configurationKeyId(explorer));
  });

  it("separe deux vehicules des que la teinte change", () => {
    const blanc = resolveConfigurationKey(vehicle({ exteriorColorShade: "Blanc" }))!;
    const creme = resolveConfigurationKey(
      vehicle({ exteriorColorShade: "Gris creme", exteriorColorBase: "Gris" }),
    )!;
    expect(configurationKeyId(blanc)).not.toBe(configurationKeyId(creme));
  });

  it("separe deux vehicules des que l interieur change", () => {
    const noir = resolveConfigurationKey(vehicle({ interiorColor: "Noir" }))!;
    const terracotta = resolveConfigurationKey(vehicle({ interiorColor: "Terracotta" }))!;
    expect(configurationKeyId(noir)).not.toBe(configurationKeyId(terracotta));
  });

  it("regroupe Blanc et Blanche sur la meme teinte", () => {
    const blanc = resolveConfigurationKey(vehicle({ exteriorColorShade: "Blanc" }))!;
    const blanche = resolveConfigurationKey(vehicle({ exteriorColorShade: "Blanche" }))!;
    expect(configurationKeyId(blanc)).toBe(configurationKeyId(blanche));
  });

  it("rend null pour un vehicule sans VIN", () => {
    expect(resolveConfigurationKey(vehicle({ vin: null }))).toBeNull();
    expect(resolveConfigurationKey(vehicle({ vin: "   " }))).toBeNull();
  });

  it("rend null pour un vehicule vendu ou retire", () => {
    expect(resolveConfigurationKey(vehicle({ status: "VENDU" }))).toBeNull();
    expect(resolveConfigurationKey(vehicle({ status: "RETIRE" }))).toBeNull();
  });

  it("rend null pour un vehicule du parc de location", () => {
    expect(resolveConfigurationKey(vehicle({ fleetType: "RENTAL" }))).toBeNull();
  });

  it("prefere la version deja rattachee a la cle calculee", () => {
    const key = resolveConfigurationKey(
      vehicle({ versionKey: "CHANGAN|UNI-K|YUESHANG 4WD|2024|ESSENCE" }),
    )!;
    expect(key.versionKey).toBe("CHANGAN|UNI-K|YUESHANG 4WD|2024|ESSENCE");
  });

  it("retombe sur une version provisoire quand la finition manque", () => {
    const key = resolveConfigurationKey(vehicle({ variant: null, versionKey: null }))!;
    expect(key.versionKey).toBe("CHANGAN|UNI-K|A CONFIRMER");
    expect(isProvisionalVersionKey(key.versionKey)).toBe(true);
  });
});

describe("describeIneligibility", () => {
  it("nomme la cause exacte du rejet", () => {
    expect(describeIneligibility(vehicle({ vin: null }))).toBe("VIN absent");
    expect(describeIneligibility(vehicle({ status: "VENDU" }))).toContain("VENDU");
    expect(describeIneligibility(vehicle({ fleetType: "RENTAL" }))).toContain("RENTAL");
  });

  it("rend null pour un vehicule eligible", () => {
    expect(describeIneligibility(vehicle())).toBeNull();
  });
});

describe("configurationColorHex", () => {
  it("derive les pastilles de la palette existante", () => {
    const key = resolveConfigurationKey(
      vehicle({ exteriorColorShade: "Gris creme", exteriorColorBase: "Gris" }),
    )!;
    expect(configurationColorHex(key)).toEqual({
      exteriorHex: "#d6d3d1",
      interiorHex: "#111827",
    });
  });

  it("retombe sur la couleur neutre pour la sentinelle d interieur", () => {
    const key = resolveConfigurationKey(vehicle({ interiorColor: null }))!;
    expect(configurationColorHex(key).interiorHex).toBe("#64748b");
  });
});

describe("groupVehiclesByConfiguration", () => {
  it("regroupe les vehicules identiques et met les inelegibles a part", () => {
    const result = groupVehiclesByConfiguration([
      vehicle({ vin: "AAAAAAAAAAAAAAAA1" }),
      vehicle({ vin: "AAAAAAAAAAAAAAAA2" }),
      vehicle({ vin: "AAAAAAAAAAAAAAAA3", interiorColor: "Terracotta" }),
      vehicle({ vin: null }),
    ]);
    expect(result.groups).toHaveLength(2);
    expect(result.skipped).toHaveLength(1);
    expect(result.groups.map((group) => group.vehicles.length).sort()).toEqual([1, 2]);
  });
});

describe("resolveDefaultConfigurationCodes", () => {
  it("retient la configuration la plus fournie de chaque version", () => {
    const defaults = resolveDefaultConfigurationCodes([
      { code: "CFG-12", versionKey: "V1", exteriorColorLabel: "Blanc", vehicleCount: 2 },
      { code: "CFG-13", versionKey: "V1", exteriorColorLabel: "Blanc", vehicleCount: 1 },
      { code: "CFG-21", versionKey: "V2", exteriorColorLabel: "Noir", vehicleCount: 3 },
    ]);
    expect([...defaults].sort()).toEqual(["CFG-12", "CFG-21"]);
  });

  it("tranche une egalite par la teinte la plus frequente puis par le code", () => {
    const defaults = resolveDefaultConfigurationCodes([
      { code: "CFG-03", versionKey: "V1", exteriorColorLabel: "Gris", vehicleCount: 1 },
      { code: "CFG-02", versionKey: "V1", exteriorColorLabel: "Blanc", vehicleCount: 1 },
      { code: "CFG-11", versionKey: "V1", exteriorColorLabel: "Blanc", vehicleCount: 1 },
    ]);
    expect([...defaults]).toEqual(["CFG-02"]);
  });

  it("donne exactement une configuration par defaut par version", () => {
    const defaults = resolveDefaultConfigurationCodes([
      { code: "CFG-06", versionKey: "V1", exteriorColorLabel: "Blanc", vehicleCount: 1 },
      { code: "CFG-07", versionKey: "V1", exteriorColorLabel: "Gris", vehicleCount: 1 },
      { code: "CFG-09", versionKey: "V2", exteriorColorLabel: "Noir", vehicleCount: 1 },
    ]);
    expect(defaults.size).toBe(2);
  });

  it("est stable quel que soit l ordre d entree", () => {
    const candidates = [
      { code: "CFG-17", versionKey: "V1", exteriorColorLabel: "Gris crème", vehicleCount: 1 },
      { code: "CFG-16", versionKey: "V1", exteriorColorLabel: "Gris crème", vehicleCount: 2 },
      { code: "CFG-12", versionKey: "V1", exteriorColorLabel: "Blanc", vehicleCount: 2 },
      { code: "CFG-13", versionKey: "V1", exteriorColorLabel: "Blanc", vehicleCount: 1 },
    ];
    const direct = [...resolveDefaultConfigurationCodes(candidates)];
    const reversed = [...resolveDefaultConfigurationCodes([...candidates].reverse())];
    expect(direct).toEqual(["CFG-12"]);
    expect(reversed).toEqual(direct);
  });
});

describe("codes de configuration", () => {
  it("formate un numero sur deux chiffres", () => {
    expect(formatConfigurationCode(1)).toBe("CFG-01");
    expect(formatConfigurationCode(22)).toBe("CFG-22");
    expect(formatConfigurationCode(123)).toBe("CFG-123");
  });

  it("refuse un numero invalide", () => {
    expect(() => formatConfigurationCode(0)).toThrow();
    expect(() => formatConfigurationCode(-1)).toThrow();
    expect(() => formatConfigurationCode(1.5)).toThrow();
  });

  it("relit un code bien forme et rejette les autres", () => {
    expect(parseConfigurationCode("CFG-07")).toBe(7);
    expect(parseConfigurationCode(" cfg-22 ")).toBe(22);
    expect(parseConfigurationCode("CFG-7")).toBeNull();
    expect(parseConfigurationCode("CFG-00")).toBeNull();
    expect(parseConfigurationCode("XYZ-01")).toBeNull();
  });

  it("alloue le prochain code libre apres le plus grand attribue", () => {
    expect(nextConfigurationCode([])).toBe("CFG-01");
    expect(nextConfigurationCode(["CFG-01", "CFG-22", "CFG-05"])).toBe("CFG-23");
    expect(nextConfigurationCode(["CFG-22", "INVALIDE"])).toBe("CFG-23");
  });
});
