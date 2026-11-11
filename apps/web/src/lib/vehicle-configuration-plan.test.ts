import { describe, expect, it } from "vitest";

import {
  planConfigurationAssignments,
  plannedVehicleCount,
  type PlanSourceVehicle,
} from "@/lib/vehicle-configuration-plan";
import { SHOWROOM_CONFIGURATIONS } from "@/lib/data/showroom-configurations";

/**
 * Fiche de reference par code, pour fabriquer les 27 vehicules de test.
 *
 * Les cles de version sont opaques a dessein : le regroupement ne depend que de
 * l'egalite des cles, et inventer une finition, une annee et une energie par
 * vehicule donnerait de fausses donnees. versionKey a null signifie finition non
 * relevee, donc rattachement provisoire calcule depuis la marque et le modele.
 *
 * Les teintes viennent du tableau de la section 6 du plan valide. Les trois
 * interieurs a null sont les trois vehicules dont la colonne est vide en base.
 */
type Fixture = {
  versionKey: string | null;
  brand: string;
  model: string;
  shade: string | null;
  base: string | null;
  interior: string | null;
};

const FIXTURES: Record<string, Fixture> = {
  "CFG-01": {
    versionKey: null,
    brand: "BYD",
    model: "Song L",
    shade: "Gris",
    base: "Gris",
    interior: "Blanc",
  },
  "CFG-02": {
    versionKey: "V-CS75-SMART",
    brand: "Changan",
    model: "CS75 Plus",
    shade: "Blanc",
    base: "Blanc",
    interior: "Terracotta",
  },
  "CFG-03": {
    versionKey: "V-CS75-SMART",
    brand: "Changan",
    model: "CS75 Plus",
    shade: "Gris",
    base: "Gris",
    interior: "Terracotta",
  },
  "CFG-04": {
    versionKey: "V-UNIK-YUESHANG",
    brand: "Changan",
    model: "Uni-K",
    shade: "Bleu",
    base: "Bleu",
    interior: "Noir",
  },
  "CFG-05": {
    versionKey: null,
    brand: "Changan",
    model: "Uni-K",
    shade: "Noir",
    base: "Noir",
    interior: "Noir",
  },
  "CFG-06": {
    versionKey: null,
    brand: "Changan",
    model: "Uni-Z",
    shade: "Blanc",
    base: "Blanc",
    interior: "Noir",
  },
  "CFG-07": {
    versionKey: null,
    brand: "Changan",
    model: "Uni-Z",
    shade: "Gris",
    base: "Gris",
    interior: "Noir",
  },
  "CFG-08": {
    versionKey: "V-X5-EXCELLENCE",
    brand: "Changan",
    model: "X5 Plus",
    shade: "Blanc",
    base: "Blanc",
    interior: "Noir",
  },
  "CFG-09": {
    versionKey: "V-T1-EXPLORER",
    brand: "Jetour",
    model: "Mountain & Sea T1",
    shade: "Noir",
    base: "Noir",
    interior: "Noir",
  },
  "CFG-10": {
    versionKey: null,
    brand: "Lynk & Co",
    model: "900",
    shade: "Noir",
    base: "Noir",
    interior: "Blanc",
  },
  "CFG-11": {
    versionKey: "V-CS75-SMART",
    brand: "Changan",
    model: "CS75 Plus",
    shade: "Blanche",
    base: "Blanc",
    interior: null,
  },
  "CFG-12": {
    versionKey: "V-UNIK-YUESHANG",
    brand: "Changan",
    model: "Uni-K",
    shade: "Blanc",
    base: "Blanc",
    interior: "Noir",
  },
  "CFG-13": {
    versionKey: "V-UNIK-YUESHANG",
    brand: "Changan",
    model: "Uni-K",
    shade: "Blanc",
    base: "Blanc",
    interior: "Terracotta",
  },
  "CFG-14": {
    versionKey: "V-UNIK-YUESHANG",
    brand: "Changan",
    model: "Uni-K",
    shade: "Gris",
    base: "Gris",
    interior: "Noir",
  },
  "CFG-15": {
    versionKey: "V-UNIK-YUESHANG",
    brand: "Changan",
    model: "Uni-K",
    shade: "Gris cendre",
    base: "Gris",
    interior: null,
  },
  "CFG-16": {
    versionKey: "V-UNIK-YUESHANG",
    brand: "Changan",
    model: "Uni-K",
    shade: "Gris creme",
    base: "Gris",
    interior: "Noir",
  },
  "CFG-17": {
    versionKey: "V-UNIK-YUESHANG",
    brand: "Changan",
    model: "Uni-K",
    shade: "Gris creme",
    base: "Gris",
    interior: "Terracotta",
  },
  "CFG-18": {
    versionKey: "V-X5-HIGHENERGY",
    brand: "Changan",
    model: "X5 Plus",
    shade: "Blanc",
    base: "Blanc",
    interior: "Noir",
  },
  "CFG-19": {
    versionKey: "V-YAOGUANG-CDM",
    brand: "Exeed",
    model: "Yaoguang",
    shade: "Blanc",
    base: "Blanc",
    interior: "Noir",
  },
  "CFG-20": {
    versionKey: "V-YAOGUANG-CDM",
    brand: "Exeed",
    model: "Yaoguang",
    shade: "Noir",
    base: "Noir",
    interior: null,
  },
  "CFG-21": {
    versionKey: "V-YAOGUANG-GLOBAL",
    brand: "Exeed",
    model: "Yaoguang",
    shade: "Noir",
    base: "Noir",
    interior: "Rouge bordeaux",
  },
  "CFG-22": {
    versionKey: "V-DASHENG-YOUTH",
    brand: "Jetour",
    model: "Dasheng",
    shade: "Noir",
    base: "Noir",
    interior: "Noir",
  },
};

