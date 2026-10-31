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

const INTRO_IMAGE = "/images/vehicles/cs75-main.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return {
    metadataBase: new URL(SITE_WEBSITE),
    title: copy.meta.surMesure.title,
    description: copy.meta.surMesure.description,
    alternates: { canonical: "/sur-mesure" },
    openGraph: {
      title: copy.meta.surMesure.title,
      description: copy.meta.surMesure.description,
      url: "/sur-mesure",
      siteName: "CARZONE SARL",
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: "/brand/carzone-og.png", width: 1200, height: 630, alt: "CARZONE SARL" }],
    },
    twitter: { card: "summary_large_image", images: ["/brand/carzone-og.png"] },
  };
}

export default async function SurMesurePage() {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  const sur = copy.surMesure;

  return (
    <>
      <section className="site-page-hero">
        <Container className="site-page-hero-inner">
          <p className="site-eyebrow">{sur.hero.eyebrow}</p>
          <h1 className="site-page-title">{sur.hero.title}</h1>
          <p className="site-page-subtitle">{sur.hero.subtitle}</p>
          <div className="site-hero-ctas">
            <CtaLink href="/contact" variant="primary">
              {sur.hero.primaryCta}
            </CtaLink>
            <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="ghost" external>
              {sur.hero.secondaryCta}
            </CtaLink>
          </div>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="intro-heading">
        <Container className="site-feature-row">
          <div className="site-feature-media">
            <Image
              src={INTRO_IMAGE}
              alt={sur.intro.imageAlt}
              fill
              sizes="(max-width: 1024px) 92vw, 48vw"
              className="site-feature-img"
            />
          </div>
          <div className="site-feature-copy">
            <p className="site-eyebrow">{sur.intro.eyebrow}</p>
            <h2 className="site-section-title" id="intro-heading">
              {sur.intro.title}
            </h2>
            <p>{sur.intro.description}</p>
          </div>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="steps-heading">
        <Container>
          <SectionHeading
            id="steps-heading"
            eyebrow={sur.steps.eyebrow}
            title={sur.steps.title}
            subtitle={sur.steps.subtitle}
          />
          <ol className="site-timeline">
            {sur.steps.items.map((item, index) => (
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

      <section className="site-section site-section--muted" aria-labelledby="why-heading">
        <Container>
          <SectionHeading
            id="why-heading"
            eyebrow={sur.whyUs.eyebrow}
            title={sur.whyUs.title}
            subtitle={sur.whyUs.subtitle}
          />
          <div className="site-pillars-grid">
            {sur.whyUs.items.map((item) => (
              <article className="site-pillar-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="included-heading">
        <Container>
          <SectionHeading
            id="included-heading"
            eyebrow={sur.included.eyebrow}
            title={sur.included.title}
            subtitle={sur.included.subtitle}
          />
          <ul className="site-included-list">
            {sur.included.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="sur-mesure-faq-heading">
        <Container className="site-faq">
          <h2 className="site-section-title" id="sur-mesure-faq-heading">
            {sur.faq.title}
          </h2>
          <div className="site-faq-list">
            {sur.faq.items.map((item) => (
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
          <h2>{sur.finalCta.title}</h2>
          <p>{sur.finalCta.subtitle}</p>
          <div className="site-hero-ctas">
            <CtaLink href="/contact" variant="primary">
              {sur.finalCta.primaryCta}
            </CtaLink>
            <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="secondary" external>
              {sur.finalCta.secondaryCta}
            </CtaLink>
          </div>
        </Container>
      </section>
    </>
  );
}
