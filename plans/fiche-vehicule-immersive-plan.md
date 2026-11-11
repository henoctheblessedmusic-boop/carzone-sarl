# Fiche vehicule immersive - Plan general et etape 1 (Donnees)

Source du besoin : `docs/incoming/PROMPT - Vue 360 et coloris.md`.
Reference de production : `Plan de prise de vue - showroom.xlsx`, dans le dossier media hors depot.
Date : 2026-11-10. Statut : **en attente de validation avant tout code**, comme l'exige la section 10.1 du brief.

---

## 1. Perimetre de l'etape 1

L'etape 1 ne touche ni la vitrine, ni la pop-up, ni l'ecran Medias. Elle livre la couche de donnees sur laquelle tout le reste s'appuie :

1. Les trois nouveaux modeles Prisma (`VehicleConfiguration`, `VehicleMedia`, `VehicleHotspot`) et la colonne `Vehicle.configurationId`.
2. La fonction pure `resolveConfigurationKey(vehicle)` et sa table de normalisation des couleurs.
3. Le rattachement des 27 vehicules du stock aux 22 configurations, avec les codes `CFG-01` a `CFG-22` **identiques** a ceux des dossiers photo deja crees.
4. Les tests unitaires, et donc l'introduction d'un lanceur de tests : il n'en existe aucun aujourd'hui.

Hors perimetre, volontairement : traitement d'image, stockage, upload, affichage. Aucun pixel ne bouge a l'etape 1.

---

## 2. Etat reel constate (verifie, pas suppose)

Verifications faites sur le code et sur la base de production Neon, en lecture seule.

| Constat | Valeur |
|---|---|
| Vehicules `fleetType = SHOWROOM` en base | **28**, et non 27 |
| VIN du plan de prise de vue retrouves en base | **27 / 27**, aucun manquant |
| Vehicule en base hors plan | 1 : `CHANGAN CS75`, **sans VIN**, `status = VENDU`, `publishedOnSite = true`, cree le 13/10/2026 |
| Vehicules sans `versionId` | 6, dont le vehicule ci-dessus, soit **5 reels** |
| `VehicleVersion` existantes | 8 |
| `photosVerified = true` | 0 vehicule |
| `mainPhotoUrl` renseigne | 1 vehicule sur 28 |
| Teintes exterieures distinctes | Blanc 8, Blanche 1, Noir 9, Gris 4, Gris creme 3, Gris cendre 1, Bleu 1, vide 1 |
| Interieurs distincts | Noir 15, Terracotta 4, Rouge bordeaux 3, Blanc 2, vide 4 |
| Dossiers de configuration deja crees | 22, de `CFG-01` a `CFG-22` |

Points structurants decouverts dans le code existant :

- **Il n'y a aucun dossier `prisma/migrations/`.** Le projet fonctionne en `prisma db push` (`npm run db:push`, `npm run db:reset`). La notion de migration non destructive du brief doit donc etre tranchee : decision D1.
- **Il n'y a aucun lanceur de tests** : ni vitest, ni jest, ni playwright, et aucun script `test` dans `apps/web/package.json`. Les tests exiges par le brief supposent de l'installer : decision D2.
- **Le schema n'utilise aucun `enum` Prisma** sur 1473 lignes : la convention du projet est `String` plus commentaire `///`, par exemple `/// SUV | PICKUP | BERLINE | VAN`. Le brief demande des jeux de valeurs fermes : decision D5.
- `src/lib/vehicle-colors.ts` contient deja la palette et la normalisation, accents retires et minuscules. **Elle couvre 100 % des teintes et des interieurs reellement presents en base.** `exteriorHex` et `interiorHex` doivent en deriver, pas la dupliquer.
- `src/lib/stock-import.ts` expose deja `versionKeyFor(row)` : `MARQUE|MODELE|FINITION|ANNEE|ENERGIE` en majuscules, et renvoie `null` si la finition, l'annee ou l'energie manque. C'est exactement la cause des 5 vehicules sans version.
- `exteriorColorBase` est deja normalise en base : Gris creme et Gris cendre sont tous deux de base Gris. `exteriorColorShade` porte la teinte affichable. Le mappage vers le brief est donc direct : `exteriorColorBase` vers `exteriorColorBase`, `exteriorColorShade` normalise vers `exteriorColorLabel`.