/** Les 27 vehicules du plan de prise de vue, dans l'etat attendu en base. */
function referenceVehicles(): PlanSourceVehicle[] {
  return SHOWROOM_CONFIGURATIONS.flatMap((configuration) => {
    const fixture = FIXTURES[configuration.code];
    if (!fixture) throw new Error(`Fiche de test manquante pour ${configuration.code}`);
    return configuration.vins.map((vin) => ({
      id: `id-${vin}`,
      vin,
      brand: fixture.brand,
      model: fixture.model,
      variant: fixture.versionKey ? "FINITION CONFIRMEE" : null,
      year: fixture.versionKey ? 2026 : null,
      energy: fixture.versionKey ? "ESSENCE" : "NON_RENSEIGNEE",
      status: "EN_MAGASIN",
      fleetType: "SHOWROOM",
      exteriorColorBase: fixture.base,
      exteriorColorShade: fixture.shade,
      interiorColor: fixture.interior,
      versionKey: fixture.versionKey,
      currentConfigurationCode: null,
    }));
  });
}

/** Le vehicule fantome de la base : CHANGAN CS75 sans VIN, vendu, publie sur le site. */
function ghostVehicle(): PlanSourceVehicle {
  return {
    id: "id-fantome",
    vin: null,
    brand: "CHANGAN",
    model: "CS75",
    variant: null,
    year: null,
    energy: "NON_RENSEIGNEE",
    status: "VENDU",
    fleetType: "SHOWROOM",
    exteriorColorBase: null,
    exteriorColorShade: null,
    interiorColor: null,
    versionKey: null,
    currentConfigurationCode: null,
  };
}

