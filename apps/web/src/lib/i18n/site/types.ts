/** Typed dictionary shape for the public showcase ("vitrine"), independent of the internal app's `Messages`. */

export interface SitePageMeta {
  title: string;
  description: string;
}

export interface SiteCopy {
  meta: {
    home: SitePageMeta;
    vehicules: SitePageMeta;
    surMesure: SitePageMeta;
    services: SitePageMeta;
    recharge: SitePageMeta;
    equipe: SitePageMeta;
    contact: SitePageMeta;
  };

  nav: {
    home: string;
    vehicules: string;
    surMesure: string;
    services: string;
    recharge: string;
    equipe: string;
    contact: string;
    ariaLabel: string;
    openMenu: string;
    closeMenu: string;
    languageLabel: string;
    proSpace: string;
  };

  common: {
    skipToContent: string;
    whatsapp: string;
    callUs: string;
    emailUs: string;
    viewVehicles: string;
    contactUs: string;
    discoverMore: string;
    getDirections: string;
  };

  footer: {
    tagline: string;
    addressTitle: string;
    contactTitle: string;
    hoursTitle: string;
    hoursNote: string;
    navTitle: string;
    legalTitle: string;
    ifuLabel: string;
    rccmLabel: string;
    rightsReserved: string;
    socialTitle: string;
  };

  home: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
      imageAlt: string;
    };
    stats: Array<{ value: string; label: string }>;
    pillars: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string; href: string; linkLabel: string }>;
    };
    vehicles: {
      eyebrow: string;
      title: string;
      subtitle: string;
      emptyMessage: string;
      viewAllCta: string;
      priceOnRequest: string;
      viewDetails: string;
      newBadge: string;
      comingSoonBadge: string;
    };
    team: {
      eyebrow: string;
      title: string;
      description: string;
      cta: string;
    };
    faq: {
      title: string;
      items: Array<{ question: string; answer: string }>;
    };
    finalCta: {
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
    };
  };
}
