import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteLocale } from "@/lib/site-locale-server";
import { siteCopy } from "@/lib/i18n/site";
import { SITE_WEBSITE } from "@/lib/site-constants";
import { resolveVehicleTechSheet, type TechnicalSheet } from "@/lib/tech-sheet-generator";
import { RentalVehiclesCatalog, type RentalPublicVehicle } from "@/components/site/RentalVehiclesCatalog";

const OG_LOCALE: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  zh: "zh_CN",
};

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  return {
    metadataBase: new URL(SITE_WEBSITE),
    title: copy.meta.location.title,
    description: copy.meta.location.description,
    alternates: { canonical: "/location-vehicule" },
    openGraph: {
      title: copy.meta.location.title,
      description: copy.meta.location.description,
      url: "/location-vehicule",
      siteName: "CARZONE SARL",
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: "/brand/carzone-og.png", width: 1200, height: 630, alt: "CARZONE SARL" }],
    },
    twitter: { card: "summary_large_image", images: ["/brand/carzone-og.png"] },
  };
}

function toSeatsPhotoUrl(interiorPhotoUrl: string | null): string | null {
  if (!interiorPhotoUrl || !interiorPhotoUrl.includes("-interior.")) return null;
  return interiorPhotoUrl.replace("-interior.", "-seats.");
}

async function getRentalVehicles(): Promise<RentalPublicVehicle[]> {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { fleetType: "RENTAL", rentalStatus: "DISPONIBLE", mainPhotoUrl: { not: null } },
      orderBy: [{ rentalDailyXof: "asc" }, { brand: "asc" }, { model: "asc" }],
    });

    return vehicles.map((vehicle) => {
      let technicalSheet: TechnicalSheet | null = null;
      try {
        technicalSheet = resolveVehicleTechSheet(vehicle);
      } catch {
        technicalSheet = null;
      }
      return {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        energy: vehicle.energy,
        vehicleType: vehicle.vehicleType,
        transmission: vehicle.transmission,
        color: vehicle.color,
        mileage: vehicle.mileage,
        mainPhotoUrl: vehicle.mainPhotoUrl as string,
        interiorPhotoUrl: vehicle.interiorPhotoUrl,
        exteriorPhotoUrl: vehicle.exteriorPhotoUrl,
        rearPhotoUrl: vehicle.rearPhotoUrl,
        seatsPhotoUrl: toSeatsPhotoUrl(vehicle.interiorPhotoUrl),
        rentalDailyXof: vehicle.rentalDailyXof,
        rentalMonthlyXof: vehicle.rentalMonthlyXof,
        photosVerified: vehicle.photosVerified,
        technicalSheet,
      };
    });
  } catch (error) {
    console.error("Erreur chargement du parc de location vitrine:", error);
    return [];
  }
}

export default async function RentalVehiclesPage() {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  const vehicles = await getRentalVehicles();

  return (
    <main>
      <section className="site-page-hero site-page-hero--compact site-rental-hero">
        <div className="site-container">
          <p className="site-eyebrow">{copy.nav.location}</p>
          <h1 className="site-page-title">{copy.meta.location.title.replace(" | CARZONE SARL", "")}</h1>
          <p className="site-page-subtitle">{copy.meta.location.description}</p>
        </div>
      </section>

      <section className="site-section site-section--tight-top">
        <div className="site-container">
          <RentalVehiclesCatalog vehicles={vehicles} locale={locale} energyLabels={copy.vehicules.energyLabels} />
        </div>
      </section>
    </main>
  );
}
