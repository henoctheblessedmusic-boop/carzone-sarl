/**
 * Rattachement des véhicules du showroom aux configurations du plan de prise de vue.
 *
 * Mode essai par défaut : le script lit la base, construit le plan, affiche le
 * rapport et n'écrit rien. L'écriture demande --apply explicitement.
 *
 * Idempotent : relancé après une écriture, il ne recrée rien et compte les
 * véhicules déjà rattachés au bon code.
 *
 * Il refuse d'écrire, sans rien modifier, si un VIN du classeur manque en base
 * ou si un véhicule éligible ne tombe dans aucune configuration (section 6 du
 * plan validé).
 *
 * Commandes :
 *   npx tsx scripts/assign-vehicle-configurations.ts
 *   npx tsx scripts/assign-vehicle-configurations.ts --apply
 */
import { prisma } from "../src/lib/prisma";
import { SHOWROOM_CONFIGURATIONS } from "../src/lib/data/showroom-configurations";
import {
  planConfigurationAssignments,
  plannedVehicleCount,
  type AssignmentPlan,
} from "../src/lib/vehicle-configuration-plan";
import {
  ensureVehicleConfiguration,
  loadShowroomConfigurationSources,
} from "../src/server/vehicle-configuration-service";

const APPLY_FLAG = "--apply";

type ApplyCounters = {
  configurationsCreated: number;
  vehiclesLinked: number;
  vehiclesAlreadyLinked: number;
  vehiclesSkipped: number;
  failures: { vin: string | null; message: string }[];
};

function line(title: string): void {
  console.log(`\n== ${title}`);
}

function printPlan(plan: AssignmentPlan, showroomCount: number): void {
  line("Stock lu");
  console.log(`Vehicules fleetType = SHOWROOM : ${showroomCount}`);
  console.log(`Vehicules eligibles rattachables : ${plannedVehicleCount(plan)}`);
  console.log(`Vehicules ecartes : ${plan.skipped.length}`);
  console.log(`Configurations du classeur : ${SHOWROOM_CONFIGURATIONS.length}`);
  console.log(`Configurations construites : ${plan.configurations.length}`);
  console.log(`Deja rattaches au bon code : ${plan.alreadyLinkedCount}`);

  line("Configurations");
  for (const configuration of plan.configurations) {
    const flag = configuration.isDefault ? " [defaut]" : "";
    console.log(
      `${configuration.code}${flag} | ${configuration.key.versionKey} | ext ${configuration.key.exteriorColorLabel} (base ${configuration.key.exteriorColorBase}, ${configuration.exteriorHex}) | int ${configuration.key.interiorColorLabel} (${configuration.interiorHex}) | ${configuration.vehicles.length} vehicule(s)`,
    );
    for (const vehicle of configuration.vehicles) {
      const current = vehicle.currentConfigurationCode ?? "aucune";
      console.log(`    ${vehicle.vin} (rattachement actuel : ${current})`);
    }
  }

  line("Versions de rattachement provisoire");
  if (plan.provisionalVersionKeys.length === 0) console.log("Aucune.");
  for (const key of plan.provisionalVersionKeys) console.log(`- ${key}`);

  line("Vehicules ecartes");
  if (plan.skipped.length === 0) console.log("Aucun.");
  for (const vehicle of plan.skipped) {
    console.log(`- ${vehicle.vin ?? "VIN absent"} | ${vehicle.label} | ${vehicle.reason}`);
  }

  line("Avertissements");
  if (plan.warnings.length === 0) console.log("Aucun.");
  for (const warning of plan.warnings) console.log(`- ${warning}`);

  line("Blocages");
  if (plan.blockers.length === 0) console.log("Aucun.");
  for (const blocker of plan.blockers) console.log(`- ${blocker}`);
}

async function applyPlan(plan: AssignmentPlan): Promise<ApplyCounters> {
  const counters: ApplyCounters = {
    configurationsCreated: 0,
    vehiclesLinked: 0,
    vehiclesAlreadyLinked: 0,
    vehiclesSkipped: 0,
    failures: [],
  };

  for (const configuration of plan.configurations) {
    for (const vehicle of configuration.vehicles) {
      try {
        const outcome = await ensureVehicleConfiguration(vehicle.id, {
          preferredCode: configuration.code,
        });
        if (outcome.status !== "LINKED") {
          counters.vehiclesSkipped += 1;
          continue;
        }
        if (outcome.created) counters.configurationsCreated += 1;
        if (outcome.alreadyLinked) counters.vehiclesAlreadyLinked += 1;
        else counters.vehiclesLinked += 1;
        if (outcome.code !== configuration.code) {
          counters.failures.push({
            vin: vehicle.vin,
            message: `Code obtenu ${outcome.code} au lieu de ${configuration.code}`,
          });
        }
      } catch (error) {
        counters.failures.push({
          vin: vehicle.vin,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return counters;
}

async function main(): Promise<void> {
  const apply = process.argv.includes(APPLY_FLAG);
  console.log(
    apply
      ? "MODE ECRITURE : la base va etre modifiee."
      : `MODE ESSAI : aucune ecriture. Ajouter ${APPLY_FLAG} pour appliquer.`,
  );

  const vehicles = await loadShowroomConfigurationSources();
  const plan = planConfigurationAssignments({ vehicles });
  printPlan(plan, vehicles.length);

  if (plan.blockers.length > 0) {
    console.error(
      `\nARRET : ${plan.blockers.length} blocage(s). Rien n'a ete ecrit. Corrigez les donnees puis relancez.`,
    );
    process.exitCode = 1;
    return;
  }

  if (!apply) {
    console.log(`\nEssai termine. Relancez avec ${APPLY_FLAG} pour ecrire.`);
    return;
  }

  const counters = await applyPlan(plan);
  line("Ecriture");
  console.log(`Configurations creees : ${counters.configurationsCreated}`);
  console.log(`Vehicules rattaches : ${counters.vehiclesLinked}`);
  console.log(`Vehicules deja rattaches : ${counters.vehiclesAlreadyLinked}`);
  console.log(`Vehicules ignores : ${counters.vehiclesSkipped}`);

  if (counters.failures.length > 0) {
    console.error(`\nECHECS : ${counters.failures.length}`);
    for (const failure of counters.failures) {
      console.error(`- ${failure.vin ?? "VIN absent"} : ${failure.message}`);
    }
    process.exitCode = 1;
    return;
  }

  // Relecture : le rapport affirme l'etat reel de la base, pas l'intention du script.
  const stored = await prisma.vehicleConfiguration.count();
  const linked = await prisma.vehicle.count({ where: { configurationId: { not: null } } });
  const defaults = await prisma.vehicleConfiguration.count({ where: { isDefault: true } });
  line("Relecture en base");
  console.log(`Configurations en base : ${stored}`);
  console.log(`Vehicules rattaches en base : ${linked}`);
  console.log(`Configurations par defaut : ${defaults}`);
}

main()
  .catch((error) => {
    console.error(
      "ASSIGN VEHICLE CONFIGURATIONS FAILED",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
