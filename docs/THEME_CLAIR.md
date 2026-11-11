# Refonte du thème clair

Date : 2026-11-11

## Objectif

Rendre le thème clair lisible, cohérent et accessible sur l'ensemble de l'Espace Pro, sans dégrader le thème sombre.

## Architecture

L'ancien `globals.css` monolithique est remplacé par cinq feuilles ordonnées :

```text
src/app/styles/tokens.css
src/app/styles/base.css
src/app/styles/components.css
src/app/styles/shell.css
src/app/styles/chat.css
```

`tokens.css` est la seule source de vérité pour les couleurs.

## Jetons sémantiques

Chaque famille chromatique expose quatre rôles :

- `--x` : aplat graphique ;
- `--x-fg` : texte de la couleur sur une surface neutre ;
- `--x-soft` : fond doux pour pastilles et encarts ;
- `--x-solid` : aplat saturé pour texte blanc.

Familles disponibles : surface, texte, bordures, marque, accent, succès, alerte, danger, information, violet, or et séries de graphiques.

## Contrôle automatique

Ajout de :

```powershell
npm run check:contrast
```

Le script vérifie 60 paires texte/fond dans les thèmes clair et sombre. Résultat attendu : 0 échec et 0 jeton non résolu.

## Corrections spécifiques

- Cartes des cinq étapes du stock : fonds doux au lieu d'aplats saturés.
- Tableau de bord : KPI et pipeline logistique alignés sur les jetons.
- Onboarding : textes lisibles, fonds de survol corrigés, bouton principal avec texte sur accent.
- Cartes de zones du stock : surfaces et bordures neutres.
- Badges d'état : fond doux et texte de couleur, plus aucun texte de la même couleur que son fond.

## Vérifications

- `npm run check:contrast` : 0 échec ;
- `npx tsc --noEmit` : OK ;
- `npm run test:run` : 80 tests verts ;
- `npm run build` : OK ;
- captures de contrôle : stock, factures, tableau de bord en clair et en sombre.

## Limites

- Les documents imprimés et la présentation conservent volontairement leurs couleurs de marque fixes.
- La vitrine publique a ses propres styles et n'est pas concernée par le thème clair de l'Espace Pro.
- Les fichiers de vitrine en cours de travail n'ont pas été modifiés par cette passe.