### Ecarts de donnees entre le classeur et la base

Ils interdisent tout rapprochement par texte et imposent un rapprochement **par VIN** :

| Config | Finition au classeur | Finition en base |
|---|---|---|
| CFG-04, CFG-12 a CFG-17 | Yueshang 4WD | `YUESHANG` |
| CFG-08 | Excellence Pro | `BASIC EXCELLENCE PRO` |
| CFG-18 | High-Energy Pro | `BASIC HIGH-ENERGY PRO` |
| CFG-09 | Explorer 4WD | `EXPLORER` |
| CFG-19, CFG-20 | Global Edition 2WD | `GLOBAL EDITION` |

Autres incoherences a arbitrer :

- Le modele du CFG-22 est `DASHENG` en base, `Dashing` au classeur et dans le nom du dossier photo.
- La casse de `Vehicle.brand` est instable : `CHANGAN` pour certains, `Changan` pour d'autres. Les cles de version provisoires devront etre normalisees en majuscules.
- Un vehicule porte la teinte `Blanche` la ou les huit autres portent `Blanc` : VIN `LS4ASE2E0TD018744`, CFG-11.

---

## 3. Decisions a trancher avant de coder

### D1 - Migration Prisma ou `db push` ?

Le brief demande une migration non destructive, mais le projet n'a pas d'historique de migrations et la base de production est sur Neon.

- **Recommandation** : initialiser l'historique maintenant, avec `prisma migrate diff` pour fabriquer la migration de reference puis `migrate resolve --applied` sur la base existante, et livrer l'etape 1 comme premiere vraie migration. Le changement est purement additif : 3 tables, 1 colonne nullable, 3 relations inverses. Aucune colonne existante n'est modifiee ni supprimee.
- Alternative si tu preferes ne rien changer au flux actuel : rester en `db push`. C'est sans risque ici parce que l'ajout est additif, mais la prochaine modification destructive n'aura aucun filet.

### D2 - Lanceur de tests

Les tests de l'etape 1 portent uniquement sur des fonctions pures.

- **Recommandation** : `vitest` en devDependency, scripts `test` et `test:run`, fichiers `*.test.ts` a cote du code. Leger, pas de configuration babel, TypeScript sans etape de build. Playwright attendra l'etape 3, quand il y aura une interface a parcourir.

### D3 - Les 5 vehicules sans version

`VehicleConfiguration.versionId` doit pointer sur une version. Le brief, section 2, prevoit qu'un vehicule a finition non confirmee reste rattache a une version a confirmer.

- **Recommandation** : creer 4 versions de rattachement provisoire (BYD Song L, Changan Uni-K, Changan Uni-Z, Lynk & Co 900), cle `MARQUE|MODELE|A CONFIRMER`, `trim` et `year` vides, avec un marqueur explicite pour que la vitrine puisse les exclure. `VehicleVersion` passerait de 8 a 12. Quand la finition sera relevee sur la carte grise, le vehicule migre vers la vraie version et la configuration est re-clee **en conservant son code `CFG-XX`**, puisque le dossier photo porte deja ce code.
- Alternative : rendre `versionId` nullable. Plus simple a ecrire, mais la contrainte d'unicite ne protege plus rien, car en PostgreSQL deux valeurs nulles sont considerees distinctes, et la vitrine devrait gerer partout le cas sans version.

### D4 - Unicite reelle de `VehicleMedia`

Le brief propose `@@unique([configurationId, kind, slot, frameIndex])`. **Tel quel, cet index ne protege rien** : pour un panorama interieur, `slot` et `frameIndex` sont nuls, et PostgreSQL traite deux valeurs nulles comme distinctes. On pourrait donc inserer dix panoramas pour la meme configuration.

