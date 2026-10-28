/**
 * Types partagés pour la fiche atelier tablette (Fiche 1 Intervention & Fiche 2 Entretien).
 *
 * Source de vérité unique utilisée par :
 * - la Server Action `saveWorkshopTabletInspection` (apps/web/src/app/workshop/actions.ts)
 * - le modal tablette `WorkshopTabletModal` (apps/web/src/components/workshop/WorkshopTabletModal.tsx)
 *
 * Les paliers, statuts et rôles ci-dessous doivent rester alignés avec le schéma Prisma
 * (models WorkshopEntry, WorkshopChecklistItem, WorkshopSignature).
 */

export const MAINTENANCE_TIERS = [5000, 10000, 30000, 50000, 100000] as const;
export type MaintenanceTier = (typeof MAINTENANCE_TIERS)[number];

export const CHECKLIST_STATUSES = ["EFFECTUE", "NON_EFFECTUE", "NON_APPLICABLE"] as const;
export type ChecklistStatus = (typeof CHECKLIST_STATUSES)[number];

export const SIGNER_ROLES = ["CLIENT", "TECHNICIEN", "RESPONSABLE_ATELIER"] as const;
export type SignerRole = (typeof SIGNER_ROLES)[number];

export type WorkshopChecklistItemPayload = {
  taskLabel: string;
  category?: string | null;
  mileageTier: number;
  status: string;
  observation?: string | null;
};

export type WorkshopSignaturePayload = {
  signerRole: SignerRole;
  signerName: string;
  signatureData: string;
};

export type WorkshopTabletPayload = {
  id: string;
  reportedFault?: string;
  maintenanceTier?: number;
  faultMotorTransmission?: string;
  faultSuspension?: string;
  faultElectricity?: string;
  faultOthers?: string;
  worksDone?: string;
  partsToOrder?: string;
  observations?: string;
  startTime?: string;
  endTime?: string;
  technicianName?: string;
  workshopManagerName?: string;
  checklistItems?: WorkshopChecklistItemPayload[];
  signatures?: WorkshopSignaturePayload[];
};
