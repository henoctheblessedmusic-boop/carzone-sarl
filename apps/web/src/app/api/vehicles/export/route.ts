import * as XLSX from "xlsx";
import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  COMMANDE: "Commande usine",
  EN_PRODUCTION: "En production",
  EN_TRANSIT: "En transit",
  AU_PORT: "Au port",
  EN_ARRIVAGE: "En arrivage",
  EN_MAGASIN: "En stock",
  EN_STOCK: "En stock",
  RESERVE: "Réservé",
  VENDU: "Vendu",
  RETIRE: "Retiré",
};

const ENERGY_LABELS: Record<string, string> = {
  ESSENCE: "Essence",
  DIESEL: "Diesel",
  HYBRIDE: "Hybride",
  PHEV: "Hybride rechargeable (PHEV)",
  ELECTRIQUE: "Électrique",
  NON_RENSEIGNEE: "",
};

const STOCK_COLUMNS = [
  "Marque",
  "Modèle",
  "Finition",
  "Année",
  "Énergie",
  "Moteur",
  "Transmission",
  "Boîte",
  "Places",
  "Autres caractéristiques",
  "Couleur ext.",
  "Teinte ext. exacte",
  "Couleur int.",
  "N° VIN",
  "Statut",
  "Site",
  "Date d'arrivée",
  "Fiche complète",
];

export async function GET() {
  const user = await getApiUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  if (!["DEVELOPER", "PDG"].includes(user.role)) return new Response("Accès refusé", { status: 403 });

  const vehicles = await prisma.vehicle.findMany({
    where: { fleetType: "SHOWROOM" },
    include: { version: true, site: true },
    orderBy: [{ brand: "asc" }, { model: "asc" }, { vin: "asc" }],
  });

  const stockRows = vehicles.map((vehicle) => [
    vehicle.brand,
    vehicle.model,
    vehicle.variant ?? "",
    vehicle.year ?? "",
    ENERGY_LABELS[vehicle.energy] ?? vehicle.energy,
    vehicle.version?.engineLabel ?? "",
    vehicle.version?.transmissionType ?? vehicle.transmission ?? "",
    vehicle.version?.gearboxLabel ?? "",
    vehicle.version?.seats ?? "",
    vehicle.version?.otherFeatures ?? "",
    vehicle.exteriorColorBase ?? "",
    vehicle.exteriorColorShade ?? vehicle.color ?? "",
    vehicle.interiorColor ?? "",
    vehicle.vin ?? "",
    STATUS_LABELS[vehicle.status] ?? vehicle.status,
    vehicle.stockZone ?? vehicle.site?.name ?? "",
    vehicle.arrivalDate ? vehicle.arrivalDate.toISOString().slice(0, 10) : "",
    vehicle.isIncompleteSheet ? "Non" : "Oui",
  ]);

  const stockSheet = XLSX.utils.aoa_to_sheet([
    ["CARZONE SARL - Stock global véhicules"],
    [`Export du ${new Date().toLocaleString("fr-FR")}`],
    [],
    STOCK_COLUMNS,
    ...stockRows,
  ]);

  const countsBy = <T extends string>(values: T[]) => {
    const map = new Map<string, number>();
    for (const value of values) map.set(value || "(non renseigné)", (map.get(value || "(non renseigné)") ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const recapRows: (string | number)[][] = [["Récapitulatifs", "Total"]];
  for (const [key, value] of countsBy(vehicles.map((v) => v.stockZone ?? v.site?.name ?? ""))) {
    recapRows.push([`Zone : ${key}`, value]);
  }
  for (const [key, value] of countsBy(vehicles.map((v) => `${v.brand} ${v.model}`))) {
    recapRows.push([`Modèle : ${key}`, value]);
  }
  for (const [key, value] of countsBy(vehicles.map((v) => ENERGY_LABELS[v.energy] ?? v.energy))) {
    recapRows.push([`Énergie : ${key}`, value]);
  }
  for (const [key, value] of countsBy(vehicles.map((v) => STATUS_LABELS[v.status] ?? v.status))) {
    recapRows.push([`Statut : ${key}`, value]);
  }
  recapRows.push(["Fiches incomplètes", vehicles.filter((v) => v.isIncompleteSheet).length]);

  const audit = await prisma.auditLog.findMany({
    where: { entityType: "Vehicle" },
    orderBy: { createdAt: "desc" },
    take: 1000,
    select: { createdAt: true, actorName: true, action: true, entityLabel: true, details: true },
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, stockSheet, "Stock Global");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(recapRows), "Récapitulatifs");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ["Date", "Auteur", "Action", "Véhicule", "Détails"],
      ...audit.map((row) => [row.createdAt.toISOString(), row.actorName, row.action, row.entityLabel ?? "", row.details ?? ""]),
    ]),
    "Journal",
  );

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="stock-carzone-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
