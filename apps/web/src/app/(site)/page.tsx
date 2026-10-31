import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteLocale } from "@/lib/site-locale-server";
import { siteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CheckCircle2 } from "lucide-react";
import { CtaLink } from "@/components/site/CtaLink";
import { VehicleCard } from "@/components/site/VehicleCard";
import { HomeHeroSlideshow, type SlideshowVehicle } from "@/components/site/HomeHeroSlideshow";
import { QuoteRequestProvider } from "@/components/site/QuoteRequestProvider";
import { QuoteOpenButton } from "@/components/site/QuoteOpenButton";
import { SITE_BRANDS, SITE_PRIMARY_PHONE, SITE_WEBSITE, whatsAppHref } from "@/lib/site-constants";

const OG_LOCALE: Record<SiteLocale, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  zh: "zh_CN",
};

const SHOWROOM_STATUSES = ["EN_STOCK", "EN_MAGASIN"];
const HIGHLIGHT_STATUSES = ["EN_STOCK", "EN_MAGASIN", "AU_PORT", "EN_TRANSIT", "EN_PRODUCTION"];
const HIGHLIGHT_LIMIT = 6;

/** Marques chinoises mises en avant dans le diaporama d'accueil (Toyota exclu). */
const CHINESE_BRANDS = ["CHANGAN", "JETOUR", "BYD", "GEELY", "BAIC", "FORTHING", "CHERY", "DEEPAL"];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return {
    metadataBase: new URL(SITE_WEBSITE),
    title: copy.meta.home.title,
    description: copy.meta.home.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: copy.meta.home.title,
      description: copy.meta.home.description,
      url: "/",
      siteName: "CARZONE SARL",
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: "/brand/carzone-og.png", width: 1200, height: 630, alt: "CARZONE SARL" }],
    },
    twitter: { card: "summary_large_image", images: ["/brand/carzone-og.png"] },
  };
}

async function getHighlightVehicles(): Promise<SlideshowVehicle[]> {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { in: HIGHLIGHT_STATUSES }, mainPhotoUrl: { not: null } },
      select: {
        id: true,
        brand: true,
        model: true,
        variant: true,
        year: true,
        energy: true,
        status: true,
        priceXof: true,
        mainPhotoUrl: true,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 20,
    });

    const chineseVehicles = vehicles.filter((vehicle) => CHINESE_BRANDS.includes(vehicle.brand.toUpperCase()));
    const isUniK = (vehicle: { brand: string; model: string }): number =>
      vehicle.brand.toUpperCase() === "CHANGAN" && vehicle.model.toUpperCase().includes("UNI-K") ? 0 : 1;
    const ordered = [...chineseVehicles].sort((a, b) => {
      const unitDiff = isUniK(a) - isUniK(b);
      if (unitDiff !== 0) return unitDiff;
      return (b.year ?? 0) - (a.year ?? 0);
    });

    return ordered
      .filter((vehicle) => vehicle.mainPhotoUrl !== null)
      .slice(0, HIGHLIGHT_LIMIT)
      .map((vehicle) => ({ ...vehicle, mainPhotoUrl: vehicle.mainPhotoUrl as string }));
  } catch (error) {
    console.error("Erreur chargement des véhicules à la une (accueil vitrine) :", error);
    return [];
  }
}

async function getAvailableVehiclesCount(): Promise<number> {
  try {
    return await prisma.vehicle.count({ where: { status: { in: SHOWROOM_STATUSES } } });
  } catch (error) {
    console.error("Erreur comptage des véhicules disponibles (accueil vitrine) :", error);
    return 0;
  }
}

