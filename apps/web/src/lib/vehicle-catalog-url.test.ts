import { describe, expect, it } from "vitest";
import {
  buildCatalogHref,
  buildCatalogSearch,
  EMPTY_CATALOG_URL_STATE,
  parseCatalogUrlState,
  parseSceneMode,
  sceneModeToken,
} from "@/lib/vehicle-catalog-url";

const CATALOG_PATH = "/vehicules";

describe("parseCatalogUrlState", () => {
  it("lit la version, la configuration, le mode et le filtre de teinte", () => {
    expect(
      parseCatalogUrlState({
        v: "changan-uni-k-yueshang-2024",
        c: "cfg-17",
        mode: "360",
        couleur: "Gris",
      }),
    ).toEqual({
      versionSlug: "changan-uni-k-yueshang-2024",
      configurationCode: "CFG-17",
      mode: "spin",
      exteriorColorBase: "Gris",
    });
  });

  it("accepte un URLSearchParams du navigateur", () => {
    const params = new URLSearchParams("v=exeed-yaoguang-global-edition-2026&c=CFG-21");

    expect(parseCatalogUrlState(params)).toEqual({
      versionSlug: "exeed-yaoguang-global-edition-2026",
      configurationCode: "CFG-21",
      mode: null,
      exteriorColorBase: null,
    });
  });

  it("retient la premiere valeur d'un parametre repete", () => {
    expect(parseCatalogUrlState({ c: ["cfg-16", "cfg-17"] }).configurationCode).toBe("CFG-16");
  });

  it("ignore les valeurs vides et les parametres absents", () => {
    expect(parseCatalogUrlState({ v: "   ", mode: "" })).toEqual(EMPTY_CATALOG_URL_STATE);
    expect(parseCatalogUrlState(undefined)).toEqual(EMPTY_CATALOG_URL_STATE);
  });

  it("ignore un mode inconnu sans casser l'ouverture", () => {
    expect(parseCatalogUrlState({ mode: "hologramme" }).mode).toBeNull();
  });
});

describe("parseSceneMode", () => {
  it("reconnait les jetons canoniques du cahier des charges", () => {
    expect(parseSceneMode("galerie")).toBe("gallery");
    expect(parseSceneMode("360")).toBe("spin");
    expect(parseSceneMode("interieur")).toBe("interior");
  });

  it("reconnait aussi les equivalents anglais", () => {
    expect(parseSceneMode("gallery")).toBe("gallery");
    expect(parseSceneMode("SPIN")).toBe("spin");
    expect(parseSceneMode("Interior")).toBe("interior");
  });
});

describe("buildCatalogSearch", () => {
  it("ecrit les parametres dans un ordre stable", () => {
    expect(
      buildCatalogSearch({
        mode: "spin",
        configurationCode: "CFG-17",
        versionSlug: "changan-uni-k-yueshang-2024",
        exteriorColorBase: "Gris",
      }),
    ).toBe("?couleur=Gris&v=changan-uni-k-yueshang-2024&c=CFG-17&mode=360");
  });

  it("ne produit rien quand il n'y a pas d'etat a porter", () => {
    expect(buildCatalogSearch({})).toBe("");
    expect(buildCatalogHref(CATALOG_PATH, {})).toBe(CATALOG_PATH);
  });

  it("porte le seul filtre de teinte quand aucune fiche n'est ouverte", () => {
    expect(buildCatalogHref(CATALOG_PATH, { exteriorColorBase: "Blanc" })).toBe(
      "/vehicules?couleur=Blanc",
    );
  });
});

describe("aller-retour adresse vers etat", () => {
  it("rouvre exactement la meme version, la meme configuration et le meme mode", () => {
    const state = {
      versionSlug: "changan-uni-k-yueshang-2024",
      configurationCode: "CFG-16",
      mode: "interior" as const,
      exteriorColorBase: "Gris",
    };

    const search = buildCatalogSearch(state);
    const reread = parseCatalogUrlState(new URLSearchParams(search.replace(/^\?/, "")));

    expect(reread).toEqual(state);
  });

  it("produit les trois jetons de mode attendus dans l'adresse", () => {
    expect(sceneModeToken("gallery")).toBe("galerie");
    expect(sceneModeToken("spin")).toBe("360");
    expect(sceneModeToken("interior")).toBe("interieur");
  });
});
