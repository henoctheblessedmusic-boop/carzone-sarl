import type { SiteCopy } from "./types";

export const fr: SiteCopy = {
  meta: {
    home: {
      title: "CARZONE SARL | Concessionnaire automobile multimarques à Cotonou",
      description:
        "Showroom Changan, Jetour, BYD, Geely, BAIC, Forthing et Toyota à Cotonou. Véhicules neufs, atelier SAV et solutions de recharge électrique.",
    },
    vehicules: {
      title: "Véhicules neufs en stock | CARZONE SARL",
      description:
        "Découvrez les véhicules neufs disponibles en showroom à Cotonou : SUV, berlines, pick-up et véhicules électriques toutes marques.",
    },
    surMesure: {
      title: "Commande sur mesure et import | CARZONE SARL",
      description:
        "Configurez votre véhicule et commandez-le directement usine avec CARZONE SARL, de la commande à la livraison au Bénin.",
    },
    services: {
      title: "Atelier SAV et entretien | CARZONE SARL",
      description:
        "Entretien programmé, diagnostic et pièces d'origine pour votre véhicule à Cotonou, par l'atelier CARZONE SARL.",
    },
    recharge: {
      title: "Solutions de recharge électrique | CARZONE SARL",
      description:
        "Bornes de recharge résidentielles et professionnelles, installation et accompagnement pour vos véhicules électriques.",
    },
    equipe: {
      title: "Notre équipe | CARZONE SARL",
      description:
        "Rencontrez les équipes de CARZONE SARL : direction, showroom, atelier SAV, recharge et énergie, imports et administration.",
    },
    contact: {
      title: "Contact et accès showroom | CARZONE SARL",
      description:
        "Adresse, téléphones et itinéraire du showroom CARZONE SARL à Cotonou, Zone Maro-Militaire, Quartier Gbèdomidji.",
    },
  },

  nav: {
    home: "Accueil",
    vehicules: "Véhicules",
    surMesure: "Sur-mesure",
    services: "Services",
    recharge: "Recharge",
    equipe: "Équipe",
    contact: "Contact",
    ariaLabel: "Navigation principale",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    languageLabel: "Langue",
    proSpace: "Espace Pro",
  },

  common: {
    skipToContent: "Aller au contenu principal",
    whatsapp: "WhatsApp",
    callUs: "Appeler",
    emailUs: "Écrire un e-mail",
    viewVehicles: "Voir les véhicules",
    contactUs: "Nous contacter",
    discoverMore: "En savoir plus",
    getDirections: "Itinéraire",
  },

  footer: {
    tagline:
      "Concessionnaire automobile multimarques à Cotonou : showroom, atelier SAV et solutions de recharge électrique.",
    addressTitle: "Showroom",
    contactTitle: "Contact",
    hoursTitle: "Horaires",
    hoursNote: "Horaires d'ouverture à confirmer. Contactez-nous avant votre visite.",
    navTitle: "Navigation",
    legalTitle: "Informations légales",
    ifuLabel: "IFU",
    rccmLabel: "RCCM",
    rightsReserved: "Tous droits réservés.",
    socialTitle: "Réseaux sociaux",
  },

  home: {
    hero: {
      eyebrow: "Concessionnaire multimarques à Cotonou",
      title: "Votre prochain véhicule commence chez CARZONE",
      subtitle:
        "Showroom de véhicules neufs, atelier SAV et solutions de recharge électrique, réunis au même endroit à Cotonou.",
      primaryCta: "Voir les véhicules",
      secondaryCta: "Nous contacter",
      imageAlt: "Véhicule exposé au showroom CARZONE SARL",
    },
    stats: [
      { value: "9", label: "marques distribuées en showroom" },
      { value: "0", label: "véhicules disponibles en stock" },
      { value: "3", label: "pôles d'expertise : showroom, atelier SAV, recharge" },
    ],
    pillars: {
      eyebrow: "Ce que nous faisons",
      title: "Trois pôles, une seule adresse",
      subtitle:
        "Showroom, atelier et recharge électrique réunis pour accompagner votre véhicule du premier jour à l'entretien courant.",
      items: [
        {
          title: "Showroom véhicules neufs",
          description:
            "Changan, Jetour, BYD, Geely, BAIC, Forthing, Chery et Toyota exposés en showroom à Cotonou, avec accompagnement commercial personnalisé.",
          href: "/vehicules",
          linkLabel: "Découvrir le showroom",
        },
        {
          title: "Commande sur mesure",
          description:
            "Configurez le véhicule de votre choix et passez commande directement usine, avec un suivi complet jusqu'à la livraison au Bénin.",
          href: "/sur-mesure",
          linkLabel: "Configurer un véhicule",
        },
        {
          title: "Atelier SAV et entretien",
          description:
            "Entretien programmé, diagnostic et pièces d'origine pour garder votre véhicule en parfait état de marche.",
          href: "/nos-services",
          linkLabel: "Voir les services atelier",
        },
        {
          title: "Recharge électrique",
          description:
            "Bornes résidentielles et professionnelles, installation et accompagnement pour vos véhicules électriques.",
          href: "/recharge",
          linkLabel: "Explorer les solutions de recharge",
        },
      ],
    },
    vehicles: {
      eyebrow: "Showroom",
      title: "Véhicules à la une",
      subtitle: "Une sélection de véhicules neufs actuellement visibles en showroom.",
      emptyMessage:
        "De nouveaux véhicules arrivent bientôt en showroom. Contactez-nous pour connaître les disponibilités.",
      viewAllCta: "Voir tous les véhicules",
      priceOnRequest: "Prix sur demande",
      viewDetails: "Voir le véhicule",
      newBadge: "Neuf",
      comingSoonBadge: "Bientôt disponible",
    },
    team: {
      eyebrow: "L'équipe CARZONE",
      title: "Des équipes dédiées à chaque étape",
      description:
        "Direction, showroom, atelier SAV, recharge et énergie, imports et administration : une équipe organisée par pôle pour vous accompagner du choix du véhicule à l'entretien.",
      cta: "Rencontrer l'équipe",
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          question: "Puis-je commander un véhicule qui n'est pas encore en stock ?",
          answer:
            "Oui. CARZONE SARL propose la commande usine sur mesure : vous choisissez le modèle et la configuration, nous nous occupons de la commande et de l'import jusqu'au Bénin.",
        },
        {
          question: "L'atelier SAV est-il réservé aux véhicules achetés chez CARZONE ?",
          answer:
            "Non. L'atelier SAV de CARZONE SARL assure l'entretien et le diagnostic de véhicules multimarques, pas uniquement ceux achetés en showroom.",
        },
        {
          question: "Proposez-vous l'installation de bornes de recharge ?",
          answer:
            "Oui, CARZONE SARL accompagne l'installation de solutions de recharge électrique pour les particuliers et les entreprises.",
        },
      ],
    },
    finalCta: {
      title: "Une question, un projet de véhicule ?",
      subtitle: "Notre équipe showroom vous répond par téléphone, e-mail ou WhatsApp.",
      primaryCta: "Contacter CARZONE",
      secondaryCta: "Écrire sur WhatsApp",
    },
  },
};
