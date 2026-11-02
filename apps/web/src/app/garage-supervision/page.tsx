import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { GarageSupervisionView, type SupervisionEntry } from "./GarageSupervisionView";

const SUPERVISION_ROLES = [
  "COMPTA_GARAGE",
  "COMPTA",
  "CHEF_ATELIER",
  "DG",
  "PDG",
  "SG",
] as const;

const COST_APPROVER_ROLES = ["COMPTA_GARAGE", "COMPTA", "DG", "PDG", "SG"];

export default async function GarageSupervisionPage() {
  const user = await requireUser([...SUPERVISION_ROLES]);

  const entries = await prisma.workshopEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      orNumber: true,
      entryDate: true,
      clientName: true,
      phone: true,
      immatriculation: true,
      chassis: true,
      brand: true,
      model: true,
      mileage: true,
      statusCode: true,
      worksDone: true,
      technicianName: true,
      workshopManagerName: true,
      interventionType: true,
      laborCostXof: true,
      partsCostXof: true,
      otherCostXof: true,
      costNotes: true,
      costStatus: true,
      costApprovedBy: true,
      costApprovedAt: true,
      createdAt: true,
    },
  });

  const items: SupervisionEntry[] = entries.map((entry) => ({
    id: entry.id,
    orNumber: entry.orNumber,
    entryDate: entry.entryDate,
    clientName: entry.clientName,
    phone: entry.phone,
    immatriculation: entry.immatriculation,
    chassis: entry.chassis,
    brand: entry.brand,
    model: entry.model,
    mileage: entry.mileage,
    statusCode: entry.statusCode,
    worksDone: entry.worksDone,
    technicianName: entry.technicianName,
    workshopManagerName: entry.workshopManagerName,
    interventionType: entry.interventionType,
    laborCostXof: entry.laborCostXof,
    partsCostXof: entry.partsCostXof,
    otherCostXof: entry.otherCostXof,
    costNotes: entry.costNotes,
    costStatus: entry.costStatus,
    costApprovedBy: entry.costApprovedBy,
    costApprovedAt: entry.costApprovedAt ? entry.costApprovedAt.toISOString() : null,
    createdAt: entry.createdAt.toISOString(),
  }));

  return (
    <AppShell user={user} title="Supervision garage">
      <GarageSupervisionView
        entries={items}
        canApprove={COST_APPROVER_ROLES.includes(user.role)}
        isGarageAccountant={user.role === "COMPTA_GARAGE"}
      />
    </AppShell>
  );
}
