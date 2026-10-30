import type { Metadata } from "next";
import Image from "next/image";
import {
  Building2,
  Calculator,
  Landmark,
  Ship,
  Store,
  Wrench,
  Zap,
} from "lucide-react";
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

const DEPARTMENT_ICONS = [Landmark, Store, Wrench, Zap, Ship, Calculator];

const TEAM_IMAGE = "/images/vehicles/t2-main.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return {
    metadataBase: new URL(SITE_WEBSITE),
    title: copy.meta.equipe.title,
    description: copy.meta.equipe.description,
    alternates: { canonical: "/equipe" },
    openGraph: {
      title: copy.meta.equipe.title,
      description: copy.meta.equipe.description,
      url: "/equipe",
      siteName: "CARZONE SARL",
      locale: OG_LOCALE[locale],
      type: "website",
    },
  };
}

export default async function EquipePage() {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  const equipe = copy.equipe;

  return (
    <>
      <section className="site-page-hero">
        <Container className="site-page-hero-inner">
          <p className="site-eyebrow">{equipe.hero.eyebrow}</p>
          <h1 className="site-page-title">{equipe.hero.title}</h1>
          <p className="site-page-subtitle">{equipe.hero.subtitle}</p>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="team-intro-heading">
        <Container className="site-feature-row">
          <div className="site-feature-copy">
            <p className="site-eyebrow">{equipe.intro.eyebrow}</p>
            <h2 className="site-section-title" id="team-intro-heading">
              {equipe.intro.title}
            </h2>
            <p>{equipe.intro.description}</p>
          </div>
          <div className="site-feature-media">
            <Image
              src={TEAM_IMAGE}
              alt={equipe.hero.title}
              fill
              sizes="(max-width: 1024px) 92vw, 48vw"
              className="site-feature-img"
            />
          </div>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="departments-heading">
        <Container>
          <SectionHeading
            id="departments-heading"
            eyebrow={equipe.departments.eyebrow}
            title={equipe.departments.title}
            subtitle={equipe.departments.subtitle}
          />
          <div className="site-dept-grid">
            {equipe.departments.items.map((item, index) => {
              const Icon = DEPARTMENT_ICONS[index] ?? Building2;
              return (
                <article className="site-dept-card" key={item.title}>
                  <span className="site-dept-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul className="site-dept-list">
                    {item.responsibilities.map((responsibility) => (
                      <li key={responsibility}>{responsibility}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="leadership-heading">
        <Container>
          <div className="site-leadership">
            <p className="site-eyebrow">{equipe.leadership.eyebrow}</p>
            <h2 className="site-section-title" id="leadership-heading">
              {equipe.leadership.title}
            </h2>
            <blockquote className="site-leadership-quote">{equipe.leadership.message}</blockquote>
            <p className="site-leadership-signature">{equipe.leadership.signature}</p>
            <p className="site-leadership-availability">{equipe.leadership.availability}</p>
            <div className="site-hero-ctas">
              <CtaLink href="/contact" variant="primary">
                {copy.common.contactUs}
              </CtaLink>
              <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="ghost" external>
                {copy.common.whatsapp}
              </CtaLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="approach-heading">
        <Container>
          <SectionHeading
            id="approach-heading"
            eyebrow={equipe.approach.eyebrow}
            title={equipe.approach.title}
            subtitle={equipe.approach.subtitle}
          />
          <div className="site-pillars-grid">
            {equipe.approach.items.map((item) => (
              <article className="site-pillar-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="site-final-cta">
        <Container className="site-final-cta-inner">
          <h2>{equipe.finalCta.title}</h2>
          <p>{equipe.finalCta.subtitle}</p>
          <div className="site-hero-ctas">
            <CtaLink href="/contact" variant="primary">
              {equipe.finalCta.primaryCta}
            </CtaLink>
            <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="secondary" external>
              {equipe.finalCta.secondaryCta}
            </CtaLink>
          </div>
        </Container>
      </section>
    </>
  );
}