- **Recommandation** : des sentinelles non nulles, `slot String @default("NA")` et `frameIndex Int @default(-1)`, pour que l'unicite s'applique vraiment. La validation Zod garantit en entree que `slot` vaut `C01` a `C10` seulement pour `CANVAS`, et que `frameIndex` est dans 0 a 35 seulement pour `SPIN_EXTERIOR`.

### D5 - Jeux de valeurs fermes : `enum` Prisma ou `String` ?

Le schema actuel n'utilise que des `String` documentes. Les quatre jeux ici (`mediaStatus`, `kind`, `source`, `target`) sont fermes, techniques, et jamais saisis par un humain.

- **Recommandation** : `enum` Prisma pour ces quatre jeux. C'est la garantie qu'aucun script d'import n'ecrira `PUBLIE` avec une espace de trop ou `canvas` en minuscules, et le type remonte jusqu'au composant React. Ce serait le premier `enum` du schema : si tu preferes la coherence stricte avec l'existant, on prend `String` plus commentaire `///` plus Zod, au prix d'une integrite seulement applicative.

### D6 - Le vehicule fantome et les regles d'eligibilite

Le `CHANGAN CS75` sans VIN, vendu, est publie sur le site.

- **Recommandation** : ne construire des configurations que depuis les vehicules `fleetType = SHOWROOM` **avec un VIN** et dont le statut n'est ni `VENDU` ni `RETIRE`. Ce vehicule reste donc sans configuration. Il faudrait par ailleurs le depublier ou le supprimer, mais c'est une correction de donnees, pas du code : dis-moi ce que tu veux en faire.

---

## 4. Schema de donnees propose

Ajouts a `apps/web/prisma/schema.prisma`, dans l'hypothese ou D3, D4 et D5 sont retenues.

```prisma
enum ConfigurationMediaStatus {
  A_PHOTOGRAPHIER
  EN_VALIDATION
  PUBLIE
}

enum VehicleMediaKind {
  CANVAS
  SPIN_EXTERIOR
  INTERIOR_PANORAMA
  DETAIL
}

enum VehicleMediaSource {
  SHOWROOM
  CONSTRUCTEUR
}

enum VehicleHotspotTarget {
  EXTERIOR_FRAME
  INTERIOR_PANORAMA
  CANVAS
}

/// Configuration commercialisable : une version + une teinte exterieure + une teinte interieure.
model VehicleConfiguration {
  id                 String   @id @default(cuid())
  /// Code du plan de prise de vue, ex. CFG-12. Stable a vie : les dossiers photo en dependent.
  code               String   @unique
  versionId          String
  version            VehicleVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)
  /// Couleur de base, utilisee par les filtres de la vitrine.
  exteriorColorBase  String
  /// Teinte exacte affichee, ex. Gris creme.
  exteriorColorLabel String
  exteriorHex        String
  /// "A completer" tant que l'interieur n'a pas ete releve sur le vehicule.
  interiorColorLabel String
  interiorHex        String
  /// Configuration montree en premier pour cette version.
  isDefault          Boolean  @default(false)
  mediaStatus        ConfigurationMediaStatus @default(A_PHOTOGRAPHIER)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  vehicles           Vehicle[]
  media              VehicleMedia[]
  hotspots           VehicleHotspot[]

  @@unique([versionId, exteriorColorBase, exteriorColorLabel, interiorColorLabel])
  @@index([versionId, mediaStatus])
}

model VehicleMedia {
  id              String   @id @default(cuid())
  configurationId String
  configuration   VehicleConfiguration @relation(fields: [configurationId], references: [id], onDelete: Cascade)
  kind            VehicleMediaKind
  /// C01 a C10 pour CANVAS, "NA" sinon. Sentinelle non nulle : sans elle l'unicite ne protege rien.
  slot            String   @default("NA")
  /// 0 a 35 pour SPIN_EXTERIOR, -1 sinon.
  frameIndex      Int      @default(-1)
  url             String
  urlMobile       String?
  width           Int
  height          Int
  blurDataUrl     String?
  source          VehicleMediaSource @default(SHOWROOM)
  verifiedById    String?
  verifiedBy      User?    @relation(fields: [verifiedById], references: [id], onDelete: SetNull)
  verifiedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  hotspots        VehicleHotspot[]

  @@unique([configurationId, kind, slot, frameIndex])
  @@index([configurationId, kind])
}

model VehicleHotspot {
  id              String   @id @default(cuid())
  configurationId String
  configuration   VehicleConfiguration @relation(fields: [configurationId], references: [id], onDelete: Cascade)
  target          VehicleHotspotTarget
  /// Vue 360 concernee, 0 a 35.
  frameIndex      Int?
  /// Panorama interieur, en degres.
  yaw             Float?
  pitch           Float?
  /// Photo du canevas, en pourcentage de la largeur et de la hauteur.
  x               Float?
  y               Float?
  title           String
  text            String
  detailMediaId   String?
  detailMedia     VehicleMedia? @relation(fields: [detailMediaId], references: [id], onDelete: SetNull)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([configurationId, target])
}
```

