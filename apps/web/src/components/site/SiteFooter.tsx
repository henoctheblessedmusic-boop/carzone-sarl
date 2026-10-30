import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SiteCopy } from "@/lib/i18n/site";
import {
  SITE_ADDRESS,
  SITE_EMAILS,
  SITE_FISCAL,
  SITE_MAPS_URL,
  SITE_PHONES,
  SITE_SOCIAL,
  telHref,
} from "@/lib/site-constants";

interface SiteFooterProps {
  copy: SiteCopy;
}

export function SiteFooter({ copy }: SiteFooterProps) {
  const year = new Date().getFullYear();

  const navItems = [
    { href: "/", label: copy.nav.home },
    { href: "/vehicules", label: copy.nav.vehicules },
    { href: "/sur-mesure", label: copy.nav.surMesure },
    { href: "/nos-services", label: copy.nav.services },
    { href: "/recharge", label: copy.nav.recharge },
    { href: "/equipe", label: copy.nav.equipe },
    { href: "/contact", label: copy.nav.contact },
  ];

  return (
    <footer className="site-footer">
      <div className="site-container site-footer-grid">
        <div className="site-footer-brand">
          <p className="site-footer-logo">CARZONE SARL</p>
          <p className="site-footer-tagline">{copy.footer.tagline}</p>
        </div>

        <div className="site-footer-col">
          <h3 className="site-footer-col-title">{copy.footer.navTitle}</h3>
          <ul className="site-footer-nav">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer-col">
          <h3 className="site-footer-col-title">{copy.footer.addressTitle}</h3>
          <address className="site-footer-address">
            <MapPin aria-hidden="true" size={16} />
            <span>
              {SITE_ADDRESS.line1}, {SITE_ADDRESS.line2}
              <br />
              {SITE_ADDRESS.city}, {SITE_ADDRESS.country}
            </span>
          </address>
          <a href={SITE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="site-footer-maps-link">
            {copy.common.getDirections}
          </a>
          <p className="site-footer-hours-note">{copy.footer.hoursNote}</p>
        </div>

        <div className="site-footer-col">
          <h3 className="site-footer-col-title">{copy.footer.contactTitle}</h3>
          <ul className="site-footer-contact">
            {SITE_PHONES.map((phone) => (
              <li key={phone}>
                <a href={telHref(phone)}>
                  <Phone aria-hidden="true" size={16} />
                  <span>{phone}</span>
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${SITE_EMAILS.contact}`}>
                <Mail aria-hidden="true" size={16} />
                <span>{SITE_EMAILS.contact}</span>
              </a>
            </li>
          </ul>
          <p className="site-footer-social">
            <span className="site-footer-col-title">{copy.footer.socialTitle}</span>
            <a href={SITE_SOCIAL.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram {SITE_SOCIAL.instagram}
            </a>
            <span>Facebook {SITE_SOCIAL.facebook}</span>
          </p>
        </div>
      </div>

      <div className="site-container site-footer-legal">
        <p>
          {copy.footer.ifuLabel} {SITE_FISCAL.ifu} · {copy.footer.rccmLabel} {SITE_FISCAL.rccm}
        </p>
        <p>
          © {year} CARZONE SARL. {copy.footer.rightsReserved}
        </p>
      </div>
    </footer>
  );
}
