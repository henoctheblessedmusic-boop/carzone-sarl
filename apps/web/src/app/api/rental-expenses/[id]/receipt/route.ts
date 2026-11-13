import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const RECEIPT_VIEW_ROLES = ["GESTIONNAIRE_LOCATION", "COMPTA", "DG", "PDG", "SG", "RH"];

/** Sert le reçu d'une dépense location sans exposer les autres pièces du dossier. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || !RECEIPT_VIEW_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const expense = await prisma.rentalExpense.findUnique({
    where: { id },
    select: { receiptBytes: true, receiptMimeType: true, receiptFileName: true },
  });
  if (!expense?.receiptBytes) {
    return NextResponse.json({ error: "Reçu introuvable" }, { status: 404 });
  }
  const fileName = (expense.receiptFileName || "recu-location").replace(/[^\w.\- ]+/g, "_");
  return new NextResponse(new Uint8Array(expense.receiptBytes), {
    headers: {
      "Content-Type": expense.receiptMimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
