# Fiche de rôle - RF (Responsable Financier)

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le RF pilote la santé financière de CARZONE : factures, encaissements, dépenses, masse
salariale (RH), devis. Il dispose d'un accès serveur étendu (quasiment aussi large que la
direction) mais **sans la gestion des comptes/rôles**, qui reste réservée à la direction, à
l'ADV, à ADMIN, à RTA, à DC et à RH.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier, Pièces & Références, Stock véhicules, Devis &
  proformas, Factures & règlements, Bons de livraison, Dépenses, Articles & services,
  Ressources Humaines, Boîte mail.
- Exporter le bilan financier.
- Supprimer/annuler un devis (avec motif), gérer les dépenses et la masse salariale (RH).
- Lecture et écriture sur les bornes de recharge et les installateurs, même sans lien de menu
  dédié (accessibles par adresse directe si besoin).

## 3. Ce qu'il ne peut pas faire

- Ne peut pas créer, modifier ou supprimer un compte utilisateur ni changer un rôle : la page
  **Équipe & Rôles** n'est pas accessible au RF (ni dans le menu, ni par adresse directe).
- Comme tout rôle, ne pas réessayer en boucle un lien qui redirige vers le tableau de bord :
  contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**. Respecter le délai de blocage en cas d'échecs répétés.
4. Tableau de bord : indicateurs financiers (facturé, encaissé, créances, devis en attente,
   dépenses) affichés directement pour ce rôle.

Captures disponibles : `captures/rf/01-connexion.png`, `captures/rf/02-dashboard-financier.png`.

## 5. Tâches quotidiennes, avec étapes et captures

### a) Contrôler les créances à recouvrer
1. Tableau de bord -> indicateur "Créances à recouvrer".
2. Menu **Factures & règlements** -> trier par ancienneté.

### b) Suivre les dépenses d'exploitation
1. Menu **Dépenses**.
2. Vérifier les dépenses au statut "À payer" et leur échéance.

### c) Suivre la masse salariale
1. Menu **Ressources Humaines**.
2. Consulter les paiements de salaire du mois en cours.

## 6. Tâches hebdomadaires ou ponctuelles

- Revue hebdomadaire des devis en attente et de leur montant cumulé.
- Validation ponctuelle d'une dépense importante (bon de commande).
- Export ponctuel du bilan financier pour la direction.

## 7. Erreurs fréquentes et réflexes

- Chercher la page "Équipe & Rôles" : elle n'existe pas pour ce rôle, c'est volontaire (séparation
  des tâches entre gestion financière et gestion des accès).
- Annuler un devis sans motif : impossible, le motif est obligatoire.
- Confondre le périmètre Showroom et le périmètre Garage dans les dépenses : vérifier le
  libellé avant de valider.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test RF.
2. Relever le montant des "Créances à recouvrer" sur le tableau de bord.
3. Ouvrir **Dépenses** et citer une dépense au statut "À payer" (ou constater qu'il n'y en a
   pas).
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais lire les indicateurs financiers du tableau de bord.
- [ ] Je sais consulter les dépenses et leur statut.
- [ ] Je sais consulter la masse salariale (RH).
- [ ] Je sais que je n'ai pas accès à la gestion des comptes/rôles, et que c'est normal.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/01-direction-gouvernance`
- `presentations/03-comptabilite`

- `presentations/roles/rf.pptx` : support court dédié à ce rôle.

## 11. Notifications, messages et audio

- La cloche de notifications est en haut à droite. Elle affiche les alertes non lues et ouvre le panneau Notifications et activités. Elle est visible selon les droits du rôle ; utiliser aussi les alertes du module et le centre d'aide si elle n'apparaît pas.
- Pour recevoir les alertes hors de l'onglet, autoriser les notifications du navigateur lors de la première utilisation.
- Ouvrir la configuration matérielle avec le bouton Activer en 1 clic ou Configuration et activation du matériel.
- Autoriser le microphone dans la fenêtre du navigateur : sans cette autorisation, les appels audio ne peuvent pas démarrer.
- Utiliser Tester le son pour vérifier le rendu audio et la sonnerie d'appel.
- Si le microphone est bloqué, cliquer sur le cadenas de la barre d'adresse, remettre Microphone et Notifications sur Autoriser, puis actualiser la page.
- Ouvrir Discussions et Appels pour les messages d'équipe, les messages privés, les appels audio, les conférences et le journal des appels.
- Ne pas appeler directement le DG ou le PDG ; laisser un message dans la conversation prévue.
- Porter un casque avec micro et couper le micro ou quitter l'appel en fin de réunion.
