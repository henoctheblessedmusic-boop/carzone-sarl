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

const SUPPORT_IMAGE = "/images/vehicles/x55-main.jpg";
const TERMINAL_IMAGE = "/images/vehicles/b40-main.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];

  return {
    metadataBase: new URL(SITE_WEBSITE),
    title: copy.meta.recharge.title,
    description: copy.meta.recharge.description,
    alternates: { canonical: "/recharge" },
    openGraph: {
      title: copy.meta.recharge.title,
      description: copy.meta.recharge.description,
      url: "/recharge",
      siteName: "CARZONE SARL",
      locale: OG_LOCALE[locale],
      type: "website",
    },
  };
}

export default async function RechargePage() {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  const recharge = copy.recharge;

  return (
    <>
      <section className="site-page-hero">
        <Container className="site-page-hero-inner">
          <p className="site-eyebrow">{recharge.hero.eyebrow}</p>
          <h1 className="site-page-title">{recharge.hero.title}</h1>
          <p className="site-page-subtitle">{recharge.hero.subtitle}</p>
          <div className="site-hero-ctas">
            <CtaLink href="/contact" variant="primary">
              {recharge.hero.primaryCta}
            </CtaLink>
            <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="ghost" external>
              {recharge.hero.secondaryCta}
            </CtaLink>
          </div>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="solutions-heading">
        <Container>
          <SectionHeading
            id="solutions-heading"
            eyebrow={recharge.solutions.eyebrow}
            title={recharge.solutions.title}
            subtitle={recharge.solutions.subtitle}
          />
          <div className="site-pillars-grid">
            {recharge.solutions.items.map((item) => (
              <article className="site-pillar-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="process-heading">
        <Container>
          <SectionHeading
            id="process-heading"
            eyebrow={recharge.process.eyebrow}
            title={recharge.process.title}
            subtitle={recharge.process.subtitle}
          />
          <ol className="site-timeline">
            {recharge.process.items.map((item, index) => (
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

      <section className="site-section" aria-labelledby="support-heading">
        <Container className="site-feature-row">
          <div className="site-feature-media">
            <Image
              src={SUPPORT_IMAGE}
              alt={recharge.support.imageAlt}
              fill
              sizes="(max-width: 1024px) 92vw, 48vw"
              className="site-feature-img"
            />
          </div>
          <div className="site-feature-copy">
            <p className="site-eyebrow">{recharge.support.eyebrow}</p>
            <h2 className="site-section-title" id="support-heading">
              {recharge.support.title}
            </h2>
            <p>{recharge.support.description}</p>
          </div>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="terminal-heading">
        <Container className="site-feature-row site-feature-row--reverse">
          <div className="site-feature-media">
            <Image
              src={TERMINAL_IMAGE}
              alt={recharge.terminal.imageAlt}
              fill
              sizes="(max-width: 1024px) 92vw, 48vw"
              className="site-feature-img"
            />
          </div>
          <div className="site-feature-copy">
            <p className="site-eyebrow">{recharge.terminal.eyebrow}</p>
            <h2 className="site-section-title" id="terminal-heading">
              {recharge.terminal.title}
            </h2>
            <p>{recharge.terminal.description}</p>
          </div>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="recharge-faq-heading">
        <Container className="site-faq">
          <h2 className="site-section-title" id="recharge-faq-heading">
            {recharge.faq.title}
          </h2>
          <div className="site-faq-list">
            {recharge.faq.items.map((item) => (
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
          <h2>{recharge.finalCta.title}</h2>
          <p>{recharge.finalCta.subtitle}</p>
          <div className="site-hero-ctas">
            <CtaLink href="/contact" variant="primary">
              {recharge.finalCta.primaryCta}
            </CtaLink>
            <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="secondary" external>
              {recharge.finalCta.secondaryCta}
            </CtaLink>
          </div>
        </Container>
      </section>
    </>
  );
}
