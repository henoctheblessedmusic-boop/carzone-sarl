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
      where: {
        status: { in: ["EN_MAGASIN", "EN_STOCK"] },
        publishedOnSite: true,
        variant: { not: null },
        year: { not: null },
        energy: { not: "NON_RENSEIGNEE" },
      },
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
        exteriorColorShade: true,
        exteriorColorBase: true,
        versionId: true,
        mileage: true,
        priceXof: true,
        priceToConfirm: true,
        status: true,
        mainPhotoUrl: true,
        interiorPhotoUrl: true,
        exteriorPhotoUrl: true,
        rearPhotoUrl: true,
        photosVerified: true,
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const grouped = new Map<string, CatalogVehicle & { colorSet: Set<string> }>();
    for (const vehicle of vehicles) {
      const key =
        vehicle.versionId ||
        [vehicle.brand, vehicle.model, vehicle.variant, vehicle.year, vehicle.energy].join("|");
      const shade = vehicle.exteriorColorShade || vehicle.exteriorColorBase || vehicle.color;
      const current = grouped.get(key);
      if (current) {
        current.availableCount = (current.availableCount ?? 1) + 1;
        if (shade) current.colorSet.add(shade);
        if ((vehicle.priceXof || 0) > 0 && (current.priceXof || 0) === 0) current.priceXof = vehicle.priceXof;
      } else {
        grouped.set(key, {
          ...vehicle,
          seatsPhotoUrl: toSeatsPhotoUrl(vehicle.interiorPhotoUrl),
          availableCount: 1,
          colors: shade ? [shade] : [],
          colorSet: new Set(shade ? [shade] : []),
        });
      }
    }

    return Array.from(grouped.values()).map(({ colorSet, ...vehicle }) => ({
      ...vehicle,
      colors: Array.from(colorSet),
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
