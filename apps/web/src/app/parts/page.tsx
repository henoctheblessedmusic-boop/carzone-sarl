import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { PartsView } from "./PartsView";

export default async function PartsPage() {
  const user = await requireUser([
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "CHEF_ATELIER",
    "ATELIER",
    "STOCK",
    "COMPTA",
    "ADMIN",
    "COMMERCIAL",
  ]);

  const [rawParts, workshopEntries] = await Promise.all([
    prisma.partItem.findMany({
      where: { active: true },
      include: {
        crossReferences: { orderBy: { brand: "asc" } },
        compatibilities: { orderBy: [{ vehicleBrand: "asc" }, { vehicleModel: "asc" }] },
        movements: { orderBy: { createdAt: "desc" }, take: 10 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.workshopEntry.findMany({
      where: { statusCode: { notIn: ["L", "HSAV"] } }, // En cours dans l'atelier
      select: {
        id: true,
        orNumber: true,
        immatriculation: true,
        brand: true,
        model: true,
        clientName: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const canManage = [
    "PDG",
    "SG",
    "DG",
    "RTA",
    "CHEF_ATELIER",
    "ATELIER",
    "STOCK",
    "ADMIN",
  ].includes(user.role);

  return (
    <AppShell user={user} titleKey="parts">
      <PartsView
        parts={rawParts}
        workshopEntries={workshopEntries}
        canManage={canManage}
      />
    </AppShell>
  );
}
