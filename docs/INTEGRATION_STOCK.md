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

## Photos

Le fichier Excel ne contient aucune URL de photo. Les 27 véhicules importés ont donc `mainPhotoUrl = null` et `photosVerified = false`.

Deux conséquences normales :

- dans le stock, le véhicule sans photo affiche un pictogramme de voiture et non une photo réelle ;
- dans la fiche technique, les emplacements habitacle et sellerie ne sont plus affichés comme deux cadres vides. Un avertissement indique que les photos doivent être confirmées.

Les photos réelles doivent être ajoutées véhicule par véhicule dans le modal d'édition, via les champs URL de photos. Aucune photo d'un autre modèle ne doit être utilisée.

### Règle de repli photo

La carte stock utilise, dans l'ordre :

1. la photo principale du véhicule ;
2. la photo extérieure ;
3. la photo intérieure si elle est vérifiée ;
4. la photo arrière ;
5. la première photo de la fiche technique, uniquement si le modèle correspond exactement au catalogue.

DeepSeek ne génère pas de photos. L'API DeepSeek sert à produire le texte de la fiche technique. Les photos de catalogue viennent de `vehicle-catalog-specs.ts` ou des URL saisies manuellement.

### Dossier de captures

Un dossier de photos peut être fourni avec une arborescence par VIN :

```text
photos/<VIN>/main.jpg
photos/<VIN>/exterior.jpg
photos/<VIN>/interior.jpg
photos/<VIN>/rear.jpg
```

Les photos doivent être des photos réelles du véhicule livré, sans plaque civile visible et sans image d'un autre modèle.

## Rattachement aux configurations

Chaque vehicule du showroom porte un `configurationId` renseigne
automatiquement, a l'import comme a la saisie manuelle, par
`ensureVehicleConfiguration()` de `src/server/vehicle-configuration-service.ts`.

- Rattachement initial et controle : `npm run db:assign-configurations`
  (mode essai, aucune ecriture) puis la meme commande avec `--apply`.
- Le script refuse d'ecrire si un VIN du plan de prise de vue manque en base ou
  si un vehicule eligible n'a aucun code `CFG-XX`. Pas de rattachement partiel.
- Sont ecartes, sans que leur rattachement existant soit efface : les vehicules
  sans VIN, les statuts `VENDU` et `RETIRE`, et tout ce qui n'est pas
  `fleetType = SHOWROOM`.
- Une finition non relevee sur la carte grise donne une version de rattachement
  provisoire, `MARQUE|MODELE|A CONFIRMER` avec `isProvisional = true`. Le code
  `CFG-XX` est conserve quand la vraie finition est saisie plus tard.
- Table VIN vers code : `src/lib/data/showroom-configurations.ts`.

Voir aussi `docs/STOCK_COULEURS.md` pour la normalisation des teintes.

## Vérifications

- `npx tsc --noEmit` : OK ;
- `npm run build` : OK ;
- `npm run check:no-em-dash` : OK ;
- import réel : OK ;
- vitrine groupée : OK ;
- export Excel : HTTP 200, fichier XLSX valide ;
- filtres et récapitulatif stock : OK.
