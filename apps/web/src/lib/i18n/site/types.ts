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
    slideshow: {
      eyebrow: string;
      ariaLabel: string;
      prevLabel: string;
      nextLabel: string;
      goToSlideLabel: string;
      viewVehicleCta: string;
      viewShowroomCta: string;
      priceOnRequest: string;
      emptyTitle: string;
      emptySubtitle: string;
      emptyCta: string;
    };
    intro: {
      eyebrow: string;
      title: string;
      subtitle: string;
      brandsLabel: string;
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

  vehicules: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    filters: {
      searchLabel: string;
      searchPlaceholder: string;
      brandLabel: string;
      energyLabel: string;
      typeLabel: string;
      statusLabel: string;
      priceLabel: string;
      allOption: string;
      priceUnder20: string;
      price20to30: string;
      price30to50: string;
      priceOver50: string;
      sortLabel: string;
      sortRecent: string;
      sortPriceAsc: string;
      sortPriceDesc: string;
      resetLabel: string;
      toggleLabel: string;
      toggleActiveLabel: string;
    };
    resultsCountOne: string;
    resultsCountOther: string;
    emptyTitle: string;
    emptyMessage: string;
    statusLabels: Record<string, string>;
    energyLabels: Record<string, string>;
    typeLabels: Record<string, string>;
    card: {
      priceOnRequest: string;
      viewDetails: string;
    };
    modal: {
      closeLabel: string;
      galleryMainLabel: string;
      galleryExteriorLabel: string;
      galleryInteriorLabel: string;
      gallerySeatsLabel: string;
      galleryRearLabel: string;
      specsTitle: string;
      brandLabel: string;
      modelLabel: string;
      variantLabel: string;
      yearLabel: string;
      energyLabel: string;
      typeLabel: string;
      transmissionLabel: string;
      colorLabel: string;
      mileageLabel: string;
      mileageUnit: string;
      statusLabel: string;
      whatsappCta: string;
      whatsappMessageTemplate: string;
      contactCta: string;
    };
  };

  surMesure: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
    };
    intro: {
      eyebrow: string;
      title: string;
      description: string;
      imageAlt: string;
    };
    steps: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string }>;
    };
    whyUs: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string }>;
    };
    included: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: string[];
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

  services: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
    };
    offerings: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string }>;
    };
    warranty: {
      eyebrow: string;
      title: string;
      description: string;
      imageAlt: string;
    };
    appointment: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string }>;
    };
    fleet: {
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

  recharge: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
    };
    solutions: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string }>;
    };
    process: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string }>;
    };
    support: {
      eyebrow: string;
      title: string;
      description: string;
      imageAlt: string;
    };
    terminal: {
      eyebrow: string;
      title: string;
      description: string;
      imageAlt: string;
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

  equipe: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    intro: {
      eyebrow: string;
      title: string;
      description: string;
    };
    departments: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string; responsibilities: string[] }>;
    };
    leadership: {
      eyebrow: string;
      title: string;
      message: string;
      signature: string;
      availability: string;
    };
    approach: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string }>;
    };
    finalCta: {
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
    };
  };

  contact: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    channels: {
      eyebrow: string;
      title: string;
      subtitle: string;
      phoneTitle: string;
      phoneNote: string;
      emailTitle: string;
      emailNote: string;
      whatsappTitle: string;
      whatsappNote: string;
      whatsappCta: string;
    };
    showroom: {
      eyebrow: string;
      title: string;
      subtitle: string;
      addressTitle: string;
      addressLines: string[];
      hoursTitle: string;
      hoursNote: string;
      directionsCta: string;
    };
    form: {
      title: string;
      subtitle: string;
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      subjectLabel: string;
      subjectPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      submitLabel: string;
      note: string;
      whatsappCta: string;
    };
    finalCta: {
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
    };
  };
}

export type ContactCopy = SiteCopy['contact'];

