/**
 * Plan de rattachement des véhicules du showroom à leurs configurations.
 *
 * Fonctions pures, sans accès base : le script de rattachement les appelle en
 * mode essai avant d'écrire quoi que ce soit. Le plan refuse de conclure dès
 * qu'un écart empêche un rattachement sûr : pas de rattachement partiel
 * silencieux, comme l'exige la section 6 du plan validé.
 */

import {
  configurationColorHex,
  configurationKeyId,
  describeIneligibility,
  isProvisionalVersionKey,
  resolveConfigurationKey,
  resolveDefaultConfigurationCodes,
  type ConfigurationKey,
  type ConfigurationSourceVehicle,
  type DefaultCandidate,
} from "@/lib/vehicle-configuration";
import {
  SHOWROOM_CONFIGURATIONS,
  type ShowroomConfigurationReference,
} from "@/lib/data/showroom-configurations";

/** Véhicule tel que lu en base, enrichi de son identifiant. */
export type PlanSourceVehicle = ConfigurationSourceVehicle & {
  id: string;
  /** Code de configuration déjà enregistré, pour mesurer l'idempotence. */
  currentConfigurationCode?: string | null;
};

export type PlannedConfiguration = {
  /** Code CFG-XX imposé par le plan de prise de vue. */
  code: string;
  key: ConfigurationKey;
  keyId: string;
  exteriorHex: string;
  interiorHex: string;
  isDefault: boolean;
  vehicles: PlanSourceVehicle[];
};

export type PlanSkippedVehicle = {
  id: string;
  vin: string | null;
  label: string;
  reason: string;
};

export type AssignmentPlan = {
  configurations: PlannedConfiguration[];
  skipped: PlanSkippedVehicle[];
  /** Clés des versions de rattachement provisoire nécessaires au plan. */
  provisionalVersionKeys: string[];
  /** Écarts qui interdisent d'écrire. Le script s'arrête si la liste n'est pas vide. */
  blockers: string[];
  /** Écarts signalés mais non bloquants : la base reste la référence. */
  warnings: string[];
  /** Véhicules déjà rattachés au bon code : rien à écrire pour eux. */
  alreadyLinkedCount: number;
};

function vehicleLabel(vehicle: PlanSourceVehicle): string {
  const parts = [vehicle.brand, vehicle.model, vehicle.variant ?? ""].filter((part) => part.trim());
  return parts.join(" ").trim() || "Véhicule sans libellé";
}

/** Codes attendus pour les VIN d'un groupe, dédoublonnés et triés. */
function referenceCodesOf(
  vehicles: readonly PlanSourceVehicle[],
  codeByVin: ReadonlyMap<string, string>,
): string[] {
  const codes = new Set<string>();
  for (const vehicle of vehicles) {
    const code = codeByVin.get((vehicle.vin ?? "").trim());
    if (code) codes.add(code);
  }
  return [...codes].sort();
}

function buildCodeByVin(reference: readonly ShowroomConfigurationReference[]) {
  const codeByVin = new Map<string, string>();
  const duplicates: string[] = [];
  for (const configuration of reference) {
    for (const vin of configuration.vins) {
      const existing = codeByVin.get(vin);
      if (existing && existing !== configuration.code) {
        duplicates.push(`VIN ${vin} présent sur ${existing} et ${configuration.code}`);
        continue;
      }
      codeByVin.set(vin, configuration.code);
    }
  }
  return { codeByVin, duplicates };
}

/**
 * Compare la teinte du classeur à celle calculée depuis la base.
 * La base reste la référence : l'écart est signalé, jamais corrigé en silence.
 */
function collectColorWarnings(
  configuration: PlannedConfiguration,
  reference: ShowroomConfigurationReference | undefined,
): string[] {
  if (!reference) return [];
  const warnings: string[] = [];
  if (reference.exteriorColorLabel !== configuration.key.exteriorColorLabel) {
    warnings.push(
      `${configuration.code} : teinte extérieure "${reference.exteriorColorLabel}" au classeur, "${configuration.key.exteriorColorLabel}" en base`,
    );
  }
  if (reference.interiorColorLabel !== configuration.key.interiorColorLabel) {
    warnings.push(
      `${configuration.code} : intérieur "${reference.interiorColorLabel}" au classeur, "${configuration.key.interiorColorLabel}" en base`,
    );
  }
  return warnings;
}

/**
 * Construit le plan de rattachement.
 *
 * Bloque dans quatre cas : un VIN du classeur absent de la base, un véhicule
 * éligible hors classeur, un groupe réclamé par deux codes, un code réclamé par
 * deux groupes. Chacun signale une divergence de données que seul un humain
 * peut trancher.
 */
