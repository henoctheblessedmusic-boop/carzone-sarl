export type DiscountType = "NONE" | "PERCENT" | "AMOUNT";

export type QuoteDiscount = {
  type: DiscountType;
  value: number; // e.g. 5 for 5%, or 2000000 for 2,000,000 FCFA
};

/**
 * Calcule le montant en FCFA de la remise commerciale accordée sur le brut.
 */
export function calculateDiscountAmount(grossTotal: number, discount: QuoteDiscount): number {
  if (discount.type === "NONE" || !discount.value || discount.value <= 0) return 0;
  if (discount.type === "PERCENT") {
    const pct = Math.min(100, Math.max(0, discount.value));
    return Math.round((grossTotal * pct) / 100);
  }
  if (discount.type === "AMOUNT") {
    return Math.min(grossTotal, Math.max(0, Math.round(discount.value)));
  }
  return 0;
}

/**
 * Encode la remise de façon pérenne dans les notes du devis sans nécessiter de migration DB.
 */
export function encodeDiscountInNotes(cleanNotes: string | null | undefined, discount: QuoteDiscount): string | null {
  const notesText = (cleanNotes || "").trim();
  if (discount.type === "NONE" || !discount.value || discount.value <= 0) {
    return notesText || null;
  }
  const tag = `[REMISE:${discount.type}:${discount.value}]`;
  return notesText ? `${notesText}\n${tag}` : tag;
}

/**
 * Décode la remise commerciale et sépare les notes textuelles propres.
 */
export function decodeDiscountFromNotes(rawNotes?: string | null): {
  discount: QuoteDiscount;
  cleanNotes: string;
} {
  if (!rawNotes) {
    return { discount: { type: "NONE", value: 0 }, cleanNotes: "" };
  }
  const match = rawNotes.match(/\[REMISE:(NONE|PERCENT|AMOUNT):([0-9.]+)\]/);
  if (match) {
    const type = match[1] as DiscountType;
    const value = parseFloat(match[2]) || 0;
    const cleanNotes = rawNotes
      .replace(/\[REMISE:(NONE|PERCENT|AMOUNT):([0-9.]+)\]\r?\n?/, "")
      .replace(/\r?\n?\[REMISE:(NONE|PERCENT|AMOUNT):([0-9.]+)\]/, "")
      .trim();
    return {
      discount: { type, value },
      cleanNotes,
    };
  }
  return {
    discount: { type: "NONE", value: 0 },
    cleanNotes: rawNotes.trim(),
  };
}

/**
 * Formatage propre de la désignation d'un véhicule évitant les parenthèses vides `()`.
 */
export function formatVehicleDescription(veh: {
  brand: string;
  model: string;
  variant?: string | null;
  color?: string | null;
  vin?: string | null;
}): string {
  const parts: string[] = [`${veh.brand} ${veh.model}`];
  if (veh.variant && veh.variant.trim()) {
    parts.push(veh.variant.trim());
  }
  if (veh.color && veh.color.trim()) {
    parts.push(`(${veh.color.trim()})`);
  }
  if (veh.vin && veh.vin.trim()) {
    parts.push(`· VIN: ${veh.vin.trim()}`);
  }
  return parts.join(" ");
}
