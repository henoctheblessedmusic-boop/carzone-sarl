import { redirect } from "next/navigation";

/**
 * L'espace Location est scindé en trois sous-menus (parc, contrats, entretiens).
 * `/rentals` reste une adresse valide pour les liens et favoris existants et
 * renvoie vers le parc locatif, première section de l'espace.
 */
export default function RentalsPage() {
  redirect("/rentals/fleet");
}
