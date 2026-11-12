import { prisma } from "@/lib/prisma";

export type MecefCertificationResult = {
  success: boolean;
  mecefNim: string;
  mecefCode: string;
  mecefQrCode: string;
  mecefCounters: string;
  mecefDateTime: Date;
  isSimulated: boolean;
  mode: "LIVE" | "DEMO";
  message: string;
};

/** Mode de certification : LIVE (API DGI réelle) ou DEMO (démonstration uniquement). */
function getCertificationMode(): "LIVE" | "DEMO" {
  return (process.env.DGI_EMECEF_MODE || "LIVE").toUpperCase() === "DEMO" ? "DEMO" : "LIVE";
}

function buildInvoicePayload(invoice: {
  customer: { contactName: string; companyName: string | null; city: string | null; phone: string | null; ifu: string | null };
  taxRatePct: number;
  subtotalHtXof: number;
  number: string;
  quote: { lines: Array<{ description: string; unitPriceXof: number; quantity: number }> } | null;
}, ifu: string, nim: string) {
  const taxGroup = invoice.taxRatePct > 0 ? "B" : "A"; // A = exonéré, B = TVA 18 %
  return {
    ifu,
    nim,
    type: "FV", // Facture de vente
    client: {
      contact: invoice.customer.contactName,
      ifu: invoice.customer.ifu || null,
      name: invoice.customer.companyName || invoice.customer.contactName,
      address: invoice.customer.city || "Cotonou",
      phone: invoice.customer.phone || null,
    },
    operator: { name: "CARZONE SARL" },
    items:
      invoice.quote?.lines.map((line) => ({
        name: line.description,
        price: line.unitPriceXof,
        quantity: line.quantity,
        taxGroup,
      })) || [
        {
          name: `Prestation facturée ${invoice.number}`,
          price: invoice.subtotalHtXof,
          quantity: 1,
          taxGroup,
        },
      ],
  };
}

/**
 * Certifie une facture via l'API e-MECeF de la DGI Bénin.
 *
 * Deux modes :
 * - LIVE (défaut) : appel réel de l'API SyGMEF. Aucune facture n'est marquée
 *   certifiée si l'API échoue : l'erreur est remontée à l'utilisateur.
 * - DEMO : simulation réservée aux démonstrations. Le document est marqué
 *   isDemo = true, exclu de la comptabilité et imprimé avec un avertissement.
 */
export async function certifyInvoiceWithMecef(
  invoiceId: string,
  options: { forceDemo?: boolean } = {},
): Promise<MecefCertificationResult> {
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: {
      customer: true,
      quote: { include: { lines: true } },
    },
  });

  if (invoice.isFiscalCertified && invoice.mecefCode) {
    const mode = invoice.certificationMode === "DEMO" ? "DEMO" : "LIVE";
    return {
      success: true,
      mecefNim: invoice.mecefNim || "",
      mecefCode: invoice.mecefCode,
      mecefQrCode: invoice.mecefQrCode || "",
      mecefCounters: invoice.mecefCounters || "",
      mecefDateTime: invoice.mecefDateTime || new Date(),
      isSimulated: mode === "DEMO",
      mode,
      message: mode === "DEMO" ? "Document de démonstration déjà généré" : "Facture déjà certifiée auprès de la DGI",
    };
  }

  const mode = options.forceDemo ? "DEMO" : getCertificationMode();
  const nim = process.env.DGI_EMECEF_NIM || "";
  const ifu = process.env.DGI_EMECEF_IFU || "";
  const jwt = process.env.DGI_EMECEF_JWT || "";
  const baseUrl = process.env.DGI_EMECEF_BASE_URL || "https://developper.impots.bj/sygmef-emcf/api";

  // ---------- MODE DÉMONSTRATION ----------
  if (mode === "DEMO") {
    const count = await prisma.invoice.count({ where: { isDemo: true } });
    const index = count + 1;
    const seed = Math.abs(invoiceId.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7));
    const hex = seed.toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
    const mecefCode = `DEMO-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${index.toString().padStart(4, "0")}`;
    const mecefDateTime = new Date();
    const mecefCounters = `DEMO ${index}/${index}`;
    const mecefNim = nim || "DEMO-NIM";
    const mecefQrCode = `https://e-mecef.impots.bj/verify?demo=1&code=${mecefCode}`;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        mecefNim,
        mecefCode,
        mecefCounters,
        mecefQrCode,
        mecefDateTime,
        isFiscalCertified: true,
        isDemo: true,
        certificationMode: "DEMO",
      },
    });

    return {
      success: true,
      mecefNim,
      mecefCode,
      mecefQrCode,
      mecefCounters,
      mecefDateTime,
      isSimulated: true,
      mode: "DEMO",
      message: "Document de démonstration généré. Sans valeur fiscale.",
    };
  }

  // ---------- MODE RÉEL (LIVE) ----------
  if (!jwt.trim() || !ifu.trim() || !nim.trim()) {
    throw new Error(
      "Certification DGI impossible : JWT, IFU et NIM e-MECeF non configurés. Renseignez les variables DGI_EMECEF_JWT, DGI_EMECEF_IFU et DGI_EMECEF_NIM.",
    );
  }

  const createRes = await fetch(`${baseUrl.replace(/\/$/, "")}/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(buildInvoicePayload(invoice, ifu, nim)),
  });

  if (!createRes.ok) {
    const detail = await createRes.text().catch(() => "");
    throw new Error(`e-MECeF : échec de la soumission de la facture (HTTP ${createRes.status}). ${detail.slice(0, 300)}`);
  }

  const createData = (await createRes.json()) as { uid?: string };
  if (!createData.uid) {
    throw new Error("e-MECeF : réponse de soumission invalide (UID manquant).");
  }

  const confirmRes = await fetch(`${baseUrl.replace(/\/$/, "")}/invoice/${createData.uid}/confirm`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!confirmRes.ok) {
    const detail = await confirmRes.text().catch(() => "");
    throw new Error(`e-MECeF : échec de la confirmation (HTTP ${confirmRes.status}). ${detail.slice(0, 300)}`);
  }

  const confirmData = (await confirmRes.json()) as {
    nim?: string;
    codeMECeFDGI?: string;
    counters?: string;
    qrCode?: string;
    dateTime?: string;
  };

  if (!confirmData.codeMECeFDGI) {
    throw new Error("e-MECeF : réponse de confirmation invalide (code MECeF manquant).");
  }

  const mecefNim = confirmData.nim || nim;
  const mecefCode = confirmData.codeMECeFDGI;
  const mecefCounters = confirmData.counters || "";
  const mecefQrCode =
    confirmData.qrCode || `https://e-mecef.impots.bj/verify?code=${mecefCode}&nim=${mecefNim}`;
  const mecefDateTime = confirmData.dateTime ? new Date(confirmData.dateTime) : new Date();

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      mecefNim,
      mecefCode,
      mecefCounters,
      mecefQrCode,
      mecefDateTime,
      isFiscalCertified: true,
      isDemo: false,
      certificationMode: "LIVE",
    },
  });

  return {
    success: true,
    mecefNim,
    mecefCode,
    mecefQrCode,
    mecefCounters,
    mecefDateTime,
    isSimulated: false,
    mode: "LIVE",
    message: "Facture normalisée certifiée par la DGI Bénin",
  };
}
