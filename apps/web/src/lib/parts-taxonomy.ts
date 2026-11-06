/** Taxonomie structurée du catalogue de pièces détachées. */
export type PartSubcategory = { code: string; label: string };
export type PartSystem = {
  code: string;
  label: string;
  description: string;
  subcategories: PartSubcategory[];
};

export const PART_SYSTEMS: PartSystem[] = [
  {
    code: "MOTEUR",
    label: "Moteur",
    description: "Bas moteur, distribution, injection, allumage, refroidissement et lubrification.",
    subcategories: [
      { code: "BAS_MOTEUR", label: "Bas moteur / chemise / piston" },
      { code: "CULASSE", label: "Culasse et joints" },
      { code: "DISTRIBUTION", label: "Courroie / chaîne de distribution" },
      { code: "INJECTION", label: "Injection et rampe" },
      { code: "ALLUMAGE", label: "Bougies et bobines" },
      { code: "TURBO", label: "Turbo et suralimentation" },
      { code: "REFROIDISSEMENT", label: "Pompe à eau, radiateur, thermostat" },
      { code: "LUBRIFICATION", label: "Pompe à huile, carter, filtre" },
      { code: "ADMISSION_ECHAPPEMENT", label: "Admission et échappement" },
    ],
  },
  {
    code: "TRANSMISSION",
    label: "Transmission",
    description: "Embrayage, boîte, cardans, différentiel et transmission intégrale.",
    subcategories: [
      { code: "EMBRAYAGE", label: "Kit embrayage et volant moteur" },
      { code: "BOITE_VITESSES", label: "Boîte de vitesses et commande" },
      { code: "CARDANS", label: "Cardans et arbres de transmission" },
      { code: "DIFFERENTIEL", label: "Différentiel et pont" },
      { code: "TRANSMISSION_INTEGRALE", label: "Transmission intégrale / 4WD" },
    ],
  },
  {
    code: "FREINAGE",
    label: "Freinage",
    description: "Plaquettes, disques, étriers, maître-cylindre, ABS et frein à main.",
    subcategories: [
      { code: "PLAQUETTES", label: "Plaquettes et garnitures" },
      { code: "DISQUES", label: "Disques et tambours" },
      { code: "ETRIERS", label: "Étriers et pistons" },
      { code: "MAITRE_CYLINDRE", label: "Maître-cylindre et servo-frein" },
      { code: "ABS", label: "Bloc ABS et capteurs" },
      { code: "FREIN_MAIN", label: "Frein à main et câbles" },
    ],
  },
  {
    code: "SUSPENSION_DIRECTION",
    label: "Suspension & direction",
    description: "Amortisseurs, ressorts, rotules, biellettes, bras et direction.",
    subcategories: [
      { code: "AMORTISSEURS", label: "Amortisseurs et ressorts" },
      { code: "ROTULES", label: "Rotules et bras de suspension" },
      { code: "BIELLETTES", label: "Biellettes et barre stabilisatrice" },
      { code: "DIRECTION", label: "Crémaillère, colonne et volant" },
      { code: "PNEUMATIQUES", label: "Pneumatiques et roues" },
    ],
  },
  {
    code: "CARROSSERIE",
    label: "Carrosserie",
    description: "Pare-chocs, ailes, capot, portes, vitrage et éléments extérieurs.",
    subcategories: [
      { code: "PARECHOCS", label: "Pare-chocs et grilles" },
      { code: "AILES", label: "Ailes et passages de roue" },
      { code: "CAPOT", label: "Capot et hayon" },
      { code: "PORTES", label: "Portes et serrures" },
      { code: "RETROVISEURS", label: "Rétroviseurs et vitrage" },
      { code: "INTERIEUR", label: "Sellerie, habillage et tableau de bord" },
    ],
  },
  {
    code: "ECLAIRAGE",
    label: "Éclairage",
    description: "Phares, feux, clignotants, ampoules et éclairage intérieur.",
    subcategories: [
      { code: "PHARES", label: "Phares avant" },
      { code: "FEUX_ARRIERE", label: "Feux arrière" },
      { code: "SIGNALISATION", label: "Clignotants et feux stop" },
      { code: "AMPOULES", label: "Ampoules et modules LED" },
    ],
  },
  {
    code: "FILTRATION",
    label: "Filtration",
    description: "Filtres à huile, air, carburant et habitacle.",
    subcategories: [
      { code: "FILTRE_HUILE", label: "Filtre à huile" },
      { code: "FILTRE_AIR", label: "Filtre à air" },
      { code: "FILTRE_CARBURANT", label: "Filtre à carburant" },
      { code: "FILTRE_HABITACLE", label: "Filtre d'habitacle" },
    ],
  },
  {
    code: "CLIMATISATION",
    label: "Climatisation",
    description: "Compresseur, condenseur, évaporateur et circuits de clim.",
    subcategories: [
      { code: "COMPRESSEUR", label: "Compresseur de clim" },
      { code: "CONDENSEUR", label: "Condenseur et radiateur de clim" },
      { code: "EVAPORATEUR", label: "Évaporateur et détendeur" },
    ],
  },
  {
    code: "ELECTRICITE",
    label: "Électricité & électronique",
    description: "Batterie, alternateur, démarreur, capteurs et faisceaux.",
    subcategories: [
      { code: "BATTERIE", label: "Batterie et bornes" },
      { code: "ALTERNATEUR", label: "Alternateur et régulateur" },
      { code: "DEMARREUR", label: "Démarreur" },
      { code: "CAPTEURS", label: "Capteurs et calculateurs" },
      { code: "FAISCEAUX", label: "Faisceaux et connecteurs" },
    ],
  },
  {
    code: "FLUIDES",
    label: "Fluides & consommables",
    description: "Huiles, liquides, graisses et produits d'entretien.",
    subcategories: [
      { code: "HUILE_MOTEUR", label: "Huile moteur" },
      { code: "LIQUIDE_FREIN", label: "Liquide de frein" },
      { code: "LIQUIDE_REFROIDISSEMENT", label: "Liquide de refroidissement" },
      { code: "GRAISSES", label: "Graisses et additifs" },
    ],
  },
];

export function partSystemLabel(code: string | null | undefined): string {
  if (!code) return "-";
  return PART_SYSTEMS.find((system) => system.code === code)?.label || code;
}

export function partSubcategoryLabel(system: string | null | undefined, code: string | null | undefined): string {
  if (!code) return "-";
  const parent = PART_SYSTEMS.find((item) => item.code === system);
  return parent?.subcategories.find((subcategory) => subcategory.code === code)?.label || code;
}
