import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import { getServerMessages } from "@/lib/i18n/server";
import {
  invoicesCopy,
  paymentMethodLabel,
  formatInvoiceDate,
} from "@/lib/i18n/messages/invoices";
import { PrintButton } from "@/components/PrintButton";

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser(["DG", "COMMERCIAL", "COMPTA"]);
  const { locale } = await getServerMessages();
  const copy = invoicesCopy[locale];
  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          customer: true,
          payments: { orderBy: { paidAt: "asc" } },
        },
      },
    },
  });

  if (!payment) notFound();

  const invoice = payment.invoice;
  const regNumber = `REG-${new Date(payment.paidAt).getFullYear()}-${payment.id.slice(-4).toUpperCase()}`;

  // Calculate cumulative paid up to this payment
  const totalPaidOverall = invoice.payments.reduce((s, p) => s + p.amountXof, 0);
  const remainingBalance = Math.max(0, invoice.totalXof - totalPaidOverall);
  const isSettled = remainingBalance === 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f8fb", color: "#122028", fontFamily: "Georgia, serif" }}>
      {/* Barre d'action non imprimable */}
      <div
        className="no-print"
        style={{
          padding: "1rem",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          fontFamily: "Segoe UI, sans-serif",
          background: "#0f1f2e",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Link href="/invoices" className="ox-btn ox-btn-ghost" style={{ color: "#fff" }}>
          {copy.receipt.back}
        </Link>
        <PrintButton />
        <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
          {copy.receipt.actionHint(regNumber)}
        </span>
      </div>

      {/* Feuille de quittance imprimable */}
      <article
        style={{
          maxWidth: 720,
          margin: "2rem auto 3rem",
          padding: "2.5rem 3rem",
          background: "#fff",
          border: "1px solid #c5d8e4",
          boxShadow: "0 8px 32px rgba(20,60,90,0.08)",
          borderRadius: 4,
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #10b981",
            paddingBottom: "1.25rem",
            marginBottom: "1.75rem",
          }}
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- print-friendly static asset */}
            <img
              src="/brand/carzone-logo.png"
              alt="CARZONE SARL"
              width={70}
              height={70}
              style={{
                display: "block",
                borderRadius: "50%",
                objectFit: "contain",
                marginBottom: 6,
              }}
            />
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>CARZONE SARL</div>
            <div style={{ fontSize: "0.82rem", opacity: 0.75, lineHeight: 1.35 }}>
              {copy.receipt.companyAddress}<br />
              {copy.receipt.companyFiscal}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#10b981" }}>
              {copy.receipt.docTitle}
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 4 }}>
              {regNumber}
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: 2 }}>
              {copy.receipt.date(formatInvoiceDate(copy, payment.paidAt))}
            </div>
          </div>
        </header>

        {/* Corps de la quittance */}
        <div style={{ fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "2rem" }}>
          <div>
            {copy.receipt.receivedFrom} <strong>{invoice.customer.contactName}</strong>
            {invoice.customer.companyName && <span> ({invoice.customer.companyName})</span>}
          </div>
          {invoice.customer.phone && (
            <div style={{ fontSize: "0.85rem", opacity: 0.75 }}>
              {copy.receipt.phone} {invoice.customer.phone}
            </div>
          )}

          <div
            style={{
              margin: "1.5rem 0",
              padding: "1.25rem",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#166534", fontWeight: 700, marginBottom: 4 }}>
              {copy.receipt.amountCollected}
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#15803d" }}>
              {formatXof(payment.amountXof)}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.88rem", background: "#f8fafc", padding: "1rem", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <div>
              <strong>{copy.receipt.method}</strong><br />
              {paymentMethodLabel(copy, payment.method)}
            </div>
            <div>
              <strong>{copy.receipt.reference}</strong><br />
              {payment.reference || copy.receipt.noReference}
            </div>
            <div>
              <strong>{copy.receipt.invoice}</strong><br />
              {invoice.number}
            </div>
            <div>
              <strong>{copy.receipt.notes}</strong><br />
              {payment.notes || copy.receipt.defaultNote}
            </div>
          </div>
        </div>

        {/* Situation comptable de la facture */}
        <div
          style={{
            borderTop: "1px solid #cbd5e1",
            paddingTop: "1.25rem",
            marginBottom: "2.5rem",
            fontSize: "0.9rem",
          }}
        >
          <strong style={{ display: "block", marginBottom: 8, color: "#0f172a" }}>
            {copy.receipt.accountTitle(invoice.number)}
          </strong>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span>{copy.receipt.totalInvoice}</span>
            <strong>{formatXof(invoice.totalXof)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#15803d" }}>
            <span>{copy.receipt.totalCollected}</span>
            <strong>{formatXof(totalPaidOverall)}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 6,
              borderTop: "1px dashed #cbd5e1",
              fontSize: "1.05rem",
              color: isSettled ? "#15803d" : "#b91c1c",
            }}
          >
            <span>{copy.receipt.balanceDue}</span>
            <strong>
              {isSettled
                ? `${formatXof(0)} (${copy.receipt.settledTag})`
                : formatXof(remainingBalance)}
            </strong>
          </div>
        </div>

        {/* Footer & Signature */}
        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "1.5rem",
            fontSize: "0.78rem",
            opacity: 0.8,
          }}
        >
          <div>
            {copy.receipt.footerLegal}<br />
            {copy.receipt.footerCertified}
          </div>
          <div style={{ textAlign: "center", width: 200 }}>
            <div style={{ fontWeight: 700, marginBottom: 40 }}>{copy.receipt.forCashier}</div>
            <div style={{ fontSize: "0.75rem", fontStyle: "italic", opacity: 0.6 }}>{copy.receipt.stamp}</div>
          </div>
        </footer>
      </article>
    </div>
  );
}
