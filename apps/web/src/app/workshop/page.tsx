import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { WorkshopView, type WorkshopItem } from "./WorkshopView";
import { REAL_WORKSHOP_RECORDS } from "@/lib/workshop-seed-data";

export default async function WorkshopPage() {
  const user = await requireUser([
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "CHEF_ATELIER",
    "ASSISTANTE_COMPTABLE",
    "ATELIER",
    "COMPTA",
    "ADMIN",
  ]);

  const count = await prisma.workshopEntry.count();

  // Auto-seed avec les 25+ passages réels de l'atelier issus du fichier Excel
  if (count === 0) {
    for (const row of REAL_WORKSHOP_RECORDS) {
      let customer = await prisma.customer.findFirst({
        where: { contactName: { equals: row.clientName, mode: "insensitive" } },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            contactName: row.clientName,
            phone: row.phone || null,
            category: row.clientType === "Interne" ? "Interne" : "Particulier",
            city: "Cotonou",
            notes: "Importé depuis historique Excel atelier",
          },
        });
      }

      let vehicle = null;
      if (row.chassis) {
        vehicle = await prisma.vehicle.findFirst({
          where: { vin: row.chassis },
        });
      }
      // Règle Métier : Les véhicules immatriculés clients sont des réparations / prestations atelier,
      // ils ne sont JAMAIS créés dans le stock concession (véhicules neufs de vente).

      await prisma.workshopEntry.create({
        data: {
          entryDate: row.entryDate || null,
          entryTime: row.entryTime || null,
          orNumber: row.orNumber || null,
          immatriculation: row.immatriculation,
          chassis: row.chassis || null,
          brand: row.brand || null,
          model: row.model || null,
          mileage: row.mileage || null,
          clientName: row.clientName,
          clientType: row.clientType || "Client",
          fuelLevel: row.fuelLevel || null,
          phone: row.phone || null,
          receptionist: row.receptionist || null,
          immobilizationDuration: row.immobilizationDuration || null,
          observations: row.observations || null,
          presenceSav: row.presenceSav || "NON",
          statusCode: row.statusCode || "C",
          endWorksAt: row.endWorksAt || null,
          executionDuration: row.executionDuration || null,
          worksDone: row.worksDone || null,
          exitDate: row.exitDate || null,
          exitTime: row.exitTime || null,
          deliverer: row.deliverer || null,
          paymentMode: row.paymentMode || null,
          customerId: customer.id,
          vehicleId: vehicle ? vehicle.id : null,
        },
      });
    }
  }

  const entries = await prisma.workshopEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Récupérer les clients en base pour la sélection et l'auto-remplissage (téléphone, véhicule)
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      contactName: true,
      companyName: true,
      phone: true,
      category: true,
      workshopEntries: {
        select: {
          immatriculation: true,
          brand: true,
          model: true,
          chassis: true,
        },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { contactName: "asc" },
  });

  const customerOptions = customers.map((c) => {
    const latest = c.workshopEntries[0];
    return {
      id: c.id,
      name: c.contactName || c.companyName || "Sans nom",
      phone: c.phone || "",
      clientType: c.category || "Client",
      immatriculation: latest?.immatriculation || "",
      brand: latest?.brand || "",
      model: latest?.model || "",
      chassis: latest?.chassis || "",
    };
  });

  // Enrichir avec les clients des passages atelier passés si pas déjà dans la liste
  const knownCustomerNames = new Set(customerOptions.map((c) => c.name.toLowerCase().trim()));
  for (const e of entries) {
    const trimmed = e.clientName?.trim();
    if (trimmed && !knownCustomerNames.has(trimmed.toLowerCase())) {
      knownCustomerNames.add(trimmed.toLowerCase());
      customerOptions.push({
        id: `workshop_${e.id}`,
        name: trimmed,
        phone: e.phone || "",
        clientType: e.clientType || "Client",
        immatriculation: e.immatriculation || "",
        brand: e.brand || "",
        model: e.model || "",
        chassis: e.chassis || "",
      });
    }
  }
  customerOptions.sort((a, b) => a.name.localeCompare(b.name));

  // Récupérer les réceptionnaires (utilisateurs + existants + standards atelier)
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { fullName: true, role: true },
    orderBy: { fullName: "asc" },
  });

  const existingReceptionists = await prisma.workshopEntry.findMany({
    where: { receptionist: { not: null } },
    select: { receptionist: true },
    distinct: ["receptionist"],
  });

  const receptionistList = Array.from(
    new Set([
      "Madochée",
      "TYCHIQUE",
      ...existingReceptionists.map((r) => r.receptionist?.trim()).filter(Boolean),
      ...users.map((u) => u.fullName?.trim()).filter(Boolean),
    ])
  ).sort((a, b) => (a as string).localeCompare(b as string)) as string[];

  const formattedEntries: WorkshopItem[] = entries.map((e) => ({
    id: e.id,
    entryDate: e.entryDate,
    entryTime: e.entryTime,
    orNumber: e.orNumber,
    immatriculation: e.immatriculation,
    chassis: e.chassis,
    brand: e.brand,
    model: e.model,
    mileage: e.mileage,
    clientName: e.clientName,
    clientType: e.clientType,
    fuelLevel: e.fuelLevel,
    phone: e.phone,
    receptionist: e.receptionist,
    immobilizationDuration: e.immobilizationDuration,
    observations: e.observations,
    presenceSav: e.presenceSav,
    statusCode: e.statusCode,
    endWorksAt: e.endWorksAt,
    executionDuration: e.executionDuration,
    worksDone: e.worksDone,
    exitDate: e.exitDate,
    exitTime: e.exitTime,
    deliverer: e.deliverer,
    paymentMode: e.paymentMode,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <AppShell user={user} titleKey="workshop">
      <WorkshopView
        initialEntries={formattedEntries}
        userRole={user.role}
        customers={customerOptions}
        receptionists={receptionistList}
      />
    </AppShell>
  );
}
