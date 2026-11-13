import { findDriverPayments, findMaintenances, findRentalExpenses, findRentals, computeRentalFinancials } from "./data";

/**
 * Agrégats comptables de la location pour les tableaux de bord.
 * Source unique de calcul partagée avec la page Contrats.
 */
export async function getRentalAccountingSnapshot() {
  const [rentals, maintenances, rentalExpenses, driverPayments] = await Promise.all([
    findRentals(),
    findMaintenances(),
    findRentalExpenses(),
    findDriverPayments(),
  ]);
  return computeRentalFinancials(rentals, maintenances, new Date(), rentalExpenses, driverPayments);
}
