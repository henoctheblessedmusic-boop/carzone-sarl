export const Role = {
  // Super-Administrateur Système & Furtif
  DEVELOPER: "DEVELOPER",

  // Rôles Direction & Gouvernance
  PDG: "PDG",
  SG: "SG",
  DG: "DG",
  ADV: "ADV",
  RF: "RF",
  RH: "RH",

  // Encadrement Technique & Commercial
  RTA: "RTA",
  DC: "DC",

  // Opérations & Métiers
  CHEF_ATELIER: "CHEF_ATELIER",
  COMMERCIAL: "COMMERCIAL",
  HOTESSE: "HOTESSE",
  ASSISTANTE_COMPTABLE: "ASSISTANTE_COMPTABLE",

  // Compatibilité & Technique
  ADMIN: "ADMIN",
  COMPTA: "COMPTA",
  STOCK: "STOCK",
  ATELIER: "ATELIER",
  BORNES_OPS: "BORNES_OPS",
  INSTALLATEUR: "INSTALLATEUR",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_LABELS: Record<Role, string> = {
  DEVELOPER: "Développeur",
  PDG: "Président Directeur Général (PDG)",
  SG: "Secrétaire Général (SG)",
  DG: "Directeur Général",
  ADV: "Administration des Ventes (ADV)",
  RF: "Responsable Financier (RF)",
  RH: "Responsable Ressources Humaines (RH)",
  RTA: "Responsable Technique Atelier (RTA)",
  DC: "Directeur Commercial (DC)",
  CHEF_ATELIER: "Chef d'Atelier",
  COMMERCIAL: "Commercial(e)",
  HOTESSE: "Hôtesse d'Accueil",
  ASSISTANTE_COMPTABLE: "Assistante Comptable",
  ADMIN: "Administrateur (Véhicules & Messages)",
  COMPTA: "Comptabilité",
  STOCK: "Gestionnaire Stock",
  ATELIER: "Technicien Atelier",
  BORNES_OPS: "Bornes & Énergie",
  INSTALLATEUR: "Installateur Partenaire",
};

