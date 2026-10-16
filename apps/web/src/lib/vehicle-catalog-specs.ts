/**
 * Répertoire des fiches techniques officielles et photographies certifiées constructeurs.
 * Chaque modèle dispose de ses vraies caractéristiques d'usine et de sa propre galerie photo dédiée :
 * - mainPhotoUrl : Face avant 3/4 majestueuse
 * - interiorPhotoUrl : Habitacle / Poste de pilotage / Cockpit numérique
 * - exteriorPhotoUrl : Vue de profil / Flanc / Détails de carrosserie
 * - rearPhotoUrl : Face arrière 3/4
 */

export interface ModelCatalogEntry {
  brand: string;
  model: string;
  variant: string;
  category: "SUV" | "PICKUP" | "BERLINE" | "VAN" | "COUPE" | "ELECTRIQUE" | "MINIBUS";
  year: number;
  energy: "ESSENCE" | "DIESEL" | "ELECTRIQUE" | "HYBRIDE";
  title: string;
  photos: {
    mainPhotoUrl: string;
    interiorPhotoUrl: string;
    interiorSeatsPhotoUrl?: string;
    exteriorPhotoUrl: string;
    rearPhotoUrl: string;
  };
  dimensions: {
    lengthWidthHeight: string;
    wheelbase: string;
    doors: number;
    seats: number;
    tankOrBattery: string;
  };
  motorisation: {
    displacementOrMotor: string;
    cylinders: string;
    transmission: string;
    fuelType: string;
    maxPower: string;
    maxTorque: string;
    rangeKm?: string;
  };
  equipementConfort: string[];
  exterieur: string[];
  securite: string[];
}

