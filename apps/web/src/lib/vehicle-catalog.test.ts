import { describe, expect, it } from "vitest";
import {
  availableSceneModes,
  cardImageOf,
  catalogVersionFromVehicle,
  clampSceneMode,
  configurationForExterior,
  defaultConfigurationOf,
  exteriorBaseFilterOptions,
  exteriorOptionsOf,
  findConfigurationByCode,
  interiorOptionsFor,
  isVersionVisible,
  preserveSceneKey,
  resolveInitialConfiguration,
  sceneFallbackOf,
  sceneImagesOf,
  sceneModeOffers,
  versionAvailableCount,
  versionHasExteriorBase,
  versionSlugOf,
  versionTitle,
  visibleVersions,
  type CatalogCanvasPhoto,
  type CatalogConfiguration,
  type CatalogImage,
  type CatalogVehiclePhoto,
  type CatalogVersion,
} from "@/lib/vehicle-catalog";
import type { CanvasSlot } from "@/lib/vehicle-media";

/** Les URL des tests ne pointent sur rien : seule leur unicite compte. */
function canvas(code: string, slots: CanvasSlot[]): CatalogCanvasPhoto[] {
  return slots.map((slot) => ({
    slot,
    url: `https://exemple.test/${code}/${slot}.webp`,
    urlMobile: null,
    width: 3000,
    height: 2000,
    blurDataUrl: null,
    origin: "SHOWROOM",
  }));
}

function vehiclePhoto(code: string): CatalogVehiclePhoto {
  return {
    key: "principale",
    url: `https://exemple.test/${code}/vehicule.jpg`,
    urlMobile: null,
    width: null,
    height: null,
    blurDataUrl: null,
    origin: "VEHICULE",
  };
}

const MANUFACTURER_VISUAL: CatalogImage = {
  url: "https://exemple.test/constructeur/uni-k.jpg",
  urlMobile: null,
  width: null,
  height: null,
  blurDataUrl: null,
  origin: "CONSTRUCTEUR",
};

type ConfigurationOverrides = Partial<CatalogConfiguration>;

function configuration(
  code: string,
  exteriorColorBase: string,
  exteriorColorLabel: string,
  interiorColorLabel: string,
  availableCount: number,
  overrides: ConfigurationOverrides = {},
): CatalogConfiguration {
  return {
    code,
    exteriorColorBase,
    exteriorColorLabel,
    exteriorHex: "#6b7280",
    interiorColorLabel,
    interiorHex: "#111827",
    isDefault: false,
    isMediaPublished: false,
    availableCount,
    canvas: [],
    spinFrameCount: 0,
    hasInteriorPanorama: false,
    vehiclePhotos: [],
    ...overrides,
  };
}

/**
 * Le stock reel de la Changan Uni-K Yueshang 2024 : 7 configurations,
 * 9 vehicules, tel qu'il figure au plan de prise de vue.
 */
function uniKVersion(overrides: Partial<CatalogVersion> = {}): CatalogVersion {
  return {
    slug: "changan-uni-k-yueshang-2024",
    brand: "Changan",
    model: "Uni-K",
    trim: "YUESHANG",
    year: 2024,
    energy: "ESSENCE",
    vehicleType: "SUV",
    transmission: "AUTOMATIQUE",
    mileage: 0,
    status: "EN_MAGASIN",
    manufacturerVisual: null,
    configurations: [
      configuration("CFG-04", "Gris", "Bleu", "Noir", 1),
      configuration("CFG-12", "Blanc", "Blanc", "Noir", 2, { isDefault: true }),
      configuration("CFG-13", "Blanc", "Blanc", "Terracotta", 1),
      configuration("CFG-14", "Gris", "Gris", "Noir", 1),
      configuration("CFG-15", "Gris", "Gris cendre", "À compléter", 1),
      configuration("CFG-16", "Gris", "Gris crème", "Noir", 2),
      configuration("CFG-17", "Gris", "Gris crème", "Terracotta", 1),
    ],
    ...overrides,
  };
}

describe("versionTitle et versionSlugOf", () => {
  it("compose le titre a partir de la marque, du modele et de la finition", () => {
    expect(versionTitle(uniKVersion())).toBe("Changan Uni-K YUESHANG");
  });

  it("retire les accents et la ponctuation du slug d'adresse", () => {
    expect(versionSlugOf({ brand: "Lynk & Co", model: "900", year: 2026 })).toBe("lynk-co-900-2026");
    expect(
      versionSlugOf({ brand: "Exeed", model: "Yaoguang C-DM", trim: "Global Édition", year: 2026 }),
    ).toBe("exeed-yaoguang-c-dm-global-edition-2026");
  });

  it("ignore les composantes absentes", () => {
    expect(versionSlugOf({ brand: "BYD", model: "Song L", trim: null, year: null })).toBe(
      "byd-song-l",
    );
  });
});

