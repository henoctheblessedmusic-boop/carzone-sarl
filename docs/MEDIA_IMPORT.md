# Import des médias showroom

Date : 2026-11-11

## Principe

Les photos showroom ne sont pas encore présentes. Le dossier contient les 22 dossiers `CFG-01` à `CFG-22`, mais aucun fichier image pour l'instant.

Le plan d'import est prêt sans inventer de photo et sans copier les images dans Git.

## Commande

Depuis `apps/web` :

```powershell
npm run media:plan
```

Avec un autre dossier :

```powershell
npm run media:plan -- --root "D:\Photos showroom" --json
```

## Conventions reconnues

```text
CFG-01/
  CFG-01_C01.jpg ... CFG-01_C10.jpg    Canevas, vues C01 à C10
  360/001.jpg ... 360/036.jpg           Vue 360, 36 images
  Intérieur 360/panorama.jpg            Panorama intérieur
  Intérieur 360/detail-*.jpg            Photos de détail
```

Les fichiers inconnus sont listés en avertissement et ne sont jamais importés silencieusement.

## Résultat actuel

```text
Configurations : 22
Fichiers reconnus : 0
Canevas : 0
Vues 360 : 0
Panoramas intérieurs : 0
Détails : 0
```

## Prochaine étape

1. déposer les photos dans les dossiers `CFG-XX` ;
2. lancer `npm run media:plan -- --json` et relire le manifeste ;
3. brancher l'upload vers le stockage média ;
4. valider les images par configuration ;
5. publier seulement les configurations dont le canevas est complet ;
6. activer la vue 360 et le panorama intérieur sur les médias validés.

## Règles

- Une photo n'est jamais associée à une autre configuration.
- Une configuration sans média validé n'est pas publiée.
- Aucune image n'est copiée dans le dépôt Git.
- Un fichier mal nommé est signalé, pas deviné.
