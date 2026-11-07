# Contenu du support - 04. Stock, showroom, import (STOCK, ADMIN)

## Slide 1 - Couverture
- Logo CARZONE. Titre : "Formation CARZONE Ops - Stock, Showroom & Import"
- Sous-titre : "STOCK - ADMIN"

## Slide 2 - Sommaire
- Le cycle de vie d'un véhicule, de l'import à la vente
- Rappel de connexion
- Procédure : ajouter un véhicule en stock
- Procédure : gérer le catalogue marques/modèles
- Procédure : suivre un import maritime
- Procédure : vérifier les photos et la fiche technique
- Sécurité et confidentialité
- Erreurs fréquentes
- Exercice guidé
- Récapitulatif et contacts

## Slide 3 - Objectifs pédagogiques
- Comprendre le cycle complet : catalogue -> import -> réception -> mise en stock -> vente.
- Savoir créer une fiche véhicule complète et fiable.
- Savoir suivre un import maritime (ETA, conteneur, fournisseur/port).
- Savoir vérifier la conformité des photos avant publication.

## Slide 4 - Le cycle de vie d'un véhicule
- Catalogue CARZONE : marques (Changan, Deepal, Jetour, BYD, Chery, Toyota...) et modèles.
- Fournisseur / port d'import (ex. Anvers, Dubaï, Livourne).
- Commande d'import -> transit -> réception au port -> entrée en stock showroom.
- Mise en vente -> opportunité commerciale -> devis -> facture.

## Slide 5 - Rappel de connexion
1. https://carzone-sarl.vercel.app/login
2. Email + mot de passe du compte de test.
3. **Se connecter**.

*Capture intégrée : `captures/stock/01-connexion.png`.*

## Slide 6 - Procédure : ajouter un véhicule en stock
1. Menu **Stock véhicules** -> nouveau véhicule.
2. Choisir marque puis modèle (catalogue), renseigner VIN, année, énergie, couleur,
   kilométrage, prix.
3. Ajouter les photos (principale, intérieur, extérieur, arrière).

*Capture intégrée : `captures/stock/03-nouveau-vehicule.png`, pastilles sur VIN et photos.*

## Slide 7 - Procédure : vérifier les photos avant publication
1. Comparer chaque photo au véhicule réel (VIN, configuration, couleur).
2. Cocher "Photos vérifiées" uniquement après contrôle réel - c'est une attestation.

## Slide 8 - Procédure : gérer le catalogue marques/modèles
1. Menu **Catalogue & fournisseurs** -> ajouter un modèle ou un fournisseur/port si absent.
2. Éviter les doublons : vérifier l'existant avant de créer.

## Slide 9 - Procédure : suivre un import maritime
1. Menu **Import** -> ouvrir la commande concernée.
2. Vérifier port d'origine, ETA, numéro de conteneur, référence de commande.

*Capture intégrée : `captures/stock/import-suivi.png` (à réaliser).*

## Slide 10 - Rôle ADMIN : vue d'ensemble stock + flotte
- ADMIN voit également le stock véhicules et la flotte, en plus de la gestion des comptes.
- Utile pour une vérification croisée en cas d'écart signalé.

## Slide 11 - Sécurité et confidentialité
- Ne jamais publier une photo non vérifiée.
- Ne pas communiquer un prix d'achat (coût) en dehors du cercle autorisé (le prix d'achat
  reste confidentiel, seul le prix de vente est public).

## Slide 12 - Erreurs fréquentes
- Cocher "Photos vérifiées" sans contrôle réel.
- Créer un modèle en double au lieu de réutiliser le catalogue.
- Oublier de mettre à jour le statut d'un véhicule vendu.

## Slide 13 - Exercice guidé
1. Se connecter avec son compte de test (STOCK ou ADMIN).
2. Citer un véhicule disponible en stock et son prix.
3. Citer le statut d'une commande d'import (ou constater qu'il n'y en a pas).
4. Se déconnecter.

## Slide 14 - Récapitulatif
- Je sais ajouter un véhicule en stock avec ses photos vérifiées.
- Je sais gérer le catalogue marques/modèles.
- Je sais suivre un import maritime.

## Slide 15 - Contacts / support
- Support technique interne CARZONE SARL.
- Fiches individuelles : `../roles/stock.md`, `admin.md`.
