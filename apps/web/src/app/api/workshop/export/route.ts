import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exportWorkshopToExcel } from "@/lib/excel-workshop";
import { apiPermissionDenied, apiUnauthorized, getApiUser, hasApiPermission } from "@/lib/api-auth";

export async function GET() {
  const session = await getApiUser();
  if (!session) return apiUnauthorized();
  if (!hasApiPermission(session, "workshop:read")) return apiPermissionDenied();

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
