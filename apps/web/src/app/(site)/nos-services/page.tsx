import type { Metadata } from "next";
import Image from "next/image";
import { getSiteLocale } from "@/lib/site-locale-server";
import { siteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaLink } from "@/components/site/CtaLink";
import { SITE_PRIMARY_PHONE, SITE_WEBSITE, whatsAppHref } from "@/lib/site-constants";

const OG_LOCALE: Record<SiteLocale, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  zh: "zh_CN",
};

const WARRANTY_IMAGE = "/images/vehicles/cs75-main.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return {
    metadataBase: new URL(SITE_WEBSITE),
    title: copy.meta.services.title,
    description: copy.meta.services.description,
    alternates: { canonical: "/nos-services" },
    openGraph: {
      title: copy.meta.services.title,
      description: copy.meta.services.description,
      url: "/nos-services",
      siteName: "CARZONE SARL",
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: "/brand/carzone-og.png", width: 1200, height: 630, alt: "CARZONE SARL" }],
    },
    twitter: { card: "summary_large_image", images: ["/brand/carzone-og.png"] },
  };
}

export default async function NosServicesPage() {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  const services = copy.services;

  return (
    <>
      <section className="site-page-hero">
        <Container className="site-page-hero-inner">
          <p className="site-eyebrow">{services.hero.eyebrow}</p>
          <h1 className="site-page-title">{services.hero.title}</h1>
          <p className="site-page-subtitle">{services.hero.subtitle}</p>
          <div className="site-hero-ctas">
            <CtaLink href="/contact" variant="primary">
              {services.hero.primaryCta}
            </CtaLink>
            <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="ghost" external>
              {services.hero.secondaryCta}
            </CtaLink>
          </div>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="offerings-heading">
        <Container>
          <SectionHeading
            id="offerings-heading"
            eyebrow={services.offerings.eyebrow}
            title={services.offerings.title}
            subtitle={services.offerings.subtitle}
          />
          <div className="site-pillars-grid">
            {services.offerings.items.map((item) => (
              <article className="site-pillar-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="warranty-heading">
        <Container className="site-feature-row">
          <div className="site-feature-media">
            <Image
              src={WARRANTY_IMAGE}
              alt={services.warranty.imageAlt}
              fill
              sizes="(max-width: 1024px) 92vw, 48vw"
              className="site-feature-img"
            />
          </div>
          <div className="site-feature-copy">
            <p className="site-eyebrow">{services.warranty.eyebrow}</p>
            <h2 className="site-section-title" id="warranty-heading">
              {services.warranty.title}
            </h2>
            <p>{services.warranty.description}</p>
          </div>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="appointment-heading">
        <Container>
          <SectionHeading
            id="appointment-heading"
            eyebrow={services.appointment.eyebrow}
            title={services.appointment.title}
            subtitle={services.appointment.subtitle}
          />
          <ol className="site-timeline">
            {services.appointment.items.map((item, index) => (
              <li className="site-timeline-step" key={item.title}>
                <span className="site-timeline-number" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="site-timeline-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="fleet-heading">
        <Container>
          <SectionHeading
            id="fleet-heading"
            align="center"
            eyebrow={services.fleet.eyebrow}
            title={services.fleet.title}
            subtitle={services.fleet.description}
          />
          <div className="site-section-footer-cta site-section-footer-cta--center">
            <CtaLink href="/contact" variant="secondary">
              {services.fleet.cta}
            </CtaLink>
          </div>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="services-faq-heading">
        <Container className="site-faq">
          <h2 className="site-section-title" id="services-faq-heading">
            {services.faq.title}
          </h2>
          <div className="site-faq-list">
            {services.faq.items.map((item) => (
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
          <h2>{services.finalCta.title}</h2>
          <p>{services.finalCta.subtitle}</p>
          <div className="site-hero-ctas">
            <CtaLink href="/contact" variant="primary">
              {services.finalCta.primaryCta}
            </CtaLink>
            <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="secondary" external>
              {services.finalCta.secondaryCta}
            </CtaLink>
          </div>
        </Container>
      </section>
    </>
  );
}
