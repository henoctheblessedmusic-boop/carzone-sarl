import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTechSheetWithAI } from "@/lib/openai-tech-sheet";
import { requireUser } from "@/lib/require-user";

export async function POST(req: Request) {
  try {
    await requireUser();
    const body = await req.json();
    const { vehicleId, customApiKey } = body;

    if (!vehicleId) {
      return NextResponse.json({ error: "vehicleId requis" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
    }

    // Générer avec OpenAI
    const sheet = await generateTechSheetWithAI(
      {
        brand: vehicle.brand,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        energy: vehicle.energy,
      },
      customApiKey
    );

    // Conserver les photos existantes du véhicule si elles sont valides
    const updatedSheet = {
      ...sheet,
      mainPhotoUrl: vehicle.mainPhotoUrl || sheet.mainPhotoUrl,
      interiorPhotoUrl: vehicle.interiorPhotoUrl || sheet.interiorPhotoUrl,
      exteriorPhotoUrl: vehicle.exteriorPhotoUrl || sheet.exteriorPhotoUrl,
      rearPhotoUrl: vehicle.rearPhotoUrl || sheet.rearPhotoUrl,
    };

    // Mettre à jour en BDD avec les photos officielles synchronisées
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        technicalSheetJson: JSON.stringify(updatedSheet),
        hasTechSheet: true,
        mainPhotoUrl: updatedSheet.mainPhotoUrl,
        interiorPhotoUrl: updatedSheet.interiorPhotoUrl,
        exteriorPhotoUrl: updatedSheet.exteriorPhotoUrl,
        rearPhotoUrl: updatedSheet.rearPhotoUrl,
      },
    });

    return NextResponse.json({
      success: true,
      sheet: updatedSheet,
      vehicle: updatedVehicle,
    });
  } catch (err: unknown) {
    console.error("Erreur génération fiche technique OpenAI:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Erreur interne lors de la génération avec OpenAI" },
      { status: 500 }
    );
  }
}
