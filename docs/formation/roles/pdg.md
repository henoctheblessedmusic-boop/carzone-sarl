# Fiche de rôle - PDG (Président Directeur Général)

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le PDG a une vision globale et un accès total à CARZONE Ops : showroom, atelier SAV,
location de véhicules, bornes de recharge, ressources humaines, comptabilité. Au quotidien,
le PDG utilise l'outil surtout pour **piloter** (tableau de bord, indicateurs, pipeline,
factures) plutôt que pour saisir des opérations courantes, qui restent la responsabilité des
équipes opérationnelles.

## 2. Ce que le rôle peut voir et faire

- Accès à **tous les modules** de l'application sans exception : Clients, Discussions, Atelier,
  Supervision garage, Catalogue pièces, Pièces & Références, Stock véhicules, Catalogue &
  fournisseurs, Devis & proformas, Factures & règlements, Bons de livraison, Journal d'audit,
  Dépenses, Articles & services, Ressources Humaines, Équipe & Rôles, Pipeline, Prospects,
  Boîte mail, Location, Flotte, Import, Installateurs bornes, Devis bornes, Bornes &
  abonnements, Terminal borne.
- Exporter le bilan financier.
- Créer, modifier, désactiver des comptes utilisateurs et changer leur rôle.
- Annuler en interne un devis ou une facture (toujours avec un motif obligatoire, jamais en
  silence).
- Reçoit une **notification de sécurité à chaque connexion de n'importe quel utilisateur**
  (adresse IP, navigateur) via la cloche de notifications en haut de l'écran.

## 3. Ce qu'il ne peut pas faire

- Rien n'est techniquement bloqué pour le PDG. Les seules limites sont des bonnes pratiques :
  ne pas saisir à la place des équipes (risque de doublons), ne pas annuler un document sans
  motif réel et traçable (l'application impose un motif, mais c'est aussi une question de
  rigueur de gestion).
- Comme tout rôle, si un écran se comporte de façon inattendue, ne pas forcer en rechargeant
  plusieurs fois : contacter le support technique.

## 4. Parcours de connexion pas à pas

1. Ouvrir un navigateur web et se rendre sur https://carzone-sarl.vercel.app/login
2. Dans le champ **Email**, saisir le compte de formation.
3. Dans le champ **Mot de passe**, saisir le mot de passe fourni par le formateur.
4. Cliquer sur **Se connecter**.
5. En cas de message "Identifiants invalides" : vérifier l'absence d'espace avant/après
   l'email, et la casse du mot de passe. Après plusieurs échecs successifs, le compte est
   bloqué temporairement de façon croissante (1 min, 5 min, 10 min, 1 h, 24 h) : c'est une
   protection anti-intrusion, il faut attendre le délai affiché plutôt que réessayer en boucle.
6. Une fois connecté, l'écran **Tableau de bord** s'affiche, avec le nom et le rôle de
   l'utilisateur en haut, le bouton **Déconnexion**, et une cloche de notifications.
7. Un guide "Premiers pas : PDG/DG" peut s'afficher automatiquement à la première connexion
   (bouton flottant en bas à droite pour le rouvrir à tout moment).

Captures disponibles : `captures/pdg/01-ecran-connexion.png`, `captures/pdg/02-tableau-de-bord.png`.

## 5. Tâches quotidiennes, avec étapes et captures

### a) Lire le tableau de bord exécutif
1. Se connecter (voir section 4).
2. Observer les indicateurs affichés : clients actifs, prospects, véhicules en stock,
   commandes/proformas fermes, factures ouvertes (avec retards signalés), tâches ouvertes.
3. Cliquer sur un indicateur pour ouvrir le module correspondant et voir le détail.

*Capture disponible : `captures/pdg/03-indicateurs-dashboard.png` (cadrer la ligne des indicateurs,
masquer tout montant client sensible si une démonstration publique est prévue).*

### b) Suivre les factures et les créances
1. Dans le menu, cliquer sur **Factures & règlements**.
2. Repérer les factures au statut "en retard" ou non réglées.
3. Ouvrir une facture pour voir son détail (lignes, montant TTC, règlements déjà reçus).

*Capture disponible : `captures/pdg/04-liste-factures.png` avec une pastille numérotée sur la
colonne "Statut".*

### c) Suivre le pipeline commercial
1. Dans le menu, cliquer sur **Pipeline**.
2. Observer la répartition des opportunités par étape (prospect, devis envoyé, commande
   confirmée...).

### d) Consulter le journal d'audit en cas de doute
1. Dans le menu, cliquer sur **Journal d'audit**.
2. Filtrer par type d'action ou par utilisateur pour retrouver qui a fait quoi, et quand.

## 6. Tâches hebdomadaires ou ponctuelles

- Revue hebdomadaire du pipeline commercial, des stocks véhicules et des créances clients.
- Validation ponctuelle d'une annulation interne de facture ou de devis (motif obligatoire,
  jamais de suppression silencieuse).
- Création ou désactivation ponctuelle d'un compte utilisateur (arrivée/départ d'un employé) via
  **Équipe & Rôles**.
- Export ponctuel du bilan financier pour une revue de gestion.

## 7. Erreurs fréquentes et réflexes

- **Un lien du menu renvoie automatiquement au tableau de bord** : ce n'est jamais un problème
  de manipulation. Cela signifie que l'accès à cette page n'est pas (ou plus) activé pour ce
  compte précis. Contacter le support technique plutôt que de réessayer en boucle.
- **Annuler un devis/une facture sans motif** : impossible, l'application l'exige - c'est une
  protection, pas un bug.
- **Créer un compte avec un rôle inadapté** : toujours vérifier dans la matrice des rôles
  (`matrice-roles-acces.md`) le périmètre exact avant d'attribuer un rôle à un nouvel employé.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test PDG.
2. Ouvrir le tableau de bord et noter le nombre de factures ouvertes et le nombre en retard.
3. Ouvrir le module **Pipeline** et citer le nombre d'opportunités dans l'étape la plus
   avancée.
4. Ouvrir **Équipe & Rôles** et énumérer, sans les modifier, les rôles existants.
5. Se déconnecter proprement.

Barème suggéré : 1 point par étape correctement réalisée (5 points), note de passage 4/5.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter et me déconnecter.
- [ ] Je sais lire les indicateurs du tableau de bord.
- [ ] Je sais consulter les factures et repérer un retard de paiement.
- [ ] Je sais consulter le pipeline commercial.
- [ ] Je sais retrouver une action dans le journal d'audit.
- [ ] Je connais la règle : jamais d'annulation sans motif.
- [ ] Je sais qui contacter en cas de blocage d'accès.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune` (connexion, navigation commune, sécurité).
- `presentations/01-direction-gouvernance` (contenu spécifique PDG/DG/ADV/RF/DC/ADMIN).

- `presentations/roles/pdg.pptx` : support court dédié à ce rôle.
