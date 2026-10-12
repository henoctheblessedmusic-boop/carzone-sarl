import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function wipeMockData() {
  console.log("🧹 Début du nettoyage complet de toutes les données inventées...");

  // 1. Transactions & Facturation
  const deletedPayments = await prisma.payment.deleteMany();
  console.log(`- Règlements supprimés : ${deletedPayments.count}`);

  const deletedInvoices = await prisma.invoice.deleteMany();
  console.log(`- Factures supprimées : ${deletedInvoices.count}`);

  const deletedQuoteLines = await prisma.quoteLine.deleteMany();
  console.log(`- Lignes de devis supprimées : ${deletedQuoteLines.count}`);

  const deletedQuotes = await prisma.quote.deleteMany();
  console.log(`- Devis/Proformas supprimés : ${deletedQuotes.count}`);

  // 2. Bornes de recharge & Sessions
  const deletedChargingInvoices = await prisma.chargingInvoice.deleteMany();
  console.log(`- Factures de recharge supprimées : ${deletedChargingInvoices.count}`);

  const deletedChargingSessions = await prisma.chargingSession.deleteMany();
  console.log(`- Sessions de recharge supprimées : ${deletedChargingSessions.count}`);

  const deletedSubscriptions = await prisma.chargingSubscription.deleteMany();
  console.log(`- Abonnements bornes supprimés : ${deletedSubscriptions.count}`);

  const deletedInstallerQuotes = await prisma.installerQuote.deleteMany();
  console.log(`- Devis installateurs supprimés : ${deletedInstallerQuotes.count}`);

  const deletedInstallRequests = await prisma.chargeInstallRequest.deleteMany();
  console.log(`- Demandes d'installation supprimées : ${deletedInstallRequests.count}`);

  // 3. Opérations atelier, location & flotte
  const deletedWorkOrders = await prisma.workOrder.deleteMany();
  console.log(`- Ordres de réparation (SAV) supprimés : ${deletedWorkOrders.count}`);

  const deletedRentals = await prisma.rental.deleteMany();
  console.log(`- Locations supprimées : ${deletedRentals.count}`);

  const deletedFleetVehicles = await prisma.fleetVehicle.deleteMany();
  console.log(`- Véhicules de flotte supprimés : ${deletedFleetVehicles.count}`);

  const deletedFleetAccounts = await prisma.fleetAccount.deleteMany();
  console.log(`- Comptes de flotte supprimés : ${deletedFleetAccounts.count}`);

  // 4. CRM, Opportunités, Essais, Tâches, Messagerie
  const deletedTestDrives = await prisma.testDrive.deleteMany();
  console.log(`- Essais routiers supprimés : ${deletedTestDrives.count}`);

  const deletedOpportunities = await prisma.opportunity.deleteMany();
  console.log(`- Opportunités supprimées : ${deletedOpportunities.count}`);

  const deletedLeads = await prisma.lead.deleteMany();
  console.log(`- Prospects (Leads) supprimés : ${deletedLeads.count}`);

  const deletedTasks = await prisma.task.deleteMany();
  console.log(`- Tâches supprimées : ${deletedTasks.count}`);

  const deletedMailMessages = await prisma.mailMessage.deleteMany();
  console.log(`- Messages de messagerie supprimés : ${deletedMailMessages.count}`);

  // 5. Clients
  const deletedCustomers = await prisma.customer.deleteMany();
  console.log(`- Clients supprimés : ${deletedCustomers.count}`);

  // 6. Stock de véhicules & Fournisseurs inventés
  const deletedVehicles = await prisma.vehicle.deleteMany();
  console.log(`- Véhicules en stock (inventés) supprimés : ${deletedVehicles.count}`);

  const deletedImportOrders = await prisma.importOrder.deleteMany();
  console.log(`- Commandes d'importation supprimées : ${deletedImportOrders.count}`);

  const deletedSuppliers = await prisma.supplier.deleteMany();
  console.log(`- Fournisseurs supprimés : ${deletedSuppliers.count}`);

  const deletedInstallers = await prisma.installer.deleteMany();
  console.log(`- Installateurs de démo supprimés : ${deletedInstallers.count}`);

  // 7. Articles & Services (catalogue de test)
  const deletedArticles = await prisma.article.deleteMany();
  console.log(`- Articles & services de test supprimés : ${deletedArticles.count}`);

  // 8. Stations de recharge de test
  const deletedStations = await prisma.chargingStation.deleteMany();
  console.log(`- Stations de recharge de test supprimées : ${deletedStations.count}`);

  const deletedPlans = await prisma.chargingPlan.deleteMany();
  console.log(`- Plans de recharge de test supprimés : ${deletedPlans.count}`);

  console.log("\n✨ Base de données nettoyée avec succès !");
  console.log("Les comptes utilisateurs réels du personnel et les sites de l'entreprise sont préservés pour la connexion.");
}

wipeMockData()
  .catch((e) => {
    console.error("Erreur lors du nettoyage :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
