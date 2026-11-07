# Fiche de rôle - RH (Responsable Ressources Humaines)

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le RH gère le personnel CARZONE : dossiers employés, congés, structure RH, paie, et peut
créer/gérer les comptes utilisateurs de l'application (sans toutefois avoir accès aux
documents commerciaux : devis, factures, stock véhicules).

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Dépenses & Prestataires, Ressources Humaines (RH),
  Équipe & Rôles.
- Créer/modifier une fiche employé, un département, un type de congé.
- Traiter une demande de congé (approuver/refuser avec motif).
- Enregistrer un paiement de salaire mensuel.
- Créer un compte utilisateur applicatif et lui attribuer un rôle.
- Accéder à la Boîte mail en tapant l'adresse directement (autorisé par permission, mais pas
  mis en avant dans le menu).

## 3. Ce qu'il ne peut pas faire

- Pas d'accès aux devis, factures, stock véhicules, atelier, pipeline commercial : ces modules
  ne concernent pas la fonction RH et ne sont pas accessibles.
- Ne peut pas exporter le bilan financier.
- Si un lien venait à ne pas fonctionner, ne pas réessayer en boucle : contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, puis menu **Ressources Humaines (RH)**.

Captures disponibles : `captures/rh/01-connexion.png`, `captures/rh/02-menu-rh.png`.

## 5. Tâches quotidiennes, avec étapes et captures

### a) Traiter les demandes de congé
1. Menu **Ressources Humaines (RH)** -> onglet congés.
2. Ouvrir une demande au statut "En attente".
3. Approuver ou refuser (motif obligatoire en cas de refus).

*Capture disponible : `captures/rh/03-demande-conge.png`, pastille numérotée sur le bouton
Approuver/Refuser.*

### b) Consulter les fiches employés
1. Menu **Ressources Humaines (RH)** -> liste du personnel.
2. Ouvrir une fiche : poste, contrat (CDI/CDD/Stage...), date d'embauche, solde de congés.

### c) Gérer les comptes utilisateurs
1. Menu **Équipe & Rôles**.
2. Créer un compte (email, nom complet, rôle) ou désactiver un compte existant.

## 6. Tâches hebdomadaires ou ponctuelles

- Suivi hebdomadaire des soldes de congés.
- Enregistrement ponctuel des paiements de salaire du mois.
- Création ponctuelle d'un compte pour un nouvel employé, désactivation pour un départ.

## 7. Erreurs fréquentes et réflexes

- Chercher les modules commerciaux (devis, factures, stock) : ils ne sont pas prévus pour ce
  rôle, c'est volontaire.
- Refuser un congé sans indiquer de motif : à éviter pour la traçabilité, même si l'application
  ne bloque pas toujours la saisie.
- Attribuer un rôle applicatif sans vérifier `matrice-roles-acces.md` : toujours vérifier le
  périmètre avant de valider.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test RH.
2. Ouvrir une fiche employé et citer son type de contrat.
3. Ouvrir **Équipe & Rôles** et énumérer les rôles existants, sans en modifier aucun.
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais consulter une fiche employé.
- [ ] Je sais traiter une demande de congé.
- [ ] Je sais créer un compte utilisateur et lui attribuer un rôle.
- [ ] Je sais que je n'ai pas accès aux modules commerciaux, et que c'est normal.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/07-rh-administration`

- `presentations/roles/rh.pptx` : support court dédié à ce rôle.

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
