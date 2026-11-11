/**
 * Service de rattachement des véhicules à leur configuration commercialisable.
 *
 * Après le rattachement initial, les codes CFG-XX ne sont plus jamais attribués
 * à la main : toute création de véhicule, tout changement de version et tout
 * changement de couleur passe par ensureVehicleConfiguration().
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  configurationColorHex,
  describeIneligibility,
  isProvisionalVersionKey,
  nextConfigurationCode,
  resolveConfigurationKey,
  resolveDefaultConfigurationCodes,
  INELIGIBLE_VEHICLE_STATUSES,
  SHOWROOM_FLEET_TYPE,
  type ConfigurationKey,
  type ConfigurationSourceVehicle,
  type DefaultCandidate,
} from "@/lib/vehicle-configuration";
import type { PlanSourceVehicle } from "@/lib/vehicle-configuration-plan";

/** Nombre de tentatives en cas de collision sur le code, lors d'une saisie simultanée. */
const CODE_ALLOCATION_ATTEMPTS = 3;

type TransactionClient = Prisma.TransactionClient;

/** Projection minimale nécessaire pour calculer une clé de configuration. */
const VEHICLE_SELECTION = {
  id: true,
  vin: true,
  brand: true,
  model: true,
  variant: true,
  year: true,
  energy: true,
  status: true,
  fleetType: true,
  exteriorColorBase: true,
  exteriorColorShade: true,
  interiorColor: true,
  configurationId: true,
  version: { select: { key: true } },
} satisfies Prisma.VehicleSelect;

type SelectedVehicle = Prisma.VehicleGetPayload<{ select: typeof VEHICLE_SELECTION }>;

export type EnsureConfigurationOutcome =
  | { status: "SKIPPED"; reason: string }
  | {
      status: "LINKED";
      configurationId: string;
      code: string;
      /** La configuration vient d'être créée. */
      created: boolean;
      /** Le véhicule pointait déjà sur cette configuration : rien n'a changé pour lui. */
      alreadyLinked: boolean;
    };

function toSourceVehicle(vehicle: SelectedVehicle): ConfigurationSourceVehicle {
  return {
    vin: vehicle.vin,
    brand: vehicle.brand,
    model: vehicle.model,
    variant: vehicle.variant,
    year: vehicle.year,
    energy: vehicle.energy,
    status: vehicle.status,
    fleetType: vehicle.fleetType,
    exteriorColorBase: vehicle.exteriorColorBase,
    exteriorColorShade: vehicle.exteriorColorShade,
    interiorColor: vehicle.interiorColor,
    versionKey: vehicle.version?.key ?? null,
  };
}

/**
 * Retrouve ou crée la version portant cette clé.
 * Une clé en "A CONFIRMER" donne une version de rattachement provisoire :
 * le véhicule reste exploitable tant que la finition n'a pas été relevée.
 */
async function ensureVersion(
  tx: TransactionClient,
  key: ConfigurationKey,
  vehicle: SelectedVehicle,
): Promise<string> {
  const existing = await tx.vehicleVersion.findUnique({
    where: { key: key.versionKey },
    select: { id: true },
  });
  if (existing) return existing.id;

  const provisional = isProvisionalVersionKey(key.versionKey);
  const created = await tx.vehicleVersion.create({
    data: {
      key: key.versionKey,
      brand: vehicle.brand,
      model: vehicle.model,
      trim: provisional ? null : vehicle.variant,
      year: provisional ? null : vehicle.year,
      energy: provisional ? null : vehicle.energy,
      isProvisional: provisional,
    },
    select: { id: true },
  });
  return created.id;
}

/** Prochain code libre, lu dans la transaction pour limiter les collisions. */
async function allocateConfigurationCode(tx: TransactionClient): Promise<string> {
  const existing = await tx.vehicleConfiguration.findMany({ select: { code: true } });
  return nextConfigurationCode(existing.map((item) => item.code));
}

/**
 * Impose une seule configuration par défaut par version.
 * Prisma 5.22 ne sait pas exprimer un index unique partiel : la contrainte est
 * donc tenue ici, et c'est le seul endroit qui écrit isDefault.
 */
export async function syncVersionDefaultConfiguration(
  tx: TransactionClient,
  versionId: string,
): Promise<string | null> {
  const configurations = await tx.vehicleConfiguration.findMany({
    where: { versionId },
    select: { id: true, code: true, exteriorColorLabel: true },
    orderBy: { code: "asc" },
  });
  if (configurations.length === 0) return null;

  // Décompte par groupBy plutôt que par _count filtré : le comptage de relation
  // filtré n'est pas disponible partout en Prisma 5.22, groupBy l'est toujours.
  const counts = await tx.vehicle.groupBy({
    by: ["configurationId"],
    where: {
      configurationId: { in: configurations.map((configuration) => configuration.id) },
      fleetType: SHOWROOM_FLEET_TYPE,
      vin: { not: null },
      status: { notIn: [...INELIGIBLE_VEHICLE_STATUSES] },
    },
    _count: { _all: true },
  });
  const countById = new Map<string, number>();
  for (const row of counts) {
    if (row.configurationId) countById.set(row.configurationId, row._count._all);
  }

  const candidates: DefaultCandidate[] = configurations.map((configuration) => ({
    code: configuration.code,
    versionKey: versionId,
    exteriorColorLabel: configuration.exteriorColorLabel,
    vehicleCount: countById.get(configuration.id) ?? 0,
  }));
  const defaults = resolveDefaultConfigurationCodes(candidates);
  const winner = configurations.find((configuration) => defaults.has(configuration.code));
  if (!winner) return null;

  await tx.vehicleConfiguration.updateMany({
    where: { versionId, id: { not: winner.id }, isDefault: true },
    data: { isDefault: false },
  });
  await tx.vehicleConfiguration.updateMany({
    where: { versionId, id: winner.id, isDefault: false },
    data: { isDefault: true },
  });

  return winner.id;
}