describe("planConfigurationAssignments sur le stock de reference", () => {
  const vehicles = referenceVehicles();

  it("part bien de 27 vehicules et 22 configurations au classeur", () => {
    expect(vehicles).toHaveLength(27);
    expect(SHOWROOM_CONFIGURATIONS).toHaveLength(22);
  });

  it("construit exactement 22 configurations pour les 27 vehicules", () => {
    const plan = planConfigurationAssignments({ vehicles });
    expect(plan.blockers).toEqual([]);
    expect(plan.configurations).toHaveLength(22);
    expect(plannedVehicleCount(plan)).toBe(27);
    expect(plan.skipped).toEqual([]);
  });

  it("respecte les comptes par configuration du tableau de la section 6", () => {
    const plan = planConfigurationAssignments({ vehicles });
    const counts = Object.fromEntries(
      plan.configurations.map((configuration) => [
        configuration.code,
        configuration.vehicles.length,
      ]),
    );
    expect(counts).toEqual({
      "CFG-01": 1,
      "CFG-02": 1,
      "CFG-03": 1,
      "CFG-04": 1,
      "CFG-05": 1,
      "CFG-06": 1,
      "CFG-07": 1,
      "CFG-08": 1,
      "CFG-09": 1,
      "CFG-10": 1,
      "CFG-11": 1,
      "CFG-12": 2,
      "CFG-13": 1,
      "CFG-14": 1,
      "CFG-15": 1,
      "CFG-16": 2,
      "CFG-17": 1,
      "CFG-18": 1,
      "CFG-19": 1,
      "CFG-20": 1,
      "CFG-21": 3,
      "CFG-22": 2,
    });
  });

  it("normalise Blanche en Blanc sans fusionner CFG-02 et CFG-11", () => {
    const plan = planConfigurationAssignments({ vehicles });
    const byCode = new Map(plan.configurations.map((item) => [item.code, item]));
    const cfg02 = byCode.get("CFG-02")!;
    const cfg11 = byCode.get("CFG-11")!;
    expect(cfg11.key.exteriorColorLabel).toBe("Blanc");
    expect(cfg02.key.exteriorColorLabel).toBe("Blanc");
    expect(cfg11.key.interiorColorLabel).toBe("À compléter");
    expect(cfg11.keyId).not.toBe(cfg02.keyId);
  });

  it("garde CFG-08 et CFG-18 distincts malgre la meme teinte et le meme interieur", () => {
    const plan = planConfigurationAssignments({ vehicles });
    const byCode = new Map(plan.configurations.map((item) => [item.code, item]));
    const cfg08 = byCode.get("CFG-08")!;
    const cfg18 = byCode.get("CFG-18")!;
    expect(cfg08.key.exteriorColorLabel).toBe(cfg18.key.exteriorColorLabel);
    expect(cfg08.key.interiorColorLabel).toBe(cfg18.key.interiorColorLabel);
    expect(cfg08.key.versionKey).not.toBe(cfg18.key.versionKey);
    expect(cfg08.keyId).not.toBe(cfg18.keyId);
  });

  it("garde les quatre Uni-K gris distincts", () => {
    const plan = planConfigurationAssignments({ vehicles });
    const byCode = new Map(plan.configurations.map((item) => [item.code, item]));
    const codes = ["CFG-14", "CFG-15", "CFG-16", "CFG-17"];
    const keyIds = new Set(codes.map((code) => byCode.get(code)!.keyId));
    expect(keyIds.size).toBe(4);
    expect(byCode.get("CFG-14")!.key.exteriorColorLabel).toBe("Gris");
    expect(byCode.get("CFG-15")!.key.exteriorColorLabel).toBe("Gris cendre");
    expect(byCode.get("CFG-16")!.key.exteriorColorLabel).toBe("Gris crème");
    expect(byCode.get("CFG-17")!.key.exteriorColorLabel).toBe("Gris crème");
    for (const code of codes) {
      expect(byCode.get(code)!.key.exteriorColorBase).toBe("Gris");
    }
  });

  it("demande les quatre versions de rattachement provisoire", () => {
    const plan = planConfigurationAssignments({ vehicles });
    expect(plan.provisionalVersionKeys).toEqual([
      "BYD|SONG L|A CONFIRMER",
      "CHANGAN|UNI-K|A CONFIRMER",
      "CHANGAN|UNI-Z|A CONFIRMER",
      "LYNK & CO|900|A CONFIRMER",
    ]);
  });

  it("designe une seule configuration par defaut par version", () => {
    const plan = planConfigurationAssignments({ vehicles });
    const defaults = plan.configurations.filter((configuration) => configuration.isDefault);
    const versions = new Set(plan.configurations.map((item) => item.key.versionKey));
    expect(defaults).toHaveLength(versions.size);
    expect(defaults.map((item) => item.code).sort()).toEqual([
      "CFG-01",
      "CFG-02",
      "CFG-05",
      "CFG-06",
      "CFG-08",
      "CFG-09",
      "CFG-10",
      "CFG-12",
      "CFG-18",
      "CFG-19",
      "CFG-21",
      "CFG-22",
    ]);
  });

  it("ne signale aucun ecart de teinte avec le classeur", () => {
    const plan = planConfigurationAssignments({ vehicles });
    expect(plan.warnings).toEqual([]);
  });

  it("donne le meme plan a chaque execution", () => {
    const first = planConfigurationAssignments({ vehicles });
    const second = planConfigurationAssignments({ vehicles: [...vehicles].reverse() });
    const summary = (plan: ReturnType<typeof planConfigurationAssignments>) =>
      plan.configurations.map((item) => `${item.code}:${item.keyId}:${item.isDefault}`);
    expect(summary(second)).toEqual(summary(first));
  });
});