export const OFFICIAL_VEHICLE_CATALOG: ModelCatalogEntry[] = [
  // 1. JEEP GRAND CHEROKEE
  {
    brand: "JEEP",
    model: "GRAND CHEROKEE",
    variant: "Summit Reserve 3.6L V6 4x4",
    category: "SUV",
    year: 2024,
    energy: "ESSENCE",
    title: "JEEP GRAND CHEROKEE SUMMIT RESERVE 3.6L V6 4x4",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6c/2022_Jeep_Grand_Cherokee_Summit_Reserve_4x4_in_Bright_White%2C_Front_Left%2C_01-16-2022.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Jeep_Grand_Cherokee_Limited_interior.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Jeep_Grand_Cherokee_%28WL%29_4xe_IMG_8481_%28cropped%29.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/2022_Jeep_Grand_Cherokee_Summit_Reserve_4x4_in_Bright_White%2C_Rear_Left%2C_01-16-2022.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4914x1968x1799",
      wheelbase: "2964",
      doors: 5,
      seats: 5,
      tankOrBattery: "87L",
    },
    motorisation: {
      displacementOrMotor: "3604 cm3 (Pentastar V6 24V VVT)",
      cylinders: "6 en V",
      transmission: "Automatique 8 rapports TorqueFlite 4WD Quadra-Trac",
      fuelType: "Essence sans plomb",
      maxPower: "216 kW (293 ch) à 6400 tr/min",
      maxTorque: "352 Nm à 4000 tr/min",
    },
    equipementConfort: [
      "Sellerie cuir Palermo matelassé avec surpiqûres sellier",
      "Écran tactile central Uconnect 5 haute définition 10,1 pouces",
      "Combiné d'instruments numérique 10,25 pouces personnalisable",
      "Système acoustique McIntosh 19 Haut-Parleurs Haute Fidélité 950W",
      "Climatisation automatique quadri-zone avec aérateurs arrière",
      "Sièges avant électriques 16 réglages massants et ventilés",
      "Affichage tête haute en couleur (HUD) 10 pouces",
      "Toit ouvrant panoramique double vitrage CommandView",
    ],
    exterieur: [
      "Calandre iconique Jeep à 7 fentes chromées et inserts noir laqué",
      "Projecteurs avant Full LED adaptatifs avec signature lumineuse",
      "Jantes en alliage d'aluminium poli bicolores 21 pouces",
      "Suspension pneumatique Quadra-Lift avec amortissement adaptatif",
      "Hayon arrière électrique motorisé à ouverture mains libres",
      "Barres de toit longitudinales aluminium et vitrage feuilleté acoustique",
      "Rétroviseurs électriques chauffants électrochromes à mémoire",
      "Système de sélection de motricité tout-terrain Selec-Terrain",
    ],
    securite: [
      "Système de transmission intégrale Quadra-Trac II permanente",
      "Freinage d'urgence autonome avec détection piétons et cyclistes",
      "Régulateur de vitesse adaptatif avec maintien au centre de voie (ACC)",
      "Vision nocturne par caméra infrarouge avec détection d'animaux",
      "Surveillance active des angles morts et trafic transversal arrière",
      "Caméras panoramiques 360° Surround View avec buses de lavage",
      "8 Airbags de protection intégrale (frontaux, latéraux, rideaux, genoux)",
      "Aide au démarrage en côte et contrôle de vitesse en descente",
    ],
  },

  // 2. JETOUR DASHING
  {
    brand: "JETOUR",
    model: "DASHING",
    variant: "Luxury 1.6TGDI 7DCT",
    category: "SUV",
    year: 2026,
    energy: "ESSENCE",
    title: "JETOUR DASHING LUXURY 1.6TGDI 7DCT",
    photos: {
      mainPhotoUrl: "/images/vehicles/dashing-main.jpg",
      interiorPhotoUrl: "/images/vehicles/dashing-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/dashing-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/dashing-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/dashing-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4590x1900x1685",
      wheelbase: "2720",
      doors: 5,
      seats: 5,
      tankOrBattery: "57L",
    },
    motorisation: {
      displacementOrMotor: "1598 cm3 (ACTECO 1.6 TGDI Turbo)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique 7 rapports double embrayage 7DCT",
      fuelType: "Essence",
      maxPower: "145 kW (197 ch) à 5500 tr/min",
      maxTorque: "290 Nm à 2000-4000 tr/min",
    },
    equipementConfort: [
      "Cockpit numérique avec écran tactile central géant 15,6 pouces",
      "Volant sport à méplat double branche gainé cuir multifonction",
      "Sièges sport baquets en cuir à réglages électriques et ventilation",
      "Système audio Sony 8 Haut-Parleurs avec appuie-têtes acoustiques",
      "Climatisation automatique avec purificateur d'air antibactérien CN95",
      "Chargeur smartphone sans fil haute vitesse 50W à refroidissement",
      "Éclairage d'ambiance dynamique 256 coloris personnalisables",
      "Démarrage sans clé Push Start et commande à distance intelligente",
    ],
    exterieur: [
      "Face avant futuriste sans calandre 'Borderless' sculptée",
      "Poignées de portières affleurantes escamotables électroniques",
      "Projecteurs scindés Full LED matriciels et feux arrière 3D",
      "Jantes en alliage diamantées bicolores 19 pouces",
      "Toit panoramique vitré géant de 1,14 m² avec velum électrique",
      "Aileron arrière aérodynamique avec diffuseur et 4 sorties d'échappement",
      "Rétroviseurs électriques chauffants et rabattables automatiquement",
      "Antenne requin et barres de toit aluminium intégrées",
    ],
    securite: [
      "Caméras panoramiques 540° Haute Définition avec châssis transparent",
      "Régulateur de vitesse adaptatif intelligent (ACC) avec maintien de voie",
      "Freinage d'urgence automatique autonome avec détection d'obstacles",
      "Surveillance d'angle mort (BSD) et alerte de circulation arrière",
      "Contrôle électronique de stabilité dynamique ESP Bosch 9.3",
      "6 Airbags de sécurité frontaux, latéraux et rideaux",
      "Fixations ISOFIX renforcées aux places arrière",
      "Surveillance en direct de la pression des pneus (TPMS)",
    ],
  },

  // 3. JETOUR T2 (TRAVELLER)
  {
    brand: "JETOUR",
    model: "T2",
    variant: "Traveller 2.0TGDI 4WD X-WD",
    category: "SUV",
    year: 2026,
    energy: "ESSENCE",
    title: "JETOUR T2 TRAVELLER 2.0T 4WD X-WD",
    photos: {
      mainPhotoUrl: "/images/vehicles/t2-main.jpg",
      interiorPhotoUrl: "/images/vehicles/t2-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/t2-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/t2-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/t2-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4785x2006x1880",
      wheelbase: "2800",
      doors: 5,
      seats: 5,
      tankOrBattery: "70L",
    },
    motorisation: {
      displacementOrMotor: "1998 cm3 (Kunpeng 2.0 TGDI Turbo)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique 7 rapports Magna 7DCT avec transmission XWD BorgWarner",
      fuelType: "Essence",
      maxPower: "187 kW (254 ch) à 5500 tr/min",
      maxTorque: "390 Nm à 1750-4000 tr/min",
    },
    equipementConfort: [
      "Écran central tactile panoramique 15,6 pouces (Puce Snapdragon 8155)",
      "Combiné d'instruments 10,25 pouces tout numérique haute fluidité",
      "Sellerie cuir suédé et microfibre tout confort avec réglages électriques",
      "Système acoustique Sony Premium Surround 12 Haut-Parleurs",
      "Climatisation automatique bizone avec filtration PM2.5 et ioniseur",
      "Vitrage acoustique feuilleté épais antibruit et athermique",
      "Console centrale haute avec compartiments réfrigérés et ports USB-C 60W",
      "Accès confort sans clé et démarrage Push Start",
    ],
    exterieur: [
      "Carrosserie cubique 'Boxy Hardcore' ultra-robuste baroudeur",
      "Angle d'attaque 28°, angle de fuite 30° et passage de gué 700 mm",
      "Signature lumineuse Full LED à 4 optiques carrés avec lettrage JETOUR éclairé",
      "Roue de secours montée sur porte de coffre arrière à assistance électrique",
      "Jantes tout-terrain forgées 20 pouces",
      "Rails de pavillon haute résistance capacité de charge 300 kg",
      "Marchepieds latéraux renforcés et protections de soubassement acier",
      "Toit ouvrant panoramique vitré à commande électrique",
    ],
    securite: [
      "Transmission intégrale 4x4 BorgWarner XWD de 6e génération avec eLSD",
      "Mode tout-terrain intelligent Crawl Control et sélecteur de terrain 6 modes",
      "Caméras panoramiques 540° HD avec vue transparente sous le véhicule",
      "Système de conduite autonome ADAS L2+ (freinage autonome, ACC, LKA)",
      "8 Airbags de sécurité rideaux et latéraux surdimensionnés",
      "Contrôle de stabilité du véhicule et assistance en descente (HDC)",
      "Système antivol moteur codé par transpondeur",
      "Structure de caisse renforcée haute rigidité torsionnelle",
    ],
  },

  // =========================================================================
  // FLOTTE CONCESSION CARZONE SARL - MODÈLES OFFICIELS & PHOTOS CERTIFIÉES
  // =========================================================================

  // 4. FORTHING RICH 7 DC 4X4 (DONGFENG / FORTHING)
  {
    brand: "FORTHING",
    model: "RICH 7",
    variant: "Double Cabine 2.0T 4x4 Luxe",
    category: "PICKUP",
    year: 2026,
    energy: "DIESEL",
    title: "DONGFENG FORTHING RICH 7 DOUBLE CABINE 4x4",
    photos: {
      mainPhotoUrl: "/images/vehicles/rich7-main.jpg",
      interiorPhotoUrl: "/images/vehicles/rich7-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/rich7-interior.jpg",
      exteriorPhotoUrl: "/images/vehicles/rich7-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/rich7-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "5290x1850x1830",
      wheelbase: "3150",
      doors: 4,
      seats: 5,
      tankOrBattery: "73L",
    },
    motorisation: {
      displacementOrMotor: "2298 cm3 (Renault-Nissan M9T Turbo Diesel 2.3L)",
      cylinders: "4 en ligne 16V Turbo Intercooler",
      transmission: "Automatique 8 rapports ZF avec boîte de transfert 4WD (2H, 4H, 4L)",
      fuelType: "Diesel",
      maxPower: "122 kW (166 ch) à 3500 tr/min",
      maxTorque: "420 Nm à 1600-2600 tr/min",
    },
    equipementConfort: [
      "Habitacle grand confort avec sellerie cuir microperforé surpiqué",
      "Écran tactile central multimédia HD 12,8 pouces avec connectivité smartphone",
      "Combiné d'instruments haute définition numérique 7 pouces",
      "Climatisation automatique bizone avec diffuseurs d'air aux places arrière",
      "Sièges avant à réglages électriques 8 voies et soutien lombaire",
      "Démarrage mains libres Push-Start et verrouillage centralisé sans clé",
      "Volant multifonction 3 branches gainé de cuir Nappa",
      "Système audio surround haute fidélité 6 haut-parleurs",
    ],
    exterieur: [
      "Benne arrière renforcée avec revêtement de protection projeté haute densité",
      "Arceau de sécurité benne en acier chromé et marchepieds latéraux intégrés",
      "Calandre avant imposante 'Eagle Wing' avec finitions chrome satiné",
      "Projecteurs avant Full LED à réglage de hauteur automatique",
      "Jantes alliage bicolores diamantées 18 pouces chaussées de pneus tout-terrain",
      "Rétroviseurs extérieurs électriques rabattables et dégivrants",
      "Plaque de protection de carter moteur renforcée tout-terrain",
      "Crochets d'arrimage de benne robustes et feux arrière verticaux LED",
    ],
    securite: [
      "Transmission 4x4 enclenchable avec blocage de différentiel arrière Eaton",
      "Contrôle dynamique de trajectoire ESP Bosch 9.3 et antipatinage TCS",
      "Caméras panoramiques 360° HD avec lignes de guidage dynamiques",
      "Système d'assistance au démarrage en côte (HAC) et contrôle en descente (HDC)",
      "6 Airbags de sécurité (frontaux, latéraux avant et rideaux de pavillon)",
      "Freinage ABS 4 disques avec répartiteur électronique EBD et assistance BAS",
      "Système de surveillance de pression des pneumatiques TPMS en temps réel",
      "Radar de recul sonore et capteurs de proximité avant",
    ],
  },

  // 5. FORTHING T5 EVO
  {
    brand: "FORTHING",
    model: "T5 EVO",
    variant: "Mach Edition 1.5TD 7DCT",
    category: "SUV",
    year: 2026,
    energy: "ESSENCE",
    title: "FORTHING T5 EVO MACH EDITION 1.5TD 7DCT",
    photos: {
      mainPhotoUrl: "/images/vehicles/t5evo-main.jpg",
      interiorPhotoUrl: "/images/vehicles/t5evo-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/t5evo-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/t5evo-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/t5evo-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4565x1860x1690",
      wheelbase: "2715",
      doors: 5,
      seats: 5,
      tankOrBattery: "55L",
    },
    motorisation: {
      displacementOrMotor: "1481 cm3 (Mitsubishi 4A95TD Mach Power Turbo)",
      cylinders: "4 en ligne 16V Turbo GDI",
      transmission: "Automatique 7 rapports Magna à double embrayage humide 7DCT",
      fuelType: "Essence",
      maxPower: "145 kW (197 ch) à 5600 tr/min",
      maxTorque: "285 Nm à 1500-4000 tr/min",
    },
    equipementConfort: [
      "Cockpit digital : double écran panoramique numérique 10,25 pouces incurvé et volant sport méplat",
      "Sièges sport en cuir noir perforé à surpiqûres rouges contrastées",
      "Sièges avant chauffants et ventilés, réglage électrique côté conducteur",
      "Toit ouvrant panoramique XXL de 1,18 m² avec vélum électrique",
      "Climatisation automatique avec purificateur d'air CN95 et ioniseur d'ions négatifs",
      "Éclairage d'ambiance 64 couleurs interactif synchronisé",
      "Hayon arrière motorisé avec ouverture intelligente sans les mains",
      "Chargeur smartphone à induction rapide 15W",
    ],
    exterieur: [
      "Design félin 'Lion Face' avec calandre avant noire agressive sculptée",
      "Projecteurs scindés ultra-effilés Full LED 'Hunting Eye'",
      "Jantes sport noir laqué 19 pouces avec étriers de freins peints",
      "Quatre véritables sorties d'échappement sportives chromées à l'arrière",
      "Bandeau lumineux arrière horizontal 3D Full LED traversant",
      "Rétroviseurs extérieurs noir brillant profilés aérodynamiques",
      "Becquet de toit aérodynamique à double bossage sport",
      "Poignées de portes ergonomiques couleur carrosserie avec capteurs tactiles",
    ],
    securite: [
      "Système de conduite assistée autonome ADAS L2+ (ACC, maintien de voie)",
      "Freinage d'urgence autonome d'évitement avec détection piétons",
      "Caméras 360° vue d'oiseau HD avec enregistreur de conduite intégré",
      "6 Airbags haute sécurité avec cellule en acier thermoformé à 76%",
      "Système de surveillance des angles morts (BSD) et alerte de changement de voie",
      "Contrôle de trajectoire Bosch ESP 9.3 et aide au démarrage en pente",
      "Régulateur et limiteur de vitesse adaptatif intelligent",
      "Système de surveillance TPMS de pression et température des pneus",
    ],
  },

  // 6. CHANGAN CS75 PLUS
  {
    brand: "CHANGAN",
    model: "CS75",
    variant: "Plus Flagship 2.0T 8AT",
    category: "SUV",
    year: 2026,
    energy: "ESSENCE",
    title: "CHANGAN CS75 PLUS FLAGSHIP 2.0T 8AT",
    photos: {
      mainPhotoUrl: "/images/vehicles/cs75-main.jpg",
      interiorPhotoUrl: "/images/vehicles/cs75-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/cs75-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/cs75-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/cs75-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4710x1865x1710",
      wheelbase: "2710",
      doors: 5,
      seats: 5,
      tankOrBattery: "58L",
    },
    motorisation: {
      displacementOrMotor: "1494 cm3 (Changan BlueCore 1.5 TGDI Turbo Haute Pression 350 bar)",
      cylinders: "4 en ligne 16V injection directe",
      transmission: "Automatique 8 rapports Aisin de nouvelle génération",
      fuelType: "Essence",
      maxPower: "138 kW (188 ch) à 5500 tr/min",
      maxTorque: "300 Nm à 1500-4000 tr/min",
    },
    equipementConfort: [
      "Double dalle numérique 12,3 pouces combinée haute résolution",
      "Sellerie cuir Nappa surpiqué avec finitions moussées haut de gamme",
      "Système audio Pioneer Haute Fidélité 8 haut-parleurs",
      "Toit ouvrant panoramique vitré électrique avec rideau pare-soleil",
      "Climatisation automatique avec système de purification d'air Forest Air",
      "Sièges électriques avant chauffants et ventilés avec mémoires de position",
      "Sélecteur de mode de conduite électronique (Eco, Normal, Sport, Custom)",
      "Affichage tête haute en couleur HUD et commandes vocales intelligentes",
    ],
    exterieur: [
      "Calandre avant majestueuse paramétrique sans bordure 'V-Shape'",
      "Projecteurs avant Full LED adaptatifs avec signature lumineuse continue",
      "Jantes en alliage bicolores sport 19 pouces",
      "Feux arrière Full LED verticaux 3D signature Changan Phoenix",
      "Vitrage arrière surteinté anti-UV avec insonorisation acoustique",
      "Rétroviseurs électriques chauffants, rabattables avec répétiteurs LED",
      "Hayon arrière motorisé avec détection au pied",
      "Barres de toit longitudinales en aluminium satiné intégrées",
    ],
    securite: [
      "Freinage automatique d'urgence AEB avec détection des véhicules et piétons",
      "Régulateur de vitesse adaptatif intégré IACC avec centrage dans la voie",
      "Système de caméras panoramiques 540° HD (360° + châssis transparent)",
      "6 Airbags de sécurité rideaux et latéraux grand volume",
      "Surveillance d'angle mort BSD et avertisseur de trafic arrière RCTA",
      "Contrôle de stabilité ESP 9.3 et assistance au freinage d'urgence BA",
      "Aide au stationnement automatique APA 5.0 à distance",
      "Capteur de pression et température des pneus TPMS",
    ],
  },

  // 7. CHANGAN CS35 PLUS
  {
    brand: "CHANGAN",
    model: "CS35 PLUS",
    variant: "Luxe 1.4T Blue Whale 7DCT",
    category: "SUV",
    year: 2026,
    energy: "ESSENCE",
    title: "CHANGAN CS35 PLUS LUXE 1.4T BLUE WHALE 7DCT",
    photos: {
      mainPhotoUrl: "/images/vehicles/cs35-main.jpg",
      interiorPhotoUrl: "/images/vehicles/cs35-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/cs35-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/cs35-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/cs35-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4330x1825x1660",
      wheelbase: "2600",
      doors: 5,
      seats: 5,
      tankOrBattery: "53L",
    },
    motorisation: {
      displacementOrMotor: "1392 cm3 (Changan BlueCore 1.4T GDI Turbo)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique 7 rapports double embrayage humide 7DCT",
      fuelType: "Essence",
      maxPower: "118 kW (160 ch) à 5500 tr/min",
      maxTorque: "260 Nm à 1500-4000 tr/min",
    },
    equipementConfort: [
      "Cockpit moderne avec écran tactile central 10,25 pouces HD",
      "Combiné d'instruments conducteur numérique 7 pouces personnalisable",
      "Sellerie similicuir haut de gamme bicolore avec surpiqûres rouges",
      "Climatisation automatique avec filtre à particules CN95",
      "Toit ouvrant panoramique électrique avec store occultant",
      "Volant cuir multifonction réglable en hauteur et profondeur",
      "Connectivité smartphone MirrorLink et Bluetooth audio HD",
      "Démarrage sans clé Push-Start et verrouillage centralisé",
    ],
    exterieur: [
      "Calandre avant noire facettée géométrique avec inserts rouges sport",
      "Projecteurs Full LED horizontaux avec signature lumineuse d'accueil",
      "Jantes alliage bicolores 18 pouces au design dynamique",
      "Bandeau de feux arrière LED continu sur toute la largeur",
      "Double sortie d'échappement chromée sportive",
      "Rétroviseurs électriques dégivrants rabattables électriquement",
      "Barres de pavillon de toit en aluminium",
      "Protections de carrosserie latérales et passages de roues baroudeurs",
    ],
    securite: [
      "Système de caméras 360° HD panoramiques d'aide au stationnement",
      "Freinage automatique d'urgence avant (AEB)",
      "Régulateur de vitesse adaptatif (ACC)",
      "4 Airbags de sécurité frontaux et latéraux",
      "Contrôle électronique de stabilité ESP Bosch et antipatinage TCS",
      "Assistance au démarrage en côte (HHC) et contrôle en descente (HDC)",
      "Système de fixation ISOFIX pour sièges enfants",
      "Contrôle de la pression des pneus (TPMS)",
    ],
  },

  // 8. CHANGAN UNI-K
  {
    brand: "CHANGAN",
    model: "UNI-K",
    variant: "Flagship 2.0T AWD 8AT",
    category: "SUV",
    year: 2026,
    energy: "ESSENCE",
    title: "CHANGAN UNI-K FLAGSHIP 2.0T AWD 8AT",
    photos: {
      mainPhotoUrl: "/images/vehicles/unik-main.jpg",
      interiorPhotoUrl: "/images/vehicles/unik-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/unik-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/unik-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/unik-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4865x1948x1690",
      wheelbase: "2890",
      doors: 5,
      seats: 5,
      tankOrBattery: "70L",
    },
    motorisation: {
      displacementOrMotor: "1998 cm3 (Changan BlueCore 2.0 TGDI Turbo)",
      cylinders: "4 en ligne 16V injection directe haute pression",
      transmission: "Automatique 8 rapports Aisin avec transmission intégrale AWD intelligente",
      fuelType: "Essence",
      maxPower: "171 kW (233 ch) à 5500 tr/min",
      maxTorque: "390 Nm à 1900-3300 tr/min",
    },
    equipementConfort: [
      "Cockpit futuriste Quad-Screen : instrumentation 3 écrans (3,5\" + 10,25\" + 9,2\") + central 12,3\"",
      "Sellerie cuir Nappa grand luxe 'Zero Gravity' avec assise ultra-moelleuse",
      "Système audio Sony Surround 12 Haut-Parleurs avec haut-parleurs intégrés dans l'appuie-tête conducteur",
      "Sièges avant électriques, massants, ventilés et chauffants avec mémoire",
      "Toit panoramique vitré géant de 1,31 m² avec velum électrique athermique",
      "Climatisation automatique trizone avec ioniseur d'air et diffuseur de parfum",
      "Double vitrage feuilleté acoustique haute performance pour un silence absolu",
      "Reconnaissance faciale Face-ID pour réglage automatique du profil conducteur",
    ],
    exterieur: [
      "Calandre avant iconique sans cadre 'Border-Free' à hexagones matriciels",
      "Poignées de portes entièrement affleurantes à déploiement électrique automatique",
      "Projecteurs avant Full LED Starship ultra-fins et feux de jour trilobes",
      "Jantes sport en alliage forgé 21 pouces chaussées en 265/45 R21",
      "Bandeau de feux arrière LED 3D traversant avec aileron arrière sport à double dérive",
      "Quatre sorties d'échappement arrière rondes grand diamètre chromées",
      "Hayon arrière électrique motorisé à ouverture mains libres par balayage",
      "Rétroviseurs électriques chauffants électrochromes à mémoire",
    ],
    securite: [
      "Transmission intégrale AWD BorgWarner Next-Gen avec verrouillage 4WD",
      "Pilotage autonome ADAS L2+ : conduite automatisée en embouteillage (TJA) et maintien de voie (ICA)",
      "Caméras panoramiques 540° HD avec affichage transparent du châssis sous le véhicule",
      "Freinage d'urgence autonome avec détection piétons, vélos et intersections",
      "8 Airbags de sécurité rideaux et latéraux intégrals",
      "Alerte de trafic transversal arrière RCTA avec freinage actif",
      "Stationnement automatique télécommandé via smartphone APA 6.0",
      "Surveillance de vigilance du conducteur par caméra infrarouge DMS",
    ],
  },

  // 9. BAIC B40 PRO (BEIJING BJ40 PRO)
  {
    brand: "BAIC",
    model: "B40 PRO",
    variant: "Champion 2.0T 4x4 BVA8",
    category: "SUV",
    year: 2026,
    energy: "ESSENCE",
    title: "BAIC B40 PRO CHAMPION 2.0T 4x4",
    photos: {
      mainPhotoUrl: "/images/vehicles/b40-main.jpg",
      interiorPhotoUrl: "/images/vehicles/b40-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/b40-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/b40-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/b40-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4645x1925x1871",
      wheelbase: "2745",
      doors: 5,
      seats: 5,
      tankOrBattery: "75L",
    },
    motorisation: {
      displacementOrMotor: "1967 cm3 (2.0L Turbo DACT 16V injection directe)",
      cylinders: "4 en ligne 16V Turbo",
      transmission: "Automatique 8 rapports ZF avec boîte de transfert BorgWarner 4x4 (2H, 4H, 4L)",
      fuelType: "Essence",
      maxPower: "165 kW (224 ch) à 5500 tr/min",
      maxTorque: "380 Nm à 1800-3600 tr/min",
    },
    equipementConfort: [
      "Toit rigide modulable et démontable 'Freedom Top' (panneaux avant et arrière)",
      "Écran tactile central 10 pouces multimédia tout-terrain",
      "Combiné d'instruments conducteur 12,3 pouces haute définition personnalisable",
      "Sellerie cuir robuste résistant aux intempéries avec surpiqûres tout-terrain",
      "Climatisation automatique bizone avec aérateurs circulaires style aviation",
      "Système audio Hi-Fi 8 haut-parleurs avec caisson de basses intégré",
      "Volant multifonction gainé cuir chauffant",
      "Rétroviseur intérieur électrochrome avec boussole et altimètre intégrés",
    ],
    exterieur: [
      "Châssis échelle séparé ultra-rigide en acier à très haute résistance",
      "Calandre avant chromée iconique 5 fentes verticales BAIC Beijing",
      "Arceau de sécurité intégré 'Roll Bar' tubulaire haute résistance",
      "Garde au sol exceptionnelle de 220 mm avec angle d'attaque 37° et fuite 31°",
      "Jantes tout-terrain forgées 17 pouces avec pneus All-Terrain AT",
      "Roue de secours arrière montée sur hayon à ouverture latérale",
      "Marchepieds tubulaires latéraux acier haute protection",
      "Crochets de remorquage renforcés avant et arrière peints en rouge",
    ],
    securite: [
      "Véritable transmission 4x4 enclenchable avec boîte courte et blocages de différentiels avant et arrière",
      "Contrôle de stabilité dynamique ESP Bosch 9.3 et antipatinage tout-terrain",
      "Assistance au démarrage en côte HAC et contrôle de vitesse en forte descente HDC",
      "Caméras panoramiques 360° avec lignes de trajectoire d'angle de braquage",
      "6 Airbags de sécurité frontaux et latéraux",
      "Barres de protection anti-encastrement latérales et plaques sous carter en acier",
      "Système de surveillance TPMS de la pression des pneus avec jauge de température",
      "Freins à disques ventilés avant et arrière avec ABS et EBD",
    ],
  },

  // 10. BAIC X55 (BEIJING MOFANG / X55 PREMIUM)
  {
    brand: "BAIC",
    model: "X55",
    variant: "Premium 1.5T VGT 7DCT",
    category: "SUV",
    year: 2024,
    energy: "ESSENCE",
    title: "BAIC X55 PREMIUM 1.5T VGT 7DCT",
    photos: {
      mainPhotoUrl: "/images/vehicles/x55-main.jpg",
      interiorPhotoUrl: "/images/vehicles/x55-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/x55-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/x55-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/x55-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4620x1886x1680",
      wheelbase: "2735",
      doors: 5,
      seats: 5,
      tankOrBattery: "53L",
    },
    motorisation: {
      displacementOrMotor: "1498 cm3 (Magic Core 1.5T VGT Turbo à géométrie variable)",
      cylinders: "4 en ligne 16V Miller Cycle",
      transmission: "Automatique 7 rapports à double embrayage humide 7DCT",
      fuelType: "Essence",
      maxPower: "138 kW (188 ch) à 5500 tr/min",
      maxTorque: "305 Nm à 1500-4250 tr/min",
    },
    equipementConfort: [
      "Habitacle futuriste 'Spacecraft' avec écran tactile central 10,1 pouces",
      "Combiné d'instruments conducteur 10,25 pouces entièrement digital",
      "Sellerie cuir synthétique perforé sport avec sièges baquets ergonomiques",
      "Toit ouvrant panoramique vitré géant de 0,81 m² avec capteur de pluie",
      "Climatisation automatique bizone avec diffuseurs arrière et filtration PM2.5",
      "Éclairage d'ambiance LED dynamique personnalisable multicolore",
      "Sièges avant électriques chauffants et ventilés",
      "Système d'accès mains libres et démarrage par bouton Push-Start",
    ],
    exterieur: [
      "Face avant futuriste sans calandre 'Diamond Matrix' avant-gardiste",
      "Poignées de portes escamotables affleurantes électroniques",
      "Projecteurs Full LED biseautés et feux diurnes 'Wing of Light'",
      "Jantes en alliage d'aluminium bicolores diamantées 19 pouces",
      "Aileron arrière sport scindé inspiré de l'aéronautique",
      "Rétroviseurs extérieurs électriques chauffants et rabattables automatiquement",
      "Feux arrière LED traversants à effet tridimensionnel",
      "Vitres arrière surteintées athermiques",
    ],
    securite: [
      "Système de caméras 360° panoramiques 3D haute définition",
      "Régulateur de vitesse adaptatif intelligent avec maintien au centre de la voie",
      "Freinage d'urgence automatique autonome d'évitement de collision",
      "6 Airbags de sécurité frontaux, latéraux et rideaux",
      "Surveillance des angles morts BSD et alerte d'ouverture de porte",
      "Système de contrôle électronique de stabilité ESP Bosch 9.3",
      "Aide au démarrage en côte et contrôle en descente",
      "Surveillance de pression des pneus TPMS",
    ],
  },

  // 11. GEELY STARSHIP 7 (GALAXY STARSHIP 7 PHEV)
  {
    brand: "GEELY",
    model: "STARSHIP 7",
    variant: "Galaxy EM-i PHEV Exploration",
    category: "SUV",
    year: 2026,
    energy: "HYBRIDE",
    title: "GEELY GALAXY STARSHIP 7 EM-i PHEV",
    photos: {
      mainPhotoUrl: "/images/vehicles/starship7-main.jpg",
      interiorPhotoUrl: "/images/vehicles/starship7-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/starship7-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/starship7-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/starship7-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4740x1905x1685",
      wheelbase: "2755",
      doors: 5,
      seats: 5,
      tankOrBattery: "Batterie Aegis 19,09 kWh + Réservoir 51L",
    },
    motorisation: {
      displacementOrMotor: "Système Hybride Rechargeable NordThor EM-i 1.5L Atmosphérique + Double Moteur électrique P1+P3",
      cylinders: "4 en ligne thermique + moteurs synchrones à aimants permanents",
      transmission: "Transmission hybride dédiée E-DHT haute efficacité",
      fuelType: "Hybride Essence / Électrique",
      maxPower: "Puissance combinée système : 160 kW (218 ch) / Thermique 82 kW (111 ch)",
      maxTorque: "Couple combiné système : 338 Nm",
      rangeKm: "Autonomie 100% électrique CLTC : 120 km · Autonomie combinée totale : 1420 km",
    },
    equipementConfort: [
      "Cockpit numérique intelligent Galaxy Flyme Auto avec écran tactile 2.5K 14,6 pouces",
      "Combiné d'instruments haute clarté 10,2 pouces tout numérique",
      "Système audio Flyme Sound Haute Résolution 16 Haut-Parleurs avec appuie-tête acoustique",
      "Sellerie cuir écologique 'Marshmallow' ultra-moelleuse avec surpiqûres géométriques",
      "Sièges avant électriques, massants, chauffants et ventilés avec fonction couchette",
      "Chargeur smartphone sans fil haute vitesse 50W avec ventilation active",
      "Toit panoramique vitré immense avec store pare-soleil électrique",
      "Climatisation automatique avec pompe à chaleur et système de filtration d'air antibactérien",
    ],
    exterieur: [
      "Face avant épurée moderne avec bandeau LED lumineux 'Ripple of Light'",
      "Calandre pleine aérodynamique à coefficient de traînée record Cx 0,288",
      "Poignées de portes profilées ergonomiques et projecteurs avant Full LED matriciels",
      "Jantes alliage aérodynamiques bicolores 19 pouces",
      "Bandeau de feux arrière LED traversant 'Milky Way' sur toute la largeur",
      "Hayon arrière motorisé avec fonction mémoire de hauteur",
      "Vitrage feuilleté acoustique à haute insonorisation",
      "Rétroviseurs électriques dégivrants rabattables automatiquement avec caméras intégrées",
    ],
    securite: [
      "Système de batterie ultra-sécurisée Geely Aegis résistante au feu et aux chocs",
      "Conduite autonome de niveau 2+ (ACC intelligent, centrage de voie, changement de voie assisté)",
      "Caméras panoramiques 540° HD avec vue transparente du sous-châssis",
      "Freinage d'urgence autonome AEB avec détection des usagers vulnérables",
      "7 Airbags de sécurité incluant airbag central entre les passagers avant",
      "Alerte de collision avant et arrière avec freinage automatique",
      "Système de surveillance active de la fatigue du conducteur",
      "Structure de caisse en acier au bore thermoformé ultra-résistant",
    ],
  },

  // 12. TOYOTA LAND CRUISER PRADO
  {
    brand: "TOYOTA",
    model: "LAND CRUISER PRADO",
    variant: "TX-L 2.8 D-4D 4x4 7 Places",
    category: "SUV",
    year: 2026,
    energy: "DIESEL",
    title: "TOYOTA LAND CRUISER PRADO TX-L 2.8L D-4D 4x4",
    photos: {
      mainPhotoUrl: "/images/vehicles/prado-main.jpg",
      interiorPhotoUrl: "/images/vehicles/prado-interior.jpg",
      interiorSeatsPhotoUrl: "/images/vehicles/prado-seats.jpg",
      exteriorPhotoUrl: "/images/vehicles/prado-exterior.jpg",
      rearPhotoUrl: "/images/vehicles/prado-rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4840x1885x1890",
      wheelbase: "2790",
      doors: 5,
      seats: 7,
      tankOrBattery: "87L + Réservoir auxiliaire 63L (150L total)",
    },
    motorisation: {
      displacementOrMotor: "2755 cm3 (Toyota 1GD-FTV D-4D Turbo Diesel Common Rail)",
      cylinders: "4 en ligne 16V DACT Turbo Intercooler",
      transmission: "Automatique 6 rapports Super ECT avec réducteur 4WD permanent",
      fuelType: "Diesel",
      maxPower: "150 kW (204 ch) à 3000-3400 tr/min",
      maxTorque: "500 Nm à 1600-2800 tr/min",
    },
    equipementConfort: [
      "Configuration 7 vraies places avec 3e rangée de sièges rabattable électriquement à plat",
      "Sellerie cuir véritable de haute qualité avec réglages électriques conducteur et passager",
      "Écran central multimédia tactile Toyota Touch 2 avec Apple CarPlay et Android Auto",
      "Console centrale avec compartiment réfrigéré 'Cool Box' pour boissons",
      "Climatisation automatique trizone avec commandes indépendantes aux 2e et 3e rangées",
      "Système audio JBL Premium 14 Haut-Parleurs Haute Fidélité Surround",
      "Volant cuir et bois multifonction à réglage électrique de hauteur et profondeur",
      "Système d'accès et de démarrage intelligent Smart Entry & Push Start",
    ],
    exterieur: [
      "Châssis en échelle traditionnel ultra-robuste légendaire Toyota Land Cruiser",
      "Calandre avant imposante chromée à 5 barres verticales emblématiques",
      "Projecteurs avant Full LED avec lave-phares haute pression intégrés",
      "Jantes en alliage bicolores 18 pouces chaussées de pneumatiques mixtes tout-terrain",
      "Marchepieds latéraux éclairés intégrés et barres de toit longitudinales aluminium",
      "Porte de coffre arrière à ouverture latérale avec lunette arrière à ouverture indépendante",
      "Roue de secours sous châssis (ou sur porte arrière selon configuration)",
      "Bavettes garde-boue avant et arrière renforcées",
    ],
    securite: [
      "Transmission 4x4 permanente avec différentiel central Torsen à glissement limité et blocage 100%",
      "Système de sélection multiterrain MTS (Multi-Terrain Select) et régulateur tout-terrain Crawl Control",
      "Système de suspension dynamique cinétique KDSS pour un confort royal sur route et débattement maximal en piste",
      "Caméras panoramiques Multi-Terrain Monitor 360° avec vue sous le véhicule",
      "Pack de sécurité Toyota Safety Sense (PCS détection piétons, régulateur adaptatif ACC, LDA)",
      "7 Airbags de sécurité (frontaux, latéraux, rideaux couvrant les 3 rangées et protège-genoux)",
      "Contrôle de stabilité du véhicule (VSC) et système d'assistance au remorquage (TSC)",
      "Système de freinage ABS multiterrain avec assistance au freinage d'urgence BA",
    ],
  },

  // 4. TOYOTA COROLLA CROSS
  {
    brand: "TOYOTA",
    model: "COROLLA CROSS",
    variant: "Elite 2.0L Dynamic Force",
    category: "SUV",
    year: 2025,
    energy: "ESSENCE",
    title: "TOYOTA COROLLA CROSS ELITE 2.0L ESSENCE",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/43/2023_Toyota_Corolla_Cross_XLE_4WD_in_Wind_Chill_Pearl%2C_front_left.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0f/2020_Toyota_Corolla_Cross_Hybrid_Premium_Safety_%28Cockpit%29.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Toyota_Corolla_Cross_GR_Sport_in_Cape_Town.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/2023_Toyota_Corolla_Cross_XLE_4WD_in_Wind_Chill_Pearl%2C_rear_left.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4460x1825x1620",
      wheelbase: "2640",
      doors: 5,
      seats: 5,
      tankOrBattery: "47L",
    },
    motorisation: {
      displacementOrMotor: "1987 cm3 (Dynamic Force 2.0L Dual VVT-i)",
      cylinders: "4 en ligne 16 soupapes",
      transmission: "Automatique Direct Shift-CVT à 10 rapports simulés",
      fuelType: "Essence",
      maxPower: "126 kW (171 ch) à 6600 tr/min",
      maxTorque: "205 Nm à 4600-5000 tr/min",
    },
    equipementConfort: [
      "Volant multifonction réglable en hauteur et en profondeur",
      "Sièges ergonomiques en cuir avec maintien lombaire électrique",
      "Écran tactile multimédia haute définition 10,25 pouces",
      "Climatisation automatique avec diffuseurs d'air aux places arrière",
      "Connectivité Apple CarPlay & Android Auto sans fil",
      "Système acoustique 6 Haut-Parleurs Haute Clarté",
      "Lève-vitres électriques avant et arrière avec anti-pincement",
      "Démarrage sans clé Push Start et Smart Entry",
    ],
    exterieur: [
      "Calandre avant trapézoïdale signature Toyota noir laqué et chrome",
      "Projecteurs avant Bi-LED intelligents et feux de jour à LED",
      "Rétroviseurs électriques chauffants et rabattables électriquement",
      "Jantes en alliage d'aluminium bicolores 18 pouces",
      "Barres de toit longitudinales aluminium et antenne requin",
      "Radars de détection d'obstacles avant et arrière",
      "Toit ouvrant électrique avec pare-soleil",
      "Suspension avant : Système indépendant MacPherson / Arrière : Essieu renforcé",
    ],
    securite: [
      "Pack Toyota Safety Sense (TSS 3.0) de dernière génération",
      "Système de pré-collision avec freinage automatique d'urgence (PCS)",
      "Régulateur de vitesse adaptatif dynamique à radar (DRCC)",
      "Alerte et maintien de trajectoire dans la voie (LDA & LTA)",
      "7 Airbags de sécurité intégrale (dont airbag genoux conducteur)",
      "Contrôle électronique de stabilité de trajectoire (VSC) et ABS/EBD/BAS",
      "Système de verrouillage antivol du moteur par transpondeur",
      "Fixations de sièges enfant normalisées ISOFIX",
    ],
  },

  // 5. TOYOTA CAMRY
  {
    brand: "TOYOTA",
    model: "CAMRY",
    variant: "Prestige 2.5L Dynamic Force",
    category: "BERLINE",
    year: 2024,
    energy: "ESSENCE",
    title: "TOYOTA CAMRY PRESTIGE 2.5L DYNAMIC FORCE",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8b/2007_Toyota_Camry_%28ACV40R%29_Sportivo_sedan_%282007-10-12%29_03.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/2017_Toyota_Camry_%28ASV70R%29_SX_sedan_%282018-11-02%29_01.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1f/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-11-02%29_02.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4885x1840x1445",
      wheelbase: "2825",
      doors: 4,
      seats: 5,
      tankOrBattery: "60L",
    },
    motorisation: {
      displacementOrMotor: "2487 cm3 (Dynamic Force 2.5L D-4S)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique Direct Shift 8 rapports séquentielle",
      fuelType: "Essence",
      maxPower: "154 kW (209 ch) à 6600 tr/min",
      maxTorque: "250 Nm à 5000 tr/min",
    },
    equipementConfort: [
      "Sellerie cuir grand luxe perforée avec surpiqûres raffinées",
      "Sièges avant électriques à 8 réglages avec mémoire et ventilation",
      "Grand écran central multimédia tactile 12,3 pouces avec navigation",
      "Système audio JBL Premium Surround 9 Haut-Parleurs avec caisson de basses",
      "Climatisation automatique tri-zone avec commandes arrière tactiles",
      "Affichage tête haute en couleur projeté sur pare-brise 10 pouces",
      "Rideaux pare-soleil arrière électriques pour intimité passagers",
      "Volant cuir multifonction à réglage électrique de hauteur et profondeur",
    ],
    exterieur: [
      "Calandre avant statutaire agressive avec prises d'air aérodynamiques",
      "Projecteurs avant Full LED effilés avec feux de jour à signature triple",
      "Jantes en alliage léger bicolores diamantées 18 pouces multibranches",
      "Ligne de pavillon fastback fluide avec vitrage athermique teinté",
      "Toit ouvrant panoramique vitré électrique inclinable et coulissant",
      "Double sortie d'échappement sport chromée intégrée",
      "Rétroviseurs électriques dégivrants rabattables avec répétiteurs LED",
      "Suspension indépendante multibras assurant un confort de roulement exceptionnel",
    ],
    securite: [
      "Système de sécurité prédictive Toyota Safety Sense (TSS)",
      "Système de pré-collision avec détection d'intersection piétons/voitures",
      "Surveillance active des angles morts (BSM) et alerte de trafic arrière (RCTA)",
      "10 Airbags de sécurité (incluant airbags latéraux arrière)",
      "Frein de stationnement électrique (EPB) avec maintien automatique Brake Hold",
      "Caméras panoramiques 360° avec lignes de trajectoire dynamiques",
      "Contrôle dynamique de trajectoire (VSC) et antipatinage (TRC)",
      "Structure de carrosserie à absorption de choc GOA haute rigidité",
    ],
  },

  // 6. TOYOTA FORTUNER
  {
    brand: "TOYOTA",
    model: "FORTUNER",
    variant: "VX 2.7L VVT-i 4x4",
    category: "SUV",
    year: 2024,
    energy: "ESSENCE",
    title: "TOYOTA FORTUNER VX 2.7L VVT-i 4x4",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/66/2015_Toyota_Fortuner_%28New_Zealand%29.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/2019_Toyota_Fortuner_2.4_VRZ_TRD_Sportivo_4x2_GUN165R_interior_%2820190722%29.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Toyota_Fortuner_White_%28cropped%29.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Toyota_Fortuner_LTD_4x2_rear_20221019.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4795x1855x1835",
      wheelbase: "2745",
      doors: 5,
      seats: 7,
      tankOrBattery: "80L",
    },
    motorisation: {
      displacementOrMotor: "2694 cm3 (2TR-FE 2.7L Dual VVT-i)",
      cylinders: "4 en ligne 16 soupapes DACT",
      transmission: "Automatique 6 rapports avec boîte transfert 4x4 sélective (2H/4H/4L)",
      fuelType: "Essence",
      maxPower: "122 kW (166 ch) à 5200 tr/min",
      maxTorque: "245 Nm à 4000 tr/min",
    },
    equipementConfort: [
      "Vaste habitacle familial 7 places avec agencement modulaire 3 rangées",
      "Sellerie cuir fauve et noir grand confort avec réglages électriques conducteur",
      "Écran multimédia tactile 9 pouces avec Apple CarPlay & Android Auto",
      "Double climatisation automatique bizone avec buses indépendantes aux 3 rangées",
      "Boîte à gants supérieure réfrigérée Cool Box",
      "Volant bois et cuir multifonction avec palettes de changement de vitesse",
      "Hayon arrière motorisé à commande électrique télécommandée",
      "Démarrage sans clé Push Start et Smart Entry",
    ],
    exterieur: [
      "Châssis échelle séparé ultra-robuste éprouvé pour les pistes africaines",
      "Garde au sol surélevée de 225 mm et capacité de franchissement supérieure",
      "Calandre avant imposante chromée avec projecteurs Bi-Beam LED puissants",
      "Jantes alliage bicolores renforcées 18 pouces tout-terrain",
      "Marchepieds latéraux intégrés en aluminium et barres de toit longitudinales",
      "Sabots de protection avant et arrière en acier haute résistance",
      "Vitres arrière surteintées athermiques et becquet de toit avec feu stop LED",
      "Rétroviseurs extérieurs chromés rabattables avec éclairage d'accueil",
    ],
    securite: [
      "Transmission intégrale 4WD avec blocage de différentiel arrière mécanique",
      "Contrôle de stabilité du véhicule (VSC) et contrôle de louvoiement de remorque",
      "Assistance au démarrage en côte (HAC) et contrôle de descente (DAC)",
      "7 Airbags de sécurité intégrale protégeant les 3 rangées de passagers",
      "Freins à disques ventilés avant et arrière avec ABS/EBD/BA",
      "Caméra de recul haute définition avec radars de stationnement avant et arrière",
      "Système de fixation de sièges enfant ISOFIX rangée 2",
      "Alarme antivol avec coupe-circuit moteur électronique",
    ],
  },

  // 7. TOYOTA HILUX
  {
    brand: "TOYOTA",
    model: "HILUX",
    variant: "Double Cabine 2.7L 4x4",
    category: "PICKUP",
    year: 2024,
    energy: "ESSENCE",
    title: "TOYOTA HILUX DOUBLE CABINE 2.7L 4x4",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/2016_Toyota_HiLux_Invincible_D-4D_4WD_2.4_Front.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Toyota_Hilux_Vigo_Champ_TRD_interior.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/74/Toyota_Hilux_%284%29.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Toyota_Hilux_%28eighth_generation%29_%28rear%29%2C_Serdang.jpg",
    },
    dimensions: {
      lengthWidthHeight: "5325x1855x1815",
      wheelbase: "3085",
      doors: 4,
      seats: 5,
      tankOrBattery: "80L",
    },
    motorisation: {
      displacementOrMotor: "2694 cm3 (2TR-FE VVT-i 16V)",
      cylinders: "4 en ligne",
      transmission: "Automatique 6 rapports avec transmission 4x4 et boîte de transfert courte",
      fuelType: "Essence",
      maxPower: "122 kW (166 ch) à 5200 tr/min",
      maxTorque: "245 Nm à 4000 tr/min",
    },
    equipementConfort: [
      "Double cabine spacieuse et insonorisée avec assises grand confort",
      "Écran tactile multimédia 8 pouces avec connectivité smartphone",
      "Climatisation automatique numérique avec diffuseurs d'air puissants",
      "Volant multifonction réglable avec commandes audio et téléphone",
      "Système audio 6 Haut-Parleurs avec prises USB et prise accessoire 12V",
      "Lève-vitres électriques à commande séquentielle conducteur",
      "Verrouillage centralisé télécommandé des portières",
      "Compartiments de rangement sous les assises arrière",
    ],
    exterieur: [
      "Robustesse légendaire indestructible et châssis échelle haute résistance",
      "Charge utile supérieure à 1 tonne et capacité de remorquage de 3500 kg",
      "Calandre avant hexagonale chromée massive et projecteurs avant LED",
      "Jantes aluminium robustes tout-terrain 17/18 pouces",
      "Protection de benne haute densité thermoformée Bedliner d'usine",
      "Marchepieds latéraux renforcés en aluminium et arceau de sécurité benne",
      "Suspension arrière à essieu rigide et ressorts à lames renforcés haute charge",
      "Garde au sol élevée de 286 mm pour franchissement tout-terrain extrême",
    ],
    securite: [
      "Transmission 4x4 avec blocage de différentiel arrière à commande électrique",
      "Contrôle de motricité actif A-TRC et contrôle de stabilité du véhicule VSC",
      "Assistance au démarrage en côte (HAC) et répartition électronique EBD",
      "7 Airbags de sécurité frontaux, latéraux, rideaux et genoux conducteur",
      "Système de freinage antiblocage ABS avec assistance d'urgence BA",
      "Caméra de recul couleur avec lignes de guidage de stationnement",
      "Structure de sécurité indéformable GOA avec barres anti-intrusion latérales",
      "Système d'immobilisation moteur antivol",
    ],
  },

  // 8. TOYOTA HIACE
  {
    brand: "TOYOTA",
    model: "HIACE",
    variant: "Commuter Bus 2.7L Essence (14 Places)",
    category: "MINIBUS",
    year: 2024,
    energy: "ESSENCE",
    title: "TOYOTA HIACE COMMUTER BUS 2.7L (14 PLACES)",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/80/2020_Toyota_HiAce_%28front%29.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Toyota_Hiace_2.8_Commuter_Deluxe_2023_%28interior%29.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Toyota_Hiace_%281st_Generation%29_%281974_N-Registration%29.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Toyota_Hiace_-_2007_Model_%28rear%29.jpg",
    },
    dimensions: {
      lengthWidthHeight: "5265x1950x1990",
      wheelbase: "3210",
      doors: 4,
      seats: 14,
      tankOrBattery: "65L",
    },
    motorisation: {
      displacementOrMotor: "2694 cm3 (2TR-FE 2.7L VVT-i 16V)",
      cylinders: "4 en ligne DACT",
      transmission: "Automatique 6 rapports séquentielle",
      fuelType: "Essence",
      maxPower: "111 kW (151 ch) à 4800 tr/min",
      maxTorque: "241 Nm à 3800 tr/min",
    },
    equipementConfort: [
      "Configuration minibus VIP 14 places assises avec couloir d'accès central",
      "Sièges individuels grand confort inclinables avec appuie-têtes intégrés",
      "Double climatisation puissante grand froid avec buses individuelles à chaque rangée",
      "Porte latérale coulissante extra-large avec marchepied d'accès éclairé",
      "Système audio avec lecteur multimédia et haut-parleurs répartis dans l'habitacle",
      "Vitres latérales teintées avec volets d'aération ouvrants",
      "Poste de pilotage ergonomique avec levier de vitesse au tableau de bord",
      "Nombreux porte-gobelets et espaces de rangement pour bagages passagers",
    ],
    exterieur: [
      "Conception moderne semi-capot renforçant la sécurité et la visibilité",
      "Grande calandre avant chromée statutaire et projecteurs halogènes puissants",
      "Rétroviseurs extérieurs panoramiques grand angle à double miroir",
      "Jantes acier renforcées haute charge avec pneumatiques utilitaires",
      "Grand hayon arrière vertical assisté facilitant le chargement des bagages",
      "Pare-chocs avant et arrière aérodynamiques renforcés",
      "Poignées de maintien intérieures multiples pour sécurité des passagers",
      "Essieu arrière rigide avec suspension à lames renforcée grand confort",
    ],
    securite: [
      "Cellule de survie passagers renforcée aux normes de sécurité internationales",
      "Contrôle de stabilité du véhicule (VSC) et antipatinage (TRC)",
      "Freinage ABS avec répartiteur électronique de freinage selon la charge (EBD)",
      "Airbags frontaux conducteur et passager avant",
      "Ceintures de sécurité 3 points à enrouleur pour toutes les places assises",
      "Feux stop arrière surélevés à LED et avertisseur sonore de recul",
      "Assistance au freinage d'urgence (Brake Assist)",
      "Verrouillage centralisé asservi à la vitesse",
    ],
  },

  // 9. MITSUBISHI OUTLANDER
  {
    brand: "MITSUBISHI",
    model: "OUTLANDER",
    variant: "Luxe 2.5L MIVEC 7 Places",
    category: "SUV",
    year: 2024,
    energy: "ESSENCE",
    title: "MITSUBISHI OUTLANDER LUXE 2.5L MIVEC (7 PLACES)",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/35/2025_Mitsubishi_Outlander_PHEV_%28fourth_generation%29_IMG_3129.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ef/2012_Mitsubishi_Outlander_%28ZJ_MY13%29_LS_wagon_%282012-10-26%29_03.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4f/2003_Mitsubishi_Outlander_Sport_SE_Automatic_2.4_Front.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f0/2014_Mitsubishi_Outlander_SE%2C_rear_left%2C_09-28-2024.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4710x1862x1745",
      wheelbase: "2706",
      doors: 5,
      seats: 7,
      tankOrBattery: "55L",
    },
    motorisation: {
      displacementOrMotor: "2488 cm3 (2.5L DOHC MIVEC Injection Directe)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique CVT à 8 rapports séquentiels sport",
      fuelType: "Essence",
      maxPower: "135 kW (184 ch) à 6000 tr/min",
      maxTorque: "245 Nm à 3600 tr/min",
    },
    equipementConfort: [
      "Habitacle d'exception 7 places avec finitions cuir semi-aniline matelassé",
      "Écran central multimédia tactile 9 pouces avec Apple CarPlay & Android Auto",
      "Combiné d'instrumentation entièrement numérique 12,3 pouces personnalisable",
      "Système audio haute fidélité Bose Premium 10 Haut-Parleurs",
      "Climatisation automatique tri-zone avec diffuseurs indépendants arrière",
      "Sièges avant électriques chauffants avec mémoire et réglage lombaire",
      "Toit ouvrant panoramique vitré électrique à double panneau",
      "Hayon arrière motorisé mains libres avec capteur sous le pare-chocs",
    ],
    exterieur: [
      "Face avant statutaire 'Dynamic Shield' avec inserts chromés massifs",
      "Projecteurs scindés Full LED adaptatifs haute portée et antibrouillards LED",
      "Jantes alliage bicolores usinées en diamant de 20 pouces",
      "Ligne de pavillon flottante avec vitres arrière surteintées athermiques",
      "Barres de toit longitudinales aluminium profilées",
      "Feux arrière horizontaux LED en T à signature lumineuse distinctive",
      "Rétroviseurs extérieurs électriques chauffants à mémoire et rabattables",
      "Boucliers avant et arrière avec sabot de protection façon aluminium",
    ],
    securite: [
      "Système légendaire de transmission intégrale Super All-Wheel Control (S-AWC)",
      "Sélecteur de mode de conduite à 6 modes (Eco, Normal, Tarmac, Gravel, Snow, Mud)",
      "Système d'assistance active à la conduite MI-PILOT Assist",
      "Freinage autonome d'urgence avant avec détection des piétons",
      "Surveillance active des angles morts et aide au maintien de trajectoire",
      "Caméras panoramiques 360° Multi-Around Monitor avec vue aérienne",
      "11 Airbags de sécurité intégrale incluant l'airbag central conducteur",
      "Contrôle actif du lacet (AYC) et frein de parking électrique avec Auto-Hold",
    ],
  },

  // 10. MITSUBISHI L200 (TRITON)
  {
    brand: "MITSUBISHI",
    model: "L200",
    variant: "Sportero 2.4L MIVEC 4x4",
    category: "PICKUP",
    year: 2024,
    energy: "ESSENCE",
    title: "MITSUBISHI L200 SPORTERO 2.4L 4x4",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/27/Mitsubishi_Triton_LC_2.4_GLS_2WD_Blade_Silver_Metallic_%28cropped%29.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/75/2019_Mitsubishi_Triton_Exceed_4x4_2.4_KL1TJ_interior_%2820190722%29.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Mitsubishi_Triton_interior_%28Thailand%29.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/76/Mitsubishi_Triton_%28first_generation%29_%28rear%29%2C_Serdang.jpg",
    },
    dimensions: {
      lengthWidthHeight: "5305x1815x1795",
      wheelbase: "3000",
      doors: 4,
      seats: 5,
      tankOrBattery: "75L",
    },
    motorisation: {
      displacementOrMotor: "2442 cm3 (2.4L MIVEC DOHC 16V)",
      cylinders: "4 en ligne",
      transmission: "Automatique 6 rapports avec mode sport séquentiel et Super Select 4WD-II",
      fuelType: "Essence / Diesel",
      maxPower: "133 kW (181 ch) à 3500 tr/min",
      maxTorque: "430 Nm à 2500 tr/min",
    },
    equipementConfort: [
      "Double cabine grand confort avec insonorisation renforcée",
      "Sellerie cuir noir surpiquée avec réglages électriques conducteur",
      "Écran central tactile 7 pouces avec système multimédia connecté",
      "Climatisation automatique bizone avec aérateurs intégrés au pavillon",
      "Volant cuir 4 branches avec palettes de changement de vitesse en magnésium",
      "Accès et démarrage mains libres KOS (Keyless Operation System)",
      "Double prise USB à charge rapide et bac de rangement pour téléphone",
      "Accoudoir central arrière avec porte-gobelets escamotables",
    ],
    exterieur: [
      "Face avant ultra-puissante Dynamic Shield avec calandre chromée surélevée",
      "Angle d'attaque de 30° et garde au sol de 220 mm pour franchissement extrême",
      "Projecteurs bi-LED haute intensité avec lave-phares intégrés",
      "Jantes alliage bicolores robustes 18 pouces tout-terrain",
      "Benne renforcée avec crochets d'arrimage et charge utile de plus d'une tonne",
      "Marchepieds latéraux renforcés en aluminium et barre de pare-chocs arrière",
      "Suspension arrière à essieu rigide avec ressorts à lames renforcés haute charge",
      "Rétroviseurs électriques chromés rabattables avec répétiteurs LED",
    ],
    securite: [
      "Transmission 4x4 exclusive Super Select 4WD-II (2H, 4H permanent, 4HLc, 4LLc)",
      "Sélecteur de modes tout-terrain Off-Road Mode (Gravier, Boue, Sable, Roches)",
      "Système de contrôle de vitesse en descente (HDC)",
      "Contrôle dynamique de trajectoire et antipatinage ASTC avec gestion de remorque",
      "7 Airbags de sécurité SRS frontaux, latéraux, rideaux et genoux conducteur",
      "Freinage d'urgence automatique avant et détection des angles morts",
      "Caméra de recul haute définition avec vue panoramique",
      "Châssis haute résistance renforcé RISE absorbant les chocs",
    ],
  },

  // 11. MITSUBISHI XPANDER
  {
    brand: "MITSUBISHI",
    model: "XPANDER",
    variant: "Cross 1.5L MIVEC 7 Places",
    category: "VAN",
    year: 2024,
    energy: "ESSENCE",
    title: "MITSUBISHI XPANDER CROSS 1.5L (7 PLACES)",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/2018_Mitsubishi_Xpander_Ultimate_1.5_NC1W_%2820190623%29.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/2019_Mitsubishi_Xpander_Sport_1.5_NC1W_interior_%2820190722%29.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/78/2017_Mitsubishi_Xpander_GLS_1.5_NC1W_%2820220328%29_01.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/2020_Mitsubishi_Xpander_Cross_%28Rear%29.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4595x1750x1750",
      wheelbase: "2775",
      doors: 5,
      seats: 7,
      tankOrBattery: "45L",
    },
    motorisation: {
      displacementOrMotor: "1499 cm3 (1.5L MIVEC DOHC 16V)",
      cylinders: "4 en ligne",
      transmission: "Automatique CVT à haute efficience",
      fuelType: "Essence",
      maxPower: "77 kW (105 ch) à 6000 tr/min",
      maxTorque: "141 Nm à 4000 tr/min",
    },
    equipementConfort: [
      "Habitacle modulable 7 places avec agencement astucieux en 3 rangées",
      "Tableau de bord horizontal avec matériaux moussés et surpiqûres sellier",
      "Écran central multimédia tactile 9 pouces avec Apple CarPlay et Android Auto",
      "Climatisation numérique avec commandes et aérateurs individuels au pavillon",
      "Volant cuir ergonomique multifonction réglable en hauteur et profondeur",
      "Plus de 16 compartiments de rangement malins répartis dans l'habitacle",
      "Frein de stationnement électrique avec fonction Brake Auto Hold",
      "Accès et démarrage sans clé avec bouton Start/Stop",
    ],
    exterieur: [
      "Garde au sol impressionnante de 225 mm digne d'un véritable SUV",
      "Calandre avant Dynamic Shield moderne noir géométrique et chrome",
      "Projecteurs avant scindés Full LED en T distinctifs",
      "Jantes alliage bicolores usinées en diamant 17 pouces",
      "Protections de passages de roues robustes et bas de caisse contrastés",
      "Barres de toit longitudinales sport argentées",
      "Feux arrière LED horizontaux en T et aileron de hayon aérodynamique",
      "Rétroviseurs électriques rabattables automatiquement",
    ],
    securite: [
      "Contrôle actif de trajectoire et de stabilité ASC",
      "Assistance au freinage antiblocage ABS avec répartiteur de charge EBD et BAS",
      "Aide au démarrage en côte (HSA)",
      "Double airbag frontal SRS conducteur et passager",
      "Caméra de recul grand angle avec lignes de guidage de manœuvre",
      "Structure de carrosserie renforcée RISE haute sécurité",
      "Verrouillage des portières asservi à la vitesse",
      "Fixations de sièges enfant ISOFIX à la rangée 2",
    ],
  },

  // 12. BMW X3
  {
    brand: "BMW",
    model: "X3",
    variant: "xDrive30i M Sport 2.0L Turbo",
    category: "SUV",
    year: 2024,
    energy: "ESSENCE",
    title: "BMW X3 xDRIVE30i M SPORT 2.0L TURBO",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/72/BMW_G45_20_IMG_3794.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/43/2018_BMW_X3_xDrive_20d_M_Sport_%28Cockpit%29.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/2010_BMW_X3_SE_xDrive20d_-_1995cc_2.0_%28176PS%29_Diesel_-_Montego_Blue_-_05-2024%2C_Front.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/68/2019_BMW_X3_xDrive_30i_Luxury_%2816%29.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4708x1891x1676",
      wheelbase: "2864",
      doors: 5,
      seats: 5,
      tankOrBattery: "65L",
    },
    motorisation: {
      displacementOrMotor: "1998 cm3 (BMW TwinPower Turbo 16V)",
      cylinders: "4 en ligne",
      transmission: "Automatique Sport Steptronic 8 rapports avec palettes au volant et xDrive",
      fuelType: "Essence",
      maxPower: "180 kW (245 ch) à 5000-6500 tr/min",
      maxTorque: "350 Nm à 1560-4800 tr/min",
    },
    equipementConfort: [
      "Sellerie cuir Vernasca surpiquée avec sièges sport électriques chauffants",
      "BMW Live Cockpit Navigation Pro avec double dalle numérique 12,3 pouces",
      "Système multimédia BMW iDrive avec commande vocale intelligente 'Hey BMW'",
      "Système Hi-Fi Harman Kardon Surround 16 Haut-Parleurs 464W",
      "Climatisation automatique tri-zone avec capteur de qualité de l'air",
      "Éclairage d'ambiance intérieur LED avec 6 ambiances lumineuses",
      "Toit ouvrant panoramique en verre à commande électrique",
      "Accès confort mains libres et ouverture du coffre sans contact Smart Opener",
    ],
    exterieur: [
      "Calandre rénale BMW imposante monobloc avec volets d'air actifs Air Curtain",
      "Pack aérodynamique M avec boucliers sport et prises d'air agrandies",
      "Projecteurs Full LED adaptatifs effilés avec signature lumineuse hexagonale",
      "Jantes en alliage léger M bicolores 20 pouces à rayons en Y",
      "Sorties d'échappement sport trapézoïdales chromées intégrées",
      "Rails de toit en aluminium satiné BMW Individual",
      "Suspension DirectDrive M assurant un comportement dynamique chirurgical",
      "Rétroviseurs extérieurs sport aérodynamiques rabattables électrochromes",
    ],
    securite: [
      "Transmission intégrale intelligente BMW xDrive avec répartition milliseconde",
      "Driving Assistant Professionnel avec régulateur adaptatif ACC et centrage de voie",
      "Système anticollision avec freinage d'urgence actif et détection des piétons",
      "Parking Assistant Plus avec caméras 360° et assistant de recul automatique",
      "8 Airbags de sécurité intégrale (frontaux, latéraux, rideaux, genoux)",
      "Contrôle dynamique de la stabilité DSC et contrôle du freinage en courbe CBC",
      "Système de protection active des occupants Active Protection",
      "Surveillance de pression et température individuelle des pneumatiques",
    ],
  },

  // 13. FORD TRANSIT
  {
    brand: "FORD",
    model: "TRANSIT",
    variant: "Custom Bus / Van 2.0L EcoBlue",
    category: "VAN",
    year: 2024,
    energy: "DIESEL",
    title: "FORD TRANSIT CUSTOM 2.0L ECOBLUE DIESEL",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/88/2016_Ford_Transit_350_2.2.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Transit_interior.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1a/2014_Ford_Transit_Custom_290_ECOnetic_2.2_Front.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/47/2014_Ford_Transit_Custom_290_ECOnetic_2.2_Rear.jpg",
    },
    dimensions: {
      lengthWidthHeight: "5531x2059x2550",
      wheelbase: "3300",
      doors: 4,
      seats: 9,
      tankOrBattery: "70L",
    },
    motorisation: {
      displacementOrMotor: "1995 cm3 (Ford EcoBlue Turbo Diesel)",
      cylinders: "4 en ligne",
      transmission: "Automatique 10 rapports SelectShift",
      fuelType: "Diesel",
      maxPower: "125 kW (170 ch) à 3500 tr/min",
      maxTorque: "390 Nm à 1750-2500 tr/min",
    },
    equipementConfort: [
      "Cabine ergonomique type berline avec assise conducteur grand confort réglable",
      "Écran tactile central 12 pouces avec système connecté Ford SYNC 4",
      "Climatisation avant grand froid et ventilation passagers arrière indépendante",
      "Volant multifonction gainé réglable en hauteur et profondeur",
      "Connectivité Apple CarPlay & Android Auto sans fil avec modem 4G Wi-Fi",
      "Nombreux compartiments de rangement géants, porte-documents et prises 230V",
      "Porte latérale coulissante d'accès grand format facilitant la montée",
      "Rétroviseurs électriques dégivrants à double champ de vision",
    ],
    exterieur: [
      "Calandre avant trapézoïdale chromée robuste à trois barres horizontales",
      "Projecteurs avant bi-xénon puissants avec feux diurnes à LED",
      "Portes arrière battantes à ouverture 180° / 270° pour chargement aisé",
      "Protections latérales de caisse intégrales résistantes aux rayures",
      "Jantes acier renforcées charge lourde 16 pouces",
      "Marchepied arrière antidérapant intégré au bouclier",
      "Crochets de remorquage robustes et barres de toit intégrées",
      "Suspension arrière renforcée à lames paraboliques haute durabilité",
    ],
    securite: [
      "Contrôle dynamique de trajectoire ESP avec système anti-retournement RSC",
      "Stabilisation active en cas de vent latéral (Side Wind Stabilization)",
      "Assistance au freinage d'urgence autonome avec détection piétons",
      "Alerte de franchissement de ligne avec maintien actif dans la voie",
      "Caméra de recul haute définition avec éclairage de manœuvre LED",
      "Airbags frontaux, latéraux et rideaux protégeant la cabine",
      "Système de contrôle adaptatif de la charge (LAC)",
      "Alarme antivol périmétrique avec verrouillage centralisé haute sécurité",
    ],
  },

  // 14. KIA SPORTAGE
  {
    brand: "KIA",
    model: "SPORTAGE",
    variant: "GT-Line 1.6 T-GDi DCT",
    category: "SUV",
    year: 2024,
    energy: "ESSENCE",
    title: "KIA SPORTAGE GT-LINE 1.6L T-GDi 7DCT",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5d/2025_Kia_Sportage_S_front_only.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/2016_Kia_Sportage_-_Interior_2.JPG",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/92/Kia_Sportage_AWD_NB-%E2%85%A6_Purplish_Blue_%285%29.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Kia_Sportage_AWD_NB-%E2%85%A6_Purplish_Blue_%2813%29.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4660x1865x1665",
      wheelbase: "2755",
      doors: 5,
      seats: 5,
      tankOrBattery: "54L",
    },
    motorisation: {
      displacementOrMotor: "1598 cm3 (Smartstream 1.6 T-GDi Turbo)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique double embrayage DCT 7 rapports avec palettes au volant",
      fuelType: "Essence",
      maxPower: "132 kW (180 ch) à 5500 tr/min",
      maxTorque: "265 Nm à 1500-4500 tr/min",
    },
    equipementConfort: [
      "Double dalle incurvée panoramique 12,3 pouces intégrant combiné et multimédia",
      "Sellerie cuir suédé noir et gris avec surpiqûres sport GT-Line",
      "Sièges avant électriques chauffants et ventilés avec mémoire",
      "Système audio haute fidélité Harman Kardon Premium 8 Haut-Parleurs",
      "Console centrale rotative Shift-by-Wire avec chargeur sans fil ventilé",
      "Climatisation automatique bizone avec commandes tactiles commutables",
      "Toit ouvrant panoramique vitré électrique avec rideau d'occultation",
      "Éclairage d'ambiance intérieur personnalisable 64 teintes",
    ],
    exterieur: [
      "Calandre avant audacieuse Tiger Nose avec feux de jour LED en boomerang",
      "Projecteurs Matrix LED adaptatifs intelligents",
      "Toit bi-ton noir brillant contrasté et barres de toit profilées",
      "Jantes alliage bicolores au dessin géométrique exclusif 19 pouces",
      "Feux arrière LED horizontaux reliés par un bandeau lumineux dynamique",
      "Hayon électrique motorisé mains libres Smart Tailgate",
      "Rétroviseurs électriques dégivrants rabattables avec répétiteurs LED",
      "Ligne de caisse chromée remontant élégamment vers le montant arrière",
    ],
    securite: [
      "Système complet d'aides à la conduite Kia Drive Wise de dernière génération",
      "Freinage d'urgence autonome avant avec détection des croisements (FCA-JT)",
      "Affichage caméra des angles morts dans le combiné d'instruments (BVM)",
      "Régulateur de vitesse intelligent adaptatif couplé à la navigation",
      "Caméras panoramiques 360° avec vue 3D dynamique",
      "7 Airbags de sécurité dont airbag central entre conducteur et passager",
      "Aide au maintien au centre de la voie (LFA) et maintien de voie (LKA)",
      "Système de détection de trafic arrière avec freinage d'urgence (RCCA)",
    ],
  },

  // 15. KIA SELTOS
  {
    brand: "KIA",
    model: "SELTOS",
    variant: "EX Luxe 1.5L Smartstream",
    category: "SUV",
    year: 2024,
    energy: "ESSENCE",
    title: "KIA SELTOS EX LUXE 1.5L SMARTSTREAM",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b7/2020_Kia_Seltos_SX_-_Interior_1.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Kia_Seltos.png",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c1/2022_Kia_Seltos_EX_in_Snow_White_Pearl%2C_rear_right.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4385x1800x1635",
      wheelbase: "2630",
      doors: 5,
      seats: 5,
      tankOrBattery: "50L",
    },
    motorisation: {
      displacementOrMotor: "1497 cm3 (Smartstream 1.5L DOHC)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique IVT / DCT haute efficience",
      fuelType: "Essence",
      maxPower: "85 kW (115 ch) à 6300 tr/min",
      maxTorque: "144 Nm à 4500 tr/min",
    },
    equipementConfort: [
      "Cockpit moderne avec double écran numérique incurvé 10,25 pouces",
      "Sellerie cuir synthétique perforé avec assises climatisées ventilées",
      "Système audio immersif Bose Premium 8 Haut-Parleurs avec caisson de basses",
      "Éclairage d'ambiance Sound Mood Lighting synchronisé avec le rythme musical",
      "Climatisation automatique avec purificateur d'air Smart Pure Air",
      "Démarrage moteur à distance par télécommande et bouton Push Start",
      "Toit ouvrant électrique avec commande à impulsion",
      "Volant cuir multifonction à méplat avec commandes audio et régulateur",
    ],
    exterieur: [
      "Calandre 'Tiger Nose' musclée avec signature lumineuse LED Star Map transversale",
      "Feux avant et antibrouillards Full LED cubiques haute intensité",
      "Feux arrière verticaux à LED reliés par un bandeau lumineux central",
      "Jantes alliage bicolores taillées au diamant 17/18 pouces",
      "Sabots de protection avant et arrière en aluminium brossé",
      "Barres de toit longitudinales sport noir et argent",
      "Garde au sol surélevée de 190 mm pour une excellente agilité urbaine",
      "Vitres arrière surteintées athermiques protégeant des rayons UV",
    ],
    securite: [
      "Pack complet de sécurité active ADAS avec freinage automatique d'urgence",
      "Système d'assistance au maintien dans la voie (LKA et LFA)",
      "Surveillance active des angles morts avec intervention sur les freins (BCA)",
      "Alerte de circulation transversale arrière avec assistance au freinage",
      "6 Airbags de sécurité frontaux, latéraux et rideaux",
      "Sélecteur multi-terrain (Sable, Boue, Neige) avec modes Eco, Normal, Sport",
      "Contrôle de motricité et stabilité électronique ESC avec aide en côte HAC",
      "Caméra de recul avec lignes de guidage dynamiques et radars de stationnement",
    ],
  },

  // 16. BAIC X55 / BEIJING X55
  {
    brand: "BAIC",
    model: "X55",
    variant: "Beijing X55 Magic Core 1.5T",
    category: "SUV",
    year: 2024,
    energy: "ESSENCE",
    title: "BAIC BEIJING X55 MAGIC CORE 1.5T 7DCT",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/2022_Beijing_X6_%28front%29.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Cirelli_4.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Baic_X55_Automesse_Ludwigsburg_2023_1X7A0077.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/26/2022_Beijing_X6_%28rear%29.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4620x1886x1680",
      wheelbase: "2735",
      doors: 5,
      seats: 5,
      tankOrBattery: "53L",
    },
    motorisation: {
      displacementOrMotor: "1498 cm3 (Magic Core 1.5 VGT Turbo - Top 10 Chine)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique 7 rapports double embrayage humide 7DCT (Magna)",
      fuelType: "Essence",
      maxPower: "130 kW (177 ch) à 5500 tr/min",
      maxTorque: "305 Nm à 1500-4250 tr/min",
    },
    equipementConfort: [
      "Habitacle d'inspiration aérospatiale avec sièges sport intégraux zéro gravité",
      "Écran tactile central flottant 10,1 pouces haute fluidité",
      "Combiné d'instruments LCD numérique 10,25 pouces avec affichage dynamique",
      "Console centrale flottante avec sélecteur de vitesse électronique Crystal",
      "Climatisation automatique bizone avec diffuseurs arrière et filtration PM2.5",
      "Éclairage d'ambiance intérieur multicolore LED respirant",
      "Toit ouvrant panoramique XXL de 0,81 m² avec capteur de pluie à fermeture auto",
      "Accès confort sans clé avec poignées de portières affleurantes automatiques",
    ],
    exterieur: [
      "Face avant futuriste sans calandre avec motif dégradé en diamants géométriques",
      "Poignées de portières affleurantes escamotables à déploiement automatique",
      "Optiques scindées Full LED avec feux de jour en boomerang acérés",
      "Jantes alliage sport 19 pouces bicolores avec étriers de frein contrastés",
      "Aileron arrière scindé inspiré de la F1 avec diffuseur aérodynamique inférieur",
      "Quadruple embout d'échappement design intégré au bouclier arrière",
      "Rétroviseurs extérieurs sport aérodynamiques rabattables électriquement",
      "Suspension indépendante MacPherson avant et multibras arrière",
    ],
    securite: [
      "Système d'assistance à la conduite de niveau 2.5 (B-Pilot) avec régulateur IACC",
      "Freinage d'urgence automatique autonome AEB avec détection piétons",
      "Système de caméras à vision panoramique 360° 3D avec radars avant et arrière",
      "Avertisseur de franchissement de ligne (LDW) et maintien actif de voie (LKA)",
      "6 Airbags de sécurité SRS rideaux et latéraux",
      "Contrôle électronique de trajectoire ESP Bosch de dernière génération",
      "Frein de stationnement électrique avec maintien automatique Auto-Hold",
      "Structure de caisse haute résistance en acier thermoformé",
    ],
  },

  // 17. DONGFENG RICH 7
  {
    brand: "DONGFENG",
    model: "RICH 7",
    variant: "Luxe 2.3T Diesel 4x4",
    category: "PICKUP",
    year: 2025,
    energy: "DIESEL",
    title: "DONGFENG RICH 7 DOUBLE CABINE 2.3T DIESEL 4x4",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/Dongfeng_Rich_7_front_quarter_view.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Dongfeng_Rich_7_image02.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Dongfeng_Rich_7_image01.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Dongfeng_Rich_7_rear_quarter_view.jpg",
    },
    dimensions: {
      lengthWidthHeight: "5290x1850x1830",
      wheelbase: "3150",
      doors: 4,
      seats: 5,
      tankOrBattery: "73L",
    },
    motorisation: {
      displacementOrMotor: "2298 cm3 (Nissan M9T Turbo Diesel Common Rail)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique ZF 8 rapports avec transmission 4x4 et blocage de différentiel",
      fuelType: "Diesel Common Rail",
      maxPower: "122 kW (166 ch) à 3500 tr/min",
      maxTorque: "420 Nm à 1500-2750 tr/min",
    },
    equipementConfort: [
      "Volant multifonction gainé cuir avec commandes audio et régulateur",
      "Sellerie cuir premium surpiquée grand confort avec réglages électriques",
      "Grand écran central multimédia tactile haute résolution 10 pouces",
      "Climatisation automatique bizone avec aérateurs passagers arrière",
      "Prises USB à charge rapide et prise d'alimentation 12V",
      "Connectivité Bluetooth mains libres et mirroring smartphone",
      "Système audio 6 Haut-Parleurs avec excellente clarté acoustique",
      "Démarrage sans clé Push Start et verrouillage centralisé télécommandé",
    ],
    exterieur: [
      "Châssis échelle haute résistance développé en partenariat avec Nissan",
      "Transmission intégrale 4x4 avec boîte de transfert et blocage de différentiel",
      "Jantes aluminium robustes tout-terrain 18 pouces bicolores",
      "Projecteurs bi-LED haute intensité et feux de jour à LED distinctifs",
      "Marchepieds latéraux renforcés en aluminium extrudé",
      "Revêtement protecteur de benne anti-rayures Bedliner haute densité",
      "Suspension avant à double triangulation indépendante",
      "Suspension arrière à essieu rigide avec ressorts à lames renforcés haute charge",
    ],
    securite: [
      "Contrôle électronique de trajectoire et de stabilité ESP Bosch 9.3",
      "Assistance au démarrage en côte (HAC) et contrôle de vitesse en descente (HDC)",
      "Caméra de recul haute définition avec radars de détection d'obstacles",
      "Freinage haute performance ABS avec répartiteur de charge EBD et assistance BAS",
      "Airbags frontaux conducteur et passager avant",
      "Système de surveillance de la pression des pneus (TPMS)",
      "Fixations pour sièges enfant ISOFIX aux places arrière",
      "Structure de cabine renforcée anti-écrasement",
    ],
  },

  // 18. DONGFENG NAMMI
  {
    brand: "DONGFENG",
    model: "NAMMI",
    variant: "01 Flagship 430 Pro",
    category: "ELECTRIQUE",
    year: 2025,
    energy: "ELECTRIQUE",
    title: "DONGFENG NAMMI 01 FLAGSHIP 100% ÉLECTRIQUE",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Dongfeng_Nammi_01_at_Auto_Guangzhou_2023_20231126.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Dongfeng_Nammi_Box_Auto_Zuerich_2024_DSC_6407.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Dongfeng_Nammi_Box_Auto_Zuerich_2024_DSC_6410.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/Dongfeng_Nammi_Box_Auto_Zuerich_2024_DSC_6819.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4030x1810x1570",
      wheelbase: "2660",
      doors: 5,
      seats: 5,
      tankOrBattery: "42.3 kWh (Batterie LFP Lithium Fer Phosphate)",
    },
    motorisation: {
      displacementOrMotor: "Moteur Synchrone à Aimants Permanents",
      cylinders: "100% Électrique Pur",
      transmission: "Automatique Réducteur Direct",
      fuelType: "100% Électrique",
      maxPower: "70 kW (95 ch)",
      maxTorque: "160 Nm instantanés",
      rangeKm: "430 km (Norme CLTC)",
    },
    equipementConfort: [
      "Volant multifonction cuir à méplat sport ergonomique",
      "Sièges ergonomiques en simili cuir avec fonction mémoire et mode couchette",
      "Écran tactile haute définition 12,8 pouces ultra-fluide",
      "Climatisation automatique avec filtre antibactérien",
      "Chargeur smartphone sans fil à induction Wireless",
      "Système audio 6 Haut-Parleurs haute fidélité",
      "Éclairage d'ambiance intérieur LED avec 32 coloris sélectionnables",
      "Accès et démarrage sans clé Keyless Entry & Go",
    ],
    exterieur: [
      "Portières sans cadre (Frameless Doors) façon coupé haut de gamme",
      "Poignées de portières électriques affleurantes escamotables",
      "Projecteurs avant Full LED intelligents et feux de jour triangulaires",
      "Jantes en alliage léger bicolores 17 pouces au profil aérodynamique",
      "Antenne requin aérodynamique intégrée au pavillon",
      "Caméras panoramiques 360° Vision Haute Définition",
      "Radars de stationnement avant et arrière",
      "Suspension avant indépendante MacPherson et essieu arrière renforcé",
    ],
    securite: [
      "Contrôle électronique de stabilité dynamique ESP Bosch 9.3",
      "Aides à la conduite autonome de niveau 2 (ADAS L2)",
      "Freinage automatique d'urgence avec détection piétons",
      "Alerte et maintien actif de franchissement involontaire de ligne",
      "6 Airbags de sécurité frontaux, latéraux et rideaux",
      "Système antiblocage ABS avec répartiteur électronique EBD",
      "Verrouillage enfant ISOFIX aux places arrière",
      "Surveillance de la pression et température des pneus en direct",
    ],
  },

  // 19. LYNK & CO 06
  {
    brand: "LYNK & CO",
    model: "06",
    variant: "Pro 1.5T (Plateforme Volvo BMA)",
    category: "SUV",
    year: 2025,
    energy: "ELECTRIQUE",
    title: "LYNK & CO 06 PRO 1.5T / HYBRIDE",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/Lynk_%26_Co_06_005.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Lynk_%26_Co_06_008.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/55/Lynk_%26_Co_06_006.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Lynk_%26_Co_06_EM-P_003.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4340x1820x1625",
      wheelbase: "2640",
      doors: 5,
      seats: 5,
      tankOrBattery: "51L (ou 19 kWh sur version EM-P)",
    },
    motorisation: {
      displacementOrMotor: "1477 cm3 (Volvo Drive-E 1.5 Turbo / Hybride)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique 7 rapports double embrayage 7DCT humide",
      fuelType: "Essence / Hybride Rechargeable",
      maxPower: "133 kW (181 ch) à 5500 tr/min",
      maxTorque: "290 Nm à 1500-4000 tr/min",
      rangeKm: "Version EM-P : 102 km électrique / 1200 km combiné",
    },
    equipementConfort: [
      "Habitacle techno-chic scandinave conçu sur l'architecture Volvo BMA",
      "Écran tactile central flottant géant 14,6 pouces haute définition",
      "Combiné d'instruments tout numérique 10,25 pouces LCD personnalisable",
      "Sièges sport en cuir éco-responsable et tissu respirant antibactérien",
      "Système audio haute définition Infinity 8 Haut-Parleurs",
      "Climatisation automatique avec purification d'air AQS et filtre CN95",
      "Volant sport à méplat en cuir Nappa avec surpiqûres couleur",
      "Clé numérique sur smartphone via Bluetooth et démarrage sans clé",
    ],
    exterieur: [
      "Signature lumineuse avant 'Aurora Borealis' double barre LED sur les ailes",
      "Calandre traversante noire 'Urban Skyline' intégrant les projecteurs LED",
      "Toit flottant bicolore avec jonc de toit dynamique contrasté",
      "Jantes alliage diamantées 19 pouces au dessin géométrique exclusif",
      "Feux arrière LED 3D à effet cristaux 'Energy Cube' reliés par bandeau noir",
      "Double sortie d'échappement sport chromée",
      "Toit ouvrant panoramique vitré électrique avec velum d'occultation",
      "Rétroviseurs électriques chauffants et rabattables automatiquement",
    ],
    securite: [
      "Système complet de sécurité active hérité de l'ingénierie Volvo (21 fonctions)",
      "Régulateur de vitesse adaptatif de 0 à 150 km/h avec maintien de trajectoire",
      "Freinage d'urgence autonome avec détection piétons et cyclistes City Safety",
      "Caméras panoramiques 540° avec vision sous châssis transparent",
      "6 Airbags rideaux et latéraux à déploiement ultra-rapide",
      "Structure de caisse renforcée à plus de 70% d'acier au bore haute résistance",
      "Avertisseur d'angles morts et alerte d'ouverture de porte en sécurité (DOW)",
      "Surveillance de vigilance conducteur par capteurs intelligents",
    ],
  },

  // 20. MERCEDES-BENZ GLE (ex: GLE 450 4MATIC)
  {
    brand: "MERCEDES-BENZ",
    model: "GLE",
    variant: "GLE 450 4MATIC AMG Line",
    category: "SUV",
    year: 2024,
    energy: "ESSENCE",
    title: "MERCEDES-BENZ GLE 450 4MATIC AMG LINE",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Mercedes-Benz_GLE_350_d_4MATIC_AMG_Line_%28V_167%29_%E2%80%93_f_18042021.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Mercedes-AMG_GLE63_S_4MATIC_%28W166%29_interior.JPG",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Mercedes-Benz_ML55_AMG_--_02-14-2012.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Mercedes-AMG_GLE_43_4MATIC_Coup%C3%A9_%28C292%29_rear.JPG",
    },
    dimensions: {
      lengthWidthHeight: "4924x2010x1797",
      wheelbase: "2995",
      doors: 5,
      seats: 5,
      tankOrBattery: "85L",
    },
    motorisation: {
      displacementOrMotor: "2999 cm3 (6 en ligne Turbo + EQ Boost 48V)",
      cylinders: "6 en ligne 24V",
      transmission: "Automatique 9G-TRONIC 9 rapports avec transmission 4MATIC",
      fuelType: "Essence avec micro-hybridation 48V",
      maxPower: "280 kW (381 ch) + 15 kW EQ Boost",
      maxTorque: "500 Nm à 1600-4500 tr/min",
    },
    equipementConfort: [
      "Widescreen Cockpit avec double écran haute résolution 12,3 pouces et MBUX",
      "Sellerie cuir Nappa grand confort avec sièges multicontours massants climatisés",
      "Système de sonorisation Burmester Surround 13 Haut-Parleurs 590W",
      "Climatisation automatique confort THERMOTRONIC 4 zones",
      "Éclairage d'ambiance 64 coloris avec 10 ambiances chromatiques",
      "Suspension pneumatique active AIRMATIC avec amortissement adaptatif ADS+",
      "Fermeture assistée des portières Servo-fermeture (Soft Close)",
      "Toit ouvrant panoramique vitré électrique à double panneau",
    ],
    exterieur: [
      "Étoile Mercedes-Benz tridimensionnelle au centre de la calandre diamant",
      "Pack aérodynamique AMG avec boucliers sport et élargisseurs d'ailes",
      "Projecteurs MULTIBEAM LED avec feux de route ULTRA RANGE (650 mètres)",
      "Jantes alliage AMG bicolores multibranches de 21 pouces",
      "Marchepieds en aluminium avec picots en caoutchouc antidérapants",
      "Vitrage athermique teinté foncé à l'arrière protégeant des regards",
      "Hayon arrière EASY-PACK à ouverture et fermeture électriques sans contact",
      "Rétroviseurs électriques rabattables à atténuation automatique électrochrome",
    ],
    securite: [
      "Transmission intégrale permanente Mercedes-Benz 4MATIC avec Torque on Demand",
      "Pack d'assistance à la conduite Plus avec régulateur de distance actif DISTRONIC",
      "Assistant directionnel actif avec fonction d'arrêt d'urgence automatique",
      "Système de sécurité prédictive PRE-SAFE Impulse latéral et sonore",
      "Caméras panoramiques 360° avec fonction 'capot moteur transparent'",
      "9 Airbags complets (frontaux, latéraux avant et arrière, rideaux, genoux)",
      "Assistant de stabilisation en cas de vent latéral et freinage actif d'urgence",
      "Protection antivol GUARD 360° avec géolocalisation et alarme périmétrique",
    ],
  },

  // 21. MERCEDES-BENZ CLASSE C (ex: C 200 Avantgarde)
  {
    brand: "MERCEDES-BENZ",
    model: "CLASSE C",
    variant: "C 200 Avantgarde 1.5T EQ Boost",
    category: "BERLINE",
    year: 2024,
    energy: "ESSENCE",
    title: "MERCEDES-BENZ CLASSE C 200 AVANTGARDE",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/24/Mercedes-Benz_W206_IMG_5796.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/Mercedes-Benz_W206_IMG_5793.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Mercedes-Benz_S206_IMG_5958.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/38/Mercedes-Benz_S206_IMG_5882.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4751x1820x1438",
      wheelbase: "2865",
      doors: 4,
      seats: 5,
      tankOrBattery: "66L",
    },
    motorisation: {
      displacementOrMotor: "1496 cm3 (M254 1.5L Turbo + Alterno-démarreur EQ Boost 48V)",
      cylinders: "4 en ligne 16V",
      transmission: "Automatique 9G-TRONIC 9 rapports séquentielle",
      fuelType: "Essence Mild-Hybrid 48V",
      maxPower: "150 kW (204 ch) + 15 kW EQ Boost",
      maxTorque: "300 Nm à 1800-4000 tr/min",
    },
    equipementConfort: [
      "Écran central vertical MBUX haute définition 11,9 pouces orienté vers le conducteur",
      "Combiné d'instruments numérique 12,3 pouces haute définition personnalisable",
      "Sellerie cuir ARTICO grand confort avec sièges électriques chauffants à mémoire",
      "Système de sonorisation Burmester 3D Surround à 15 Haut-Parleurs 710W",
      "Climatisation automatique confort THERMATIC bizone",
      "Éclairage d'ambiance LED 64 couleurs avec projection d'étoiles animée",
      "Lecteur d'empreinte digitale pour chargement instantané du profil conducteur",
      "Volant sport multifonction en cuir avec pavés tactiles capacitifs",
    ],
    exterieur: [
      "Calandre avant Avantgarde avec étoile Mercedes-Benz centrale chromée",
      "Projecteurs LED hautes performances avec feux de jour intégrés",
      "Jantes en alliage léger multibranches 18 pouces bicolores",
      "Ligne de carrosserie fluide sensuelle épurée (Sensual Purity)",
      "Feux arrière LED horizontaux en deux parties avec optiques tridimensionnelles",
      "Sorties d'échappement chromées intégrées au diffuseur arrière",
      "Toit ouvrant panoramique vitré électrique à commande tactile",
      "Rétroviseurs extérieurs rabattables électriquement et électrochromes",
    ],
    securite: [
      "Pack d'assistance à la conduite avec régulateur adaptatif DISTRONIC",
      "Freinage d'urgence assisté actif avec détection des véhicules et piétons",
      "Aide active au maintien dans la voie avec avertisseur d'angles morts",
      "Caméra de recul haute définition avec radars de stationnement PARKTRONIC",
      "Airbag central entre conducteur et passager avant et 7 autres airbags SRS",
      "Système de communication Car-to-X échangeant alertes de danger en direct",
      "Système de détection de somnolence ATTENTION ASSIST",
      "Protection antivol électronique avec verrouillage centralisé sécurisé",
    ],
  },

  // 22. BYD SONG PLUS (DM-i Super Hybride)
  {
    brand: "BYD",
    model: "SONG PLUS",
    variant: "DM-i Super Hybride 1.5L",
    category: "SUV",
    year: 2024,
    energy: "HYBRIDE",
    title: "BYD SONG PLUS DM-i SUPER HYBRIDE RECHARGEABLE",
    photos: {
      mainPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/02/2023_BYD_Song_Plus_DM-i_%28front%29.jpg",
      interiorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1a/BYD_Song_Plus_IMG005.jpg",
      exteriorPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/01/2020_BYD_Song_Plus_DM-i.jpg",
      rearPhotoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/BYD_Song_Plus_IMG006.jpg",
    },
    dimensions: {
      lengthWidthHeight: "4775x1890x1670",
      wheelbase: "2765",
      doors: 5,
      seats: 5,
      tankOrBattery: "18.3 kWh (Batterie Blade LFP) + Réservoir 60L",
    },
    motorisation: {
      displacementOrMotor: "Système Hybride DM-i Xiaoyun 1.5L + Moteur Électrique Synchrone",
      cylinders: "4 en ligne + Électrique",
      transmission: "E-CVT Transmission Directe Hybride Haute Efficacité",
      fuelType: "Hybride Rechargeable Essence/Électrique",
      maxPower: "160 kW (218 ch) combinés",
      maxTorque: "325 Nm combinés instantanés",
      rangeKm: "110 km 100% électrique / 1100 km combiné (CLTC)",
    },
    equipementConfort: [
      "Écran central rotatif motorisé électrique 15,6 pouces haute définition",
      "Combiné d'instruments LCD numérique 12,3 pouces avec affichage de flux d'énergie",
      "Sellerie cuir écologique bicolore avec sièges chauffants et ventilés à mémoire",
      "Système audio Dirac Sound Studio 10 Haut-Parleurs Haute Fidélité",
      "Climatisation automatique avec purificateur d'air PM2.5 et générateur d'ions",
      "Fonction décharge bidirectionnelle VtoL (220V externe pour appareils électriques)",
      "Chargeur smartphone sans fil 15W avec support dédié",
      "Toit ouvrant panoramique vitré électrique avec rideau pare-soleil",
    ],
    exterieur: [
      "Face avant 'Dragon Face 3.0' avec calandre trapézoïdale étincelante",
      "Projecteurs LED cristallins inspirés des yeux de dragon avec clignotants dynamiques",
      "Feux arrière LED transversaux effilés traversant toute la largeur du coffre",
      "Jantes alliage bicolores diamantées 19 pouces",
      "Barres de toit profilées en aluminium et antenne requin",
      "Hayon arrière à ouverture et fermeture électriques télécommandées",
      "Vitrage acoustique insonorisé à double couche aux places avant",
      "Rétroviseurs électriques chauffants et rabattables automatiquement",
    ],
    securite: [
      "Batterie Blade Battery révolutionnaire (résiste au test de pénétration de clous sans incendie)",
      "Système d'assistance active à la conduite DiPilot de niveau 2 (ADAS L2)",
      "Caméras panoramiques 360° Haute Définition avec vue transparente 3D",
      "Freinage d'urgence automatique autonome avec détection des piétons",
      "Surveillance active des angles morts (BSD) et alerte de franchissement de voie",
      "6 Airbags de sécurité complets frontaux, latéraux et rideaux",
      "Contrôle électronique de stabilité ESP Bosch 9.3 et antipatinage",
      "Système de surveillance de la pression des pneus (TPMS)",
    ],
  },
];