export function planConfigurationAssignments(input: {
  vehicles: readonly PlanSourceVehicle[];
  reference?: readonly ShowroomConfigurationReference[];
}): AssignmentPlan {
  const reference = input.reference ?? SHOWROOM_CONFIGURATIONS;
  const { codeByVin, duplicates } = buildCodeByVin(reference);
  const referenceByCode = new Map(reference.map((item) => [item.code, item]));

  const blockers: string[] = [...duplicates];
  const warnings: string[] = [];
  const skipped: PlanSkippedVehicle[] = [];
  const groups = new Map<string, { key: ConfigurationKey; vehicles: PlanSourceVehicle[] }>();

  for (const vehicle of input.vehicles) {
    const key = resolveConfigurationKey(vehicle);
    if (!key) {
      skipped.push({
        id: vehicle.id,
        vin: vehicle.vin,
        label: vehicleLabel(vehicle),
        reason: describeIneligibility(vehicle) ?? "Non éligible",
      });
      continue;
    }
    const keyId = configurationKeyId(key);
    const existing = groups.get(keyId);
    if (existing) existing.vehicles.push(vehicle);
    else groups.set(keyId, { key, vehicles: [vehicle] });
  }

  const seenVins = new Set(
    input.vehicles.map((vehicle) => (vehicle.vin ?? "").trim()).filter(Boolean),
  );
  for (const [vin, code] of codeByVin) {
    if (!seenVins.has(vin)) {
      blockers.push(`VIN ${vin} du classeur (${code}) absent du stock showroom`);
    }
  }

  const configurations: PlannedConfiguration[] = [];
  const groupsByCode = new Map<string, string[]>();

  for (const [keyId, group] of groups) {
    const codes = referenceCodesOf(group.vehicles, codeByVin);
    const outsidePlan = group.vehicles.filter(
      (vehicle) => !codeByVin.has((vehicle.vin ?? "").trim()),
    );

    if (codes.length === 0) {
      for (const vehicle of outsidePlan) {
        blockers.push(
          `VIN ${vehicle.vin} (${vehicleLabel(vehicle)}) est éligible mais absent du classeur : aucun code CFG-XX à lui attribuer`,
        );
      }
      continue;
    }
    if (codes.length > 1) {
      blockers.push(
        `Configuration ${group.key.exteriorColorLabel} / ${group.key.interiorColorLabel} de ${group.key.versionKey} réclamée par plusieurs codes : ${codes.join(", ")}`,
      );
      continue;
    }
    if (outsidePlan.length > 0) {
      blockers.push(
        `${codes[0]} regroupe des VIN hors classeur : ${outsidePlan.map((vehicle) => vehicle.vin).join(", ")}`,
      );
      continue;
    }

    const code = codes[0];
    const bucket = groupsByCode.get(code);
    if (bucket) bucket.push(keyId);
    else groupsByCode.set(code, [keyId]);

    const hex = configurationColorHex(group.key);
    configurations.push({
      code,
      key: group.key,
      keyId,
      exteriorHex: hex.exteriorHex,
      interiorHex: hex.interiorHex,
      isDefault: false,
      vehicles: group.vehicles,
    });
  }

  for (const [code, keyIds] of groupsByCode) {
    if (keyIds.length > 1) {
      blockers.push(
        `${code} éclaté sur ${keyIds.length} configurations distinctes en base : les véhicules de ce dossier photo n'ont pas la même teinte ni le même intérieur`,
      );
    }
  }

  configurations.sort((a, b) => a.code.localeCompare(b.code));

  const candidates: DefaultCandidate[] = configurations.map((configuration) => ({
    code: configuration.code,
    versionKey: configuration.key.versionKey,
    exteriorColorLabel: configuration.key.exteriorColorLabel,
    vehicleCount: configuration.vehicles.length,
  }));
  const defaultCodes = resolveDefaultConfigurationCodes(candidates);
  for (const configuration of configurations) {
    configuration.isDefault = defaultCodes.has(configuration.code);
    warnings.push(...collectColorWarnings(configuration, referenceByCode.get(configuration.code)));
  }

  const provisionalVersionKeys = [
    ...new Set(
      configurations
        .map((configuration) => configuration.key.versionKey)
        .filter(isProvisionalVersionKey),
    ),
  ].sort();

  const alreadyLinkedCount = configurations.reduce(
    (total, configuration) =>
      total +
      configuration.vehicles.filter(
        (vehicle) => vehicle.currentConfigurationCode === configuration.code,
      ).length,
    0,
  );

  if (blockers.length === 0 && configurations.length !== reference.length) {
    warnings.push(
      `${configurations.length} configurations construites pour ${reference.length} attendues au classeur`,
    );
  }

  return {
    configurations,
    skipped,
    provisionalVersionKeys,
    blockers,
    warnings,
    alreadyLinkedCount,
  };
}

/** Nombre de véhicules que le plan rattache effectivement. */
export function plannedVehicleCount(plan: AssignmentPlan): number {
  return plan.configurations.reduce(
    (total, configuration) => total + configuration.vehicles.length,
    0,
  );
}
