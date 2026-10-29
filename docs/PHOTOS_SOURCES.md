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
| Geely Starship 7 2026 | `starship7` | galaxy-geely.com/p145 (星舰7 EM-i, galerie officielle) | Sellerie : vue zénithale (banquette visible) |
| Forthing T5 EVO 2026 | `t5evo` | forthingmotor.com + forthing.si (galerie distributeur officiel) | Millésime officiel MY2025/2025 |
| Forthing Rich 7 4x4 | `rich7` | zznissan.com (Rich 7 锐骐7, studio + 360) | Profil issu d'une frame 360 officielle |

## Modèles remplacés

Tous les modèles des fiches techniques (11/11) disposent désormais de 5 photos officielles.