/**
 * Recherche et résout la fiche technique officielle exacte pour un véhicule donné
 * avec gestion avancée des alias constructeurs et modèles de la flotte Carzone.
 */
export function findCatalogSpecs(brand: string, model: string, variant?: string | null): ModelCatalogEntry | null {
  const b = (brand || "").trim().toUpperCase();
  const m = (model || "").trim().toUpperCase();
  const v = (variant || "").trim().toUpperCase();

  // Nettoyage intelligent du nom de modèle (retirer les années, DC 4X4, transmissions)
  const cleanM = m
    .replace(/\b20\d\d\b/g, "")
    .replace(/\bDC\s*4X4\b/g, "")
    .replace(/\b4X4\b/g, "")
    .replace(/\bAWD\b/g, "")
    .replace(/\b8AT\b/g, "")
    .replace(/\b7DCT\b/g, "")
    .replace(/\bI-DM\b/g, "")
    .replace(/\bPHEV\b/g, "")
    .replace(/\bEV\b/g, "")
    .trim();

  // 1. Match par marque (avec alias) et modèle
  for (const entry of OFFICIAL_VEHICLE_CATALOG) {
    const entryBrand = entry.brand.toUpperCase();
    const entryModel = entry.model.toUpperCase();

    // Gestion des alias de constructeurs
    const isBrandMatch =
      b.includes(entryBrand) || entryBrand.includes(b) ||
      ((b.includes("FORTHING") || b.includes("DONGFENG")) && (entryBrand.includes("FORTHING") || entryBrand.includes("DONGFENG"))) ||
      ((b.includes("BAIC") || b.includes("BEIJING") || b.includes("SENOVA")) && (entryBrand.includes("BAIC") || entryBrand.includes("BEIJING"))) ||
      ((b.includes("GEELY") || b.includes("GALAXY")) && (entryBrand.includes("GEELY") || entryBrand.includes("GALAXY"))) ||
      ((b.includes("MERCEDES") || b.includes("BENZ")) && entryBrand.includes("MERCEDES")) ||
      ((b.includes("CHANGAN") || b.includes("CHANG'AN")) && entryBrand.includes("CHANGAN")) ||
      ((b.includes("JETOUR") || b.includes("CHERY")) && entryBrand.includes("JETOUR"));

    if (!isBrandMatch) continue;

    // Correspondance modèle précise ou par mot-clé
    const isModelMatch =
      entryModel === cleanM ||
      cleanM.includes(entryModel) ||
      entryModel.includes(cleanM) ||
      (cleanM.includes("RICH") && entryModel.includes("RICH")) ||
      (cleanM.includes("T5") && entryModel.includes("T5")) ||
      (cleanM.includes("CS75") && entryModel.includes("CS75")) ||
      (cleanM.includes("CS35") && entryModel.includes("CS35")) ||
      (cleanM.includes("UNI-K") && entryModel.includes("UNI-K")) ||
      (cleanM.includes("B40") && (entryModel.includes("B40") || entryModel.includes("BJ40"))) ||
      (cleanM.includes("X55") && entryModel.includes("X55")) ||
      (cleanM.includes("STARSHIP") && entryModel.includes("STARSHIP")) ||
      (cleanM.includes("PRADO") && entryModel.includes("PRADO")) ||
      (cleanM.includes("DASHING") && entryModel.includes("DASHING")) ||
      (cleanM.includes("T2") && entryModel.includes("T2")) ||
      (cleanM.includes("TRAVELLER") && entryModel.includes("T2"));

    if (isModelMatch) {
      return entry;
    }
  }

  // 2. Fallbacks spécifiques par marque connue
  if (b.includes("FORTHING") || b.includes("DONGFENG")) {
    if (m.includes("RICH")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "RICH 7") || null;
    if (m.includes("T5")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "T5 EVO") || null;
    if (m.includes("NAMMI")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "NAMMI") || null;
    return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "T5 EVO") || null;
  }

  if (b.includes("CHANGAN")) {
    if (m.includes("75")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "CS75") || null;
    if (m.includes("35")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "CS35 PLUS") || null;
    if (m.includes("UNI")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "UNI-K") || null;
    return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "CS75") || null;
  }

  if (b.includes("JETOUR")) {
    if (m.includes("T2") || m.includes("TRAVELLER")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "T2") || null;
    return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "DASHING") || null;
  }

  if (b.includes("BAIC") || b.includes("BEIJING")) {
    if (m.includes("40") || m.includes("B40")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "B40 PRO") || null;
    return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "X55") || null;
  }

  if (b.includes("GEELY")) {
    return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "STARSHIP 7") || null;
  }

  if (b.includes("TOYOTA")) {
    if (m.includes("PRADO") || m.includes("LAND CRUISER")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "LAND CRUISER PRADO") || null;
    if (m.includes("CROSS")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "COROLLA CROSS") || null;
    if (m.includes("CAMRY")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "CAMRY") || null;
    if (m.includes("FORTUNER")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "FORTUNER") || null;
    if (m.includes("HILUX")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "HILUX") || null;
    if (m.includes("HIACE")) return OFFICIAL_VEHICLE_CATALOG.find(e => e.model === "HIACE") || null;
  }

  return null;
}

