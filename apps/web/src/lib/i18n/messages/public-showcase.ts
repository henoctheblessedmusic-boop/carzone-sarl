import type { Locale } from "@/lib/prefs";

export type PublicShowcaseCopy = {
  metaTitle: string;
  metaDescription: string;
  topBar: {
    address: string;
    hours: string;
    dashboardLabel: (name: string) => string;
    loginLabel: string;
  };
  nav: {
    stock: string;
    factoryOrder: string;
    workshop: string;
    charging: string;
    contact: string;
  };
  header: {
    quoteExpress: string;
    whatsapp: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    searchPlaceholder: string;
    quoteCta: string;
    availabilityLabel: string;
    brandLabel: string;
    allBrands: string;
  };
  categories: {
    all: string;
    vedettes: string;
    suv: string;
    pickup: string;
    berline: string;
    electrique: string;
  };
  availability: {
    all: string;
    showroom: string;
    transit: string;
    commande: string;
  };
  showroom: {
    badge: string;
    title: string;
    subtitle: string;
    modelsAvailable: string;
    emptyTitle: string;
    emptyText: string;
    resetFilters: string;
  };
  card: {
    newBadge: string;
    flagshipBadge: string;
    inStockBadge: string;
    transitBadge: (eta: string | null) => string;
    portBadge: string;
    orderedBadge: string;
    factoryOrderBadge: string;
    galleryHint: string;
    officialPrice: string;
    availability: string;
    priceOnQuote: string;
    etaUpcoming: string;
    deliveryLabel: string;
    deliveryImmediate: string;
    automatic: string;
    manual: string;
    sheetAndPhotos: string;
    reserveBeforeArrival: string;
    blockReservation: string;
    quoteOneClick: string;
    chatWhatsapp: string;
  };
  customOrder: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    paragraph: string;
    feature1Title: string;
    feature1Text: string;
    feature2Title: string;
    feature2Text: string;
    feature3Title: string;
    feature3Text: string;
    cta: string;
    cardTitle: string;
    cardText: string;
    whatsappCta: string;
    orCallSales: string;
    defaultNote: string;
  };
  services: {
    badge: string;
    title: string;
    paragraph: string;
    card1Title: string;
    card1Text: string;
    card2Title: string;
    card2Text: string;
    card3Title: string;
    card3Text: string;
  };
  charging: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    paragraph: string;
    item1: string;
    item2: string;
    item3: string;
    cta: string;
    cardTitle: string;
    cardText: string;
    stationName: string;
    statusOnline: string;
    connectorNote: string;
  };
  contact: {
    badge: string;
    title: string;
    paragraph: string;
    addressLabel: string;
    addressText: string;
    openMaps: string;
    phoneLabel: string;
    emailLabel: string;
    formTitle: string;
    formSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneFieldLabel: string;
    emailFieldLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    successTitle: string;
    successText: string;
    sending: string;
    submit: string;
  };
  footer: {
    description: string;
    brandsTitle: string;
    quickNavTitle: string;
    navStock: string;
    navFactoryOrder: string;
    navWorkshop: string;
    navCharging: string;
    navLogin: string;
    contactTitle: string;
    showroomLine: string;
    phoneLine: string;
    emailLine: string;
    whatsappLine: string;
    copyright: (year: number) => string;
    platformLine: string;
  };
  floatingWhatsapp: {
    title: string;
    text: string;
  };
  detailModal: {
    inStock: string;
    inTransit: string;
    atPort: string;
    ordered: string;
    situationLabel: string;
    statusShowroom: string;
    statusTransit: (eta: string | null) => string;
    statusPort: string;
    statusOrdered: string;
    statusFactoryOrder: string;
    officialPrice: string;
    thumbnailAlt: string;
    engineTitle: string;
    engineLabel: string;
    powerLabel: string;
    torqueLabel: string;
    transmissionLabel: string;
    energyLabel: string;
    dimensionsTitle: string;
    dimensionsLabel: string;
    wheelbaseLabel: string;
    seatsLabel: string;
    seatsSuffix: string;
    doorsLabel: string;
    doorsSuffix: string;
    tankLabel: string;
    comfortTitle: string;
    safetyTitle: string;
    warrantyNote: string;
    pdfSheet: string;
    pdfSheetTitle: string;
    whatsappDirect: string;
    reserveBeforeArrival: string;
    blockReservation: string;
    requestQuote: string;
  };
  quoteModal: {
    headerTransit: string;
    headerShowroom: string;
    headerDefault: string;
    defaultTitle: string;
    successTitleReservation: string;
    successTitleQuote: string;
    successText: string;
    whatsappCta: string;
    close: string;
    transitNoticeLead: string;
    transitNoticeMid: string;
    transitNoticeTail: string;
    showroomNoticeLead: string;
    showroomNoticeTail: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    emailLabel: string;
    emailPlaceholder: string;
    paymentTypeLabel: string;
    paymentCash: string;
    paymentCredit: string;
    paymentFleet: string;
    cityLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    processing: string;
    receiveProforma: string;
    receiveQuote: string;
  };
  whatsapp: {
    transit: (title: string, eta: string | null) => string;
    port: (title: string) => string;
    showroom: (title: string, price: string) => string;
    factoryOrder: (title: string) => string;
    general: string;
  };
  errors: {
    missingContact: string;
    genericSubmit: string;
    connection: string;
  };
};

