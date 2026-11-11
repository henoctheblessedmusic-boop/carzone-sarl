import type { Metadata } from "next";
import { getSiteLocale } from "@/lib/site-locale-server";
import { siteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { Container } from "@/components/site/Container";
import { VehiclesCatalog } from "@/components/site/VehiclesCatalog";
import { QuoteRequestProvider } from "@/components/site/QuoteRequestProvider";
import { SITE_WEBSITE } from "@/lib/site-constants";
import { loadCatalogVersions } from "@/server/vehicle-catalog-query";
import { parseCatalogUrlState } from "@/lib/vehicle-catalog-url";
import type { CatalogVersion } from "@/lib/vehicle-catalog";

const OG_LOCALE: Record<SiteLocale, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  zh: "zh_CN",
};

const CATALOG_PATHNAME = "/vehicules";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return {
    metadataBase: new URL(SITE_WEBSITE),
    title: copy.meta.vehicules.title,
    description: copy.meta.vehicules.description,
    alternates: { canonical: CATALOG_PATHNAME },
    openGraph: {
      title: copy.meta.vehicules.title,
      description: copy.meta.vehicules.description,
      url: CATALOG_PATHNAME,
      siteName: "CARZONE SARL",
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: "/brand/carzone-og.png", width: 1200, height: 630, alt: "CARZONE SARL" }],
    },
    twitter: { card: "summary_large_image", images: ["/brand/carzone-og.png"] },
  };
}

/**
 * Le catalogue reste affiché si la base est injoignable : une erreur de lecture
 * ne doit pas renvoyer une page en erreur au visiteur.
 */
async function getCatalogVersions(): Promise<CatalogVersion[]> {
  try {
    return await loadCatalogVersions();
  } catch (error) {
    console.error("Erreur chargement du catalogue vehicules (vitrine) :", error);
    return [];
  }
}

interface VehiculesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VehiculesPage({ searchParams }: VehiculesPageProps) {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  const [versions, resolvedSearchParams] = await Promise.all([
    getCatalogVersions(),
    searchParams ?? Promise.resolve({}),
  ]);
  // Lu côté serveur : un lien partagé rouvre la bonne fiche sans attendre le
  // premier rendu client.
  const initialState = parseCatalogUrlState(resolvedSearchParams);

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
            <VehiclesCatalog
              versions={versions}
              copy={copy.vehicules}
              locale={locale}
              quoteCopy={copy.quote}
              initialState={initialState}
              pathname={CATALOG_PATHNAME}
            />
          </Container>
        </section>
      </>
    </QuoteRequestProvider>
  );
}
