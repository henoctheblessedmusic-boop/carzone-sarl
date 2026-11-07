# Fiche de rôle - DG (Directeur Général)

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le DG partage le même niveau d'accès que le PDG : supervision complète de l'activité
showroom, atelier, location, bornes, RH et comptabilité. Il est le relais opérationnel
quotidien de la direction et le point de contact de sécurité : l'application lui envoie une
notification à chaque connexion d'un utilisateur, quel qu'il soit.

## 2. Ce que le rôle peut voir et faire

- Accès à **tous les modules**, identique au PDG (voir `matrice-roles-acces.md`).
- Export du bilan financier, gestion des comptes et des rôles.
- Annulation interne de devis/factures avec motif obligatoire.
- Réception de toutes les notifications d'activité sensible (connexions, changements de mot
  de passe, diffusions générales) via la cloche de notifications.

## 3. Ce qu'il ne peut pas faire

- Aucune restriction technique. Les limites sont des règles de gestion : toujours motiver une
  annulation, ne pas modifier le rôle d'un compte sans vérifier son impact dans
  `matrice-roles-acces.md`.
- Si une page redirige automatiquement vers le tableau de bord, ce n'est pas une erreur de
  manipulation : contacter le support technique plutôt que réessayer.

## 4. Parcours de connexion pas à pas

1. Ouvrir https://carzone-sarl.vercel.app/login
2. Email : le compte de formation - Mot de passe : le mot de passe fourni par le formateur.
3. Cliquer sur **Se connecter**.
4. En cas d'échec répété, respecter le délai de blocage progressif affiché (anti-intrusion).
5. Après connexion : tableau de bord, nom/rôle affichés, cloche de notifications, bouton
   **Déconnexion**.
6. Le guide "Premiers pas : DG" peut s'ouvrir automatiquement (bouton flottant pour le rouvrir).

*Capture disponible : `captures/dg/01-ecran-connexion.png`, `captures/dg/02-tableau-de-bord.png`,
`captures/dg/03-cloche-notifications.png`.*

## 5. Tâches quotidiennes, avec étapes et captures

### a) Vérifier les notifications de sécurité
1. Cliquer sur la cloche de notifications en haut de l'écran.
2. Repérer les connexions inhabituelles (horaire, adresse IP) ou les changements de mot de
   passe.
3. Marquer comme lues une fois vérifiées.

### b) Piloter les indicateurs du tableau de bord
1. Ouvrir le tableau de bord.
2. Comparer factures ouvertes / en retard, devis en attente, stock véhicules.

### c) Superviser le pipeline et les stocks
1. Ouvrir **Pipeline** puis **Stock véhicules** pour croiser la demande commerciale et la
   disponibilité.

## 6. Tâches hebdomadaires ou ponctuelles

- Revue hebdomadaire des notifications de sécurité et de l'audit.
- Décision ponctuelle sur une annulation interne de document (motif obligatoire).
- Arbitrage ponctuel sur la création/désactivation d'un compte utilisateur.

## 7. Erreurs fréquentes et réflexes

- Ignorer la cloche de notifications : à vérifier au moins une fois par jour.
- Confondre "désactiver un compte" et "changer de rôle" dans **Équipe & Rôles** : vérifier
  l'action avant de valider.
- Réessayer frénétiquement une page bloquée au lieu de contacter le support.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test DG.
2. Ouvrir la cloche de notifications et citer le type de la dernière notification.
3. Ouvrir **Journal d'audit** et retrouver une action récente.
4. Se déconnecter.

Barème suggéré : 3 points (1 par étape 2-3-4), note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais consulter la cloche de notifications.
- [ ] Je sais lire le journal d'audit.
- [ ] Je connais la règle : jamais d'annulation sans motif.
- [ ] Je sais qui contacter en cas de blocage d'accès.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/01-direction-gouvernance`

- `presentations/roles/dg.pptx` : support court dédié à ce rôle.
