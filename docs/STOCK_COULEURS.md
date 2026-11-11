# Couleurs dans le stock

Date : 2026-11-09

## Données existantes

Les 27 véhicules importés ont déjà :

- `exteriorColorBase` : couleur de base pour les filtres ;
- `exteriorColorShade` : teinte exacte affichée ;
- `interiorColor` : couleur intérieure.

Répartition constatée :

- Blanc : 8 ;
- Noir : 9 ;
- Gris : 4 ;
- Gris crème : 3 ;
- Blanche : 1 ;
- Gris cendre : 1 ;
- Bleu : 1 ;
- couleur intérieure non renseignée : 3.

## Stock interne

Ajouts :

- colonne `Couleur` dans la vue tableau ;
- pastille de couleur ;
- affichage de la teinte exacte et de la couleur intérieure ;
- filtre par couleur ;
- récapitulatif par couleur ;
- champs de couleur dans la création et la modification d'un véhicule.

## Règle de couleur

- `Couleur extérieure (base)` sert au filtre ;
- `Teinte extérieure exacte` sert à l'affichage ;
- `Couleur intérieure` est affichée séparément.

Le champ historique `color` reste synchronisé avec la teinte exacte pour ne pas casser les écrans existants.

## Vitrine

La vitrine utilisera les mêmes couleurs et permettra de choisir une couleur pour afficher les photos du véhicule correspondant.

## Configuration commercialisable

Depuis l'etape 1 de la fiche vehicule immersive, une teinte seule ne suffit plus
a decrire ce que voit le client. L'unite de reference est la **configuration** :
une version, une teinte exterieure et une teinte interieure.

- Modele `VehicleConfiguration`, code stable `CFG-01` a `CFG-22`, identique aux
  dossiers photo du showroom.
- `exteriorColorBase` sert aux filtres, `exteriorColorLabel` est la teinte
  affichee, `exteriorHex` et `interiorHex` derivent de la palette de
  `src/lib/vehicle-colors.ts` et ne sont jamais redefinis ailleurs.
- Normalisation des libelles dans `src/lib/vehicle-configuration.ts` :
  `Blanche` donne `Blanc`, `Terracotta (rouge)` donne `Terracotta`, un interieur
  vide donne la sentinelle `A completer`. `Gris creme` et `Gris cendre` restent
  des teintes distinctes de `Gris`.
- Regle d'or : toutes les images d'une configuration viennent de cette
  configuration. On affiche moins d'images, jamais une image fausse.

## Vérifications

- `npx tsc --noEmit` : OK ;
- `npm run build` : OK ;
- couleurs importées contrôlées en base ;
- affichage de la teinte constaté dans le stock.
