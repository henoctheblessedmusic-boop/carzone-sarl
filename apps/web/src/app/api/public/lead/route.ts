import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      contactName,
      phone,
      email,
      vehicleInterest,
      energyPref,
      notes,
      source = "site_web_cotation",
    } = body;

    if (!contactName || (!phone && !email)) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre nom et au moins un contact (téléphone ou email)." },
        { status: 400 }
      );
    }

    // 1. Enregistrement du Lead commercial
    const lead = await prisma.lead.create({
      data: {
        contactName: contactName.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        interest: vehicleInterest ? vehicleInterest.trim() : "Demande générale",
        energyPref: energyPref ? energyPref.trim() : null,
        notes: notes ? notes.trim() : null,
        source: source,
        status: "NEW",
      },
    });

    // 2. Notification en temps réel pour la Direction & l'Équipe Commerciale
    try {
      await prisma.adminNotification.create({
        data: {
          type: "LEAD_WEB",
          title: "🔥 Nouvelle demande de cotation sur le site !",
          message: `${contactName} (${phone || email}) souhaite une cotation pour : ${vehicleInterest || "Véhicule"}.`,
          userName: contactName,
          newValue: vehicleInterest || "Site web",
          readBy: [],
        },
      });
    } catch {
      // Ignorer si adminNotification est facultatif
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Votre demande a été transmise avec succès à l'équipe commerciale CARZONE.",
    });
  } catch (error: any) {
    console.error("Erreur création lead public:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'enregistrement de votre demande." },
      { status: 500 }
    );
  }
}
