import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicShowcase } from "@/components/PublicShowcase";
import "./public-showcase.css";

export const metadata = {
  title: "CARZONE SARL Bénin — Concessionnaire Automobile Officiel & Mobilité Électrique Cotonou",
  description:
    "Showroom de véhicules neufs multimarques (Changan, Jetour, BYD, Geely, BAIC, Toyota, Dongfeng), cotations immédiates, commandes d'usine sur-mesure, atelier SAV certifié et solutions de recharge VE à Cotonou, Bénin.",
};

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
