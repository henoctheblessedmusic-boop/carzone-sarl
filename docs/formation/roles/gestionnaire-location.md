# Fiche de rôle - Gestionnaire de la location de véhicules

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Ce rôle gère exclusivement le parc de véhicules de location (LCD/LLD/LOA) et les contrats
associés : c'est le rôle le plus restreint de l'application, volontairement limité à son seul
périmètre métier.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Catalogue pièces, Location.
- Créer/modifier un contrat de location, suivre son statut (brouillon, signé, en cours,
  restitué).
- Enregistrer un encaissement lié à un contrat de location.
- Suivre les entretiens/maintenances du parc de location.
- Consulter et créer une fiche client.

## 3. Ce qu'il ne peut pas faire

- **Accès volontairement restreint au niveau serveur** : même en tapant une autre adresse
  (factures, devis, stock showroom, RH...), ce compte est redirigé vers le tableau de bord.
  Ce n'est jamais une erreur de manipulation : c'est la règle de sécurité de ce rôle.
- Pas d'accès aux modules showroom, atelier, RH, comptabilité, bornes.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, puis menu **Location**.

*Capture disponible : `captures/gestionnaire-location/01-connexion.png`,
`captures/gestionnaire-location/02-menu-restreint.png` (cadrer le menu pour montrer qu'il ne
comporte que Clients/Discussions/Catalogue pièces/Location).*

## 5. Tâches quotidiennes, avec étapes et captures

### a) Créer un contrat de location
1. Menu **Location** -> nouveau contrat.
2. Renseigner client, véhicule, dates de début/fin, tarif journalier ou mensuel, caution.
3. Faire signer le contrat (signature numérique client + société).

*Capture disponible : `captures/gestionnaire-location/03-nouveau-contrat.png`, pastilles sur les
champs dates et tarif.*

### b) Suivre les restitutions de véhicules
1. Menu **Location** -> ouvrir un contrat en cours.
2. À la restitution, renseigner l'état du véhicule (état de sortie vs état de retour).

### c) Enregistrer un encaissement de location
1. Depuis le contrat, ajouter un encaissement (montant, mode de paiement, référence).

## 6. Tâches hebdomadaires ou ponctuelles

- Suivi hebdomadaire des contrats arrivant à échéance.
- Planification ponctuelle d'un entretien pour un véhicule du parc de location.

## 7. Erreurs fréquentes et réflexes

- Essayer d'accéder à une page hors de son périmètre : c'est bloqué par conception, ne pas
  réessayer en boucle, ce n'est pas un incident à signaler.
- Oublier de renseigner l'état de sortie du véhicule avant la remise au client : nécessaire
  pour comparer à l'état de retour.
- Créer un contrat sans caution alors que la politique interne l'exige : vérifier avant de
  valider.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test Gestionnaire de la location.
2. Vérifier que le menu ne contient que Clients, Discussions, Catalogue pièces, Location.
3. Ouvrir **Location** et citer le statut d'un contrat.
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais créer un contrat de location.
- [ ] Je sais enregistrer un encaissement de location.
- [ ] Je sais renseigner l'état de sortie/retour d'un véhicule.
- [ ] Je comprends que mon accès est volontairement limité à la location, et que c'est normal.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/06-location-vehicules`

- `presentations/roles/gestionnaire-location.pptx` : support court dédié à ce rôle.

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
