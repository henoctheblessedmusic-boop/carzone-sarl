/**
 * Validation des médias d'une configuration : canevas C01 à C10, vue 360,
 * panorama intérieur et photos de détail.
 *
 * Prisma ne sait pas exprimer la cohérence entre kind, slot et frameIndex :
 * il faudrait une contrainte CHECK. Elle est donc tenue ici, et c'est le seul
 * point de passage autorisé pour écrire un VehicleMedia.
 */

import { z } from "zod";

/** Les 10 vues du canevas photo imposé, dans l'ordre d'affichage de la galerie. */
export const CANVAS_SLOTS = [
  "C01",
  "C02",
  "C03",
  "C04",
  "C05",
  "C06",
  "C07",
  "C08",
  "C09",
  "C10",
] as const;

export type CanvasSlot = (typeof CANVAS_SLOTS)[number];

/** Libellé métier de chaque vue, tel qu'il figure au plan de prise de vue. */
export const CANVAS_SLOT_LABELS: Record<CanvasSlot, string> = {
  C01: "Trois-quarts avant",
  C02: "Face avant",
  C03: "Profil",
  C04: "Trois-quarts arrière",
  C05: "Face arrière",
  C06: "Tableau de bord",
  C07: "Sièges avant",
  C08: "Sièges arrière",
  C09: "Coffre",
  C10: "Moteur",
};

/** Un tour complet : une image tous les 10 degrés. */
export const SPIN_FRAME_COUNT = 36;
/** Sentinelle de slot pour tout ce qui n'est pas un canevas. Voir le schéma Prisma. */
export const SLOT_NOT_APPLICABLE = "NA";
/** Sentinelle de frameIndex pour tout ce qui n'est pas une vue 360. */
export const FRAME_INDEX_NOT_APPLICABLE = -1;

export const VEHICLE_MEDIA_KINDS = [
  "CANVAS",
  "SPIN_EXTERIOR",
  "INTERIOR_PANORAMA",
  "DETAIL",
] as const;
export const VEHICLE_MEDIA_SOURCES = ["SHOWROOM", "CONSTRUCTEUR"] as const;
export const CONFIGURATION_MEDIA_STATUSES = [
  "A_PHOTOGRAPHIER",
  "EN_VALIDATION",
  "PUBLIE",
] as const;

export type VehicleMediaKindValue = (typeof VEHICLE_MEDIA_KINDS)[number];

const canvasSlotSchema = z.enum(CANVAS_SLOTS);

const baseMediaSchema = z.object({
  configurationId: z.string().min(1, "Configuration requise"),
  kind: z.enum(VEHICLE_MEDIA_KINDS),
  slot: z.string().default(SLOT_NOT_APPLICABLE),
  frameIndex: z.number().int().default(FRAME_INDEX_NOT_APPLICABLE),
  url: z.string().min(1, "URL requise"),
  urlMobile: z.string().min(1).nullish(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataUrl: z.string().min(1).nullish(),
  source: z.enum(VEHICLE_MEDIA_SOURCES).default("SHOWROOM"),
});

/**
 * Média validé : les sentinelles sont imposées hors canevas et hors 360, pour
 * que l'unicité @@unique([configurationId, kind, slot, frameIndex]) protège
 * réellement (en PostgreSQL deux valeurs nulles sont considérées distinctes).
 */
export const vehicleMediaInputSchema = baseMediaSchema.superRefine((value, ctx) => {
  if (value.kind === "CANVAS") {
    if (!canvasSlotSchema.safeParse(value.slot).success) {
      ctx.addIssue({
        code: "custom",
        path: ["slot"],
        message: `Vue du canevas attendue parmi ${CANVAS_SLOTS.join(", ")}`,
      });
    }
    if (value.frameIndex !== FRAME_INDEX_NOT_APPLICABLE) {
      ctx.addIssue({
        code: "custom",
        path: ["frameIndex"],
        message: `frameIndex doit valoir ${FRAME_INDEX_NOT_APPLICABLE} pour un canevas`,
      });
    }
    return;
  }

  if (value.slot !== SLOT_NOT_APPLICABLE) {
    ctx.addIssue({
      code: "custom",
      path: ["slot"],
      message: `slot doit valoir "${SLOT_NOT_APPLICABLE}" hors canevas`,
    });
  }

  if (value.kind === "SPIN_EXTERIOR") {
    if (value.frameIndex < 0 || value.frameIndex >= SPIN_FRAME_COUNT) {
      ctx.addIssue({
        code: "custom",
        path: ["frameIndex"],
        message: `frameIndex doit être compris entre 0 et ${SPIN_FRAME_COUNT - 1}`,
      });
    }
    return;
  }

  if (value.frameIndex !== FRAME_INDEX_NOT_APPLICABLE) {
    ctx.addIssue({
      code: "custom",
      path: ["frameIndex"],
      message: `frameIndex doit valoir ${FRAME_INDEX_NOT_APPLICABLE} pour un média ${value.kind}`,
    });
  }
});

export type VehicleMediaInput = z.infer<typeof vehicleMediaInputSchema>;

export type MediaCompletenessSource = {
  kind: VehicleMediaKindValue;
  slot: string;
  frameIndex: number;
};

export type MediaCompleteness = {
  /** Vues du canevas présentes, dans l'ordre C01 à C10. */
  canvasSlots: CanvasSlot[];
  missingCanvasSlots: CanvasSlot[];
  spinFrameCount: number;
  hasFullSpin: boolean;
  hasInteriorPanorama: boolean;
  /** Vrai si le canevas est complet : condition minimale d'une publication. */
  isCanvasComplete: boolean;
};

/**
 * Complétude d'une configuration, pour la matrice de l'écran Médias.
 * Les doublons sont ignorés : seules les vues distinctes comptent.
 */
export function computeMediaCompleteness(
  media: readonly MediaCompletenessSource[],
): MediaCompleteness {
  const presentCanvas = new Set<CanvasSlot>();
  const presentFrames = new Set<number>();
  let hasInteriorPanorama = false;

  for (const item of media) {
    if (item.kind === "CANVAS") {
      const parsed = canvasSlotSchema.safeParse(item.slot);
      if (parsed.success) presentCanvas.add(parsed.data);
      continue;
    }
    if (item.kind === "SPIN_EXTERIOR") {
      if (item.frameIndex >= 0 && item.frameIndex < SPIN_FRAME_COUNT) {
        presentFrames.add(item.frameIndex);
      }
      continue;
    }
    if (item.kind === "INTERIOR_PANORAMA") hasInteriorPanorama = true;
  }

  const canvasSlots = CANVAS_SLOTS.filter((slot) => presentCanvas.has(slot));
  const missingCanvasSlots = CANVAS_SLOTS.filter((slot) => !presentCanvas.has(slot));

  return {
    canvasSlots,
    missingCanvasSlots,
    spinFrameCount: presentFrames.size,
    hasFullSpin: presentFrames.size === SPIN_FRAME_COUNT,
    hasInteriorPanorama,
    isCanvasComplete: missingCanvasSlots.length === 0,
  };
}
