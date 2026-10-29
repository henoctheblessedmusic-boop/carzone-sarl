import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { FicheInterventionPrint } from "@/components/workshop/FicheInterventionPrint";

export default async function FicheInterventionPage({
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
    orNumber: entry.orNumber || "OR-2026",
    entryDate: entry.entryDate || new Date(entry.createdAt).toLocaleDateString("fr-FR"),
    brand: entry.brand || "-",
    model: entry.model || "-",
    immatriculation: entry.immatriculation || "EN ATTENTE",
    chassis: entry.chassis || "-",
    mileage: entry.mileage || 0,
    clientName: entry.clientName || "Client Carzone",
    phone: entry.phone || "",
    reportedFault: entry.reportedFault || entry.observations || "Entretien périodique programmé.",
    maintenanceTier: entry.maintenanceTier,
    faultMotorTransmission: entry.faultMotorTransmission || undefined,
    faultSuspension: entry.faultSuspension || undefined,
    faultElectricity: entry.faultElectricity || undefined,
    faultOthers: entry.faultOthers || undefined,
    worksDone: entry.worksDone || undefined,
    partsToOrder: entry.partsToOrder || undefined,
    observations: entry.observations || undefined,
    startTime: entry.startTime || undefined,
    endTime: entry.endTime || undefined,
    technicianName: entry.technicianName || undefined,
    workshopManagerName: entry.workshopManagerName || undefined,
    signatures: {
      client: signaturesMap["CLIENT"],
      technician: signaturesMap["TECHNICIEN"],
      workshopManager: signaturesMap["RESPONSABLE_ATELIER"],
    },
  };

  return <FicheInterventionPrint data={printData} />;
}
