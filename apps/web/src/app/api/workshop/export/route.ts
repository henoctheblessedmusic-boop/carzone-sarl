import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exportWorkshopToExcel } from "@/lib/excel-workshop";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const entries = await prisma.workshopEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const buffer = exportWorkshopToExcel(entries);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Historique_SAV_Atelier_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
