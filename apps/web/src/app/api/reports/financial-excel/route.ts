import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { RoleService } from "@/lib/role-service";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Non authentifié", { status: 401 });
  }

  // Vérification stricte du droit d'extraction du bilan financier
  const canExportFinancials = RoleService.hasPermission(session.role, "financial_report:export");
  if (!canExportFinancials) {
    return new NextResponse(
      JSON.stringify({
        error: "Accès refusé : L'extraction du bilan financier n'est pas autorisée pour votre rôle (" + session.role + ").",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const [invoices, quotes, payments] = await Promise.all([
    prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quote.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      include: { invoice: { include: { customer: true } } },
      orderBy: { paidAt: "desc" },
    }),
  ]);

  const wb = XLSX.utils.book_new();

  // 1. Feuille Factures & Règlements
  const invoiceHeaders = [
    "N° Facture",
    "Date Émission",
    "Client",
    "Type",
    "Statut",
    "Montant HT (XOF)",
    "TVA (XOF)",
    "Total TTC (XOF)",
    "Montant Encaissé (XOF)",
    "Reste à Recouvrer (XOF)",
  ];
  const invoiceRows = invoices.map((inv) => [
    inv.number,
    inv.createdAt.toISOString().slice(0, 10),
    inv.customer.companyName || inv.customer.contactName,
    inv.kind,
    inv.status,
    inv.subtotalHtXof,
    inv.taxXof,
    inv.totalXof,
    inv.paidXof,
    Math.max(0, inv.totalXof - inv.paidXof),
  ]);
  const wsInvoices = XLSX.utils.aoa_to_sheet([["BILAN FINANCIER — FACTURES EMISES"], [], invoiceHeaders, ...invoiceRows]);
  XLSX.utils.book_append_sheet(wb, wsInvoices, "Factures");

  // 2. Feuille Règlements & Encaissements
  const paymentHeaders = ["N° Facture", "Date Encaissement", "Client", "Mode Paiement", "Référence", "Montant (XOF)"];
  const paymentRows = payments.map((p) => [
    p.invoice.number,
    p.paidAt.toISOString().slice(0, 10),
    p.invoice.customer.companyName || p.invoice.customer.contactName,
    p.method,
    p.reference || "—",
    p.amountXof,
  ]);
  const wsPayments = XLSX.utils.aoa_to_sheet([["JOURNAL DES ENCAISSEMENTS"], [], paymentHeaders, ...paymentRows]);
  XLSX.utils.book_append_sheet(wb, wsPayments, "Encaissements");

  // 3. Feuille Devis & Proformas
  const quoteHeaders = ["N° Devis", "Date", "Client", "Statut", "Total TTC (XOF)"];
  const quoteRows = quotes.map((q) => [
    q.number,
    q.createdAt.toISOString().slice(0, 10),
    q.customer.companyName || q.customer.contactName,
    q.status,
    q.totalXof,
  ]);
  const wsQuotes = XLSX.utils.aoa_to_sheet([["SUIVI DES DEVIS ET PROFORMAS"], [], quoteHeaders, ...quoteRows]);
  XLSX.utils.book_append_sheet(wb, wsQuotes, "Devis & Proformas");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Bilan_Financier_Entreprise_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
