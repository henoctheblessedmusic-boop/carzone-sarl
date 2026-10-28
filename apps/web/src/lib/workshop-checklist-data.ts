export type ChecklistTemplateItem = {
  id: string;
  mileageTier: 5000 | 10000 | 30000 | 50000 | 100000;
  category: string;
  taskLabel: string;
  defaultAppliesToTiers: number[]; // Tous les paliers qui l'incluent par cumul
};

export const WORKSHOP_CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = [
  // ================= PALLIER 5 000 KM =================
  {
    id: "chk_5k_01",
    mileageTier: 5000,
    category: "MOTEUR",
    taskLabel: "Vidange huile moteur",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_02",
    mileageTier: 5000,
    category: "FILTRATION",
    taskLabel: "Remplacer filtre à huile",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_03",
    mileageTier: 5000,
    category: "FILTRATION",
    taskLabel: "Nettoyer et contrôler le filtre à air",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_04",
    mileageTier: 5000,
    category: "ELECTRICITE",
    taskLabel: "Nettoyage et contrôler les batteries",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_05",
    mileageTier: 5000,
    category: "FLUIDES",
    taskLabel: "Contrôle du niveau de liquide refroidissement",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_06",
    mileageTier: 5000,
    category: "FLUIDES",
    taskLabel: "Contrôle du niveau d'huile à frein/embrayage",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_07",
    mileageTier: 5000,
    category: "FLUIDES",
    taskLabel: "Contrôle du niveau d'huile boîte et pont",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_08",
    mileageTier: 5000,
    category: "FREINAGE",
    taskLabel: "Contrôle/remplacer les garnitures de frein",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_09",
    mileageTier: 5000,
    category: "MOTEUR",
    taskLabel: "Contrôle état des courroies",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_10",
    mileageTier: 5000,
    category: "SUSPENSION",
    taskLabel: "Contrôle de suspension et pneus",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_11",
    mileageTier: 5000,
    category: "ECLAIRAGE",
    taskLabel: "Contrôle éclairage et signalisation",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_12",
    mileageTier: 5000,
    category: "FLUIDES",
    taskLabel: "Graissage générale",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },
  {
    id: "chk_5k_13",
    mileageTier: 5000,
    category: "SCANNER",
    taskLabel: "Pose du scanner",
    defaultAppliesToTiers: [5000, 10000, 30000, 50000, 100000],
  },

  // ================= PALLIER 10 000 KM =================
  {
    id: "chk_10k_01",
    mileageTier: 10000,
    category: "MOTEUR",
    taskLabel: "Ajout de nettoyant injecteur",
    defaultAppliesToTiers: [10000, 30000, 50000, 100000],
  },
  {
    id: "chk_10k_02",
    mileageTier: 10000,
    category: "FILTRATION",
    taskLabel: "Remplacer filtre à gasoil",
    defaultAppliesToTiers: [10000, 30000, 50000, 100000],
  },
  {
    id: "chk_10k_03",
    mileageTier: 10000,
    category: "FILTRATION",
    taskLabel: "Échange de filtre à air",
    defaultAppliesToTiers: [10000, 30000, 50000, 100000],
  },
  {
    id: "chk_10k_04",
    mileageTier: 10000,
    category: "FILTRATION",
    taskLabel: "Échange de filtre habitacle",
    defaultAppliesToTiers: [10000, 30000, 50000, 100000],
  },

  // ================= PALLIER 30 000 KM =================
  {
    id: "chk_30k_01",
    mileageTier: 30000,
    category: "MOTEUR",
    taskLabel: "Échange des bougies d'allumage",
    defaultAppliesToTiers: [30000, 50000, 100000],
  },
  {
    id: "chk_30k_02",
    mileageTier: 30000,
    category: "FREINAGE",
    taskLabel: "Entretien du système de freinage",
    defaultAppliesToTiers: [30000, 50000, 100000],
  },

  // ================= PALLIER 50 000 KM =================
  {
    id: "chk_50k_01",
    mileageTier: 5000,
    category: "FLUIDES",
    taskLabel: "Vidange de liquide de frein",
    defaultAppliesToTiers: [50000, 100000],
  },
  {
    id: "chk_50k_02",
    mileageTier: 5000,
    category: "FLUIDES",
    taskLabel: "Vidange de liquide de refroidissement",
    defaultAppliesToTiers: [50000, 100000],
  },

  // ================= PALLIER 100 000 KM =================
  {
    id: "chk_100k_01",
    mileageTier: 100000,
    category: "FILTRATION",
    taskLabel: "Échange de filtre carburant essence",
    defaultAppliesToTiers: [100000],
  },
];

/**
 * Récupère les tâches applicables selon le palier sélectionné.
 * Selon le principe cumulatif du barème d'entretien :
 * Un entretien à 10k comprend le 5k + 10k.
 * Un entretien à 30k comprend le 5k + 10k + 30k, etc.
 */
export function getTasksForMileageTier(tier: number): ChecklistTemplateItem[] {
  return WORKSHOP_CHECKLIST_TEMPLATE.filter((task) =>
    task.defaultAppliesToTiers.includes(tier)
  );
}
