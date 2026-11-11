import { describe, expect, it } from "vitest";
import {
  buildShowroomMediaPlan,
  countByKind,
  parseShowroomMediaFile,
} from "./showroom-media-plan";

describe("parseShowroomMediaFile", () => {
  it("reconnait une vue du canevas", () => {
    expect(parseShowroomMediaFile("CFG-01", "CFG-01_C03.jpg")).toMatchObject({
      kind: "CANVAS",
      slot: "C03",
      frameIndex: -1,
    });
  });

  it("reconnait une vue 360 et convertit la numerotation", () => {
    expect(parseShowroomMediaFile("CFG-01", "360/001.jpg")).toMatchObject({
      kind: "SPIN_EXTERIOR",
      slot: "NA",
      frameIndex: 0,
    });
  });

  it("reconnait le panorama interieur", () => {
    expect(parseShowroomMediaFile("CFG-01", "Intérieur 360/panorama.jpg")).toMatchObject({
      kind: "INTERIOR_PANORAMA",
      slot: "NA",
      frameIndex: -1,
    });
  });

  it("reconnait une photo de detail interieur", () => {
    expect(parseShowroomMediaFile("CFG-01", "Intérieur 360/detail-volant.jpg")).toMatchObject({
      kind: "DETAIL",
    });
  });

  it("refuse une vue hors canevas", () => {
    expect(parseShowroomMediaFile("CFG-01", "CFG-01_C11.jpg")).toBeNull();
  });

  it("refuse une vignette 360 hors plage", () => {
    expect(parseShowroomMediaFile("CFG-01", "360/037.jpg")).toBeNull();
  });

  it("refuse un fichier non image", () => {
    expect(parseShowroomMediaFile("CFG-01", "notes.txt")).toBeNull();
  });
});

describe("buildShowroomMediaPlan", () => {
  it("agrege les dossiers et signale les fichiers inconnus", () => {
    const plan = buildShowroomMediaPlan([
      {
        configurationCode: "CFG-01",
        files: ["CFG-01_C01.jpg", "CFG-01_C02.jpg", "lisez-moi.txt"],
      },
      {
        configurationCode: "CFG-02",
        files: ["360/001.jpg"],
      },
    ]);

    expect(plan.folders).toBe(2);
    expect(plan.entries).toHaveLength(3);
    expect(plan.warnings).toHaveLength(1);
    expect(countByKind(plan.entries)).toMatchObject({ CANVAS: 2, SPIN_EXTERIOR: 1 });
  });

  it("signale un code de dossier invalide", () => {
    const plan = buildShowroomMediaPlan([{ configurationCode: "UNI-K", files: [] }]);
    expect(plan.entries).toHaveLength(0);
    expect(plan.warnings[0]).toContain("code de configuration invalide");
  });
});
