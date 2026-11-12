import Link from "next/link";

export type RentalSection = "fleet" | "contracts" | "maintenance";

const SECTIONS: { key: RentalSection; href: string; label: string; hint: string }[] = [
  {
    key: "fleet",
    href: "/rentals/fleet",
    label: "Parc locatif",
    hint: "Véhicules dédiés à la location",
  },
  {
    key: "contracts",
    href: "/rentals/contracts",
    label: "Contrats & proformas",
    hint: "Contrats, encaissements, retours",
  },
  {
    key: "maintenance",
    href: "/rentals/maintenance",
    label: "Entretiens",
    hint: "Entretien, réparations, garage",
  },
];

/**
 * Barre de sous-navigation commune aux trois pages Location. Elle double le menu
 * latéral pour rester utilisable sur mobile, où la barre latérale est repliée.
 */
export function RentalSectionNav({ current }: { current: RentalSection }) {
  return (
    <nav
      aria-label="Sections de la location"
      style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
    >
      {SECTIONS.map((section) => {
        const isActive = section.key === current;
        return (
          <Link
            key={section.key}
            href={section.href}
            title={section.hint}
            aria-current={isActive ? "page" : undefined}
            className={`ox-btn ox-btn-sm${isActive ? "" : " ox-btn-ghost"}`}
            style={{ whiteSpace: "nowrap" }}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
