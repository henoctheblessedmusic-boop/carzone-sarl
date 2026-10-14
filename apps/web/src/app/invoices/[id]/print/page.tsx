import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatDate, formatXof } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";
import { getDefaultCgv, type CgvType } from "@/lib/cgv";
import { formatLegalAmountNotice } from "@/lib/number-to-words-fr";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser(["DG", "COMMERCIAL", "COMPTA", "ADMIN"]);
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      payments: { orderBy: { paidAt: "asc" } },
      quote: {
        include: {
          lines: {
            include: { vehicle: true },
          },
        },
      },
    },
  });

  if (!invoice) notFound();

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amountXof, 0);
  const balanceDue = Math.max(0, invoice.totalXof - totalPaid);
  const cgvType = ((invoice.cgvType || invoice.quote?.cgvType || "VEHICULE") as CgvType);
  const cgvContent = invoice.customCgv || invoice.quote?.customCgv || getDefaultCgv(cgvType);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f8fb",
        color: "#122028",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Barre d'action non imprimable */}
      <div
        className="no-print"
        style={{
          padding: "1rem",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background: "#0f1f2e",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Link href="/invoices" className="ox-btn ox-btn-ghost" style={{ color: "#fff" }}>
          ← Retour Factures & Règlements
        </Link>
        <PrintButton />
        <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
          Facture commerciale normalisée · CARZONE SARL Bénin
        </span>
      </div>

      {/* Feuille de facture imprimable */}
      <article
        style={{
          maxWidth: 820,
          margin: "1.5rem auto 3rem",
          padding: "2.5rem 3rem",
          background: "#fff",
          border: "1px solid #c5d8e4",
          boxShadow: "0 8px 32px rgba(20,60,90,0.08)",
        }}
      >
        {/* Header Entreprise */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            borderBottom: "2px solid #0078d4",
            paddingBottom: "1.25rem",
          }}
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- print-friendly static asset */}
            <img
              src="/brand/carzone-logo.png"
              alt="CARZONE SARL"
              width={75}
              height={75}
              style={{
                display: "block",
                borderRadius: "50%",
                objectFit: "contain",
                marginBottom: 8,
              }}
            />
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>CARZONE SARL</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.4 }}>
              SARL Showroom & Mobilité SARL<br />
              Immeuble CBDH Saint-Michel · Quartier Gbèdomidji, Cotonou<br />
              Tél : +229 21 33 00 00 / 97 00 00 00<br />
              Email : contact@topcarzone.com · Web : www.topcarzone.com<br />
              IFU : 0202314589201 · RCCM : RB/COT/23 B 34567
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0078d4" }}>
              FACTURE NORMALISÉE
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 4 }}>
              {invoice.number}
            </div>
            {invoice.quote && (
              <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: 2 }}>
                Réf. Devis : {invoice.quote.number}
              </div>
            )}
            <div
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "0.25rem 0.6rem",
                borderRadius: 4,
                fontSize: "0.8rem",
                fontWeight: 700,
                background: balanceDue === 0 ? "#e6f9ed" : "#fef3c7",
                color: balanceDue === 0 ? "#166534" : "#92400e",
                border: `1px solid ${balanceDue === 0 ? "#86efac" : "#fde68a"}`,
              }}
            >
              {balanceDue === 0 ? "FACTURE SOLDÉE" : "PAIEMENT EN ATTENTE"}
            </div>
          </div>
        </header>

        {/* Coordonnées Client & Informations Facture */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
            padding: "1rem 1.25rem",
            background: "#f8fafc",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", textTransform: "uppercase", opacity: 0.6, fontWeight: 700, marginBottom: 4 }}>
              Facturé à :
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{invoice.customer.contactName}</div>
            {invoice.customer.companyName && (
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{invoice.customer.companyName}</div>
            )}
            {invoice.customer.ifu && (
              <div style={{ color: "#0078d4", fontWeight: 700, fontSize: "0.92rem", marginTop: 2 }}>
                N° IFU : {invoice.customer.ifu}
              </div>
            )}
            <div style={{ fontSize: "0.85rem", opacity: 0.85, marginTop: 4, lineHeight: 1.4 }}>
              {invoice.customer.address && <div>Adresse : {invoice.customer.address}</div>}
              {invoice.customer.city && <div>Ville : {invoice.customer.city}</div>}
              {invoice.customer.phone && <div>Téléphone : {invoice.customer.phone}</div>}
              {invoice.customer.email && <div>Email : {invoice.customer.email}</div>}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
              <div><strong>Date d&apos;émission :</strong> {formatDate(invoice.createdAt)}</div>
              <div><strong>Date d&apos;échéance :</strong> {formatDate(invoice.dueDate)}</div>
              <div><strong>Régime fiscal :</strong> {invoice.taxMode} ({invoice.taxRatePct > 0 ? `TVA ${invoice.taxRatePct}%` : "Exonéré"})</div>
              <div><strong>Statut :</strong> {invoice.status}</div>
            </div>
          </div>
        </div>

        {/* Tableau des prestations / articles */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
          <thead>
            <tr style={{ background: "#eef5f9" }}>
              <th style={{ textAlign: "left", padding: "0.75rem 0.6rem", borderBottom: "2px solid #0078d4", fontSize: "0.85rem" }}>
                Désignation des Prestations / Véhicules / Équipements
              </th>
              <th style={{ textAlign: "center", padding: "0.75rem 0.6rem", borderBottom: "2px solid #0078d4", fontSize: "0.85rem", width: "10%" }}>
                Qté
              </th>
              <th style={{ textAlign: "right", padding: "0.75rem 0.6rem", borderBottom: "2px solid #0078d4", fontSize: "0.85rem", width: "22%" }}>
                P.U. HT
              </th>
              <th style={{ textAlign: "right", padding: "0.75rem 0.6rem", borderBottom: "2px solid #0078d4", fontSize: "0.85rem", width: "22%" }}>
                Total HT
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.quote?.lines && invoice.quote.lines.length > 0 ? (
              invoice.quote.lines.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.75rem 0.6rem", fontSize: "0.9rem" }}>
                    <div style={{ fontWeight: 600 }}>{l.description.replace(/\s*\(\s*\)/g, "").trim()}</div>
                    {l.vehicle && (
                      <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 2 }}>
                        VIN : {l.vehicle.vin || "Non assigné"} · {l.vehicle.brand} {l.vehicle.model}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "0.75rem 0.6rem", textAlign: "center", fontSize: "0.9rem" }}>
                    {l.quantity}
                  </td>
                  <td style={{ padding: "0.75rem 0.6rem", textAlign: "right", fontSize: "0.9rem" }}>
                    {formatXof(l.unitPriceXof)}
                  </td>
                  <td style={{ padding: "0.75rem 0.6rem", textAlign: "right", fontSize: "0.9rem", fontWeight: 600 }}>
                    {formatXof(l.unitPriceXof * l.quantity)}
                  </td>
                </tr>
              ))
            ) : (
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "0.75rem 0.6rem", fontSize: "0.9rem" }}>
                  <div style={{ fontWeight: 600 }}>Prestations commerciales CARZONE SARL</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Conformément à la commande client</div>
                </td>
                <td style={{ padding: "0.75rem 0.6rem", textAlign: "center", fontSize: "0.9rem" }}>1</td>
                <td style={{ padding: "0.75rem 0.6rem", textAlign: "right", fontSize: "0.9rem" }}>
                  {formatXof(invoice.subtotalHtXof)}
                </td>
                <td style={{ padding: "0.75rem 0.6rem", textAlign: "right", fontSize: "0.9rem", fontWeight: 600 }}>
                  {formatXof(invoice.subtotalHtXof)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Récapitulatif financier & Règlements */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start", marginBottom: "2rem" }}>
          {/* Historique des acomptes reçus */}
          <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 8, textTransform: "uppercase", color: "#0078d4" }}>
              Historique des Règlements Reçus
            </div>
            {invoice.payments.length === 0 ? (
              <div style={{ fontSize: "0.82rem", opacity: 0.65, fontStyle: "italic" }}>
                Aucun règlement enregistré sur cette facture pour le moment.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.82rem" }}>
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px dashed #cbd5e1",
                      paddingBottom: 4,
                    }}
                  >
                    <span>
                      {formatDate(p.paidAt)} · {p.method} {p.reference ? `(${p.reference})` : ""}
                    </span>
                    <strong style={{ color: "#166534" }}>{formatXof(p.amountXof)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totaux */}
          <div style={{ fontSize: "0.95rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span>Sous-total HT :</span>
              <strong>{formatXof(invoice.subtotalHtXof)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span>TVA ({invoice.taxRatePct}%) :</span>
              <strong>{formatXof(invoice.taxXof)}</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 8,
                borderTop: "1px solid #cbd5e1",
                marginBottom: 6,
                fontSize: "1.05rem",
              }}
            >
              <span>Total TTC :</span>
              <strong>{formatXof(invoice.totalXof)}</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                color: "#166534",
              }}
            >
              <span>Total Encaissé :</span>
              <strong>- {formatXof(totalPaid)}</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 10,
                borderTop: "2px solid #122028",
                fontSize: "1.15rem",
                color: balanceDue > 0 ? "#b91c1c" : "#166534",
              }}
            >
              <span>Net à Payer (Solde) :</span>
              <strong>{formatXof(balanceDue)}</strong>
            </div>
          </div>
        </div>

        {/* Mention légale d'arrêté de la facture normalisée en toutes lettres */}
        <div
          style={{
            marginTop: "1.25rem",
            marginBottom: "1.5rem",
            padding: "0.85rem 1.15rem",
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: "0.88rem",
            lineHeight: 1.55,
          }}
        >
          <span
            style={{
              fontSize: "0.76rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#64748b",
              fontWeight: 700,
              display: "block",
              marginBottom: 3,
            }}
          >
            Mention Légale et Fiscale Obligatoire
          </span>
          <strong style={{ color: "#0f172a" }}>
            {formatLegalAmountNotice(invoice.totalXof, "facture")}
          </strong>
        </div>

        {/* Bloc Fiscal Officiel DGI Bénin (e-MECeF / SyGMEF) */}
        {invoice.isFiscalCertified && invoice.mecefCode ? (
          <div
            style={{
              border: "2px solid #0078d4",
              borderRadius: 8,
              padding: "1.1rem 1.4rem",
              background: "#f0fdf4",
              marginBottom: "1.75rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
                RÉPUBLIQUE DU BÉNIN — DIRECTION GÉNÉRALE DES IMPÔTS (DGI)
              </div>
              <div style={{ fontSize: "0.85rem", marginTop: 6, color: "#1e293b", lineHeight: 1.6 }}>
                <div><strong>Code Sécurité MECeF / DGI :</strong> <span style={{ fontFamily: "monospace", fontSize: "0.98rem", fontWeight: 700, letterSpacing: "0.04em", color: "#0078d4" }}>{invoice.mecefCode}</span></div>
                <div><strong>NIM (Machine e-MCF) :</strong> {invoice.mecefNim || "MCF01-CARZONE-BJ01"}</div>
                <div><strong>Compteurs fiscaux :</strong> {invoice.mecefCounters || "1/1 F"} · {formatDate(invoice.mecefDateTime || invoice.createdAt)}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 4 }}>
                  Facture certifiée et télétransmise au serveur central e-MECeF de la DGI.
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", minWidth: 100 }}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  border: "2px solid #166534",
                  background: "#fff",
                  display: "grid",
                  placeItems: "center",
                  padding: 4,
                  margin: "0 auto",
                  borderRadius: 4,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- print QR code */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(invoice.mecefQrCode || `https://e-mecef.impots.bj/verify?code=${invoice.mecefCode}`)}`}
                  alt="QR Code e-MECeF"
                  width={82}
                  height={82}
                  style={{ display: "block" }}
                />
              </div>
              <div style={{ fontSize: "0.68rem", opacity: 0.7, marginTop: 4, fontWeight: 600 }}>e-mecef.impots.bj</div>
            </div>
          </div>
        ) : null}

        {/* Coordonnées de Paiement Bancaire & Mobile Money */}
        <div
          style={{
            border: "1px solid #c5d8e4",
            borderRadius: 6,
            padding: "1rem",
            marginBottom: "2rem",
            background: "#f0f7fb",
            fontSize: "0.82rem",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#0078d4" }}>Modalités de Règlement CARZONE SARL Bénin :</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: 6 }}>
            <div>
              <strong>Virement Bancaire :</strong><br />
              • Ecobank Bénin : BJ061 01001 001234567890 12<br />
              • BOA Bénin : BJ062 01002 009876543210 34
            </div>
            <div>
              <strong>Mobile Money &amp; Caisse :</strong><br />
              • MTN MoMo Marchand : *880*41*CARZONE# (+229 97 00 00 00)<br />
              • Moov Money Marchand : *855*1*CARZONE# (+229 95 00 00 00)<br />
              • Caisse Showroom Akpakpa (Chèque ou Espèces)
            </div>
          </div>
        </div>

        {/* Footer & Tampon */}
        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #e2e8f0",
            fontSize: "0.78rem",
            opacity: 0.8,
          }}
        >
          <div>
            Facture établie sous le régime fiscal de la République du Bénin.<br />
            En cas de contestation, seuls les tribunaux de Cotonou sont compétents.<br />
            <strong style={{ color: "#0f172a", display: "inline-block", marginTop: 4 }}>
              {formatLegalAmountNotice(invoice.totalXof, "facture")}
            </strong>
          </div>
          <div style={{ textAlign: "center", width: 200 }}>
            <div style={{ fontWeight: 700, marginBottom: 40 }}>Pour CARZONE SARL</div>
            <div style={{ fontSize: "0.75rem", fontStyle: "italic", opacity: 0.6 }}>Cachet &amp; Visa Comptabilité</div>
          </div>
        </footer>
      </article>

      {/* PAGE 2 : CONDITIONS GÉNÉRALES DE VENTE ADOSSÉES */}
      <article
        style={{
          maxWidth: 820,
          margin: "1.5rem auto 3rem",
          padding: "2.5rem 3rem",
          background: "#fff",
          border: "1px solid #c5d8e4",
          boxShadow: "0 8px 32px rgba(20,60,90,0.08)",
          pageBreakBefore: "always",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
            borderBottom: "2px solid #0078d4",
            paddingBottom: "0.75rem",
          }}
        >
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.02em" }}>
              CONDITIONS GÉNÉRALES DE VENTE &amp; DE GARANTIE
            </div>
            <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: 2 }}>
              Adossées à la Facture Normalisée N° {invoice.number} · {cgvType === "ATELIER" ? "Prestations Atelier SAV & Réparations" : "Vente de Véhicules (Showroom & Import)"}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.82rem", opacity: 0.75 }}>
            <strong>CARZONE SARL</strong> (SARL Showroom & Mobilité)<br />
            Immeuble CBDH Saint-Michel · Quartier Gbèdomidji, Cotonou
          </div>
        </header>

        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: "0.82rem",
            lineHeight: 1.55,
            color: "#1a2530",
            textAlign: "justify",
            marginBottom: "2rem",
          }}
        >
          {cgvContent}
        </div>

        <div
          style={{
            borderTop: "1px dashed #b5cddc",
            paddingTop: "1rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            fontSize: "0.85rem",
          }}
        >
          <div>
            <strong>Pour CARZONE SARL Bénin :</strong>
            <div style={{ height: 60, marginTop: 6, opacity: 0.6 }}>Direction Commerciale / Signature &amp; Cachet</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>Pour le Client :</strong>
            <div style={{ fontStyle: "italic", fontSize: "0.8rem", opacity: 0.8, marginTop: 2 }}>
              « Lu et approuvé, bon pour accord »
            </div>
            <div style={{ height: 60, marginTop: 6, opacity: 0.6 }}>Signature &amp; Cachet du Client</div>
          </div>
        </div>
      </article>
    </div>
  );
}
