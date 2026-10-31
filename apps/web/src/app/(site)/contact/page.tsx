import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSiteLocale } from "@/lib/site-locale-server";
import { siteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaLink } from "@/components/site/CtaLink";
import { ContactForm } from "@/components/site/ContactForm";
import {
  SITE_EMAILS,
  SITE_MAPS_URL,
  SITE_PHONES,
  SITE_PRIMARY_PHONE,
  SITE_WEBSITE,
  telHref,
  whatsAppHref,
} from "@/lib/site-constants";

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
    title: copy.meta.contact.title,
    description: copy.meta.contact.description,
    alternates: { canonical: "/contact" },
    openGraph: {
      title: copy.meta.contact.title,
      description: copy.meta.contact.description,
      url: "/contact",
      siteName: "CARZONE SARL",
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: "/brand/carzone-og.png", width: 1200, height: 630, alt: "CARZONE SARL" }],
    },
    twitter: { card: "summary_large_image", images: ["/brand/carzone-og.png"] },
  };
}

export default async function ContactPage() {
  const locale = await getSiteLocale();
  const copy = siteCopy[locale];
  const contact = copy.contact;

  return (
    <>
      <section className="site-page-hero">
        <Container className="site-page-hero-inner">
          <p className="site-eyebrow">{contact.hero.eyebrow}</p>
          <h1 className="site-page-title">{contact.hero.title}</h1>
          <p className="site-page-subtitle">{contact.hero.subtitle}</p>
        </Container>
      </section>

      <section className="site-section" aria-labelledby="contact-channels-heading">
        <Container>
          <SectionHeading
            id="contact-channels-heading"
            eyebrow={contact.channels.eyebrow}
            title={contact.channels.title}
            subtitle={contact.channels.subtitle}
          />
          <div className="site-contact-grid">
            <article className="site-contact-card">
              <span className="site-contact-icon" aria-hidden="true">
                <Phone size={20} strokeWidth={1.8} />
              </span>
              <h3>{contact.channels.phoneTitle}</h3>
              <p>{contact.channels.phoneNote}</p>
              <ul className="site-contact-list">
                {SITE_PHONES.map((phone) => (
                  <li key={phone}>
                    <a href={telHref(phone)}>{phone}</a>
                  </li>
                ))}
              </ul>
            </article>
            <article className="site-contact-card">
              <span className="site-contact-icon" aria-hidden="true">
                <Mail size={20} strokeWidth={1.8} />
              </span>
              <h3>{contact.channels.emailTitle}</h3>
              <p>{contact.channels.emailNote}</p>
              <ul className="site-contact-list">
                <li>
                  <a href={`mailto:${SITE_EMAILS.contact}`}>{SITE_EMAILS.contact}</a>
                </li>
                <li>
                  <a href={`mailto:${SITE_EMAILS.direction}`}>{SITE_EMAILS.direction}</a>
                </li>
              </ul>
            </article>
            <article className="site-contact-card">
              <span className="site-contact-icon" aria-hidden="true">
                <MessageCircle size={20} strokeWidth={1.8} />
              </span>
              <h3>{contact.channels.whatsappTitle}</h3>
              <p>{contact.channels.whatsappNote}</p>
              <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="ghost" external>
                {contact.channels.whatsappCta}
              </CtaLink>
            </article>
          </div>
        </Container>
      </section>

      <section className="site-section site-section--muted" aria-labelledby="showroom-heading">
        <Container>
          <SectionHeading
            id="showroom-heading"
            eyebrow={contact.showroom.eyebrow}
            title={contact.showroom.title}
            subtitle={contact.showroom.subtitle}
          />
          <div className="site-contact-layout">
            <aside className="site-showroom-panel" aria-label={contact.showroom.addressTitle}>
              <div className="site-showroom-block">
                <span className="site-contact-icon" aria-hidden="true">
                  <MapPin size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <h3>{contact.showroom.addressTitle}</h3>
                  <p className="site-address-lines">
                    {contact.showroom.addressLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                </div>
              </div>
              <div className="site-showroom-block">
                <span className="site-contact-icon" aria-hidden="true">
                  <Clock size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <h3>{contact.showroom.hoursTitle}</h3>
                  <p>{contact.showroom.hoursNote}</p>
                </div>
              </div>
              <CtaLink href={SITE_MAPS_URL} variant="secondary" external>
                {contact.showroom.directionsCta}
              </CtaLink>
            </aside>

            <div>
              <h3 className="site-contact-form-title">{contact.form.title}</h3>
              <p className="site-contact-form-subtitle">{contact.form.subtitle}</p>
              <ContactForm
                copy={contact.form}
                contactEmail={SITE_EMAILS.contact}
                whatsappHref={whatsAppHref(SITE_PRIMARY_PHONE)}
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="site-final-cta">
        <Container className="site-final-cta-inner">
          <h2>{contact.finalCta.title}</h2>
          <p>{contact.finalCta.subtitle}</p>
          <div className="site-hero-ctas">
            <CtaLink href={whatsAppHref(SITE_PRIMARY_PHONE)} variant="primary" external>
              {contact.finalCta.primaryCta}
            </CtaLink>
            <CtaLink href="/vehicules" variant="secondary">
              {contact.finalCta.secondaryCta}
            </CtaLink>
          </div>
        </Container>
      </section>
    </>
  );
}
