import { describe, expect, it } from "vitest";

import {
  computeMediaCompleteness,
  vehicleMediaInputSchema,
  CANVAS_SLOTS,
  FRAME_INDEX_NOT_APPLICABLE,
  SLOT_NOT_APPLICABLE,
  SPIN_FRAME_COUNT,
  type MediaCompletenessSource,
  type VehicleMediaKindValue,
} from "@/lib/vehicle-media";

/** Media minimal valide, surchargeable champ par champ. */
function media(overrides: Record<string, unknown> = {}) {
  return {
    configurationId: "cfg_abc",
    kind: "CANVAS",
    slot: "C01",
    frameIndex: FRAME_INDEX_NOT_APPLICABLE,
    url: "https://exemple.test/cfg-12-c01.webp",
    width: 3000,
    height: 2000,
    ...overrides,
  };
}

function parse(overrides: Record<string, unknown> = {}) {
  return vehicleMediaInputSchema.safeParse(media(overrides));
}

/** Raccourci de fabrication pour la matrice de completude. */
function entry(
  kind: VehicleMediaKindValue,
  slot: string = SLOT_NOT_APPLICABLE,
  frameIndex: number = FRAME_INDEX_NOT_APPLICABLE,
): MediaCompletenessSource {
  return { kind, slot, frameIndex };
}

describe("vehicleMediaInputSchema sur le canevas", () => {
  it("accepte les dix vues du canevas", () => {
    for (const slot of CANVAS_SLOTS) {
      expect(parse({ slot }).success).toBe(true);
    }
  });

  it("refuse un canevas sans vue, sentinelle comprise", () => {
    const result = parse({ slot: SLOT_NOT_APPLICABLE });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain("slot");
  });

  it("refuse une vue de canevas hors C01 a C10", () => {
    expect(parse({ slot: "C11" }).success).toBe(false);
    expect(parse({ slot: "c01" }).success).toBe(false);
  });

  it("refuse un canevas porteur d un frameIndex de vue 360", () => {
    const result = parse({ slot: "C01", frameIndex: 5 });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain("frameIndex");
  });

  it("applique les sentinelles par defaut", () => {
    const result = vehicleMediaInputSchema.safeParse({
      configurationId: "cfg_abc",
      kind: "CANVAS",
      slot: "C03",
      url: "https://exemple.test/cfg-12-c03.webp",
      width: 3000,
      height: 2000,
    });
    expect(result.success).toBe(true);
    expect(result.data?.frameIndex).toBe(FRAME_INDEX_NOT_APPLICABLE);
    expect(result.data?.source).toBe("SHOWROOM");
  });
});

