import { describe, expect, it } from "vitest";
import {
  autoMapHeaders,
  buildUniqueHeaders,
  detectHeaderRowIndex,
  headerScore,
  normalizeEmail,
  normalizeHeader,
  normalizePhone,
} from "@/lib/client-import";

describe("normalizePhone", () => {
  it("met au format international un numero beninois a 8 chiffres", () => {
    expect(normalizePhone("97 88 99 00")).toBe("+229 01 97 88 99 00");
  });

  it("met au format international un numero local a 10 chiffres", () => {
    expect(normalizePhone("0196445566")).toBe("+229 01 96 44 55 66");
  });

  it("conserve un numero deja prefixe par l'indicatif 229", () => {
    expect(normalizePhone("+229 01 97 11 22 33")).toBe("+229 01 97 11 22 33");
  });

  it("donne la meme ecriture a un numero saisi en local et avec indicatif", () => {
    expect(normalizePhone("0196445566")).toBe(normalizePhone("+229 96 44 55 66"));
  });

  it("laisse intact un numero international non beninois", () => {
    expect(normalizePhone("+33 6 12 34 56 78")).toBe("+33612345678");
  });

  it("renvoie null quand la cellule est vide ou sans chiffre", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("   ")).toBeNull();
    expect(normalizePhone("sans numero")).toBeNull();
  });
});

describe("normalizeEmail", () => {
  it("met en minuscules et retire les espaces", () => {
    expect(normalizeEmail("  Jean.DOSSOU@Example.BJ ")).toBe("jean.dossou@example.bj");
  });

  it("renvoie null quand la cellule est vide", () => {
    expect(normalizeEmail("   ")).toBeNull();
  });
});

describe("normalizeHeader", () => {
  it("ignore la casse, les accents et la ponctuation", () => {
    expect(normalizeHeader("  Téléphone / Mobile  ")).toBe("telephone mobile");
  });
});

describe("autoMapHeaders", () => {
  it("reconnait les en-tetes du modele CARZONE", () => {
    const mapping = autoMapHeaders([
      "Nom du contact",
      "Société",
      "E-mail",
      "Téléphone",
      "Ville",
      "Adresse",
      "IFU",
      "Catégorie",
      "Notes",
    ]);
    expect(mapping.contactName).toBe("Nom du contact");
    expect(mapping.companyName).toBe("Société");
    expect(mapping.email).toBe("E-mail");
    expect(mapping.phone).toBe("Téléphone");
    expect(mapping.ifu).toBe("IFU");
  });

  it("reconnait des en-tetes abreges, en majuscules et sans accent", () => {
    const mapping = autoMapHeaders(["NOM", "ENTREPRISE", "MAIL", "TEL", "VILLE", "NIF"]);
    expect(mapping.contactName).toBe("NOM");
    expect(mapping.companyName).toBe("ENTREPRISE");
    expect(mapping.email).toBe("MAIL");
    expect(mapping.phone).toBe("TEL");
    expect(mapping.ifu).toBe("NIF");
  });

  it("rabat le nom du contact sur la premiere colonne libre si rien ne correspond", () => {
    const mapping = autoMapHeaders(["Colonne 1", "Colonne 2"]);
    expect(mapping.contactName).toBe("Colonne 1");
  });
});

describe("headerScore", () => {
  it("note une vraie ligne d'en-tetes au-dessus d'un titre de classeur", () => {
    const title = headerScore(["LISTE CLIENTS CARZONE", "", "", ""]);
    const header = headerScore(["Nom du contact", "Société", "E-mail", "Téléphone"]);
    expect(header).toBeGreaterThan(title);
  });

  it("ne note pas une ligne contenant une seule cellule remplie", () => {
    expect(headerScore(["Nom du contact", "", ""])).toBe(0);
  });
});

describe("detectHeaderRowIndex", () => {
  it("retient la ligne d'en-tetes meme precedee d'un titre et d'une ligne vide", () => {
    const matrix = [
      ["LISTE CLIENTS CARZONE", "", ""],
      ["", "", ""],
      ["Nom du contact", "Téléphone", "Ville"],
      ["Hervé Agbodjan", "+229 01 97 11 22 33", "Cotonou"],
    ];
    expect(detectHeaderRowIndex(matrix)).toBe(2);
  });

  it("retient la premiere ligne quand les en-tetes sont standards", () => {
    const matrix = [
      ["Nom du contact", "Téléphone"],
      ["Awa Bio", "+229 01 96 00 00 00"],
    ];
    expect(detectHeaderRowIndex(matrix)).toBe(0);
  });

  it("retombe sur la premiere ligne non vide quand aucun en-tete n'est reconnu", () => {
    const matrix = [
      ["", ""],
      ["aaa", "bbb"],
      ["ccc", "ddd"],
    ];
    expect(detectHeaderRowIndex(matrix)).toBe(1);
  });

  it("renvoie -1 pour une feuille entierement vide", () => {
    expect(detectHeaderRowIndex([["", ""], ["", ""]])).toBe(-1);
  });
});

describe("buildUniqueHeaders", () => {
  it("nomme les colonnes vides et desambigue les doublons", () => {
    expect(buildUniqueHeaders(["Nom", "", "Nom", "Nom"])).toEqual([
      "Nom",
      "Colonne 2",
      "Nom (2)",
      "Nom (3)",
    ]);
  });
});
