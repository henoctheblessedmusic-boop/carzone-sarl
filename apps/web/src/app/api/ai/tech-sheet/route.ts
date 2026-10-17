import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTechSheetWithAI } from "@/lib/openai-tech-sheet";
import { requireUser } from "@/lib/require-user";

export async function POST(req: Request) {
  try {
    await requireUser();
    const body = await req.json();
    const { vehicleId, customApiKey, action, sheetData } = body;

    if (!vehicleId) {
      return NextResponse.json({ error: "vehicleId requis" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
    }

    // Action 1: Confirmation explicite en Base de Données
    if (action === "confirm") {
      const sheetToSave = sheetData || (vehicle.technicalSheetJson ? JSON.parse(vehicle.technicalSheetJson) : null);
      const updatedVehicle = await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          techSheetConfirmed: true,
          techSheetConfirmedAt: new Date(),
          hasTechSheet: true,
          ...(sheetToSave ? { technicalSheetJson: JSON.stringify(sheetToSave) } : {}),
        },
      });
      return NextResponse.json({
        success: true,
        confirmed: true,
        vehicle: updatedVehicle,
      });
    }

    // Action 2: Génération unitaire avec OpenAI / DeepSeek
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

    // Mettre à jour en BDD en mode non confirmé (en attente de confirmation utilisateur)
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        technicalSheetJson: JSON.stringify(updatedSheet),
        hasTechSheet: true,
        techSheetConfirmed: false,
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