const fr: PublicShowcaseCopy = {
  metaTitle:
    "CARZONE SARL Bénin, concessionnaire automobile officiel et mobilité électrique à Cotonou",
  metaDescription:
    "Showroom de véhicules neufs multimarques (Changan, Jetour, BYD, Geely, BAIC, Toyota, Dongfeng), cotations immédiates, commandes d'usine sur-mesure, atelier SAV certifié et solutions de recharge VE à Cotonou, Bénin.",
  topBar: {
    address: "Showroom Maro-Militaire, Gbèdomidji, Cotonou",
    hours: "Lun - Ven : 8h00 - 18h30 | Sam : 8h30 - 15h00",
    dashboardLabel: (name) => `Dashboard (${name})`,
    loginLabel: "Espace Collaborateur",
  },
  nav: {
    stock: "Stock & Arrivages",
    factoryOrder: "Commande Usine",
    workshop: "Atelier SAV & Pièces",
    charging: "Bornes & VE",
    contact: "Showroom & Accès",
  },
  header: {
    quoteExpress: "Devis Express",
    whatsapp: "WhatsApp",
  },
  hero: {
    badge: "Concessionnaire officiel multimarques, stock live et arrivages à Cotonou",
    titleStart: "L'Excellence Automobile",
    titleHighlight: "au Cœur de Cotonou",
    searchPlaceholder: "Rechercher par modèle, marque...",
    quoteCta: "Devis Express en 1 Clic",
    availabilityLabel: "Disponibilité :",
    brandLabel: "Marque :",
    allBrands: "Toutes",
  },
  categories: {
    all: "Tous les Véhicules",
    vedettes: "🔥 Nouveautés 2026 & Flashy",
    suv: "SUV & Crossovers",
    pickup: "Pick-up 4x4",
    berline: "Berlines de Luxe",
    electrique: "Électrique & Hybride (VE)",
  },
  availability: {
    all: "Toutes Disponibilités",
    showroom: "🟢 En Stock Showroom",
    transit: "🚢 En Arrivage / Au Port",
    commande: "🏭 Commandes d'Usine",
  },
  showroom: {
    badge: "Ordonnancement Automatique Intelligent",
    title: "Collection Véhicules Neufs & Arrivages Prioritaires",
    subtitle:
      "Les modèles 2026 les plus récents, technologiques et prestigieux sont automatiquement propulsés en avant.",
    modelsAvailable: "modèles disponibles",
    emptyTitle: "Aucun véhicule ne correspond à ces critères",
    emptyText: "Modifiez vos filtres ou effectuez une commande spéciale d'usine.",
    resetFilters: "Réinitialiser les filtres",
  },
  card: {
    newBadge: "NOUVEAUTÉ 2026",
    flagshipBadge: "MODÈLE PHARE",
    inStockBadge: "EN STOCK SHOWROOM",
    transitBadge: (eta) => (eta ? `ARRIVAGE : ${eta}` : "EN TRANSIT"),
    portBadge: "AU PORT (DÉDOUANEMENT)",
    orderedBadge: "COMMANDÉ USINE",
    factoryOrderBadge: "SUR COMMANDE USINE",
    galleryHint: "Galerie 360° & Fiche",
    officialPrice: "Tarif Officiel",
    availability: "Disponibilité",
    priceOnQuote: "Sur cotation usine",
    etaUpcoming: "ARRIVAGE PRÉVU",
    deliveryLabel: "LIVRAISON",
    deliveryImmediate: "Immédiate 24/48h",
    automatic: "Automatique",
    manual: "Manuelle",
    sheetAndPhotos: "Fiche & Photos",
    reserveBeforeArrival: "Réserver avant arrivage",
    blockReservation: "Bloquer réservation",
    quoteOneClick: "Cotation 1 Clic",
    chatWhatsapp: "Échanger sur WhatsApp",
  },
  customOrder: {
    badge: "Exclusivité CARZONE Bénin",
    titleStart: "Commande Personnalisée",
    titleHighlight: "Directe d'Usine",
    paragraph:
      "Vous avez une configuration précise en tête ? CARZONE assure l'importation directe depuis les usines constructeurs (Chine, Dubaï, Europe, Japon).",
    feature1Title: "Choix intégral des finitions :",
    feature1Text:
      "Teintes de carrosserie exclusives, intérieurs cuir Nappa bicolore, toits panoramiques, jantes sur-mesure.",
    feature2Title: "Logistique & Transit maritime sécurisé :",
    feature2Text:
      "Suivi en temps réel de votre conteneur avec traçabilité complète de l'usine jusqu'au Port Autonome de Cotonou.",
    feature3Title: "Livraison Clé en Main :",
    feature3Text:
      "Dédouanement, formalités administratives, immatriculation Bénin et préparation esthétique showroom inclus.",
    cta: "Configurer une Commande Usine",
    cardTitle: "Demande Rapide de Personnalisation",
    cardText:
      "Indiquez le véhicule et vos options souhaitées. Un spécialiste import CARZONE vous contacte sous 2 heures avec le devis usine détaillé.",
    whatsappCta: "Discuter de votre projet sur WhatsApp",
    orCallSales: "ou appelez notre direction des ventes :",
    defaultNote: "Demande de commande personnalisée sur-mesure d'usine",
  },
  services: {
    badge: "Excellence Technique",
    title: "Atelier SAV Certifié & Pièces d'Origine",
    paragraph:
      "Notre engagement ne s'arrête pas à la vente. CARZONE dispose d'un atelier ultra-moderne équipé des dernières valises de diagnostic constructeur.",
    card1Title: "Diagnostic Électronique Haute Précision",
    card1Text:
      "Bancs de test électroniques certifiés multimarques pour la détection et la mise à jour des calculateurs, systèmes hybrides et batteries.",
    card2Title: "Magasin Pièces de Rechange d'Origine",
    card2Text:
      "Stock permanent de pièces d'origine garanties constructeur : filtres, plaquettes de frein, suspensions, optiques et accessoires officiels.",
    card3Title: "Contrats d'Entretien & Suivi Flotte",
    card3Text:
      "Formules sur-mesure pour les entreprises et particuliers : vidange rapide, révision périodique garantie et assistance routière 24/7 au Bénin.",
  },
  charging: {
    badge: "Transition Énergétique & Mobilité Verte",
    titleStart: "Solutions de Recharge",
    titleHighlight: "Véhicules Électriques (VE)",
    paragraph:
      "Pionnier de la mobilité électrique à Cotonou, CARZONE propose une gamme complète de bornes intelligentes AC/DC (7kW à 120kW ultra-rapides) pour résidences, hôtels et entreprises.",
    item1: "Bornes de recharge à domicile (Wallbox 7kW à 22kW)",
    item2: "Superchargeurs DC rapides pour flottes et parkings publics",
    item3: "Installation électrique certifiée par des techniciens habilités",
    cta: "Demander une Étude d'Installation Borne",
    cardTitle: "Le Réseau de Recharge CARZONE à Cotonou",
    cardText:
      "Rechargez votre véhicule 100% électrique ou hybride rechargeable (BYD, Geely Galaxy, etc.) directement au Showroom Carzone en moins de 35 minutes.",
    stationName: "Station Carzone Maro-Militaire",
    statusOnline: "EN LIGNE",
    connectorNote: "Connecteurs Combo CCS2 & Type 2 compatibles avec toutes les marques.",
  },
  contact: {
    badge: "Nous Rendre Visite",
    title: "Showroom & Direction Générale",
    paragraph:
      "Venez découvrir nos véhicules en conditions réelles et réaliser un essai sur route dans notre showroom de prestige à Cotonou.",
    addressLabel: "Adresse du Showroom :",
    addressText: "Zone Maro-Militaire, Quartier Gbèdomidji, Cotonou, République du Bénin",
    openMaps: "Ouvrir dans Google Maps",
    phoneLabel: "Lignes Téléphoniques Officielles :",
    emailLabel: "Courriers Électroniques :",
    formTitle: "Écrivez-nous Directement",
    formSubtitle: "Notre équipe commerciale vous répond sous quelques minutes.",
    nameLabel: "Votre Nom et Prénoms *",
    namePlaceholder: "Ex : M. KOUASSI Jean",
    phoneFieldLabel: "Téléphone / WhatsApp *",
    emailFieldLabel: "Email Professionnel",
    emailPlaceholder: "jean@domaine.com",
    messageLabel: "Votre Message ou Véhicule recherché",
    messagePlaceholder: "Précisez le véhicule ou votre besoin...",
    successTitle: "Message bien transmis !",
    successText: "L'équipe commerciale CARZONE vous contacte dans les plus brefs délais.",
    sending: "Envoi en cours...",
    submit: "Envoyer ma Demande",
  },
  footer: {
    description:
      "CARZONE SARL, concessionnaire automobile multimarques de premier plan en République du Bénin. Vente, atelier SAV, pièces d'origine et recharge électrique.",
    brandsTitle: "Nos Marques Partenaires",
    quickNavTitle: "Navigation Rapide",
    navStock: "Stock Showroom & Arrivages",
    navFactoryOrder: "Commande Spéciale d'Usine",
    navWorkshop: "Atelier SAV & Diagnostics",
    navCharging: "Solutions de Recharge VE",
    navLogin: "Espace Collaborateur (Connexion)",
    contactTitle: "Contact Immédiat",
    showroomLine: "Showroom : Gbèdomidji, Cotonou",
    phoneLine: "Tél : +229 01 92 61 61 61",
    emailLine: "Email : contact@topcarzone.com",
    whatsappLine: "WhatsApp Assistance 24/7",
    copyright: (year) => `© ${year} CARZONE SARL. Tous droits réservés. Cotonou, Bénin.`,
    platformLine: "Plateforme Officielle reliée au Système d'Information & Stock Central CARZONE.",
  },
  floatingWhatsapp: {
    title: "Discuter directement avec un conseiller commercial",
    text: "Conseiller en ligne",
  },
  detailModal: {
    inStock: "EN STOCK SHOWROOM",
    inTransit: "EN TRANSIT",
    atPort: "AU PORT",
    ordered: "COMMANDÉ",
    situationLabel: "Situation du Véhicule",
    statusShowroom: "🟢 Disponible immédiatement au Showroom de Gbèdomidji (Cotonou)",
    statusTransit: (eta) =>
      `🚢 En transit maritime vers Cotonou${eta ? ` · Arrivage prévu le ${eta}` : ""}`,
    statusPort: "⚓ Arrivé au Port Autonome de Cotonou · Dédouanement en cours",
    statusOrdered: "🏭 Commandé d'usine · En cours d'assemblage constructeur",
    statusFactoryOrder: "✨ Disponible sur commande directe usine (Délai : 4 à 6 semaines)",
    officialPrice: "Tarif Officiel",
    thumbnailAlt: "Vignette",
    engineTitle: "Motorisation & Performance",
    engineLabel: "Moteur :",
    powerLabel: "Puissance :",
    torqueLabel: "Couple max :",
    transmissionLabel: "Transmission :",
    energyLabel: "Énergie :",
    dimensionsTitle: "Dimensions & Habitabilité",
    dimensionsLabel: "L x l x h (mm) :",
    wheelbaseLabel: "Empattement :",
    seatsLabel: "Places assises :",
    seatsSuffix: "places",
    doorsLabel: "Portes :",
    doorsSuffix: "portes",
    tankLabel: "Réservoir/Batterie :",
    comfortTitle: "Équipements de Confort & Technologie",
    safetyTitle: "Sécurité & Aides à la Conduite (ADAS)",
    warrantyNote: "Garantie constructeur officielle incluse · Véhicule neuf 0 km",
    pdfSheet: "Fiche Technique (PDF)",
    pdfSheetTitle: "Imprimer ou enregistrer en PDF la fiche technique officielle",
    whatsappDirect: "WhatsApp Direct",
    reserveBeforeArrival: "Réserver avant arrivage",
    blockReservation: "Bloquer réservation",
    requestQuote: "Demander une Cotation Immédiate",
  },
  quoteModal: {
    headerTransit: "Réservation Anticipée en Transit",
    headerShowroom: "Devis Proforma Showroom",
    headerDefault: "Cotation & Commande Véhicule",
    defaultTitle: "Demande de Devis & Catalogue CARZONE",
    successTitleReservation: "Votre demande de réservation a été enregistrée !",
    successTitleQuote: "Votre demande de cotation a été transmise !",
    successText:
      "Notre équipe commerciale prépare votre cotation chiffrée avec les délais de livraison showroom. Un conseiller va vous joindre très rapidement.",
    whatsappCta: "Accélérer mon dossier sur WhatsApp",
    close: "Fermer",
    transitNoticeLead: "Véhicule en cours d'acheminement maritime :",
    transitNoticeMid: "Arrivage estimé au Port de Cotonou le",
    transitNoticeTail:
      ". En remplissant ce formulaire, vous recevez la proforma pour bloquer votre réservation prioritaire.",
    showroomNoticeLead: "Disponible immédiatement :",
    showroomNoticeTail:
      " Ce véhicule est présent au Showroom de Gbèdomidji (Cotonou). Livraison rapide sous 24h à 48h.",
    nameLabel: "Nom et Prénoms / Société *",
    namePlaceholder: "Ex : M. ADEOTI Paul",
    phoneLabel: "Téléphone / WhatsApp *",
    emailLabel: "Email",
    emailPlaceholder: "paul@email.com",
    paymentTypeLabel: "Type d'Acquisition",
    paymentCash: "Paiement Comptant",
    paymentCredit: "Crédit Bancaire / Leasing",
    paymentFleet: "Flotte Société / Appel d'offres",
    cityLabel: "Ville de Livraison",
    notesLabel: "Précisions ou Options Souhaitées (Optionnel)",
    notesPlaceholder: "Ex : Couleur préférée, acompte de réservation...",
    processing: "Traitement en cours...",
    receiveProforma: "Recevoir la Proforma & Réserver",
    receiveQuote: "Recevoir ma Cotation Immédiate",
  },
  whatsapp: {
    transit: (title, eta) =>
      `Bonjour CARZONE Bénin, je souhaite réserver le modèle ${title} actuellement en transit vers Cotonou${eta ? ` (Arrivage prévu le ${eta})` : ""}. Pouvez-vous me transmettre la facture proforma officielle ?`,
    port: (title) =>
      `Bonjour CARZONE Bénin, je suis intéressé par le modèle ${title} actuellement au Port de Cotonou en dédouanement. Quand sera-t-il prêt au Showroom ?`,
    showroom: (title, price) =>
      `Bonjour CARZONE Bénin, je souhaite acheter le modèle ${title} disponible au showroom de Cotonou. Pouvez-vous me confirmer le prix (${price}) et la disponibilité d'essai ?`,
    factoryOrder: (title) =>
      `Bonjour CARZONE Bénin, je souhaite configurer et commander d'usine le modèle ${title}. Pouvez-vous me transmettre la fiche technique et le devis usine ?`,
    general:
      "Bonjour CARZONE Bénin, je souhaite échanger avec un conseiller commercial concernant vos véhicules neufs disponibles au showroom de Cotonou.",
  },
  errors: {
    missingContact: "Veuillez renseigner votre nom et au moins un contact (téléphone ou email).",
    genericSubmit: "Une erreur est survenue.",
    connection: "Erreur de connexion. Veuillez réessayer.",
  },
};

