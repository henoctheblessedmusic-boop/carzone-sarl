import { prisma } from "@/lib/prisma";
import { computeRentalTotal, rentalDaysBetween } from "@/lib/rental-contract";

/** Rôles autorisés à ouvrir l'espace Location (parc, contrats, entretiens). */
export const RENTAL_ROLES = ["GESTIONNAIRE_LOCATION", "COMPTA", "DG", "PDG", "SG"] as const;
/** Rôles pouvant créer / modifier le parc, les contrats et les entretiens. */
export const MANAGE_ROLES = ["GESTIONNAIRE_LOCATION", "DG", "PDG", "SG"] as const;
/** Rôles pouvant encaisser et consulter la comptabilité de la location. */
export const FINANCE_ROLES = ["GESTIONNAIRE_LOCATION", "COMPTA", "DG", "PDG", "SG"] as const;

export type RentalAccess = { canManage: boolean; canFinance: boolean };

export function rentalAccess(role: string): RentalAccess {
  return {
    canManage: (MANAGE_ROLES as readonly string[]).includes(role),
    canFinance: (FINANCE_ROLES as readonly string[]).includes(role),
  };
}

export function findRentals() {
  return prisma.rental.findMany({
    include: {
      customer: true,
      vehicle: true,
      payments: { orderBy: { paidAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findRentalVehicles() {
  return prisma.vehicle.findMany({
    where: { fleetType: "RENTAL" },
    include: { supplier: true, site: true },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
  });
}

export function findShowroomVehicles() {
  return prisma.vehicle.findMany({
    where: { fleetType: "SHOWROOM", status: { in: ["EN_STOCK", "EN_MAGASIN"] } },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    select: { id: true, brand: true, model: true, vin: true },
  });
}

/**
 * Clients proposés dans les formulaires de location. Le gestionnaire de la
 * location ne voit que les clients de son périmètre (scopeRental) ou déjà
 * rattachés à un contrat.
 */
export function findRentalCustomers(role: string) {
  return prisma.customer.findMany({
    where:
      role === "GESTIONNAIRE_LOCATION"
        ? { active: true, OR: [{ scopeRental: true }, { rentals: { some: {} } }] }
        : { active: true },
    orderBy: { contactName: "asc" },
    select: { id: true, contactName: true, companyName: true },
  });
}

export function findMaintenances() {
  return prisma.rentalMaintenance.findMany({
    include: { vehicle: { select: { id: true, brand: true, model: true, registrationNumber: true } } },
    orderBy: [{ status: "asc" }, { scheduledAt: "desc" }, { createdAt: "desc" }],
  });
}

export function findRentalExpenses() {
  return prisma.rentalExpense.findMany({
    include: { vehicle: { select: { id: true, brand: true, model: true, registrationNumber: true } } },
    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
  });
}

/** Salariés pouvant être sélectionnés comme chauffeurs location. */
export function findRentalDrivers() {
  return prisma.employee.findMany({
    where: {
      status: "ACTIF",
      OR: [{ isDriver: true }, { jobTitle: { contains: "chauffeur", mode: "insensitive" } }],
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeNumber: true,
      phone: true,
      jobTitle: true,
      isDriver: true,
    },
  });
}

export function findDriverPayments() {
  return prisma.driverPayment.findMany({
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true, jobTitle: true } },
      rental: { select: { id: true, startDate: true, endDate: true } },
      expense: { select: { id: true, expenseNumber: true, amountTtcXof: true } },
    },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
  });
}

export function findRentalRequests() {
  return prisma.rentalRequest.findMany({
    include: { vehicle: { select: { id: true, brand: true, model: true, registrationNumber: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export function findVehicleBrands() {
  return prisma.vehicleBrand.findMany({
    where: { active: true },
    include: {
      models: {
        where: { active: true },
        orderBy: { name: "asc" },
        select: { name: true, vehicleType: true, energy: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export function findGarageUsers() {
  return prisma.user.findMany({
    where: { active: true, role: { in: ["CHEF_ATELIER", "ATELIER", "RTA"] } },
    select: { id: true, fullName: true, role: true },
    orderBy: { fullName: "asc" },
  });
}

export type RentalWithRelations = Awaited<ReturnType<typeof findRentals>>[number];
export type RentalVehicle = Awaited<ReturnType<typeof findRentalVehicles>>[number];
export type ShowroomVehicle = Awaited<ReturnType<typeof findShowroomVehicles>>[number];
export type RentalCustomer = Awaited<ReturnType<typeof findRentalCustomers>>[number];
export type RentalMaintenanceRow = Awaited<ReturnType<typeof findMaintenances>>[number];
export type RentalExpenseRow = Awaited<ReturnType<typeof findRentalExpenses>>[number];
export type RentalDriverRow = Awaited<ReturnType<typeof findRentalDrivers>>[number];
export type DriverPaymentRow = Awaited<ReturnType<typeof findDriverPayments>>[number];
export type RentalRequestRow = Awaited<ReturnType<typeof findRentalRequests>>[number];
export type VehicleBrandOption = Awaited<ReturnType<typeof findVehicleBrands>>[number];
export type GarageUserOption = Awaited<ReturnType<typeof findGarageUsers>>[number];

/**
 * Valeur attendue d'un contrat : le total enregistré, sinon le total recalculé
 * depuis le tarif et la durée réellement courue.
 */
export function expectedContractValue(rental: RentalWithRelations): number {
  if (rental.totalXof) return rental.totalXof;
  const end = rental.returnedAt || rental.endDate;
  const days = rental.days || rentalDaysBetween(rental.startDate, end);
  return (
    computeRentalTotal({
      dailyXof: rental.dailyXof || rental.vehicle.rentalDailyXof,
      monthlyXof: rental.monthlyXof,
      days,
    }) || 0
  );
}

export type RentalFinancials = {
  paidByRental: Map<string, number>;
  totalReceived: number;
  receivedThisMonth: number;
  totalBalance: number;
  maintenanceCost: number;
  netRentalRevenue: number;
};

/** Agrégats comptables de la location, partagés par les trois sous-menus. */
export function computeRentalFinancials(
  rentals: RentalWithRelations[],
  maintenances: RentalMaintenanceRow[],
  now: Date,
  rentalExpenses: RentalExpenseRow[] = [],
  driverPayments: DriverPaymentRow[] = []
): RentalFinancials {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const paidByRental = new Map(
    rentals.map((rental) => [rental.id, rental.payments.reduce((sum, payment) => sum + payment.amountXof, 0)])
  );
  const totalReceived = rentals.reduce((sum, rental) => sum + (paidByRental.get(rental.id) || 0), 0);
  const receivedThisMonth = rentals.reduce(
    (sum, rental) =>
      sum +
      rental.payments
        .filter((payment) => payment.paidAt >= monthStart)
        .reduce((paymentSum, payment) => paymentSum + payment.amountXof, 0),
    0
  );
  const totalBalance = rentals.reduce(
    (sum, rental) => sum + Math.max(0, expectedContractValue(rental) - (paidByRental.get(rental.id) || 0)),
    0
  );
  const maintenanceCost =
    maintenances.reduce((sum, item) => sum + item.costXof, 0) +
    rentalExpenses.reduce((sum, item) => sum + item.amountXof, 0) +
    driverPayments.reduce((sum, item) => sum + item.amountXof, 0);

  return {
    paidByRental,
    totalReceived,
    receivedThisMonth,
    totalBalance,
    maintenanceCost,
    netRentalRevenue: totalReceived - maintenanceCost,
  };
}
