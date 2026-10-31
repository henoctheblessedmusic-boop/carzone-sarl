import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import { getServerMessages } from "@/lib/i18n/server";
import { quotesCopy, formatQuoteDate } from "@/lib/i18n/messages/quotes";
import { PrintButton } from "@/components/PrintButton";
import { getDefaultCgv, type CgvType } from "@/lib/cgv";
import {
  decodeDiscountFromNotes,
  calculateDiscountAmount,
} from "@/lib/quote-discount";

import { formatLegalAmountNotice } from "@/lib/number-to-words-fr";
import { VehicleTechSheetPrint } from "@/components/VehicleTechSheetPrint";
import { resolveVehicleTechSheet } from "@/lib/tech-sheet-generator";

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser(["DG", "COMMERCIAL", "COMPTA", "ADMIN"]);
  const { locale } = await getServerMessages();
  const copy = quotesCopy[locale];
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { customer: true, lines: { include: { vehicle: true } } },
  });
  if (!quote) notFound();

  const { discount, cleanNotes } = decodeDiscountFromNotes(quote.notes);
  const grossTotal = quote.lines.reduce((s, l) => s + l.quantity * l.unitPriceXof, 0);
  const discountAmount = calculateDiscountAmount(grossTotal, discount);

  // Extract vehicles attached to quote lines
  const vehicleItems = quote.lines
    .filter((l) => l.vehicle)
    .map((l) => l.vehicle!);
  const uniqueVehicles = Array.from(new Map(vehicleItems.map((v) => [v.id, v])).values());
  const vehiclesWithSheets = uniqueVehicles.map((vehicle) => ({
    vehicle,
    sheet: resolveVehicleTechSheet(vehicle),
  }));

  const to = quote.emailTo || quote.customer.email;
  const mailto = to
    ? `mailto:${to}?subject=${encodeURIComponent(copy.print.mailto.subject(quote.number))}&body=${encodeURIComponent(
        copy.print.mailto.body(quote.number, formatXof(quote.totalXof)),
      )}`
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f8fb",
        color: "#122028",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        className="no-print"
        style={{
          padding: "1rem",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <Link href="/quotes" className="ox-btn ox-btn-ghost">
          {copy.print.back}
        </Link>
        <PrintButton />
        {vehiclesWithSheets.map(({ vehicle }) => (
          <Link
            key={vehicle.id}
            href={`/vehicles/${vehicle.id}/fiche-technique`}
            target="_blank"
            className="ox-btn"
            style={{
              background: "rgba(0, 120, 212, 0.15)",
              color: "#0078d4",
              borderColor: "#0078d4",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            📄 {copy.print.techSheetLink(vehicle.brand, vehicle.model)}
          </Link>
        ))}
        {mailto ? (
          <a href={mailto} className="ox-btn" title={copy.print.mailtoTitle}>
            {copy.print.mailtoLabel}
          </a>
        ) : null}
        <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
          {copy.print.mailStub}
        </span>
      </div>

      <article
        style={{
          maxWidth: 800,
          margin: "0 auto 2rem",
          padding: "2rem 2.25rem",
          background: "#fff",
          border: "1px solid #c5d8e4",
          boxShadow: "0 8px 32px rgba(20,60,90,0.08)",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1.75rem",
            borderBottom: "2px solid #0078d4",
            paddingBottom: "1rem",
          }}
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- print-friendly static asset */}
            <img
              src="/brand/carzone-logo-print.png"
              alt="CARZONE SARL"
              width={72}
              height={72}
              style={{
                display: "block",
                borderRadius: "50%",
                objectFit: "contain",
                marginBottom: 6,
              }}
            />
            <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>{copy.print.companyLine}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{copy.print.docTitle}</div>
            <div>{quote.number}</div>
            <div style={{ fontSize: "0.85rem", marginTop: 4 }}>
              {copy.statuses[quote.status] || quote.status}
            </div>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <strong>{copy.print.clientBlockTitle}</strong>
            <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{quote.customer.contactName}</div>
            {quote.customer.companyName ? <div style={{ fontWeight: 600 }}>{quote.customer.companyName}</div> : null}
            {quote.customer.ifu ? (
              <div style={{ color: "#0078d4", fontWeight: 600, fontSize: "0.92rem", marginTop: 2 }}>
                {copy.print.ifu(quote.customer.ifu)}
              </div>
            ) : null}
            {quote.customer.address ? <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>{quote.customer.address}</div> : null}
            {quote.customer.city ? <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>{quote.customer.city}</div> : null}
            {quote.customer.email ? <div style={{ fontSize: "0.9rem" }}>{quote.customer.email}</div> : null}
            {quote.customer.phone ? <div style={{ fontSize: "0.9rem" }}>{quote.customer.phone}</div> : null}
          </div>
          <div style={{ textAlign: "right" }}>
            <div>{copy.print.date(formatQuoteDate(copy, quote.createdAt))}</div>
            <div>{copy.print.validUntil(formatQuoteDate(copy, quote.validUntil))}</div>
            <div>
              {copy.print.taxBase(quote.taxMode, quote.taxRatePct)}
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.75, marginTop: 4 }}>
              {copy.print.cgvRef(
                quote.cgvType === "ATELIER" ? copy.print.cgvKindWorkshop : copy.print.cgvKindVehicle
              )}
            </div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.25rem" }}>
          <thead>
            <tr style={{ background: "#eef5f9" }}>
              <th style={{ textAlign: "left", padding: "0.6rem", borderBottom: "1px solid #c5d8e4" }}>{copy.print.columns.designation}</th>
              <th style={{ textAlign: "right", padding: "0.6rem", borderBottom: "1px solid #c5d8e4" }}>{copy.print.columns.quantity}</th>
              <th style={{ textAlign: "right", padding: "0.6rem", borderBottom: "1px solid #c5d8e4" }}>{copy.print.columns.unitPrice}</th>
              <th style={{ textAlign: "right", padding: "0.6rem", borderBottom: "1px solid #c5d8e4" }}>{copy.print.columns.amount}</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((l) => (
              <tr key={l.id}>
                <td style={{ padding: "0.55rem", borderBottom: "1px solid #eee" }}>
                  {l.description.replace(/\s*\(\s*\)/g, "").trim()}
                </td>
                <td style={{ padding: "0.55rem", borderBottom: "1px solid #eee", textAlign: "right" }}>{l.quantity}</td>
                <td style={{ padding: "0.55rem", borderBottom: "1px solid #eee", textAlign: "right" }}>
                  {formatXof(l.unitPriceXof)}
                </td>
                <td style={{ padding: "0.55rem", borderBottom: "1px solid #eee", textAlign: "right" }}>
                  {formatXof(l.unitPriceXof * l.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginLeft: "auto", width: 320, fontSize: "0.95rem" }}>
          {discountAmount > 0 ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>{copy.print.totals.gross}</span>
                <strong>{formatXof(grossTotal)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#16a34a", fontWeight: 700 }}>
                <span>
                  {copy.print.totals.discount(discount.type === "PERCENT" ? String(discount.value) : null)}
                </span>
                <span>- {formatXof(discountAmount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, paddingTop: 4, borderTop: "1px dashed #cbd5e1", fontWeight: 650 }}>
                <span>{copy.print.totals.netHt}</span>
                <span>{formatXof(quote.subtotalHtXof)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>{copy.print.totals.subtotalHt}</span>
              <strong>{formatXof(quote.subtotalHtXof)}</strong>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span>{copy.print.totals.vat(quote.taxRatePct)}</span>
            <strong>{formatXof(quote.taxXof)}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              paddingTop: 8,
              borderTop: "2px solid #122028",
              fontSize: "1.12rem",
              fontWeight: 800,
            }}
          >
            <span>{copy.print.totals.totalTtc}</span>
            <strong>{formatXof(quote.totalXof)}</strong>
          </div>
        </div>

        {/* Mention légale d'arrêté de la facture proforma en toutes lettres */}
        <div
          style={{
            marginTop: "1.75rem",
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
            {copy.print.legalHeading}
          </span>
          <strong style={{ color: "#0f172a" }}>
            {formatLegalAmountNotice(quote.totalXof, "proforma")}
          </strong>
        </div>

        {cleanNotes ? (
          <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", opacity: 0.8 }}>{copy.print.notes(cleanNotes)}</p>
        ) : null}

        <footer
          style={{
            marginTop: "2rem",
            fontSize: "0.78rem",
            opacity: 0.7,
            borderTop: "1px solid #ddd",
            paddingTop: "0.75rem",
          }}
        >
          {copy.print.footer}
        </footer>
      </article>

      {/* PAGE 2 : CONDITIONS GÉNÉRALES DE VENTE ADOSSÉES */}
      <article
        style={{
          maxWidth: 800,
          margin: "0 auto 2rem",
          padding: "2rem 2.25rem",
          background: "#fff",
          border: "1px solid #c5d8e4",
          boxShadow: "0 8px 32px rgba(20,60,90,0.08)",
          pageBreakBefore: "always",
          breakBefore: "page",
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
              {copy.print.cgvPage.title}
            </div>
            <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: 2 }}>
              {copy.print.cgvPage.subtitle(
                quote.number,
                quote.cgvType === "ATELIER"
                  ? copy.print.cgvPage.kindWorkshop
                  : copy.print.cgvPage.kindVehicle
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.82rem", opacity: 0.75 }}>
            <strong>{copy.print.cgvPage.company}</strong><br />
            {copy.print.cgvPage.address}
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
          {quote.customCgv || getDefaultCgv((quote.cgvType as CgvType) || "VEHICULE")}
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
            <strong>{copy.print.cgvPage.signCompanyLabel}</strong>
            <div style={{ height: 60, marginTop: 6, opacity: 0.6 }}>{copy.print.cgvPage.signCompanyRole}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>{copy.print.cgvPage.signClientLabel}</strong>
            <div style={{ fontStyle: "italic", fontSize: "0.8rem", opacity: 0.8, marginTop: 2 }}>
              {copy.print.cgvPage.signClientAccepted}
            </div>
            <div style={{ height: 60, marginTop: 6, opacity: 0.6 }}>{copy.print.cgvPage.signClientStamp}</div>
          </div>
        </div>
      </article>

      {/* Dossier Technique : Fiches techniques officielles adossées à la proforma */}
      {vehiclesWithSheets.map(({ vehicle, sheet }) => (
        <div
          key={vehicle.id}
          style={{
            pageBreakBefore: "always",
            breakBefore: "page",
            marginTop: "3rem",
            paddingBottom: "2rem",
          }}
        >
          <div
            className="no-print"
            style={{
              maxWidth: 800,
              margin: "0 auto 1rem",
              padding: "0.6rem 1rem",
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.85rem",
            }}
          >
            <span>{copy.print.cgvPage.annex(sheet.title)}</span>
            <Link
              href={`/vehicles/${vehicle.id}/fiche-technique`}
              target="_blank"
              style={{ color: "#38bdf8", textDecoration: "underline" }}
            >
              {copy.print.cgvPage.openSheet}
            </Link>
          </div>

          <VehicleTechSheetPrint
            sheet={sheet}
            vehicleInfo={{
              vin: vehicle.vin,
              color: vehicle.color,
              priceXof: vehicle.priceXof,
            }}
          />
        </div>
      ))}
    </div>
  );
}
