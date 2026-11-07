# Fiche de rôle - DC (Directeur Commercial)

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le DC pilote l'activité commerciale showroom : pipeline d'opportunités, stock véhicules,
devis, catalogue pièces, et gère les comptes/rôles de son équipe commerciale.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier (lecture), Catalogue pièces, Pièces &
  Références, Stock véhicules, Devis & proformas, Articles & services, Équipe & Rôles,
  Pipeline.
- Créer/modifier/supprimer un devis (motif obligatoire pour suppression).
- Créer/modifier une fiche véhicule en stock.
- Créer ou désactiver un compte utilisateur, changer un rôle.
- Consulter l'atelier en lecture seule (sans pouvoir y créer d'ordre de réparation).

## 3. Ce qu'il ne peut pas faire

- Pas d'accès aux factures, aux dépenses, aux RH, aux bornes/installateurs, à la flotte/
  location, ni à l'export du bilan financier.
- Ne peut pas créer ou modifier un ordre de réparation atelier (lecture seule).
- Si une page redirige vers le tableau de bord, ce n'est pas une erreur de manipulation :
  contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, puis menu **Pipeline**.

Captures disponibles : `captures/dc/01-connexion.png`, `captures/dc/02-menu-pipeline.png`.

## 5. Tâches quotidiennes, avec étapes et captures

### a) Suivre le pipeline commercial
1. Menu **Pipeline**.
2. Observer la répartition des opportunités par étape.
3. Ouvrir une opportunité pour voir son historique et son propriétaire.

*Capture disponible : `captures/dc/03-pipeline-etapes.png`, pastilles numérotées sur chaque
colonne d'étape.*

### b) Arbitrer le stock véhicules disponible
1. Menu **Stock véhicules**.
2. Filtrer par marque/énergie/budget pour aider une équipe commerciale à matcher un client.

### c) Gérer les comptes de l'équipe commerciale
1. Menu **Équipe & Rôles**.
2. Créer un compte COMMERCIAL ou HOTESSE pour un nouvel arrivant.

## 6. Tâches hebdomadaires ou ponctuelles

- Revue hebdomadaire du pipeline (taux de conversion par étape).
- Suppression ponctuelle d'un devis erroné (motif obligatoire).
- Création/désactivation ponctuelle d'un compte commercial.

## 7. Erreurs fréquentes et réflexes

- Vouloir créer un ordre de réparation : impossible pour ce rôle, seule la consultation est
  prévue.
- Supprimer un devis sans motif : impossible, c'est volontaire.
- Oublier de vérifier `matrice-roles-acces.md` avant d'attribuer un rôle à un nouvel employé.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test DC.
2. Ouvrir **Pipeline** et citer le nombre d'opportunités dans l'étape la plus avancée.
3. Ouvrir **Équipe & Rôles** et énumérer les rôles existants, sans en modifier aucun.
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais lire le pipeline commercial.
- [ ] Je sais filtrer le stock véhicules.
- [ ] Je sais créer un compte pour un commercial.
- [ ] Je sais que l'atelier est en lecture seule pour moi, et que c'est normal.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/02-commerce-adv-accueil`

- `presentations/roles/dc.pptx` : support court dédié à ce rôle.