Modifications des modeles existants, toutes additives :

- `Vehicle` : `configurationId String?`, relation `configuration VehicleConfiguration?` en `onDelete: SetNull`, et `@@index([configurationId])`. Les champs `mainPhotoUrl`, `interiorPhotoUrl`, `exteriorPhotoUrl` et `rearPhotoUrl` restent intacts pendant toute la transition.
- `VehicleVersion` : relation inverse `configurations VehicleConfiguration[]`.
- `User` : relation inverse `verifiedMedia VehicleMedia[]`.

Deux contraintes que Prisma 5.22 ne sait pas exprimer et qu'il faudra tenir dans le code, avec un test chacune :

1. Une seule configuration `isDefault = true` par version : il faudrait un index unique partiel.
2. La coherence entre `kind`, `slot` et `frameIndex` : il faudrait une contrainte CHECK.

---

## 5. `resolveConfigurationKey` et la normalisation des couleurs

Nouveau fichier `apps/web/src/lib/vehicle-configuration.ts`, fonctions pures, sans acces base.

```text
normalizeExteriorLabel(shade, base) -> libelle affichable
  "Blanche"     -> "Blanc"
  "Gris creme"  -> "Gris creme"  (teinte distincte de Gris, conservee telle quelle)
  vide          -> la couleur de base, et a defaut "A confirmer"

normalizeInteriorLabel(interiorColor) -> libelle affichable
  vide ou "A completer"  -> "A completer"  (sentinelle non nulle, requise par l'unicite)
  "Terracotta (rouge)"   -> "Terracotta"

resolveConfigurationKey(vehicle) -> { versionKey, exteriorColorBase, exteriorColorLabel, interiorColorLabel }
  reutilise la forme de cle de stock-import.ts : majuscules, separateur "|"
  renvoie null si le vehicule n'est pas eligible : pas de VIN, VENDU, RETIRE, ou fleetType different de SHOWROOM
```

`exteriorHex` et `interiorHex` sont obtenus par `vehicleColorHex()` de `src/lib/vehicle-colors.ts`, deja en place. Aucune couleur n'est redefinie ici. Les 8 teintes et 4 interieurs reellement presents en base y sont tous couverts ; seule la sentinelle `A completer` tombe sur la couleur neutre de repli.

Choix de la configuration par defaut, deterministe pour que deux executions donnent le meme resultat : le plus grand nombre de vehicules en stock, puis la teinte dont le libelle est le plus frequent sur la version, puis le code `CFG-XX` le plus petit.

---

## 6. Rattachement des 27 vehicules

Script a execution unique `apps/web/scripts/assign-vehicle-configurations.ts`, idempotent.

