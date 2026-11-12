import { describe, expect, it } from "vitest";
import { parseExcelDate, parseRentalWorkbook } from "./rental-workbook";

const header = [
  " N° D'Ordre ",
  " NOMS ",
  " ADRESSE ",
  "N° CIP/CNI",
  "CONTACT_CLIENT",
  "PERSONNE A CONTACTER",
  "TYPE D'OPERATION",
  "AVEC OU SANS CHAUFFEUR",
  "NRE DE JOURS",
  "EFFET",
  "ECHEANCE",
  "",
  "MARQUE de VOITURE Loué",
  "COULEUR",
  "ANNEE",
  "ENERGIE",
  "PLACE",
  "MONTANT",
  "MOYEN DE PAIEMENT",
  "DATE D'OPERATION",
];

function row(overrides: Partial<Record<number, string>> = {}) {
  const base = [
    "1",
    "CLIENT TEST",
    "COTONOU",
    "3202488536060",
    "01 97 00 00 00",
    "",
    "LOCATION",
    "NON",
    "6",
    "7/8/26",
    "7/14/26",
    "",
    "CHANGAN X5",
    "BLANC",
    "2026",
    "ESSENCE",
    "5",
    "210000",
    "ESPECES",
    "7/8/26",
  ];
  return base.map((value, index) => overrides[index] ?? value);
}

describe("parseExcelDate", () => {
  it("lit le format M/J/AA confirme", () => {
    expect(parseExcelDate("7/8/26")?.toISOString()).toBe("2026-07-08T00:00:00.000Z");
    expect(parseExcelDate("7/14/26")?.toISOString()).toBe("2026-07-14T00:00:00.000Z");
  });

  it("refuse une date impossible", () => {
    expect(parseExcelDate("13/40/26")).toBeNull();
  });
});

describe("parseRentalWorkbook", () => {
  it("separe client, vehicule et contrat", () => {
    const preview = parseRentalWorkbook([header, row()]);
    expect(preview.clients).toHaveLength(1);
    expect(preview.vehicles).toHaveLength(1);
    expect(preview.contracts).toHaveLength(1);
    expect(preview.vehicles[0].fleetCode).toBe("LOC-X5-BLANC");
    expect(preview.contracts[0]).toMatchObject({
      days: 6,
      amountXof: 210000,
      dailyXof: 35000,
      withDriver: false,
      status: "TERMINE",
    });
  });

  it("fusionne les doublons clients et garde plusieurs contrats", () => {
    const preview = parseRentalWorkbook([header, row(), row({ 0: "2", 9: "7/20/26", 10: "7/25/26" })]);
    expect(preview.clients).toHaveLength(1);
    expect(preview.contracts).toHaveLength(2);
  });

  it("range CS55 creme avec le CS55 gris", () => {
    const preview = parseRentalWorkbook([header, row({ 12: "CHANGAN CS55", 13: "CREME" })]);
    expect(preview.vehicles[0].fleetCode).toBe("LOC-CCS55-GRIS");
    expect(preview.vehicles[0].color).toBe("Gris");
  });

  it("range RAV4 essence avec le RAV4 hybride", () => {
    const preview = parseRentalWorkbook([header, row({ 12: "RAV4", 13: "BLANC", 14: "2025", 15: "ESSENCE" })]);
    expect(preview.vehicles[0].fleetCode).toBe("LOC-RAV4-HYBRIDE");
    expect(preview.vehicles[0].energy).toBe("HYBRIDE");
  });

  it("ignore la ligne SUZUKI", () => {
    const preview = parseRentalWorkbook([header, row({ 12: "SUZUKI" })]);
    expect(preview.vehicles).toHaveLength(0);
    expect(preview.contracts).toHaveLength(0);
    expect(preview.ignoredRows).toBe(1);
  });

  it("garde le chauffeur vide et met le contrat en brouillon sans date", () => {
    const preview = parseRentalWorkbook([header, row({ 7: "", 9: "", 10: "" })]);
    expect(preview.contracts[0].withDriver).toBeNull();
    expect(preview.contracts[0].status).toBe("BROUILLON");
    expect(preview.contracts[0].startDate).toBeNull();
  });

  it("traite un montant non encaisse comme creance", () => {
    const preview = parseRentalWorkbook([header, row({ 17: "Pas encore encaissé" })]);
    expect(preview.contracts[0].amountXof).toBeNull();
    expect(preview.contracts[0].paymentStatus).toBe("NON_PAYE");
  });
});
