import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exportWorkshopToExcel } from "@/lib/excel-workshop";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  // Exemple guidé neutre Carzone
  const sampleEntries = [
    {
      entryDate: "13/10/2026",
      entryTime: "08:30",
      orNumber: "OR-001",
      immatriculation: "AB 1234 RB",
      chassis: "JT3HP10V2N0123456",
      brand: "TOYOTA",
      model: "LAND CRUISER PRADO",
      mileage: 15400,
      clientName: "Client Exemple Carzone",
      clientType: "Particulier",
      fuelLevel: "3/4",
      phone: "+229 01 92 61 61 61",
      receptionist: "Réceptionnaire Atelier",
      immobilizationDuration: "24h",
      observations: "Révision générale et vidange",
      presenceSav: "OUI",
      statusCode: "C",
      endWorksAt: "14/10/2026 12:00",
      executionDuration: "4h",
      worksDone: "Vidange moteur, remplacement filtre à huile et filtre à air",
      exitDate: "14/10/2026",
      exitTime: "14:00",
      deliverer: "Chef Atelier",
      paymentMode: "Espèces",
    },
  ];

  const buffer = exportWorkshopToExcel(sampleEntries);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Modele_Fichier_Excel_SAV_Atelier.xlsx"`,
    },
  });
}