1. Il lit une table `VIN -> code CFG` figee dans le depot, `apps/web/src/lib/data/showroom-configurations.ts`, extraite du classeur. C'est de la donnee texte, pas une image : elle a sa place dans le depot, contrairement aux photos.
2. Pourquoi par VIN et pas par texte : les finitions du classeur et de la base divergent sur 10 vehicules sur 27, voir la section 2. Le VIN est le seul identifiant fiable, et il est unique en base.
3. Il cree les 4 versions de rattachement provisoire, si D3 est validee.
4. Il cree les 22 configurations avec leur code, leurs libelles normalises, leurs hex, `mediaStatus = A_PHOTOGRAPHIER`, et positionne `isDefault` par version.
5. Il ecrit `Vehicle.configurationId` pour les 27 vehicules.
6. Il refuse de s'executer, sans rien ecrire, si un VIN du classeur manque en base ou si un vehicule eligible ne tombe dans aucune configuration. Pas de rattachement partiel silencieux.
7. Il affiche un rapport : configurations creees, vehicules rattaches, vehicules ignores et pourquoi.

Apres cette execution, les codes ne sont plus jamais attribues a la main : la creation d'un vehicule, le changement de version et le changement de couleur passent par un service `ensureVehicleConfiguration(vehicle)` qui retrouve ou cree la configuration et alloue le prochain code libre, `CFG-23` puis `CFG-24`, dans une transaction, pour eviter deux configurations avec le meme code en cas de saisie simultanee.

### Les 22 configurations attendues

| Code | Version | Teinte ext. | Interieur | Vehicules |
|---|---|---|---|---|
| CFG-01 | BYD Song L, a confirmer | Gris | Blanc | 1 |
| CFG-02 | Changan CS75 Plus Smart Champion Edition 2026 | Blanc | Terracotta | 1 |
| CFG-03 | Changan CS75 Plus Smart Champion Edition 2026 | Gris | Terracotta | 1 |
| CFG-04 | Changan Uni-K Yueshang 2024 | Bleu | Noir | 1 |
| CFG-05 | Changan Uni-K, a confirmer | Noir | Noir | 1 |
| CFG-06 | Changan Uni-Z, a confirmer | Blanc | Noir | 1 |
| CFG-07 | Changan Uni-Z, a confirmer | Gris | Noir | 1 |
| CFG-08 | Changan X5 Plus Basic Excellence Pro 2026 | Blanc | Noir | 1 |
| CFG-09 | Jetour Mountain & Sea T1 Explorer 2025 | Noir | Noir | 1 |
| CFG-10 | Lynk & Co 900, a confirmer | Noir | Blanc | 1 |
| CFG-11 | Changan CS75 Plus Smart Champion Edition 2026 | Blanc | A completer | 1 |
| CFG-12 | Changan Uni-K Yueshang 2024 | Blanc | Noir | 2 |
| CFG-13 | Changan Uni-K Yueshang 2024 | Blanc | Terracotta | 1 |
| CFG-14 | Changan Uni-K Yueshang 2024 | Gris | Noir | 1 |
| CFG-15 | Changan Uni-K Yueshang 2024 | Gris cendre | A completer | 1 |
| CFG-16 | Changan Uni-K Yueshang 2024 | Gris creme | Noir | 2 |
| CFG-17 | Changan Uni-K Yueshang 2024 | Gris creme | Terracotta | 1 |
| CFG-18 | Changan X5 Plus Basic High-Energy Pro 2026 | Blanc | Noir | 1 |
| CFG-19 | Exeed Yaoguang C-DM Global Edition 2026 | Blanc | Noir | 1 |
| CFG-20 | Exeed Yaoguang C-DM Global Edition 2026 | Noir | A completer | 1 |
| CFG-21 | Exeed Yaoguang Global Edition 2026 | Noir | Rouge bordeaux | 3 |
| CFG-22 | Jetour Dashing Youth Edition Luxury 2026 | Noir | Noir | 2 |

