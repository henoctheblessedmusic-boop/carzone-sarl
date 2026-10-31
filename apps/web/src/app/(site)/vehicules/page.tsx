import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteLocale } from "@/lib/site-locale-server";
import { siteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { Container } from "@/components/site/Container";
import { VehiclesCatalog } from "@/components/site/VehiclesCatalog";
import { QuoteRequestProvider } from "@/components/site/QuoteRequestProvider";
import type { CatalogVehicle } from "@/components/site/VehicleDetailModal";
import { SITE_WEBSITE } from "@/lib/site-constants";

const OG_LOCALE: Record<SiteLocale, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  zh: "zh_CN",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return {
    metadataBase: new URL(SITE_WEBSITE),
    title: copy.meta.vehicules.title,
    description: copy.meta.vehicules.description,
    alternates: { canonical: "/vehicules" },
    openGraph: {
      title: copy.meta.vehicules.title,
      description: copy.meta.vehicules.description,
      url: "/vehicules",
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

async function getCatalogVehicles(): Promise<CatalogVehicle[]> {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
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
        mainPhotoUrl: true,
        interiorPhotoUrl: true,
        exteriorPhotoUrl: true,
        rearPhotoUrl: true,
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return vehicles.map((vehicle) => ({
      ...vehicle,
      seatsPhotoUrl: toSeatsPhotoUrl(vehicle.interiorPhotoUrl),
    }));
  } catch (error) {
    console.error("Erreur chargement du catalogue véhicules (vitrine) :", error);
    return [];
  }
}

export default async function VehiculesPage() {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  const vehicles = await getCatalogVehicles();

  return (
    <QuoteRequestProvider
      copy={copy.quote}
      statusLabels={copy.vehicules.statusLabels}
      energyLabels={copy.vehicules.energyLabels}
    >
      <>
      <section className="site-page-hero site-page-hero--compact">
        <Container>
          <p className="site-eyebrow">{copy.vehicules.hero.eyebrow}</p>
          <h1 className="site-page-title">{copy.vehicules.hero.title}</h1>
          <p className="site-page-subtitle">{copy.vehicules.hero.subtitle}</p>
        </Container>
      </section>

      <section className="site-section site-section--tight-top">
        <Container>
          <VehiclesCatalog vehicles={vehicles} copy={copy.vehicules} locale={locale} quoteCopy={copy.quote} />
        </Container>
      </section>
      </>
    </QuoteRequestProvider>
  );
}
