/** Calculs TVA / HT-TTC pour proformas CARZONE (XOF entiers). */

export type TaxMode = "HT" | "TTC";

export function computeTaxTotals(input: {
  lineTotalXof: number;
  taxMode: TaxMode;
  taxRatePct: number;
  discountXof?: number;
}) {
  const rate = Math.max(0, input.taxRatePct) / 100;
  const gross = Math.max(0, Math.round(input.lineTotalXof));
  const discount = Math.max(0, Math.min(gross, Math.round(input.discountXof || 0)));
  const net = Math.max(0, gross - discount);

  if (rate === 0) {
    return {
      grossHtXof: gross,
      discountXof: discount,
      subtotalHtXof: net,
      taxXof: 0,
      totalXof: net,
    };
  }

  if (input.taxMode === "TTC") {
    const subtotalHtXof = Math.round(net / (1 + rate));
    const taxXof = net - subtotalHtXof;
    return {
      grossHtXof: gross,
      discountXof: discount,
      subtotalHtXof,
      taxXof,
      totalXof: net,
    };
  }

  const subtotalHtXof = net;
  const taxXof = Math.round(subtotalHtXof * rate);
  return {
    grossHtXof: gross,
    discountXof: discount,
    subtotalHtXof,
    taxXof,
    totalXof: subtotalHtXof + taxXof,
  };
}

/** Statuts proforma / BDC — machine d'états métier. */
export const QuoteStatus = {
  BROUILLON: "BROUILLON",
  PROFORMA_ENVOYEE: "PROFORMA_ENVOYEE",
  COMMANDE_CONFIRMEE: "COMMANDE_CONFIRMEE",
  FACTURE_NORMALISEE: "FACTURE_NORMALISEE",
  ANNULEE_INTERNE: "ANNULEE_INTERNE",
  /** Legacy seed / anciens devis */
  ENVOYE: "ENVOYE",
  ACCEPTE: "ACCEPTE",
  REJETE: "REJETE",
} as const;

export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  PROFORMA_ENVOYEE: "Proforma envoyée",
  COMMANDE_CONFIRMEE: "Commande confirmée (ferme)",
  FACTURE_NORMALISEE: "Facture normalisée",
  ANNULEE_INTERNE: "Annulée (interne)",
  ENVOYE: "Envoyé (legacy)",
  ACCEPTE: "Accepté (legacy)",
  REJETE: "Rejeté",
};

/** Client ne peut plus annuler unilatéralement. */
export function isClientCancelLocked(status: string): boolean {
  return [
    QuoteStatus.PROFORMA_ENVOYEE,
    QuoteStatus.COMMANDE_CONFIRMEE,
    QuoteStatus.FACTURE_NORMALISEE,
    QuoteStatus.ENVOYE,
    QuoteStatus.ACCEPTE,
  ].includes(status as never);
}

/** Staff DG/COMPTA peuvent voider avec motif. */
export function canStaffVoid(status: string): boolean {
  return status !== QuoteStatus.ANNULEE_INTERNE && status !== QuoteStatus.FACTURE_NORMALISEE;
}

export function canConfirmOrder(status: string): boolean {
  return [QuoteStatus.BROUILLON, QuoteStatus.PROFORMA_ENVOYEE, QuoteStatus.ENVOYE].includes(
    status as never,
  );
}

export function canNormalizeInvoice(status: string): boolean {
  return [QuoteStatus.COMMANDE_CONFIRMEE, QuoteStatus.ACCEPTE].includes(status as never);
}

export function canSendProforma(status: string): boolean {
  return [QuoteStatus.BROUILLON, QuoteStatus.PROFORMA_ENVOYEE, QuoteStatus.ENVOYE].includes(
    status as never,
  );
}
