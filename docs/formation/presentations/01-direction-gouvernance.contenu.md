# Contenu du support - 01. Direction & gouvernance (PDG, DG, ADV, RF, DC, ADMIN)

## Slide 1 - Couverture
- Logo CARZONE. Titre : "Formation CARZONE Ops - Direction & gouvernance"
- Sous-titre : "PDG - DG - ADV - RF - DC - ADMIN"

## Slide 2 - Sommaire
- Vue d'ensemble des accès direction
- Rappel de connexion
- Tableau de bord exécutif
- Procédure : lire les indicateurs financiers et commerciaux
- Procédure : gérer les comptes et les rôles
- Procédure : traiter une annulation interne (motif obligatoire)
- Procédure : consulter le journal d'audit
- Sécurité et confidentialité
- Erreurs fréquentes
- Exercice guidé
- Récapitulatif et contacts

## Slide 3 - Objectifs pédagogiques
- Comprendre l'étendue (et les nuances) des accès de direction/gouvernance.
- Savoir lire les indicateurs clés de pilotage.
- Savoir créer/gérer un compte utilisateur et attribuer un rôle correctement.
- Savoir traiter une annulation en respectant la règle du motif obligatoire.

## Slide 4 - Vue d'ensemble des accès (tableau résumé)
- PDG / DG : accès total, sans restriction.
- ADV / RF : accès serveur total, mais menu volontairement centré sur les documents
  commerciaux/financiers (pas de pipeline ni bornes dans leur menu).
- DC : pilotage commercial + gestion des comptes, atelier en lecture seule.
- ADMIN : gestion large (comptes, stock, atelier, RH) mais sans export du bilan financier ni
  suppression de devis.
- Renvoi : `../matrice-roles-acces.md` pour le détail exact par rôle.

## Slide 5 - Rappel de connexion
1. https://carzone-sarl.vercel.app/login
2. Email + mot de passe fournis par l'IT.
3. **Se connecter**. Respecter le blocage progressif en cas d'échecs répétés (1 min, 5 min,
   10 min, 1h, 24h).

*Capture intégrée : `captures/pdg/01-ecran-connexion.png` (réutilisable pour tout le deck).*

## Slide 6 - Le tableau de bord exécutif
- Indicateurs : clients actifs, prospects, véhicules en stock, commandes/proformas fermes,
  factures ouvertes (avec retards), tâches ouvertes.
- Pour ADV/RF/DC : indicateurs centrés sur leur périmètre (financier ou commercial).

*Capture intégrée : `captures/pdg/03-indicateurs-dashboard.png`, pastilles numérotées sur
chaque indicateur.*

## Slide 7 - Procédure : lire les factures et les créances
1. Menu **Factures & règlements**.
2. Repérer les factures en retard (surlignage visuel).
3. Ouvrir une facture pour le détail (lignes, règlements déjà reçus).

*Capture intégrée : `captures/pdg/04-liste-factures.png`, pastille sur la colonne "Statut".*

## Slide 8 - Procédure : suivre le pipeline commercial
1. Menu **Pipeline**.
2. Observer la répartition des opportunités par étape.
3. Ouvrir une opportunité pour voir son historique et son propriétaire.

## Slide 9 - Procédure : gérer un compte utilisateur
1. Menu **Équipe & Rôles**.
2. Créer un compte (email, nom complet, rôle) en vérifiant le rôle dans la matrice d'accès.
3. Désactiver un compte de départ plutôt que de le supprimer (traçabilité).

*Capture intégrée : `captures/admin/03-gestion-comptes.png`, pastille sur le sélecteur de
rôle.*

## Slide 10 - Procédure : traiter une annulation interne
1. Ouvrir le devis ou la facture à annuler.
2. Saisir un motif obligatoire (jamais de suppression silencieuse).
3. Confirmer : l'action est tracée dans le journal d'audit.

## Slide 11 - Procédure : consulter le journal d'audit
1. Menu **Journal d'audit**.
2. Filtrer par type d'action, utilisateur ou date pour retrouver qui a fait quoi.

## Slide 12 - Sécurité et confidentialité
- Ne jamais partager son mot de passe.
- Vérifier systématiquement le rôle attribué à un nouveau compte avant validation.
- Traiter la cloche de notifications (connexions, mots de passe) au moins une fois par jour
  (PDG, DG, ADMIN).

## Slide 13 - Erreurs fréquentes
- Attribuer un rôle sans vérifier son périmètre réel dans `matrice-roles-acces.md`.
- Annuler un document sans motif (impossible, mais source de blocage si mal compris).
- Confondre "désactiver un compte" et "changer de rôle".

## Slide 14 - Exercice guidé
1. Se connecter avec le compte de test de son rôle (PDG/DG/ADV/RF/DC/ADMIN).
2. Lire 2 indicateurs du tableau de bord.
3. Ouvrir **Équipe & Rôles**, énumérer les rôles existants sans en modifier aucun.
4. Se déconnecter.

## Slide 15 - Récapitulatif
- Je sais lire mon tableau de bord et les indicateurs de pilotage.
- Je sais gérer un compte utilisateur correctement.
- Je connais la règle du motif obligatoire pour toute annulation.
- Je sais consulter le journal d'audit.

## Slide 16 - Contacts / support
- Support technique interne CARZONE SARL.
- Téléphones : +229 01 92 61 61 61 / +229 01 63 70 00 00 / +229 01 92 62 62 62.
- Fiches individuelles : `../roles/pdg.md`, `dg.md`, `adv.md`, `rf.md`, `dc.md`, `admin.md`.
