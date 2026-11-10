# Intégration du stock Excel - état livré

Date : 2026-11-09
Source : STOCK GLOBAL CORRIGÉ - 09-11-2026.xlsx

## Modèle de données

Ajouts :

- `VehicleVersion` : version catalogue dédupliquée par marque, modèle, finition, année et énergie ;
- `Vehicle.versionId` : lien vers la version ;
- `Vehicle.stockZone` : Showroom 1, Showroom 2 ou Arrivage sous le site Maro-Militaire ;
- `exteriorColorBase`, `exteriorColorShade`, `interiorColor` ;
- `arrivalDate` ;
- `publishedOnSite` ;
- `isIncompleteSheet` ;
- `priceToConfirm` ;
- `internalNotes`.

Le prix reste `Int` avec `0` et `priceToConfirm = true` pour les véhicules importés sans prix. Cela évite de présenter `0 FCFA` comme un prix réel sans rendre nullable tout le modèle financier existant.

## Statuts

Ajout de :

- `EN_ARRIVAGE` ;
- `RETIRE`.

Mapping appliqué :

- En stock -> `EN_MAGASIN` ;
- En arrivage -> `EN_ARRIVAGE` ;
- Réservé -> `RESERVE` ;
- Vendu -> `VENDU` ;
- Retiré -> `RETIRE`.

## Import

Page : `/vehicles/import`

Accès : DEVELOPER et PDG uniquement.

Fonctionnement :

- lecture de l'onglet Stock Global ;
- en-têtes en ligne 4 ;
- prévisualisation ;
- clé VIN ;
- création ou mise à jour sans doublon ;
- VIN absents du fichier signalés, jamais supprimés ;
- champs obligatoires : VIN, marque, modèle, statut, site ;
- fiches incomplètes acceptées ;
- audit.

## Résultat réel de l'import

- 27 véhicules importés ;
- 0 doublon de VIN ;
- 8 fiches incomplètes ;
- 8 versions catalogue ;
- Showroom 1 : 10 ;
- Showroom 2 : 12 ;
- Arrivage : 5 ;
- prix à confirmer : tous les véhicules importés ;
- couleurs et dates d'arrivée importées ;
- site physique : Maro-Militaire ;
- zones internes : Showroom 1, Showroom 2, Arrivage.

Quatre véhicules existaient déjà avant l'import. Ils n'ont pas été supprimés car la règle est de ne jamais supprimer automatiquement un VIN absent du fichier.

## Écran stock

Ajouts :

- récapitulatif par zone ;
- tableau modèle par zone ;
- comptages marque, énergie, statut ;
- filtres zone, statut et fiche incomplète ;
- affichage de la zone et de l'état de fiche ;
- affichage `Prix à définir` pour les prix à confirmer ;
- lien vers l'import Excel pour les profils autorisés.

## Vitrine

- filtre corrigé : seuls les véhicules publiés, en stock et avec finition, année et énergie sont visibles ;
- véhicules vendus, réservés et retirés exclus ;
- regroupement par version ;
- affichage du nombre d'unités disponibles et des coloris ;
- VIN, site exact et notes internes jamais exposés.

## Export Excel

Route : `/api/vehicles/export`

Trois onglets :

- Stock Global ;
- Récapitulatifs ;
- Journal.

Accès : DEVELOPER et PDG.

## Vérifications

- `npx tsc --noEmit` : OK ;
- `npm run build` : OK ;
- `npm run check:no-em-dash` : OK ;
- import réel : OK ;
- vitrine groupée : OK ;
- export Excel : HTTP 200, fichier XLSX valide ;
- filtres et récapitulatif stock : OK.