describe("planConfigurationAssignments face aux ecarts de donnees", () => {
  it("ecarte le vehicule fantome sans bloquer le rattachement", () => {
    const plan = planConfigurationAssignments({
      vehicles: [...referenceVehicles(), ghostVehicle()],
    });
    expect(plan.blockers).toEqual([]);
    expect(plan.configurations).toHaveLength(22);
    expect(plan.skipped).toHaveLength(1);
    expect(plan.skipped[0]).toMatchObject({ vin: null, reason: "VIN absent" });
    expect(plan.skipped[0].label).toContain("CS75");
  });

  it("bloque quand un VIN du classeur manque en base", () => {
    const vehicles = referenceVehicles().filter((vehicle) => vehicle.vin !== "LGXCE4CB0S0880867");
    const plan = planConfigurationAssignments({ vehicles });
    expect(plan.blockers).toHaveLength(1);
    expect(plan.blockers[0]).toContain("LGXCE4CB0S0880867");
    expect(plan.blockers[0]).toContain("CFG-01");
  });

  it("bloque quand un vehicule eligible est absent du classeur", () => {
    const intrus: PlanSourceVehicle = {
      ...referenceVehicles()[0],
      id: "id-intrus",
      vin: "INCONNU00000000X1",
      versionKey: "V-HORS-CLASSEUR",
    };
    const plan = planConfigurationAssignments({
      vehicles: [...referenceVehicles(), intrus],
    });
    expect(plan.blockers.some((blocker) => blocker.includes("INCONNU00000000X1"))).toBe(true);
  });

  it("bloque quand les vehicules d un meme code n ont pas la meme configuration", () => {
    const vehicles = referenceVehicles().map((vehicle) =>
      vehicle.vin === "LS4ASE2A9SA704150" ? { ...vehicle, interiorColor: "Terracotta" } : vehicle,
    );
    const plan = planConfigurationAssignments({ vehicles });
    expect(plan.blockers.some((blocker) => blocker.includes("CFG-12"))).toBe(true);
  });

  it("bloque quand un groupe est reclame par deux codes", () => {
    const vehicles = referenceVehicles().map((vehicle) =>
      vehicle.vin === "LS4ASE2A7SA704454" ? { ...vehicle, interiorColor: "Noir" } : vehicle,
    );
    const plan = planConfigurationAssignments({ vehicles });
    expect(
      plan.blockers.some((blocker) => blocker.includes("CFG-12") && blocker.includes("CFG-13")),
    ).toBe(true);
  });

  it("compte les vehicules deja rattaches au bon code", () => {
    const vehicles = referenceVehicles().map((vehicle) => ({
      ...vehicle,
      currentConfigurationCode: vehicle.vin === "LGXCE4CB0S0880867" ? "CFG-01" : null,
    }));
    const plan = planConfigurationAssignments({ vehicles });
    expect(plan.alreadyLinkedCount).toBe(1);
  });

  it("signale un ecart de teinte avec le classeur sans bloquer", () => {
    const vehicles = referenceVehicles().map((vehicle) =>
      vehicle.vin === "LS4ASE2A2SA704149"
        ? { ...vehicle, exteriorColorShade: "Vert", exteriorColorBase: "Vert" }
        : vehicle,
    );
    const plan = planConfigurationAssignments({ vehicles });
    expect(plan.blockers).toEqual([]);
    expect(plan.warnings.some((warning) => warning.includes("CFG-04"))).toBe(true);
  });
});
