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

  quote: {
    ctaLabel: "Quote by e-mail",
    whatsappCtaLabel: "Quote in 1 click",
    dialogTitle: "Quote by e-mail",
    dialogSubtitleVehicle: "For the {vehicle}.",
    dialogSubtitleGeneric:
      "Leave your details and our sales team will get back to you with an offer.",
    nameLabel: "Full name",
    namePlaceholder: "Your name",
    phoneLabel: "Phone",
    phonePlaceholder: "+229 ...",
    emailLabel: "E-mail address",
    emailPlaceholder: "you@example.com",
    contactHint: "Give at least a phone number or an e-mail address.",
    messageLabel: "Your message",
    messageDefaultGeneric: "I would like to receive a quote for a CARZONE vehicle.",
    messageDefaultVehicleTemplate: "I would like to receive a quote for the {vehicle}.",
    privacyNote:
      "Your details are used only by the CARZONE SARL sales team to contact you about this request.",
    consentLabel: "I agree that my contact details may be used by CARZONE SARL to contact me about this request.",
    consentRequired: "Please accept the use of your contact details to send your request.",
    privacyLinkLabel: "Privacy policy",
    submitLabel: "Send my request",
    submittingLabel: "Sending...",
    successTitle: "Request received",
    successMessage: "Thank you, your request has been passed on. Our sales team will contact you shortly.",
    errorValidation: "Please enter your name and at least a phone number or an e-mail address.",
    errorGeneric: "Something went wrong. You can try again or message us directly on WhatsApp.",
    closeLabel: "Close",
    whatsappSecondaryCta: "Also send on WhatsApp",
    whatsapp: {
      introGeneric: "Hello CARZONE SARL, I would like to request a quote.",
      introWithVehicleTemplate: "Hello CARZONE SARL, I would like a quote for the {vehicle}.",
      detailsLabel: "Details",
      linkLabel: "Link",
      contactNameLabel: "Name",
      contactPhoneLabel: "Phone",
      contactEmailLabel: "E-mail",
    },
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
    privacyLabel: "Privacy policy",
    legalNoticeLabel: "Legal notice",
    rightsReserved: "All rights reserved.",
    socialTitle: "Social media",
  },

  home: {
    slideshow: {
      eyebrow: "New arrivals in showroom",
      ariaLabel: "Showroom vehicles slideshow",
      prevLabel: "Previous vehicle",
      nextLabel: "Next vehicle",
      goToSlideLabel: "Vehicle {current} of {total}",
      viewVehicleCta: "Discover this vehicle",
      viewShowroomCta: "View the full showroom",
      priceOnRequest: "Price on request",
      pauseLabel: "Pause the slideshow",
      playLabel: "Resume the slideshow",
      emptyTitle: "Your next vehicle starts at CARZONE",
      emptySubtitle:
        "A new-vehicle showroom, an after-sales workshop and EV charging solutions, all in one place in Cotonou.",
      emptyCta: "View vehicles",
    },
    intro: {
      eyebrow: "Multi-brand dealership in Cotonou",
      title: "One showroom, one workshop, one team",
      subtitle:
        "CARZONE SARL brings together a new-vehicle showroom, an after-sales workshop and EV charging solutions in Cotonou, with dedicated sales support from the choice of vehicle through to maintenance.",
      brandsLabel: "Brands on display",
    },
    stats: [
      { value: "9", label: "brands on display in showroom" },
      { value: "0", label: "vehicles available in stock" },
      { value: "3", label: "areas of expertise: showroom, workshop, charging" },
    ],
    promise: {
      bullets: [
        "Quote on request, with no commitment",
        "Factory orders and imports tracked by our team",
        "Delivery, after-sales service and charging in one place",
      ],
    },
    process: {
      eyebrow: "How it works",
      title: "From your choice to your keys, in 4 steps",
      subtitle: "A guided process with no grey areas.",
      steps: [
        { title: "Choose your vehicle", text: "Browse the showroom or the catalogue, online or on site." },
        { title: "Request your quote", text: "By WhatsApp or e-mail, in just a few clicks." },
        { title: "We order and track the import", text: "Factory order, shipping and tracking all the way to Benin." },
        { title: "Delivery, servicing and charging", text: "Handover, maintenance and electric charging solutions." },
      ],
    },
    trustPoints: {
      eyebrow: "Our commitments",
      title: "A real dealership, not a virtual promise",
      items: [
        "Physical showroom in Cotonou",
        "Multibrand after-sales workshop open to all",
        "9 brands available",
        "A personalised quote for every vehicle",
        "Support before and after delivery",
      ],
    },
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
        {
          question: "How do I request a quote?",
          answer:
            "By WhatsApp, e-mail or via the website form. Tell us which model interests you: our team replies with a personalised proposal, with no commitment.",
        },
        {
          question: "Are prices displayed on the website?",
          answer:
            "No. Every quote depends on the configuration, options and availability. Request your quote to receive an exact price.",
        },
        {
          question: "How does vehicle import work?",
          answer:
            "We handle the factory order, shipping and tracking all the way to Benin. You are kept informed at every stage.",
        },
        {
          question: "Can I visit the showroom before ordering?",
          answer:
            "Yes. Our showroom is in Cotonou, Zone Maro-Militaire, Quartier Gbèdomidji. Please contact us before your visit so an adviser can welcome you.",
        },
        {
          question: "How can I find out which warranty applies to my vehicle?",
          answer:
            "The applicable warranty and servicing conditions are set out in your quote and at delivery. Contact our team to discuss them.",
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

  vehicules: {
    hero: {
      eyebrow: "Showroom catalogue",
      title: "Vehicles available at CARZONE",
      subtitle:
        "Browse our full catalogue: new SUVs, pick-ups and sedans, imported and tracked all the way to Benin.",
    },
    filters: {
      searchLabel: "Search",
      searchPlaceholder: "Brand, model or engine",
      brandLabel: "Brand",
      energyLabel: "Fuel type",
      typeLabel: "Vehicle type",
      statusLabel: "Availability",
      priceLabel: "Budget",
      allOption: "All",
      priceUnder20: "Under 20,000,000 FCFA",
      price20to30: "20,000,000 to 30,000,000 FCFA",
      price30to50: "30,000,000 to 50,000,000 FCFA",
      priceOver50: "Over 50,000,000 FCFA",
      sortLabel: "Sort by",
      sortRecent: "Most recent year",
      sortPriceAsc: "Price: low to high",
      sortPriceDesc: "Price: high to low",
      resetLabel: "Reset filters",
      toggleLabel: "Filters",
      toggleActiveLabel: "Filters ({count})",
    },
    resultsCountOne: "{count} vehicle found",
    resultsCountOther: "{count} vehicles found",
    emptyTitle: "No vehicle matches your search",
    emptyMessage: "Adjust your filters or contact our showroom team: new vehicles arrive regularly.",
    statusLabels: {
      EN_STOCK: "In stock",
      EN_MAGASIN: "Available in showroom",
      AU_PORT: "Arrived at port",
      EN_TRANSIT: "In sea transit",
      EN_PRODUCTION: "In factory production",
      COMMANDE: "Ordered",
      VENDU: "Sold",
    },
    energyLabels: {
      ESSENCE: "Petrol",
      DIESEL: "Diesel",
      HYBRIDE: "Hybrid",
      PHEV: "Plug-in hybrid",
      ELECTRIQUE: "Electric",
    },
    typeLabels: {
      SUV: "SUV",
      PICKUP: "Pick-up",
      BERLINE: "Sedan",
      VAN: "Van",
    },
    card: {
      priceOnRequest: "Price on request",
      viewDetails: "View vehicle",
    },
    modal: {
      closeLabel: "Close",
      galleryMainLabel: "Main view",
      galleryExteriorLabel: "Exterior",
      galleryInteriorLabel: "Interior",
      gallerySeatsLabel: "Seats",
      galleryRearLabel: "Rear",
      specsTitle: "Specifications",
      brandLabel: "Brand",
      modelLabel: "Model",
      variantLabel: "Variant",
      yearLabel: "Year",
      energyLabel: "Fuel type",
      typeLabel: "Type",
      transmissionLabel: "Transmission",
      colorLabel: "Color",
      mileageLabel: "Mileage",
      mileageUnit: "km",
      statusLabel: "Availability",
      whatsappCta: "Contact us on WhatsApp",
      whatsappMessageTemplate:
        "Hello CARZONE, I am interested in the {vehicle}. Could you send me more information?",
      contactCta: "View contact page",
    },
  },

  surMesure: {
    hero: {
      eyebrow: "Factory order and import",
      title: "Your custom vehicle, from order to delivery in Cotonou",
      subtitle:
        "Choose the model and configuration that suits you: CARZONE SARL handles the factory order, transit and delivery to Benin.",
      primaryCta: "Start my project",
      secondaryCta: "Contact us",
    },
    intro: {
      eyebrow: "Direct factory order",
      title: "The vehicle you have in mind, imported all the way to Cotonou",
      description:
        "Whether you have already chosen a specific model or are still weighing a few configurations, our sales team helps you define the vehicle that fits your needs before placing the factory order.",
      imageAlt: "Vehicle from the CARZONE SARL network available as a custom order",
    },
    steps: {
      eyebrow: "The journey",
      title: "Six steps, one point of contact",
      subtitle: "From choosing your model to receiving your keys, our team guides you through every step.",
      items: [
        {
          title: "Model selection",
          description: "You select the brand, model and trim from our network of partner manufacturers.",
        },
        {
          title: "Configuration",
          description: "Engine, color, options and equipment level are defined together with our sales team.",
        },
        {
          title: "Proforma invoice",
          description:
            "A detailed proforma invoice is prepared, covering the vehicle, transport and import costs.",
        },
        {
          title: "Factory order",
          description: "Once approved, the order is submitted to the chosen factory or supplier.",
        },
        {
          title: "Transit and customs clearance",
          description: "CARZONE SARL tracks the sea shipment and manages customs clearance in Benin.",
        },
        {
          title: "Receipt and delivery",
          description: "The vehicle is received, inspected, then delivered or handed over at our Cotonou showroom.",
        },
      ],
    },
    whyUs: {
      eyebrow: "Why CARZONE",
      title: "End-to-end support",
      subtitle: "Importing a custom vehicle requires careful follow-up: we take care of it.",
      items: [
        {
          title: "A single point of contact",
          description: "Your CARZONE sales advisor follows your file from order to delivery.",
        },
        {
          title: "Order tracking",
          description: "You are kept informed at every stage: production, shipping, port arrival, customs clearance.",
        },
        {
          title: "Document compliance",
          description: "Customs and registration documents are prepared carefully for the Benin market.",
        },
        {
          title: "Delivery in Cotonou",
          description: "Receive and collect your vehicle directly at our showroom, Zone Maro-Militaire.",
        },
      ],
    },
    included: {
      eyebrow: "What is included",
      title: "What our support covers",
      subtitle: "Our team manages the entire import process, so the only decision left to you is the vehicle itself.",
      items: [
        "Vehicle search and configuration with partner brands",
        "Preparation of a detailed proforma invoice",
        "Submission and follow-up of the factory order",
        "Tracking of sea transport to the port of arrival",
        "Support with customs clearance formalities in Benin",
        "Receipt and handover of the vehicle in Cotonou",
      ],
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          question: "How long does a custom order take?",
          answer:
            "The timeline depends on the model chosen, the manufacturer and sea transit. Our team provides a precise estimate once the proforma invoice is prepared.",
        },
        {
          question: "Can I track my order remotely?",
          answer:
            "Yes. Your CARZONE sales advisor keeps you informed at every stage, from the factory order to delivery in Benin.",
        },
        {
          question: "Is the proforma invoice binding?",
          answer:
            "The proforma invoice details the vehicle, transport and import costs before any final order. It is the basis for your decision.",
        },
      ],
    },
    finalCta: {
      title: "Ready to configure your vehicle?",
      subtitle: "Tell us about the model you are interested in: we will support you through to delivery in Benin.",
      primaryCta: "Contact us",
      secondaryCta: "Message us on WhatsApp",
    },
  },

  services: {
    hero: {
      eyebrow: "After-sales workshop and maintenance",
      title: "A CARZONE workshop for your vehicle's maintenance in Cotonou",
      subtitle:
        "Scheduled maintenance, electronic diagnostics and genuine parts: our after-sales workshop supports multi-brand vehicles throughout their life.",
      primaryCta: "Book an appointment",
      secondaryCta: "Message us on WhatsApp",
    },
    offerings: {
      eyebrow: "Our services",
      title: "What our after-sales workshop offers",
      subtitle: "A technical team equipped to service and repair vehicles of every brand.",
      items: [
        {
          title: "Scheduled maintenance",
          description:
            "Oil changes, filter replacement, and checks on fluid levels and wear parts, following the vehicle's maintenance schedule.",
        },
        {
          title: "Electronic diagnostics",
          description:
            "Reading and interpreting onboard control units to precisely identify the source of an issue before any work begins.",
        },
        {
          title: "Mechanical repair and light bodywork",
          description:
            "Work on braking, suspension and steering systems, as well as light bodywork repairs.",
        },
        {
          title: "Genuine parts",
          description:
            "Fitting genuine or manufacturer-approved equivalent parts: filters, brake pads, suspension and lighting components.",
        },
      ],
    },
    warranty: {
      eyebrow: "Manufacturer warranty",
      title: "Service work that respects your manufacturer warranty",
      description:
        "Our technicians follow each manufacturer's guidelines so that your vehicle's manufacturer warranty remains valid wherever it still applies.",
      imageAlt: "Vehicle from the CARZONE SARL network serviced at the workshop",
    },
    appointment: {
      eyebrow: "Booking an appointment",
      title: "How to plan your workshop visit",
      subtitle: "A simple process to schedule your vehicle's maintenance or repair.",
      items: [
        {
          title: "Contact",
          description: "Contact our workshop by phone, WhatsApp or email to describe the maintenance or repair needed.",
        },
        {
          title: "Appointment scheduling",
          description: "We agree on a date to drop off your vehicle at the CARZONE workshop, Zone Maro-Militaire, Cotonou.",
        },
        {
          title: "Diagnostics and quote",
          description: "After diagnostics, a quote is presented before any work is carried out on the vehicle.",
        },
        {
          title: "Service and handover",
          description: "Once the quote is approved, our technicians carry out the work, then the vehicle is returned to you.",
        },
      ],
    },
    fleet: {
      eyebrow: "Fleets and businesses",
      title: "Support for professional vehicle fleets",
      description:
        "Businesses with a vehicle fleet can entrust its maintenance to the CARZONE SARL workshop, which services vehicles of every brand.",
      cta: "Contact us about your fleet",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          question: "Do I need to have bought my vehicle at CARZONE to use the workshop?",
          answer:
            "No. The CARZONE SARL workshop services and repairs vehicles of every brand, whether or not they were purchased with us.",
        },
        {
          question: "Do you provide a quote before any work?",
          answer:
            "Yes, a diagnostic and a quote are presented before any repair, so that you approve the work beforehand.",
        },
        {
          question: "Can the workshop service electric or hybrid vehicles?",
          answer:
            "Our technical team is equipped for electronic diagnostics on multi-brand vehicles, including the hybrid and electric models distributed by CARZONE.",
        },
      ],
    },
    finalCta: {
      title: "Need maintenance or a repair?",
      subtitle: "Contact our workshop to schedule your appointment.",
      primaryCta: "Contact us",
      secondaryCta: "Message us on WhatsApp",
    },
  },

  recharge: {
    hero: {
      eyebrow: "Electric mobility",
      title: "Charging solutions for electric and hybrid vehicles",
      subtitle:
        "CARZONE SARL supports individuals and businesses in installing charging stations, and operates a charging terminal at its Cotonou showroom.",
      primaryCta: "Request a study",
      secondaryCta: "Message us on WhatsApp",
    },
    solutions: {
      eyebrow: "Our solutions",
      title: "Charging stations suited to every use",
      subtitle:
        "Residential or professional, we help you choose the charging solution that fits your vehicle and your electrical setup.",
      items: [
        {
          title: "Residential charging stations",
          description:
            "Installation of a home charging station, suited to your electrical setup and your electric or plug-in hybrid vehicle.",
        },
        {
          title: "Business charging stations",
          description:
            "Charging solutions for businesses, vehicle fleets and professional parking areas, with support throughout installation.",
        },
        {
          title: "Commissioning and support",
          description:
            "Commissioning of the installed charging station and guidance on getting started, for worry-free everyday use.",
        },
      ],
    },
    process: {
      eyebrow: "Installation",
      title: "The steps of a charging station installation",
      subtitle: "From the initial request to commissioning, support at every step.",
      items: [
        {
          title: "Assessing your needs",
          description: "We discuss your electric or hybrid vehicle and your existing electrical setup.",
        },
        {
          title: "Technical proposal",
          description: "A suitable charging station solution is proposed based on your usage and your installation.",
        },
        {
          title: "Installation",
          description: "The charging station is installed by qualified technicians, in line with applicable electrical standards.",
        },
        {
          title: "Commissioning",
          description: "The charging station is commissioned and tested before the installation is handed over to you.",
        },
      ],
    },
    support: {
      eyebrow: "Support",
      title: "Support that continues beyond installation",
      description:
        "Our team remains available after installation to answer your questions about using your charging station.",
      imageAlt: "Electric vehicle from the CARZONE SARL network",
    },
    terminal: {
      eyebrow: "Cotonou showroom",
      title: "A charging terminal at our showroom",
      description:
        "CARZONE SARL operates a charging terminal at its Zone Maro-Militaire showroom, usable by electric and plug-in hybrid vehicles.",
      imageAlt: "Electric vehicle at the CARZONE SARL showroom",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          question: "Who can have a charging station installed with CARZONE?",
          answer:
            "Individuals and businesses with an electric or plug-in hybrid vehicle can ask CARZONE SARL to install a charging station.",
        },
        {
          question: "Is the showroom terminal accessible without an appointment?",
          answer: "Contact our team to find out how to access the showroom charging terminal.",
        },
        {
          question: "Do you offer support after installation?",
          answer: "Yes, our team remains available after your charging station is commissioned to answer your questions.",
        },
      ],
    },
    finalCta: {
      title: "Have a charging station project in mind?",
      subtitle: "Contact our team for a study suited to your electric or hybrid vehicle.",
      primaryCta: "Request a study",
      secondaryCta: "Message us on WhatsApp",
    },
  },

  equipe: {
    hero: {
      eyebrow: "Our team",
      title: "The people behind CARZONE",
      subtitle:
        "Management, showroom, after-sales workshop, charging, imports and administration: a team organised by department to support you at every stage of your vehicle project.",
    },
    intro: {
      eyebrow: "One team, several trades",
      title: "The same standard, from first contact to servicing",
      description:
        "At CARZONE SARL, every file is handled by professionals trained in their field. The sales adviser who welcomes you in the showroom works alongside the logistics, workshop and charging teams so your vehicle is ready, properly documented and supported over time.",
    },
    departments: {
      eyebrow: "Our departments",
      title: "Six complementary departments",
      subtitle: "A simple structure designed to cut out middlemen and give you a clear point of contact.",
      items: [
        {
          title: "General management",
          description: "Driving network growth and service quality.",
          responsibilities: [
            "Business strategy and manufacturer partnerships",
            "Service quality and customer satisfaction",
            "Network development in Cotonou and Benin",
          ],
        },
        {
          title: "Showroom and sales",
          description: "Welcoming you, advising you and selling your new vehicles.",
          responsibilities: [
            "Showroom welcome and test drives",
            "Model and configuration advice",
            "Quotation and delivery follow-up",
          ],
        },
        {
          title: "After-sales workshop",
          description: "Servicing, diagnostics and technical work.",
          responsibilities: [
            "Scheduled servicing and electronic diagnostics",
            "Mechanical repairs and light bodywork",
            "Genuine parts and manufacturer warranty follow-up",
          ],
        },
        {
          title: "Charging and energy",
          description: "Charging solutions for private customers and businesses.",
          responsibilities: [
            "Charging needs assessment",
            "Charger installation and commissioning",
            "After-installation support",
          ],
        },
        {
          title: "Imports and logistics",
          description: "Factory orders, shipping and customs clearance.",
          responsibilities: [
            "Factory orders and production tracking",
            "Sea freight and transit",
            "Customs clearance and vehicle reception",
          ],
        },
        {
          title: "Administration and finance",
          description: "Customer files, invoicing and compliance.",
          responsibilities: [
            "File and document management",
            "Invoicing and payment follow-up",
            "Tax and administrative compliance",
          ],
        },
      ],
    },
    leadership: {
      eyebrow: "A word from management",
      title: "A local dealership with high service standards",
      message:
        "We built CARZONE SARL around a simple idea: a customer should know exactly where their file stands, who is handling it and what happens next. That discipline shapes our showroom, our workshop and our logistics teams every day. You always speak to someone who can answer your question, not to an anonymous call centre.",
      signature: "The CARZONE SARL management team",
      availability:
        "Would you like to meet our teams? The showroom in the Maro-Militaire area of Cotonou welcomes you by appointment for a face-to-face discussion.",
    },
    approach: {
      eyebrow: "How we work",
      title: "Three principles applied every day",
      subtitle: "Commitments that apply to every customer and every vehicle.",
      items: [
        {
          title: "A named contact",
          description:
            "Your adviser follows your file from the first visit to handover, then stays your contact for workshop matters.",
        },
        {
          title: "Verifiable information",
          description:
            "Proforma quotes, customs documents and technical sheets: you receive the documents you need to decide with confidence.",
        },
        {
          title: "After-sales support",
          description:
            "Scheduled servicing, genuine parts and charging solutions: we remain available after delivery.",
        },
      ],
    },
    finalCta: {
      title: "Meet our team",
      subtitle: "Book an appointment at the showroom or contact us directly.",
      primaryCta: "Contact us",
      secondaryCta: "Message us on WhatsApp",
    },
  },

  contact: {
    hero: {
      eyebrow: "Contact and directions",
      title: "Let's talk about your next vehicle",
      subtitle:
        "Our team answers by phone, e-mail or WhatsApp. The showroom welcomes you in the Maro-Militaire area of Cotonou.",
    },
    channels: {
      eyebrow: "Reach us",
      title: "Three simple ways to get in touch",
      subtitle: "Pick the channel that suits you: we reply during opening hours.",
      phoneTitle: "Phone",
      phoneNote: "Calls and call-backs during opening hours.",
      emailTitle: "E-mail",
      emailNote: "For detailed requests, quotations or documents.",
      whatsappTitle: "WhatsApp",
      whatsappNote: "For a quick exchange about vehicles or the workshop.",
      whatsappCta: "Open WhatsApp",
    },
    showroom: {
      eyebrow: "The showroom",
      title: "Visit us in Cotonou",
      subtitle: "A showroom in the Maro-Militaire area, easy to reach by car, with a dedicated reception area.",
      addressTitle: "Address",
      addressLines: ["Maro-Militaire area", "Gbèdomidji district", "Cotonou, Benin"],
      hoursTitle: "Opening hours",
      hoursNote:
        "Opening hours to be confirmed. Contact us before your visit so the right person is available to welcome you.",
      directionsCta: "Open directions",
    },
    form: {
      title: "Send a message",
      subtitle: "Tell us what you need: a vehicle, servicing, charging or a custom import.",
      nameLabel: "Full name",
      namePlaceholder: "Your name",
      emailLabel: "E-mail address",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone",
      phonePlaceholder: "+229 ...",
      subjectLabel: "Subject",
      subjectPlaceholder: "Subject of your message",
      messageLabel: "Message",
      messagePlaceholder: "Your request, your vehicle, your project...",
      submitLabel: "Open in my mail app",
      note:
        "This form prepares an e-mail in your mail application. You stay in control before sending and our contact addresses are filled in automatically.",
      whatsappCta: "Use WhatsApp instead",
    },
    finalCta: {
      title: "Still deciding?",
      subtitle: "Drop by the showroom or ask for a call-back: we will take the time to answer your questions.",
      primaryCta: "Request a contact",
      secondaryCta: "Browse vehicles",
    },
  },
};