const en: PublicShowcaseCopy = {
  metaTitle: "CARZONE SARL Benin, official car dealership and EV mobility in Cotonou",
  metaDescription:
    "Showroom of new multi-brand vehicles (Changan, Jetour, BYD, Geely, BAIC, Toyota, Dongfeng), instant quotes, custom factory orders, a certified service workshop and EV charging solutions in Cotonou, Benin.",
  topBar: {
    address: "Maro-Militaire Showroom, Gbèdomidji, Cotonou",
    hours: "Mon - Fri: 8:00 AM - 6:30 PM | Sat: 8:30 AM - 3:00 PM",
    dashboardLabel: (name) => `Dashboard (${name})`,
    loginLabel: "Staff Area",
  },
  nav: {
    stock: "Stock & Arrivals",
    factoryOrder: "Factory Order",
    workshop: "Service & Parts",
    charging: "Charging & EV",
    contact: "Showroom & Access",
  },
  header: {
    quoteExpress: "Express Quote",
    whatsapp: "WhatsApp",
  },
  hero: {
    badge: "Official multi-brand dealership, live stock and arrivals in Cotonou",
    titleStart: "Automotive Excellence",
    titleHighlight: "in the Heart of Cotonou",
    searchPlaceholder: "Search by model, brand...",
    quoteCta: "Express Quote in 1 Click",
    availabilityLabel: "Availability:",
    brandLabel: "Brand:",
    allBrands: "All",
  },
  categories: {
    all: "All Vehicles",
    vedettes: "🔥 2026 Arrivals & Showstoppers",
    suv: "SUVs & Crossovers",
    pickup: "4x4 Pickups",
    berline: "Luxury Sedans",
    electrique: "Electric & Hybrid (EV)",
  },
  availability: {
    all: "All Availability",
    showroom: "🟢 In Showroom Stock",
    transit: "🚢 Incoming / At Port",
    commande: "🏭 Factory Orders",
  },
  showroom: {
    badge: "Smart Automatic Ranking",
    title: "New Vehicle Collection & Priority Arrivals",
    subtitle: "The newest, most advanced 2026 models rise to the top automatically.",
    modelsAvailable: "models available",
    emptyTitle: "No vehicle matches these criteria",
    emptyText: "Adjust your filters or place a custom factory order instead.",
    resetFilters: "Reset Filters",
  },
  card: {
    newBadge: "NEW FOR 2026",
    flagshipBadge: "FLAGSHIP MODEL",
    inStockBadge: "IN SHOWROOM STOCK",
    transitBadge: (eta) => (eta ? `ARRIVING: ${eta}` : "IN TRANSIT"),
    portBadge: "AT PORT (CUSTOMS CLEARANCE)",
    orderedBadge: "FACTORY ORDERED",
    factoryOrderBadge: "AVAILABLE TO ORDER",
    galleryHint: "360° Gallery & Spec Sheet",
    officialPrice: "Official Price",
    availability: "Availability",
    priceOnQuote: "Price on factory quote",
    etaUpcoming: "EXPECTED ARRIVAL",
    deliveryLabel: "DELIVERY",
    deliveryImmediate: "Immediate, 24-48h",
    automatic: "Automatic",
    manual: "Manual",
    sheetAndPhotos: "Spec Sheet & Photos",
    reserveBeforeArrival: "Reserve Before Arrival",
    blockReservation: "Lock In Reservation",
    quoteOneClick: "1-Click Quote",
    chatWhatsapp: "Chat on WhatsApp",
  },
  customOrder: {
    badge: "A CARZONE Benin Exclusive",
    titleStart: "Custom Orders",
    titleHighlight: "Straight From the Factory",
    paragraph:
      "Have a precise build in mind? CARZONE handles direct imports from manufacturer plants in China, Dubai, Europe and Japan.",
    feature1Title: "Full choice of finishes:",
    feature1Text:
      "Exclusive body colors, two-tone Nappa leather interiors, panoramic roofs, custom wheels.",
    feature2Title: "Secure logistics & sea freight:",
    feature2Text:
      "Real-time container tracking with full traceability from the factory to the Port of Cotonou.",
    feature3Title: "Turnkey delivery:",
    feature3Text:
      "Customs clearance, paperwork, Benin registration and showroom detailing all included.",
    cta: "Configure a Factory Order",
    cardTitle: "Quick Customization Request",
    cardText:
      "Tell us the vehicle and the options you want. A CARZONE import specialist will reach out within 2 hours with a detailed factory quote.",
    whatsappCta: "Discuss Your Project on WhatsApp",
    orCallSales: "or call our sales management directly:",
    defaultNote: "Request for a custom factory order",
  },
  services: {
    badge: "Technical Excellence",
    title: "Certified Service Workshop & Genuine Parts",
    paragraph:
      "Our commitment doesn't stop at the sale. CARZONE runs an ultra-modern workshop equipped with the latest manufacturer diagnostic tools.",
    card1Title: "High-Precision Electronic Diagnostics",
    card1Text:
      "Certified multi-brand electronic test benches for detecting and updating control units, hybrid systems and batteries.",
    card2Title: "Genuine Spare Parts Store",
    card2Text:
      "A permanent stock of manufacturer-guaranteed original parts: filters, brake pads, suspension components, lights and official accessories.",
    card3Title: "Maintenance Contracts & Fleet Tracking",
    card3Text:
      "Tailored plans for businesses and individuals: quick oil changes, guaranteed periodic servicing and 24/7 roadside assistance across Benin.",
  },
  charging: {
    badge: "Energy Transition & Green Mobility",
    titleStart: "Charging Solutions",
    titleHighlight: "Electric Vehicles (EV)",
    paragraph:
      "A pioneer of electric mobility in Cotonou, CARZONE offers a full range of smart AC/DC chargers (7kW to ultra-fast 120kW) for homes, hotels and businesses.",
    item1: "Home charging stations (Wallbox 7kW to 22kW)",
    item2: "Fast DC superchargers for fleets and public parking lots",
    item3: "Electrical installation certified by qualified technicians",
    cta: "Request a Charger Installation Study",
    cardTitle: "The CARZONE Charging Network in Cotonou",
    cardText:
      "Charge your fully electric or plug-in hybrid vehicle (BYD, Geely Galaxy, etc.) right at the Carzone Showroom in under 35 minutes.",
    stationName: "Carzone Maro-Militaire Station",
    statusOnline: "ONLINE",
    connectorNote: "CCS2 Combo and Type 2 connectors compatible with every brand.",
  },
  contact: {
    badge: "Come Visit Us",
    title: "Showroom & Head Office",
    paragraph:
      "Come see our vehicles in real conditions and take a test drive at our prestige showroom in Cotonou.",
    addressLabel: "Showroom Address:",
    addressText: "Zone Maro-Militaire, Gbèdomidji District, Cotonou, Republic of Benin",
    openMaps: "Open in Google Maps",
    phoneLabel: "Official Phone Lines:",
    emailLabel: "Email Addresses:",
    formTitle: "Write to Us Directly",
    formSubtitle: "Our sales team replies within minutes.",
    nameLabel: "Your Full Name *",
    namePlaceholder: "e.g. Mr. KOUASSI Jean",
    phoneFieldLabel: "Phone / WhatsApp *",
    emailFieldLabel: "Work Email",
    emailPlaceholder: "jean@domain.com",
    messageLabel: "Your Message or Vehicle of Interest",
    messagePlaceholder: "Tell us the vehicle or what you need...",
    successTitle: "Message sent!",
    successText: "The CARZONE sales team will reach out as soon as possible.",
    sending: "Sending...",
    submit: "Send My Request",
  },
  footer: {
    description:
      "CARZONE SARL, a leading multi-brand car dealership in the Republic of Benin. Sales, service workshop, genuine parts and EV charging.",
    brandsTitle: "Our Partner Brands",
    quickNavTitle: "Quick Links",
    navStock: "Showroom Stock & Arrivals",
    navFactoryOrder: "Special Factory Order",
    navWorkshop: "Service Workshop & Diagnostics",
    navCharging: "EV Charging Solutions",
    navLogin: "Staff Area (Login)",
    contactTitle: "Contact Us Now",
    showroomLine: "Showroom: Gbèdomidji, Cotonou",
    phoneLine: "Phone: +229 01 92 61 61 61",
    emailLine: "Email: contact@topcarzone.com",
    whatsappLine: "WhatsApp Support 24/7",
    copyright: (year) => `© ${year} CARZONE SARL. All rights reserved. Cotonou, Benin.`,
    platformLine: "Official platform connected to CARZONE's central stock and information system.",
  },
  floatingWhatsapp: {
    title: "Chat directly with a sales advisor",
    text: "Advisor online",
  },
  detailModal: {
    inStock: "IN SHOWROOM STOCK",
    inTransit: "IN TRANSIT",
    atPort: "AT PORT",
    ordered: "ORDERED",
    situationLabel: "Vehicle Status",
    statusShowroom: "🟢 Available immediately at the Gbèdomidji Showroom (Cotonou)",
    statusTransit: (eta) =>
      `🚢 At sea, en route to Cotonou${eta ? ` · Expected arrival on ${eta}` : ""}`,
    statusPort: "⚓ Arrived at the Autonomous Port of Cotonou · Customs clearance in progress",
    statusOrdered: "🏭 Ordered from the factory · Currently being assembled",
    statusFactoryOrder: "✨ Available on direct factory order (lead time: 4 to 6 weeks)",
    officialPrice: "Official Price",
    thumbnailAlt: "Thumbnail",
    engineTitle: "Engine & Performance",
    engineLabel: "Engine:",
    powerLabel: "Power:",
    torqueLabel: "Max torque:",
    transmissionLabel: "Transmission:",
    energyLabel: "Fuel type:",
    dimensionsTitle: "Dimensions & Interior Space",
    dimensionsLabel: "L x W x H (mm):",
    wheelbaseLabel: "Wheelbase:",
    seatsLabel: "Seats:",
    seatsSuffix: "seats",
    doorsLabel: "Doors:",
    doorsSuffix: "doors",
    tankLabel: "Fuel tank/Battery:",
    comfortTitle: "Comfort & Technology Features",
    safetyTitle: "Safety & Driver Assistance (ADAS)",
    warrantyNote: "Official manufacturer warranty included · Brand new, 0 km",
    pdfSheet: "Spec Sheet (PDF)",
    pdfSheetTitle: "Print or save the official spec sheet as a PDF",
    whatsappDirect: "Direct WhatsApp",
    reserveBeforeArrival: "Reserve Before Arrival",
    blockReservation: "Lock In Reservation",
    requestQuote: "Request an Instant Quote",
  },
  quoteModal: {
    headerTransit: "Early Reservation, In Transit",
    headerShowroom: "Showroom Proforma Quote",
    headerDefault: "Vehicle Quote & Order",
    defaultTitle: "CARZONE Quote & Catalog Request",
    successTitleReservation: "Your reservation request has been recorded!",
    successTitleQuote: "Your quote request has been sent!",
    successText:
      "Our sales team is preparing your priced quote along with showroom delivery lead times. An advisor will reach out very shortly.",
    whatsappCta: "Speed Up My Request on WhatsApp",
    close: "Close",
    transitNoticeLead: "Vehicle currently shipping by sea:",
    transitNoticeMid: "Expected arrival at the Port of Cotonou on",
    transitNoticeTail:
      ". By filling in this form, you'll receive the proforma invoice to lock in your priority reservation.",
    showroomNoticeLead: "Available right away:",
    showroomNoticeTail:
      " This vehicle is on site at the Gbèdomidji Showroom (Cotonou). Fast delivery within 24 to 48 hours.",
    nameLabel: "Full Name / Company *",
    namePlaceholder: "e.g. Mr. ADEOTI Paul",
    phoneLabel: "Phone / WhatsApp *",
    emailLabel: "Email",
    emailPlaceholder: "paul@email.com",
    paymentTypeLabel: "Purchase Type",
    paymentCash: "Cash Payment",
    paymentCredit: "Bank Credit / Leasing",
    paymentFleet: "Company Fleet / Tender",
    cityLabel: "Delivery City",
    notesLabel: "Details or Preferred Options (Optional)",
    notesPlaceholder: "e.g. Preferred color, reservation deposit...",
    processing: "Processing...",
    receiveProforma: "Get the Proforma & Reserve",
    receiveQuote: "Get My Instant Quote",
  },
  whatsapp: {
    transit: (title, eta) =>
      `Hello CARZONE Benin, I'd like to reserve the ${title}, currently in transit to Cotonou${eta ? ` (expected arrival on ${eta})` : ""}. Could you send me the official proforma invoice?`,
    port: (title) =>
      `Hello CARZONE Benin, I'm interested in the ${title}, currently going through customs at the Port of Cotonou. When will it be ready at the Showroom?`,
    showroom: (title, price) =>
      `Hello CARZONE Benin, I'd like to buy the ${title} available at the Cotonou showroom. Could you confirm the price (${price}) and whether a test drive is possible?`,
    factoryOrder: (title) =>
      `Hello CARZONE Benin, I'd like to configure and order the ${title} directly from the factory. Could you send me the spec sheet and a factory quote?`,
    general:
      "Hello CARZONE Benin, I'd like to speak with a sales advisor about your new vehicles available at the Cotonou showroom.",
  },
  errors: {
    missingContact: "Please enter your name and at least one contact method (phone or email).",
    genericSubmit: "Something went wrong.",
    connection: "Connection error. Please try again.",
  },
};