Total : 22 configurations, 27 vehicules. Le CFG-11 porte la teinte `Blanche` en base et sera normalise en `Blanc`, ce qui le fait tomber sur la meme teinte que le CFG-02 mais avec un interieur different : les deux configurations restent distinctes, conformement a la regle d'or.

Deux pieges que ce tableau rend visibles :

- **CFG-08 et CFG-18** sont tous deux "X5 Plus Blanc interieur Noir" : ils ne se distinguent que par la finition. Le nom du dossier photo est donc ambigu, et seul le code `CFG-XX` du nom de fichier permet de rattacher les images. A rappeler le jour de la seance photo.
- **CFG-14, CFG-15, CFG-16 et CFG-17** sont quatre Uni-K gris de teintes voisines. Si la seance conclut que Gris cendre et Gris sont la meme peinture, il faudra fusionner deux configurations. C'est une procedure humaine, deplacer les vehicules, conserver un code, marquer l'autre comme abandonne : je ne l'implemente pas a l'etape 1.

---

## 7. Fichiers touches a l'etape 1

Nouveaux :

- `apps/web/src/lib/vehicle-configuration.ts` : fonctions pures de cle et de normalisation.
- `apps/web/src/lib/vehicle-configuration.test.ts` : tests unitaires.
- `apps/web/src/lib/data/showroom-configurations.ts` : table VIN vers code CFG, extraite du classeur.
- `apps/web/src/server/vehicle-configuration-service.ts` : `ensureVehicleConfiguration`, allocation de code, calcul de `isDefault`.
- `apps/web/scripts/assign-vehicle-configurations.ts` : rattachement initial, idempotent.
- `apps/web/vitest.config.ts` : si D2 est validee.

Modifies :

- `apps/web/prisma/schema.prisma` : 3 modeles, 4 enums, 1 colonne, 3 relations inverses.
- `apps/web/package.json` : devDependency vitest et scripts de test.
- `apps/web/prisma/seed.ts` : creation des configurations, pour que `npm run db:reset` donne une base coherente.
- `apps/web/src/app/vehicles/actions.ts` et `apps/web/src/app/vehicles/import/actions.ts` : appel a `ensureVehicleConfiguration` apres toute creation ou modification de version ou de couleur, comme le demande la section 3 du brief.
- `docs/INTEGRATION_STOCK.md` et `docs/STOCK_COULEURS.md` : renvoi vers la notion de configuration.

Aucun composant de la vitrine ni de la pop-up n'est touche a l'etape 1.

A noter avant de commencer : `apps/web/src/app/(site)/vehicules/page.tsx` et `apps/web/src/components/site/VehicleDetailModal.tsx` ont des modifications non commitees dans le depot. Il faut les committer ou les mettre de cote, pour que le diff de l'etape 1 reste lisible.

---

## 8. Tests de l'etape 1

Unitaires, sur fonctions pures :

- normalisation des teintes : `Blanche` donne `Blanc`, `Gris creme` reste distinct de `Gris`, un interieur vide donne `A completer`.
- `resolveConfigurationKey` : cle identique pour deux vehicules de meme configuration, cle differente des que la finition, la teinte ou l'interieur change, et `null` pour un vehicule sans VIN ou vendu.
- regroupement : les 27 vehicules de reference donnent exactement 22 groupes, et les comptes par configuration sont ceux du tableau de la section 6.
- configuration par defaut : la plus fournie gagne, et l'egalite est tranchee de facon stable.
- une seule configuration par defaut par version.
- coherence `kind` / `slot` / `frameIndex` : un `CANVAS` sans slot et un `SPIN_EXTERIOR` avec `frameIndex = 36` sont refuses par la validation Zod.

Verifications a la fin de l'etape, dans cet ordre :

```
cd apps/web
npm run check:no-em-dash
npx tsc --noEmit
npm run test:run
npm run build
```

---

