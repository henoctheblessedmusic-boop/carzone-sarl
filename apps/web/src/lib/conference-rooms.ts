export type ConferenceRoomDef = {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  minRole: string;
};

export const PREDEFINED_ROOMS: ConferenceRoomDef[] = [
  {
    id: "CONF_DIRECTION",
    name: "Salle Direction Générale & Stratégie",
    category: "DIRECTION",
    icon: "🏛️",
    description: "Comité de direction, arbitrage et décisions stratégiques",
    minRole: "ALL",
  },
  {
    id: "CONF_ATELIER",
    name: "Conférence Technique Atelier & SAV",
    category: "ATELIER",
    icon: "🔧",
    description: "Coordination des réparations, diagnostics véhicules et pièces",
    minRole: "ALL",
  },
  {
    id: "CONF_COMMERCIAL",
    name: "Conférence Commercial & Showroom",
    category: "COMMERCIAL",
    icon: "🚗",
    description: "Point commercial, suivi des devis, ventes et livraisons clients",
    minRole: "ALL",
  },
  {
    id: "CONF_GENERAL",
    name: "Conférence Générale d'Entreprise",
    category: "GENERAL",
    icon: "🌐",
    description: "Point d'équipe général ouvert à l'ensemble des collaborateurs",
    minRole: "ALL",
  },
];
