import type { SiteCopy } from "./types";

export const en: SiteCopy = {
  meta: {
    home: {
      title: "CARZONE SARL | Multi-brand car dealership in Cotonou",
      description:
        "Changan, Jetour, BYD, Geely, BAIC, Forthing and Toyota showroom in Cotonou. New vehicles, after-sales workshop and EV charging solutions.",
    },
    vehicules: {
      title: "New vehicles in stock | CARZONE SARL",
      description:
        "Browse the new vehicles available at our Cotonou showroom: SUVs, sedans, pickups and electric vehicles, all brands.",
    },
    surMesure: {
      title: "Custom orders and import | CARZONE SARL",
      description:
        "Configure your vehicle and order it directly from the factory with CARZONE SARL, from order to delivery in Benin.",
    },
    services: {
      title: "After-sales workshop and maintenance | CARZONE SARL",
      description:
        "Scheduled maintenance, diagnostics and genuine parts for your vehicle in Cotonou, by the CARZONE workshop.",
    },
    recharge: {
      title: "EV charging solutions | CARZONE SARL",
      description:
        "Residential and business charging stations, installation and support for your electric vehicles.",
    },
    equipe: {
      title: "Our team | CARZONE SARL",
      description:
        "Meet the CARZONE SARL teams: management, showroom, after-sales workshop, charging and energy, imports and administration.",
    },
    contact: {
      title: "Contact and showroom access | CARZONE SARL",
      description:
        "Address, phone numbers and directions to the CARZONE SARL showroom in Cotonou, Zone Maro-Militaire, Gbèdomidji district.",
    },
  },

  nav: {
    home: "Home",
    vehicules: "Vehicles",
    surMesure: "Custom order",
    services: "Services",
    recharge: "Charging",
    equipe: "Team",
    contact: "Contact",
    ariaLabel: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    languageLabel: "Language",
    proSpace: "Pro access",
  },

  common: {
    skipToContent: "Skip to main content",
    whatsapp: "WhatsApp",
    callUs: "Call us",
    emailUs: "Send an email",
    viewVehicles: "View vehicles",
    contactUs: "Contact us",
    discoverMore: "Learn more",
    getDirections: "Get directions",
  },

  footer: {
    tagline:
      "Multi-brand car dealership in Cotonou: showroom, after-sales workshop and EV charging solutions.",
    addressTitle: "Showroom",
    contactTitle: "Contact",
    hoursTitle: "Opening hours",
    hoursNote: "Opening hours to be confirmed. Please contact us before visiting.",
    navTitle: "Navigation",
    legalTitle: "Legal information",
    ifuLabel: "Tax ID (IFU)",
    rccmLabel: "Trade register (RCCM)",
    rightsReserved: "All rights reserved.",
    socialTitle: "Social media",
  },

  home: {
    hero: {
      eyebrow: "Multi-brand dealership in Cotonou",
      title: "Your next vehicle starts at CARZONE",
      subtitle:
        "A new-vehicle showroom, an after-sales workshop and EV charging solutions, all in one place in Cotonou.",
      primaryCta: "View vehicles",
      secondaryCta: "Contact us",
      imageAlt: "Vehicle on display at the CARZONE SARL showroom",
    },
    stats: [
      { value: "9", label: "brands on display in showroom" },
      { value: "0", label: "vehicles available in stock" },
      { value: "3", label: "areas of expertise: showroom, workshop, charging" },
    ],
    pillars: {
      eyebrow: "What we do",
      title: "Three areas of expertise, one address",
      subtitle:
        "Showroom, workshop and EV charging, brought together to support your vehicle from day one through routine maintenance.",
      items: [
        {
          title: "New vehicle showroom",
          description:
            "Changan, Jetour, BYD, Geely, BAIC, Forthing, Chery and Toyota on display in Cotonou, with dedicated sales support.",
          href: "/vehicules",
          linkLabel: "Explore the showroom",
        },
        {
          title: "Custom factory order",
          description:
            "Configure the vehicle you want and order it directly from the factory, with full support through delivery in Benin.",
          href: "/sur-mesure",
          linkLabel: "Configure a vehicle",
        },
        {
          title: "After-sales workshop",
          description:
            "Scheduled maintenance, diagnostics and genuine parts to keep your vehicle running at its best.",
          href: "/nos-services",
          linkLabel: "View workshop services",
        },
        {
          title: "EV charging",
          description:
            "Residential and business charging stations, installation and support for your electric vehicles.",
          href: "/recharge",
          linkLabel: "Explore charging solutions",
        },
      ],
    },
    vehicles: {
      eyebrow: "Showroom",
      title: "Featured vehicles",
      subtitle: "A selection of new vehicles currently on display in showroom.",
      emptyMessage:
        "New vehicles are arriving in showroom soon. Contact us to check current availability.",
      viewAllCta: "View all vehicles",
      priceOnRequest: "Price on request",
      viewDetails: "View vehicle",
      newBadge: "New",
      comingSoonBadge: "Coming soon",
    },
    team: {
      eyebrow: "The CARZONE team",
      title: "Dedicated teams at every step",
      description:
        "Management, showroom, after-sales workshop, charging and energy, imports and administration: a team organized by area of expertise, supporting you from choosing a vehicle to servicing it.",
      cta: "Meet the team",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          question: "Can I order a vehicle that is not yet in stock?",
          answer:
            "Yes. CARZONE SARL offers custom factory orders: you choose the model and configuration, and we handle the order and import to Benin.",
        },
        {
          question: "Is the after-sales workshop only for vehicles bought at CARZONE?",
          answer:
            "No. The CARZONE SARL workshop services and diagnoses vehicles of all brands, not only those bought in showroom.",
        },
        {
          question: "Do you install EV charging stations?",
          answer:
            "Yes, CARZONE SARL supports the installation of EV charging solutions for individuals and businesses.",
        },
      ],
    },
    finalCta: {
      title: "A question, or a vehicle project in mind?",
      subtitle: "Our showroom team is available by phone, email or WhatsApp.",
      primaryCta: "Contact CARZONE",
      secondaryCta: "Message us on WhatsApp",
    },
  },
};