## 9. Decoupage general et choix de la bibliotheque de panorama

Le decoupage reste celui de la section 10 du brief : 1. Donnees, le present document, 2. Ecran Medias, 3. Vitrine et pop-up, 4. Interieur et points cles, 5. Finitions.

Trois dependances seront necessaires plus tard, aucune a l'etape 1 : `sharp` pour le traitement des images a l'etape 2, un stockage de blobs a l'etape 2 (a verifier d'abord : `@vercel/blob` n'est pas installe et aucun stockage ne semble configure dans le projet), et une bibliotheque de panorama a l'etape 4.

Pour le panorama, ma recommandation est **Pannellum** :

- Licence MIT, autonome, sans dependance a three.js, points cliquables et zoom integres. C'est le critere decisif face a la contrainte du brief, une rotation fluide sur un Android d'entree de gamme en 4G : la bibliotheque n'est chargee qu'a l'ouverture du mode Interieur, et elle pese une fraction de ce que coute une pile three.js.
- L'alternative, **Photo Sphere Viewer v5**, est mieux maintenue et son greffon de marqueurs est plus riche, mais elle impose three.js. A retenir seulement si on a besoin de fonctions avancees que Pannellum ne couvre pas.
- A verifier avant d'ecrire la premiere ligne de l'etape 4 : poids reel compresse, derniere version publiee et etat de maintenance des deux projets. Je n'ai pas interroge les registres dans cette session, donc je ne donne pas de chiffres que je n'ai pas vus.

---

## 10. Ce qu'il me faut de toi pour demarrer

1. D1 : historique de migrations Prisma, ou on reste en `db push` ?
2. D2 : j'installe vitest ?
3. D3 : versions de rattachement provisoire pour les 5 vehicules sans finition, ou `versionId` nullable ?
4. D4 et D5 : sentinelles non nulles sur `VehicleMedia`, et enums Prisma, oui ou non ?
5. D6 : que fait-on du `CHANGAN CS75` vendu, sans VIN et publie sur le site ?
6. Donnees : le CFG-22 est `DASHENG` en base et `Dashing` au classeur. Quel nom retient-on pour la vitrine ?

Rien n'est code avant ces reponses, comme le demande la section 10.1 du brief.

---

## Annexe - Table VIN vers configuration, reference du script de rattachement

| VIN | Code |
|---|---|
| LGXCE4CB0S0880867 | CFG-01 |
| LS4ASE2E7TD029479 | CFG-02 |
| LS4ASE2E5TD029562 | CFG-03 |
| LS4ASE2A2SA704149 | CFG-04 |
| LS4ASE2A2SA997972 | CFG-05 |
| LS4ASE2E2TB333735 | CFG-06 |
| LS4ASE2E2TB326509 | CFG-07 |
| LS4ASE2EXTB426308 | CFG-08 |
| LNNBDDEY3SDN14204 | CFG-09 |
| L6T79END0TT004275 | CFG-10 |
| LS4ASE2E0TD018744 | CFG-11 |
| LS4ASE2A8SA704219 | CFG-12 |
| LS4ASE2A9SA704150 | CFG-12 |
| LS4ASE2A7SA704454 | CFG-13 |
| LS4ASE2A0SA704053 | CFG-14 |
| LS4ASE2A0SA704036 | CFG-15 |
| LS4ASE2A1SA704031 | CFG-16 |
| LS4ASE2A8SA704172 | CFG-16 |
| LS4ASE2A2SA704359 | CFG-17 |
| LS4ASE2E6TB426631 | CFG-18 |
| LNNBBDEEXSG082415 | CFG-19 |
| LNNBBDEE1SG086255 | CFG-20 |
| LVTDB24B4SG121299 | CFG-21 |
| LVTDB24B0SG121316 | CFG-21 |
| LVTDB24B1SG121308 | CFG-21 |
| LVTDB21B8SDA16337 | CFG-22 |
| LVTDB21B8SDA11347 | CFG-22 |
