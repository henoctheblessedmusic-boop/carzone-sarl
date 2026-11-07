# Fiche de rôle - Administrateur (Véhicules & Messages)

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Malgré son libellé ("Véhicules & Messages"), ADMIN est en pratique un rôle administratif
large : gestion des comptes/rôles, stock véhicules, flotte, atelier, devis/factures, RH,
dépenses, boîte mail. Il ne dispose toutefois pas de l'export du bilan financier ni du droit
de suppression définitive d'un devis.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier, Supervision garage, Pièces & Références,
  Stock véhicules, Devis & proformas, Factures & règlements, Bons de livraison, Journal
  d'audit, Dépenses, Articles & services, Ressources Humaines, Équipe & Rôles, Pipeline,
  Prospects, Boîte mail, Flotte.
- Créer ou désactiver un compte utilisateur, changer un rôle.
- Créer/modifier une fiche véhicule, un ordre de réparation, un devis, une facture.
- Reçoit les notifications d'activité sensible (connexions, mots de passe) via la cloche de
  notifications, comme la direction et la Comptabilité.

## 3. Ce qu'il ne peut pas faire

- Ne peut pas exporter le bilan financier, ni supprimer définitivement un devis.
- Pas d'accès aux bornes de recharge, aux installateurs, ni à la location de véhicules.
- Si une page redirige vers le tableau de bord, ce n'est pas une erreur de manipulation :
  contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, cloche de notifications, menu complet listé en section 2.

Captures disponibles : `captures/admin/01-connexion.png`, `captures/admin/02-menu-admin.png`.

## 5. Tâches quotidiennes, avec étapes et captures

### a) Gérer les comptes utilisateurs
1. Menu **Équipe & Rôles** -> créer un compte (email, nom complet, rôle) ou désactiver un
   compte de départ.
2. Vérifier le rôle attribué dans `matrice-roles-acces.md` avant de valider.

*Capture disponible : `captures/admin/03-gestion-comptes.png`, pastille sur le sélecteur de
rôle.*

### b) Suivre le stock véhicules et la flotte
1. Menu **Stock véhicules** et **Flotte** pour vérifier la cohérence des données.

### c) Traiter la boîte mail entrante
1. Menu **Boîte mail** -> répondre aux messages clients non traités.

## 6. Tâches hebdomadaires ou ponctuelles

- Revue hebdomadaire des comptes utilisateurs actifs/inactifs.
- Validation ponctuelle d'un bon de livraison interne.
- Vérification ponctuelle du journal d'audit en cas de doute sur une action.

## 7. Erreurs fréquentes et réflexes

- Vouloir supprimer définitivement un devis : non autorisé pour ce rôle, s'adresser à la
  direction/COMPTA si une suppression est réellement nécessaire.
- Attribuer un rôle sans vérifier son périmètre réel dans `matrice-roles-acces.md`.
- Chercher l'export du bilan financier : non disponible pour ce rôle, c'est normal.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test Administrateur.
2. Ouvrir **Équipe & Rôles** et énumérer les rôles existants, sans en modifier aucun.
3. Ouvrir la cloche de notifications et citer le type de la dernière notification.
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais créer un compte utilisateur et lui attribuer un rôle.
- [ ] Je sais consulter la cloche de notifications.
- [ ] Je sais consulter le journal d'audit.
- [ ] Je sais que je n'ai pas accès à l'export du bilan financier ni aux bornes/installateurs.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/04-stock-showroom-import`
- `presentations/07-rh-administration`

- `presentations/roles/admin.pptx` : support court dédié à ce rôle.
