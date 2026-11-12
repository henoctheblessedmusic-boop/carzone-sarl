import { findMaintenances, findRentals, computeRentalFinancials } from "./data";

/**
 * Agrégats comptables de la location pour les tableaux de bord.
 * Source unique de calcul partagée avec la page Contrats.
 */
export async function getRentalAccountingSnapshot() {
  const [rentals, maintenances] = await Promise.all([findRentals(), findMaintenances()]);
  return computeRentalFinancials(rentals, maintenances, new Date());
}
