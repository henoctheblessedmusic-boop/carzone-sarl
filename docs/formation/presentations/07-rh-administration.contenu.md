# Contenu du support - 07. RH & administration (RH, ADMIN)

## Slide 1 - Couverture
- Logo CARZONE. Titre : "Formation CARZONE Ops - RH & Administration"
- Sous-titre : "RESPONSABLE RH - ADMINISTRATEUR"

## Slide 2 - Sommaire
- Le module RH et la gestion des comptes applicatifs
- Rappel de connexion
- Procédure : créer/consulter une fiche employé
- Procédure : traiter une demande de congé
- Procédure : enregistrer un paiement de salaire
- Procédure : créer un compte utilisateur et attribuer un rôle
- Sécurité et confidentialité
- Erreurs fréquentes
- Exercice guidé
- Récapitulatif et contacts

## Slide 3 - Objectifs pédagogiques
- Savoir créer et consulter une fiche employé complète.
- Savoir traiter une demande de congé (approbation/refus motivé).
- Savoir enregistrer un paiement de salaire mensuel.
- Savoir créer un compte utilisateur applicatif et lui attribuer le bon rôle.

## Slide 4 - Le module RH en un coup d'oeil
- Fiche employé : poste, département, type de contrat (CDI/CDD/Stage/Prestation/Essai),
  date d'embauche, salaire de base, coordonnées, CNSS/IFU, banque.
- Types de congés avec jours alloués par an (24 jours ouvrables, Code du travail béninois).
- Solde de congés par employé et par année.
- Paiements de salaire mensuels (montant net, mode de paiement, référence).

## Slide 5 - Rappel de connexion
1. https://carzone-sarl.vercel.app/login
2. Email + mot de passe du compte de test.
3. **Se connecter**.

*Capture intégrée : `captures/rh/01-connexion.png`.*

## Slide 6 - Procédure : créer/consulter une fiche employé
1. Menu **Ressources Humaines (RH)** -> liste du personnel.
2. Créer une fiche (nom, poste, département, contrat, salaire de base) ou ouvrir une fiche
   existante.

## Slide 7 - Procédure : traiter une demande de congé
1. Ouvrir une demande au statut "En attente".
2. Approuver, ou refuser avec un motif.

*Capture intégrée : `captures/rh/03-demande-conge.png`, pastille sur le bouton
Approuver/Refuser.*

## Slide 8 - Procédure : enregistrer un paiement de salaire
1. Menu **Ressources Humaines (RH)** -> paiements de salaire.
2. Renseigner mois, année, montant net, mode de paiement, référence.

## Slide 9 - Procédure : créer un compte utilisateur et attribuer un rôle
1. Menu **Équipe & Rôles** -> nouveau compte (email, nom complet, rôle).
2. Vérifier le rôle attribué dans `../matrice-roles-acces.md` avant de valider.
3. Pour un départ, désactiver le compte plutôt que le supprimer.

*Capture intégrée : `captures/admin/03-gestion-comptes.png`, pastille sur le sélecteur de
rôle.*

## Slide 10 - Sécurité et confidentialité
- Les données RH (salaire, CNSS, IFU, coordonnées bancaires) sont strictement confidentielles :
  jamais affichées en public.
- Vérifier le rôle attribué à un compte avant de le créer : une erreur donne un accès trop
  large ou trop restreint.

## Slide 11 - Erreurs fréquentes
- Refuser un congé sans motif (nuit à la traçabilité).
- Attribuer un rôle applicatif sans vérifier la matrice d'accès.
- Oublier de désactiver un compte après un départ.

## Slide 12 - Exercice guidé
1. Se connecter avec son compte de test (RH ou ADMIN).
2. Ouvrir une fiche employé et citer son type de contrat.
3. Ouvrir **Équipe & Rôles** et énumérer les rôles existants, sans en modifier aucun.
4. Se déconnecter.

## Slide 13 - Récapitulatif
- Je sais créer/consulter une fiche employé.
- Je sais traiter une demande de congé.
- Je sais enregistrer un paiement de salaire.
- Je sais créer un compte utilisateur et lui attribuer le bon rôle.

## Slide 14 - Contacts / support
- Support technique interne CARZONE SARL.
- Fiches individuelles : `../roles/rh.md`, `admin.md`.
