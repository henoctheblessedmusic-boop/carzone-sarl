# Fiche de rôle - RTA (Responsable Technique Atelier)

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le RTA encadre l'activité technique de l'atelier SAV : ordres de réparation, devis atelier,
stock véhicules, et dispose en plus d'un droit exceptionnel de gestion des comptes/rôles
(utile pour gérer les accès de son équipe technique).

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier, Pièces & Références, Stock véhicules, Devis &
  proformas, Articles & services, Équipe & Rôles.
- Créer/modifier/supprimer un devis (y compris suppression, motif obligatoire).
- Créer/modifier une fiche véhicule en stock.
- Créer ou désactiver un compte utilisateur, changer un rôle.

## 3. Ce qu'il ne peut pas faire

- Pas d'accès aux factures, aux dépenses, aux RH, à la flotte/location, aux bornes de
  recharge/installateurs, ni à l'export du bilan financier.
- Si une page redirige vers le tableau de bord, ce n'est pas une erreur de saisie : contacter
  le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, puis menu **Atelier**.

Captures disponibles : `captures/rta/01-connexion.png`, `captures/rta/02-menu-atelier.png`.

## 5. Tâches quotidiennes, avec étapes et captures

### a) Suivre les ordres de réparation (OR)
1. Menu **Atelier**.
2. Ouvrir un ordre de réparation : diagnostic, pièces utilisées, main-d'oeuvre.
3. Vérifier le statut (Ouvert / Clos).

Captures disponibles : `captures/rta/03-ordre-reparation.png`, pastilles sur diagnostic et coûts.

### b) Émettre un devis de réparation
1. Menu **Devis & proformas** -> nouveau devis.
2. Renseigner le client, le véhicule, les lignes (pièces + main-d'oeuvre).
3. Envoyer la proforma.

### c) Gérer les accès de l'équipe atelier
1. Menu **Équipe & Rôles**.
2. Créer un compte pour un nouveau technicien (rôle ATELIER ou CHEF_ATELIER selon le poste).

## 6. Tâches hebdomadaires ou ponctuelles

- Revue hebdomadaire des ordres de réparation ouverts depuis plus de 48h.
- Suppression ponctuelle d'un devis erroné (motif obligatoire).
- Création/désactivation ponctuelle d'un compte technicien.

## 7. Erreurs fréquentes et réflexes

- Chercher le module Factures : il n'est pas prévu pour ce rôle (la facturation reste côté
  comptabilité).
- Supprimer un devis sans motif : impossible, le motif est obligatoire et tracé dans le
  journal d'audit.
- Attribuer le rôle RTA à un simple technicien : vérifier dans `matrice-roles-acces.md` que ce
  rôle donne aussi la gestion des comptes, à réserver à l'encadrement.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test RTA.
2. Ouvrir un ordre de réparation et citer son statut.
3. Ouvrir **Équipe & Rôles** et énumérer les rôles existants, sans en modifier aucun.
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais consulter un ordre de réparation.
- [ ] Je sais créer un devis atelier.
- [ ] Je sais créer un compte pour un technicien.
- [ ] Je sais que je n'ai pas accès aux factures ni aux RH, et que c'est normal.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/05-atelier-stock-garage`

- `presentations/roles/rta.pptx` : support court dédié à ce rôle.
