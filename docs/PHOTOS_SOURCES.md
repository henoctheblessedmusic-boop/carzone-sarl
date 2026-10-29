# Photos officielles des fiches techniques

Objectif : remplacer les visuels générés par IA par des photos constructeurs vérifiées,
5 angles par modèle (1 face avant 3/4, 2 profil, 3 cockpit, 4 sellerie/places arrière,
5 face arrière), sans plaque d'immatriculation de pays, sans image IA.

Fichiers installés dans `apps/web/public/images/vehicles/{slug}-{angle}.jpg`
(`main` = avant 3/4, `exterior` = profil, `interior` = cockpit, `seats` = sellerie,
`rear` = arrière). Les URLs de la base Neon pointent déjà vers ces chemins.

## Modèles intégrés (officiel constructeur)

| Modèle | Slug | Sources | Notes |
|---|---|---|---|
| Toyota Land Cruiser Prado TX-L | `prado` | global.toyota (galerie presse/album officiel) | Sellerie : dossiers rabattus (photo officielle) |
| Changan UNI-K 2026 | `unik` | changan.mx (showroom, silhouette, cockpit) ; changan.ae (places arrière, arrière) | Profil en rendu studio officiel, places arrière/arrière en vignettes officielles |
| Changan CS75 2026 | `cs75` | changan.ae (visuel presse, profil, sellerie, arrière) ; changan.mx (cockpit) | Face avant : visuel studio presse officiel |
| Changan CS35 PLUS | `cs35` | changan.mx (avant 3/4, arrière 3/4) ; changan.ae (profil, cockpit, sellerie) | — |
| Jetour T2 i-DM 2026 | `t2` | jetourksa.com (visuel avant 45, séquence 360°, intérieurs) | Sellerie : siège avant en gros plan (pas de banquette arrière publiée) |
| Jetour Dashing | `dashing` | jetourksa.com (cam015/cam010 studio, séquence 360°, intérieur) | Sellerie : vue intérieure passagers (pas de banquette arrière publiée) |
| BAIC X55e REHEV | `x55` | baic.com.ar (kit presse X55 II RE-HEV), baic.es, baicglobal.com/models/26 | Visuels badgés X55 II Hybrid (plaque modèle) |
| BAIC B40 PRO | `b40` | baic.com.ar (kit presse BJ40 PRO), baicglobal.com/models/36 | Sellerie : banquette rabattue (photo officielle) |

## Modèles encore à remplacer

| Modèle | Slug | Piste officielle | Statut |
|---|---|---|---|
| Geely Starship 7 2026 | `starship7` | galaxy-geely.com (page modèle 星舰7) | Angles à confirmer, le site mélange plusieurs modèles |
| Forthing T5 EVO 2026 | `t5evo` | forthingmotor.com/t5-evo/ | CDN officiel, angles profil/arrière/intérieur à récupérer |
| Forthing Rich 7 4x4 | `rich7` | forthingmotor.com/pickup-rich/ | Galerie à compléter |

## Règles de sélection appliquées

- Priorité aux photos/visuels presse officiels du constructeur ou de sa filiale régionale.
- Aucune plaque d'immatriculation de pays réelle : les plaques « modèle » ou les
  immatriculations de studio sont acceptées, les plaques civiles non.
- Aucune image générée par IA.
- Compromis documentés quand un angle n'est pas publié (sellerie sans banquette arrière).
- Recadrage/normalisation locale en JPEG qualité 86, largeur maximale 1600 px.