describe("une seule carte par version", () => {
  it("additionne les vehicules de toutes les configurations", () => {
    expect(versionAvailableCount(uniKVersion())).toBe(9);
  });

  it("regroupe les pastilles par teinte exacte, la plus fournie d'abord", () => {
    const options = exteriorOptionsOf(uniKVersion());

    expect(options.map((option) => option.label)).toEqual([
      "Blanc",
      "Gris crème",
      "Bleu",
      "Gris",
      "Gris cendre",
    ]);
    expect(options.map((option) => option.availableCount)).toEqual([3, 3, 1, 1, 1]);
  });

  it("distingue Gris, Gris creme et Gris cendre, qui sont trois teintes", () => {
    const labels = exteriorOptionsOf(uniKVersion()).map((option) => option.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("expose les teintes de base pour le filtre de la vitrine", () => {
    expect(exteriorBaseFilterOptions([uniKVersion()])).toEqual(["Blanc", "Gris"]);
  });

  it("reconnait une version par sa teinte de base, accents mis de cote", () => {
    expect(versionHasExteriorBase(uniKVersion(), "gris")).toBe(true);
    expect(versionHasExteriorBase(uniKVersion(), "Noir")).toBe(false);
  });
});

describe("interieurs compatibles avec la teinte choisie", () => {
  it("ne propose que les interieurs qui existent pour Gris creme", () => {
    const interiors = interiorOptionsFor(uniKVersion(), "Gris crème");

    expect(interiors.map((option) => option.label)).toEqual(["Noir", "Terracotta"]);
    expect(interiors.map((option) => option.code)).toEqual(["CFG-16", "CFG-17"]);
    expect(interiors.map((option) => option.availableCount)).toEqual([2, 1]);
  });

  it("signale la sentinelle d'interieur non releve", () => {
    const interiors = interiorOptionsFor(uniKVersion(), "Gris cendre");

    expect(interiors).toHaveLength(1);
    expect(interiors[0].isToComplete).toBe(true);
  });

  it("ne renvoie rien pour une teinte absente du stock", () => {
    expect(interiorOptionsFor(uniKVersion(), "Rouge")).toEqual([]);
  });
});

describe("configuration par defaut et configuration initiale", () => {
  it("retient la configuration marquee par defaut en base", () => {
    expect(defaultConfigurationOf(uniKVersion())?.code).toBe("CFG-12");
  });

  it("retient la plus fournie, puis le code le plus petit, sans marqueur", () => {
    const version = uniKVersion({
      configurations: [
        configuration("CFG-17", "Gris", "Gris crème", "Terracotta", 2),
        configuration("CFG-16", "Gris", "Gris crème", "Noir", 2),
        configuration("CFG-14", "Gris", "Gris", "Noir", 1),
      ],
    });

    expect(defaultConfigurationOf(version)?.code).toBe("CFG-16");
  });

  it("donne la priorite au code de l'adresse", () => {
    expect(resolveInitialConfiguration(uniKVersion(), { code: "cfg-17" })?.code).toBe("CFG-17");
  });

  it("retombe sur le filtre de teinte quand le code est inconnu", () => {
    const resolved = resolveInitialConfiguration(uniKVersion(), {
      code: "CFG-99",
      exteriorColorBase: "Gris",
    });

    // Gris compte CFG-16 avec deux vehicules, les autres un seul.
    expect(resolved?.code).toBe("CFG-16");
  });

  it("retombe sur la configuration par defaut sans selection", () => {
    expect(resolveInitialConfiguration(uniKVersion())?.code).toBe("CFG-12");
  });
});

describe("changement de teinte", () => {
  it("conserve l'interieur courant quand la nouvelle teinte le propose", () => {
    const version = uniKVersion();
    const from = findConfigurationByCode(version, "CFG-13");

    const to = configurationForExterior(version, "Gris crème", from?.interiorColorLabel);

    expect(from?.interiorColorLabel).toBe("Terracotta");
    expect(to?.code).toBe("CFG-17");
    expect(to?.interiorColorLabel).toBe("Terracotta");
  });

  it("prend l'interieur le plus fourni quand l'interieur courant n'existe pas", () => {
    const version = uniKVersion();

    const to = configurationForExterior(version, "Gris cendre", "Terracotta");

    expect(to?.code).toBe("CFG-15");
    expect(to?.interiorColorLabel).toBe("À compléter");
  });

  it("ne renvoie rien pour une teinte hors stock", () => {
    expect(configurationForExterior(uniKVersion(), "Violet", "Noir")).toBeNull();
  });
});

describe("regle d'or : les images suivent la configuration", () => {
  it("n'expose que le canevas de la configuration, dans l'ordre C01 a C10", () => {
    const published = configuration("CFG-16", "Gris", "Gris crème", "Noir", 2, {
      isMediaPublished: true,
      canvas: canvas("CFG-16", ["C04", "C01", "C06"]),
    });

    expect(sceneImagesOf(published).map((image) => image.slot)).toEqual(["C01", "C04", "C06"]);
    expect(sceneImagesOf(published).every((image) => image.url.includes("CFG-16"))).toBe(true);
  });

  it("n'emprunte jamais le canevas d'une autre configuration", () => {
    const version = uniKVersion({
      configurations: [
        configuration("CFG-16", "Gris", "Gris crème", "Noir", 2, {
          isMediaPublished: true,
          canvas: canvas("CFG-16", ["C01", "C02", "C03"]),
        }),
        configuration("CFG-17", "Gris", "Gris crème", "Terracotta", 1),
      ],
    });

    const withoutMedia = findConfigurationByCode(version, "CFG-17");

    expect(sceneImagesOf(withoutMedia)).toEqual([]);
    expect(cardImageOf(version, withoutMedia)).toBeNull();
  });

  it("utilise les photos du vehicule a defaut de canevas valide", () => {
    const withVehiclePhoto = configuration("CFG-15", "Gris", "Gris cendre", "À compléter", 1, {
      vehiclePhotos: [vehiclePhoto("CFG-15")],
    });

    const images = sceneImagesOf(withVehiclePhoto);

    expect(images).toHaveLength(1);
    expect(images[0].slot).toBeNull();
    expect(images[0].origin).toBe("VEHICULE");
  });

  it("affiche le visuel constructeur signale quand la configuration n'a aucune image", () => {
    const version = uniKVersion({ manufacturerVisual: MANUFACTURER_VISUAL });
    const withoutMedia = findConfigurationByCode(version, "CFG-14");

    expect(sceneFallbackOf(version, withoutMedia)).toEqual({
      kind: "MANUFACTURER",
      image: MANUFACTURER_VISUAL,
    });
    expect(cardImageOf(version, withoutMedia)).toEqual(MANUFACTURER_VISUAL);
  });

  it("affiche un etat vide quand il n'existe aucune image, jamais une fausse photo", () => {
    const version = uniKVersion();

    expect(sceneFallbackOf(version, findConfigurationByCode(version, "CFG-14"))).toEqual({
      kind: "EMPTY",
    });
  });

  it("ne declare aucun repli quand la configuration a ses propres images", () => {
    const version = uniKVersion({ manufacturerVisual: MANUFACTURER_VISUAL });
    const published = configuration("CFG-12", "Blanc", "Blanc", "Noir", 2, {
      isMediaPublished: true,
      canvas: canvas("CFG-12", ["C01"]),
    });

    expect(sceneFallbackOf(version, published)).toEqual({ kind: "NONE" });
  });

  it("prend le C01 comme photo de carte, avant toute autre image", () => {
    const version = uniKVersion({ manufacturerVisual: MANUFACTURER_VISUAL });
    const published = configuration("CFG-12", "Blanc", "Blanc", "Noir", 2, {
      isMediaPublished: true,
      canvas: canvas("CFG-12", ["C03", "C01"]),
      vehiclePhotos: [vehiclePhoto("CFG-12")],
    });

    expect(cardImageOf(version, published)?.url).toContain("C01");
  });
});

describe("conservation de l'angle au changement de configuration", () => {
  const withSlots = (code: string, slots: CanvasSlot[]) =>
    configuration(code, "Gris", "Gris crème", "Noir", 1, {
      isMediaPublished: true,
      canvas: canvas(code, slots),
    });

  it("conserve la vue courante quand la nouvelle configuration la possede", () => {
    expect(preserveSceneKey("C04", withSlots("CFG-17", ["C01", "C04", "C06"]))).toBe("C04");
  });

  it("repart de la premiere vue quand la vue courante n'existe pas", () => {
    expect(preserveSceneKey("C04", withSlots("CFG-17", ["C02", "C06"]))).toBe("C02");
  });

  it("ne renvoie aucune vue quand la configuration n'a pas d'image", () => {
    expect(preserveSceneKey("C04", configuration("CFG-17", "Gris", "Gris", "Noir", 1))).toBeNull();
  });
});

describe("modes de la scene", () => {
  it("n'offre que la galerie tant que la configuration a des images", () => {
    const withPhoto = configuration("CFG-15", "Gris", "Gris cendre", "À compléter", 1, {
      vehiclePhotos: [vehiclePhoto("CFG-15")],
    });

    expect(availableSceneModes(withPhoto)).toEqual(["gallery"]);
    expect(clampSceneMode("spin", withPhoto)).toBe("gallery");
    expect(clampSceneMode("interior", withPhoto)).toBe("gallery");
  });

  it("n'offre aucun mode quand la configuration n'a aucune image", () => {
    expect(availableSceneModes(configuration("CFG-14", "Gris", "Gris", "Noir", 1))).toEqual([]);
  });

  it("annonce les trois modes, la vue 360 et l'interieur encore indisponibles", () => {
    const withSpinMedia = configuration("CFG-12", "Blanc", "Blanc", "Noir", 2, {
      isMediaPublished: true,
      canvas: canvas("CFG-12", ["C01"]),
      spinFrameCount: 36,
      hasInteriorPanorama: true,
    });

    expect(sceneModeOffers(withSpinMedia)).toEqual([
      { mode: "gallery", isAvailable: true },
      // Medias presents mais rendu non livre : le bouton reste desactive.
      { mode: "spin", isAvailable: false },
      { mode: "interior", isAvailable: false },
    ]);
  });
});

describe("visibilite d'une version sur la vitrine", () => {
  it("masque une version sans aucun vehicule disponible", () => {
    const empty = uniKVersion({
      configurations: [configuration("CFG-12", "Blanc", "Blanc", "Noir", 0)],
    });

    expect(isVersionVisible(empty, false)).toBe(false);
    expect(isVersionVisible(empty, true)).toBe(false);
  });

  it("montre une version en stock tant que les medias ne sont pas exiges", () => {
    expect(isVersionVisible(uniKVersion(), false)).toBe(true);
    expect(visibleVersions([uniKVersion()], false)).toHaveLength(1);
  });

  it("masque une version sans canevas valide une fois les medias exiges", () => {
    expect(isVersionVisible(uniKVersion(), true)).toBe(false);
    expect(visibleVersions([uniKVersion()], true)).toHaveLength(0);
  });

  it("montre une version des qu'une configuration a un canevas valide", () => {
    const version = uniKVersion({
      configurations: [
        configuration("CFG-12", "Blanc", "Blanc", "Noir", 2, {
          isMediaPublished: true,
          canvas: canvas("CFG-12", ["C01"]),
        }),
      ],
    });

    expect(isVersionVisible(version, true)).toBe(true);
  });
});

describe("version construite depuis un vehicule isole", () => {
  const baseVehicle = {
    id: "veh-1",
    brand: "Changan",
    model: "Uni-K",
    variant: "YUESHANG",
    year: 2024,
    energy: "ESSENCE",
    vehicleType: "SUV",
    transmission: "AUTOMATIQUE",
    color: "Blanche",
    interiorColor: "Terracotta (rouge)",
    mileage: 12,
    priceXof: 0,
    status: "EN_MAGASIN",
    mainPhotoUrl: "https://exemple.test/veh-1/main.jpg",
    interiorPhotoUrl: "https://exemple.test/veh-1/interior.jpg",
    exteriorPhotoUrl: null,
    rearPhotoUrl: null,
    seatsPhotoUrl: "https://exemple.test/veh-1/seats.jpg",
  };

  it("normalise la teinte et l'interieur du vehicule", () => {
    const version = catalogVersionFromVehicle(baseVehicle);
    const [only] = version.configurations;

    expect(version.configurations).toHaveLength(1);
    expect(only.exteriorColorLabel).toBe("Blanc");
    expect(only.interiorColorLabel).toBe("Terracotta");
    expect(only.isDefault).toBe(true);
  });

  it("ecarte les vues d'habitacle non verifiees", () => {
    const version = catalogVersionFromVehicle(baseVehicle);

    expect(sceneImagesOf(version.configurations[0]).map((image) => image.key)).toEqual([
      "principale",
    ]);
  });

  it("accepte les vues d'habitacle verifiees", () => {
    const version = catalogVersionFromVehicle({ ...baseVehicle, photosVerified: true });

    expect(sceneImagesOf(version.configurations[0]).map((image) => image.key)).toEqual([
      "principale",
      "interieur",
      "sieges",
    ]);
  });

  it("n'invente aucun visuel constructeur", () => {
    expect(catalogVersionFromVehicle(baseVehicle).manufacturerVisual).toBeNull();
  });
});
