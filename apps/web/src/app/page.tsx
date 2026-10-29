import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicShowcase } from "@/components/PublicShowcase";
import { getServerMessages } from "@/lib/i18n/server";
import { publicShowcaseCopy } from "@/lib/i18n/messages/public-showcase";
import "./public-showcase.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerMessages();
  const copy = publicShowcaseCopy[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
  };
}

export default async function HomePage() {
  const session = await getSession();

  let liveDbVehicles: any[] = [];
  try {
    const rawList = await prisma.vehicle.findMany({
      select: {
        id: true,
        vin: true,
        brand: true,
        model: true,
        variant: true,
        year: true,
        energy: true,
        vehicleType: true,
        transmission: true,
        color: true,
        mileage: true,
        priceXof: true,
        status: true,
        etaDate: true,
        mainPhotoUrl: true,
        interiorPhotoUrl: true,
        exteriorPhotoUrl: true,
        rearPhotoUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });

    liveDbVehicles = rawList.map((v) => ({
      ...v,
      etaDate: v.etaDate ? v.etaDate.toISOString() : null,
    }));
  } catch (e) {
    console.error("Erreur chargement véhicules live DB:", e);
  }

  return <PublicShowcase session={session} liveDbVehicles={liveDbVehicles} />;
}
