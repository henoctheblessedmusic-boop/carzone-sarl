/** Libellés et tonalités partagés par les trois sous-menus Location. */

export const STATUS_LABEL: Record<string, string> = {
  DISPONIBLE: "Disponible",
  LOUE: "Loué",
  MAINTENANCE: "Maintenance",
  HORS_SERVICE: "Hors service",
  ACTIF: "Actif",
  TERMINE: "Terminé",
  BROUILLON: "Brouillon",
  PLANIFIE: "Planifié",
  EN_COURS: "En cours",
  ANNULE: "Annulé",
  NOUVELLE: "Nouvelle",
  CONTACTEE: "Contactée",
  CONFIRMEE: "Confirmée",
  ANNULEE: "Annulée",
};

export const FIELD_STYLE = {
  height: 38,
  fontSize: "0.88rem",
} as const;

export const ENERGY_LABELS: Record<string, string> = {
  ESSENCE: "Essence",
  DIESEL: "Diesel",
  HYBRIDE: "Hybride",
  HYBRIDE_RECHARGEABLE: "Hybride rechargeable",
  PHEV: "Hybride rechargeable",
  ELECTRIQUE: "Électrique",
};

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  BERLINE: "Berline",
  SUV: "SUV",
  PICKUP: "Pick-up",
  VAN: "Van",
};

export const RENTAL_STATUS_TONES: Record<string, "ok" | "warn" | "bad" | "ice" | "neutral"> = {
  DISPONIBLE: "ok",
  LOUE: "ice",
  MAINTENANCE: "warn",
  HORS_SERVICE: "bad",
};
