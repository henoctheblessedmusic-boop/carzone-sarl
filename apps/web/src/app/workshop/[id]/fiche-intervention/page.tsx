import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { FicheInterventionPrint } from "@/components/workshop/FicheInterventionPrint";
import { getServerMessages } from "@/lib/i18n/server";
import { workshopCopy } from "@/lib/i18n/messages/workshop";

export default async function FicheInterventionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale } = await getServerMessages();
  const copy = workshopCopy[locale];

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
    entryDate:
      entry.entryDate || new Date(entry.createdAt).toLocaleDateString(copy.dateLocale),
    brand: entry.brand || "-",
    model: entry.model || "-",
    immatriculation: entry.immatriculation || copy.print.fallbacks.immatPending,
    chassis: entry.chassis || "-",
    mileage: entry.mileage || 0,
    clientName: entry.clientName || copy.print.fallbacks.clientName,
    phone: entry.phone || "",
    reportedFault:
      entry.reportedFault || entry.observations || copy.print.fallbacks.faultDefault,
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