async function linkVehicleOnce(
  vehicle: SelectedVehicle,
  key: ConfigurationKey,
  preferredCode: string | null,
): Promise<EnsureConfigurationOutcome> {
  return prisma.$transaction(async (tx) => {
    const versionId = await ensureVersion(tx, key, vehicle);
    const hex = configurationColorHex(key);

    const identity = {
      versionId,
      exteriorColorBase: key.exteriorColorBase,
      exteriorColorLabel: key.exteriorColorLabel,
      interiorColorLabel: key.interiorColorLabel,
    };

    let configuration = await tx.vehicleConfiguration.findUnique({
      where: {
        versionId_exteriorColorBase_exteriorColorLabel_interiorColorLabel: identity,
      },
      select: { id: true, code: true },
    });
    let created = false;

    if (!configuration) {
      const code = preferredCode ?? (await allocateConfigurationCode(tx));
      configuration = await tx.vehicleConfiguration.create({
        data: { ...identity, code, exteriorHex: hex.exteriorHex, interiorHex: hex.interiorHex },
        select: { id: true, code: true },
      });
      created = true;
    } else {
      // La palette peut évoluer : les pastilles suivent, l'identité ne bouge pas.
      await tx.vehicleConfiguration.update({
        where: { id: configuration.id },
        data: { exteriorHex: hex.exteriorHex, interiorHex: hex.interiorHex },
      });
    }

    const previousConfigurationId = vehicle.configurationId;
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { configurationId: configuration.id, versionId },
    });

    await syncVersionDefaultConfiguration(tx, versionId);
    if (previousConfigurationId && previousConfigurationId !== configuration.id) {
      const previous = await tx.vehicleConfiguration.findUnique({
        where: { id: previousConfigurationId },
        select: { versionId: true },
      });
      if (previous && previous.versionId !== versionId) {
        await syncVersionDefaultConfiguration(tx, previous.versionId);
      }
    }

    return {
      status: "LINKED" as const,
      configurationId: configuration.id,
      code: configuration.code,
      created,
      alreadyLinked: previousConfigurationId === configuration.id,
    };
  });
}

/**
 * Retrouve ou crée la configuration du véhicule et l'y rattache.
 *
 * Un véhicule non éligible (sans VIN, vendu, retiré, hors showroom) n'est pas
 * rattaché et son rattachement existant n'est pas effacé : les photos déjà
 * validées décrivent toujours ce véhicule.
 *
 * @param options.preferredCode Code imposé, réservé au rattachement initial
 *   depuis le classeur. Hors de ce cas le code est alloué automatiquement.
 */
export async function ensureVehicleConfiguration(
  vehicleId: string,
  options: { preferredCode?: string } = {},
): Promise<EnsureConfigurationOutcome> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: VEHICLE_SELECTION,
  });
  if (!vehicle) return { status: "SKIPPED", reason: "Véhicule introuvable" };

  const source = toSourceVehicle(vehicle);
  const key = resolveConfigurationKey(source);
  if (!key) {
    return { status: "SKIPPED", reason: describeIneligibility(source) ?? "Non éligible" };
  }

  const preferredCode = options.preferredCode ?? null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < CODE_ALLOCATION_ATTEMPTS; attempt += 1) {
    try {
      return await linkVehicleOnce(vehicle, key, preferredCode);
    } catch (error) {
      const isCodeCollision =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      // Un code imposé qui collisionne est une erreur de données, pas une course :
      // réessayer ne changerait rien.
      if (!isCodeCollision || preferredCode) throw error;
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Allocation du code de configuration impossible");
}

/**
 * Tous les véhicules du parc de vente, dans la forme attendue par
 * planConfigurationAssignments(). Lecture seule : c'est la source du mode essai
 * du script de rattachement.
 */
export async function loadShowroomConfigurationSources(): Promise<PlanSourceVehicle[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: { fleetType: SHOWROOM_FLEET_TYPE },
    select: { ...VEHICLE_SELECTION, configuration: { select: { code: true } } },
    orderBy: [{ vin: "asc" }],
  });

  return vehicles.map((vehicle) => ({
    ...toSourceVehicle(vehicle),
    id: vehicle.id,
    currentConfigurationCode: vehicle.configuration?.code ?? null,
  }));
}
