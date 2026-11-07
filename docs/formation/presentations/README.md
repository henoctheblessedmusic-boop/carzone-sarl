# Présentations de formation

Les 9 modules et les 20 decks de rôle sont générés en PowerPoint 16:9 avec la charte CARZONE. Chaque deck contient trois slides communes sur la cloche de notifications, les autorisations navigateur, le micro et les appels.

## Modules communs et familles de métiers

- `00-accueil-formation-commune.pptx`
- `01-direction-gouvernance.pptx`
- `02-commerce-adv-accueil.pptx`
- `03-comptabilite.pptx`
- `04-stock-showroom-import.pptx`
- `05-atelier-stock-garage.pptx`
- `06-location-vehicules.pptx`
- `07-rh-administration.pptx`
- `08-bornes-installateurs.pptx`

## Decks individuels par rôle

Le dossier `roles/` contient 20 présentations courtes, une par rôle :
`admin`, `adv`, `assistante-comptable`, `atelier`, `bornes-ops`, `chef-atelier`, `commercial`,
`compta-garage`, `compta`, `dc`, `dg`, `gestionnaire-location`, `hotesse`, `installateur`,
`pdg`, `rf`, `rh`, `rta`, `stock`, `stock-garage`.

## Génération

Le script `../generate_pptx.py` reconstruit tous les fichiers à partir des contenus
`*.contenu.md` et des captures. Il utilise python-pptx et ajoute une transition douce à chaque
slide.

## Charte

- 16:9, fond charbon, rouge CARZONE, or et blanc.
- Logo CARZONE sur la couverture.
- Captures réelles, sans maquette.
- Numérotation des slides.
- Aucun tiret cadratin U+2014.

## Animations

Après génération, exécuter `../apply_animations.ps1` avec PowerShell pour ajouter les animations
d'entrée. Pour les voir, lancer PowerPoint en mode Diaporama (F5), car le mode édition ne les
affiche pas.
