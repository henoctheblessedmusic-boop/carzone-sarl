import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { FicheEntretienSystematiquePrint } from "@/components/workshop/FicheEntretienSystematiquePrint";

export default async function FicheEntretienPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Sécurité d'accès selon les rôles
  await requireUser([
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "CHEF_ATELIER",
    "ATELIER",
    "COMPTA",
    "ADMIN",
    "COMMERCIAL",
  ]);

  const entry = await prisma.workshopEntry.findUnique({
    where: { id },
    include: {
      signatures: true,
      checklistItems: true,
    },
  });

  if (!entry) {
    notFound();
  }

  // Mapper les signatures
  const signaturesMap: Record<string, string> = {};
  entry.signatures.forEach((s) => {
    signaturesMap[s.signerRole] = s.signatureData;
  });

  const printData = {
    id: entry.id,
    orNumber: entry.orNumber || "OR-SYS",
    entryDate: entry.entryDate || new Date(entry.createdAt).toLocaleDateString("fr-FR"),
    brand: entry.brand || "-",
    model: entry.model || "-",
    immatriculation: entry.immatriculation || "EN COURS",
    chassis: entry.chassis || "-",
    mileage: entry.mileage || 0,
    oilType: entry.oilType || undefined,
    pv: entry.pv || undefined,
    clientName: entry.clientName || "Client Carzone",
    phone: entry.phone || "",
    startTime: entry.startTime || undefined,
    endTime: entry.endTime || undefined,
    selectedTier: entry.maintenanceTier || 5000,
    tasks: entry.checklistItems.map((ci) => ({
      taskLabel: ci.taskLabel,
      category: ci.category || undefined,
      mileageTier: ci.mileageTier,
      status: (ci.status as any) || "NON_EFFECTUE",
      observation: ci.observation || undefined,
    })),
    observations: entry.observations || undefined,
    technicianName: entry.technicianName || undefined,
    workshopManagerName: entry.workshopManagerName || undefined,
    signatures: {
      client: signaturesMap["CLIENT"],
      technician: signaturesMap["TECHNICIEN"],
      workshopManager: signaturesMap["RESPONSABLE_ATELIER"],
    },
  };

  return <FicheEntretienSystematiquePrint data={printData} />;
}
