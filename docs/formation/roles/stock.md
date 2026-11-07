# Fiche de rôle - Gestionnaire de stock showroom

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le Gestionnaire de stock showroom gère l'entrée, la mise à jour et le suivi des véhicules
neufs destinés à la vente, ainsi que le catalogue marques/modèles et les imports maritimes.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Stock véhicules, Articles & services, Catalogue &
  fournisseurs, Import.
- Créer/modifier une fiche véhicule (VIN, marque, modèle, prix, photos, fiche technique).
- Gérer le catalogue marques/modèles et les fournisseurs/ports d'import.
- Suivre un import maritime (ETA, conteneur, référence de commande).

## 3. Ce qu'il ne peut pas faire

- Pas d'accès à l'atelier, aux devis/factures, aux RH, à la gestion des comptes/rôles, ni à
  l'export du bilan financier.
- Si une page redirige vers le tableau de bord, ce n'est pas une erreur de manipulation :
  contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, puis menu **Stock véhicules**.

Captures disponibles : `captures/stock/01-connexion.png`, `captures/stock/02-menu-stock.png`.

## 5. Tâches quotidiennes, avec étapes et captures

### a) Ajouter un véhicule en stock
1. Menu **Stock véhicules** -> nouveau véhicule.
2. Choisir marque puis modèle (catalogue), renseigner VIN, année, énergie, couleur,
   kilométrage, prix.
3. Ajouter les photos (principale, intérieur, extérieur, arrière) et vérifier leur conformité
   au véhicule réel avant de cocher "Photos vérifiées".

Captures disponibles : `captures/stock/03-nouveau-vehicule.png`, pastilles sur VIN et photos.

### b) Suivre un import maritime
1. Menu **Import** -> ouvrir une commande d'import.
2. Vérifier le port d'origine, la date ETA, le numéro de conteneur.

### c) Mettre à jour le catalogue marques/modèles
1. Menu **Catalogue & fournisseurs** -> ajouter un modèle ou un fournisseur/port.

## 6. Tâches hebdomadaires ou ponctuelles

- Revue hebdomadaire des imports en transit et de leur ETA.
- Mise à jour ponctuelle du prix d'un véhicule en stock.
- Vérification ponctuelle des fiches techniques générées automatiquement (statut "à
  confirmer").

## 7. Erreurs fréquentes et réflexes

- Cocher "Photos vérifiées" sans avoir réellement comparé les photos au véhicule (VIN,
  configuration) : c'est une attestation, pas une formalité.
- Créer un modèle en double au lieu de réutiliser le catalogue existant.
- Oublier de mettre à jour le statut d'un véhicule vendu (reste visible comme disponible).

## 8. Exercice pratique noté

1. Se connecter avec le compte de test Stock.
2. Ouvrir **Stock véhicules** et citer un véhicule disponible avec son prix.
3. Ouvrir **Import** et citer le statut d'une commande d'import (ou constater qu'il n'y en a
   pas).
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais ajouter un véhicule en stock avec ses photos.
- [ ] Je sais suivre un import maritime.
- [ ] Je sais mettre à jour le catalogue marques/modèles.
- [ ] Je sais que je n'ai pas accès aux devis/factures.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/04-stock-showroom-import`

- `presentations/roles/stock.pptx` : support court dédié à ce rôle.