const zh: PublicShowcaseCopy = {
  metaTitle: "CARZONE SARL 贝宁,科托努官方汽车经销商与电动出行服务",
  metaDescription:
    "多品牌全新车型展厅(长安、Jetour、比亚迪、吉利、北汽、丰田、东风),即时报价,工厂定制订单,认证售后车间及贝宁科托努电动车充电方案。",
  topBar: {
    address: "科托努 Gbèdomidji 社区 Maro-Militaire 展厅",
    hours: "周一至周五:8:00-18:30 | 周六:8:30-15:00",
    dashboardLabel: (name) => `控制台(${name})`,
    loginLabel: "员工入口",
  },
  nav: {
    stock: "现车与到港",
    factoryOrder: "工厂订车",
    workshop: "售后车间与配件",
    charging: "充电桩与电动车",
    contact: "展厅与交通",
  },
  header: {
    quoteExpress: "极速报价",
    whatsapp: "WhatsApp",
  },
  hero: {
    badge: "官方多品牌经销商,科托努现车与到港实时更新",
    titleStart: "卓越汽车品质",
    titleHighlight: "就在科托努中心",
    searchPlaceholder: "按车型、品牌搜索...",
    quoteCta: "一键极速报价",
    availabilityLabel: "库存状态:",
    brandLabel: "品牌:",
    allBrands: "全部",
  },
  categories: {
    all: "全部车型",
    vedettes: "🔥 2026新车与热门车型",
    suv: "SUV 与跨界车",
    pickup: "4x4 皮卡",
    berline: "豪华轿车",
    electrique: "纯电与混动(新能源)",
  },
  availability: {
    all: "全部库存状态",
    showroom: "🟢 展厅现车",
    transit: "🚢 在途 / 在港",
    commande: "🏭 工厂订单",
  },
  showroom: {
    badge: "智能自动排序",
    title: "新车阵容与优先到港车型",
    subtitle: "最新、最具科技感的2026车型会自动排在最前面。",
    modelsAvailable: "款车型可选",
    emptyTitle: "没有符合条件的车型",
    emptyText: "请调整筛选条件,或直接向工厂下定制订单。",
    resetFilters: "重置筛选条件",
  },
  card: {
    newBadge: "2026新车",
    flagshipBadge: "旗舰车型",
    inStockBadge: "展厅现车",
    transitBadge: (eta) => (eta ? `预计到港:${eta}` : "在途中"),
    portBadge: "在港(清关中)",
    orderedBadge: "工厂订单中",
    factoryOrderBadge: "可工厂定制",
    galleryHint: "360° 相册与配置单",
    officialPrice: "官方售价",
    availability: "库存状态",
    priceOnQuote: "需向工厂询价",
    etaUpcoming: "预计到港",
    deliveryLabel: "交车时间",
    deliveryImmediate: "24-48小时内交车",
    automatic: "自动挡",
    manual: "手动挡",
    sheetAndPhotos: "配置单与实拍图",
    reserveBeforeArrival: "到港前预订",
    blockReservation: "锁定预订",
    quoteOneClick: "一键报价",
    chatWhatsapp: "在 WhatsApp 上咨询",
  },
  customOrder: {
    badge: "CARZONE 贝宁独家服务",
    titleStart: "个性化定制订车",
    titleHighlight: "工厂直供",
    paragraph:
      "心里已有理想配置?CARZONE 负责从中国、迪拜、欧洲、日本的工厂直接进口。",
    feature1Title: "全套配置自由选择:",
    feature1Text: "专属车身颜色、双色 Nappa 真皮内饰、全景天窗、定制轮毂。",
    feature2Title: "安全的海运物流:",
    feature2Text: "从工厂到科托努自治港,全程实时追踪您的集装箱。",
    feature3Title: "交钥匙式交付:",
    feature3Text: "清关、行政手续、贝宁注册及展厅美容,全部包含在内。",
    cta: "配置一份工厂订单",
    cardTitle: "快速定制申请",
    cardText: "告诉我们您想要的车型与配置,CARZONE 进口专员将在2小时内联系您并提供详细工厂报价。",
    whatsappCta: "在 WhatsApp 上聊聊您的项目",
    orCallSales: "或直接致电我们的销售负责人:",
    defaultNote: "工厂个性化定制订车申请",
  },
  services: {
    badge: "卓越技术服务",
    title: "认证售后车间与原厂配件",
    paragraph: "我们的承诺不止于销售。CARZONE 拥有配备最新厂商诊断设备的超现代化车间。",
    card1Title: "高精度电子诊断",
    card1Text: "多品牌认证电子检测台,用于检测和升级电脑模块、混动系统与电池。",
    card2Title: "原厂配件商店",
    card2Text: "常备厂商保证的原装配件:滤芯、刹车片、悬挂部件、灯具及官方配件。",
    card3Title: "维保合同与车队跟踪",
    card3Text: "面向企业与个人的定制方案:快速换油、定期保养及贝宁全境24/7道路救援。",
  },
  charging: {
    badge: "能源转型与绿色出行",
    titleStart: "电动车",
    titleHighlight: "充电解决方案",
    paragraph:
      "CARZONE 是科托努电动出行的先行者,提供从7kW到120kW超快充的全系列智能交直流充电桩,适用于住宅、酒店及企业。",
    item1: "家用充电桩(Wallbox 7kW至22kW)",
    item2: "面向车队与公共停车场的直流快充桩",
    item3: "由持证技术人员完成的认证电气安装",
    cta: "申请充电桩安装方案",
    cardTitle: "CARZONE 科托努充电网络",
    cardText: "在 Carzone 展厅,35分钟内即可为您的纯电或插电混动车型(比亚迪、吉利银河等)充满电。",
    stationName: "Carzone Maro-Militaire 充电站",
    statusOnline: "在线",
    connectorNote: "CCS2 与 Type 2 接口,兼容所有品牌车型。",
  },
  contact: {
    badge: "欢迎到店参观",
    title: "展厅与总部",
    paragraph: "欢迎到科托努的高端展厅,实地体验我们的车型并预约试驾。",
    addressLabel: "展厅地址:",
    addressText: "贝宁共和国科托努 Gbèdomidji 社区 Maro-Militaire 区",
    openMaps: "在谷歌地图中打开",
    phoneLabel: "官方联系电话:",
    emailLabel: "电子邮箱:",
    formTitle: "直接给我们留言",
    formSubtitle: "我们的销售团队将在几分钟内回复您。",
    nameLabel: "您的姓名 *",
    namePlaceholder: "例:KOUASSI Jean 先生",
    phoneFieldLabel: "电话 / WhatsApp *",
    emailFieldLabel: "工作邮箱",
    emailPlaceholder: "jean@domaine.com",
    messageLabel: "留言内容或意向车型",
    messagePlaceholder: "请说明您想要的车型或需求...",
    successTitle: "留言已发送!",
    successText: "CARZONE 销售团队将尽快与您联系。",
    sending: "发送中...",
    submit: "发送我的请求",
  },
  footer: {
    description: "CARZONE SARL,贝宁共和国领先的多品牌汽车经销商。销售、售后车间、原厂配件及电动车充电服务。",
    brandsTitle: "合作品牌",
    quickNavTitle: "快速导航",
    navStock: "展厅现车与到港车型",
    navFactoryOrder: "工厂特别定制订单",
    navWorkshop: "售后车间与诊断服务",
    navCharging: "电动车充电解决方案",
    navLogin: "员工入口(登录)",
    contactTitle: "立即联系我们",
    showroomLine: "展厅:科托努 Gbèdomidji",
    phoneLine: "电话:+229 01 92 61 61 61",
    emailLine: "邮箱:contact@topcarzone.com",
    whatsappLine: "WhatsApp 24/7 客服支持",
    copyright: (year) => `© ${year} CARZONE SARL。版权所有。科托努,贝宁。`,
    platformLine: "官方平台,已连接至 CARZONE 中央信息与库存系统。",
  },
  floatingWhatsapp: {
    title: "直接与销售顾问沟通",
    text: "顾问在线",
  },
  detailModal: {
    inStock: "展厅现车",
    inTransit: "在途中",
    atPort: "在港",
    ordered: "已订购",
    situationLabel: "车辆状态",
    statusShowroom: "🟢 Gbèdomidji 展厅(科托努)现车,可立即提车",
    statusTransit: (eta) => `🚢 海运中,正运往科托努${eta ? ` · 预计${eta}到港` : ""}`,
    statusPort: "⚓ 已抵达科托努自治港 · 清关中",
    statusOrdered: "🏭 已向工厂订购 · 正在组装生产",
    statusFactoryOrder: "✨ 可直接向工厂订购(周期:4至6周)",
    officialPrice: "官方售价",
    thumbnailAlt: "缩略图",
    engineTitle: "动力与性能",
    engineLabel: "发动机:",
    powerLabel: "功率:",
    torqueLabel: "最大扭矩:",
    transmissionLabel: "变速箱:",
    energyLabel: "燃料类型:",
    dimensionsTitle: "尺寸与空间",
    dimensionsLabel: "长×宽×高(mm):",
    wheelbaseLabel: "轴距:",
    seatsLabel: "座位数:",
    seatsSuffix: "座",
    doorsLabel: "车门数:",
    doorsSuffix: "门",
    tankLabel: "油箱/电池:",
    comfortTitle: "舒适与科技配置",
    safetyTitle: "安全与驾驶辅助(ADAS)",
    warrantyNote: "含官方厂商质保 · 全新零公里车辆",
    pdfSheet: "配置单(PDF)",
    pdfSheetTitle: "打印或保存官方配置单为PDF",
    whatsappDirect: "WhatsApp 直接联系",
    reserveBeforeArrival: "到港前预订",
    blockReservation: "锁定预订",
    requestQuote: "立即索取报价",
  },
  quoteModal: {
    headerTransit: "在途车辆提前预订",
    headerShowroom: "展厅报价单",
    headerDefault: "车辆报价与订购",
    defaultTitle: "CARZONE 报价与产品目录申请",
    successTitleReservation: "您的预订申请已登记!",
    successTitleQuote: "您的报价申请已提交!",
    successText: "我们的销售团队正在准备您的详细报价及展厅交车时间。顾问将很快与您联系。",
    whatsappCta: "在 WhatsApp 上加速处理我的申请",
    close: "关闭",
    transitNoticeLead: "车辆正在海运途中:",
    transitNoticeMid: "预计到达科托努港时间为",
    transitNoticeTail: "。填写此表单后,您将收到报价单,用于锁定优先预订。",
    showroomNoticeLead: "现车,可立即提车:",
    showroomNoticeTail: " 该车型现存于 Gbèdomidji 展厅(科托努)。24至48小时内即可快速交付。",
    nameLabel: "姓名 / 公司名称 *",
    namePlaceholder: "例:ADEOTI Paul 先生",
    phoneLabel: "电话 / WhatsApp *",
    emailLabel: "邮箱",
    emailPlaceholder: "paul@email.com",
    paymentTypeLabel: "购买方式",
    paymentCash: "现金支付",
    paymentCredit: "银行贷款 / 租赁",
    paymentFleet: "企业车队 / 招标采购",
    cityLabel: "交车城市",
    notesLabel: "补充说明或期望配置(可选)",
    notesPlaceholder: "例:偏好颜色、预订定金...",
    processing: "处理中...",
    receiveProforma: "获取报价单并预订",
    receiveQuote: "立即获取我的报价",
  },
  whatsapp: {
    transit: (title, eta) =>
      `您好 CARZONE 贝宁,我想预订${title},该车型目前正运往科托努${eta ? `(预计${eta}到港)` : ""}。可以给我发送正式报价单吗?`,
    port: (title) => `您好 CARZONE 贝宁,我对${title}感兴趣,该车型目前在科托努港清关中。什么时候能到展厅?`,
    showroom: (title, price) =>
      `您好 CARZONE 贝宁,我想购买科托努展厅现有的${title}。可以确认一下价格(${price})以及是否能试驾吗?`,
    factoryOrder: (title) => `您好 CARZONE 贝宁,我想配置并向工厂订购${title}。可以给我发送配置单和工厂报价吗?`,
    general: "您好 CARZONE 贝宁,我想和销售顾问了解一下科托努展厅现有的新车。",
  },
  errors: {
    missingContact: "请填写您的姓名以及至少一种联系方式(电话或邮箱)。",
    genericSubmit: "出现了一个错误。",
    connection: "连接错误,请重试。",
  },
};

export const publicShowcaseCopy: Record<Locale, PublicShowcaseCopy> = { fr, en, zh };
