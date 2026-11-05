import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/client-import";
import { SITE_PRIMARY_PHONE, whatsAppHref } from "@/lib/site-constants";

const rentalRequestSchema = z.object({
  vehicleId: z.string().min(1),
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  startDate: z.string().min(8),
  days: z.coerce.number().int().min(1).max(365),
  mode: z.enum(["VISITE_SHOWROOM", "CONTRAT_A_DISTANCE"]).default("VISITE_SHOWROOM"),
  message: z.string().trim().max(1000).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = rentalRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Vérifiez le véhicule, vos coordonnées, la date et le nombre de jours." },
        { status: 400 }
      );
    }


    const data = parsed.data;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: {
        id: true,
        brand: true,
        model: true,
        variant: true,
        registrationNumber: true,
        fleetType: true,
        rentalStatus: true,
        rentalDailyXof: true,
        rentalMonthlyXof: true,
      },
    });

    if (!vehicle || vehicle.fleetType !== "RENTAL" || vehicle.rentalStatus !== "DISPONIBLE") {
      return NextResponse.json({ error: "Ce véhicule n'est plus disponible à la location." }, { status: 409 });
    }

    const startDate = new Date(data.startDate);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Date de début invalide." }, { status: 400 });
    }

    const dailyRate =
      vehicle.rentalDailyXof ||
      (vehicle.rentalMonthlyXof ? Math.round(vehicle.rentalMonthlyXof / 30) : null);
    const estimatedTotalXof = dailyRate ? dailyRate * data.days : null;
    const depositRequiredXof = estimatedTotalXof ? Math.round(estimatedTotalXof * 0.5) : null;

    const requestRecord = await prisma.rentalRequest.create({
      data: {
        vehicleId: vehicle.id,
        customerName: data.customerName,
        phone: normalizePhone(data.phone) || data.phone,
        email: data.email?.trim() || null,
        startDate,
        days: data.days,
        mode: data.mode,
        message: data.message?.trim() || null,
        estimatedTotalXof,
        depositRequiredXof,
        status: "NOUVELLE",
        createdByName: "VITRINE",
      },
      select: { id: true, createdAt: true },
    });

    const vehicleLabel = [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
    const modeLabel =
      data.mode === "CONTRAT_A_DISTANCE"
        ? "Contrat à distance"
        : "Visite du showroom";
    const whatsappMessage = [
      `Bonjour CARZONE SARL, je souhaite une location : ${vehicleLabel}${vehicle.registrationNumber ? ` (${vehicle.registrationNumber})` : ""}.`,
      `Formule : ${modeLabel}.`,
      `Début : ${data.startDate}. Durée : ${data.days} jour(s).`,
      estimatedTotalXof ? `Estimation : ${estimatedTotalXof.toLocaleString("fr-BJ")} FCFA.` : "Estimation : sur devis.",
      depositRequiredXof ? `Acompte de réservation (50 %) : ${depositRequiredXof.toLocaleString("fr-BJ")} FCFA.` : "",
      `Nom : ${data.customerName} - Téléphone : ${data.phone}.`,
      data.message ? `Message : ${data.message}` : "",
      `Référence : LOC-${requestRecord.id.slice(-8).toUpperCase()}`,
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({
      success: true,
      reference: `LOC-${requestRecord.id.slice(-8).toUpperCase()}`,
      estimatedTotalXof,
      depositRequiredXof,
      days: data.days,
      vehicleLabel,
      whatsappUrl: whatsAppHref(SITE_PRIMARY_PHONE, whatsappMessage),
    });
  } catch (error) {
    console.error("Erreur demande location vitrine:", error);
    return NextResponse.json({ error: "Impossible d'enregistrer la demande pour le moment." }, { status: 500 });
  }
}
