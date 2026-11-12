import { describe, expect, it } from "vitest";
import {
  formatRentalDateLong,
  rentalExteriorColor,
  rentalFuelLabel,
  rentalVehicleLabel,
  rentalVehicleSpecs,
  type RentalContractVehicle,
} from "@/lib/rental-contract";

/** Véhicule locatif complet, tel que le renvoie Prisma avec la version catalogue. */
function makeVehicle(overrides: Partial<RentalContractVehicle> = {}): RentalContractVehicle {
  return {
    brand: "Changan",
    model: "CS55 Plus",
    variant: "Deuxième génération",
    year: 2024,
    registrationNumber: "AB 1234 RB",
    vin: "LSXXXXXXXXXXXXXXX",
    color: "Blanc",
    exteriorColorBase: "Blanc",
    exteriorColorShade: "Blanc Nacré",
    interiorColor: "Noir",
    energy: "ESSENCE",
    mileage: 12500,
    version: { trim: "Luxury", seats: 5 },
    ...overrides,
  };
}

describe("rentalVehicleSpecs", () => {
  it("rend les neuf caractéristiques de l'article 2 dans l'ordre du canevas", () => {
    // Arrange
    const vehicle = makeVehicle();

    // Act
    const specs = rentalVehicleSpecs(vehicle);

    // Assert
    expect(specs.map((spec) => spec.label)).toEqual([
      "Marque",
      "Modèle",
      "Année modèle",
      "Génération",
      "Carburant",
      "Nombre de places",
      "Couleur extérieure",
      "Couleur intérieure",
      "Numéro VIN (châssis)",
    ]);
  });

  it("reprend les valeurs réelles du véhicule sélectionné", () => {
    // Arrange
    const vehicle = makeVehicle();

    // Act
    const values = Object.fromEntries(
      rentalVehicleSpecs(vehicle).map((spec) => [spec.label, spec.value]),
    );

    // Assert
    expect(values).toMatchObject({
      Marque: "Changan",
      Modèle: "CS55 Plus",
      "Année modèle": "2024",
      Génération: "Deuxième génération",
      Carburant: "Essence",
      "Nombre de places": "5 places",
      "Couleur extérieure": "Blanc Nacré",
      "Couleur intérieure": "Noir",
      "Numéro VIN (châssis)": "LSXXXXXXXXXXXXXXX",
    });
  });

  it("retombe sur la finition de la version quand le véhicule n'a pas de variante", () => {
    // Arrange
    const vehicle = makeVehicle({ variant: null });

    // Act
    const generation = rentalVehicleSpecs(vehicle).find((spec) => spec.label === "Génération");

    // Assert
    expect(generation?.value).toBe("Luxury");
  });

  it("laisse un tiret quand la fiche véhicule ne renseigne pas le champ", () => {
    // Arrange
    const vehicle = makeVehicle({
      variant: null,
      year: null,
      vin: null,
      interiorColor: null,
      version: null,
    });

    // Act
    const values = Object.fromEntries(
      rentalVehicleSpecs(vehicle).map((spec) => [spec.label, spec.value]),
    );

    // Assert
    expect(values).toMatchObject({
      "Année modèle": "-",
      Génération: "-",
      "Nombre de places": "-",
      "Couleur intérieure": "-",
      "Numéro VIN (châssis)": "-",
    });
  });

  it("laisse un tiret sur les places quand la version n'est pas chargée", () => {
    // Arrange
    const vehicle = makeVehicle({ version: undefined });

    // Act
    const seats = rentalVehicleSpecs(vehicle).find((spec) => spec.label === "Nombre de places");

    // Assert
    expect(seats?.value).toBe("-");
  });

  it("accorde le singulier sur un véhicule une place", () => {
    // Arrange
    const vehicle = makeVehicle({ version: { trim: null, seats: 1 } });

    // Act
    const seats = rentalVehicleSpecs(vehicle).find((spec) => spec.label === "Nombre de places");

    // Assert
    expect(seats?.value).toBe("1 place");
  });
});

describe("rentalExteriorColor", () => {
  it("privilégie la teinte exacte sur la couleur de base", () => {
    expect(rentalExteriorColor(makeVehicle())).toBe("Blanc Nacré");
  });

  it("retombe sur la couleur de base puis sur la couleur libre", () => {
    expect(rentalExteriorColor(makeVehicle({ exteriorColorShade: null }))).toBe("Blanc");
    expect(
      rentalExteriorColor(
        makeVehicle({ exteriorColorShade: null, exteriorColorBase: null, color: "Gris" }),
      ),
    ).toBe("Gris");
  });

  it("laisse un tiret quand aucune teinte n'est renseignée", () => {
    expect(
      rentalExteriorColor(
        makeVehicle({ exteriorColorShade: null, exteriorColorBase: null, color: null }),
      ),
    ).toBe("-");
  });
});

describe("rentalFuelLabel", () => {
  it("traduit les énergies connues du stock", () => {
    expect(rentalFuelLabel("ESSENCE")).toBe("Essence");
    expect(rentalFuelLabel("ELECTRIQUE")).toBe("Électrique");
    expect(rentalFuelLabel("PHEV")).toBe("Hybride rechargeable");
  });

  it("renvoie la valeur brute pour une énergie inconnue et un tiret si vide", () => {
    expect(rentalFuelLabel("GPL")).toBe("GPL");
    expect(rentalFuelLabel(null)).toBe("-");
  });
});

describe("rentalVehicleLabel", () => {
  it("assemble marque, modèle et variante sans séparateur vide", () => {
    expect(rentalVehicleLabel(makeVehicle())).toBe("Changan CS55 Plus Deuxième génération");
    expect(rentalVehicleLabel(makeVehicle({ variant: null }))).toBe("Changan CS55 Plus");
  });
});

describe("formatRentalDateLong", () => {
  it("écrit la date de prise d'effet en toutes lettres", () => {
    expect(formatRentalDateLong(new Date(Date.UTC(2026, 7, 20)))).toBe("20 août 2026");
  });

  it("laisse un tiret sur une date absente ou invalide", () => {
    expect(formatRentalDateLong(null)).toBe("-");
    expect(formatRentalDateLong("pas-une-date")).toBe("-");
  });
});