describe("vehicleMediaInputSchema sur la vue 360", () => {
  it("accepte les 36 images du tour complet", () => {
    for (let frameIndex = 0; frameIndex < SPIN_FRAME_COUNT; frameIndex += 1) {
      const result = parse({
        kind: "SPIN_EXTERIOR",
        slot: SLOT_NOT_APPLICABLE,
        frameIndex,
      });
      expect(result.success).toBe(true);
    }
  });

  it("refuse un frameIndex de 36 ou plus", () => {
    const result = parse({
      kind: "SPIN_EXTERIOR",
      slot: SLOT_NOT_APPLICABLE,
      frameIndex: SPIN_FRAME_COUNT,
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain("frameIndex");
  });

  it("refuse un frameIndex negatif, sentinelle comprise", () => {
    expect(
      parse({ kind: "SPIN_EXTERIOR", slot: SLOT_NOT_APPLICABLE, frameIndex: -1 }).success,
    ).toBe(false);
    expect(
      parse({ kind: "SPIN_EXTERIOR", slot: SLOT_NOT_APPLICABLE, frameIndex: -5 }).success,
    ).toBe(false);
  });

  it("refuse une vue 360 porteuse d une vue de canevas", () => {
    const result = parse({ kind: "SPIN_EXTERIOR", slot: "C01", frameIndex: 0 });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain("slot");
  });
});

describe("vehicleMediaInputSchema sur le panorama et le detail", () => {
  it("accepte un panorama interieur avec les deux sentinelles", () => {
    const result = parse({
      kind: "INTERIOR_PANORAMA",
      slot: SLOT_NOT_APPLICABLE,
      frameIndex: FRAME_INDEX_NOT_APPLICABLE,
      width: 6000,
      height: 3000,
    });
    expect(result.success).toBe(true);
  });

  it("refuse un panorama porteur d un frameIndex", () => {
    const result = parse({
      kind: "INTERIOR_PANORAMA",
      slot: SLOT_NOT_APPLICABLE,
      frameIndex: 0,
    });
    expect(result.success).toBe(false);
  });

  it("refuse un detail porteur d une vue de canevas", () => {
    expect(parse({ kind: "DETAIL", slot: "C06" }).success).toBe(false);
    expect(parse({ kind: "DETAIL", slot: SLOT_NOT_APPLICABLE }).success).toBe(true);
  });
});

describe("vehicleMediaInputSchema sur les champs communs", () => {
  it("refuse des dimensions nulles ou negatives", () => {
    expect(parse({ width: 0 }).success).toBe(false);
    expect(parse({ height: -1 }).success).toBe(false);
  });

  it("refuse une URL vide et une configuration vide", () => {
    expect(parse({ url: "" }).success).toBe(false);
    expect(parse({ configurationId: "" }).success).toBe(false);
  });

  it("refuse une source hors jeu de valeurs", () => {
    expect(parse({ source: "INTERNET" }).success).toBe(false);
    expect(parse({ source: "CONSTRUCTEUR" }).success).toBe(true);
  });

  it("refuse un type de media inconnu", () => {
    expect(parse({ kind: "VIDEO" }).success).toBe(false);
  });
});

describe("computeMediaCompleteness", () => {
  it("rend une configuration vide entierement incomplete", () => {
    const completeness = computeMediaCompleteness([]);
    expect(completeness.canvasSlots).toEqual([]);
    expect(completeness.missingCanvasSlots).toEqual([...CANVAS_SLOTS]);
    expect(completeness.spinFrameCount).toBe(0);
    expect(completeness.hasFullSpin).toBe(false);
    expect(completeness.hasInteriorPanorama).toBe(false);
    expect(completeness.isCanvasComplete).toBe(false);
  });

  it("classe les vues du canevas dans l ordre C01 a C10", () => {
    const completeness = computeMediaCompleteness([
      entry("CANVAS", "C05"),
      entry("CANVAS", "C01"),
      entry("CANVAS", "C03"),
    ]);
    expect(completeness.canvasSlots).toEqual(["C01", "C03", "C05"]);
    expect(completeness.missingCanvasSlots).toEqual([
      "C02",
      "C04",
      "C06",
      "C07",
      "C08",
      "C09",
      "C10",
    ]);
    expect(completeness.isCanvasComplete).toBe(false);
  });

  it("marque le canevas complet a partir des dix vues", () => {
    const completeness = computeMediaCompleteness(
      CANVAS_SLOTS.map((slot) => entry("CANVAS", slot)),
    );
    expect(completeness.isCanvasComplete).toBe(true);
    expect(completeness.missingCanvasSlots).toEqual([]);
  });

  it("ignore les doublons de vue et de frame", () => {
    const completeness = computeMediaCompleteness([
      entry("CANVAS", "C01"),
      entry("CANVAS", "C01"),
      entry("SPIN_EXTERIOR", SLOT_NOT_APPLICABLE, 0),
      entry("SPIN_EXTERIOR", SLOT_NOT_APPLICABLE, 0),
    ]);
    expect(completeness.canvasSlots).toEqual(["C01"]);
    expect(completeness.spinFrameCount).toBe(1);
  });

  it("reconnait un tour 360 complet et refuse un tour partiel", () => {
    const frames = Array.from({ length: SPIN_FRAME_COUNT }, (_unused, index) =>
      entry("SPIN_EXTERIOR", SLOT_NOT_APPLICABLE, index),
    );
    expect(computeMediaCompleteness(frames).hasFullSpin).toBe(true);
    expect(computeMediaCompleteness(frames.slice(0, 35)).hasFullSpin).toBe(false);
    expect(computeMediaCompleteness(frames.slice(0, 35)).spinFrameCount).toBe(35);
  });

  it("ignore un frame hors plage pour le decompte du tour", () => {
    const completeness = computeMediaCompleteness([
      entry("SPIN_EXTERIOR", SLOT_NOT_APPLICABLE, SPIN_FRAME_COUNT),
      entry("SPIN_EXTERIOR", SLOT_NOT_APPLICABLE, -1),
      entry("SPIN_EXTERIOR", SLOT_NOT_APPLICABLE, 0),
    ]);
    expect(completeness.spinFrameCount).toBe(1);
  });

  it("detecte le panorama interieur", () => {
    expect(computeMediaCompleteness([entry("INTERIOR_PANORAMA")]).hasInteriorPanorama).toBe(true);
    expect(computeMediaCompleteness([entry("DETAIL")]).hasInteriorPanorama).toBe(false);
  });
});
