# Contenu du support - 05. Atelier & stock garage (CHEF_ATELIER, RTA, ATELIER, STOCK_GARAGE)

## Slide 1 - Couverture
- Logo CARZONE. Titre : "Formation CARZONE Ops - Atelier & Stock Garage"
- Sous-titre : "CHEF D'ATELIER - RTA - TECHNICIEN ATELIER - STOCK GARAGE"

## Slide 2 - Sommaire
- Le circuit d'une intervention atelier
- Rappel de connexion
- Procédure : ouvrir et renseigner un ordre de réparation
- Procédure : compléter une fiche d'entretien systématique
- Procédure : gérer les pièces détachées et leurs mouvements
- Procédure : émettre un devis puis une facture atelier
- Sécurité et confidentialité
- Erreurs fréquentes
- Exercice guidé
- Récapitulatif et contacts

## Slide 3 - Objectifs pédagogiques
- Comprendre le circuit complet d'une intervention atelier, de l'entrée véhicule à la
  facturation.
- Savoir renseigner un ordre de réparation et une fiche d'entretien systématique.
- Savoir gérer les mouvements de pièces détachées.
- Savoir utiliser la signature numérique sur tablette.

## Slide 4 - Le circuit d'une intervention atelier
- Entrée véhicule -> diagnostic -> ordre de réparation (OR) -> pièces utilisées ->
  main-d'oeuvre -> devis -> facture -> signature client.
- Fiche d'entretien systématique par palier kilométrique : 5000 / 10000 / 30000 / 50000 /
  100000 km.

## Slide 5 - Rappel de connexion
1. https://carzone-sarl.vercel.app/login
2. Email + mot de passe du compte de test.
3. **Se connecter**.

*Capture intégrée : `captures/chef-atelier/01-connexion.png`.*

## Slide 6 - Procédure : ouvrir et renseigner un ordre de réparation
1. Menu **Atelier** -> nouvel ordre de réparation.
2. Renseigner véhicule, client, panne signalée, diagnostic (moteur/transmission,
   suspension, électricité, autres).
3. Affecter un technicien.

*Capture intégrée : `captures/chef-atelier/03-nouvel-or.png`, pastilles sur les champs
obligatoires.*

## Slide 7 - Procédure : compléter la fiche d'entretien systématique
1. Sélectionner le palier kilométrique du véhicule.
2. Cocher chaque tâche (effectué / non effectué / non applicable).
3. Ajouter une observation si besoin.

*Capture intégrée : `captures/atelier/03-diagnostic-or.png`.*

## Slide 8 - Procédure : gérer les pièces détachées
1. Menu **Pièces & Références** -> vérifier le stock disponible avant intervention.
2. Enregistrer la sortie atelier liée à l'OR après utilisation.
3. Suivre les seuils d'alerte de réapprovisionnement.

*Capture intégrée : `captures/stock-garage/03-mouvement-stock.png`, pastille sur le type de
mouvement.*

## Slide 9 - Procédure : émettre un devis puis une facture atelier
1. Menu **Devis & proformas** -> créer le devis à partir de l'OR (pièces + main-d'oeuvre).
2. Envoyer la proforma, suivre jusqu'à la facture (**Factures & règlements**).

## Slide 10 - Procédure : signature numérique
1. Faire signer le client sur la tablette.
2. Signer en tant que technicien (et responsable atelier si requis).

## Slide 11 - Sécurité et confidentialité
- Ne jamais clôturer une intervention sans diagnostic ni pièces déclarées.
- Vérifier l'identité du client avant la restitution du véhicule.

## Slide 12 - Erreurs fréquentes
- Oublier de déclarer une pièce utilisée (fausse le stock et la facturation).
- Clôturer sans compléter la checklist d'entretien.
- Vouloir supprimer un devis atelier : non autorisé pour CHEF_ATELIER/ATELIER (RTA/DC
  peuvent, avec motif).
- "Articles & services" qui ne s'ouvre pas pour CHEF_ATELIER : signaler au support, ne pas
  réessayer en boucle (voir `../roles/chef-atelier.md`, section 3).

## Slide 13 - Exercice guidé
1. Se connecter avec son compte de test (CHEF_ATELIER/RTA/ATELIER/STOCK_GARAGE).
2. Ouvrir un ordre de réparation et citer son statut.
3. Citer une pièce sous son seuil d'alerte (ou constater qu'il n'y en a pas).
4. Se déconnecter.

## Slide 14 - Récapitulatif
- Je sais ouvrir et renseigner un ordre de réparation.
- Je sais compléter une fiche d'entretien systématique.
- Je sais gérer les mouvements de pièces détachées.
- Je sais faire signer numériquement une intervention.

## Slide 15 - Contacts / support
- Support technique interne CARZONE SARL.
- Fiches individuelles : `../roles/chef-atelier.md`, `rta.md`, `atelier.md`,
  `stock-garage.md`.