export default async function HomePage() {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  const [vehicles, availableCount] = await Promise.all([getHighlightVehicles(), getAvailableVehiclesCount()]);
  const stats = copy.home.stats.map((stat, index) =>
    index === 1 ? { ...stat, value: String(availableCount) } : stat,
  );

  return (
    <QuoteRequestProvider
      copy={copy.quote}
      statusLabels={copy.vehicules.statusLabels}
      energyLabels={copy.vehicules.energyLabels}
    >
      <>
      <HomeHeroSlideshow
        vehicles={vehicles}
        locale={locale}
        statusLabels={copy.vehicules.statusLabels}
        energyLabels={copy.vehicules.energyLabels}
        copy={copy.home.slideshow}
        quoteCopy={copy.quote}
      />

      <section className="site-section site-section--muted site-intro" aria-labelledby="intro-heading">
        <Container>
          <SectionHeading
            id="intro-heading"
            eyebrow={copy.home.intro.eyebrow}
            title={copy.home.intro.title}
            subtitle={copy.home.intro.subtitle}
          />
          <ul className="site-promise-bullets">
            {copy.home.promise.bullets.map((item) => (
              <li key={item}>
                <CheckCircle2 aria-hidden="true" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <ul className="site-hero-brands" aria-label={copy.home.intro.brandsLabel}>
            {SITE_BRANDS.map((brand) => (
              <li key={brand}>{brand}</li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="site-section site-section--tight-top" aria-labelledby="vehicles-heading">
        <Container>
          <SectionHeading
            id="vehicles-heading"
            eyebrow={copy.home.vehicles.eyebrow}
            title={copy.home.vehicles.title}
            subtitle={copy.home.vehicles.subtitle}
          />
          {vehicles.length > 0 ? (
            <div className="site-vehicles-grid">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  newBadgeLabel={copy.home.vehicles.newBadge}
                  quoteCopy={copy.quote}
                  statusLabels={copy.vehicules.statusLabels}
                  energyLabels={copy.vehicules.energyLabels}
                />
              ))}
            </div>
          ) : (
            <p className="site-empty-message">{copy.home.vehicles.emptyMessage}</p>
          )}
          <div className="site-section-footer-cta">
            <CtaLink href="/vehicules" variant="secondary">
              {copy.home.vehicles.viewAllCta}
            </CtaLink>
          </div>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="process-heading">
        <Container>
          <SectionHeading
            id="process-heading"
            eyebrow={copy.home.process.eyebrow}
            title={copy.home.process.title}
            subtitle={copy.home.process.subtitle}
          />
          <ol className="site-process-grid">
            {copy.home.process.steps.map((step, index) => (
              <li className="site-process-card" key={step.title}>
                <span className="site-process-step" aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="pillars-heading">
        <Container>
          <SectionHeading
            id="pillars-heading"
            eyebrow={copy.home.pillars.eyebrow}
            title={copy.home.pillars.title}
            subtitle={copy.home.pillars.subtitle}
          />
          <div className="site-pillars-grid">
            {copy.home.pillars.items.map((item) => (
              <article className="site-pillar-card" key={item.href}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <CtaLink href={item.href} variant="secondary">
                  {item.linkLabel}
                </CtaLink>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="site-stats" aria-label="Chiffres clés">
        <Container className="site-stats-grid">
          {stats.map((stat) => (
            <div className="site-stat" key={stat.label}>
              <p className="site-stat-value">{stat.value}</p>
              <p className="site-stat-label">{stat.label}</p>
            </div>
          ))}
        </Container>
      </section>

      <section className="site-section site-team-teaser" aria-labelledby="team-heading">
        <Container>
          <SectionHeading
            id="team-heading"
            align="center"
            eyebrow={copy.home.team.eyebrow}
            title={copy.home.team.title}
            subtitle={copy.home.team.description}
          />
          <div className="site-section-footer-cta site-section-footer-cta--center">
            <CtaLink href="/equipe" variant="secondary">
              {copy.home.team.cta}
            </CtaLink>
          </div>
        </Container>
      </section>

      <section className="site-section site-trust-section" aria-labelledby="trust-heading">
        <Container>
          <p className="site-eyebrow">{copy.home.trustPoints.eyebrow}</p>
          <h2 id="trust-heading" className="site-section-title">
            {copy.home.trustPoints.title}
          </h2>
          <ul className="site-trust-list">
            {copy.home.trustPoints.items.map((item) => (
              <li key={item}>
                <CheckCircle2 aria-hidden="true" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="faq-heading">
        <Container className="site-faq">
          <h2 className="site-section-title" id="faq-heading">
            {copy.home.faq.title}
          </h2>
          <div className="site-faq-list">
            {copy.home.faq.items.map((item) => (
              <details className="site-faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="site-final-cta">
        <Container className="site-final-cta-inner">
          <h2>{copy.home.finalCta.title}</h2>
          <p>{copy.home.finalCta.subtitle}</p>
          <div className="site-hero-ctas">
            <QuoteOpenButton copy={copy.quote} />
            <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="secondary" external>
              {copy.home.finalCta.secondaryCta}
            </CtaLink>
          </div>
        </Container>
      </section>
      </>
    </QuoteRequestProvider>
  );
}
