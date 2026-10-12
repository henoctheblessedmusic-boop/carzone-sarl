import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exportWorkshopToExcel } from "@/lib/excel-workshop";
import { REAL_WORKSHOP_RECORDS } from "@/lib/workshop-seed-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  // Fournir les 3 premières lignes comme exemple guidé
  const sampleEntries = REAL_WORKSHOP_RECORDS.slice(0, 3);
  const buffer = exportWorkshopToExcel(sampleEntries);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Modele_Fichier_Excel_SAV_Atelier.xlsx"`,
    },
  });
}
